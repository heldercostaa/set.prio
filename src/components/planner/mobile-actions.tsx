import { useEffect, useState } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { artistById } from '../../data';
import { dayName, priorityLabel } from '../../i18n';
import { usePlanner } from '../../store/planner';
import { PRIORITIES, type Appearance, type Language } from '../../types';
export function MobileActions({
  appearance,
  language,
  onClose,
}: {
  appearance: Appearance | null;
  language: Language;
  onClose: () => void;
}) {
  const [showTop, setShowTop] = useState(false);
  const setPriority = usePlanner((s) => s.setPriority);
  const en = language === 'en';
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > window.innerHeight * 0.75);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const artist = appearance ? artistById.get(appearance.artistId) : null;
  return (
    <aside className="fixed bottom-4 right-4 z-40 grid w-[min(20rem,calc(100vw_-_2rem))] grid-cols-1 pointer-events-none justify-items-end gap-2 pb-[env(safe-area-inset-bottom)] md:hidden">
      {appearance && artist && (
        <nav
          aria-label={en ? 'Quick priorities' : 'Prioridades rápidas'}
          className="w-full min-w-0 pointer-events-auto rounded-2xl border border-separator bg-surface p-3 shadow-xl"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold">{artist.name}</p>
              <p className="text-xs text-muted">{dayName(appearance.day, language)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={en ? 'Close quick priorities' : 'Fechar prioridades rápidas'}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((priority) => (
              <button
                type="button"
                key={priority}
                onClick={() => setPriority(appearance.id, priority)}
                aria-label={`${priority} ${priorityLabel(priority, language)}`}
                className="min-h-11 min-w-11 rounded-lg border border-separator bg-raised px-2 text-sm font-semibold"
              >
                {priority}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPriority(appearance.id, null)}
              aria-label={en ? 'Clear priority' : 'Limpar prioridade'}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-separator"
            >
              <X size={16} />
            </button>
          </div>
        </nav>
      )}
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
