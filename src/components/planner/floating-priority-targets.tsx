import { useDroppable } from '@dnd-kit/core';
import { Undo2 } from 'lucide-react';
import { artistById } from '../../data';
import { dayName, messages, priorityHasCode, priorityLabel } from '../../i18n';
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
  const t = messages(language);
  const code = priority
    ? priorityHasCode(priority)
      ? priority
      : priorityLabel(priority, language)
    : t.clearPriority;
  const description = priority ? priorityLabel(priority, language) : null;
  const showDescription = priority !== null && (isOver || (description && description !== code));
  const name = priority && priorityHasCode(priority) ? `${code} · ${description}` : code;
  return (
    <fieldset
      ref={setNodeRef}
      aria-label={`${isOver ? t.releaseHere : t.dropInto} · ${name}`}
      data-testid={`floating-${priority ?? 'clear'}`}
      data-over={isOver}
      className={`${priority ? 'h-16' : 'h-11'} ${priority === 'P4' ? 'col-span-4' : priority ? 'col-span-2' : 'col-span-6'} flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed px-1 py-1 text-center [border-color:color-mix(in_srgb,var(--priority)_70%,transparent)] [background:color-mix(in_srgb,var(--priority)_8%,var(--panel))] [transition:background-color_0.12s,border-color_0.12s] data-[over=true]:[border-color:var(--priority)] data-[over=true]:[background:color-mix(in_srgb,var(--priority)_18%,var(--panel))] motion-reduce:transition-none ${priority ? `priority-${priority.toLowerCase()}` : '[--priority:var(--secondary)]'}`}
    >
      <span className="inline-flex min-h-4 items-center justify-center gap-1.5 text-xs font-semibold leading-4 [color:var(--priority)]">
        {!priority && <Undo2 size="0.875rem" aria-hidden="true" className="shrink-0" />}
        {code}
      </span>
      {showDescription && (
        <span className="flex min-h-3.5 items-center justify-center whitespace-nowrap text-xs leading-3.5 text-muted max-[22.5rem]:text-[0.6875rem]">
          {isOver ? t.releaseHere : description}
        </span>
      )}
    </fieldset>
  );
}
export function FloatingPriorityTargets({
  appearance,
  language,
}: {
  appearance: Appearance | null;
  language: Language;
}) {
  if (!appearance?.day) return null;
  const artist = artistById.get(appearance.artistId);
  const t = messages(language);
  return (
    <aside
      aria-label={t.floatingPriorities}
      aria-describedby="floating-priority-hint"
      className="pointer-events-none fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] right-4 z-50 w-[min(20rem,calc(100vw_-_2rem))] rounded-2xl border border-separator bg-surface/95 p-3 text-content shadow-xl backdrop-blur-xl motion-safe:[animation:overlay-in_0.12s_ease-out]"
    >
      <div className="mb-2.5 flex min-w-0 items-baseline justify-between gap-3 px-0.5 text-xs leading-4">
        <span className="truncate font-medium">{artist?.name}</span>
        <span className="shrink-0 text-muted">{dayName(appearance.day, language)}</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {[...PRIORITIES, null].map((priority) => (
          <DropTarget
            key={priority ?? 'none'}
            appearance={appearance}
            priority={priority}
            language={language}
          />
        ))}
      </div>
      <p id="floating-priority-hint" className="sr-only">
        {t.move}
      </p>
    </aside>
  );
}
