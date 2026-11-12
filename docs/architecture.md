# Architecture

- `src/app.tsx` composes the board, catalog, dialogs, and export actions.
- `src/components/planner/` owns planner features. `src/components/ui/` contains shared accessible web primitives and control styles.
- `src/data/` holds the versioned artist/appearance/recording catalog and lookup helpers. Recording identities are independent from appearances.
- `src/store/planner.ts` persists priorities and comments by appearance, and ratings by recording, in edition-specific localStorage. Invalid saves are backed up before replacement. Appearance preference has its own small browser-local key.
- `src/i18n.ts` supplies English and Brazilian Portuguese labels.
- `src/utils/exports.ts` collects the full prioritized plan and creates PNG, CSV, and Notion payloads.
- `features/` specifies behavior in Gherkin. `e2e/steps/` implements steps; `e2e/contracts/` owns static-catalog, recording-link, and export contracts.

The running application requires no backend or secret keys. Catalog research and image curation happen during development; static assets are bundled for deployment.
