import { ArrowDownWideNarrow } from 'lucide-react';
import { messages } from '../../i18n';
import type { Language } from '../../types';
import { ARTIST_SORTS, type ArtistSort as Sort } from '../../utils/artist-sort';
import { controlClassName } from '../ui/control';
export function ArtistSort({
  value,
  onChange,
  language,
}: {
  value: Sort;
  onChange: (sort: Sort) => void;
  language: Language;
}) {
  const t = messages(language);
  return (
    <label
      className={`${controlClassName} flex min-w-0 shrink-0 items-center gap-2 px-3 max-[47.5rem]:basis-full`}
      title={t.sortHint}
    >
      <ArrowDownWideNarrow size="1rem" className="shrink-0 text-muted" aria-hidden="true" />
      <span className="sr-only">{t.sortBy}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Sort)}
        className="min-h-11 min-w-0 w-full cursor-pointer bg-transparent text-control text-content outline-none max-[47.5rem]:text-base"
      >
        {ARTIST_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {t.sortLabels[sort]}
          </option>
        ))}
      </select>
    </label>
  );
}
