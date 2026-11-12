import type { Page } from '@playwright/test';

type ShareCapture = Window & { sharedImageFile?: File };
export async function captureImageShares(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        (window as ShareCapture).sharedImageFile = data.files?.[0];
      },
    });
  });
}
export async function readSharedImage(page: Page) {
  return page.evaluate(async () => {
    const file = (window as ShareCapture).sharedImageFile;
    if (!file) throw new Error('No image was passed to native sharing');
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      bytes: Array.from(new Uint8Array(await file.arrayBuffer())),
    };
  });
}
