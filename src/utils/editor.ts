import type { Editor } from "obsidian";

export function getSelection(editor: Editor): string {
  return editor.getSelection();
}

export function getSelectionContext(editor: Editor, contextLines: number): string {
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  const startLine = Math.max(0, from.line - contextLines);
  const endLine = Math.min(editor.lineCount() - 1, to.line + contextLines);

  const lines: string[] = [];
  for (let line = startLine; line <= endLine; line += 1) {
    lines.push(editor.getLine(line));
  }
  return lines.join("\n").trim();
}

export function replaceSelection(editor: Editor, next: string): void {
  editor.replaceSelection(next);
}

function toCalloutBlock(title: string, body: string): string {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const quoted = lines
    .map((line) => (line.length ? `> ${line}` : ">"))
    .join("\n");
  return `\n\n> [!info] ${title}\n${quoted}\n`;
}

export function insertCalloutBelowSelection(editor: Editor, title: string, body: string): void {
  const to = editor.getCursor("to");
  const insertAt = { line: to.line, ch: editor.getLine(to.line).length };
  editor.replaceRange(toCalloutBlock(title, body), insertAt, insertAt);
}
