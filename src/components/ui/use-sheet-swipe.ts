import { useCallback, useEffect, useRef, type RefObject, type TouchEvent } from 'react';

export function useSheetSwipe(
  content: RefObject<HTMLDivElement | null>,
  overlay: RefObject<HTMLDivElement | null>,
  dismiss: () => void
) {
  const start = useRef<{
    id: number;
    x: number;
    y: number;
    offset: number;
    locked: boolean;
    scrollable: HTMLElement | null;
  } | null>(null);
  const rebound = useRef<Animation[]>([]);
  const preventScroll = useRef<((event: globalThis.TouchEvent) => void) | null>(null);
  const stopPreventingScroll = useCallback(() => {
    if (preventScroll.current)
      content.current?.removeEventListener('touchmove', preventScroll.current);
    preventScroll.current = null;
  }, [content]);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reset = () => {
    if (content.current) content.current.style.translate = '';
    if (overlay.current) overlay.current.style.opacity = '';
  };
  const draw = (offset: number) => {
    const node = content.current;
    if (!node) return;
    const y = Math.max(0, Math.min(node.clientHeight, offset));
    node.style.translate = `0 ${y}px`;
    if (overlay.current)
      overlay.current.style.opacity = String(1 - y / Math.max(1, node.clientHeight));
  };
  const settle = () => {
    stopPreventingScroll();
    start.current = null;
    const node = content.current;
    const translate = node ? getComputedStyle(node).translate : '0 0';
    const opacity = overlay.current ? getComputedStyle(overlay.current).opacity : '1';
    for (const animation of rebound.current) animation.cancel();
    if (!node || reduced()) {
      reset();
      return;
    }
    const animation = node.animate([{ translate }, { translate: '0 0' }], {
      duration: 180,
      easing: 'ease-out',
    });
    rebound.current = [animation];
    const backdrop = overlay.current?.animate([{ opacity }, { opacity: 1 }], { duration: 180 });
    if (backdrop) rebound.current.push(backdrop);
    // Underlying styles hold the destination after the return animation ends.
    reset();
    void animation.finished.catch(() => {});
  };
  useEffect(
    () => () => {
      stopPreventingScroll();
      for (const animation of rebound.current) animation.cancel();
    },
    [stopPreventingScroll]
  );
  return {
    onTouchStart(event: TouchEvent<HTMLDivElement>) {
      start.current = null;
      if (
        event.touches.length !== 1 ||
        !window.matchMedia('(width < 47.5rem)').matches ||
        (event.target as Element).closest('button, a, input, select, textarea')
      )
        return;
      const node = content.current;
      const offset = node
        ? parseFloat(getComputedStyle(node).translate.split(' ')[1] ?? '0') || 0
        : 0;
      for (const animation of rebound.current) animation.cancel();
      draw(reduced() ? 0 : offset);
      const point = event.touches[0];
      let scrollable: HTMLElement | null = event.target as HTMLElement;
      while (scrollable && scrollable !== node) {
        const { overflowY } = getComputedStyle(scrollable);
        if (/(auto|scroll)/.test(overflowY) && scrollable.scrollHeight > scrollable.clientHeight)
          break;
        scrollable = scrollable.parentElement;
      }
      if (scrollable === node) scrollable = null;
      start.current = {
        id: point.identifier,
        x: point.clientX,
        y: point.clientY,
        offset,
        locked: false,
        scrollable,
      };
      stopPreventingScroll();
      preventScroll.current = (move) => {
        const origin = start.current;
        const touch = move.touches[0];
        if (!origin || move.touches.length !== 1 || touch.identifier !== origin.id) return;
        const dx = touch.clientX - origin.x;
        const dy = touch.clientY - origin.y;
        if (
          (origin.locked || (dy >= 6 && dy > Math.abs(dx) * 1.5)) &&
          (!origin.scrollable || origin.scrollable.scrollTop <= 0)
        )
          move.preventDefault();
      };
      node?.addEventListener('touchmove', preventScroll.current, { passive: false });
    },
    onTouchMove(event: TouchEvent<HTMLDivElement>) {
      const origin = start.current;
      if (!origin) return;
      const point = event.touches[0];
      if (event.touches.length !== 1 || point.identifier !== origin.id) {
        settle();
        return;
      }
      const dx = point.clientX - origin.x,
        dy = point.clientY - origin.y;
      if (!origin.locked) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (dy <= 0 || dy <= Math.abs(dx) * 1.5 || (origin.scrollable?.scrollTop ?? 0) > 0) {
          settle();
          return;
        }
        origin.locked = true;
      }
      if (!reduced()) draw(origin.offset + dy);
    },
    onTouchEnd(event: TouchEvent<HTMLDivElement>) {
      const origin = start.current;
      stopPreventingScroll();
      start.current = null;
      if (!origin || event.touches.length) {
        settle();
        return;
      }
      const point = Array.from(event.changedTouches).find((t) => t.identifier === origin.id);
      if (!point) {
        settle();
        return;
      }
      const dy = origin.offset + point.clientY - origin.y,
        dx = Math.abs(point.clientX - origin.x);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (dy >= rem * 4 && dy > dx * 1.5) {
        dismiss();
        return;
      }
      settle();
    },
    onTouchCancel: settle,
  };
}
