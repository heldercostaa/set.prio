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
    <div className="toolbar flex items-center [gap:18px] [margin-bottom:18px] max-[760px]:grid max-[760px]:[grid-template-columns:1fr_auto] max-[760px]:[gap:14px] max-[760px]:mb-4">
      <fieldset
        className="view-switch flex shrink-0 [padding:3px] border border-separator [background:color-mix(in_srgb,_var(--line)_45%,_transparent)] [border-radius:11px] max-[760px]:[width:max-content]"
        aria-label={language === 'en' ? 'View' : 'Visualização'}
      >
        <button
          id="board-view"
          type="button"
          aria-pressed={view === 'board'}
          onClick={() => onView('board')}
        >
          <Grid2X2 size={16} />
          {t.board}
        </button>
        <button type="button" aria-pressed={view === 'artists'} onClick={() => onView('artists')}>
          <ListMusic size={17} />
          {t.artists}
          <span>{individualCount}</span>
        </button>
      </fieldset>
      <div className="search flex items-center [gap:9px] [flex:1] [min-width:100px] [max-width:450px] min-h-11 border border-separator bg-surface [border-radius:10px] [padding:0_13px] [color:var(--tertiary)] max-[760px]:[grid-column:1_/_-1] max-[760px]:[grid-row:2] max-[760px]:[max-width:none]">
        <Search size={17} />
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
            className="search-clear [min-width:28px] min-h-10 bg-transparent grid [place-items:center] text-muted max-[760px]:[min-width:44px]"
            aria-label={t.clearSearch}
            onClick={() => onSearch('')}
          >
            <X size={15} />
          </button>
        )}
      </div>
      <span className="plan-count [margin-left:auto] whitespace-nowrap flex items-center [gap:6px] text-muted [font-size:11px] max-[760px]:[font-size:10px] max-[760px]:[gap:5px] max-[360px]:[font-size:9px] max-[360px]:[gap:3px]">
        <CheckCheck size={16} />
        <strong>{count}</strong>
        <span>{t.prioritized}</span>
      </span>
    </div>
  );
}
