import { mkdir, stat } from 'node:fs/promises';
import { chromium, devices, expect } from '@playwright/test';
import sharp from 'sharp';
import { readmePlan } from './readme-plan.mjs';

const baseURL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4173';
const output = new URL('../docs/demos/', import.meta.url);
await mkdir(output, { recursive: true });

async function prepare(browser, options) {
  const context = await browser.newContext({ ...options, deviceScaleFactor: 1 });
  await context.addInitScript((saved) => {
    localStorage.setItem('set.priority:brasil-2027:v1', JSON.stringify(saved));
  }, readmePlan);
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(baseURL);
  await expect(page.locator('.plan-count')).toContainText('64');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const marker = document.createElement('div');
    marker.id = 'recording-pointer';
    marker.setAttribute('aria-hidden', 'true');
    marker.style.cssText =
      'position:fixed;left:0;top:0;width:14px;height:14px;border:2px solid white;border-radius:50%;background:#1119;box-shadow:0 1px 4px #0008;transform:translate(-50%,-50%);pointer-events:none;z-index:2147483647;opacity:0';
    document.body.append(marker);
  });
  return { context, page };
}

function recorder(page, touch = false) {
  const frames = [];
  const delays = [];
  let position = { x: page.viewportSize().width - 32, y: 28 };
  const pointer = async (x, y, visible = true, pressed = false) => {
    await page.evaluate(
      ({ x, y, visible, pressed }) => {
        const marker = document.getElementById('recording-pointer');
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.style.opacity = visible ? '1' : '0';
        marker.style.background = pressed ? '#0a84ff' : '#1119';
        marker.style.transform = `translate(-50%,-50%) scale(${pressed ? 1.4 : 1})`;
      },
      { x, y, visible, pressed }
    );
  };
  const frame = async (delay = 100) => {
    frames.push(await page.screenshot({ type: 'png', scale: 'css' }));
    delays.push(delay);
  };
  const hold = async (delay = 800) => {
    await page.waitForTimeout(250);
    await frame(delay);
  };
  const move = async (x, y, steps = 7) => {
    const start = position;
    for (let step = 1; step <= steps; step++) {
      const point = {
        x: start.x + ((x - start.x) * step) / steps,
        y: start.y + ((y - start.y) * step) / steps,
      };
      await pointer(point.x, point.y, !touch);
      await page.mouse.move(point.x, point.y);
      await frame(80);
    }
    position = { x, y };
  };
  const center = async (locator) => {
    await locator.scrollIntoViewIfNeeded();
    const bounds = await locator.boundingBox();
    if (!bounds) throw new Error('Recording target is missing');
    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  };
  const click = async (locator) => {
    const point = await center(locator);
    if (touch) {
      await pointer(point.x, point.y, true, true);
      await frame(120);
      await page.touchscreen.tap(point.x, point.y);
      await pointer(point.x, point.y, false);
    } else {
      await move(point.x, point.y);
      await pointer(point.x, point.y, true, true);
      await frame(120);
      await locator.click();
      await pointer(point.x, point.y);
    }
  };
  return {
    frame,
    hold,
    click,
    async dismissMenu() {
      const point = await center(page.locator('h1'));
      await move(point.x, point.y);
      await page.mouse.click(point.x, point.y);
      await expect(page.getByRole('menu')).toHaveCount(0);
    },
    async drag(source, target) {
      const from = await center(source);
      await move(from.x, from.y);
      await page.mouse.down();
      await move(from.x + 10, from.y, 2);
      await expect(page.locator('.drag-overlay')).toBeVisible();
      const bounds = await target.boundingBox();
      if (!bounds) throw new Error('Recording drop target is missing');
      await move(bounds.x + bounds.width / 2, bounds.y + 20, 12);
      await hold(450);
      await page.mouse.up();
    },
    async swipeLeft(locator) {
      const target = await center(locator);
      const session = await page.context().newCDPSession(page);
      const from = { x: page.viewportSize().width - 48, y: target.y };
      await pointer(from.x, from.y, true, true);
      await frame(120);
      try {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ ...from, id: 1 }],
        });
        for (let step = 1; step <= 6; step++) {
          const point = { x: from.x - step * 36, y: from.y, id: 1 };
          await session.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [point],
          });
          await pointer(point.x, point.y, true, true);
          await frame(80);
        }
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await pointer(from.x - 216, from.y, false);
      } finally {
        await session.detach();
      }
    },
    async save(name) {
      const path = new URL(name, output);
      await sharp(frames, { join: { animated: true } })
        .gif({ loop: 0, delay: delays, colours: 128, dither: 0.5, effort: 7 })
        .toFile(path.pathname);
      const metadata = await sharp(path.pathname, { animated: true }).metadata();
      const bytes = (await stat(path)).size;
      if (metadata.pages < 2 || metadata.loop !== 0 || bytes > 5 * 1024 * 1024)
        throw new Error(`Invalid or oversized recording: ${name}`);
      console.log(
        `${name}: ${metadata.width}×${metadata.pageHeight}, ${metadata.pages} frames, ${
          metadata.delay.reduce((sum, delay) => sum + delay, 0) / 1000
        }s, ${(bytes / 1024 / 1024).toFixed(2)} MiB`
      );
    },
  };
}

const browser = await chromium.launch();
try {
  const { context, page } = await prepare(browser, { viewport: { width: 1200, height: 800 } });
  for (const toggle of await page.getByRole('button', { name: 'Unprioritized', exact: true }).all())
    await toggle.click();
  await page.getByRole('heading', { level: 1 }).click();
  await page.mouse.move(0, 0);
  console.log('Recording desktop board and drag');
  const desktop = recorder(page);
  await desktop.hold(1300);
  await desktop.drag(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true }),
    page.getByTestId('2027-04-30-P1')
  );
  await expect(
    page.getByTestId('2027-04-30-P1').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  await desktop.hold(700);
  await desktop.hold(500);
  console.log('Recording genre selection');
  await desktop.click(page.getByRole('button', { name: 'Genres', exact: true }));
  await desktop.hold(500);
  await desktop.click(page.getByRole('menuitemcheckbox', { name: 'House', exact: true }));
  await desktop.hold(700);
  await desktop.click(page.getByRole('menuitemcheckbox', { name: 'Tech house', exact: true }));
  await desktop.dismissMenu();
  await desktop.hold(1100);
  await desktop.click(page.getByRole('button', { name: 'Genres', exact: true }));
  await desktop.click(page.getByRole('menuitem', { name: 'Clear genres', exact: true }));
  await desktop.hold(500);
  console.log('Recording export menu');
  await desktop.click(page.getByRole('button', { name: 'Export plan', exact: true }));
  await expect(page.getByRole('menuitem', { name: /Export CSV/ })).toBeVisible();
  await desktop.hold(1500);
  await context.close();
  await desktop.save('priority-board.gif');

  const { context: mobile, page: phone } = await prepare(browser, {
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 720 },
  });
  console.log('Recording mobile artist details and ratings');
  const recording = recorder(phone, true);
  await recording.hold(1100);
  await recording.swipeLeft(phone.locator('.day-slot.active-day .day-heading'));
  await expect(phone.getByRole('button', { name: 'Saturday', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await recording.hold(1100);
  await recording.click(
    phone.getByRole('button', { name: 'Miss Monique · Saturday', exact: true })
  );
  await expect(phone.getByRole('dialog', { name: 'Miss Monique', exact: true })).toBeVisible();
  await recording.hold(1500);
  const rating = phone.getByRole('slider', { name: 'Rate this set', exact: true });
  await rating.scrollIntoViewIfNeeded();
  await recording.hold(600);
  await rating.press('Home');
  for (let step = 0; step < 17; step++) {
    await rating.press('ArrowRight');
    await recording.frame(80);
  }
  await recording.hold(1000);
  const priority = phone.getByRole('combobox', {
    name: 'Priority · Saturday · Miss Monique',
    exact: true,
  });
  await priority.scrollIntoViewIfNeeded();
  await recording.hold(500);
  await priority.selectOption('P1');
  await expect(priority).toHaveValue('P1');
  await recording.hold(1100);
  await recording.click(phone.getByRole('button', { name: 'Close', exact: true }));
  const watched = phone
    .getByTestId('2027-05-01-P1')
    .getByRole('button', { name: 'Miss Monique · Saturday', exact: true });
  await watched.scrollIntoViewIfNeeded();
  await expect(watched.getByRole('img', { name: 'Watched set', exact: true })).toBeVisible();
  await recording.hold(1600);
  await mobile.close();
  await recording.save('mobile-planner.gif');
} finally {
  await browser.close();
}
