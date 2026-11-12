import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Given, When, Then, Before, After } = createBdd(test);
const errors = new WeakMap<object, string[]>();
Before(async ({ page }) => {
  errors.set(page, []);
  page.on('pageerror', (error) => errors.get(page)?.push(error.message));
});
After(async ({ page }) => {
  expect(errors.get(page), 'No uncaught browser errors').toEqual([]);
});
Given('an English planner with no saved priorities', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Your priority board', exact: true })
  ).toBeVisible();
});
When('I mark Fisher as a must-see, rate the set zero, and add a comment', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page
    .getByLabel('Your comment', { exact: true })
    .fill('Olá, friends\nSee you at the front.');
  await page.getByRole('spinbutton', { name: 'Rate this set', exact: true }).fill('0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
});
When('I switch to Brazilian Portuguese and reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
  await page.reload();
});
Then('my language, priority, zero rating, and multiline comment are restored', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Seu quadro de prioridades', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fisher · Sexta-feira', exact: true }).click();
  await expect(
    page.getByRole('combobox', { name: 'Prioridade · Sexta-feira · Fisher', exact: true })
  ).toHaveValue('P0');
  await expect(page.getByRole('spinbutton', { name: 'Avalie este set', exact: true })).toHaveValue(
    '0'
  );
  await expect(page.getByLabel('Seu comentário', { exact: true })).toHaveValue(
    'Olá, friends\nSee you at the front.'
  );
});
When('I clear Fisher’s priority using the explicit selector', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});
Then('Fisher returns to Friday’s unprioritized group', async ({ page }) => {
  await expect(
    page
      .getByTestId('2027-04-30-unprioritized')
      .getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toHaveCount(0);
});
