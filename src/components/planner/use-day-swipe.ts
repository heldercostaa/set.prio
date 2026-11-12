import { useRef, type TouchEvent } from 'react';
import { DAYS, type Day } from '../../types';

export function useDaySwipe(day: Day, onDayChange: (day: Day) => void, enabled: boolean) {
  const start = useRef<{ id: number; x: number; y: number; rem: number } | null>(null);
  const cancelSwipe = () => {
    start.current = null;
  };
  return {
    cancelSwipe,
    onTouchStart(event: TouchEvent<HTMLDivElement>) {
      cancelSwipe();
      if (
        !enabled ||
        event.touches.length !== 1 ||
        !event.currentTarget.contains(event.target as Node) ||
        !window.matchMedia('(width < 47.5rem)').matches
      )
        return;
      const point = event.touches[0];
      start.current = {
        id: point.identifier,
        x: point.clientX,
        y: point.clientY,
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
      };
    },
    onTouchMove(event: TouchEvent<HTMLDivElement>) {
      const origin = start.current;
      if (!origin) return;
      const point = event.touches[0];
      if (event.touches.length !== 1 || point.identifier !== origin.id) {
        cancelSwipe();
        return;
      }
      const dx = Math.abs(point.clientX - origin.x);
      const dy = Math.abs(point.clientY - origin.y);
      if (Math.max(dx, dy) >= origin.rem / 2 && dx <= dy * 1.5) cancelSwipe();
    },
    onTouchEnd(event: TouchEvent<HTMLDivElement>) {
      const origin = start.current;
      cancelSwipe();
      if (
        !origin ||
        !enabled ||
        event.touches.length ||
        !window.matchMedia('(width < 47.5rem)').matches
      )
        return;
      const point = Array.from(event.changedTouches).find(
        (touch) => touch.identifier === origin.id
      );
      if (!point) return;
      const dx = point.clientX - origin.x;
      const dy = point.clientY - origin.y;
      if (Math.abs(dx) < origin.rem * 3 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
      event.preventDefault();
      const nextDay = DAYS[DAYS.indexOf(day) + (dx < 0 ? 1 : -1)];
      if (nextDay) onDayChange(nextDay);
    },
    onTouchCancel: cancelSwipe,
  };
}
