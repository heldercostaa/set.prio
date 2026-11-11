import { expect, test, type Page } from '@playwright/test';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

async function openFisher(page: Page) {
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Fisher', exact: true })).toBeVisible();
}
async function prioritizeFisher(page: Page) {
  await openFisher(page);
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
}
const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  runtimeErrors.set(page, []);
  page.on('pageerror', (error) => runtimeErrors.get(page)?.push(error.message));
  await page.goto('/');
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page), 'No uncaught browser errors').toEqual([]);
});

test('priorities, comments, zero ratings, and language survive a reload', async ({ page }) => {
  await openFisher(page);
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('P0');
  await page
    .getByLabel('Your comment', { exact: true })
    .fill('Olá, friends\nSee you at the front.');
  await page.getByRole('spinbutton', { name: 'Rate this set', exact: true }).fill('0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Seu quadro de prioridades', exact: true })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Fisher · Sexta-feira', exact: true }).click();
  await expect(
    page.getByRole('combobox', { name: 'Prioridade · Sexta-feira · Fisher', exact: true })
  ).toHaveValue('P0');
  await expect(page.getByRole('spinbutton', { name: 'Avalie este set', exact: true })).toHaveValue(
    '0'
  );
  await expect(page.getByLabel('Seu comentário', { exact: true })).toHaveValue(
    'Olá, friends\nSee you at the front.'
  );
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Fisher · Friday', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Priority · Friday · Fisher', exact: true })
    .selectOption('');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(
    page
      .getByTestId('2027-04-30-unprioritized')
      .getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
});

test('multiple appearances have independent priorities and export despite search and mobile day filters', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Symphony of Unity · Friday', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Symphony of Unity', exact: true });
  await dialog
    .getByRole('combobox', { name: 'Priority · Friday · Symphony of Unity', exact: true })
    .selectOption('P0');
  await dialog
    .getByRole('combobox', { name: 'Priority · Saturday · Symphony of Unity', exact: true })
    .selectOption('P2');
  await dialog.getByRole('spinbutton', { name: 'Rate this set', exact: true }).fill('7');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('searchbox').fill('Fisher');
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: /Export CSV/ }).click();
  const download = await downloadEvent;
  const csv = await readFile(await download.path(), 'utf8');
  expect(download.suggestedFilename()).toBe('set-prio-brasil-2027.csv');
  expect(csv).toContain('"Symphony of Unity"');
  expect(csv).toContain('"Friday","P0"');
  expect(csv).toContain('"Saturday","P2"');
  expect(csv).not.toContain('"Sunday","P');
  expect(csv.match(/"7"/g)).toHaveLength(2);
});

test('image export includes the whole board and clipboard failure offers a usable manual copy', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  );
  await page.reload();
  await prioritizeFisher(page);
  await page.getByRole('button', { name: 'Symphony of Unity · Friday', exact: true }).click();
  for (const [day, priority] of [
    ['Friday', 'P1'],
    ['Saturday', 'P2'],
    ['Sunday', 'P3'],
  ]) {
    await page
      .getByRole('combobox', { name: `Priority · ${day} · Symphony of Unity`, exact: true })
      .selectOption(priority);
  }
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  const jointAct = 'Smash The House Take Over: Dimitri Vegas b2b Lilly Palmer';
  await page.getByRole('button', { name: `${jointAct} · Friday`, exact: true }).click();
  await page
    .getByRole('combobox', { name: `Priority · Friday · ${jointAct}`, exact: true })
    .selectOption('P3');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  const event = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: /Download image/ }).click();
  const image = await event;
  const imageBytes = await readFile(await image.path());
  const metadata = await sharp(imageBytes).metadata();
  const background = await sharp(imageBytes)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer();
  expect([...background]).toEqual([17, 17, 19]);
  expect(metadata.width).toBe(2880);
  expect(metadata.height).toBeGreaterThan(1000);
  expect(metadata.format).toBe('png');
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  await page.getByRole('menuitem', { name: /Copy to Notion/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Copy your table manually', exact: true })
  ).toBeVisible();
  const text = page.getByRole('textbox', { name: 'Copy your table manually', exact: true });
  await expect(text).toHaveValue(
    /Name\tAt\tDay\tPriority\tGenre\tSub-genres\tRating\tComment\nFisher\tTomorrowland/
  );
  await page.getByRole('button', { name: 'Select table text', exact: true }).click();
  await expect(text).toBeFocused();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  if (testInfo.project.name === 'chromium' || testInfo.project.name === 'mobile-webkit') {
    await page.getByRole('heading', { name: 'Your priority board', exact: true }).click();
    await expect(page.locator('.artist-preview')).toHaveCount(0);
    await mkdir('docs/screenshots', { recursive: true });
    await expect(page.getByText('Your export is ready.', { exact: true })).toBeHidden({
      timeout: 7000,
    });
    if (testInfo.project.name === 'chromium')
      await copyFile(await image.path(), 'docs/screenshots/export.png');
    await page.screenshot({
      path: `docs/screenshots/${testInfo.project.name === 'chromium' ? 'desktop' : 'mobile'}.png`,
      fullPage: true,
    });
  }
});

test('mouse drag changes priorities only within the official day', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Touch has an explicit priority selector; mouse drag is a desktop contract.');
  await page.setViewportSize({ width: 1440, height: 1600 });
  const fisher = page.getByRole('button', { name: 'Fisher · Friday', exact: true });
  const drag = async (targetId: string) => {
    await expect(fisher).toHaveCount(1);
    const source = await fisher.boundingBox();
    const target = await page.getByTestId(targetId).boundingBox();
    if (!source || !target) throw new Error('Drag target missing');
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
    await page.mouse.down();
    await page.mouse.move(source.x + source.width / 2 + 14, source.y + source.height / 2, {
      steps: 3,
    });
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 18 });
    await page.mouse.up();
  };
  await drag('2027-04-30-P0');
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  await drag('2027-05-01-P1');
  await expect(
    page.getByTestId('2027-04-30-P0').getByRole('button', { name: 'Fisher · Friday', exact: true })
  ).toBeVisible();
  await expect(
    page.getByTestId('2027-05-01-P1').getByRole('button', { name: /Fisher/ })
  ).toHaveCount(0);
});

test('320px layout supports day selection, focus restoration, and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.getByRole('button', { name: 'Saturday', exact: true }).click();
  const card = page.getByRole('button', { name: 'Miss Monique · Saturday', exact: true });
  await card.click();
  await expect(page.getByRole('dialog', { name: 'Miss Monique', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(card).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(17, 17, 19)');
  await expect(page.getByRole('button', { name: 'Appearance', exact: true })).toHaveCount(0);
});

test('catalog finds accented artist names and preserves named recording links', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Artists 122', exact: true }).click();
  await page.getByRole('searchbox').fill('kolsch');
  const card = page.getByRole('button', { name: /Kölsch/ });
  await expect(card).toHaveCount(1);
  await card.click();
  await expect(page.getByRole('dialog', { name: 'Kölsch', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Tomorrowland Belgium/ }).last()).toHaveAttribute(
    'href',
    /^https:\/\/www.youtube.com\/watch\?v=/
  );
});

test('Chromium clipboard receives an HTML table with named set links', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'WebKit clipboard transport varies by platform; manual fallback is tested in every engine.'
  );
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await prioritizeFisher(page);
  await page.getByRole('button', { name: 'Export plan', exact: true }).click();
  await page.getByRole('menuitem', { name: /Copy to Notion/ }).click();
  await expect(
    page.getByText('Table copied. Paste it into Notion.', { exact: true })
  ).toBeVisible();
  const html = await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    const item = items.find((entry) => entry.types.includes('text/html'));
    return item ? (await item.getType('text/html')).text() : '';
  });
  expect(html).toContain('<table>');
  expect(html).toContain('>Tomorrowland Belgium 2026</a>');
  expect(html).toContain('https://www.youtube.com/watch?v=');
});

test('hover previews keep wrapped labels stationary and clickable', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Touch opens artist details directly.');
  test.setTimeout(60000);
  for (const width of [1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.reload();
    for (const name of [
      'Smash The House Take Over: Dimitri Vegas b2b Lilly Palmer',
      'Matisse & Sadko present Melodicca',
      'Bella Claxton b2b Paige Tomlinson',
    ]) {
      const label = page.getByRole('button', { name: `${name} · Friday`, exact: true });
      await label.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await label.hover();
      await expect(page.locator('.artist-preview')).toBeVisible();
      const samples = await label.evaluate(async (element) => {
        const values = [];
        for (let i = 0; i < 40; i++) {
          await new Promise(requestAnimationFrame);
          const { x, y, width, height } = element.getBoundingClientRect();
          values.push({ x, y, width, height });
        }
        return values;
      });
      for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(
          Math.max(...samples.map((s) => s[key])) - Math.min(...samples.map((s) => s[key])),
          `${name} ${key} at ${width}px`
        ).toBeLessThan(1);
      }
      for (const link of await page.locator('.artist-preview .set-link').all()) {
        await link.hover();
        await expect(link).toBeVisible();
      }
      await label.click();
      await expect(page.getByRole('dialog', { name, exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      await page.getByRole('heading', { name: 'Your priority board', exact: true }).click();
    }
  }
});

test('b2b details show both artists with independent recording ratings and one performance editor', async ({
  page,
  isMobile,
}, testInfo) => {
  const name = 'Massano b2b Volkoder';
  const label = page.getByRole('button', { name: `${name} · Friday`, exact: true });
  if (!isMobile) {
    await label.hover();
    const preview = page.locator('.artist-preview');
    await expect(preview.getByText(name, { exact: true })).toBeInViewport({ ratio: 1 });
    await expect(
      preview.getByRole('region', { name: 'Massano', exact: true }).getByRole('link')
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Myv0L3opWEI');
    await expect(
      preview.getByRole('region', { name: 'Volkoder', exact: true }).getByRole('link')
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=nSYt0B-EGwA');
    if (testInfo.project.name === 'chromium') {
      await preview
        .getByRole('img', { name: 'Massano', exact: true })
        .evaluate((image: HTMLImageElement) => image.decode());
      await preview.screenshot({ path: 'docs/screenshots/b2b-preview.png' });
    }
  }
  await label.click();
  const dialog = page.getByRole('dialog', { name, exact: true });
  const massano = dialog.getByRole('region', { name: 'Massano', exact: true });
  const volkoder = dialog.getByRole('region', { name: 'Volkoder', exact: true });
  await expect(massano.getByText('Progressive house', { exact: true })).toBeVisible();
  await expect(volkoder.getByText('House', { exact: true })).toBeVisible();
  await massano.getByRole('spinbutton', { name: 'Rate this set', exact: true }).fill('0');
  await volkoder.getByRole('spinbutton', { name: 'Rate this set', exact: true }).fill('8');
  await expect(massano.getByRole('spinbutton')).toHaveValue('0');
  await expect(dialog.getByRole('combobox')).toHaveCount(1);
  await dialog.getByRole('combobox').selectOption('P0');
  await dialog.getByLabel('Your comment', { exact: true }).fill('Together on Friday');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Português (Brasil)', exact: true }).click();
  await page.getByRole('button', { name: `${name} · Sexta-feira`, exact: true }).click();
  await expect(
    dialog.getByRole('heading', { name: 'Artistas desta apresentação', exact: true })
  ).toBeVisible();
  await expect(massano.getByRole('spinbutton')).toHaveValue('0');
  await expect(volkoder.getByRole('spinbutton')).toHaveValue('8');
  await expect(dialog.getByRole('combobox')).toHaveValue('P0');
  await expect(dialog.getByLabel('Seu comentário', { exact: true })).toHaveValue(
    'Together on Friday'
  );
});
