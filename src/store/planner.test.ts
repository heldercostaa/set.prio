import { beforeEach, describe, expect, it, vi } from 'vitest';
const key = 'set.prio:brasil-2027:v1';
beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  vi.resetModules();
});

describe('browser preference lifecycle', () => {
  it('rehydrates edits and retains IDs absent from a later catalog', async () => {
    const first = (await import('./planner')).usePlanner;
    first.getState().setPriority('retired-appearance', 'P1');
    first.getState().setComment('retired-appearance', 'Keep this after a lineup change');
    first.getState().setRating('shared-video', 0);
    first.getState().setRating('decimal-video', 8.5);
    first.getState().setLanguage('pt-BR');
    const saved = JSON.parse(localStorage.getItem(key) ?? '{}');
    localStorage.setItem(key, JSON.stringify({ ...saved, theme: 'light' }));
    vi.resetModules();
    const second = (await import('./planner')).usePlanner;
    expect(second.getState()).toMatchObject({
      language: 'pt-BR',
      priorities: { 'retired-appearance': 'P1' },
      comments: { 'retired-appearance': 'Keep this after a lineup change' },
      ratings: { 'shared-video': 0, 'decimal-video': 8.5 },
    });
    second.getState().setRating('shared-video', null);
    expect(JSON.parse(localStorage.getItem(key) ?? '{}').ratings['shared-video']).toBeNull();
  });
  it.each([
    '{broken json',
    JSON.stringify({ version: 99, comments: { old: 'recover me' } }),
    JSON.stringify({
      version: 1,
      priorities: { valid: 'P0' },
      comments: { old: 'recover me' },
      ratings: { video: 11 },
    }),
  ])('preserves an unsupported save before accepting new changes: %s', async (raw) => {
    localStorage.setItem(key, raw);
    const store = (await import('./planner')).usePlanner;
    expect(store.getState().storageError).toBe('recovered');
    const backup = Object.keys(localStorage).find((entry) => entry.startsWith(`${key}:backup:`));
    expect(backup).toBeDefined();
    expect(localStorage.getItem(backup ?? '')).toBe(raw);
    store.getState().setPriority('new', 'P0');
    expect(JSON.parse(localStorage.getItem(key) ?? '{}').priorities.new).toBe('P0');
    expect(localStorage.getItem(backup ?? '')).toBe(raw);
  });
  it('keeps the saved value untouched when backup storage fails', async () => {
    localStorage.setItem(key, 'broken');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const store = (await import('./planner')).usePlanner;
    expect(store.getState().storageError).toBe('protected');
    store.getState().setPriority('new', 'P0');
    expect(localStorage.getItem(key)).toBe('broken');
  });
  it('keeps planning usable when browser storage cannot be read', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    const store = (await import('./planner')).usePlanner;
    expect(store.getState().storageError).toBe('unavailable');
    expect(() => store.getState().setPriority('new', 'P3')).not.toThrow();
    expect(store.getState().priorities.new).toBe('P3');
  });
});
