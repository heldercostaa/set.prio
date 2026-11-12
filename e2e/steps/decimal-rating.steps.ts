import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { setSliderRating } from '../rating-input';
const { When, Then } = createBdd(test);
When("I score Fisher's recording eight and a half", async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  const rating = page.getByRole('slider', { name: 'Rate this set', exact: true });
  await setSliderRating(rating, 8.5);
  await expect(rating).toHaveAttribute('aria-valuenow', '8.5');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});
Then('the fractional recording score is restored after reloading', async ({ page }) => {
  await page.reload();
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  const rating = page.getByRole('slider', { name: 'Rate this set', exact: true });
  await expect(rating).toHaveAttribute('aria-valuenow', '8.5');
  await rating.press('ArrowRight');
  await expect(rating).toHaveAttribute('aria-valuenow', '9');
  await rating.press('ArrowLeft');
  await expect(rating).toHaveAttribute('aria-valuenow', '8.5');
});
When('I give Fisher the bonus score beyond ten', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Rate this set', exact: true });
  await setSliderRating(slider, 10);
  await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '11');
  await slider.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '10');
  await slider.press('ArrowRight');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});
Then('the bonus rating survives reload and appears on the board and CSV', async ({ page }) => {
  await page.reload();
  const fisher = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  await expect(fisher).toContainText('11/10');
  await fisher.click();
  await expect(page.getByRole('slider', { name: 'Rate this set', exact: true })).toHaveAttribute(
    'aria-valuenow',
    '11'
  );
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: /Export CSV/ }).click();
  const { readFile } = await import('node:fs/promises');
  const path = await (await downloaded).path();
  if (!path) throw new Error('CSV download unavailable');
  const csv = await readFile(path, 'utf8');
  expect(csv).toContain(',"11",');
  await fisher.click();
  await page.getByRole('button', { name: 'Clear rating', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(fisher).not.toContainText('11/10');
});
