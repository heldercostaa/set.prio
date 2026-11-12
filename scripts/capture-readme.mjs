import { mkdir } from 'node:fs/promises';
import { chromium, devices, expect } from '@playwright/test';
import { readmePlan as saved } from './readme-plan.mjs';
const baseURL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4173';
await mkdir(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: 'reduce',
  });
  await desktop.addInitScript((saved) => {
    localStorage.setItem('set.priority:brasil-2027:v1', JSON.stringify(saved));
  }, saved);
  const page = await desktop.newPage();
  await page.goto(baseURL);
  await expect(page.locator('.plan-count')).toContainText('64');
  for (const toggle of await page.getByRole('button', { name: 'Unprioritized', exact: true }).all())
    await toggle.click();
  await page.getByRole('heading', { name: 'Your priority board', exact: true }).click();
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: 'docs/screenshots/readme-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await desktop.close();
  const mobile = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  await mobile.addInitScript((saved) => {
    localStorage.setItem('set.priority:brasil-2027:v1', JSON.stringify(saved));
  }, saved);
  const phone = await mobile.newPage();
  await phone.goto(baseURL);
  await expect(phone.locator('.plan-count')).toContainText('64');
  const frameBoard = async () => {
    await phone.evaluate(() => {
      const board = document.querySelector('.board-grid');
      if (!board) throw new Error('Missing priority board');
      scrollTo(0, board.getBoundingClientRect().top + scrollY);
    });
    await phone.mouse.move(0, 0);
    await expect(
      phone.getByRole('complementary', { name: 'Floating priority drop zones', exact: true })
    ).toBeHidden();
  };
  await frameBoard();

  await phone.screenshot({
    path: 'docs/screenshots/readme-mobile-board.png',
    animations: 'disabled',
  });
  await phone.getByRole('button', { name: 'Fisher · Friday', exact: true }).tap();
  await expect(phone.getByRole('dialog', { name: 'Fisher', exact: true })).toBeVisible();
  await phone.getByRole('slider', { name: 'Rate this set', exact: true }).scrollIntoViewIfNeeded();
  await phone.screenshot({
    path: 'docs/screenshots/readme-mobile-details.png',
    animations: 'disabled',
  });
  await phone.getByRole('button', { name: 'Close', exact: true }).tap();
  await phone.getByRole('button', { name: 'Saturday', exact: true }).tap();
  await frameBoard();
  await phone.screenshot({
    path: 'docs/screenshots/readme-mobile-saturday.png',
    animations: 'disabled',
  });
  await mobile.close();
  console.log('Captured the supplied 64-appearance plan: desktop and three bounded mobile views.');
} finally {
  await browser.close();
}
