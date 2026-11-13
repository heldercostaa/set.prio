import * as HoverCard from '@radix-ui/react-hover-card';
import { Info } from 'lucide-react';
import { useId, useState } from 'react';
import type { Language } from '../../types';

export function FilterNotice({
  language,
  notice,
  className = 'mx-3 mt-2 px-1',
}: {
  language: Language;
  notice: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={150} closeDelay={150}>
      <HoverCard.Trigger asChild>
        <a
          href={`#${descriptionId}`}
          aria-describedby={open ? descriptionId : undefined}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen((value) => !value);
            }
          }}
          className={`flex min-h-11 w-fit max-w-full shrink-0 cursor-help items-center gap-1.5 rounded-lg text-xs font-medium leading-relaxed text-muted focus-visible:outline-2 focus-visible:outline-accent ${className}`}
        >
          <Info className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
          {language === 'en'
            ? 'Genres are AI-assisted estimates.'
            : 'Os gêneros foram estimados com ajuda de IA.'}
        </a>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side={window.matchMedia('(max-width: 47.5rem)').matches ? 'bottom' : 'right'}
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-100 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl bg-surface p-4 text-xs leading-relaxed text-muted shadow-[var(--shadow)] inset-ring inset-ring-separator"
        >
          <p id={descriptionId}>{notice.replace(/^.*?[.!?]\s*/, '')}</p>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
