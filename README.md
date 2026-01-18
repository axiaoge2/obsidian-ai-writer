# AI Writer for Obsidian

[English](./README.md) · [简体中文](./README.zh-CN.md)

Select text and enhance it in one click—rewrite, polish, continue, summarize, translate, or explain. Minimal UI, inline results.

## Features

- **Inline editing**: replace selection directly (undo with `Ctrl/Cmd+Z`)
- **6 core actions**: Rewrite · Polish · Continue · Summarize · Translate · Explain
- **Context menu + hotkeys**: use it where you write
- **Explain doesn’t overwrite**: inserts an `[!info] Explain` callout below the selection
- **OpenAI-compatible providers**: endpoints that support `/v1/chat/completions`

## Actions

| Action | Hotkey | Output |
|------|--------|------|
| Rewrite | `Mod+Shift+R` | Rewrites selection while keeping meaning |
| Polish | `Mod+Shift+P` | Improves clarity and style |
| Continue | `Mod+Shift+W` | Continues writing from the selection |
| Summarize | `Mod+Shift+S` | Condenses into a short summary |
| Translate | `Mod+Shift+T` | Translates (CN↔EN, otherwise → CN) |
| Explain | `Mod+Shift+E` | Explains in simple terms (as a callout) |

## Installation

- Manual install:
  1. Download the latest Release assets (or build it yourself).
  2. Put `manifest.json`, `main.js`, `styles.css` into:
     - `<YourVault>/.obsidian/plugins/ai-writer-kit/`
  3. Restart Obsidian and enable the plugin.

## Setup

Open: Settings → Community plugins → AI Writer (gear icon)

- Set `API Base` (must be OpenAI-compatible, typically `https://.../v1`)
- Set `Model`
- Set `API Key` (only if your endpoint requires it)
- Click **Test connection**

Common error: `Unexpected token '<' ... is not valid JSON` usually means your `API Base` returned HTML (wrong URL or missing `/v1`).


## License

MIT
