import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Then } = createBdd(test);
Then('I can switch between light and dark appearances and keep my choice', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Light mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  const avoidContrast = await page.getByTestId('2027-04-30-P4').evaluate((group) => {
    const luminance = (value: string) => {
      const rgb = (value.match(/\d+(?:\.\d+)?/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const c = channel / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    const heading = group.querySelector('h3');
    const column = group.closest('article');
    if (!heading || !column) throw new Error('Missing rendered Avoid heading or day column');
    const foreground = luminance(getComputedStyle(heading).color);
    const background = luminance(getComputedStyle(column).backgroundColor);
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(avoidContrast, 'Avoid label remains readable in light mode').toBeGreaterThanOrEqual(4.5);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Light mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
