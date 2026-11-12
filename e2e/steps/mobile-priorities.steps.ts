import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Given, When, Then } = createBdd(test);
Given('a narrow English planner', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
});
When('I drag Fisher into the floating must-see zone', async ({ page, isMobile }) => {
  await expect(
    page.getByRole('complementary', { name: 'Floating priority drop zones', exact: true })
  ).toBeHidden();
  const card = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  await card.scrollIntoViewIfNeeded();
  const source = await card.boundingBox();
  if (!source) throw new Error('Missing drag source');
  const x = source.x + source.width / 2,
    y = source.y + source.height / 2;
  if (isMobile) {
    await card.evaluate(
      (node, { x, y }) => {
        const event = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
        Object.defineProperties(event, {
          touches: { value: [{ identifier: 1, clientX: x, clientY: y }] },
          changedTouches: { value: [{ identifier: 1, clientX: x, clientY: y }] },
        });
        node.dispatchEvent(event);
      },
      { x, y }
    );
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 10, y, { steps: 3 });
  }
  await expect(page.locator('.drag-overlay')).toBeVisible();
  const target = page.getByTestId('floating-P0');
  await expect(target).toBeInViewport({ ratio: 1 });
  const bounds = await target.boundingBox();
  if (!bounds) throw new Error('Missing drop target');
  const end = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  if (isMobile) {
    await card.evaluate((node, { x, y }) => {
      const event = new TouchEvent('touchmove', { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: [{ identifier: 1, clientX: x, clientY: y }] },
        changedTouches: { value: [{ identifier: 1, clientX: x, clientY: y }] },
      });
      node.dispatchEvent(event);
    }, end);
    await expect(target).toHaveAccessibleName('Release here · P0 · Must-see');
    await card.evaluate((node) => {
      const event = new TouchEvent('touchend', { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: [] },
        changedTouches: { value: [{ identifier: 1 }] },
      });
      node.dispatchEvent(event);
    });
  } else {
    await page.mouse.move(end.x, end.y, { steps: 12 });
    await expect(target).toHaveAccessibleName('Release here · P0 · Must-see');
    await page.mouse.up();
  }
});
Then('Fisher stays prioritized on the official day after the drop', async ({ page }) => {
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeAttached();
  await expect(
    page.getByRole('complementary', { name: 'Floating priority drop zones', exact: true })
  ).toBeHidden();
});
When('I use the floating back-to-top button', async ({ page }) => {
  await page.getByRole('button', { name: 'Back to top', exact: true }).click();
});
Then('the planner returns to the top', async ({ page }) => {
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});
