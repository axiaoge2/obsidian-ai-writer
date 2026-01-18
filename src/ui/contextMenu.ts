import type { Editor, MarkdownView, MenuItem, Plugin } from "obsidian";
import type AIWriterPlugin from "../main";
import type { AIWriterAction } from "../types";

const ACTIONS: Array<{ action: AIWriterAction; title: string; icon: string }> = [
  { action: "rewrite", title: "改写", icon: "pencil" },
  { action: "polish", title: "润色", icon: "sparkles" },
  { action: "continue", title: "续写", icon: "arrow-right" },
  { action: "summarize", title: "总结", icon: "list" },
  { action: "translate", title: "翻译", icon: "languages" },
  { action: "explain", title: "解释", icon: "help-circle" }
];

export function registerEditorContextMenu(plugin: AIWriterPlugin & Plugin): void {
  plugin.registerEvent(
    (plugin.app.workspace as any).on("editor-menu", (menu: any, editor: Editor, view: MarkdownView) => {
      const hasSelection = Boolean(editor.getSelection()?.trim());
      menu.addItem((item: MenuItem) => item.setTitle("AI Writer").setDisabled(true));
      menu.addSeparator();

      for (const { action, title, icon } of ACTIONS) {
        menu.addItem((item: MenuItem) => {
          item.setTitle(title).setIcon(icon);
          if (!hasSelection) {
            item.setDisabled(true);
            return;
          }
          item.onClick(() => plugin.runAction(action, editor, view));
        });
      }
    })
  );
}
