# 工作日志（AI Writer for Obsidian）

<!-- 已移动至 docs/ 目录，集中管理文档。 -->

> 目的：记录当前工作进度、已完成事项、待办与风险点，方便你本地检查后再决定是否上传。

## 2026-01-19（GitHub 上传与发版）

- 仓库已推送到 GitHub：`https://github.com/axiaoge2/obsidian-ai-writer`
- 默认分支：`main`
- 已打 tag 并推送：`v0.1.0`、`v0.1.1`（会触发 GitHub Actions 自动发布 Release）
- 插件关键信息：
  - `manifest.json#id`：`ai-writer-kit`
  - `manifest.json#author`：`AxiaoGe2`
- 文档已精简为技术向：`docs/` 仅保留开发/发版/贡献/更新/工作日志；已移除营销/规划类文档
- 打包脚本强化：`scripts/package.ps1` 默认不包含 `mvp.defaults.json`；如 `-IncludeMvpDefaults` 且检测到非空 `apiKey` 会拒绝打包
- 新增可公开默认配置：`mvp.defaults.public.json`（会在 Release 时复制为 `mvp.defaults.json` 打进 zip；强制 `apiKey` 为空）
- 已将公开默认网关写入 `mvp.defaults.public.json`（不含 key）：
  - `apiBase`: `https://54185418.xyz/v1`
  - `model`: `claude-sonnet-4-5-20250929`
  - 注意：若网关要求 token，会出现 401（“未提供令牌”）

### 当前结论（关于默认可用与密钥）

- 公开仓库/Release 不应包含真实 `apiKey`（会被自动抓取滥用）。
- 如果你希望用户“免配置可用”，网关需要支持**无 token 访问**（由网关服务端持有上游 key，并做限流/风控）。
- 如果只给你自己用：可以在你本地 Vault 的插件目录放 `mvp.defaults.json`（含 key），但不要提交/发布。

### 下一步（你确认即可）

- 去 GitHub → Actions 确认 `Release (Obsidian Plugin)` 工作流跑完
- 去 GitHub → Releases 检查是否生成 `ai-writer-kit.zip` 与 release 资产（`manifest.json/main.js/styles.css/versions.json`）

## 2026-01-18（当前进度快照）

### 已完成（MVP 可用）

- 插件工程骨架已落地（TypeScript + esbuild），可构建产物 `main.js`。
- 6 个核心命令已实现：改写 / 润色 / 续写 / 总结 / 翻译 / 解释。
  - 改写/润色/续写/总结/翻译：直接替换选区文本（可 `Ctrl/Cmd+Z` 撤销）
  - 解释：不覆盖原文，改为在选区下方插入 `[!info] 解释` callout
- 右键菜单 “AI Writer” 已集成；默认快捷键已配置（`Mod+Shift+R/P/W/S/T/E`）。
- 设置页已实现：服务商选择、API Base、API Key、模型选择/自定义模型、“测试连接”等。
- Provider：当前实现为 **OpenAI 兼容接口**（`/v1/chat/completions`）适配器，并增强了错误提示（避免 HTML 被当 JSON 解析）。

### 已完成（体验/配置修复）

- 修复：切换服务商时 API Key “串号”的问题（按服务商分别保存配置）。
- 修复：“模型下拉里选择自定义但不出现输入框”的问题（记录 `modelMode` 状态）。
- 移除：显示 Token 用量相关 UI 与逻辑（按你的要求）。
- 增加：服务商列表里新增 `AI Writer（内置）` 选项；支持用 `mvp.defaults.json` 注入默认配置。
  - 逻辑：若已存在空占位配置，会自动用 defaults 补齐；不会覆盖用户已填写的非空配置。
- 增加：仅保留“清除当前服务商 API Key”按钮；已移除“重置插件设置”按钮（按你的要求）。

### 已完成（发版文档与工具）

- 新增发布与安装说明：`MVP_RELEASE.md`
- 新增开发与本地安装说明：`DEVELOPMENT.md`
- 修复并可用：一键打包脚本 `scripts/package.ps1`（会构建并输出 `dist/ai-writer-kit.zip`）

### 已完成（开源准备）

- License：MIT（`LICENSE`）
- 新增：`CHANGELOG.md`、`CONTRIBUTING.md`
- 新增：GitHub Actions Release 工作流（打 tag 自动构建并发布 release 资源）
- 已在本地初始化 git 仓库（`git init`）（后续已提交并推送，见 2026-01-19）
- `.gitignore` 已忽略构建产物与本地配置：`dist/`、`release/`、`data.json`、`mvp.defaults.json` 等

### 当前待办（你确认后再做）

- 确认 README 需要走“开源”口径还是“商业化”口径（目前偏开源说明）。
- 决定是否保留 `mvp.defaults` 机制：
  - 若开源：强烈建议 **不要**在 defaults 中写入真实 `apiKey`（即使额度多也会被滥用）。
- 若要上 Obsidian 社区目录：需要补齐发布流程细节（版本号/tag、Release 资产、提交到官方插件注册仓库等）。

### 风险与备注

- 任何随插件分发到用户本地的 `apiKey` 都无法真正“隐藏/加密到别人拿不到”。
- PowerShell `chcp` 为 936 时查看 UTF-8 文档可能出现乱码，建议 `Get-Content -Encoding utf8 ...`。
