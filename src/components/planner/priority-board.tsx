import { DayColumn } from '../../components/planner/day-column';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useContext, useState } from 'react';
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
  onOpen,
  onQuick,
}: {
  language: Language;
  search: string;
  genres?: string[];
  onOpen: (id: string) => void;
  onQuick?: (id: string) => void;
}) {
  const previewsAllowed = useContext(ArtistPreviewContext);
  const t = messages(language);
  const state = usePlanner();
  const [dragName, setDragName] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 7 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );
  const endDrag = ({ active, over }: DragEndEvent) => {
    setDragName(null);
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
          collisionDetection={closestCenter}
          onDragStart={({ active }) => {
            const a = active.data.current?.appearance as Appearance;
            setDragName(artistById.get(a.artistId)?.name ?? null);
            setAnnouncement(t.dragStarted);
          }}
          onDragEnd={endDrag}
          onDragCancel={() => setDragName(null)}
          accessibility={{ screenReaderInstructions: { draggable: t.move } }}
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
                onClick={() => state.setDay(day)}
              >
                {dayName(day, language)}
              </button>
            ))}
          </fieldset>
          <div className="board-grid grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [align-items:start] gap-5 max-[68.75rem]:gap-3.5 max-[47.5rem]:block">
            {DAYS.map((day, index) => (
              <div
                className={`day-slot min-w-0 max-[47.5rem]:hidden max-[47.5rem]:[&.active-day]:block ${state.activeDay === day ? 'active-day' : ''}`}
                key={day}
              >
                <DayColumn
                  day={day}
                  index={index}
                  search={search}
                  genres={genres}
                  language={language}
                  onOpen={onOpen}
                  onQuick={onQuick}
                />
              </div>
            ))}
          </div>
          {catalog.appearances.some((appearance) => appearance.day === null) && (
            <div className="tba-board mt-5">
              <DayColumn
                day={null}
                index={3}
                search={search}
                genres={genres}
                language={language}
                onOpen={onOpen}
                onQuick={onQuick}
              />
            </div>
          )}
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
