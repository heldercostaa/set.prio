import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Then } = createBdd(test);
Then('filter choices survive refresh and reset leaves my saved plan intact', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Genres', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'House', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Tech house', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Countries', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: /Australia/ }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('searchbox').fill('Fisher');
  await page
    .getByRole('combobox', { name: 'Watched status', exact: true })
    .selectOption('unwatched');
  await page
    .getByRole('combobox', { name: 'Sort artists', exact: true })
    .selectOption('rating-desc');
  await page.getByRole('button', { name: /^Artists/ }).click();
  const params = new URL(page.url()).searchParams;
  expect(params.get('q')).toBe('Fisher');
  expect(params.getAll('genre')).toEqual(['House', 'Tech house']);
  expect(params.getAll('country')).toEqual(['AU']);
  expect(params.get('watched')).toBe('unwatched');
  expect(params.get('sort')).toBe('rating-desc');
  expect(params.get('view')).toBe('artists');
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('Fisher');
  await expect(page.getByRole('combobox', { name: 'Watched status' })).toHaveValue('unwatched');
  await expect(page.getByRole('combobox', { name: 'Sort artists' })).toHaveValue('rating-desc');
  await expect(page.locator('.catalog-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Genres', exact: true }).click();
  await expect(page.getByRole('menuitemcheckbox', { name: 'House', exact: true })).toBeChecked();
  await expect(
    page.getByRole('menuitemcheckbox', { name: 'Tech house', exact: true })
  ).toBeChecked();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Countries', exact: true }).click();
  await expect(page.getByRole('menuitemcheckbox', { name: /Australia/ })).toBeChecked();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  expect(new URL(page.url()).search).toBe('?view=artists');
  await expect(page.getByRole('searchbox')).toBeFocused();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Watched status' })).toHaveValue('all');
  await expect(page.getByRole('combobox', { name: 'Sort artists' })).toHaveValue('name-asc');
  await expect(page.getByRole('button', { name: 'Reset filters', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Board', exact: true }).click();
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
});
Then(
  'shared filter links support browser history and the logo opens the unfiltered home',
  async ({ page }) => {
    await page.goto(
      '/?q=AL%C3%96K&genre=House&genre=House&genre=Invalid&country=XX&watched=invalid&sort=invalid&view=artists&ref=friend#main'
    );
    await expect(page.getByRole('searchbox')).toHaveValue('ALÖK');
    await expect(page.getByRole('combobox', { name: 'Watched status' })).toHaveValue('all');
    await expect(page.getByRole('combobox', { name: 'Sort artists' })).toHaveValue('name-asc');
    await expect(page.locator('.catalog-card')).toHaveCount(1);
    await page.getByRole('combobox', { name: 'Sort artists' }).selectOption('rating-desc');
    expect(new URL(page.url()).searchParams.getAll('genre')).toEqual(['House']);
    expect(new URL(page.url()).searchParams.getAll('country')).toEqual([]);
    expect(new URL(page.url()).searchParams.get('ref')).toBe('friend');
    expect(new URL(page.url()).hash).toBe('#main');
    await page.goBack();
    await expect(page.getByRole('combobox', { name: 'Sort artists' })).toHaveValue('name-asc');
    await page.goForward();
    await expect(page.getByRole('combobox', { name: 'Sort artists' })).toHaveValue('rating-desc');
    await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Limpar filtros', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'set.priority · Início', exact: true }).click();
    expect(new URL(page.url()).search).toBe('');
    expect(new URL(page.url()).hash).toBe('');
    await expect(page.getByRole('searchbox')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Quadro', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByRole('button', { name: 'Limpar filtros', exact: true })).toHaveCount(0);
  }
);
