import { useDroppable } from '@dnd-kit/core';
import { CalendarDays, ChevronDown, Flame, Sparkles, Zap } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ArtistChip } from '../../components/artist';
import { artistById, catalog, matchesSearch } from '../../data';
import { dayName, messages, priorityLabel, shortDate } from '../../i18n';
import { usePlanner } from '../../store/planner';
import { PRIORITIES, type Appearance, type Day, type Language, type Priority } from '../../types';

function PriorityGroup({
  day,
  priority,
  appearances,
  language,
  onOpen,
  onQuick,
}: {
  day: Day | null;
  priority: Priority | null;
  appearances: Appearance[];
  language: Language;
  onOpen: (id: string) => void;
  onQuick?: (id: string) => void;
}) {
  const t = messages(language);
  const { setNodeRef, isOver } = useDroppable({
    id: `${day ?? 'tba'}:${priority ?? 'none'}`,
    data: { day, priority },
  });
  const [expanded, setExpanded] = useState(true);
  const label = priority ? priorityLabel(priority, language) : t.unprioritized;
  return (
    <section
      ref={setNodeRef}
      className={`priority-group [padding:1.0625rem_0_1.125rem] min-h-25.75 [border-bottom:0.0625rem_solid_var(--line)] [transition:background_0.18s] rounded-xs [--priority:var(--secondary)] max-[47.5rem]:min-h-26.25 max-[47.5rem]:[padding:1.1875rem_0] [&:has(.empty-priority)]:min-h-22 ${isOver ? 'drop-active ' : ''}${priority ? `priority-${priority.toLowerCase()}` : 'unranked-group'}`}
      aria-label={`${dayName(day, language)} · ${label}`}
      data-testid={`${day ?? 'tba'}-${priority ?? 'unprioritized'}`}
    >
      <div className="group-heading flex items-center justify-between mb-3">
        {priority ? (
          <h3 className="priority-badge inline-flex items-center gap-1.25 [color:var(--priority)] text-xs font-semibold [line-height:1.2] [padding:0.375rem_0.5rem] rounded-md [background:color-mix(in_srgb,_var(--priority)_9%,_transparent)] max-[68.75rem]:text-xs max-[68.75rem]:p-1.5 max-[47.5rem]:text-xs max-[47.5rem]:[padding:0.375rem_0.5rem]">
            <span className="priority-dot w-1 h-1 [border-radius:100%] [background:currentColor]" />
            {priority}
            <span className="priority-name font-semibold ml-0.5 pl-1.5 [border-left:0.0625rem_solid_color-mix(in_srgb,_var(--priority)_27%,_transparent)] max-[68.75rem]:[margin-left:0] max-[68.75rem]:pl-1 max-[47.5rem]:pl-1.5">
              {label}
            </span>
          </h3>
        ) : (
          <button
            type="button"
            className="unranked-toggle min-h-8 bg-transparent flex items-center gap-1.5 p-0 text-muted [font-size:0.6875rem] font-semibold max-[47.5rem]:min-h-11 [&_svg]:[transition:transform_0.15s] [&_svg.collapsed]:[transform:rotate(-90deg)]"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown size="0.8125rem" className={expanded ? '' : 'collapsed'} />
            {label}
          </button>
        )}
        <span className="group-count [color:var(--tertiary)] [font-size:0.625rem] [font-variant-numeric:tabular-nums] pr-0.75">
          {appearances.length}
        </span>
      </div>
      {expanded && (
        <div className="artist-chips flex items-start flex-wrap gap-1.5 min-h-6.25 max-[47.5rem]:gap-1.75">
          <AnimatePresence initial={false}>
            {appearances.map((appearance) => (
              <ArtistChip
                key={appearance.id}
                appearance={appearance}
                language={language}
                priority={priority}
                onOpen={onOpen}
                onQuick={onQuick}
              />
            ))}
          </AnimatePresence>
          {appearances.length === 0 && (
            <p className="empty-priority [color:var(--tertiary)] [font-size:0.625rem] [line-height:1.65] max-w-66.25 [padding:0.125rem_0.0625rem] max-[47.5rem]:[font-size:0.6875rem]">
              {priority === 'P0' ? t.emptyPriority : '—'}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
export function DayColumn({
  day,
  index,
  search,
  genres = [],
  language,
  onOpen,
  onQuick,
}: {
  day: Day | null;
  index: number;
  search: string;
  genres?: string[];
  language: Language;
  onOpen: (id: string) => void;
  onQuick?: (id: string) => void;
}) {
  const priorities = usePlanner((state) => state.priorities);
  const Icon = [Flame, Zap, Sparkles][index] ?? CalendarDays;
  const appearances = catalog.appearances
    .filter((appearance) => {
      const artist = artistById.get(appearance.artistId);
      return (
        appearance.day === day && artist !== undefined && matchesSearch(artist, search, genres)
      );
    })
    .sort((a, b) =>
      (artistById.get(a.artistId)?.name ?? '').localeCompare(
        artistById.get(b.artistId)?.name ?? '',
        language
      )
    );
  const total = catalog.appearances.filter((appearance) => appearance.day === day);
  const ranked = total.filter((appearance) => priorities[appearance.id]).length;
  const t = messages(language);
  return (
    <article
      className={`day-column border border-separator rounded-2xl bg-surface [overflow:clip] [box-shadow:0_0.125rem_0.3125rem_#00000002] day-${index}`}
      aria-label={dayName(day, language)}
    >
      <header className="day-heading [padding:1.25rem_1.25rem_1.125rem] bg-surface [border-bottom:0.0625rem_solid_var(--line)] max-[68.75rem]:[padding:1.125rem_0.875rem] max-[47.5rem]:[padding:1.1875rem_1.1875rem_1.125rem]">
        <div className="day-date flex justify-between items-center text-muted [font-size:0.625rem] font-semibold [letter-spacing:0.045em] [text-transform:uppercase] mb-2.75 max-[47.5rem]:text-xs max-[47.5rem]:mb-3 [&_>_span]:[font-size:0.625rem] [&_>_span]:[font-weight:400] [&_>_span]:[text-transform:none] [&_>_span]:[letter-spacing:0]">
          {day ? shortDate(day, language) : '—'}
          <span>
            {total.length} {t.performances}
          </span>
        </div>
        <div className="day-title flex items-center gap-2.5 max-[68.75rem]:gap-1.75 max-[47.5rem]:gap-2.5 [&_h2]:[font-size:1.375rem] [&_h2]:[font-weight:650] [&_h2]:[letter-spacing:-0.035em] max-[68.75rem]:[&_h2]:text-xl max-[47.5rem]:[&_h2]:text-2xl">
          <span className="day-icon inline-flex items-center [color:var(--orange)]">
            <Icon size="1.25rem" strokeWidth={1.8} />
          </span>
          <h2>{dayName(day, language)}</h2>
          <span
            className="day-progress flex [align-items:baseline] gap-0.5 [margin-left:auto] text-xs font-semibold [font-variant-numeric:tabular-nums] [&_>_span]:[color:var(--tertiary)] [&_>_span]:[font-size:0.625rem] [&_>_span]:[font-weight:400]"
            title={`${ranked}/${total.length}`}
          >
            {ranked}
            <span>/{total.length}</span>
          </span>
        </div>
      </header>
      <div className="day-groups [padding:0_1.125rem] max-[68.75rem]:[padding:0_0.8125rem] max-[47.5rem]:[padding:0_1.125rem]">
        {[...PRIORITIES, null].map((priority) => (
          <PriorityGroup
            key={priority ?? 'none'}
            day={day}
            priority={priority}
            appearances={appearances.filter(
              (appearance) => (priorities[appearance.id] ?? null) === priority
            )}
            language={language}
            onOpen={onOpen}
            onQuick={onQuick}
          />
        ))}
      </div>
    </article>
  );
}
