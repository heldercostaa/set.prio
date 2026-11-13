import { createBdd, test } from 'playwright-bdd';
import { workflows } from '../workflows';
const { Given, Then } = createBdd(test);
Given('an English planner at {int} pixels wide', async ({ page }, width: number) => {
  await page.setViewportSize({ width, height: 1600 });
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
});
Then('the planner supports {string}', async ({ page, context, isMobile }, name: string) => {
  const fixtures = { page, context, isMobile };
  const run = workflows[name];
  if (!run) throw new Error(`Unknown workflow ${name}`);
  await run(fixtures, test.info(), {});
});
Then(
  'I can inspect {string} without label movement',
  async ({ page, context, isMobile }, artist: string) => {
    const fixtures = { page, context, isMobile };
    await workflows['stationary labels and reachable recording links'](fixtures, test.info(), {
      artist,
      width: fixtures.page.viewportSize()?.width,
    });
  }
);
