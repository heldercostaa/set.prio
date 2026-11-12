import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Then } = createBdd(test);
Then("Fisher's label indicates a watched recording", async ({ page }) => {
  const label = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  await expect(label.getByRole('img', { name: 'Watched set', exact: true })).toBeVisible();
  await page.reload();
  await expect(label.getByRole('img', { name: 'Watched set', exact: true })).toBeVisible();
});
