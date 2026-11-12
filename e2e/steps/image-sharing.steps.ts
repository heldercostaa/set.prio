import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Given, When, Then } = createBdd(test);
Given('this device supports sharing image files', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        const file = data.files?.[0];
        (window as unknown as { sharedImage: unknown }).sharedImage = file
          ? {
              name: file.name,
              type: file.type,
              bytes: Array.from(new Uint8Array(await file.arrayBuffer()).slice(0, 8)),
              size: file.size,
            }
          : null;
      },
    });
  });
});
When('I prepare and share my priority image', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  await page.getByRole('menuitem', { name: /Download image/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Save or share your image', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Share image', exact: true }).click();
});
Then('the native share request contains a valid PNG file', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const shared = await page.evaluate(
    () =>
      (
        window as unknown as {
          sharedImage: { name: string; type: string; bytes: number[]; size: number };
        }
      ).sharedImage
  );
  expect(shared.name).toBe('set-prio-brasil-2027.png');
  expect(shared.type).toBe('image/png');
  expect(shared.bytes).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(shared.size).toBeGreaterThan(1000);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
