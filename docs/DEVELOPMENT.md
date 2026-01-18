# 开发与本地安装（MVP）

<!-- 已移动至 docs/ 目录，集中管理文档。 -->

## 前置条件

- Node.js 18+（建议 20+）
- Obsidian Desktop

## 构建与监听

在 `obsidian-ai-writer/` 目录执行：

- 安装依赖：`npm install`
- 开发监听（生成 `main.js`）：`npm run dev`
- 生产构建：`npm run build`
- 类型检查：`npm run typecheck`

## 安装到 Obsidian（开发模式）

Obsidian 插件目录示例：`<你的Vault>/.obsidian/plugins/ai-writer-kit/`

方式 A（推荐：软链接 / 符号链接）：

1. 关闭 Obsidian
2. 在 Vault 的插件目录下创建指向本项目的链接（Windows PowerShell 示例）：
   - `New-Item -ItemType SymbolicLink -Path "<Vault>\\.obsidian\\plugins\\ai-writer-kit" -Target "D:\\WordPress\\obsidian-ai-writer"`
3. 打开 Obsidian，启用插件（设置 → 第三方插件）

方式 B（复制文件）：

1. 将 `obsidian-ai-writer/manifest.json`、`obsidian-ai-writer/main.js`、`obsidian-ai-writer/styles.css` 复制到：
   - `<Vault>/.obsidian/plugins/ai-writer-kit/`
2. 打开 Obsidian 启用插件

## MVP 验证清单

1. 打开插件设置：配置 `API Base`、`API Key`、`模型`，点击“测试连接”
2. 在编辑器中选中文本，右键菜单出现 “AI Writer”
3. 执行 6 个命令：改写/润色/续写/总结/翻译/解释（默认热键：`Mod+Shift+R/P/W/S/T/E`）
4. 改写/润色/续写/总结/翻译：选中文本被原地替换；可用 `Ctrl/Cmd+Z` 撤销
5. 解释：不会覆盖原文，会在选区下方插入一段 callout（`[!info] 解释`）
5. 状态栏显示执行状态
