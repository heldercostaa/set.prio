import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { When, Then } = createBdd(test);
When('I explore Australian artists and a multinational project', async ({ page }) => {
  await page.getByRole('button', { name: 'Countries', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /Australia/ }).click();
  await page.keyboard.press('Escape');
  const fisher = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  await expect(fisher.getByRole('img', { name: 'Fisher · Australia', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Axwell · Friday', exact: true })).toHaveCount(0);
  await fisher.click();
  await expect(page.getByRole('dialog').getByText('Australia', { exact: true })).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Countries', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /United Kingdom/ }).click();
  await page.keyboard.press('Escape');
  await expect(fisher).toBeVisible();
  await page.getByRole('button', { name: 'Massano b2b Volkoder · Friday', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog
      .getByRole('region', { name: 'Massano', exact: true })
      .getByText('United Kingdom', { exact: true })
  ).toBeVisible();
  await expect(
    dialog
      .getByRole('region', { name: 'Volkoder', exact: true })
      .getByText('Brazil', { exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Countries', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Clear countries', exact: true }).click();
  await page.getByRole('button', { name: /^Artists \d+/ }).click();
  await page.getByRole('button', { name: 'Countries', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /Russia/ }).click();
  await page.keyboard.press('Escape');
});
Then("countries filter both views and preserve each member's origin", async ({ page }) => {
  const halo = page.locator('.catalog-card').filter({ hasText: 'HALŌ' });
  await expect(halo).toBeVisible();
  await expect(page.locator('.catalog-card').filter({ hasText: 'Fisher' })).toHaveCount(0);
  await halo.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Third Party · United Kingdom', { exact: true })).toBeVisible();
  await expect(dialog.getByText('DubVision · Netherlands', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Matisse & Sadko · Russia', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  // Country filtering must not change the saved plan's export scope.
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: /Export CSV/ }).click();
  const path = await (await downloaded).path();
  if (!path) throw new Error('Missing CSV download');
  const { readFile } = await import('node:fs/promises');
  expect(await readFile(path, 'utf8')).toContain('"Fisher"');
  await page.getByRole('button', { name: 'Countries', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Clear countries', exact: true }).click();
  await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
  await page.getByRole('button', { name: 'Países', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /País desconhecido/ }).click();
  await page.keyboard.press('Escape');
  await expect(
    page.locator('.catalog-card').filter({ hasText: 'Symphony of Unity' }).first()
  ).toBeVisible();
  await expect(page.locator('.catalog-card').filter({ hasText: 'Fisher' })).toHaveCount(0);
});
