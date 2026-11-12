import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Language } from '../../types';
const key = 'set.prio:appearance';
function initialAppearance(): 'dark' | 'light' {
  try {
    return localStorage.getItem(key) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}
export function AppearanceToggle({ language }: { language: Language }) {
  const [appearance, setAppearance] = useState(initialAppearance);
  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', appearance === 'light' ? '#f2f2f7' : '#111113');
    try {
      localStorage.setItem(key, appearance);
    } catch {
      /* Appearance remains usable without storage. */
    }
  }, [appearance]);
  const label = language === 'en' ? 'Light mode' : 'Modo claro';
  const Icon = appearance === 'dark' ? Sun : Moon;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={appearance === 'light'}
      title={label}
      onClick={() => setAppearance((a) => (a === 'dark' ? 'light' : 'dark'))}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-raised hover:text-content"
    >
      <Icon size="1.125rem" strokeWidth={1.75} />
    </button>
  );
}
