import { ArrowDownAZ, ArrowDownWideNarrow, ArrowDownZA, ArrowUpNarrowWide } from 'lucide-react';
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
      className={`${controlClassName} relative grid size-11 shrink-0 place-items-center`}
      title={t.sortHint}
    >
      {value === 'name-asc' || value === 'genre' ? (
        <ArrowDownAZ size="1rem" className="text-muted" aria-hidden="true" />
      ) : value === 'name-desc' ? (
        <ArrowDownZA size="1rem" className="text-muted" aria-hidden="true" />
      ) : value === 'rating-desc' ? (
        <ArrowDownWideNarrow size="1rem" className="text-muted" aria-hidden="true" />
      ) : (
        <ArrowUpNarrowWide size="1rem" className="text-muted" aria-hidden="true" />
      )}
      <select
        aria-label={t.sortBy}
        value={value}
        onChange={(event) => onChange(event.target.value as Sort)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
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
