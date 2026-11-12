import { setSliderRating } from './rating-input';
import { captureImageShares, readSharedImage } from './image-sharing';
import { expect, type Page, type BrowserContext, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
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

async function downloadBoardImage(page: Page) {
  const preview = page.getByRole('dialog', { name: 'Save or share your image', exact: true });
  let downloaded = false;
  const event = page.waitForEvent('download').then((download) => {
    downloaded = true;
    return download;
  });
  await page.getByRole('menuitem', { name: /Download image/ }).click();
  await expect
    .poll(async () => downloaded || (await preview.isVisible()), { timeout: 20000 })
    .toBe(true);
  if (!downloaded) {
    await preview.getByRole('button', { name: 'Download image', exact: true }).click();
    const download = await event;
    await preview.getByRole('button', { name: 'Close', exact: true }).click();
    return download;
  }
  return event;
}

type Fixtures = {
  page: Page;
  context: BrowserContext;
  isMobile: boolean;
};
export const workflows: Record<
  string,
  (
    fixtures: Fixtures,
    testInfo: TestInfo,
    options: { width?: number; artist?: string }
  ) => Promise<void>
> = {
  'multiple appearances have independent priorities and export despite search and mobile day filters':
    async ({ page }) => {
      await page
        .getByRole('button', {
          name: 'Symphony of Unity · Friday',
          exact: true,
        })
        .click();
      const dialog = page.getByRole('dialog', {
        name: 'Symphony of Unity',
        exact: true,
      });
      await dialog
        .getByRole('combobox', {
          name: 'Priority · Friday · Symphony of Unity',
          exact: true,
        })
        .selectOption('P0');
      await dialog
        .getByRole('combobox', {
          name: 'Priority · Saturday · Symphony of Unity',
          exact: true,
        })
        .selectOption('P2');
      await setSliderRating(
        dialog.getByRole('slider', {
          name: 'Rate this set',
          exact: true,
        }),
        7
      );
      await dialog
        .getByRole('button', {
          name: 'Close',
          exact: true,
        })
        .click();
      await page.getByRole('searchbox').fill('Fisher');
      await page
        .getByRole('button', {
          name: 'Export plan',
          exact: true,
        })
        .click();
      const downloadEvent = page.waitForEvent('download');
      await page
        .getByRole('menuitem', {
          name: /Export CSV/,
        })
        .click();
      const download = await downloadEvent;
      const csv = await readFile(await download.path(), 'utf8');
      expect(download.suggestedFilename()).toBe('set-prio-brasil-2027.csv');
      expect(csv).toContain('"Symphony of Unity"');
      expect(csv).toContain('"Friday","P0"');
      expect(csv).toContain('"Saturday","P2"');
      expect(csv).not.toContain('"Sunday","P');
      expect(csv.match(/"7"/g)).toHaveLength(2);
    },
  'mouse drag changes priorities only within the official day': async ({ page }) => {
    const fisher = page.getByRole('button', {
      name: 'Fisher · Friday',
      exact: true,
    });
    const drag = async (targetId: string) => {
      await expect(fisher).toHaveCount(1);
      await fisher.click({
        trial: true,
      });
      const source = await fisher.boundingBox();
      if (!source) throw new Error('Drag source missing');
      await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
      await page.mouse.down();
      await page.mouse.move(source.x + source.width / 2 + 14, source.y + source.height / 2, {
        steps: 3,
      });
      await expect(page.locator('.drag-overlay')).toBeVisible();
      const destination = page.getByTestId(targetId);
      const target = await destination.boundingBox();
      if (!target) throw new Error('Drag target missing');
      await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, {
        steps: 18,
      });
      await expect(destination).toHaveClass(/drop-active/);
      await page.mouse.up();
    };
    await drag('2027-04-30-P0');
    await expect(
      page.getByTestId('2027-04-30-P0').getByRole('button', {
        name: 'Fisher · Friday',
        exact: true,
      })
    ).toBeVisible();
    await drag('2027-05-01-P1');
    await expect(
      page.getByTestId('2027-04-30-P0').getByRole('button', {
        name: 'Fisher · Friday',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByTestId('2027-05-01-P1').getByRole('button', {
        name: /Fisher/,
      })
    ).toHaveCount(0);
  },
  '320px layout supports day selection, focus restoration, and reduced motion': async ({
    page,
    isMobile,
  }) => {
    await page.setViewportSize({
      width: 320,
      height: 740,
    });
    await page.emulateMedia({
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    await page.evaluate(() => localStorage.setItem('set.prio:appearance', 'light'));
    await page.reload();
    await page
      .getByRole('button', {
        name: 'Saturday',
        exact: true,
      })
      .click();
    const card = page.getByRole('button', {
      name: 'Miss Monique · Saturday',
      exact: true,
    });
    if (isMobile) await card.tap();
    else await card.click();
    await expect(
      page.getByRole('dialog', {
        name: 'Miss Monique',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Close',
        exact: true,
      })
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(card).toBeFocused();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(17, 17, 19)');
    await expect(
      page.getByRole('button', {
        name: /^(Light mode|Modo claro)$/,
      })
    ).toHaveCount(0);
  },
  'catalog finds accented artist names and preserves named recording links': async ({ page }) => {
    await page
      .getByRole('button', {
        name: /^Artists \d+$/,
      })
      .click();
    await page.getByRole('searchbox').fill('kolsch');
    const card = page.getByRole('button', {
      name: /Kölsch/,
    });
    await expect(card).toHaveCount(1);
    await card.click();
    await expect(
      page.getByRole('dialog', {
        name: 'Kölsch',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page
        .getByRole('link', {
          name: /Tomorrowland Belgium/,
        })
        .last()
    ).toHaveAttribute('href', /^https:\/\/www.youtube.com\/watch\?v=/);
  },
  'Chromium clipboard receives an HTML table with named set links': async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await prioritizeFisher(page);
    await page
      .getByRole('button', {
        name: 'Export plan',
        exact: true,
      })
      .click();
    await page
      .getByRole('menuitem', {
        name: /Copy to Notion/,
      })
      .click();
    await expect(
      page.getByText('Table copied. Paste it into Notion.', {
        exact: true,
      })
    ).toBeVisible();
    const html = await page.evaluate(async () => {
      const items = await navigator.clipboard.read();
      const item = items.find((entry) => entry.types.includes('text/html'));
      return item ? (await item.getType('text/html')).text() : '';
    });
    expect(html).toContain('<table>');
    expect(html).toContain('>Tomorrowland Belgium 2026</a>');
    expect(html).toContain('https://www.youtube.com/watch?v=');
  },
  'stationary labels and reachable recording links': async ({ page }, _testInfo, options) => {
    const width = options.width ?? 1280;
    const name = options.artist ?? '';
    const label = page.getByRole('button', {
      name: `${name} · Friday`,
      exact: true,
    });
    await label.hover({ trial: true });
    const group = page.getByTestId('2027-04-30-unprioritized');
    const before = await group.getByRole('button').evaluateAll((elements) =>
      elements
        .filter((element) => element.hasAttribute('data-appearance-id'))
        .map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return { id: element.getAttribute('data-appearance-id'), x, y, width, height };
        })
    );
    await label.hover();
    const preview = page.locator('.artist-preview');
    await expect(
      preview.getByText(name, {
        exact: true,
      })
    ).toBeVisible();
    const grip = label.locator('.lucide-grip-vertical');
    await expect(grip).toBeVisible();
    const bounds = await label.boundingBox();
    const icon = await grip.boundingBox();
    if (!bounds || !icon) throw new Error('Missing artist card or drag cue');
    expect(Math.abs(icon.y + icon.height / 2 - bounds.y - bounds.height / 2)).toBeLessThan(1);
    const cue = await grip.evaluate((element) => {
      const button = element.closest('button');
      const rect = element.getBoundingClientRect();
      const y = rect.y + rect.height / 2;
      const hint = element.parentElement?.getBoundingClientRect();
      const neighbors =
        button?.closest('.artist-chips')?.querySelectorAll('button[data-appearance-id]') ?? [];
      const overlappingArtists = [...neighbors]
        .filter((neighbor) => {
          if (neighbor === button || !hint) return false;
          const other = neighbor.getBoundingClientRect();
          return (
            hint.left < other.right &&
            hint.right > other.left &&
            hint.top < other.bottom &&
            hint.bottom > other.top
          );
        })
        .map((neighbor) => neighbor.getAttribute('aria-label'));
      let opacity = 1;
      for (let node = element.parentElement; node && node !== button; node = node.parentElement)
        opacity *= Number(getComputedStyle(node).opacity);
      return {
        opacity,
        overlappingArtists,
        reachable: [rect.left + 1, rect.left + rect.width / 2, rect.right - 1].every((x) => {
          const hit = document.elementFromPoint(x, y);
          return hit !== null && button?.contains(hit);
        }),
      };
    });
    expect(cue.overlappingArtists, 'The hover surface must not cover another artist').toEqual([]);
    expect(cue.opacity, 'The drag icon is painted').toBeGreaterThan(0.95);
    expect(cue.reachable, 'The entire drag icon belongs to the artist hit area').toBe(true);
    const columnRight = await label.evaluate(
      (element) => element.closest('article')?.getBoundingClientRect().right ?? 0
    );
    expect(icon.x + icon.width).toBeLessThanOrEqual(columnRight);
    const after = await group.getByRole('button').evaluateAll((elements) =>
      elements
        .filter((element) => element.hasAttribute('data-appearance-id'))
        .map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return { id: element.getAttribute('data-appearance-id'), x, y, width, height };
        })
    );
    const activeId = await label.getAttribute('data-appearance-id');
    for (const original of before) {
      const current = after.find((element) => element.id === original.id);
      if (!current) throw new Error('Hover removed an artist card');
      expect(
        Math.abs(current.y - original.y),
        'Hover must not move cards to another row'
      ).toBeLessThan(1);
      if (original.id !== activeId) {
        for (const key of ['x', 'width', 'height'] as const)
          expect(
            Math.abs(current[key] - original[key]),
            `Neighbor ${key} stays unchanged`
          ).toBeLessThan(1);
      }
    }
    const samples = await label.evaluate(async (element) => {
      const values = [];
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 40));
        const { x, y, width, height } = element.getBoundingClientRect();
        values.push({
          x,
          y,
          width,
          height,
        });
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
    await expect(
      page.getByRole('dialog', {
        name,
        exact: true,
      })
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: 'Close',
        exact: true,
      })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(label).toBeFocused();
  },
  'b2b details show both artists with independent recording ratings and one performance editor':
    async ({ page, isMobile }) => {
      const name = 'Massano b2b Volkoder';
      const label = page.getByRole('button', {
        name: `${name} · Friday`,
        exact: true,
      });
      if (!isMobile) {
        await label.hover();
        const preview = page.locator('.artist-preview');
        await expect(
          preview.getByText(name, {
            exact: true,
          })
        ).toBeInViewport({
          ratio: 1,
        });
        await expect(
          preview
            .getByRole('region', {
              name: 'Massano',
              exact: true,
            })
            .getByRole('link')
        ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Myv0L3opWEI');
        await expect(
          preview
            .getByRole('region', {
              name: 'Volkoder',
              exact: true,
            })
            .getByRole('link')
        ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=nSYt0B-EGwA');
      }
      await label.click();
      const dialog = page.getByRole('dialog', {
        name,
        exact: true,
      });
      const massano = dialog.getByRole('region', {
        name: 'Massano',
        exact: true,
      });
      const volkoder = dialog.getByRole('region', {
        name: 'Volkoder',
        exact: true,
      });
      await expect(massano.locator('.genre-tag')).toHaveText('Melodic techno');
      await expect(volkoder.locator('.genre-tag')).toHaveText('Tech house');
      await massano
        .getByRole('slider', {
          name: 'Rate this set',
          exact: true,
        })
        .press('Home');
      await setSliderRating(
        volkoder.getByRole('slider', {
          name: 'Rate this set',
          exact: true,
        }),
        8
      );
      await expect(massano.getByRole('slider')).toHaveValue('0');
      await expect(dialog.getByRole('combobox')).toHaveCount(1);
      await dialog.getByRole('combobox').selectOption('P0');
      await dialog
        .getByLabel('Your comment', {
          exact: true,
        })
        .fill('Together on Friday');
      await dialog
        .getByRole('button', {
          name: 'Close',
          exact: true,
        })
        .click();
      await page.reload();
      await page
        .getByRole('button', {
          name: 'Português (Brasil)',
          exact: true,
        })
        .click();
      await page
        .getByRole('button', {
          name: `${name} · Sexta-feira`,
          exact: true,
        })
        .click();
      await expect(
        dialog.getByRole('heading', {
          name: 'Artistas desta apresentação',
          exact: true,
        })
      ).toBeVisible();
      await expect(massano.getByRole('slider')).toHaveValue('0');
      await expect(volkoder.getByRole('slider')).toHaveAttribute('aria-valuenow', '8');
      await expect(dialog.getByRole('combobox')).toHaveValue('P0');
      await expect(
        dialog.getByLabel('Seu comentário', {
          exact: true,
        })
      ).toHaveValue('Together on Friday');
    },
  'clipboard failure offers a usable manual copy': async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      })
    );
    await page.reload();
    await prioritizeFisher(page);
    await page
      .getByRole('button', {
        name: 'Export plan',
        exact: true,
      })
      .click();
    await page
      .getByRole('menuitem', {
        name: /Copy to Notion/,
      })
      .click();
    await expect(
      page.getByRole('dialog', {
        name: 'Copy your table manually',
        exact: true,
      })
    ).toBeVisible();
    const text = page.getByRole('textbox', {
      name: 'Copy your table manually',
      exact: true,
    });
    await expect(text).toHaveValue(
      /Name\tAt\tDay\tPriority\tGenre\tSub-genres\tRating\tComment\nFisher\tTomorrowland/
    );
    await page
      .getByRole('button', {
        name: 'Select table text',
        exact: true,
      })
      .click();
    await expect(text).toBeFocused();
    await page
      .getByRole('button', {
        name: 'Close',
        exact: true,
      })
      .click();
  },
  'a fully prioritized catalog exports all groups beyond the viewport': async (
    { page, isMobile },
    testInfo
  ) => {
    const catalog = JSON.parse(await readFile('src/data/catalog.json', 'utf8')) as {
      appearances: {
        id: string;
        day: string | null;
      }[];
    };
    const priorities = Object.fromEntries(
      catalog.appearances.map((a, index) => [a.id, `P${index % 4}`])
    );
    await page.evaluate(
      (priorities) =>
        localStorage.setItem(
          'set.prio:brasil-2027:v1',
          JSON.stringify({
            version: 1,
            language: 'en',
            activeDay: '2027-04-30',
            priorities,
            ratings: {},
            comments: {},
          })
        ),
      priorities
    );
    await page.reload();
    if (isMobile) await captureImageShares(page);
    await page.getByRole('searchbox').fill('no matching artist');
    await page
      .getByRole('button', {
        name: 'Export plan',
        exact: true,
      })
      .click();
    await expect(page.getByRole('menu')).toContainText(`${catalog.appearances.length}`);
    let bytes: Buffer;
    let filename: string;
    if (isMobile) {
      await page.getByRole('menuitem', { name: /Share image/ }).click();
      const shared = await readSharedImage(page);
      bytes = Buffer.from(shared.bytes);
      filename = shared.name;
    } else {
      const download = await downloadBoardImage(page);
      bytes = await readFile(await download.path());
      filename = download.suggestedFilename();
    }
    const metadata = await sharp(bytes).metadata();
    expect(metadata.width).toBe(2880);
    expect(metadata.height).toBeGreaterThan(2000);
    const footer = await sharp(bytes)
      .extract({
        left: 80,
        top: (metadata.height ?? 0) - 100,
        width: 1300,
        height: 50,
      })
      .removeAlpha()
      .stats();
    expect(
      footer.channels.some((channel) => channel.max > 150),
      'Credits remain inside the complete image'
    ).toBe(true);
    expect(metadata.format).toBe('png');
    expect(filename).toBe('set-prio-brasil-2027.png');
    const background = await sharp(bytes)
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .removeAlpha()
      .raw()
      .toBuffer();
    expect([...background]).toEqual([17, 17, 19]);
    await testInfo.attach('complete-board', { body: bytes, contentType: 'image/png' });
  },
};
