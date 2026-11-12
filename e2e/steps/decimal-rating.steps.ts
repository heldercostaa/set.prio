import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { When, Then } = createBdd(test);
When("I score Fisher's recording eight and a half", async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  const rating = page.getByRole('spinbutton', { name: 'Rate this set', exact: true });
  await expect(rating).toHaveAttribute('inputmode', 'decimal');
  await rating.fill('8,5');
  await expect(rating).toHaveValue('8.5');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});
Then('the fractional recording score is restored after reloading', async ({ page }) => {
  await page.reload();
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Rate this set', exact: true })).toHaveValue(
    '8.5'
  );
  const rating = page.getByRole('spinbutton', { name: 'Rate this set', exact: true });
  await rating.press('ArrowUp');
  await expect(rating).toHaveValue('9.5');
  await rating.press('ArrowDown');
  await expect(rating).toHaveValue('8.5');
});
