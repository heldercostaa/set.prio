import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
const { Then } = createBdd(test);
Then('I can cancel resetting before deliberately erasing the plan', async ({ page }) => {
  await page.getByRole('button', { name: 'Reset plan', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Reset everything?', exact: true });
  await expect(dialog).toContainText('cannot be undone');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reset plan', exact: true }).click();
  await dialog.getByRole('button', { name: 'Reset everything', exact: true }).click();
  await expect(
    page
      .getByTestId('2027-04-30-unprioritized')
      .getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('set.priority:brasil-2027:v1') ?? '{}')
  );
  expect(saved.priorities ?? {}).toEqual({});
  expect(saved.ratings ?? {}).toEqual({});
  expect(saved.comments ?? {}).toEqual({});
});
