# Contributing

<!-- Moved into docs/ for organization. -->

Thanks for helping improve AI Writer for Obsidian.

## Development

Prerequisites:

- Node.js 18+ (20+ recommended)
- Obsidian Desktop

Commands (run in `obsidian-ai-writer/`):

- Install: `npm install`
- Dev watch: `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run typecheck`

## Local install (manual)

Copy these files into your Vault plugin folder:

- `<Vault>/.obsidian/plugins/ai-writer-kit/manifest.json`
- `<Vault>/.obsidian/plugins/ai-writer-kit/main.js`
- `<Vault>/.obsidian/plugins/ai-writer-kit/styles.css`

Then enable the plugin in Obsidian settings.

## Pull requests

- Keep PRs small and focused.
- Include screenshots/GIFs for UX changes (context menu, settings UI, editor insertion).
- Mention your provider/endpoint only by name (never include keys).

## Security

Do not commit any real API keys or private endpoints. Use placeholder values only.
