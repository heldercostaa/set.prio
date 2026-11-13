import { Crown } from 'lucide-react';
import type { Language } from '../types';

export function ExceptionalCrown({
  language,
  className = '',
}: {
  language: Language;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={
        language === 'en' ? 'Exceptional rating: 11 out of 10' : 'Avaliação excepcional: 11 de 10'
      }
      className={`exceptional-crown pointer-events-none inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-[#ffd58066] bg-surface text-[#ffd580] shadow-sm ${className}`}
    >
      <Crown size="1rem" strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}
