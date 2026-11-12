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
          className="button inline-flex justify-center gap-2.25 items-center min-h-11 [padding:0.625rem_1rem] bg-surface border border-separator rounded-xl text-xs font-semibold [transition:background_0.15s,_transform_0.15s] primary export-trigger max-[47.5rem]:[font-size:0] max-[47.5rem]:p-0 max-[47.5rem]:w-11 max-[47.5rem]:h-11 max-[47.5rem]:[min-width:2.75rem] max-[47.5rem]:mt-6.5 max-[47.5rem]:[gap:0] [&:active:not(:disabled)]:[transform:scale(0.98)] [&:hover:not(:disabled)]:[background:var(--hover)] [&.primary]:[color:#fff] [&.primary]:[background:#0071e3] [&.primary]:[border-color:transparent] [&.primary]:[box-shadow:0_0.0625rem_0.125rem_#0001] [&.primary:hover:not(:disabled)]:[background:#0077ed] [&.primary:disabled]:bg-surface [&.primary:disabled]:[border-color:var(--line)] [&.primary:disabled]:[color:var(--tertiary)] [&.primary:disabled]:opacity-100 [&.primary:disabled]:[box-shadow:none] max-[47.5rem]:[&_>_svg:last-child]:hidden max-[47.5rem]:[&_>_svg:first-child]:w-4.75 max-[47.5rem]:[&_>_svg:first-child]:h-4.75"
          disabled={!count || busy}
          title={!count ? t.noPlan : undefined}
        >
          {busy ? (
            <LoaderCircle size="1.0625rem" className="spin [animation:spin_1s_linear_infinite]" />
          ) : (
            <Share size="1.0625rem" aria-hidden="true" />
          )}
          {busy ? t.copying : t.export}
          <ChevronDown size="0.875rem" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="menu bg-surface border border-separator [box-shadow:var(--shadow)] rounded-xl p-1.5 [z-index:80] text-content [animation:reveal_0.14s_ease-out] export-menu w-80.5 [max-width:calc(100vw_-_1.5rem)] [&_[data-radix-menu-collection-item]]:[outline:none] [&_[data-highlighted]]:[background:var(--hover)] [&_[data-radix-menu-collection-item]:focus-visible]:[outline:0.125rem_solid_var(--blue)] [&_[data-radix-menu-collection-item]:focus-visible]:[outline-offset:-0.125rem] [&_[data-radix-dropdown-menu-label]]:[padding:0.4375rem_0.625rem] [&_[data-radix-dropdown-menu-label]]:text-muted [&_[data-radix-dropdown-menu-label]]:[font-size:0.625rem] [&_[data-radix-dropdown-menu-label]]:font-semibold [&_>_div:first-child:not(.menu-item)]:[padding:0.4375rem_0.625rem] [&_>_div:first-child:not(.menu-item)]:text-muted [&_>_div:first-child:not(.menu-item)]:[font-size:0.625rem] [&_>_div:first-child:not(.menu-item)]:font-semibold"
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
