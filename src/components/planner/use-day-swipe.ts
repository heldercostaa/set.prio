import { animate, useMotionValue, type AnimationPlaybackControls } from 'motion/react';
import { useCallback, useLayoutEffect, useRef, type TouchEvent } from 'react';
import { DAYS, type Day } from '../../types';

export function useDaySwipe(
  day: Day,
  onDayChange: (day: Day) => void,
  enabled: boolean,
  mobile: boolean
) {
  const track = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const x = useMotionValue(0);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const generation = useRef(0);
  const start = useRef<{
    id: number;
    x: number;
    y: number;
    offset: number;
    locked: boolean;
  } | null>(null);
  const base = () => -DAYS.indexOf(day) * width.current;
  const stop = useCallback(() => {
    generation.current++;
    animation.current?.stop();
  }, []);
  const settle = (target: number, nextDay?: Day) => {
    stop();
    const id = generation.current;
    animation.current = animate(x, target, {
      duration: reducedMotion() ? 0 : 0.22,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        if (id === generation.current && nextDay) onDayChange(nextDay);
      },
    });
  };
  const cancelSwipe = (immediate = false) => {
    start.current = null;
    if (immediate) {
      stop();
      x.set(base());
    } else settle(base());
  };
  useLayoutEffect(() => {
    const node = track.current;
    if (!node || !mobile) return;
    const resize = () => {
      stop();
      start.current = null;
      width.current = node.clientWidth;
      x.set(-DAYS.indexOf(day) * width.current);
    };
    resize();
    const observer = new ResizeObserver(() => {
      if (node.clientWidth !== width.current) resize();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [mobile, day, x, stop]);
  return {
    track,
    x,
    cancelSwipe,
    selectDay(nextDay: Day) {
      start.current = null;
      if (!mobile) {
        onDayChange(nextDay);
        return;
      }
      settle(-DAYS.indexOf(nextDay) * width.current, nextDay);
    },
    onTouchStart(event: TouchEvent<HTMLDivElement>) {
      start.current = null;
      if (!enabled || !mobile || event.touches.length !== 1) return;
      stop();
      const point = event.touches[0];
      start.current = {
        id: point.identifier,
        x: point.clientX,
        y: point.clientY,
        offset: x.get() - base(),
        locked: false,
      };
    },
    onTouchMove(event: TouchEvent<HTMLDivElement>) {
      const origin = start.current;
      if (!origin) return;
      const point = event.touches[0];
      if (event.touches.length !== 1 || point.identifier !== origin.id || !enabled) {
        cancelSwipe();
        return;
      }
      const dx = point.clientX - origin.x,
        dy = point.clientY - origin.y;
      if (!origin.locked) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (Math.abs(dx) <= Math.abs(dy) * 1.5) {
          cancelSwipe();
          return;
        }
        origin.locked = true;
      }
      const offset = origin.offset + dx;
      const next = DAYS[DAYS.indexOf(day) + (offset < 0 ? 1 : -1)];
      if (!reducedMotion()) x.set(base() + offset * (next ? 1 : 0.22));
    },
    onTouchEnd(event: TouchEvent<HTMLDivElement>) {
      const origin = start.current;
      start.current = null;
      if (!origin || !enabled || event.touches.length || !mobile) {
        settle(base());
        return;
      }
      const point = Array.from(event.changedTouches).find((t) => t.identifier === origin.id);
      if (!point) {
        settle(base());
        return;
      }
      const dx = origin.offset + point.clientX - origin.x,
        dy = point.clientY - origin.y;
      const threshold = Math.max(
        parseFloat(getComputedStyle(document.documentElement).fontSize) * 3,
        width.current * 0.18
      );
      const nextDay = DAYS[DAYS.indexOf(day) + (dx < 0 ? 1 : -1)];
      if (Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        event.preventDefault();
        if (nextDay) {
          settle(-DAYS.indexOf(nextDay) * width.current, nextDay);
          return;
        }
      }
      settle(base());
    },
    onTouchCancel: () => cancelSwipe(),
  };
}
