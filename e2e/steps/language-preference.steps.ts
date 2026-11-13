import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Given, Then } = createBdd(test);
const key = 'set.priority:brasil-2027:v1';
Given('a fresh planner with no saved preferences', async ({ page }) => {
  await page.goto('/');
});
Given('a saved plan with {word} language', async ({ page }, language: string) => {
  await page.addInitScript(
    ({ key, language }) => {
      const plan = {
        version: 1,
        priorities: { old: 'P1' },
        ratings: {},
        comments: { old: 'Keep' },
        ...(language === 'invalid' ? { language: 'invalid' } : {}),
      };
      localStorage.setItem(key, JSON.stringify(plan));
    },
    { key, language }
  );
  await page.goto('/');
});
Then('Portuguese is first and selected, and language choices survive reload', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Idioma', exact: true });
  await expect(group.getByRole('button')).toHaveText(['PT', 'EN']);
  await expect(group.getByRole('button', { name: 'Português (Brasil)' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').language, key)
  ).toBe('en');
  await page.reload();
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Português (Brasil)', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
});
Then('Portuguese is selected without losing the saved plan', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Português (Brasil)', exact: true })
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), key);
  expect(saved.priorities.old).toBe('P1');
  expect(saved.comments.old).toBe('Keep');
});
