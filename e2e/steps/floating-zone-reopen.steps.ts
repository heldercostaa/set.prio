import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { When, Then } = createBdd(test);
const zonesName = 'Floating priority drop zones';

When('I focus Fisher without hovering', async ({ page }) => {
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).focus();
});
When('I hover Fisher', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).hover();
});
When('I leave Fisher', async ({ page }) => {
  await page.mouse.move(0, 0);
});
When("I open and close Fisher's details", async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Fisher', exact: true })).toBeVisible();
  await expect(page.getByRole('complementary', { name: zonesName, exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Fisher · Friday', exact: true })).toBeFocused();
});
Then('floating priority targets are hidden', async ({ page }) => {
  await expect(page.getByRole('complementary', { name: zonesName, exact: true })).toBeHidden();
});
Then('floating priority targets show Fisher on Friday', async ({ page }) => {
  const zones = page.getByRole('complementary', { name: zonesName, exact: true });
  await expect(zones).toBeVisible();
  await expect(zones).toContainText('Fisher');
  await expect(zones).toContainText('Friday');
});
