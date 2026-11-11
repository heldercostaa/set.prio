<p align="center">
  <img src="./public/logo.svg" alt="set.prio icon" width="80" height="80" />
</p>

<h1 align="center">set.prio</h1>
<p align="center">Tomorrowland Brasil 2027 · April 30 to May 2</p>

A personal planner for Tomorrowland Brasil 2027. Discover artists, prioritize performances by day, rate recommended YouTube sets, and export your plan as an image, CSV, or Notion table. Preferences are saved locally in your browser; no account or backend required.

## About the project

set.prio turns the festival lineup into a personal priority board. Official performance days stay fixed. You choose which appearances are must-sees, add comments, and listen to a researched full set before deciding.

The bundled snapshot contains 122 official artist entries, 113 billed acts, and 118 performances: 41 Friday, 36 Saturday, and 41 Sunday. Joint acts remain joint acts. An artist who appears only in a collaboration does not get an invented solo slot.

![Example priority board](./docs/screenshots/desktop.png)

### Built with

React · TypeScript · Vite · pnpm · Tailwind CSS · Radix UI · Motion · Zustand · Lucide · Biome

Tests use Vitest, React Testing Library, and Playwright. Exact dependency versions are pinned in package.json and pnpm-lock.yaml.

## Features

- Three day columns on desktop; a day selector on mobile.
- P0 Must-see, P1 High priority, P2 Medium priority, and P3 If time allows.
- An unprioritized starting state and a searchable catalog.
- Mouse/touch drag controls, plus an explicit priority selector for every appearance.
- Artist portraits, estimated genres, source references, and recommended full YouTube sets.
- Independent priorities and comments for repeated appearances.
- B2b previews and details show each artist’s genres, profile, and recommended recording.
- Recording ratings from 0 to 10, shared whenever the same video is recommended.
- English and Brazilian Portuguese, with English as the first-visit default.
- A consistent dark interface and dark image exports, with reduced-motion support.
- PNG, CSV, and Notion clipboard exports.
- Browser-local storage, with preservation of unreadable saves.

The supplied SVG is the canonical icon. Its geometry, colors, background, and shadow are unchanged.

## Local setup instructions

Use Node 24.16.0 and pnpm 11.25.0.

```sh
nvm use
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Vite prints the local URL, normally http://127.0.0.1:5173. No environment variables, database, or API keys are required.

### Commands

| Command              | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| pnpm dev             | Start the development server                         |
| pnpm lint            | Check application lint rules                         |
| pnpm format:check    | Check formatting                                     |
| pnpm format          | Apply formatting                                     |
| pnpm typecheck       | Check TypeScript types                               |
| pnpm test            | Run unit and component tests once                    |
| pnpm test:e2e        | Run desktop/mobile Chromium and WebKit tests         |
| pnpm build           | Type-check and build dist/                           |
| pnpm preview         | Serve the production bundle                          |
| pnpm icons           | Derive PNG icon sizes from the supplied SVG          |
| pnpm catalog:refresh | Refresh the official lineup while retaining curation |

Install browser binaries before the first end-to-end run:

```sh
pnpm exec playwright install chromium webkit
pnpm test:e2e
```

Linux CI also installs browser system dependencies with --with-deps. Tests use an isolated browser context and do not modify your saved plan.

## Architecture

- src/components: artist discovery, details, and accessible UI primitives.
- src/data: the bundled catalog, stable identity lookup, and search.
- src/store: Zustand state and the versioned browser storage lifecycle.
- src/i18n.ts: English and Brazilian Portuguese interface text and date formatting.
- src/utils: export selection, CSV escaping, Notion payloads, and canvas image rendering.
- scripts: icon generation and the repeatable official catalog refresh.
- e2e: browser workflows, downloads, keyboard access, and narrow-screen checks.

The deployed app reads bundled files only. Research and catalog refresh happen during development. It never calls an LLM or scrapes the festival site at runtime.

### Design references

The interface adapts [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) and [official Design Resources](https://developer.apple.com/design/resources/) for the web. It uses Radix web primitives, not official Apple components.

The system font stack uses the platform's installed typography. No Apple font files or SF Symbols are distributed. Lucide supplies interface glyphs. The supplied icon is used as-is.

Neutral surfaces, semantic priority colors, compact controls, and restrained shadows follow the native utility direction. Web color adaptations maintain readable contrast. Motion supports moves and feedback; prefers-reduced-motion removes decorative transitions. See [design notes](./docs/design.md).

### Personal Git identity

This checkout lives under /Users/helder.costa/Projects/other/. Directory-specific Git configuration uses Helder Costa and heldercostaaa@gmail.com. Personal SSH uses a separate key and ignores company SSH configuration. Company Git settings outside this directory remain unchanged.

Never commit private keys, tokens, or local credential files. Keep feature branches under helder/.

## Catalog research and refresh

The [official lineup](https://brasil.tomorrowland.com/pt/line-up/?page=artists) is the source for artist identities and performance days. The interactive component supplies data missing from the text-only page.

Read the [research notes](./docs/catalog-research.md) for source URLs, date conflicts, genre estimates, recording choices, and current gaps.

```sh
pnpm catalog:refresh
pnpm typecheck
pnpm test
pnpm build
```

Review every refresh diff. The script retains curation by stable IDs and does not touch browser preferences. Newly announced artists need manual genre and recording research. New source photos stay remote until downloaded and optimized.

### Known research limits

- Six catalog records have no supported genre estimate.
- MC STRETCH is a host, and Special Surprise Act is unidentified; neither has a verified artist-specific full set.
- Exact upload dates are known for 62 of 122 recordings. The other 60 remain blank after YouTube rate limiting.
- Seven joint-act recommendations use clearly identified representative member recordings.
- The source has no real stage names or timetable yet. Placeholder day labels and one-minute times are not displayed as actual stages or set times.
- Two source date fields conflict with the rendered official lineup. The snapshot follows the visible official grouping and documents both conflicts.
- Aline Rocha b2b Ratier's recording may require YouTube sign-in.

Genres are AI-assisted estimates. Electronic music styles overlap and evolve. Use these labels as subjective guides, not definitive classifications.

## Your saved plan

Preferences are stored under set.prio:brasil-2027:v1 in localStorage. Ratings use recording IDs; priorities and comments use appearance IDs. An empty rating is unrated, while zero is a valid rating. Legacy appearance preferences are ignored without changing saved priorities, comments, ratings, or language.

Catalog updates do not erase preferences for missing IDs. This preserves notes if an artist disappears and returns later.

Your browser and device each have their own plan. Clearing site data removes it. Nothing is synchronized to a server.

If a save cannot be parsed or has an unsupported schema, the original value is preserved under a key starting with set.prio:brasil-2027:v1:backup:. The app then opens a fresh plan and shows a notice. If backup fails, it leaves the original untouched and uses temporary state.

To recover a backup, inspect localStorage in browser developer tools, copy the backup value, repair its JSON and schema, and replace the active value. Keep the backup until recovery is confirmed.

## Exports

Exports include all prioritized appearances across all days. CSV and Notion expand b2bs into one row per artist, with the source billing identified in Name. Each row uses that artist’s recording, genres, and recording rating; the joint performance’s day, priority, and comment are shared. PNG exports keep the joint billing together. Search filters and the selected mobile day do not change their scope.

### Image

PNG rendering uses a dedicated canvas layout. It includes the supplied icon, event name, all three days, priorities, artist names, and credits. It does not capture the viewport or include private comments. Artist names wrap; portraits are excluded to avoid cross-origin canvas failures.

### CSV

The UTF-8 file includes a BOM and these columns:

Name, At, Day, Priority, Genre, Sub-genres, Rating, Comment

At contains the event label and the YouTube URL. Representative member recordings are labeled in the exported table. CSV cannot preserve a custom hyperlink label. Fields are quoted, embedded quotes and newlines are escaped, and formula-like text is neutralized with a leading apostrophe.

### Notion

Copy to Notion writes an HTML table with named event links and a plain-text alternative. If clipboard access fails, the app opens a selectable manual-copy table and offers CSV.

## Verification

The tests protect storage recovery, per-appearance priorities, shared recording scores, export protocols, official-day restrictions, mobile layouts, focus restoration, and clipboard/download behavior.

Chromium and WebKit mobile profiles are emulation, not physical-device testing. See [verification results](./docs/verification.md) for checks actually run and remaining limits.

![Mobile priority board](./docs/screenshots/mobile.png)

## Static deployment

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Publish the contents of dist/ to a static host. Use Node 24 and pnpm 11.25.0 for the build. There is no server application, secret configuration, or database to deploy.

For GitHub Pages, provide the repository subpath when building:

```sh
pnpm build --base=/set.prio/
```

Bundled assets resolve through Vite’s configured base path. The production preview runs locally on port 4173 unless another port is specified.

## Credits

Created by [Helder Costa](https://github.com/heldercostaa). Lineup and portrait sources are documented in the catalog research notes. This is an independent fan project.
