import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
const shared = { features: 'features/**/*.feature', steps: 'e2e/steps/**/*.ts' };
const testDir = defineBddConfig({
  ...shared,
  tags: 'not @contract',
  features: 'features/**/*.feature',
  steps: 'e2e/steps/**/*.ts',
  outputDir: '.features-gen/e2e',
});
const contracts = defineBddConfig({
  ...shared,
  tags: '@contract',
  outputDir: '.features-gen/contracts',
});
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
  ]
    .map((project) => ({ ...project, testDir, testMatch: '**/*.spec.js' }))
    .concat([
      {
        name: 'contracts',
        testDir: contracts,
        testMatch: '**/*.spec.js',
        use: { ...devices['Desktop Chrome'] },
      },
    ]),
  webServer: {
    command: 'pnpm dev --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
