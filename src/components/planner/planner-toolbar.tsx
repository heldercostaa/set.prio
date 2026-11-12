import { controlClassName } from '../ui/control';
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
}: {
  language: Language;
  view: 'board' | 'artists';
  onView: (view: 'board' | 'artists') => void;
  search: string;
  onSearch: (search: string) => void;
  count: number;
  genres: string[];
  onGenres: (genres: string[]) => void;
}) {
  const t = messages(language);
  const individualCount =
    catalog.sourceArtistCount ?? catalog.artists.filter((a) => !a.memberIds?.length).length;
  return (
    <div className="toolbar flex flex-wrap items-center gap-4.5 mb-4.5 max-[47.5rem]:grid max-[47.5rem]:[grid-template-columns:1fr_auto] max-[47.5rem]:gap-3.5 max-[47.5rem]:mb-4">
      <fieldset
        className="view-switch flex shrink-0 p-0.75 border border-separator [background:color-mix(in_srgb,_var(--line)_45%,_transparent)] rounded-xl max-[47.5rem]:[width:max-content] [&_button]:min-h-11 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:[padding:0_0.8125rem] [&_button]:gap-1.75 [&_button]:text-muted [&_button]:text-control [&_button]:font-medium [&_button]:bg-transparent [&_button]:rounded-lg [&_button[aria-pressed='true']]:text-content [&_button[aria-pressed='true']]:bg-surface [&_button[aria-pressed='true']]:[box-shadow:0_0.0625rem_0.25rem_#0000000c] [&_button_>_span]:text-muted [&_button_>_span]:[font-size:0.625rem] [&_button_>_span]:font-medium max-[47.5rem]:[&_button]:min-h-11 max-[47.5rem]:[&_button]:[padding:0_0.8125rem] max-[22.5rem]:[&_button]:[padding:0_0.625rem] max-[22.5rem]:[&_button]:[font-size:0.6875rem]"
        aria-label={language === 'en' ? 'View' : 'Visualização'}
      >
        <button
          id="board-view"
          type="button"
          aria-pressed={view === 'board'}
          onClick={() => onView('board')}
        >
          <Grid2X2 size="1rem" />
          {t.board}
        </button>
        <button type="button" aria-pressed={view === 'artists'} onClick={() => onView('artists')}>
          <ListMusic size="1.0625rem" />
          {t.artists}
          <span>{individualCount}</span>
        </button>
      </fieldset>
      <div className="flex min-w-0 flex-1 items-center gap-2 max-[47.5rem]:col-span-2 max-[47.5rem]:row-start-2">
        <GenreFilter language={language} selected={genres} onChange={onGenres} />
        <div
          className={`search ${controlClassName} flex items-center gap-2.25 [flex:1] min-w-0 max-w-none [padding:0_0.8125rem] [color:var(--tertiary)] max-[47.5rem]:[max-width:none] [&_input]:outline-none [&_input]:[flex:1] [&_input]:min-w-0 [&_input]:w-full [&_input]:bg-transparent [&_input]:border-0 [&_input]:text-control [&_input]:[line-height:2.625rem] [&_input]:text-content [&:focus-within]:[outline:0.125rem_solid_var(--blue)] [&:focus-within]:[outline-offset:0.125rem] [&_input:focus-visible]:outline-none [&_input::-webkit-search-cancel-button]:hidden max-[47.5rem]:[&_input]:text-base`}
        >
          <Search size="1.0625rem" />
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
              className="search-clear [min-width:1.75rem] min-h-10 bg-transparent grid [place-items:center] text-muted max-[47.5rem]:[min-width:2.75rem] max-[47.5rem]:min-h-11"
              aria-label={t.clearSearch}
              onClick={() => onSearch('')}
            >
              <X size="0.9375rem" />
            </button>
          )}
        </div>
      </div>
      <span className="plan-count max-[47.5rem]:col-start-2 max-[47.5rem]:row-start-1 [margin-left:auto] whitespace-nowrap flex items-center gap-1.5 text-muted [font-size:0.6875rem] max-[47.5rem]:[font-size:0.625rem] max-[47.5rem]:gap-1.25 max-[22.5rem]:[font-size:0.5625rem] max-[22.5rem]:gap-0.75 [&_svg]:[color:var(--teal)] [&_svg]:mr-0.75 [&_strong]:text-content [&_strong]:[font-variant-numeric:tabular-nums] max-[22.5rem]:[&_svg]:hidden">
        <CheckCheck size="1rem" />
        <strong>{count}</strong>
        <span>{t.prioritized}</span>
      </span>
    </div>
  );
}
