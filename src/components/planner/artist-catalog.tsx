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
  onSearch,
  onOpen,
}: {
  language: Language;
  search: string;
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
        .filter((a) => matchesSearch(a, search))
        .sort((a, b) => a.name.localeCompare(b.name, language)),
    [search, language]
  );
  return (
    <section
      className="catalog-section bg-surface border border-separator [border-radius:17px] p-6 max-[760px]:[padding:18px_10px]"
      aria-label={t.allArtists}
    >
      <div className="catalog-heading flex justify-between [align-items:baseline] gap-3 mb-6 max-[760px]:[margin:0_8px_16px] max-[760px]:flex-col max-[760px]:gap-2">
        <h2>{t.allArtists}</h2>
        <span>
          {catalog.appearances.length} {t.performances} · {individualCount} {t.artistsLower}
        </span>
      </div>
      {visibleArtists.length ? (
        <div className="catalog-grid grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:8px_20px] max-[1100px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[760px]:[grid-template-columns:minmax(0,_1fr)] max-[760px]:[gap:2px]">
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
        <div className="no-results [padding:70px_12px] text-center grid [justify-items:center] gap-3 text-muted">
          <Search size={28} />
          <h3>{t.noResults}</h3>
          <p>{t.noResultsHint}</p>
          <button
            type="button"
            className="text-link inline-flex items-center gap-1 text-accent [font-size:11px] bg-transparent p-0"
            onClick={() => onSearch('')}
          >
            {t.clearSearch}
          </button>
        </div>
      )}
    </section>
  );
}
