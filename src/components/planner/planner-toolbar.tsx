import type { WatchFilter } from '../../data';
import { controlClassName, controlCountClassName, controlOptionClassName } from '../ui/control';
import { GenreFilter } from './genre-filter';
import { CheckCheck, Grid2X2, ListMusic, Search, X } from 'lucide-react';
import { catalog } from '../../data';
import { messages } from '../../i18n';
import type { Language } from '../../types';

export function PlannerToolbar({
  language,
  view,
  onView,
  search,
  onSearch,
  count,
  genres,
  onGenres,
  watched,
  onWatched,
}: {
  language: Language;
  view: 'board' | 'artists';
  onView: (view: 'board' | 'artists') => void;
  search: string;
  onSearch: (search: string) => void;
  count: number;
  watched: WatchFilter;
  onWatched: (value: WatchFilter) => void;
  genres: string[];
  onGenres: (genres: string[]) => void;
}) {
  const t = messages(language);
  const individualCount =
    catalog.sourceArtistCount ?? catalog.artists.filter((a) => !a.memberIds?.length).length;
  return (
    <div className="toolbar flex flex-wrap items-center gap-2 mb-4.5 max-[47.5rem]:grid max-[47.5rem]:[grid-template-columns:1fr_auto] max-[47.5rem]:gap-3.5 max-[47.5rem]:mb-4">
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
      <div className="flex min-w-0 flex-1 items-center gap-2 max-[47.5rem]:col-span-2 max-[47.5rem]:row-start-2">
        <GenreFilter language={language} selected={genres} onChange={onGenres} />
        <div
          className={`search ${controlClassName} flex items-center gap-2 [flex:1] min-w-0 max-w-none px-3 [color:var(--tertiary)] max-[47.5rem]:[max-width:none] [&_input]:outline-none [&_input]:[flex:1] [&_input]:min-w-0 [&_input]:w-full [&_input]:bg-transparent [&_input]:border-0 [&_input]:text-control [&_input]:[line-height:2.625rem] [&_input]:text-content [&:focus-within]:[outline:0.125rem_solid_var(--blue)] [&:focus-within]:[outline-offset:0.125rem] [&_input:focus-visible]:outline-none [&_input::-webkit-search-cancel-button]:hidden max-[47.5rem]:[&_input]:text-base`}
        >
          <Search size="1rem" />
          <input
            type="search"
            placeholder={t.search}
            aria-label={t.search}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
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
      </div>
      <label
        className={`${controlClassName} inline-flex items-center px-3 max-[47.5rem]:col-span-2`}
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
      <span className="plan-count max-[47.5rem]:col-start-2 max-[47.5rem]:row-start-1 [margin-left:auto] whitespace-nowrap flex items-center gap-1.5 text-muted [font-size:0.6875rem] max-[47.5rem]:[font-size:0.625rem] max-[47.5rem]:gap-1.25 max-[22.5rem]:[font-size:0.5625rem] max-[22.5rem]:gap-0.75 [&_svg]:[color:var(--teal)] [&_svg]:mr-0.75 [&_strong]:text-content [&_strong]:[font-variant-numeric:tabular-nums] max-[22.5rem]:[&_svg]:hidden">
        <CheckCheck size="1rem" />
        <strong>{count}</strong>
        <span>{t.prioritized}</span>
      </span>
    </div>
  );
}
