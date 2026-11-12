import { useEffect, useState } from 'react';
import { Share, Download } from 'lucide-react';
import { Modal } from '../ui/modal';
import { downloadBlob } from '../../utils/exports';
import type { Language } from '../../types';
export function ImageShareDialog({
  file,
  language,
  onClose,
}: {
  file: File | null;
  language: Language;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const en = language === 'en';
  useEffect(() => {
    if (!file) return;
    const value = URL.createObjectURL(file);
    setUrl(value);
    setError('');
    return () => URL.revokeObjectURL(value);
  }, [file]);
  const share = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: 'set.prio | Tomorrowland Brasil 2027' });
      onClose();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError'))
        setError(
          en
            ? 'Sharing failed. You can download the image instead.'
            : 'Não foi possível compartilhar. Você pode baixar a imagem.'
        );
    }
  };
  return (
    <Modal
      open={file !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={en ? 'Save or share your image' : 'Salve ou compartilhe sua imagem'}
      description={
        en
          ? 'Choose Save Image in the share sheet to save to Photos, when available.'
          : 'Escolha Salvar Imagem no menu de compartilhamento para salvar no app Fotos, quando disponível.'
      }
      closeLabel={en ? 'Close' : 'Fechar'}
      onRestoreFocus={() => document.querySelector<HTMLButtonElement>('.export-trigger')?.focus()}
    >
      <div className="grid gap-4 overflow-y-auto p-5">
        {url && (
          <img
            src={url}
            alt={en ? 'Your complete priority board' : 'Seu quadro completo de prioridades'}
            className="max-h-[50dvh] w-full rounded-lg object-contain"
          />
        )}
        {error && (
          <p role="alert" className="text-sm">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void share();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm text-white"
          >
            <Share size="1.125rem" aria-hidden="true" />
            {en ? 'Share image' : 'Compartilhar imagem'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (file) downloadBlob(file, file.name);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-separator px-4 text-sm"
          >
            <Download size={18} />
            {en ? 'Download image' : 'Baixar imagem'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
