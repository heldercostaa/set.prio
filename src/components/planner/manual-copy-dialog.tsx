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
            className="button inline-flex justify-center gap-2.25 items-center min-h-11 [padding:0.625rem_1rem] bg-surface border border-separator rounded-xl text-xs font-semibold [transition:background_0.15s,_transform_0.15s] [&:active:not(:disabled)]:[transform:scale(0.98)] [&:hover:not(:disabled)]:[background:var(--hover)] [&.primary]:[color:#fff] [&.primary]:[background:#0071e3] [&.primary]:[border-color:transparent] [&.primary]:[box-shadow:0_0.0625rem_0.125rem_#0001] [&.primary:hover:not(:disabled)]:[background:#0077ed] [&.primary:disabled]:bg-surface [&.primary:disabled]:[border-color:var(--line)] [&.primary:disabled]:[color:var(--tertiary)] [&.primary:disabled]:opacity-100 [&.primary:disabled]:[box-shadow:none]"
            onClick={() => {
              manualText.current?.focus();
              manualText.current?.select();
            }}
          >
            {t.selectText}
          </button>
          <button
            type="button"
            className="button inline-flex justify-center gap-2.25 items-center min-h-11 [padding:0.625rem_1rem] bg-surface border border-separator rounded-xl text-xs font-semibold [transition:background_0.15s,_transform_0.15s] primary [&:active:not(:disabled)]:[transform:scale(0.98)] [&:hover:not(:disabled)]:[background:var(--hover)] [&.primary]:[color:#fff] [&.primary]:[background:#0071e3] [&.primary]:[border-color:transparent] [&.primary]:[box-shadow:0_0.0625rem_0.125rem_#0001] [&.primary:hover:not(:disabled)]:[background:#0077ed] [&.primary:disabled]:bg-surface [&.primary:disabled]:[border-color:var(--line)] [&.primary:disabled]:[color:var(--tertiary)] [&.primary:disabled]:opacity-100 [&.primary:disabled]:[box-shadow:none]"
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
