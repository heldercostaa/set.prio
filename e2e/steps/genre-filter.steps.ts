import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { When, Then } = createBdd(test);
When('I select House and Techno in the catalog genre filter', async ({ page }) => {
  await page.getByRole('button', { name: /^Artists \d+$/ }).click();
  await page.getByRole('button', { name: 'Genres', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'House', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Techno', exact: true }).click();
  await page.keyboard.press('Escape');
});
Then('artists from either genre remain visible and other genres are hidden', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Bhaskar/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Amber Broos/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ashibah/ })).toHaveCount(0);
});
When('I clear the genre selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Genres', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Clear genres', exact: true }).click();
});
Then('the full artist catalog is available again', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Ashibah/ })).toBeVisible();
});
