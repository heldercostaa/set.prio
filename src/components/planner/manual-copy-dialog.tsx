import { useRef } from 'react';
import { Modal } from '../../components/ui/modal';
import { messages } from '../../i18n';
import type { Language } from '../../types';
import type { notionPayload } from '../../utils/exports';

export function ManualCopyDialog({
  language,
  payload,
  onClose,
  onExport,
}: {
  language: Language;
  payload: ReturnType<typeof notionPayload> | null;
  onClose: () => void;
  onExport: () => void;
}) {
  const t = messages(language);
  const manualText = useRef<HTMLTextAreaElement>(null);
  return (
    <Modal
      open={payload !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t.manualTitle}
      description={t.manualHint}
      closeLabel={t.close}
      className="manual-modal"
    >
      <div className="manual-body p-6 [&_textarea]:w-full [&_textarea]:h-55 [&_textarea]:bg-raised [&_textarea]:[border:0.0625rem_solid_var(--line)] [&_textarea]:rounded-xl [&_textarea]:p-3 [&_textarea]:[font-size:0.6875rem] [&_textarea]:[line-height:1.7] max-[47.5rem]:p-5 max-[47.5rem]:[&_textarea]:text-base">
        <textarea
          ref={manualText}
          readOnly
          value={payload?.text ?? ''}
          aria-label={t.manualTitle}
          onFocus={(event) => event.target.select()}
        />
        <div className="manual-actions flex gap-2.5 [justify-content:flex-end] mt-4 max-[47.5rem]:[&_.button]:[font-size:0.6875rem] max-[47.5rem]:[&_.button]:p-2.5">
          <button
            type="button"
            className="button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-separator bg-surface px-4 py-2.5 text-xs font-semibold text-content transition-colors hover:bg-raised"
            onClick={() => {
              manualText.current?.focus();
              manualText.current?.select();
            }}
          >
            {t.selectText}
          </button>
          <button
            type="button"
            className="button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-content px-4 py-2.5 text-xs font-semibold text-surface transition-opacity hover:opacity-90"
            onClick={() => {
              onExport();
            }}
          >
            {t.csv}
          </button>
        </div>
      </div>
    </Modal>
  );
}
