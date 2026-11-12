import type { Locator } from '@playwright/test';

export async function touch(card: Locator, type: string, x: number, y: number) {
  return card.evaluate(
    (node, { type, x, y }) => {
      const point = { identifier: 1, clientX: x, clientY: y };
      const event = new TouchEvent(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: type === 'touchend' || type === 'touchcancel' ? [] : [point] },
        changedTouches: { value: [point] },
      });
      return node.dispatchEvent(event);
    },
    { type, x, y }
  );
}
