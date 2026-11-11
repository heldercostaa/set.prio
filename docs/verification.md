# Verification

Checked November 11, 2026 on macOS arm64 with Node 24.16.0 and pnpm 11.25.0.

## Automated checks

| Check                                 | Result                                 |
| ------------------------------------- | -------------------------------------- |
| pnpm install --frozen-lockfile        | Passed                                 |
| pnpm lint                             | Passed                                 |
| pnpm format:check                     | Passed                                 |
| pnpm typecheck                        | Passed                                 |
| pnpm test                             | 14 tests passed in four files          |
| pnpm test:e2e                         | 30 passed; six platform-specific skips |
| Expanded image-export cases           | Passed in all four browser profiles    |
| pnpm build                            | Passed                                 |
| pnpm dev                              | Served the working application         |
| pnpm preview --port 4174 --strictPort | Served the production bundle           |

Browser profiles: desktop Chromium, desktop WebKit, Pixel 7 Chromium emulation, and iPhone 13 WebKit emulation. Narrow-screen checks also run at 320px.

Mouse drag and hover checks are skipped on touch profiles (four cases). Two clipboard-read cases are skipped on WebKit because that platform's clipboard permission transport differs. Manual-copy fallback, image download, and CSV download are verified in every profile.

Tests cover per-appearance priorities, independent repeated appearances, shared recording ratings, zero versus unrated, Unicode and multiline comments, reload persistence, language changes, source-day drag restrictions, keyboard focus restoration, reduced motion, dark appearance under a light system preference, and catalog search.

Storage regression checks demonstrate that invalid JSON, unsupported versions, and malformed individual values are preserved before a new plan is accepted. If a backup cannot be written, the original value remains untouched. Legacy light appearance settings do not prevent plan recovery.

The expanded PNG cases populate all priority levels across three days and include a long joint-act name. The dark background is verified from PNG pixels. The resulting 2880px-wide image includes the supplied icon, dates, complete wrapped names, and credits without clipping.

## Linux CI regression

The first Linux CI run exposed a transient duplicate accessible card after a priority move. Exiting animated cards are now inert, hidden from the accessibility tree, and excluded from hover previews and focus restoration. The existing desktop drag workflow caught this race. The test waits for a single active card before the next gesture.

## Visual checks

The supplied SVG and derived 512px icon were inspected. The icon's geometry, colors, rounded background, and shadow remain intact.

Desktop and mobile screenshots are in screenshots/. The browser's production preview was checked for the correct title, English default, three day columns, catalog search, local portraits, artist details, and named YouTube links.

The image export was visually inspected separately from the application screenshot.

## Limits

- Mobile results are emulation; no physical iOS or Android device was tested.
- Chromium clipboard HTML and text payloads were verified. Actual paste into an authenticated Notion page was not tested.
- GitHub Actions passed the same checks on Linux, including desktop Chromium and WebKit.
- The production JavaScript bundle is about 197 kB gzip. Vite reports its default advisory for a minified chunk above 500 kB.
- Research gaps and source conflicts are documented in catalog-research.md.

## Portrait and header update

The header icon now has a subtle outline and shadow while the SVG remains unchanged. Twenty artist-owned portrait supplements and two representative member photos were checked visually. A live catalog refresh preserved their local assets and provenance. Twenty entries still use a neutral fallback; see catalog-research.md.

Lint, formatting, types, 13 unit tests, build, and the full browser matrix passed. An earlier WebKit drag run reported an intermittent development-server ResizeObserver notification; the full rerun passed without suppressing browser errors.

## Hover stability

The grip reserves 12px at rest and on hover; only opacity changes. Labels use explicit flex sizing, and movement animations translate their position without scaling their text. Chromium and WebKit checks cover long labels at 1024px, 1280px, and 1440px, stable geometry while hovered, entering the recording preview, and opening artist details. The full matrix passed with 26 checks and six platform-specific skips. The reported intermittent flicker was not reproduced deterministically; the earlier fixed-width override already passed the settled-hover checks.

## Column-style image export

The redesigned PNG was inspected with all three days, every priority level, and a long billed-act name. The artist label wraps inside its border and the columns end after their contents. Image export and clipboard fallback checks passed in all four browser profiles; lint, formatting, type checks, 13 unit tests, and the production build passed.

## B2b member information

Previews and dialogs show every linked member’s identity, estimated genres, profile, and recommended recording. Ratings remain keyed to each recording; exact joint recordings are shown separately. Browser checks cover two member ratings (including zero), a single joint priority/comment editor, reload persistence, and Portuguese labels in all four profiles. CSV/Notion checks verify one attributed row per b2b member, each member’s recording, genres, and score, and the shared day, priority, and comment. The PNG retains the joint billing. All 14 unit tests and 30 browser checks passed; six platform-specific cases are skipped.
