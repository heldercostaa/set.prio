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
}: {
  language: Language;
  view: 'board' | 'artists';
  onView: (view: 'board' | 'artists') => void;
  search: string;
  onSearch: (search: string) => void;
  count: number;
}) {
  const t = messages(language);
  const individualCount =
    catalog.sourceArtistCount ?? catalog.artists.filter((a) => !a.memberIds?.length).length;
  return (
    <div className="toolbar flex items-center gap-4.5 mb-4.5 max-[47.5rem]:grid max-[47.5rem]:[grid-template-columns:1fr_auto] max-[47.5rem]:gap-3.5 max-[47.5rem]:mb-4">
      <fieldset
        className="view-switch flex shrink-0 p-0.75 border border-separator [background:color-mix(in_srgb,_var(--line)_45%,_transparent)] rounded-2.75 max-[47.5rem]:[width:max-content]"
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
      <div className="search flex items-center gap-2.25 [flex:1] [min-width:6.25rem] max-w-112.5 min-h-11 border border-separator bg-surface rounded-2.5 [padding:0_13px] [color:var(--tertiary)] max-[47.5rem]:[grid-column:1_/_-1] max-[47.5rem]:[grid-row:2] max-[47.5rem]:[max-width:none]">
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
            className="search-clear [min-width:1.75rem] min-h-10 bg-transparent grid [place-items:center] text-muted max-[47.5rem]:[min-width:2.75rem]"
            aria-label={t.clearSearch}
            onClick={() => onSearch('')}
          >
            <X size="0.9375rem" />
          </button>
        )}
      </div>
      <span className="plan-count [margin-left:auto] whitespace-nowrap flex items-center gap-1.5 text-muted [font-size:0.6875rem] max-[47.5rem]:[font-size:0.625rem] max-[47.5rem]:gap-1.25 max-[22.5rem]:[font-size:0.5625rem] max-[22.5rem]:gap-0.75">
        <CheckCheck size="1rem" />
        <strong>{count}</strong>
        <span>{t.prioritized}</span>
      </span>
    </div>
  );
}
