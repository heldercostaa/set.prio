import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import type { Language } from '../../types';
export function MobileActions({ language }: { language: Language }) {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > window.innerHeight * 0.1);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <aside className="fixed bottom-4 right-4 z-40 grid w-[min(20rem,calc(100vw_-_2rem))] grid-cols-1 pointer-events-none justify-items-end gap-2 pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence initial={false}>
        {showTop && <BackToTop language={language} />}
      </AnimatePresence>
    </aside>
  );
}

function BackToTop({ language }: { language: Language }) {
  const reducedMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const en = language === 'en';
  return (
    <motion.button
      initial={{
        opacity: 0,
        y: reducedMotion ? '0rem' : '0.5rem',
        scale: reducedMotion ? 1 : 0.94,
      }}
      animate={{ opacity: 1, y: '0rem', scale: 1 }}
      exit={{ opacity: 0, y: reducedMotion ? '0rem' : '0.5rem', scale: reducedMotion ? 1 : 0.94 }}
      transition={{ duration: reducedMotion ? 0 : 0.16, ease: 'easeOut' }}
      whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      aria-hidden={!isPresent || undefined}
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
      tabIndex={isPresent ? 0 : -1}
      className={`${isPresent ? 'pointer-events-auto' : 'pointer-events-none'} inline-flex size-12 items-center justify-center rounded-full border border-separator bg-surface text-accent shadow-lg transition-colors duration-150 hover:bg-raised`}
    >
      <ArrowUp size={20} />
    </motion.button>
  );
}
