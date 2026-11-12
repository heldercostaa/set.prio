import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowDownToLine,
  ArrowUpRight,
  ChevronDown,
  Clipboard,
  Download,
  Grid2X2,
  LoaderCircle,
} from 'lucide-react';
import { messages } from '../../i18n';
import type { Language } from '../../types';

export type ExportFormat = 'image' | 'csv' | 'notion';
export function ExportMenu({
  language,
  count,
  busy,
  onExport,
}: {
  language: Language;
  count: number;
  busy: boolean;
  onExport: (format: ExportFormat) => Promise<void>;
}) {
  const t = messages(language);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="button inline-flex justify-center gap-2.25 items-center min-h-11 [padding:0.625rem_1rem] bg-surface border border-separator rounded-xl text-xs font-semibold [transition:background_0.15s,_transform_0.15s] primary export-trigger max-[47.5rem]:[font-size:0] max-[47.5rem]:p-0 max-[47.5rem]:w-11 max-[47.5rem]:h-11 max-[47.5rem]:[min-width:2.75rem] max-[47.5rem]:mt-6.5 max-[47.5rem]:[gap:0]"
          disabled={!count || busy}
          title={!count ? t.noPlan : undefined}
        >
          {busy ? (
            <LoaderCircle size="1.0625rem" className="spin [animation:spin_1s_linear_infinite]" />
          ) : (
            <ArrowDownToLine size="1.0625rem" />
          )}
          {busy ? t.copying : t.export}
          <ChevronDown size="0.875rem" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="menu bg-surface border border-separator [box-shadow:var(--shadow)] rounded-xl p-1.5 [z-index:80] text-content [animation:reveal_0.14s_ease-out] export-menu w-80.5 [max-width:calc(100vw_-_1.5rem)]"
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
              { key: 'image', Icon: Download, label: t.image, hint: t.imageHint },
              { key: 'csv', Icon: Grid2X2, label: t.csv, hint: t.csvHint },
              { key: 'notion', Icon: Clipboard, label: t.notion, hint: t.notionHint },
            ] as const
          ).map(({ key, Icon, label, hint }) => (
            <DropdownMenu.Item
              key={key}
              className="menu-item relative min-h-11 flex items-center gap-2.5 rounded-lg p-2.5 text-xs cursor-pointer export-item"
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
