# Dependency updates

Verified November 12, 2026 against the official Node release index, npm `latest` metadata for all 26 direct dependencies, and the four GitHub Actions release pages.

| Tool                    | Previous | Current stable |
| ----------------------- | -------- | -------------- |
| Node.js                 | 24.16.0  | 26.13.1        |
| pnpm                    | 11.25.0  | 12.18.0        |
| Biome                   | 2.6.6    | 2.6.7          |
| actions/checkout        | v6       | v7.0.1         |
| actions/setup-node      | v6       | v7.1.0         |
| actions/upload-artifact | v6       | v7.0.2         |
| pnpm/action-setup       | v5       | v6.1.1         |

The other 25 direct dependencies already match their latest stable releases. Vercel Analytics now uses an exact pin, matching the other libraries. The lockfile was refreshed with pnpm 12, including its package-manager resolution.

Node is pinned in `.nvmrc`; `package.json` defines the supported runtime and package-manager versions. CI reads those pins instead of maintaining a second pnpm version. Vercel supports Node 26 and pnpm 12; the Node engine range selects the deployment's major version.

pnpm 12 reads `saveExact` from `pnpm-workspace.yaml`, so the old `.npmrc` setting moved there. The update recorded version-specific release-age exceptions for Biome 2.6.7 and its platform binaries. Keep these exact exceptions for reproducible fresh installs while those releases are new.

Dependabot checks npm packages and GitHub Actions weekly. Review Node and pnpm releases when refreshing the toolchain, and update the Biome schema when updating Biome. Use current APIs when major library versions change.

```sh
pnpm up --latest --save-exact
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
```

Sources: [Node releases](https://nodejs.org/dist/index.json), [npm registry](https://registry.npmjs.org/), [pnpm 12](https://github.com/pnpm/pnpm/releases/tag/v12.18.0), [Biome](https://github.com/biomejs/biome/releases/tag/@biomejs%2Fbiome@2.6.7), [checkout](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node](https://github.com/actions/setup-node/releases/tag/v7.1.0), [upload-artifact](https://github.com/actions/upload-artifact/releases/tag/v7.0.2), [pnpm action](https://github.com/pnpm/action-setup/releases/tag/v6.1.1), [pnpm settings](https://pnpm.io/settings), [Vercel Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [Vercel package managers](https://vercel.com/docs/package-managers).
