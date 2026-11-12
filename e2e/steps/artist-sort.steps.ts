import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { catalog } from '../../src/data';
import { STORAGE_KEY } from '../../src/store/planner';
const { Then } = createBdd(test);
Then(
  'I can sort both views while keeping unrated artists last and priority groups intact',
  async ({ page }) => {
    const fisher = catalog.artists.find((a) => a.name === 'Fisher');
    const axwell = catalog.artists.find((a) => a.name === 'Axwell');
    if (!fisher?.recommendedSetId || !axwell?.recommendedSetId)
      throw new Error('Missing rated artists');
    await page.evaluate(
      ({ key, ratings }) => {
        const saved = JSON.parse(localStorage.getItem(key) ?? '{}');
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            language: 'en',
            activeDay: '2027-04-30',
            priorities: {},
            comments: {},
            ...saved,
            ratings,
          })
        );
      },
      { key: STORAGE_KEY, ratings: { [fisher.recommendedSetId]: 9, [axwell.recommendedSetId]: 0 } }
    );
    await page.reload();
    const sort = page.getByRole('combobox', { name: 'Sort artists', exact: true });
    const group = page.getByTestId('2027-04-30-unprioritized');
    const chips = group.locator('.artist-chip');
    await sort.selectOption('rating-desc');
    await expect(chips.nth(0)).toHaveAttribute('aria-label', 'Fisher · Friday');
    await expect(chips.nth(1)).toHaveAttribute('aria-label', 'Axwell · Friday');
    await sort.selectOption('rating-asc');
    await expect(chips.nth(0)).toHaveAttribute('aria-label', 'Axwell · Friday');
    await expect(chips.nth(1)).toHaveAttribute('aria-label', 'Fisher · Friday');
    await expect(page.getByTestId('2027-04-30-P0').locator('.artist-chip')).toHaveCount(0);
    await sort.selectOption('name-asc');
    const ascending = await chips.evaluateAll((els) =>
      els.map((el) => el.getAttribute('aria-label'))
    );
    await sort.selectOption('name-desc');
    expect(
      await chips.evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')))
    ).toEqual(ascending.reverse());
    await page.getByRole('button', { name: /^Artists/ }).click();
    const cards = page.locator('.catalog-card');
    await sort.selectOption('rating-desc');
    await expect(cards.nth(0)).toHaveAttribute('data-artist-id', fisher.id);
    await expect(cards.nth(1)).toHaveAttribute('data-artist-id', axwell.id);
    await sort.selectOption('rating-asc');
    await expect(cards.nth(0)).toHaveAttribute('data-artist-id', axwell.id);
    await expect(cards.nth(1)).toHaveAttribute('data-artist-id', fisher.id);
    await sort.selectOption('genre');
    const firstGenre = await cards.nth(0).textContent();
    expect(firstGenre).toContain('Afro house');
    await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Ordenar artistas', exact: true })).toHaveValue(
      'genre'
    );
  }
);
