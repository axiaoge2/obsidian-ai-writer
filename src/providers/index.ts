import type { AIProvider, AIWriterSettings } from "../types";
import { getPreset } from "./presets";
import { OpenAICompatibleProvider } from "./openaiCompatible";

export function getActiveProviderConfig(settings: AIWriterSettings): {
  apiBase: string;
  apiKey: string;
  model: string;
} {
  const preset = getPreset(settings.providerId);
  const fallbackApiBase = preset?.apiBase ?? "";
  const fallbackModel = preset?.defaultModel ?? "";

  const cfg = settings.providers?.[settings.providerId];
  return {
    apiBase: cfg?.apiBase ?? fallbackApiBase,
    apiKey: cfg?.apiKey ?? "",
    model: cfg?.model ?? fallbackModel
  };
}

export function createProvider(settings: AIWriterSettings): AIProvider {
  const preset = getPreset(settings.providerId);
  const providerName = preset?.name ?? settings.providerId;

  const { apiBase, apiKey, model } = getActiveProviderConfig(settings);
  const models = preset?.models?.length ? preset.models : model ? [model] : [];

  return new OpenAICompatibleProvider({
    id: settings.providerId,
    name: providerName,
    apiBase,
    apiKey,
    defaultModel: model,
    models
  });
}
