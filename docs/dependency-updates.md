# Dependency updates

Checked the configured package registry on November 11, 2026. `pnpm outdated --format json` returned an empty object: every existing direct dependency already matched its latest release. `pnpm up --latest` confirmed the current versions.

Dependabot checks weekly for new production and development releases. Update to current APIs when packages introduce breaking changes; do not downgrade libraries to avoid migration work. Review the lockfile, run all checks, and commit the verified dependency resolution.

```sh
pnpm up --latest
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```
