import { useRef, useState } from 'react';
import { boardImage, type ExportEntry } from '../../utils/exports';
import type { Language } from '../../types';

export type ImageShareStatus = 'idle' | 'preparing' | 'ready' | 'unsupported' | 'error';
export function useImageShare(entries: ExportEntry[], language: Language) {
  const request = useRef(0);
  const [prepared, setPrepared] = useState<{
    entries: ExportEntry[];
    language: Language;
    status: ImageShareStatus;
    file: File | null;
  } | null>(null);
  const current = prepared?.entries === entries && prepared.language === language;
  const prepare = async () => {
    if (current && (prepared.status === 'ready' || prepared.status === 'preparing')) return;
    const id = ++request.current;
    const update = (status: ImageShareStatus, file: File | null = null) => {
      if (id === request.current) setPrepared({ entries, language, status, file });
    };
    if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
      update('unsupported');
      return;
    }
    update('preparing');
    try {
      const blob = await boardImage(entries, language);
      const file = new File([blob], 'set.priority-brasil-2027.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) update('ready', file);
      else update('unsupported');
    } catch {
      update('error');
    }
  };
  return {
    file: current && prepared.status === 'ready' ? prepared.file : null,
    status: current ? prepared.status : ('idle' as ImageShareStatus),
    prepare,
  };
}
