import { useRef } from 'react';
import { CountryFilter } from './country-filter';
import { ArtistSort } from './artist-sort';
import type { ArtistSort as Sort } from '../../utils/artist-sort';
import type { WatchFilter } from '../../data';
import { controlClassName, controlCountClassName, controlOptionClassName } from '../ui/control';
import { GenreFilter } from './genre-filter';
import { Grid2X2, ListMusic, RotateCcw, Search, X } from 'lucide-react';
import { catalog } from '../../data';
import { messages } from '../../i18n';
import type { Language } from '../../types';

export function PlannerToolbar({
  onResetFilters,
  hasFilters,
  sort,
  onSort,
  language,
  view,
  onView,
  search,
  onSearch,
  countries,
  onCountries,
  genres,
  onGenres,
  watched,
  onWatched,
}: {
  onResetFilters: () => void;
  hasFilters: boolean;
  sort: Sort;
  onSort: (value: Sort) => void;
  language: Language;
  view: 'board' | 'artists';
  onView: (view: 'board' | 'artists') => void;
  search: string;
  onSearch: (search: string) => void;
  watched: WatchFilter;
  onWatched: (value: WatchFilter) => void;
  countries: string[];
  onCountries: (countries: string[]) => void;
  genres: string[];
  onGenres: (genres: string[]) => void;
}) {
  const searchInput = useRef<HTMLInputElement>(null);
  const t = messages(language);
  const individualCount =
    catalog.sourceArtistCount ?? catalog.artists.filter((a) => !a.memberIds?.length).length;
  return (
    <div className="toolbar relative mb-6 max-[47.5rem]:mb-5">
      <div className="flex flex-wrap items-center gap-2 max-[47.5rem]:flex-col max-[47.5rem]:items-stretch max-[47.5rem]:gap-3.5">
        <fieldset
          className={`view-switch ${controlClassName} flex shrink-0 max-[47.5rem]:w-max`}
          aria-label={language === 'en' ? 'View' : 'Visualização'}
        >
          <button
            id="board-view"
            className={controlOptionClassName}
            type="button"
            aria-pressed={view === 'board'}
            onClick={() => onView('board')}
          >
            <Grid2X2 size="1rem" />
            {t.board}
          </button>
          <button
            type="button"
            className={controlOptionClassName}
            aria-pressed={view === 'artists'}
            onClick={() => onView('artists')}
          >
            <ListMusic size="1rem" />
            {t.artists}
            <span className={controlCountClassName}>{individualCount}</span>
          </button>
        </fieldset>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 ">
          <GenreFilter language={language} selected={genres} onChange={onGenres} />
          <CountryFilter language={language} selected={countries} onChange={onCountries} />
          <label
            className={`${controlClassName} inline-flex shrink-0 items-center px-3 max-[47.5rem]:min-w-48 max-[47.5rem]:flex-1`}
          >
            <span className="sr-only">
              {language === 'en' ? 'Watched status' : 'Status de visualização'}
            </span>
            <select
              className="min-h-11 w-full cursor-pointer bg-transparent text-control text-content outline-none max-[47.5rem]:text-base"
              value={watched}
              onChange={(event) => onWatched(event.target.value as WatchFilter)}
            >
              <option value="all">{language === 'en' ? 'All sets' : 'Todos os sets'}</option>
              <option value="watched">{language === 'en' ? 'Watched' : 'Assistidos'}</option>
              <option value="unwatched">
                {language === 'en' ? 'Not watched yet' : 'Ainda não assistidos'}
              </option>
            </select>
          </label>
          <div
            className={`search ${controlClassName} flex items-center gap-2 [flex:1] min-w-0 max-w-none px-3 max-[47.5rem]:basis-full [color:var(--tertiary)] max-[47.5rem]:[max-width:none] [&_input]:outline-none [&_input]:[flex:1] [&_input]:min-w-0 [&_input]:w-full [&_input]:bg-transparent [&_input]:border-0 [&_input]:text-control [&_input]:[line-height:2.625rem] [&_input]:text-content [&:focus-within]:[outline:0.125rem_solid_var(--blue)] [&:focus-within]:[outline-offset:0.125rem] [&_input:focus-visible]:outline-none [&_input::-webkit-search-cancel-button]:hidden max-[47.5rem]:[&_input]:text-base`}
          >
            <Search size="1rem" />
            <input
              ref={searchInput}
              type="search"
              placeholder={t.search}
              aria-label={t.search}
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
            <button
              type="button"
              aria-label={t.resetFilters}
              title={t.resetFilters}
              disabled={!hasFilters}
              onClick={() => {
                onResetFilters();
                searchInput.current?.focus();
              }}
              className={`grid size-11 shrink-0 place-items-center rounded-lg bg-transparent text-accent hover:bg-raised ${hasFilters ? '' : 'invisible'}`}
            >
              <RotateCcw size="1rem" aria-hidden="true" />
            </button>
            {search && (
              <button
                type="button"
                className="search-clear -mr-3 grid size-11 shrink-0 place-items-center bg-transparent text-muted"
                aria-label={t.clearSearch}
                onClick={() => onSearch('')}
              >
                <X size="1rem" />
              </button>
            )}
          </div>
          <ArtistSort value={sort} onChange={onSort} language={language} />
        </div>
      </div>
    </div>
  );
}
