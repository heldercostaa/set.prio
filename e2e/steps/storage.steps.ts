import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Given, When, Then } = createBdd(test);
const key = 'set.prio:brasil-2027:v1';
const invalid: Record<string, string> = {
  'malformed JSON': '{broken json',
  'future version': JSON.stringify({
    version: 99,
    priorities: {},
    ratings: {},
    comments: { old: 'recover me' },
  }),
  'invalid rating': JSON.stringify({
    version: 1,
    priorities: { valid: 'P0' },
    comments: { old: 'recover me' },
    ratings: { video: 10.5 },
  }),
};
Given('a saved plan containing {string}', async ({ page }, kind: string) => {
  const raw = invalid[kind];
  if (!raw) throw new Error('Unknown invalid save');
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key, raw });
  await page.goto('/');
});
Given('an unreadable plan whose backup cannot be written', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, 'broken');
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  }, key);
  await page.goto('/');
});
Given('a browser that blocks reading saved preferences', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.goto('/');
});
Given('a plan containing appearances missing from the current catalog', async ({ page }) => {
  await page.addInitScript(
    (key) =>
      !localStorage.getItem(key) &&
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          language: 'en',
          activeDay: '2027-04-30',
          priorities: { 'retired-appearance': 'P1' },
          comments: { 'retired-appearance': 'Keep this after a lineup change' },
          ratings: { 'shared-video': 0 },
        })
      ),
    key
  );
  await page.goto('/');
});
When('I prioritize Fisher through artist details', async ({ page }) => {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});
Then(
  'the original {string} save remains recoverable alongside the new plan',
  async ({ page }, kind: string) => {
    await expect(page.getByRole('alert')).toContainText('preserved as a local backup');
    const saved = await page.evaluate(
      (key) => ({
        current: JSON.parse(localStorage.getItem(key) ?? '{}'),
        backups: Object.keys(localStorage)
          .filter((k) => k.startsWith(`${key}:backup:`))
          .map((k) => localStorage.getItem(k)),
      }),
      key
    );
    expect(saved.backups).toContain(invalid[kind]);
    expect(Object.values(saved.current.priorities)).toContain('P0');
  }
);
Then('the protected original is untouched while the temporary priority works', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('left untouched');
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe('broken');
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
});
Then('the storage warning allows temporary planning', async ({ page }) => {
  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable');
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
});
Then('catalog updates retain absent appearances and recording ratings', async ({ page }) => {
  await page.reload();
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), key);
  expect(saved.priorities['retired-appearance']).toBe('P1');
  expect(saved.comments['retired-appearance']).toBe('Keep this after a lineup change');
  expect(saved.ratings['shared-video']).toBe(0);
  expect(Object.values(saved.priorities)).toContain('P0');
});
