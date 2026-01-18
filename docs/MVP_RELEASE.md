# 发布与安装（MVP）

<!-- 已移动至 docs/ 目录，集中管理文档。 -->

## 1) 打包（给用户下载）

在 `D:\WordPress\obsidian-ai-writer`：

1. 安装依赖：`npm install`
2. 生产构建：`npm run build`（会生成 `main.js`）
3. 将以下文件打包成一个 zip（zip 根目录建议就叫 `ai-writer-kit/`）：
   - `manifest.json`
   - `main.js`
   - `styles.css`
   - `versions.json`（可选，但建议保留）
   - `mvp.defaults.json`（可选：用于“免配置默认服务商”，见下文；开源/发版时不要包含真实 API Key）

## 2) 用户安装（你发给用户的步骤）

1. 关闭 Obsidian
2. 解压 zip 到：
   - `<Vault>/.obsidian/plugins/ai-writer-kit/`
3. 打开 Obsidian → 设置 → 第三方插件 → 关闭安全模式（如有）→ 启用 `AI Writer`

## 3) MVP 验证点（你需要确认的“能用”标准）

- 设置页能配置 `API Base / API Key / 模型`，并能“测试连接”
- 选中文本后右键出现 `AI Writer` 菜单
- 改写/润色/续写/总结/翻译：替换选中文字
- 解释：不覆盖原文，在选区下方插入 `[!info] 解释` 块

## 4) 关键提示（减少无效反馈）

- 当前版本仅支持 **OpenAI 兼容接口**：`.../v1/chat/completions`
- `API Base` 常见正确形式：`https://xxx/v1`（缺少 `/v1` 很容易导致返回 HTML，出现 “not valid JSON”）

## 4.1 免配置默认服务商（可选）

如果你希望用户首次安装就能直接体验（无需先配置），可以在插件目录放一个：

- `mvp.defaults.json`（参考 `mvp.defaults.example.json`）

插件会在**首次运行**时读取它，并作为默认服务商配置（不会覆盖用户后续已保存的设置）。

建议将 `providerId` 设为 `aiwriter`，这样设置页会出现一个 “AI Writer（内置）” 选项，并且不会在界面上暴露你的 API Base / Key。

注意：即使界面不显示，任何打包到客户端的密钥仍然可被读取；开源发布时建议不要在任何文件中包含真实 API Key。

如果你使用 `scripts/package.ps1` 打包：默认**不会**包含 `mvp.defaults.json`。如确实需要（且不含 `apiKey`），使用：

- `powershell -ExecutionPolicy Bypass -File .\\scripts\\package.ps1 -IncludeMvpDefaults`

开源仓库建议做法：在仓库里维护一个可公开的 `mvp.defaults.public.json`（`apiKey` 必须为空），发版时会被复制为 `mvp.defaults.json` 并随 zip 一起发布。

## 5) GitHub Releases（开源发布）

仓库内置了一个 GitHub Actions 工作流：当你打 tag（例如 `v0.1.0`）时，会自动构建并发布 Release，附带：

- `manifest.json`
- `main.js`
- `styles.css`
- `versions.json`
- `ai-writer-kit.zip`

工作流文件：`.github/workflows/release.yml`

## 6) Obsidian 社区插件目录（Community plugins）

建议流程：

1. 先在 GitHub 上发布可安装的 Release（见上节）。
2. 按 Obsidian 官方文档提交你的插件到社区目录（通常需要提交一个 PR 到其插件注册仓库），并提供：
   - 插件仓库地址
   - 插件 `id`（manifest 里的 `id`）
   - 一份可下载的 Release（含 `manifest.json/main.js/styles.css`）
