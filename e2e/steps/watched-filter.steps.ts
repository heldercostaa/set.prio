import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Then } = createBdd(test);
Then(
  'watched filters follow recording ratings in the board and catalog',
  async ({ page, isMobile }) => {
    const filter = page.getByRole('combobox', { name: 'Watched status', exact: true });
    const choose = async (value: 'watched' | 'unwatched') => {
      if (isMobile)
        await page
          .getByRole('group', { name: 'Watched status', exact: true })
          .getByRole('button', {
            name: value === 'watched' ? 'Watched' : 'Not watched yet',
            exact: true,
          })
          .click();
      else await filter.selectOption(value);
    };
    const fisher = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
    await page.getByRole('searchbox').fill('Fisher');
    await choose('watched');
    await expect(fisher).toHaveCount(0);
    await choose('unwatched');
    await fisher.click();
    await page
      .getByRole('slider', { name: 'Rate this set', exact: true })
      .click({ position: { x: 1, y: 22 } });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(fisher).toHaveCount(0);
    await choose('watched');
    await expect(fisher).toBeVisible();
    await page.getByRole('button', { name: /^Artists/ }).click();
    const card = page.locator('.catalog-card').filter({ hasText: 'Fisher' });
    await expect(card).toHaveCount(1);
    await card.click();
    await page.getByRole('button', { name: 'Clear rating', exact: true }).click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(card).toHaveCount(0);
    await choose('unwatched');
    await expect(card).toHaveCount(1);
    await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
    if (isMobile)
      await expect(
        page
          .getByRole('group', { name: 'Sets que você já viu' })
          .getByRole('button', { name: 'Ainda não vi', exact: true })
      ).toHaveAttribute('aria-pressed', 'true');
    else
      await expect(page.getByRole('combobox', { name: 'Sets que você já viu' })).toHaveValue(
        'unwatched'
      );
  }
);
