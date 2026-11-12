import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Given, When, Then } = createBdd(test);
Given('a narrow English planner', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
});
When("I open Fisher's quick priority actions", async ({ page }) => {
  await page.getByRole('button', { name: 'Quick priority · Fisher · Friday', exact: true }).click();
});
When('I choose must-see from the floating controls', async ({ page }) => {
  await page
    .getByRole('navigation', { name: 'Quick priorities', exact: true })
    .getByRole('button', { name: 'P0 Must-see', exact: true })
    .click();
});
Then('Fisher is prioritized and the floating controls remain reachable', async ({ page }) => {
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Quick priorities', exact: true })
  ).toBeInViewport({ ratio: 1 });
});
When('I use the floating back-to-top button', async ({ page }) => {
  await page.getByRole('button', { name: 'Back to top', exact: true }).click();
});
Then('the planner returns to the top', async ({ page }) => {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
