export type AIWriterAction =
  | "rewrite"
  | "polish"
  | "continue"
  | "summarize"
  | "translate"
  | "explain";

export type UILanguage = "auto" | "zh" | "en";
export type ReplaceMode = "inline" | "confirm";

export interface AIWriterSettings {
  providerId: string;
  providers: Record<
    string,
    {
      apiBase: string;
      apiKey: string;
      model: string;
      modelMode?: "preset" | "custom";
    }
  >;

  uiLanguage: UILanguage;
  replaceMode: ReplaceMode;

  contextLines: number;
  requestTimeoutMs: number;
  temperature: number;
  maxTokens: number;
}

export interface ProviderPreset {
  id: string;
  name: string;
  apiBase: string;
  models: string[];
  defaultModel: string;
  isOpenAICompatible: boolean;
}

export type ChatMessageRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface CompletionUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface CompletionResult {
  text: string;
  usage?: CompletionUsage;
  raw?: unknown;
}

export interface AIProvider {
  id: string;
  name: string;
  models: string[];

  isConfigured(): boolean;
  validateConfiguration(): Promise<void>;
  complete(messages: ChatMessage[], options?: CompletionOptions): Promise<CompletionResult>;
}
