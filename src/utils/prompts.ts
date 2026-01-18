import type { AIWriterAction, ChatMessage, UILanguage } from "../types";
import { detectLanguage } from "./lang";

const SYSTEM_PROMPT_ZH =
  "你是一位专业的写作助手，擅长中英文内容的优化与处理。请直接输出结果，不要添加解释性文字。保持原文语气与风格，并尽量保持原有格式（如 Markdown）。";

const SYSTEM_PROMPT_EN =
  "You are a professional writing assistant. Output the result directly without explanations. Preserve the original tone/style and keep formatting (e.g., Markdown) whenever possible.";

function resolveLanguage(preference: UILanguage, selectedText: string): Exclude<UILanguage, "auto"> {
  if (preference === "auto") return detectLanguage(selectedText);
  return preference;
}

export function buildMessages(params: {
  action: AIWriterAction;
  selectedText: string;
  uiLanguage: UILanguage;
  context?: string;
}): ChatMessage[] {
  const lang = resolveLanguage(params.uiLanguage, params.selectedText);
  const systemPrompt = lang === "zh" ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
  const userPrompt = buildUserPrompt({
    action: params.action,
    selectedText: params.selectedText,
    language: lang,
    context: params.context
  });

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];
}

function buildUserPrompt(params: {
  action: AIWriterAction;
  selectedText: string;
  language: Exclude<UILanguage, "auto">;
  context?: string;
}): string {
  const text = params.selectedText;
  const contextBlock = params.context ? `\n\n[上下文]\n${params.context}\n` : "";

  if (params.language === "zh") {
    switch (params.action) {
      case "rewrite":
        return (
          "请改写以下文字，保持原意但使用不同的表达方式。\n" +
          "要求：\n" +
          "1. 保持核心意思不变\n" +
          "2. 使用不同的词汇和句式\n" +
          "3. 保持语气与风格\n" +
          "4. 输出长度与原文相近\n" +
          "5. 直接输出改写结果，不要添加任何解释\n" +
          contextBlock +
          "\n原文：\n" +
          text
        );
      case "polish":
        return (
          "请润色以下文字，使其更流畅、更专业。\n" +
          "要求：\n" +
          "1. 修正语法和错别字\n" +
          "2. 改善句子结构与可读性\n" +
          "3. 保持原意与风格\n" +
          "4. 直接输出润色结果，不要添加解释\n" +
          contextBlock +
          "\n原文：\n" +
          text
        );
      case "continue":
        return (
          "请根据以下文字继续写作。\n" +
          "要求：\n" +
          "1. 保持与前文一致的风格与语气\n" +
          "2. 内容逻辑连贯，自然衔接\n" +
          "3. 续写长度约为原文的 50%~100%\n" +
          "4. 直接输出续写内容，不要添加解释\n" +
          contextBlock +
          "\n前文：\n" +
          text
        );
      case "summarize":
        return (
          "请总结以下文字的核心内容。\n" +
          "要求：\n" +
          "1. 提取最重要的信息与观点\n" +
          "2. 用简洁语言表达，逻辑清晰\n" +
          "3. 总结长度控制在原文的 20%~30%\n" +
          "4. 直接输出总结，不要添加解释\n" +
          contextBlock +
          "\n原文：\n" +
          text
        );
      case "translate":
        return (
          "请翻译以下文字。\n" +
          "规则：\n" +
          "- 如果原文是中文，翻译成英文\n" +
          "- 如果原文是英文，翻译成中文\n" +
          "- 如果是其他语言，翻译成中文\n" +
          "要求：\n" +
          "1. 翻译准确，表达自然\n" +
          "2. 保持原文语气与格式\n" +
          "3. 直接输出译文，不要添加解释\n" +
          contextBlock +
          "\n原文：\n" +
          text
        );
      case "explain":
        return (
          "请用通俗易懂的语言解释以下内容。\n" +
          "要求：\n" +
          "1. 语言简单易懂\n" +
          "2. 可用类比/例子辅助理解\n" +
          "3. 2~4 句话以内\n" +
          "4. 直接输出解释，不要加前缀\n" +
          contextBlock +
          "\n需要解释的内容：\n" +
          text
        );
      default:
        return text;
    }
  }

  switch (params.action) {
    case "rewrite":
      return (
        "Rewrite the following text while preserving its original meaning.\n" +
        "Requirements:\n" +
        "1. Keep the core meaning intact\n" +
        "2. Use different vocabulary and sentence structures\n" +
        "3. Maintain the same tone and style\n" +
        "4. Keep similar length\n" +
        "5. Output the rewritten text directly without explanation\n" +
        contextBlock +
        "\nOriginal text:\n" +
        text
      );
    case "polish":
      return (
        "Polish the following text to make it more fluent and professional.\n" +
        "Requirements:\n" +
        "1. Fix grammar and spelling errors\n" +
        "2. Improve sentence structure for better flow\n" +
        "3. Preserve the original meaning and style\n" +
        "4. Output the polished text directly without explanation\n" +
        contextBlock +
        "\nOriginal text:\n" +
        text
      );
    case "continue":
      return (
        "Continue writing based on the following text.\n" +
        "Requirements:\n" +
        "1. Maintain consistent style and tone with the original\n" +
        "2. Ensure logical coherence and natural flow\n" +
        "3. Write approximately 50%-100% of the original length\n" +
        "4. Output the continuation directly without explanation\n" +
        contextBlock +
        "\nPrevious text:\n" +
        text
      );
    case "summarize":
      return (
        "Summarize the core content of the following text.\n" +
        "Requirements:\n" +
        "1. Extract the most important information and viewpoints\n" +
        "2. Use concise language\n" +
        "3. Keep the summary at 20%-30% of the original length\n" +
        "4. Output the summary directly without explanation\n" +
        contextBlock +
        "\nOriginal text:\n" +
        text
      );
    case "translate":
      return (
        "Translate the following text.\n" +
        "Rules:\n" +
        "- If the original is Chinese, translate to English\n" +
        "- If the original is English, translate to Chinese\n" +
        "- Otherwise, translate to Chinese\n" +
        "Requirements:\n" +
        "1. Accurate and natural translation\n" +
        "2. Preserve tone and formatting\n" +
        "3. Output the translation directly without explanation\n" +
        contextBlock +
        "\nText:\n" +
        text
      );
    case "explain":
      return (
        "Explain the following content in simple terms.\n" +
        "Requirements:\n" +
        "1. Use easy-to-understand language\n" +
        "2. Use analogies or examples if helpful\n" +
        "3. Keep it within 2-4 sentences\n" +
        "4. Output the explanation directly without prefix\n" +
        contextBlock +
        "\nContent:\n" +
        text
      );
    default:
      return text;
  }
}

