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
          className="button inline-flex justify-center [gap:9px] items-center min-h-11 [padding:10px_16px] [background:var(--panel)] [border:1px_solid_var(--line)] [border-radius:10px] text-xs font-semibold [transition:background_0.15s,_transform_0.15s] primary export-trigger max-[760px]:[font-size:0] max-[760px]:p-0 max-[760px]:w-11 max-[760px]:h-11 max-[760px]:[min-width:44px] max-[760px]:[margin-top:26px] max-[760px]:[gap:0]"
          disabled={!count || busy}
          title={!count ? t.noPlan : undefined}
        >
          {busy ? (
            <LoaderCircle size={17} className="spin [animation:spin_1s_linear_infinite]" />
          ) : (
            <ArrowDownToLine size={17} />
          )}
          {busy ? t.copying : t.export}
          <ChevronDown size={14} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="menu [background:var(--panel)] [border:1px_solid_var(--line)] [box-shadow:var(--shadow)] [border-radius:13px] [padding:6px] [z-index:80] [color:var(--text)] [animation:reveal_0.14s_ease-out] export-menu [width:322px] [max-width:calc(100vw_-_24px)]"
          align="end"
          sideOffset={10}
          collisionPadding={12}
        >
          <DropdownMenu.Label>
            {count} {t.rowCount}
          </DropdownMenu.Label>
          <p className="export-scope [color:var(--secondary)] [font-size:10px] [line-height:1.6] [padding:0_10px_10px]">
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
              className="menu-item relative min-h-11 flex items-center [gap:10px] rounded-2 [padding:10px] text-xs cursor-pointer export-item"
              onSelect={() => {
                void onExport(key);
              }}
            >
              <Icon size={19} />
              <span>
                <strong>{label}</strong>
                <small>{hint}</small>
              </span>
              <ArrowUpRight size={14} />
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
