import type { UILanguage } from "../types";

export function detectLanguage(text: string): Exclude<UILanguage, "auto"> {
  const hasCJK = /[\u4e00-\u9fff]/.test(text);
  return hasCJK ? "zh" : "en";
}

