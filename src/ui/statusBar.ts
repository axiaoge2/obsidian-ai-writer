import type { Plugin } from "obsidian";

export class StatusBarController {
  private item: HTMLElement;
  private idleText = "AI Writer";

  constructor(plugin: Plugin) {
    this.item = plugin.addStatusBarItem();
    this.item.setText(this.idleText);
  }

  setBusy(label: string): void {
    this.item.setText(`AI Writer: ${label}…`);
  }

  setIdle(extra?: string): void {
    this.item.setText(extra ? `AI Writer: ${extra}` : this.idleText);
  }

  setError(message: string): void {
    this.item.setText(`AI Writer: 错误 - ${message}`);
  }
}

