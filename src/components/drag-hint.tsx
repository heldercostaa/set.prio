import { GripVertical } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function DragHint({ onSpacingChange }: { onSpacingChange: (offset: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const button = ref.current?.parentElement;
    if (!button) return;
    const column = button.closest('.day-column');
    const position = () => {
      const bounds = button.getBoundingClientRect();
      const edge = column?.getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      let leftEdge = edge?.left ?? 0;
      let rightEdge = edge?.right ?? innerWidth;
      const neighbors =
        button.closest('.artist-chips')?.querySelectorAll('button[data-appearance-id]') ?? [];
      for (const neighbor of neighbors) {
        if (neighbor === button || neighbor.closest('[inert]')) continue;
        const other = neighbor.getBoundingClientRect();
        if (other.top >= bounds.bottom || other.bottom <= bounds.top) continue;
        if (other.right <= bounds.left) leftEdge = Math.max(leftEdge, other.right);
        if (other.left >= bounds.right) rightEdge = Math.min(rightEdge, other.left);
      }
      const right = Math.min(rem, Math.max(0, rightEdge - rem / 8 - bounds.right));
      const hint = ref.current;
      const gripWidth = hint?.firstElementChild?.getBoundingClientRect().width ?? 0;
      const hintPadding = hint ? parseFloat(getComputedStyle(hint).paddingRight) : 0;
      const labelPadding = parseFloat(getComputedStyle(button).paddingRight);
      const needed = gripWidth + hintPadding + rem / 4 - labelPadding;
      const left = Math.min(
        Math.max(0, needed - right),
        Math.max(0, bounds.left - leftEdge - rem / 8)
      );
      button.style.setProperty('--drag-right', `${right / rem}rem`);
      button.style.setProperty('--drag-left', `${left / rem}rem`);
      // Leave a gap between the expanded hit area and the artist preview.
      onSpacingChange(Math.max(left, right) + rem / 2);
    };
    let observer: ResizeObserver | undefined;
    const activate = () => {
      position();
      observer ??= new ResizeObserver(position);
      observer.observe(button);
      if (column) observer.observe(column);
    };
    const deactivate = () => {
      if (!button.matches(':hover, :focus-visible')) observer?.disconnect();
    };
    button.addEventListener('pointerenter', activate);
    button.addEventListener('focus', activate);
    button.addEventListener('pointerleave', deactivate);
    button.addEventListener('blur', deactivate);
    return () => {
      observer?.disconnect();
      button.removeEventListener('pointerenter', activate);
      button.removeEventListener('focus', activate);
      button.removeEventListener('pointerleave', deactivate);
      button.removeEventListener('blur', deactivate);
    };
  }, [onSpacingChange]);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="drag-hint pointer-events-none absolute -inset-y-px -mx-px -z-10 flex items-center justify-end rounded-lg border border-separator [background:var(--hover)] pr-0.5 text-muted opacity-0 transition-opacity [left:calc(-1_*_var(--drag-left,_0rem))] [right:calc(-1_*_var(--drag-right,_1rem))] group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-visible/card:pointer-events-auto group-focus-visible/card:opacity-100 group-active/card:pointer-events-auto group-active/card:opacity-100 motion-reduce:transition-none"
    >
      <GripVertical size="0.75rem" />
    </span>
  );
}
