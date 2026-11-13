import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import type { Language } from '../../types';
import { Modal } from '../ui/modal';

export function DisplaySettings({ language }: { language: Language }) {
  const t = messages(language);
  const showFlags = usePlanner((s) => s.showArtistFlags);
  const showRatings = usePlanner((s) => s.showArtistRatings);
  const setShowFlags = usePlanner((s) => s.setShowArtistFlags);
  const setShowRatings = usePlanner((s) => s.setShowArtistRatings);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(width < 47.5rem)').matches);
  useEffect(() => {
    const media = window.matchMedia('(width < 47.5rem)');
    const update = () => {
      setOpen(false);
      setMobile(media.matches);
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const items = [
    { label: t.showArtistFlags, checked: showFlags, set: setShowFlags },
    { label: t.showArtistRatings, checked: showRatings, set: setShowRatings },
  ];
  const trigger = (
    <button
      type="button"
      aria-label={t.settings}
      onClick={mobile ? () => setOpen(true) : undefined}
      className="icon-button size-11 inline-flex shrink-0 items-center justify-center rounded-xl bg-transparent text-muted hover:[background:var(--hover)] hover:text-content"
    >
      <Settings size="1.125rem" />
    </button>
  );
  if (mobile)
    return (
      <>
        {trigger}
        <Modal
          open={open}
          onOpenChange={setOpen}
          title={t.settings}
          description={t.displaySettings}
          closeLabel={t.close}
        >
          <div className="grid gap-1 p-5">
            {items.map((item) => (
              <label
                key={item.label}
                className="flex min-h-11 items-center justify-between gap-4 text-sm"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(event) => item.set(event.target.checked)}
                  className="size-5 accent-[var(--blue)]"
                />
              </label>
            ))}
          </div>
        </Modal>
      </>
    );
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-80 w-64 rounded-xl border border-separator bg-surface p-2 text-content [box-shadow:var(--shadow)]"
        >
          <DropdownMenu.Label className="px-2 py-2 text-xs font-semibold text-muted">
            {t.settings}
          </DropdownMenu.Label>
          {items.map((item) => (
            <DropdownMenu.CheckboxItem
              key={item.label}
              checked={item.checked}
              onCheckedChange={(checked) => item.set(checked === true)}
              onSelect={(event) => event.preventDefault()}
              className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-2 text-sm outline-none data-[highlighted]:bg-[var(--hover)] focus-visible:outline-2 focus-visible:outline-[var(--blue)]"
            >
              <span>{item.label}</span>
              <DropdownMenu.ItemIndicator>
                <Check size="1rem" />
              </DropdownMenu.ItemIndicator>
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
