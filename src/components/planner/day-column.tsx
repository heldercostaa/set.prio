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
}: {
  day: Day | null;
  priority: Priority | null;
  appearances: Appearance[];
  language: Language;
  onOpen: (id: string) => void;
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
      className={`priority-group ${isOver ? 'drop-active ' : ''}${priority ? `priority-${priority.toLowerCase()}` : 'unranked-group'}`}
      aria-label={`${dayName(day, language)} · ${label}`}
      data-testid={`${day ?? 'tba'}-${priority ?? 'unprioritized'}`}
    >
      <div className="group-heading flex items-center justify-between mb-3">
        {priority ? (
          <h3 className="priority-badge inline-flex items-center [gap:5px] [color:var(--priority)] [font-size:10px] font-bold [line-height:1] [padding:6px_8px] [border-radius:6px] [background:color-mix(in_srgb,_var(--priority)_9%,_transparent)] max-[1100px]:[font-size:9px] max-[1100px]:[padding:6px] max-[760px]:[font-size:10px] max-[760px]:[padding:6px_8px]">
            <span className="priority-dot w-1 h-1 [border-radius:100%] [background:currentColor]" />
            {priority}
            <span className="priority-name font-semibold [margin-left:2px] [padding-left:6px] [border-left:1px_solid_color-mix(in_srgb,_var(--priority)_27%,_transparent)] max-[1100px]:[margin-left:0] max-[1100px]:pl-1 max-[760px]:[padding-left:6px]">
              {label}
            </span>
          </h3>
        ) : (
          <button
            type="button"
            className="unranked-toggle min-h-8 bg-transparent flex items-center [gap:6px] p-0 [color:var(--secondary)] [font-size:11px] font-semibold max-[760px]:min-h-11"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown size={13} className={expanded ? '' : 'collapsed'} />
            {label}
          </button>
        )}
        <span className="group-count [color:var(--tertiary)] [font-size:10px] [font-variant-numeric:tabular-nums] [padding-right:3px]">
          {appearances.length}
        </span>
      </div>
      {expanded && (
        <div className="artist-chips flex items-start flex-wrap [gap:6px] [min-height:25px] max-[760px]:[gap:7px]">
          <AnimatePresence initial={false}>
            {appearances.map((appearance) => (
              <ArtistChip
                key={appearance.id}
                appearance={appearance}
                language={language}
                priority={priority}
                onOpen={onOpen}
              />
            ))}
          </AnimatePresence>
          {appearances.length === 0 && (
            <p className="empty-priority [color:var(--tertiary)] [font-size:10px] [line-height:1.65] [max-width:265px] [padding:2px_1px] max-[760px]:[font-size:11px]">
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
  language,
  onOpen,
}: {
  day: Day | null;
  index: number;
  search: string;
  language: Language;
  onOpen: (id: string) => void;
}) {
  const priorities = usePlanner((state) => state.priorities);
  const Icon = [Flame, Zap, Sparkles][index] ?? CalendarDays;
  const appearances = catalog.appearances
    .filter((appearance) => {
      const artist = artistById.get(appearance.artistId);
      return appearance.day === day && artist !== undefined && matchesSearch(artist, search);
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
      className={`day-column [border:1px_solid_var(--line)] [border-radius:17px] [background:var(--panel)] [overflow:clip] [box-shadow:0_2px_5px_#00000002] day-${index}`}
      aria-label={dayName(day, language)}
    >
      <header className="day-heading [padding:20px_20px_18px] [background:linear-gradient(180deg,_var(--panel-soft),_var(--panel))] [border-bottom:1px_solid_var(--line)] max-[1100px]:[padding:18px_14px] max-[760px]:[padding:19px_19px_18px]">
        <div className="day-date flex justify-between items-center [color:var(--secondary)] [font-size:10px] font-semibold [letter-spacing:0.045em] [text-transform:uppercase] [margin-bottom:11px] max-[760px]:[font-size:10px] max-[760px]:mb-3">
          {day ? shortDate(day, language) : '—'}
          <span>
            {total.length} {t.performances}
          </span>
        </div>
        <div className="day-title flex items-center [gap:10px] max-[1100px]:[gap:7px] max-[760px]:[gap:10px]">
          <span className="day-icon inline-flex items-center [color:var(--orange)]">
            <Icon size={20} strokeWidth={1.8} />
          </span>
          <h2>{dayName(day, language)}</h2>
          <span
            className="day-progress flex [align-items:baseline] [gap:2px] [margin-left:auto] text-xs font-semibold [font-variant-numeric:tabular-nums]"
            title={`${ranked}/${total.length}`}
          >
            {ranked}
            <span>/{total.length}</span>
          </span>
        </div>
      </header>
      <div className="day-groups [padding:0_18px] max-[1100px]:[padding:0_13px] max-[760px]:[padding:0_18px]">
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
          />
        ))}
      </div>
    </article>
  );
}
