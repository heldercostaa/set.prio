import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { catalog, membersFor } from '../../src/data';
import { STORAGE_KEY } from '../../src/store/planner';
const { Then } = createBdd(test);
Then(
  'a rated joint recording takes precedence over its members and clearing it restores their scores',
  async ({ page, isMobile }) => {
    const act = catalog.artists.find((artist) => artist.name === 'Ferry Corsten b2b Marsh');
    if (!act?.recommendedSetId) throw new Error('Missing joint recording');
    const members = membersFor(act);
    const appearance = catalog.appearances.find((item) => item.artistId === act.id);
    const firstSet = members[0]?.recommendedSetId;
    const secondSet = members[1]?.recommendedSetId;
    if (!appearance?.day || members.length !== 2 || !firstSet || !secondSet)
      throw new Error('Missing joint-act fixture');
    await page.evaluate(
      ({ key, ratings, day }) => {
        const saved = JSON.parse(localStorage.getItem(key) ?? '{}');
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            language: 'en',
            priorities: {},
            comments: {},
            ...saved,
            ratings,
            activeDay: day,
          })
        );
      },
      {
        key: STORAGE_KEY,
        day: appearance.day,
        ratings: {
          [act.recommendedSetId]: 0,
          [firstSet]: 9,
          [secondSet]: 11,
        },
      }
    );
    await page.reload();
    const chip = page.getByRole('button', { name: `${act.name} · Sunday`, exact: true });
    await expect(chip.getByText('0', { exact: true })).toBeVisible();
    await expect(chip.getByText('9', { exact: true })).toHaveCount(0);
    await expect(chip.getByText('11/10', { exact: true })).toHaveCount(0);
    await expect(chip).not.toHaveAttribute('data-exceptional', 'true');
    await page.getByRole('button', { name: /^Artists/ }).click();
    const jointCard = page.locator(`[data-artist-id="${act.id}"]`);
    await expect(jointCard.getByText('0/10', { exact: true })).toBeVisible();
    await expect(jointCard.getByText('9/10', { exact: true })).toHaveCount(0);
    await page
      .getByRole('combobox', { name: 'Sort artists', exact: true })
      .selectOption('rating-asc');
    await expect(page.locator('.catalog-card').first()).toHaveAttribute('data-artist-id', act.id);
    await page.getByRole('button', { name: /^Board/ }).click();
    if (!isMobile) {
      await chip.hover();
      const links = page.locator('.artist-preview .set-link');
      await expect(links.first()).toHaveAttribute(
        'href',
        `https://www.youtube.com/watch?v=${act.recommendedSetId}`
      );
    }
    await chip.click();
    const dialog = page.getByRole('dialog', { name: act.name, exact: true });
    const joint = dialog.getByRole('region', { name: act.name, exact: true });
    const links = dialog.locator('.set-link');
    await expect(links.first()).toHaveAttribute(
      'href',
      `https://www.youtube.com/watch?v=${act.recommendedSetId}`
    );
    const jointBox = await links.first().boundingBox();
    const memberBox = await links.nth(1).boundingBox();
    if (!jointBox || !memberBox) throw new Error('Recording cards are not visible');
    expect(jointBox.height).toBeGreaterThan(memberBox.height);
    await expect(dialog.getByRole('slider')).toHaveCount(1);
    await expect(joint.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
    await joint.getByRole('button', { name: 'Clear rating', exact: true }).click();
    await expect(dialog.getByRole('slider')).toHaveCount(3);
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(chip.getByText('9', { exact: true })).toBeVisible();
    await expect(chip.getByText('11/10', { exact: true })).toBeVisible();
    await expect(chip).toHaveAttribute('data-exceptional', 'true');
    await page.getByRole('button', { name: /^Artists/ }).click();
    const card = page.locator(`[data-artist-id="${act.id}"]`);
    await expect(card.getByText('9/10', { exact: true })).toBeVisible();
    await expect(card.getByText('11/10', { exact: true })).toBeVisible();
  }
);
