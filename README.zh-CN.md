# Obsidian AI Writer（AI Writer for Obsidian）

[English](./README.md) · [简体中文](./README.zh-CN.md)

选中文字，一键增强：改写、润色、续写、总结、翻译、解释。界面极简，结果内联呈现。

## 特性

- **内联编辑**：直接替换选区（可 `Ctrl/Cmd+Z` 撤销）
- **6 个核心动作**：改写 · 润色 · 续写 · 总结 · 翻译 · 解释
- **右键菜单 + 快捷键**：在编辑器里即用
- **解释不覆盖原文**：会在选区下方插入 `[!info] 解释` callout
- **OpenAI 兼容服务商**：支持 `/v1/chat/completions` 的端点

## 功能与快捷键

| 功能 | 快捷键 | 输出 |
|------|--------|------|
| 改写 | `Mod+Shift+R` | 保持原意，换种表达 |
| 润色 | `Mod+Shift+P` | 提升可读性与表达 |
| 续写 | `Mod+Shift+W` | 基于上下文继续写 |
| 总结 | `Mod+Shift+S` | 压缩为简短摘要 |
| 翻译 | `Mod+Shift+T` | 中↔英互译（其他语种→中文） |
| 解释 | `Mod+Shift+E` | 用通俗语言解释（插入 callout） |

## 安装

- 手动安装：
  1. 下载 Release 产物（或自行构建）。
  2. 将 `manifest.json`、`main.js`、`styles.css` 放到：
     - `<你的Vault>/.obsidian/plugins/ai-writer-kit/`
  3. 重启 Obsidian 并启用插件。

## 配置

打开：设置 → 第三方插件 → AI Writer（齿轮）

- 配置 `API Base`（必须是 OpenAI 兼容接口，常见形式 `https://.../v1`）
- 配置 `模型`
- 如有需要再配置 `API Key`
- 点击“测试连接”

常见报错：`Unexpected token '<' ... is not valid JSON` 通常表示 `API Base` 返回了 HTML（URL 填错或缺少 `/v1`）。


## License

MIT
