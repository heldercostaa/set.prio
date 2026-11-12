import { GripVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
export function DragHint() {
  const ref = useRef<HTMLSpanElement>(null);
  const [extend, setExtend] = useState(false);
  useEffect(() => {
    const button = ref.current?.parentElement;
    if (!button) return;
    const position = () => {
      const bounds = button.getBoundingClientRect();
      const edge = button.closest('.day-groups')?.getBoundingClientRect().right ?? innerWidth;
      const space = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.25;
      setExtend(edge - bounds.right >= space);
    };
    button.addEventListener('pointerenter', position);
    button.addEventListener('focus', position);
    return () => {
      button.removeEventListener('pointerenter', position);
      button.removeEventListener('focus', position);
    };
  }, []);
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inline-flex items-center justify-center border border-separator bg-raised text-muted opacity-0 transition-opacity group-hover/card:opacity-100 group-focus-visible/card:opacity-100 group-active/card:opacity-100 ${extend ? 'left-full top-0 h-full w-4 rounded-r-lg border-l-0' : '-top-2 right-1 size-4 rounded-md'}`}
    >
      <GripVertical size="0.75rem" />
    </span>
  );
}
