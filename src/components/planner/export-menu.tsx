import { menuMotionClassName } from '../ui/control';
import { useEffect, useState } from 'react';
import type { ImageShareStatus } from './use-image-share';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowUpRight,
  ChevronDown,
  Clipboard,
  Download,
  Grid2X2,
  LoaderCircle,
  Share,
} from 'lucide-react';
import { messages } from '../../i18n';
import type { Language } from '../../types';

export type ExportFormat = 'image' | 'csv' | 'notion';
export function ExportMenu({
  language,
  count,
  busy,
  onExport,
  mobile,
  imageShareStatus,
  onPrepareImage,
}: {
  language: Language;
  count: number;
  busy: boolean;
  onExport: (format: ExportFormat) => Promise<void>;
  mobile: boolean;
  imageShareStatus: ImageShareStatus;
  onPrepareImage: () => Promise<void>;
}) {
  const t = messages(language);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open && mobile && imageShareStatus === 'idle') void onPrepareImage();
  }, [open, mobile, imageShareStatus, onPrepareImage]);
  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open && mobile) void onPrepareImage();
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="button export-trigger inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-separator bg-raised px-3.5 py-2.5 text-xs font-semibold text-content transition-colors hover:bg-[var(--hover)] active:scale-[0.98] disabled:opacity-50 max-[47.5rem]:size-11 max-[47.5rem]:gap-0 max-[47.5rem]:p-0"
          disabled={!count || busy}
          title={!count ? t.noPlan : undefined}
        >
          {busy ? (
            <LoaderCircle size="1.0625rem" className="spin [animation:spin_1s_linear_infinite]" />
          ) : (
            <Share size="1.0625rem" className="shrink-0" aria-hidden="true" />
          )}
          <span className="max-[47.5rem]:sr-only">{busy ? t.copying : t.export}</span>
          <ChevronDown size="0.875rem" className="max-[47.5rem]:hidden" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`${menuMotionClassName} menu bg-surface border border-separator [box-shadow:var(--shadow)] rounded-xl p-1.5 [z-index:80] text-content export-menu w-80.5 [max-width:calc(100vw_-_1.5rem)] [&_[data-radix-menu-collection-item]]:[outline:none] [&_[data-highlighted]]:[background:var(--hover)] [&_[data-radix-menu-collection-item]:focus-visible]:[outline:0.125rem_solid_var(--blue)] [&_[data-radix-menu-collection-item]:focus-visible]:[outline-offset:-0.125rem] [&_[data-radix-dropdown-menu-label]]:[padding:0.4375rem_0.625rem] [&_[data-radix-dropdown-menu-label]]:text-muted [&_[data-radix-dropdown-menu-label]]:[font-size:0.625rem] [&_[data-radix-dropdown-menu-label]]:font-semibold [&_>_div:first-child:not(.menu-item)]:[padding:0.4375rem_0.625rem] [&_>_div:first-child:not(.menu-item)]:text-muted [&_>_div:first-child:not(.menu-item)]:[font-size:0.625rem] [&_>_div:first-child:not(.menu-item)]:font-semibold`}
          align="end"
          sideOffset={10}
          collisionPadding={12}
        >
          <DropdownMenu.Label>
            {count} {t.rowCount}
          </DropdownMenu.Label>
          <p className="export-scope text-muted [font-size:0.625rem] [line-height:1.6] [padding:0_0.625rem_0.625rem]">
            {t.exportScope}
          </p>
          {(
            [
              {
                key: 'image',
                Icon: mobile ? Share : Download,
                label: mobile ? t.shareImage : t.image,
                hint: !mobile
                  ? t.imageHint
                  : imageShareStatus === 'unsupported'
                    ? t.imageShareUnsupported
                    : imageShareStatus === 'error'
                      ? t.imagePrepareFailed
                      : imageShareStatus === 'ready'
                        ? t.imageHint
                        : t.imagePreparing,
              },
              { key: 'csv', Icon: Grid2X2, label: t.csv, hint: t.csvHint },
              { key: 'notion', Icon: Clipboard, label: t.notion, hint: t.notionHint },
            ] as const
          ).map(({ key, Icon, label, hint }) => (
            <DropdownMenu.Item
              key={key}
              disabled={key === 'image' && mobile && imageShareStatus !== 'ready'}
              className="menu-item relative min-h-11 flex items-center gap-2.5 rounded-lg p-2.5 text-xs cursor-pointer export-item [&_>_span]:flex [&_>_span]:flex-col [&_>_span]:gap-1.25 [&_>_span_strong]:text-xs [&_>_span_strong]:font-semibold [&_>_span_small]:text-muted [&_>_span_small]:[font-size:0.625rem] [&_>_svg:last-child]:[margin-left:auto] [&_>_svg:last-child]:[color:var(--tertiary)] [&_>_svg:first-child]:text-muted [&_>_svg:first-child]:shrink-0 data-[disabled]:cursor-default data-[disabled]:opacity-60"
              onSelect={() => {
                void onExport(key);
              }}
            >
              <Icon size="1.1875rem" />
              <span>
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
              <ArrowUpRight size="0.875rem" />
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
