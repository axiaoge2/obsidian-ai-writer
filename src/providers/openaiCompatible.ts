import { requestUrl } from "obsidian";
import type {
  AIProvider,
  ChatMessage,
  CompletionOptions,
  CompletionResult,
  CompletionUsage
} from "../types";

type RequestUrlParamWithTimeout = Parameters<typeof requestUrl>[0] & {
  timeout?: number;
};

function normalizeApiBase(apiBase: string): string {
  return apiBase.replace(/\/+$/, "");
}

function looksLikeHtml(text: string): boolean {
  const trimmed = text.trimStart().slice(0, 50).toLowerCase();
  return (
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<head") ||
    trimmed.startsWith("<body")
  );
}

function compactSnippet(text: string, maxLen = 160): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function safeJsonParse(text: string, urlForError: string): any {
  const trimmed = text.trim();
  if (!trimmed) throw new Error(`接口返回空内容（URL: ${urlForError}）`);
  if (looksLikeHtml(trimmed)) {
    throw new Error(
      `接口返回了 HTML（不是 JSON）。通常是 API Base 填错/缺少 /v1，或被重定向到网页/网关。\n` +
        `URL: ${urlForError}\n` +
        `返回片段: ${compactSnippet(trimmed)}`
    );
  }

  try {
    return JSON.parse(trimmed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `接口返回的不是合法 JSON：${msg}\n` +
        `URL: ${urlForError}\n` +
        `返回片段: ${compactSnippet(trimmed)}`
    );
  }
}

function asUsage(data: any): CompletionUsage | undefined {
  const usage = data?.usage;
  if (!usage) return undefined;
  return {
    promptTokens: typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : undefined,
    completionTokens:
      typeof usage.completion_tokens === "number" ? usage.completion_tokens : undefined,
    totalTokens: typeof usage.total_tokens === "number" ? usage.total_tokens : undefined
  };
}

export class OpenAICompatibleProvider implements AIProvider {
  id: string;
  name: string;
  models: string[];

  private apiBase: string;
  private apiKey: string;
  private defaultModel: string;

  constructor(params: {
    id: string;
    name: string;
    apiBase: string;
    apiKey: string;
    defaultModel: string;
    models: string[];
  }) {
    this.id = params.id;
    this.name = params.name;
    this.models = params.models;

    this.apiBase = params.apiBase;
    this.apiKey = params.apiKey;
    this.defaultModel = params.defaultModel;
  }

  isConfigured(): boolean {
    // apiKey 对某些自建/网关服务可能不是必需；缺失时交由请求结果提示。
    return Boolean(this.apiBase) && Boolean(this.defaultModel);
  }

  async validateConfiguration(): Promise<void> {
    if (!this.apiBase) throw new Error("未配置 API Base");

    if (!/\/v1\/?$/.test(this.apiBase)) {
      // Not fatal for all providers, but strongly indicates a common misconfig.
      // We still continue to test the endpoint and return a precise error if it fails.
    }

    const url = `${normalizeApiBase(this.apiBase)}/models`;
    const headers: Record<string, string> = {};
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;

    const response = await requestUrl({
      url,
      method: "GET",
      headers,
      throw: false
    });

    if (response.status < 200 || response.status >= 300) {
      const snippet = response.text ? compactSnippet(response.text, 200) : "";
      if (response.status === 401 || response.status === 403) {
        throw new Error("连接被拒绝（可能需要 API Key，或 Key 无效）");
      }
      throw new Error(`连接失败 (HTTP ${response.status}) ${snippet}`.trim());
    }

    safeJsonParse(response.text ?? "", url);
  }

  async complete(messages: ChatMessage[], options?: CompletionOptions): Promise<CompletionResult> {
    const apiBase = normalizeApiBase(this.apiBase);
    const model = options?.model || this.defaultModel;

    const url = `${apiBase}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;

    const response = await requestUrl({
      url: `${apiBase}/chat/completions`,
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2_000
      }),
      timeout: options?.timeoutMs,
      throw: false
    } as RequestUrlParamWithTimeout);

    if (response.status < 200 || response.status >= 300) {
      const snippet = response.text ? compactSnippet(response.text, 300) : "";
      throw new Error(`AI 请求失败 (HTTP ${response.status}) ${snippet}`.trim());
    }

    const data = safeJsonParse(response.text ?? "", url);
    const apiErrorMessage =
      typeof data?.error?.message === "string" ? data.error.message : undefined;
    if (apiErrorMessage) {
      throw new Error(apiErrorMessage);
    }

    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string") {
      throw new Error("AI 响应格式不符合预期：缺少 choices[0].message.content");
    }

    return {
      text,
      usage: asUsage(data),
      raw: data
    };
  }
}
