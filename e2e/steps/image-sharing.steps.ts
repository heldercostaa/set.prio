import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { captureImageShares, readSharedImage } from '../image-sharing';
const { Given, When, Then } = createBdd(test);
Given('this device supports sharing image files', async ({ page }) => {
  await captureImageShares(page);
});
When('I prepare and share my priority image', async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  if (isMobile) {
    await expect(page.getByRole('menuitem', { name: /Download image/ })).toHaveCount(0);
    await page.getByRole('menuitem', { name: /Share image/ }).click();
  } else {
    await page.getByRole('menuitem', { name: /Download image/ }).click();
    await expect(
      page.getByRole('dialog', { name: 'Save or share your image', exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Share image', exact: true }).click();
  }
});
Then('the native share request contains a valid PNG file', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const shared = await readSharedImage(page);
  expect(shared.name).toBe('set.priority-brasil-2027.png');
  expect(shared.type).toBe('image/png');
  expect(shared.bytes.slice(0, 8)).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(shared.size).toBeGreaterThan(1000);
  await expect(page.getByRole('button', { name: 'Export plan', exact: true })).toBeFocused();
});
