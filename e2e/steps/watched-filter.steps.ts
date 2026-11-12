import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Then } = createBdd(test);
Then('watched filters follow recording ratings in the board and catalog', async ({ page }) => {
  const filter = page.getByRole('combobox', { name: 'Watched status', exact: true });
  const fisher = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  await page.getByRole('searchbox').fill('Fisher');
  await filter.selectOption('watched');
  await expect(fisher).toHaveCount(0);
  await filter.selectOption('unwatched');
  await fisher.click();
  await page
    .getByRole('slider', { name: 'Rate this set', exact: true })
    .click({ position: { x: 1, y: 22 } });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(fisher).toHaveCount(0);
  await filter.selectOption('watched');
  await expect(fisher).toBeVisible();
  await page.getByRole('button', { name: /^Artists/ }).click();
  const card = page.locator('.catalog-card').filter({ hasText: 'Fisher' });
  await expect(card).toHaveCount(1);
  await card.click();
  await page.getByRole('button', { name: 'Clear rating', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(card).toHaveCount(0);
  await filter.selectOption('unwatched');
  await expect(card).toHaveCount(1);
  await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Status de visualização' })).toHaveValue(
    'unwatched'
  );
});
