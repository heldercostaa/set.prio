import { useDroppable } from '@dnd-kit/core';
import { X } from 'lucide-react';
import { artistById } from '../../data';
import { dayName, priorityLabel } from '../../i18n';
import type { Appearance, Language, Priority } from '../../types';
import { PRIORITIES } from '../../types';
function DropTarget({
  appearance,
  priority,
  language,
}: {
  appearance: Appearance;
  priority: Priority | null;
  language: Language;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `floating:${appearance.day}:${priority ?? 'none'}`,
    data: { day: appearance.day, priority },
  });
  const label = priority
    ? priority === 'P4'
      ? priorityLabel(priority, language)
      : priority
    : language === 'en'
      ? 'Clear'
      : 'Limpar';
  return (
    <fieldset
      ref={setNodeRef}
      aria-label={`${language === 'en' ? 'Drop into' : 'Soltar em'} ${label}`}
      data-testid={`floating-${priority ?? 'clear'}`}
      className={`flex min-h-14 min-w-14 items-center justify-center rounded-xl border px-3 text-sm font-semibold ${isOver ? 'border-accent bg-accent text-canvas' : 'border-separator bg-raised text-content'}`}
    >
      {label}
    </fieldset>
  );
}
export function FloatingPriorityTargets({
  appearance,
  language,
  onClose,
}: {
  appearance: Appearance | null;
  language: Language;
  onClose: () => void;
}) {
  if (!appearance?.day) return null;
  const artist = artistById.get(appearance.artistId);
  return (
    <aside
      aria-label={
        language === 'en' ? 'Floating priority drop zones' : 'Áreas flutuantes de prioridade'
      }
      className="pointer-events-none fixed bottom-20 right-4 z-50 w-[min(22rem,calc(100vw_-_2rem))] rounded-2xl border border-separator bg-surface/95 p-3 text-content shadow-xl backdrop-blur-xl pb-[max(.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="min-w-0 text-xs text-muted">
          <span className="block truncate font-semibold text-content">{artist?.name}</span>
          {dayName(appearance.day, language)}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={language === 'en' ? 'Hide drop zones' : 'Ocultar áreas'}
          className="pointer-events-auto flex size-11 items-center justify-center rounded-lg text-muted"
        >
          <X size="1rem" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[...PRIORITIES, null].map((priority) => (
          <DropTarget
            key={priority ?? 'none'}
            appearance={appearance}
            priority={priority}
            language={language}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        {language === 'en'
          ? 'Drag here to set a priority.'
          : 'Arraste até aqui para definir a prioridade.'}
      </p>
    </aside>
  );
}
