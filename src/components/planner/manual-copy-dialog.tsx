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
      <div className="manual-body p-6">
        <textarea
          ref={manualText}
          readOnly
          value={payload?.text ?? ''}
          aria-label={t.manualTitle}
          onFocus={(event) => event.target.select()}
        />
        <div className="manual-actions flex [gap:10px] [justify-content:flex-end] mt-4">
          <button
            type="button"
            className="button inline-flex justify-center [gap:9px] items-center min-h-11 [padding:10px_16px] bg-surface border border-separator [border-radius:10px] text-xs font-semibold [transition:background_0.15s,_transform_0.15s]"
            onClick={() => {
              manualText.current?.focus();
              manualText.current?.select();
            }}
          >
            {t.selectText}
          </button>
          <button
            type="button"
            className="button inline-flex justify-center [gap:9px] items-center min-h-11 [padding:10px_16px] bg-surface border border-separator [border-radius:10px] text-xs font-semibold [transition:background_0.15s,_transform_0.15s] primary"
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
