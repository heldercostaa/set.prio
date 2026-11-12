import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { touch } from '../touch';
const { Then } = createBdd(test);
Then('artist details dismiss with a downward heading swipe', async ({ page }) => {
  const card = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await card.click();
  const dialog = page.getByRole('dialog', { name: 'Fisher', exact: true });
  const heading = dialog.locator('.modal-heading');
  await expect
    .poll(() =>
      dialog.evaluate((e) => e.getAnimations().filter((a) => a.playState === 'running').length)
    )
    .toBe(0);
  const origin = await dialog.evaluate((e) => e.getBoundingClientRect().y);
  await touch(heading, 'touchstart', 100, 100);
  await touch(heading, 'touchmove', 100, 130);
  await expect
    .poll(async () => await dialog.evaluate((e) => e.getBoundingClientRect().y))
    .toBeCloseTo(origin + 30, 0);
  expect(
    await page.locator('.modal-overlay').evaluate((e) => Number(getComputedStyle(e).opacity))
  ).toBeLessThan(1);
  await touch(heading, 'touchend', 100, 130);
  await expect
    .poll(async () => await dialog.evaluate((e) => e.getBoundingClientRect().y))
    .toBeCloseTo(origin, 0);
  await touch(heading, 'touchstart', 100, 100);
  await touch(heading, 'touchend', 190, 110);
  await expect(dialog).toBeVisible();
  await touch(heading, 'touchstart', 100, 100);
  await touch(heading, 'touchmove', 100, 210);
  await touch(heading, 'touchcancel', 100, 210);
  await expect
    .poll(async () => await dialog.evaluate((e) => e.getBoundingClientRect().y))
    .toBeCloseTo(origin, 0);
  await expect(dialog).toBeVisible();
  await touch(heading, 'touchstart', 100, 100);
  await touch(heading, 'touchmove', 100, 210);
  await touch(heading, 'touchend', 100, 210);
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await card.click();
  await touch(heading, 'touchstart', 100, 100);
  await touch(heading, 'touchend', 100, 210);
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
});
