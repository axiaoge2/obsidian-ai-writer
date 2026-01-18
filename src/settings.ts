import type { AIWriterSettings } from "./types";

export const DEFAULT_SETTINGS: AIWriterSettings = {
  providerId: "openai",
  providers: {
    openai: {
      apiBase: "https://api.openai.com/v1",
      apiKey: "",
      model: "gpt-4o-mini",
      modelMode: "preset"
    }
  },

  uiLanguage: "auto",
  replaceMode: "inline",

  contextLines: 3,
  requestTimeoutMs: 45_000,
  temperature: 0.4,
  maxTokens: 2_000
};
