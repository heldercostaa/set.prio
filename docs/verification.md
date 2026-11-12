# Verification

Coverage audited November 12, 2026. Tests use Gherkin with playwright-bdd.

## Test ownership

`pnpm test` runs 14 contracts once: eight data/component cases and six browser-storage cases. Pure data cases do not launch browser pages. Keep these checks because browser smoke tests cannot independently prove CSV safety, HTML escaping, catalog integrity, or recovery of damaged saves.

`pnpm test:e2e` schedules 38 browser checks for 19 distinct scenarios:

| Profile          | Scope                                                                       | Checks |
| ---------------- | --------------------------------------------------------------------------- | ------ |
| Desktop Chromium | Complete browser suite                                                      | 19     |
| Desktop WebKit   | `@desktop`: hover and mouse interactions                                    | 5      |
| Pixel 7 Chromium | `@touch`: floating touch drop and scroll-to-top                             | 1      |
| iPhone 13 WebKit | Universal flows, excluding desktop-only and native Chromium clipboard cases | 13     |

Unsupported cases are excluded by tags rather than launched and skipped. New untagged scenarios run in desktop Chromium and mobile WebKit. This keeps common user flows in both engines without repeating the entire suite across every device.

## Cleanup decisions

| Previous coverage                                 | Remaining owner                                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Separate zero-rating and watched-state flows      | Bilingual plan restoration checks zero, watched status, and notes before/after reload                           |
| Separate Avoid and priority-clearing flows        | One lifecycle selects Avoid, reloads, and clears it on the official day                                         |
| Device/theme/language appearance matrix           | The 320px accessibility flow checks a light device and retired light preference against the dark-only interface |
| Small and full-board PNG downloads                | Full-board export retains PNG format, dimensions, dark background, and footer checks                            |
| Ten hover/viewport combinations                   | Three representative short, long joint-act, and long project labels across 1024px, 1280px, and 1440px           |
| Screenshot writes into documentation during tests | Explicit README capture scripts; generated export evidence attaches to test results                             |

The unsupported-version storage fixture now has valid priority/rating maps. Removing only the version guard makes that scenario fail at the recovery assertion; restoring it passes. The old fixture was also invalid for unrelated reasons.

CI runs checks for pull requests and pushes to main. Feature-branch pushes do not trigger a second identical PR run. Lint, formatting, type checking, contracts, production build, and the browser suite remain required.

## Limits

- Device profiles are emulation; physical iOS and Android devices were not tested.
- Local Chromium checks run on macOS. Linux CI supplies the complete WebKit verification because local WebKit pointer injection is unreliable in this environment.
- Native image sharing verifies the PNG passed to the browser API, not the operating system share sheet or saving to Photos.
- Actual paste into an authenticated Notion page remains untested. Clipboard HTML, named links, plain text, and manual-copy fallback are covered.
- Catalog integrity checks validate structure and references; they cannot verify that official lineup research is correct. See [research notes](./catalog-research.md).
