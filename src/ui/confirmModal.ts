import { App, Modal, Setting } from "obsidian";

export class ConfirmReplaceModal extends Modal {
  private selectedText: string;
  private resultText: string;
  private onConfirm: () => void;

  constructor(params: {
    app: App;
    selectedText: string;
    resultText: string;
    onConfirm: () => void;
  }) {
    super(params.app);
    this.selectedText = params.selectedText;
    this.resultText = params.resultText;
    this.onConfirm = params.onConfirm;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h3", { text: "AI Writer：确认替换" });

    const wrap = contentEl.createDiv({ cls: "ai-writer-confirm" });
    wrap.createEl("h4", { text: "原文（已选中）" });
    wrap.createEl("pre", { text: this.selectedText });
    wrap.createEl("h4", { text: "替换为" });
    wrap.createEl("pre", { text: this.resultText });

    new Setting(contentEl)
      .addButton((btn) =>
        btn.setButtonText("取消").onClick(() => {
          this.close();
        })
      )
      .addButton((btn) =>
        btn
          .setCta()
          .setButtonText("替换")
          .onClick(() => {
            this.onConfirm();
            this.close();
          })
      );
  }
}
