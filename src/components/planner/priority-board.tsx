import { motion } from 'motion/react';
import { useMediaQuery } from '../ui/use-media-query';
import type { WatchFilter } from '../../data';
import { useDaySwipe } from './use-day-swipe';
import { FloatingPriorityTargets } from './floating-priority-targets';
import { DayColumn } from '../../components/planner/day-column';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useContext, useState, type CSSProperties } from 'react';
import { ArtistPreviewContext } from '../artist';
import { artistById, catalog } from '../../data';
import { dayName, messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import { DAYS, type Appearance, type Priority } from '../../types';

import type { Language } from '../../types';
export function PriorityBoard({
  language,
  search,
  genres = [],
  watched = 'all',
  onOpen,
}: {
  language: Language;
  search: string;
  genres?: string[];
  watched?: WatchFilter;
  onOpen: (id: string) => void;
}) {
  const previewsAllowed = useContext(ArtistPreviewContext);
  const t = messages(language);
  const state = usePlanner();
  const mobile = useMediaQuery('(width < 47.5rem)');
  const [dragName, setDragName] = useState<string | null>(null);
  const [keyboardDrag, setKeyboardDrag] = useState(false);
  const [hasDragMoved, setHasDragMoved] = useState(false);
  const [dragAppearance, setDragAppearance] = useState<Appearance | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const { track, x, selectDay, cancelSwipe, ...daySwipeHandlers } = useDaySwipe(
    state.activeDay,
    (day) => {
      state.setDay(day);
      setAnnouncement(dayName(day, language));
    },
    previewsAllowed,
    mobile
  );
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 7 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );
  const endDrag = ({ active, over }: DragEndEvent) => {
    setDragName(null);
    setDragAppearance(null);
    setHasDragMoved(false);
    const appearance = active.data.current?.appearance as Appearance | undefined;
    if (appearance && over && over.data.current?.day === appearance.day) {
      state.setPriority(appearance.id, over.data.current.priority as Priority | null);
      setAnnouncement(t.dragFinished);
    } else setAnnouncement(t.dragRejected);
  };
  return (
    <>
      {' '}
      <ArtistPreviewContext.Provider value={previewsAllowed && !dragName}>
        <DndContext
          sensors={sensors}
          collisionDetection={(args) => {
            if (!args.pointerCoordinates) return closestCenter(args);
            const hits = pointerWithin(args);
            return hits.filter((hit) => String(hit.id).startsWith('floating:')).length
              ? hits.filter((hit) => String(hit.id).startsWith('floating:'))
              : hits;
          }}
          onDragStart={({ active, activatorEvent }) => {
            cancelSwipe(true);
            setKeyboardDrag(activatorEvent.type === 'keydown');
            // Mouse activation already requires movement; a touch hold alone does not.
            setHasDragMoved(activatorEvent.type === 'mousedown');
            const a = active.data.current?.appearance as Appearance;
            setDragAppearance(a);
            setDragName(artistById.get(a.artistId)?.name ?? null);
            setAnnouncement(t.dragStarted);
          }}
          onDragMove={({ delta }) => {
            if (delta.x !== 0 || delta.y !== 0) setHasDragMoved(true);
          }}
          onDragEnd={endDrag}
          onDragCancel={() => {
            setDragName(null);
            setDragAppearance(null);
            setHasDragMoved(false);
          }}
          accessibility={{
            restoreFocus: keyboardDrag,
            screenReaderInstructions: { draggable: t.move },
          }}
        >
          <fieldset
            className="mobile-days hidden max-[47.5rem]:grid max-[47.5rem]:[grid-template-columns:repeat(3,_minmax(0,_1fr))] max-[47.5rem]:gap-1 max-[47.5rem]:[background:color-mix(in_srgb,_var(--line)_50%,_transparent)] max-[47.5rem]:border border-separator max-[47.5rem]:rounded-xl max-[47.5rem]:p-0.75 max-[47.5rem]:mb-4 max-[47.5rem]:[&_button]:min-h-11 max-[47.5rem]:[&_button]:bg-transparent max-[47.5rem]:[&_button]:rounded-lg max-[47.5rem]:[&_button]:[font-size:0.8125rem] max-[47.5rem]:[&_button]:font-semibold max-[47.5rem]:[&_button]:text-muted max-[47.5rem]:[&_button[aria-pressed='true']]:text-content max-[47.5rem]:[&_button[aria-pressed='true']]:bg-surface max-[47.5rem]:[&_button[aria-pressed='true']]:[box-shadow:0_0.0625rem_0.25rem_#0001] max-[22.5rem]:[&_button]:text-xs"
            aria-label={t.officialDay}
          >
            {DAYS.map((day) => (
              <button
                type="button"
                key={day}
                aria-pressed={state.activeDay === day}
                onClick={() => selectDay(day)}
              >
                {dayName(day, language)}
              </button>
            ))}
          </fieldset>
          <div className="overflow-x-clip max-[47.5rem]:overflow-hidden">
            <motion.div
              ref={track}
              {...daySwipeHandlers}
              style={{ x: mobile ? x : 0 }}
              className="board-grid relative grid grid-cols-3 items-start gap-5 max-[68.75rem]:gap-3.5 max-[47.5rem]:block max-[47.5rem]:touch-pan-y"
            >
              {DAYS.map((day, index) => (
                <div
                  className={`day-slot min-w-0 max-[47.5rem]:w-full max-[47.5rem]:[transform:translateX(var(--day-offset))] ${state.activeDay === day ? 'active-day max-[47.5rem]:relative' : 'max-[47.5rem]:absolute max-[47.5rem]:top-0 max-[47.5rem]:left-0'}`}
                  key={day}
                  style={
                    {
                      '--day-offset': `calc(${index * 100}% + ${index} * var(--day-gap, 0rem))`,
                    } as CSSProperties
                  }
                  inert={mobile && state.activeDay !== day}
                  aria-hidden={(mobile && state.activeDay !== day) || undefined}
                >
                  <DayColumn
                    day={day}
                    index={index}
                    search={search}
                    genres={genres}
                    watched={watched}
                    language={language}
                    onOpen={onOpen}
                  />
                </div>
              ))}
            </motion.div>
          </div>
          {catalog.appearances.some((appearance) => appearance.day === null) && (
            <div className="tba-board mt-5">
              <DayColumn
                day={null}
                index={3}
                search={search}
                genres={genres}
                watched={watched}
                language={language}
                onOpen={onOpen}
              />
            </div>
          )}
          <FloatingPriorityTargets
            appearance={previewsAllowed && hasDragMoved ? dragAppearance : null}
            language={language}
          />
          <DragOverlay>
            {dragName && (
              <div className="drag-overlay bg-surface [border:0.0625rem_solid_var(--blue)] rounded-lg [padding:0.625rem_0.875rem] text-xs [box-shadow:var(--shadow)] max-w-70">
                {dragName}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </ArtistPreviewContext.Provider>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </>
  );
}
