import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Given, When, Then, Before, After } = createBdd(test);
const errors = new WeakMap<object, string[]>();
Before({ tags: 'not @data' }, async ({ page }) => {
  errors.set(page, []);
  page.on('pageerror', (error) => errors.get(page)?.push(error.message));
});
After({ tags: 'not @data' }, async ({ page }) => {
  expect(errors.get(page), 'No uncaught browser errors').toEqual([]);
});
Given('an English planner with no saved priorities', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Choose the .priority of your Sets', exact: true })
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
  await page.getByRole('slider', { name: 'Rate this set', exact: true }).press('Home');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
});
When('I switch to Brazilian Portuguese and reload', async ({ page }) => {
  await expect(
    page
      .getByRole('button', { name: 'Fisher · Friday', exact: true })
      .getByRole('img', { name: 'Watched set', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
  await page.reload();
});
Then(
  'my language, priority, zero rating, watched status, and multiline comment are restored',
  async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Defina a .prioridade dos seus Sets', exact: true })
    ).toBeVisible();
    const fisher = page.getByRole('button', { name: 'Fisher · Sexta-feira', exact: true });
    await expect(fisher.getByRole('img', { name: 'Set assistido', exact: true })).toBeVisible();
    await fisher.click();
    await expect(
      page.getByRole('combobox', { name: 'Prioridade · Sexta-feira · Fisher', exact: true })
    ).toHaveValue('P0');
    await expect(
      page.getByRole('slider', { name: 'Dê uma nota para este set', exact: true })
    ).toHaveValue('0');
    await expect(page.getByLabel('Suas anotações', { exact: true })).toHaveValue(
      'Olá, friends\nSee you at the front.'
    );
  }
);
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
    page.getByTestId('2027-04-30-P4').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toHaveCount(0);
});

When('I mark Fisher as an artist to avoid', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P4');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});
Then('Fisher remains avoided on Friday after reloading', async ({ page }) => {
  await page.reload();
  const group = page.getByTestId('2027-04-30-P4');
  await expect(group.getByRole('heading', { name: 'I’ll skip', exact: true })).toBeVisible();
  await expect(group.getByRole('button', { name: 'Fisher · Friday', exact: true })).toBeVisible();
});
