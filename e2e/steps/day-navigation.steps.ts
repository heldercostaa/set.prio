import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { touch } from '../touch';
const { When, Then } = createBdd(test);

When('I preview and cancel a partial day swipe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const board = page.locator('.board-grid');
  const origin = await board.evaluate((e) => e.getBoundingClientRect().x);
  await touch(board, 'touchstart', 160, 450);
  await touch(board, 'touchmove', 135, 450);
  await expect
    .poll(async () => await board.evaluate((e) => e.getBoundingClientRect().x))
    .toBeCloseTo(origin - 25, 0);
  await expect(page.getByRole('button', { name: 'Friday', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await touch(board, 'touchend', 135, 450);
  await expect
    .poll(async () => await board.evaluate((e) => e.getBoundingClientRect().x))
    .toBeCloseTo(origin, 0);
  await touch(board, 'touchstart', 160, 450);
  await touch(board, 'touchmove', 70, 450);
  await expect
    .poll(async () => await board.evaluate((e) => e.getBoundingClientRect().x))
    .toBeCloseTo(origin - 90, 0);
  await touch(board, 'touchcancel', 70, 450);
  await expect
    .poll(async () => await board.evaluate((e) => e.getBoundingClientRect().x))
    .toBeCloseTo(origin, 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
When('I swipe through the festival days and back', async ({ page }) => {
  const board = page.locator('.board-grid');
  for (const [direction, day] of [
    ['right', 'Friday'],
    ['left', 'Saturday'],
    ['left', 'Sunday'],
    ['left', 'Sunday'],
    ['right', 'Saturday'],
    ['right', 'Friday'],
  ]) {
    await touch(board, 'touchstart', 160, 450);
    await touch(board, 'touchmove', direction === 'left' ? 70 : 250, 450);
    await touch(board, 'touchend', direction === 'left' ? 70 : 250, 450);
    await expect(page.getByRole('button', { name: day, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  }
});
When('I make vertical, short, and cancelled gestures', async ({ page }) => {
  const board = page.locator('.board-grid');
  for (const [x, y, end] of [
    [160, 550, 'touchend'],
    [145, 450, 'touchend'],
    [70, 450, 'touchcancel'],
  ] as const) {
    await touch(board, 'touchstart', 160, 450);
    await touch(board, 'touchmove', x, y);
    await touch(board, end, x, y);
    await expect(page.getByRole('button', { name: 'Friday', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  }
});
When("I swipe left starting on Fisher's label", async ({ page }) => {
  const card = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  await card.scrollIntoViewIfNeeded();
  const bounds = await card.boundingBox();
  if (!bounds) throw new Error('Missing artist label');
  const x = bounds.x + bounds.width - 4,
    y = bounds.y + bounds.height / 2;
  await touch(card, 'touchstart', x, y);
  await touch(card, 'touchmove', x - 70, y);
  expect(
    await touch(card, 'touchend', x - 70, y),
    'A swipe suppresses the follow-up artist click'
  ).toBe(false);
});
When('I reload the planner', async ({ page }) => {
  await page.reload();
});
Then('{word} is selected', async ({ page }, day: string) => {
  await expect(page.getByRole('button', { name: day, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});
Then('artist details stay closed', async ({ page }) => {
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Export plan', exact: true })).toBeDisabled();
});
