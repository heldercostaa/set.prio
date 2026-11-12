import { createBdd, test } from 'playwright-bdd';
import { JSDOM } from 'jsdom';
import { contracts as exportContracts } from '../contracts/exports';
import { contracts as catalogContracts } from '../contracts/catalog';
import { contracts as recordingContracts } from '../contracts/recording';
const { Then } = createBdd(test);
const contracts: Record<string, () => void | Promise<void>> = {
  ...exportContracts,
  ...catalogContracts,
  ...recordingContracts,
};
// biome-ignore lint/correctness/noEmptyPattern: Playwright requires destructured fixtures; these contracts use no browser fixtures.
Then('the data contract {string} holds', async ({}, name: string) => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const key of ['window', 'document', 'HTMLElement', 'DOMParser', 'localStorage']) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value: dom.window[key as keyof typeof dom.window],
      configurable: true,
      writable: true,
    });
  }
  try {
    const run = contracts[name];
    if (!run) throw new Error(`Unknown contract: ${name}`);
    await run();
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    dom.window.close();
  }
});
