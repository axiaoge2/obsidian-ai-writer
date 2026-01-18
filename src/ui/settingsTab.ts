import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type AIWriterPlugin from "../main";
import { PROVIDER_PRESETS, getPreset } from "../providers/presets";
import { createProvider, getActiveProviderConfig } from "../providers";

export class AIWriterSettingTab extends PluginSettingTab {
  private plugin: AIWriterPlugin;

  constructor(app: App, plugin: AIWriterPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "AI Writer 设置" });

    const ensureProviderConfig = (providerId: string): void => {
      if (!this.plugin.settings.providers) this.plugin.settings.providers = {};
      if (this.plugin.settings.providers[providerId]) return;

      const preset = getPreset(providerId);
      this.plugin.settings.providers[providerId] = {
        apiBase: preset?.apiBase ?? "",
        apiKey: "",
        model: preset?.defaultModel ?? "",
        modelMode: preset?.models?.length ? "preset" : "custom"
      };
    };

    const saveActiveConfig = async (): Promise<void> => {
      const providerId = this.plugin.settings.providerId;
      ensureProviderConfig(providerId);
      const preset = getPreset(providerId);
      const cfg = this.plugin.settings.providers[providerId];
      if (!cfg.modelMode) {
        cfg.modelMode = preset?.models?.includes(cfg.model) ? "preset" : "custom";
      }
      await this.plugin.saveSettings();
    };

    ensureProviderConfig(this.plugin.settings.providerId);

    new Setting(containerEl)
      .setName("服务商")
      .setDesc("选择一个 OpenAI 兼容的服务商预设，或选择“自定义”。")
      .addDropdown((dd) => {
        for (const preset of PROVIDER_PRESETS) dd.addOption(preset.id, preset.name);
        dd.setValue(this.plugin.settings.providerId);
        dd.onChange(async (value) => {
          await saveActiveConfig();

          this.plugin.settings.providerId = value;
          ensureProviderConfig(value);
          await this.plugin.saveSettings();
          this.display();
        });
      });

    if (this.plugin.settings.providerId === "aiwriter") {
      containerEl.createEl("p", {
        text: "AI Writer（内置）：已预置服务商配置，通常无需填写 API Base / API Key。"
      });
    }

    if (this.plugin.settings.providerId === "custom") {
      containerEl.createEl("p", {
        text:
          "提示：当前版本仅支持 OpenAI 兼容接口（/v1/chat/completions）。如果你使用的是官方 Claude/Anthropic 接口，请改用 OpenRouter 等兼容端点，或等待后续原生 Provider 支持。"
      });
    }

    const activeConfig = getActiveProviderConfig(this.plugin.settings);
    if (this.plugin.settings.providerId === "aiwriter" && (!activeConfig.apiBase || !activeConfig.model)) {
      containerEl.createEl("p", {
        text:
          "检测到内置服务商缺少必要配置（API Base / 模型）。请确认插件目录下存在 mvp.defaults.json，且包含 providerId/apiBase/model。"
      });
    }

    if (this.plugin.settings.providerId !== "aiwriter") {
      new Setting(containerEl)
        .setName("API Base")
        .setDesc("OpenAI 兼容 API 的基础地址（例：https://api.openai.com/v1）。")
        .addText((text) =>
          text.setPlaceholder("https://api.openai.com/v1").setValue(activeConfig.apiBase).onChange(
            async (value) => {
              ensureProviderConfig(this.plugin.settings.providerId);
              this.plugin.settings.providers[this.plugin.settings.providerId].apiBase = value.trim();
              await saveActiveConfig();
            }
          )
        );

      new Setting(containerEl)
        .setName("API Key")
        .setDesc("请妥善保管，不要提交到仓库。")
        .addText((text) => {
          text.inputEl.type = "password";
          text
            .setPlaceholder("sk-...")
            .setValue(activeConfig.apiKey)
            .onChange(async (value) => {
              ensureProviderConfig(this.plugin.settings.providerId);
              this.plugin.settings.providers[this.plugin.settings.providerId].apiKey = value.trim();
              await saveActiveConfig();
            });
        });
    }

    const preset = getPreset(this.plugin.settings.providerId);
    if (preset?.models?.length) {
      const CUSTOM_MODEL_OPTION = "__custom_model__";
      const providerCfg = this.plugin.settings.providers[this.plugin.settings.providerId];
      const derivedMode = preset.models.includes(activeConfig.model) ? "preset" : "custom";
      const modelMode = providerCfg.modelMode ?? derivedMode;
      const modelIsInPreset = preset.models.includes(activeConfig.model);
      const dropdownValue =
        modelMode === "custom" ? CUSTOM_MODEL_OPTION : modelIsInPreset ? activeConfig.model : CUSTOM_MODEL_OPTION;

      new Setting(containerEl)
        .setName("模型")
        .setDesc("可从列表选择；也可选“自定义…”并输入任意模型名（用于新版本/未收录模型）。")
        .addDropdown((dd) => {
          for (const model of preset.models) dd.addOption(model, model);
          dd.addOption(CUSTOM_MODEL_OPTION, "自定义…");
          dd.setValue(dropdownValue);
          dd.onChange(async (value) => {
            if (value !== CUSTOM_MODEL_OPTION) {
              ensureProviderConfig(this.plugin.settings.providerId);
              this.plugin.settings.providers[this.plugin.settings.providerId].model = value;
              this.plugin.settings.providers[this.plugin.settings.providerId].modelMode = "preset";
              await saveActiveConfig();
            }
            if (value === CUSTOM_MODEL_OPTION) {
              ensureProviderConfig(this.plugin.settings.providerId);
              this.plugin.settings.providers[this.plugin.settings.providerId].modelMode = "custom";
              await saveActiveConfig();
            }
            this.display();
          });
        });

      if (dropdownValue === CUSTOM_MODEL_OPTION) {
        new Setting(containerEl)
          .setName("自定义模型")
          .setDesc("输入任意模型名（示例：claude-sonnet-4-5-2025092）。")
          .addText((text) => {
            text
              .setPlaceholder(preset.defaultModel)
              .setValue(activeConfig.model)
              .onChange(async (value) => {
                ensureProviderConfig(this.plugin.settings.providerId);
                this.plugin.settings.providers[this.plugin.settings.providerId].model = value.trim();
                this.plugin.settings.providers[this.plugin.settings.providerId].modelMode = "custom";
                await saveActiveConfig();
              });
          });
      }
    } else {
      new Setting(containerEl)
        .setName("模型")
        .setDesc("当预设不提供模型列表时，请手动填写。")
        .addText((text) =>
          text.setPlaceholder("model-name").setValue(activeConfig.model).onChange(async (value) => {
            ensureProviderConfig(this.plugin.settings.providerId);
            this.plugin.settings.providers[this.plugin.settings.providerId].model = value.trim();
            this.plugin.settings.providers[this.plugin.settings.providerId].modelMode = "custom";
            await saveActiveConfig();
          })
        );
    }

    new Setting(containerEl)
      .setName("连接测试")
      .setDesc("尝试调用 /models 以验证 API Base 与 Key 是否可用。")
      .addButton((btn) =>
        btn.setButtonText("测试连接").onClick(async () => {
          await saveActiveConfig();
          const provider = createProvider(this.plugin.settings);
          try {
            await provider.validateConfiguration();
            new Notice("AI Writer：连接成功");
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            new Notice(`AI Writer：连接失败 - ${message}`);
          }
        })
      );

    containerEl.createEl("hr");

    containerEl.createEl("h3", { text: "安全与重置" });

    new Setting(containerEl)
      .setName("清除当前服务商 API Key")
      .setDesc("将当前服务商保存的 API Key 置空（不会影响其他服务商）。")
      .addButton((btn) =>
        btn.setButtonText("清除").onClick(async () => {
          ensureProviderConfig(this.plugin.settings.providerId);
          this.plugin.settings.providers[this.plugin.settings.providerId].apiKey = "";
          await this.plugin.saveSettings();
          new Notice("AI Writer：已清除当前服务商 API Key");
          this.display();
        })
      );

    new Setting(containerEl)
      .setName("界面语言")
      .setDesc("用于选择 Prompt 语言（auto 会根据选中文本检测）。")
      .addDropdown((dd) => {
        dd.addOption("auto", "自动");
        dd.addOption("zh", "中文");
        dd.addOption("en", "英文");
        dd.setValue(this.plugin.settings.uiLanguage);
        dd.onChange(async (value) => {
          this.plugin.settings.uiLanguage = value as any;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("替换模式")
      .setDesc("内联替换：直接替换选中文字；弹窗确认：先预览再替换。")
      .addDropdown((dd) => {
        dd.addOption("inline", "内联替换");
        dd.addOption("confirm", "弹窗确认");
        dd.setValue(this.plugin.settings.replaceMode);
        dd.onChange(async (value) => {
          this.plugin.settings.replaceMode = value as any;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("上下文行数")
      .setDesc("将选区前后若干行作为上下文附带给模型（0 代表不附带）。")
      .addSlider((slider) =>
        slider
          .setLimits(0, 10, 1)
          .setValue(this.plugin.settings.contextLines)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.contextLines = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("超时（毫秒）")
      .setDesc("单次请求的超时限制。")
      .addText((text) =>
        text.setValue(String(this.plugin.settings.requestTimeoutMs)).onChange(async (value) => {
          const asNum = Number(value);
          if (!Number.isFinite(asNum) || asNum <= 0) return;
          this.plugin.settings.requestTimeoutMs = Math.floor(asNum);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("温度 (temperature)")
      .setDesc("越高越发散，越低越稳定。")
      .addSlider((slider) =>
        slider
          .setLimits(0, 1, 0.05)
          .setValue(this.plugin.settings.temperature)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.temperature = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("最大输出 tokens")
      .setDesc("控制输出长度上限。")
      .addText((text) =>
        text.setValue(String(this.plugin.settings.maxTokens)).onChange(async (value) => {
          const asNum = Number(value);
          if (!Number.isFinite(asNum) || asNum <= 0) return;
          this.plugin.settings.maxTokens = Math.floor(asNum);
          await this.plugin.saveSettings();
        })
      );
  }
}
