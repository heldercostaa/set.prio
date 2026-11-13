import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { touch } from '../touch';
const { Then } = createBdd(test);

Then(
  'MC Stretch reveals the annual mystery without allowing a priority drag',
  async ({ page, isMobile }) => {
    await page.getByRole('searchbox').fill('MC STRETCH');
    const card = page.getByRole('button', { name: 'MC STRETCH · Friday', exact: true });
    const dialog = page.getByRole('dialog', { name: 'MC STRETCH', exact: true });
    await card.click();
    await expect(dialog.getByRole('img', { name: 'MC STRETCH', exact: true })).toBeVisible();
    await expect(dialog.getByText('United Kingdom', { exact: true })).toBeVisible();
    await expect(dialog.getByText('"Brothers and sisters..."', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('combobox')).toHaveCount(0);
    await expect(dialog.getByRole('textbox')).toHaveCount(0);
    await expect(dialog.getByRole('slider')).toHaveCount(0);
    await expect(dialog.getByText('Estimated genres', { exact: true })).toHaveCount(0);
    await expect(dialog.getByText(/^(Friday|Saturday|Sunday)$/)).toHaveCount(0);
    await expect(page.locator('.mc-stretch-notice')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(card).toBeFocused();

    const notice = page.locator('.mc-stretch-notice');
    if (!isMobile) {
      await card.hover();
      await expect(page.locator('.artist-preview')).toBeVisible();
      await expect(
        page.locator('.artist-preview').getByText('"Eeeehh, Oooohh"', { exact: true })
      ).toBeVisible();
      await expect(notice).toHaveCount(0);
    }
    await page.getByRole('searchbox').focus();
    await page.mouse.move(0, 0);
    await expect(notice).toBeHidden();

    await card.scrollIntoViewIfNeeded();
    const bounds = await card.boundingBox();
    if (!bounds) throw new Error('MC Stretch card is missing');
    const x = bounds.x + bounds.width / 2,
      y = bounds.y + bounds.height / 2;
    if (isMobile) {
      // Scrolling before the hold delay must not trigger the joke.
      await touch(card, 'touchstart', x, y);
      await touch(card, 'touchmove', x, y - 25);
      await touch(card, 'touchend', x, y - 25);
      await expect(page.locator('.mc-stretch-notice')).toHaveCount(0);
      await touch(card, 'touchstart', x, y);
      await expect(card).toHaveAttribute('aria-pressed', 'true');
      await touch(card, 'touchmove', x, y - 60);
    } else {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, y - 60, { steps: 10 });
    }
    await expect(
      notice.getByRole('heading', { name: 'What is this guy even doing here?', exact: true })
    ).toBeVisible();
    await expect(page.locator('.drag-overlay')).toHaveCount(0);
    await expect(
      page.getByRole('complementary', { name: 'Floating priority drop zones', exact: true })
    ).toBeHidden();
    await expect(dialog).toHaveCount(0);
    if (isMobile) await touch(card, 'touchend', x, y - 60);
    else await page.mouse.up();
    await expect
      .poll(() => card.evaluate((element) => Number(getComputedStyle(element).opacity)))
      .toBeGreaterThan(0);
    await expect(
      page
        .getByTestId('2027-04-30-unprioritized')
        .getByRole('button', { name: 'MC STRETCH · Friday', exact: true })
    ).toBeVisible();
    await expect(
      page
        .getByTestId('2027-04-30-P0')
        .getByRole('button', { name: 'MC STRETCH · Friday', exact: true })
    ).toHaveCount(0);

    // Start a separate mouse press after the drag's click-suppression window.
    await page.getByRole('button', { name: /^Artists/ }).click({ delay: 100 });
    await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
    const catalogCard = page.locator('.catalog-card').filter({ hasText: 'MC STRETCH' });
    await catalogCard.click();
    await expect(dialog.getByText('Reino Unido', { exact: true })).toBeVisible();
    await expect(dialog.getByText('"Brothers and sisters..."', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(catalogCard).toBeFocused();
    await page.getByRole('button', { name: 'Quadro', exact: true }).click();
    const portugueseCard = page.getByRole('button', {
      name: 'MC STRETCH · Sexta-feira',
      exact: true,
    });
    await portugueseCard.focus();
    await page.keyboard.press('Space');
    await expect(
      notice.getByRole('heading', { name: 'O que esse cara tá fazendo aqui?', exact: true })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
);
