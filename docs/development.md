# Development notes

Use Node and pnpm versions pinned by `.nvmrc` and `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm format:check
pnpm typecheck
pnpm exec playwright install chromium webkit
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
```

All scenarios are Gherkin features, using playwright-bdd. Contract scenarios run once; browser workflows run in desktop/mobile Chromium and WebKit. Emulation does not replace physical-device checks.

## Screenshots

The sample plan in `docs/fixtures/readme-plan.json` reproduces the user-supplied image: 26 Friday, 14 Saturday, and 24 Sunday priorities. It is loaded only into isolated screenshot browser contexts; new visitors start empty.

With the development server running:

```sh
node scripts/capture-readme.mjs
```

Use `SCREENSHOT_BASE_URL` for another local server. The script validates every artist/day and the 64-appearance total. Mobile captures use the visible viewport, keeping README images short and side by side.

## References

- [Architecture](./architecture.md)
- [Design and appearance](./design.md)
- [Genre research](./genre-research.md)
- [Portrait sources](./portrait-sources.md)

Refresh the official catalog with `pnpm catalog:refresh`; review the diff and curated references before committing. User preferences remain edition-specific browser-local data. Image binaries stay outside localStorage. Exports cover prioritized appearances across all days, regardless of current filters.
