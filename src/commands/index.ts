import { MarkdownView, type Editor, type MarkdownFileInfo, type Plugin } from "obsidian";
import type AIWriterPlugin from "../main";
import type { AIWriterAction } from "../types";

type CommandSpec = {
  id: string;
  name: string;
  action: AIWriterAction;
  hotkeys: { modifiers: string[]; key: string }[];
};

const COMMANDS: CommandSpec[] = [
  {
    id: "rewrite",
    name: "AI Writer：改写选中文本",
    action: "rewrite",
    hotkeys: [{ modifiers: ["Mod", "Shift"], key: "r" }]
  },
  {
    id: "polish",
    name: "AI Writer：润色选中文本",
    action: "polish",
    hotkeys: [{ modifiers: ["Mod", "Shift"], key: "p" }]
  },
  {
    id: "continue",
    name: "AI Writer：续写",
    action: "continue",
    hotkeys: [{ modifiers: ["Mod", "Shift"], key: "w" }]
  },
  {
    id: "summarize",
    name: "AI Writer：总结",
    action: "summarize",
    hotkeys: [{ modifiers: ["Mod", "Shift"], key: "s" }]
  },
  {
    id: "translate",
    name: "AI Writer：翻译",
    action: "translate",
    hotkeys: [{ modifiers: ["Mod", "Shift"], key: "t" }]
  },
  {
    id: "explain",
    name: "AI Writer：解释",
    action: "explain",
    hotkeys: [{ modifiers: ["Mod", "Shift"], key: "e" }]
  }
];

export function registerCommands(plugin: AIWriterPlugin & Plugin): void {
  for (const spec of COMMANDS) {
    plugin.addCommand({
      id: spec.id,
      name: spec.name,
      hotkeys: spec.hotkeys as any,
      editorCallback: (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
        const view =
          ctx instanceof MarkdownView
            ? ctx
            : plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        void plugin.runAction(spec.action, editor, view);
      }
    });
  }
}
