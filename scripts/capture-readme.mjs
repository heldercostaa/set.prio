import { readFile, mkdir } from 'node:fs/promises';
import { chromium, devices, expect } from '@playwright/test';
const catalog = JSON.parse(
  await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf8')
);
const fixture = JSON.parse(
  await readFile(new URL('../docs/fixtures/readme-plan.json', import.meta.url), 'utf8')
);
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const priorities = {};
for (const [day, groups] of Object.entries(fixture))
  for (const [priority, names] of Object.entries(groups))
    for (const name of names) {
      const artist = catalog.artists.find((a) => normalize(a.name) === normalize(name));
      const appearance = catalog.appearances.find(
        (a) => a.artistId === artist?.id && a.day === day
      );
      if (!appearance) throw new Error(`Missing screenshot appearance: ${name} / ${day}`);
      priorities[appearance.id] = priority;
    }
if (Object.keys(priorities).length !== 64)
  throw new Error('The supplied screenshot fixture must contain 64 appearances.');
const saved = {
  version: 1,
  language: 'en',
  activeDay: '2027-04-30',
  priorities,
  ratings: {},
  comments: {},
};
const baseURL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4173';
await mkdir(new URL('../docs/screenshots/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: 'reduce',
  });
  await desktop.addInitScript((saved) => {
    localStorage.setItem('set.prio:brasil-2027:v1', JSON.stringify(saved));
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
    localStorage.setItem('set.prio:brasil-2027:v1', JSON.stringify(saved));
  }, saved);
  const phone = await mobile.newPage();
  await phone.goto(baseURL);
  await expect(phone.locator('.plan-count')).toContainText('64');
  const frameBoard = () =>
    phone.evaluate(() => {
      const board = document.querySelector('.board-grid');
      if (!board) throw new Error('Missing priority board');
      scrollTo(0, board.getBoundingClientRect().top + scrollY);
    });
  await frameBoard();

  await phone.screenshot({
    path: 'docs/screenshots/readme-mobile-board.png',
    animations: 'disabled',
  });
  await phone.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await expect(phone.getByRole('dialog', { name: 'Fisher', exact: true })).toBeVisible();
  await phone
    .getByRole('spinbutton', { name: 'Rate this set', exact: true })
    .scrollIntoViewIfNeeded();
  await phone.screenshot({
    path: 'docs/screenshots/readme-mobile-details.png',
    animations: 'disabled',
  });
  await phone.getByRole('button', { name: 'Close', exact: true }).click();
  await phone.getByRole('button', { name: 'Saturday', exact: true }).click();
  const dismiss = phone.getByRole('button', { name: 'Hide drop zones', exact: true });
  if (await dismiss.isVisible()) await dismiss.click();
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
