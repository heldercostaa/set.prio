import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { catalog, membersFor } from '../../src/data';
import { STORAGE_KEY } from '../../src/store/planner';
import { readSharedImage } from '../image-sharing';
const { Then } = createBdd(test);

function expectSquarePng(bytes: number[]) {
  expect(bytes.slice(0, 8)).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  const header = new DataView(Uint8Array.from(bytes).buffer);
  expect(header.getUint32(16)).toBe(1080);
  expect(header.getUint32(20)).toBe(1080);
}

Then(
  "I can preview and share Fisher's zero score with the current priority setting",
  async ({ page }) => {
    const artist = catalog.artists.find((item) => item.name === 'Fisher');
    const recording = catalog.recordings.find((item) => item.id === artist?.recommendedSetId);
    if (!recording) throw new Error('Missing Fisher recording');
    await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
    const details = page.getByRole('dialog', { name: 'Fisher', exact: true });
    await expect(details.getByRole('button', { name: 'Share my rating', exact: true })).toHaveCount(
      0
    );
    await details.getByRole('slider', { name: 'Rate this set', exact: true }).press('Home');
    await details
      .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
      .selectOption('P0');
    await details.getByRole('button', { name: 'Share my rating', exact: true }).click();
    const preview = page.getByRole('dialog', { name: 'Share this set', exact: true });
    await expect(
      preview.getByRole('img', { name: 'My rating · Fisher · 0/10', exact: true })
    ).toBeVisible();
    await expect(
      preview.getByRole('checkbox', { name: 'Include my priority', exact: true })
    ).toBeChecked();
    await preview.getByRole('button', { name: 'Share image', exact: true }).click();
    const first = await readSharedImage(page);
    expectSquarePng(first.bytes);
    expect(first.name).toMatch(/^set\.priority-.+-rating\.png$/);
    expect(first.text).toContain('Fisher · 0/10');
    expect(first.text).toContain(recording.eventLabel);
    expect(first.text).toContain(recording.youtubeUrl);
    const previous = await preview.getByRole('img').getAttribute('src');
    await page.evaluate(() => {
      const target = window as Window & { resumeSetImage?: () => void };
      const encode = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function (...args) {
        HTMLCanvasElement.prototype.toBlob = encode;
        target.resumeSetImage = () => {
          delete target.resumeSetImage;
          encode.apply(this, args);
        };
      };
    });
    const priorityToggle = preview.getByRole('checkbox', {
      name: 'Include my priority',
      exact: true,
    });
    await priorityToggle.scrollIntoViewIfNeeded();
    const beforeUpdate = await preview.boundingBox();
    try {
      await priorityToggle.uncheck();
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              typeof (window as Window & { resumeSetImage?: () => void }).resumeSetImage ===
              'function'
          )
        )
        .toBe(true);
      await expect(preview.getByRole('img')).toBeVisible();
      await expect(preview.getByRole('img')).toHaveAttribute('src', previous ?? '');
      await expect(
        preview.getByRole('button', { name: 'Download image', exact: true })
      ).toBeDisabled();
      await expect(
        preview.getByRole('button', { name: 'Share image', exact: true })
      ).toBeDisabled();
      const updating = await preview.boundingBox();
      expect(updating?.height).toBe(beforeUpdate?.height);
    } finally {
      await page.evaluate(() =>
        (window as Window & { resumeSetImage?: () => void }).resumeSetImage?.()
      );
    }
    await expect(preview.getByRole('img')).not.toHaveAttribute('src', previous ?? '');
    await preview.getByRole('button', { name: 'Share image', exact: true }).click();
    const updated = await readSharedImage(page);
    expectSquarePng(updated.bytes);
    expect(updated.bytes).not.toEqual(first.bytes);
    await preview.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(
      details.getByRole('button', { name: 'Share my rating', exact: true })
    ).toBeFocused();
    await expect(details.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
    const note = 'Great set, especially the closing tracks.\nAn artist I want to see again.\n'
      .repeat(8)
      .slice(0, 280);
    const noteField = details.getByRole('textbox', {
      name: 'Notes about the set and artist',
      exact: true,
    });
    await noteField.fill(`${note} Extra text that exceeds the limit.`);
    await expect(noteField).toHaveValue(note);
    await expect(details.getByText('280 / 280', { exact: true })).toBeVisible();
    await details.getByRole('button', { name: 'Share my rating', exact: true }).click();
    await expect(preview.getByRole('img')).toBeVisible();
    await preview.getByRole('button', { name: 'Share image', exact: true }).click();
    const withNotes = await readSharedImage(page);
    expect(withNotes.text).toContain(note);
    const header = new DataView(Uint8Array.from(withNotes.bytes).buffer);
    expect(header.getUint32(16)).toBe(1080);
    expect(header.getUint32(20)).toBeGreaterThan(1080);
    expect(header.getUint32(20)).toBeLessThanOrEqual(1329);
    expect(withNotes.bytes).not.toEqual(first.bytes);
    await preview.getByRole('button', { name: 'Close', exact: true }).click();
    await noteField.fill('');
    await details
      .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
      .selectOption('');
    await details.getByRole('slider', { name: 'Rate this set', exact: true }).press('End');
    await details.getByRole('button', { name: 'Share my rating', exact: true }).click();
    await expect(
      preview.getByRole('img', { name: 'My rating · Fisher · 11/10', exact: true })
    ).toBeVisible();
    await expect(
      preview.getByRole('checkbox', { name: 'Include my priority', exact: true })
    ).toHaveCount(0);
    await preview.getByRole('button', { name: 'Share image', exact: true }).click();
    const eleven = await readSharedImage(page);
    expectSquarePng(eleven.bytes);
    expect(eleven.text).toContain('Fisher · 11/10');
    expect(eleven.text).not.toContain(note);
  }
);

Then('I can share joint and member ratings from their set details', async ({ page }) => {
  const artist = catalog.artists.find((item) => item.name === 'Ferry Corsten b2b Marsh');
  const appearance = catalog.appearances.find((item) => item.artistId === artist?.id);
  if (!artist?.recommendedSetId || !appearance?.day) throw new Error('Missing joint recording');
  const members = membersFor(artist);
  const ratings = Object.fromEntries(
    members.map((member, index) => [member.recommendedSetId, index ? 11 : 8.5])
  );
  ratings[artist.recommendedSetId] = 0;
  await page.evaluate(
    ({ key, ratings, day, appearanceId }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          language: 'en',
          activeDay: day,
          priorities: { [appearanceId]: 'P0' },
          ratings,
          comments: { [appearanceId]: 'Saved thoughts about this act' },
        })
      );
    },
    { key: STORAGE_KEY, ratings, day: appearance.day, appearanceId: appearance.id }
  );
  await page.reload();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined });
  });
  await expect(
    page.getByRole('button', { name: `Artist actions · ${artist.name}`, exact: true })
  ).toHaveCount(0);
  await page.getByRole('button', { name: `${artist.name} · Sunday`, exact: true }).click();
  const details = page.getByRole('dialog', { name: artist.name, exact: true });
  const joint = details.getByRole('region', { name: artist.name, exact: true });
  const notes = joint.getByRole('textbox', { name: 'Notes about the set and artist', exact: true });
  await expect(notes).toHaveValue('Saved thoughts about this act');
  await notes.fill('');
  await joint.getByRole('button', { name: 'Share my rating', exact: true }).click();
  const preview = page.getByRole('dialog', { name: 'Share this set', exact: true });
  await expect(
    preview.getByRole('img', { name: `My rating · ${artist.name} · 0/10`, exact: true })
  ).toBeVisible();
  await expect(preview.getByRole('button', { name: 'Share image', exact: true })).toHaveCount(0);
  const download = page.waitForEvent('download');
  await preview.getByRole('button', { name: 'Download image', exact: true }).click();
  const path = await (await download).path();
  if (!path) throw new Error('PNG download unavailable');
  const { readFile } = await import('node:fs/promises');
  expectSquarePng(Array.from(await readFile(path)));
  await preview.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(joint.getByRole('button', { name: 'Share my rating', exact: true })).toBeFocused();
  await joint.getByRole('button', { name: 'Clear rating', exact: true }).click();
  await details
    .getByRole('region', { name: members[1].name, exact: true })
    .getByRole('button', { name: 'Share my rating', exact: true })
    .click();
  await expect(
    preview.getByRole('img', { name: `My rating · ${members[1].name} · 11/10`, exact: true })
  ).toBeVisible();
});
