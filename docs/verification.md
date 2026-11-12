# Verification

Checked November 11, 2026 on macOS arm64, Node 24.16.0, and pnpm 11.25.0.

## Current checks

| Command or check                        | Result                                    |
| --------------------------------------- | ----------------------------------------- |
| `pnpm install --frozen-lockfile`        | Passed                                    |
| `pnpm lint`                             | Passed                                    |
| `pnpm format:check`                     | Passed                                    |
| `pnpm typecheck`                        | Passed                                    |
| `pnpm test`                             | 14 tests passed across four files         |
| `pnpm test:e2e`                         | 38 passed; six capability-specific skips  |
| `pnpm build`                            | Passed                                    |
| `pnpm dev`                              | Served the browser workflows              |
| `pnpm preview --port 4173 --strictPort` | Served the production bundle              |
| Production preview smoke checks         | Eight passed across four browser profiles |

Browser coverage includes desktop Chromium and WebKit, Pixel 7 Chromium emulation, iPhone 13 WebKit emulation, and a 320px viewport. The production smoke checks verify narrow-screen actions, focus restoration, reduced motion, PNG downloads, and the manual clipboard fallback against built assets.

Mouse drag and hover are skipped on touch profiles (four cases). Two native clipboard-read cases are skipped on WebKit. Image, CSV, and manual-copy workflows run in every profile. No uncaught browser errors were filtered or suppressed.

## Behavior and BDD coverage

Executable scenarios in [personal-plan.feature](../features/personal-plan.feature) cover persistent bilingual preferences, priority selection and clearing, zero ratings, and multiline comments. `pnpm test:e2e` generates their Playwright tests before execution; generated files are ignored.

Other regressions cover official-day drag restrictions, independent repeated appearances, shared recording ratings, joint-act member details, source links, keyboard focus, reduced motion, search, CSV escaping, and HTML/plain-text clipboard payloads.

Storage tests preserve invalid JSON, unsupported versions, and malformed individual values before accepting a fresh plan. If backup fails, the original remains untouched. Catalog changes retain saved IDs, notes, and scores.

## Visual evidence

The supplied SVG stays unchanged. Derived icons, its contrasting header frame, and its use in exported images were inspected. Components use system typography and semantic Tailwind tokens, with flat grouped surfaces and readable artist labels.

Desktop and mobile images are in [screenshots](./screenshots/). The [complete PNG](./screenshots/export-full.png) contains all 118 appearances across every day and priority group, including long joint names. It is 2880px wide, measures its content independently of the viewport, and retains visible footer credits.

Hover checks sample label geometry at 1024px, 1280px, and 1440px and enter recording links before opening details. A shared coordinator prevents overlapping previews. Viewport-bounded sizing avoids the previous feedback between popover size and placement; previews are disabled during dragging.

## Limits

- Mobile profiles are emulation; physical iOS and Android devices were not tested.
- Actual paste into an authenticated Notion page was not tested. Clipboard HTML, named links, plain text, and failure fallback were verified.
- Local results above do not assert that every open PR's Linux CI run has completed. Check each PR's current GitHub checks before merging.
- The production JavaScript bundle is approximately 202 kB gzip. Vite reports its advisory for a minified chunk above 500 kB.
- Catalog research gaps and source conflicts remain documented in [research notes](./catalog-research.md).
