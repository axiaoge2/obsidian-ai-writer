import { Notice, Plugin, normalizePath } from "obsidian";
import type { Editor, MarkdownView } from "obsidian";
import { DEFAULT_SETTINGS } from "./settings";
import type { AIWriterAction, AIWriterSettings } from "./types";
import { createProvider, getActiveProviderConfig } from "./providers";
import { buildMessages } from "./utils/prompts";
import {
  getSelection,
  getSelectionContext,
  insertCalloutBelowSelection,
  replaceSelection
} from "./utils/editor";
import { StatusBarController } from "./ui/statusBar";
import { AIWriterSettingTab } from "./ui/settingsTab";
import { registerCommands } from "./commands";
import { registerEditorContextMenu } from "./ui/contextMenu";
import { ConfirmReplaceModal } from "./ui/confirmModal";
import { getPreset } from "./providers/presets";

type MvpDefaults = {
  providerId?: string;
  apiBase?: string;
  apiKey?: string;
  model?: string;
};

export default class AIWriterPlugin extends Plugin {
  settings: AIWriterSettings = { ...DEFAULT_SETTINGS };
  private statusBar?: StatusBarController;

  private async readMvpDefaults(): Promise<MvpDefaults | null> {
    try {
      const path = normalizePath(`${this.manifest.dir}/mvp.defaults.json`);
      const exists = await this.app.vault.adapter.exists(path);
      if (!exists) return null;
      const text = await this.app.vault.adapter.read(path);
      const data = JSON.parse(text) as MvpDefaults;
      return data ?? null;
    } catch {
      return null;
    }
  }

  async onload(): Promise<void> {
    const loaded = (await this.loadData()) as Partial<AIWriterSettings> | undefined;
    const merged = Object.assign({}, DEFAULT_SETTINGS, loaded ?? {});

    // Migration: older versions stored apiBase/apiKey/model at the top level.
    const legacy: any = loaded ?? {};
    if (!merged.providers) merged.providers = {};
    if (typeof legacy.apiBase === "string" || typeof legacy.apiKey === "string" || typeof legacy.model === "string") {
      const providerId = typeof legacy.providerId === "string" ? legacy.providerId : merged.providerId;
      const preset = getPreset(providerId);
      const legacyModel = typeof legacy.model === "string" ? legacy.model : getActiveProviderConfig(merged).model;
      merged.providers[providerId] = {
        apiBase: typeof legacy.apiBase === "string" ? legacy.apiBase : getActiveProviderConfig(merged).apiBase,
        apiKey: typeof legacy.apiKey === "string" ? legacy.apiKey : "",
        model: legacyModel,
        modelMode: preset?.models?.includes(legacyModel) ? "preset" : "custom"
      };
    }

    // MVP: allow bundling defaults in plugin folder for "no-config first run"体验。
    // - If user already has settings, we only seed the provider config (do not override user selection).
    // - If it's truly first run (no saved data), we also switch default provider to the bundled one.
    const defaults = await this.readMvpDefaults();
    if (defaults?.providerId && defaults.apiBase && defaults.model) {
      const providerId = defaults.providerId;
      if (!merged.providers) merged.providers = {};
      const existing = merged.providers[providerId];
      const existingApiBase = existing?.apiBase?.trim();
      const existingModel = existing?.model?.trim();

      // Seed if missing, or if an earlier run created an empty placeholder config.
      if (!existing || !existingApiBase || !existingModel) {
        const preset = getPreset(providerId);
        const nextModel = existingModel || defaults.model;
        merged.providers[providerId] = {
          apiBase: existingApiBase || defaults.apiBase,
          apiKey: existing?.apiKey ?? defaults.apiKey ?? "",
          model: nextModel,
          modelMode: preset?.models?.includes(nextModel) ? "preset" : "custom"
        };
      }
      if (!loaded) {
        merged.providerId = providerId;
      }
    }

    this.settings = merged;

    this.statusBar = new StatusBarController(this);
    this.addSettingTab(new AIWriterSettingTab(this.app, this));

    registerCommands(this);
    registerEditorContextMenu(this);
  }

  onunload(): void {}

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async runAction(action: AIWriterAction, editor: Editor, _view?: MarkdownView): Promise<void> {
    const selectedText = getSelection(editor);
    if (!selectedText.trim()) {
      new Notice("AI Writer：请先选中一段文本");
      return;
    }

    const provider = createProvider(this.settings);
    if (!provider.isConfigured()) {
      new Notice("AI Writer：请先在设置中配置 API Base 与模型（如需要再配置 API Key）");
      return;
    }

    const context =
      this.settings.contextLines > 0 ? getSelectionContext(editor, this.settings.contextLines) : undefined;

    const messages = buildMessages({
      action,
      selectedText,
      uiLanguage: this.settings.uiLanguage,
      context
    });

    this.statusBar?.setBusy(this.actionLabel(action));

    try {
      const active = getActiveProviderConfig(this.settings);
      const result = await provider.complete(messages, {
        model: active.model,
        temperature: this.settings.temperature,
        maxTokens: this.settings.maxTokens,
        timeoutMs: this.settings.requestTimeoutMs
      });

      const next = result.text.trim();
      if (!next) {
        new Notice("AI Writer：模型未返回内容");
        this.statusBar?.setIdle();
        return;
      }

      if (action === "explain") {
        // “解释”默认不覆盖原文：把结果插入到选区所在行的下方（callout）。
        insertCalloutBelowSelection(editor, "解释", next);
      } else if (this.settings.replaceMode === "confirm") {
        new ConfirmReplaceModal({
          app: this.app,
          selectedText,
          resultText: next,
          onConfirm: () => {
            replaceSelection(editor, next);
          }
        }).open();
      } else {
        replaceSelection(editor, next);
      }

      this.statusBar?.setIdle("完成");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      new Notice(`AI Writer：${message}`);
      this.statusBar?.setError(message);
    }
  }

  private actionLabel(action: AIWriterAction): string {
    switch (action) {
      case "rewrite":
        return "改写";
      case "polish":
        return "润色";
      case "continue":
        return "续写";
      case "summarize":
        return "总结";
      case "translate":
        return "翻译";
      case "explain":
        return "解释";
      default:
        return action;
    }
  }
}
