import type { ProviderPreset } from "../types";

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "aiwriter",
    name: "AI Writer（内置）",
    apiBase: "",
    models: [],
    defaultModel: "",
    isOpenAICompatible: true
  },
  {
    id: "openai",
    name: "OpenAI",
    apiBase: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
    isOpenAICompatible: true
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    apiBase: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-coder"],
    defaultModel: "deepseek-chat",
    isOpenAICompatible: true
  },
  {
    id: "groq",
    name: "Groq",
    apiBase: "https://api.groq.com/openai/v1",
    models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    defaultModel: "llama-3.1-70b-versatile",
    isOpenAICompatible: true
  },
  {
    id: "mistral",
    name: "Mistral",
    apiBase: "https://api.mistral.ai/v1",
    models: ["mistral-large-latest", "mistral-medium", "mistral-small"],
    defaultModel: "mistral-large-latest",
    isOpenAICompatible: true
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    apiBase: "https://openrouter.ai/api/v1",
    models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro"],
    defaultModel: "openai/gpt-4o",
    isOpenAICompatible: true
  },
  {
    id: "moonshot",
    name: "Moonshot",
    apiBase: "https://api.moonshot.cn/v1",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    defaultModel: "moonshot-v1-8k",
    isOpenAICompatible: true
  },
  {
    id: "zhipu",
    name: "智谱AI (GLM)",
    apiBase: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-4-flash", "glm-4", "glm-4-plus"],
    defaultModel: "glm-4-flash",
    isOpenAICompatible: true
  },
  {
    id: "ollama",
    name: "Ollama (本地)",
    apiBase: "http://localhost:11434/v1",
    models: ["llama3", "qwen2", "mistral", "codellama"],
    defaultModel: "llama3",
    isOpenAICompatible: true
  },
  {
    id: "custom",
    name: "自定义 (OpenAI 兼容)",
    apiBase: "",
    models: [],
    defaultModel: "",
    isOpenAICompatible: true
  }
];

export function getPreset(providerId: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === providerId);
}
