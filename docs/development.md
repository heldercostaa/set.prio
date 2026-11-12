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

All scenarios use Gherkin with playwright-bdd. `pnpm test` runs data and storage contracts once. `pnpm test:e2e` runs the complete browser suite in Chromium, universal flows on mobile WebKit, desktop interactions on desktop WebKit, and touch flows on mobile Chromium.

Use `@desktop` for hover or mouse-only scenarios, `@chromium` for native clipboard access, and `@touch` for the shared floating-drop flow that also exercises touch sensors. Untagged scenarios run on desktop Chromium and mobile WebKit. Keep assertions at the behavior's owning boundary instead of repeating every scenario on every device. See [verification](./verification.md) for coverage and limits.

## README media

The sample plan in `docs/fixtures/readme-plan.json` reproduces the user-supplied image: 26 Friday, 14 Saturday, and 24 Sunday priorities. It is loaded only into isolated screenshot browser contexts; new visitors start empty.

With the development server running:

```sh
node scripts/capture-readme.mjs
node scripts/capture-readme-gifs.mjs
```

Use `SCREENSHOT_BASE_URL` for another local server. Both scripts validate every artist/day and the 64-appearance total. Mobile captures use the visible viewport, keeping README images short and side by side.

The GIF script records desktop dragging, genre filters, export options, and mobile day swipes, rating, and priority changes through Playwright. Sharp encodes the frames using the existing dependencies; no separate video tools are needed. A recording-only pointer marks clicks and taps. Each GIF must stay below 5 MiB. The README supplies still images for reduced-motion preferences.

## References

- [Architecture](./architecture.md)
- [Design and appearance](./design.md)
- [Genre research](./genre-research.md)
- [Portrait sources](./portrait-sources.md)

Refresh the official catalog with `pnpm catalog:refresh`; review the diff and curated references before committing. User preferences remain edition-specific browser-local data. Image binaries stay outside localStorage. Exports cover prioritized appearances across all days, regardless of current filters.
