import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import type { Language } from '../../types';
export function MobileActions({ language }: { language: Language }) {
  const [showTop, setShowTop] = useState(false);
  const en = language === 'en';
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > window.innerHeight * 0.1);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <aside className="fixed bottom-4 right-4 z-40 grid w-[min(20rem,calc(100vw_-_2rem))] grid-cols-1 pointer-events-none justify-items-end gap-2 pb-[env(safe-area-inset-bottom)]">
      {showTop && (
        <button
          type="button"
          aria-label={en ? 'Back to top' : 'Voltar ao topo'}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            })
          }
          className="pointer-events-auto inline-flex size-12 items-center justify-center rounded-full border border-separator bg-surface text-accent shadow-lg"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </aside>
  );
}
