import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { When, Then } = createBdd(test);
When('I mark Fisher as an artist to avoid', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P4');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});
Then('Fisher remains avoided on Friday after reloading', async ({ page }) => {
  await page.reload();
  const group = page.getByTestId('2027-04-30-P4');
  await expect(group.getByRole('heading', { name: /P4.*Avoid/ })).toBeVisible();
  await expect(group.getByRole('button', { name: 'Fisher · Friday', exact: true })).toBeVisible();
});
