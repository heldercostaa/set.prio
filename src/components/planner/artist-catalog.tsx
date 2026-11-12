import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { ArtistCard } from '../../components/artist';
import { appearancesFor, catalog, matchesSearch } from '../../data';
import { messages } from '../../i18n';
import { usePlanner } from '../../store/planner';
import type { Language } from '../../types';

export function ArtistCatalog({
  language,
  search,
  genres = [],
  onSearch,
  onOpen,
}: {
  language: Language;
  search: string;
  genres?: string[];
  onSearch: (value: string) => void;
  onOpen: (id: string) => void;
}) {
  const t = messages(language);
  const priorities = usePlanner((s) => s.priorities);
  const individualCount =
    catalog.sourceArtistCount ?? catalog.artists.filter((a) => !a.memberIds?.length).length;
  const visibleArtists = useMemo(
    () =>
      catalog.artists
        .filter((a) => matchesSearch(a, search, genres))
        .sort((a, b) => a.name.localeCompare(b.name, language)),
    [search, language, genres]
  );
  return (
    <section
      className="catalog-section bg-surface border border-separator rounded-2xl p-6 max-[47.5rem]:[padding:1.125rem_0.625rem]"
      aria-label={t.allArtists}
    >
      <div className="catalog-heading flex justify-between [align-items:baseline] gap-3 mb-6 max-[47.5rem]:[margin:0_0.5rem_1rem] max-[47.5rem]:flex-col max-[47.5rem]:gap-2">
        <h2>{t.allArtists}</h2>
        <span>
          {catalog.appearances.length} {t.performances} · {individualCount} {t.artistsLower}
        </span>
      </div>
      {visibleArtists.length ? (
        <div className="catalog-grid grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:0.5rem_1.25rem] max-[68.75rem]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[47.5rem]:[grid-template-columns:minmax(0,_1fr)] max-[47.5rem]:gap-0.5">
          {visibleArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              language={language}
              prioritized={appearancesFor(artist).some((appearance) => priorities[appearance.id])}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="no-results [padding:4.375rem_0.75rem] text-center grid [justify-items:center] gap-3 text-muted">
          <Search size="1.75rem" />
          <h3>{t.noResults}</h3>
          <p>{t.noResultsHint}</p>
          <button
            type="button"
            className="text-link inline-flex items-center gap-1 text-accent [font-size:0.6875rem] bg-transparent p-0"
            onClick={() => onSearch('')}
          >
            {t.clearSearch}
          </button>
        </div>
      )}
    </section>
  );
}
