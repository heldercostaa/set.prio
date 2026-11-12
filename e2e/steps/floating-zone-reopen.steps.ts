import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Then } = createBdd(test);
Then("I can dismiss and reopen Fisher's floating drop zones", async ({ page }) => {
  const card = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  const zones = page.getByRole('complementary', {
    name: 'Floating priority drop zones',
    exact: true,
  });
  await card.hover();
  await expect(zones).toBeVisible();
  await page.getByRole('button', { name: 'Hide drop zones', exact: true }).click();
  await expect(zones).toBeHidden();
  await card.hover();
  await expect(zones).toBeVisible();
});
