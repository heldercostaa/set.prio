import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { When, Then } = createBdd(test);
When(
  'the device uses {string} appearance with a saved light preference',
  async ({ page }, appearance: string) => {
    if (appearance !== 'light' && appearance !== 'dark') throw new Error('Unknown appearance');
    await page.emulateMedia({ colorScheme: appearance });
    await page.evaluate(() => localStorage.setItem('set.prio:appearance', 'light'));
    await page.reload();
  }
);
Then(
  'the planner stays dark without appearance controls and preserves my plan',
  async ({ page }) => {
    for (const language of ['en', 'pt-BR']) {
      if (language === 'pt-BR') {
        await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
      }
      await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
      await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(17, 17, 19)');
      await expect(page.getByRole('button', { name: /^(Light mode|Modo claro)$/ })).toHaveCount(0);
      await expect(
        page.getByTestId('2027-04-30-P0').getByRole('button', {
          name: language === 'en' ? 'Fisher · Friday' : 'Fisher · Sexta-feira',
          exact: true,
        })
      ).toBeVisible();
      await page.reload();
    }
  }
);
