import { PriorityBoard } from './components/planner/priority-board';
import { ArtistCatalog } from './components/planner/artist-catalog';
import { ManualCopyDialog } from './components/planner/manual-copy-dialog';
import { AboutDialog } from './components/planner/about-dialog';
import { ExportMenu } from './components/planner/export-menu';
import { PlannerToolbar } from './components/planner/planner-toolbar';
import { SiteFooter } from './components/planner/site-footer';
import { SiteHeader } from './components/planner/site-header';
import { ArrowUpRight, Check, Info, LockKeyhole, ShieldCheck } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArtistPreviewContext } from './components/artist';
import { ArtistDetails } from './components/artist-details';
import { artistById, catalog } from './data';
import { longDate, messages } from './i18n';
import { usePlanner } from './store/planner';
import {
  boardImage,
  collectEntries,
  copyNotion,
  downloadBlob,
  notionPayload,
  toCsv,
} from './utils/exports';

export function App() {
  const state = usePlanner();
  const language = state.language,
    t = messages(language);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'board' | 'artists'>('board');
  const [selected, setSelected] = useState<string | null>(null);
  const [about, setAbout] = useState(false);
  const [manual, setManual] = useState<ReturnType<typeof notionPayload> | null>(null);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  const entries = useMemo(() => collectEntries(catalog, state), [state]);
  const artist = selected ? artistById.get(selected) : undefined;
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 5500);
    return () => clearTimeout(timeout);
  }, [toast]);
  const openArtist = (id: string) => {
    trigger.current = document.activeElement as HTMLElement;
    setSelected(id);
  };
  const restoreFocus = () => {
    if (trigger.current?.isConnected && !trigger.current.closest('[inert]'))
      trigger.current.focus();
    else {
      const card = Array.from(
        document.querySelectorAll<HTMLButtonElement>('[data-artist-id]')
      ).find((element) => element.dataset.artistId === selected && !element.closest('[inert]'));
      (card ?? document.getElementById('board-view'))?.focus();
    }
  };
  const handleExport = async (format: 'image' | 'csv' | 'notion') => {
    if (!entries.length) return;
    setBusy(true);
    try {
      if (format === 'csv') {
        downloadBlob(
          new Blob([toCsv(entries, language)], { type: 'text/csv;charset=utf-8' }),
          'set-prio-brasil-2027.csv'
        );
        setToast(t.downloaded);
      } else if (format === 'image') {
        downloadBlob(await boardImage(entries, language), 'set-prio-brasil-2027.png');
        setToast(t.downloaded);
      } else {
        const payload = notionPayload(entries, language);
        try {
          const format = await copyNotion(payload);
          setToast(format === 'html' ? t.copied : t.copiedText);
        } catch {
          setManual(payload);
        }
      }
    } catch {
      setToast(t.exportError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <MotionConfig reducedMotion="user">
      <ArtistPreviewContext.Provider value={!selected && !about && !manual}>
        <a
          className="skip-link fixed [top:-60px] [left:16px] [z-index:100] p-3 [background:var(--panel)] rounded-2"
          href="#main"
        >
          {' '}
          {language === 'en' ? 'Skip to board' : 'Ir para o quadro'}
        </a>
        <SiteHeader language={language} />
        <main
          id="main"
          className="app-main max-w-384 [padding:40px_40px_0] [margin:auto] max-[1100px]:[padding:30px_24px_0] max-[760px]:[padding:28px_20px_0] max-[360px]:[padding:24px_16px_0]"
        >
          <div className="page-heading flex justify-between items-center [gap:22px] mb-8 max-[760px]:mb-6 max-[760px]:items-start">
            <div>
              <div className="event-kicker flex gap-2 items-center [color:var(--secondary)] text-xs mb-3 font-medium max-[760px]:[font-size:10px] max-[760px]:[margin-bottom:10px]">
                <span className="live-dot [width:6px] [height:6px] [background:#ff453a] [border-radius:100%]" />
                {t.dateRange}
                <span className="location [font-size:9px] font-semibold [letter-spacing:0.085em] pl-2 [margin-left:2px] [border-left:1px_solid_var(--line)] max-[1100px]:hidden">
                  ITU, SÃO PAULO
                </span>
              </div>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
            <ExportMenu
              language={language}
              count={entries.length}
              busy={busy}
              onExport={handleExport}
            />
          </div>
          {state.storageError && (
            <div
              className="storage-warning flex items-start [gap:10px] [padding:12px_15px] mb-5 [border:1px_solid_color-mix(in_srgb,_var(--orange)_35%,_transparent)] [background:color-mix(in_srgb,_var(--orange)_6%,_transparent)] [border-radius:10px] text-xs [line-height:1.65]"
              role="alert"
            >
              <Info size={17} />
              <p>
                {state.storageError === 'recovered'
                  ? t.storageRecovered
                  : state.storageError === 'protected'
                    ? t.storageProtected
                    : t.storageUnavailable}
              </p>
            </div>
          )}
          <PlannerToolbar
            language={language}
            view={view}
            onView={setView}
            search={search}
            onSearch={setSearch}
            count={entries.length}
          />
          <div className="genre-notice flex items-center [gap:11px] [background:var(--blue-soft)] [border:1px_solid_var(--blue-line)] [color:var(--secondary)] [border-radius:11px] [padding:11px_14px] mb-6 max-[760px]:[padding:11px_12px] max-[760px]:gap-2 max-[760px]:items-start max-[760px]:mb-5">
            <Info size={17} />
            <p>
              <strong>{t.genreTitle}.</strong> {t.genreWarning}
            </p>
            <button
              type="button"
              className="icon-button w-11 h-11 inline-flex items-center justify-center bg-transparent [color:var(--secondary)] [border-radius:10px] shrink-0"
              aria-label={t.sources}
              onClick={() => setAbout(true)}
            >
              <ArrowUpRight size={17} />
            </button>
          </div>
          {view === 'board' ? (
            <PriorityBoard language={language} search={search} onOpen={openArtist} />
          ) : (
            <ArtistCatalog
              language={language}
              search={search}
              onSearch={setSearch}
              onOpen={openArtist}
            />
          )}
          <div className="board-bottom flex justify-between gap-3 [padding:22px_0_24px] [color:var(--secondary)] [font-size:10px] max-[760px]:flex-col max-[760px]:[padding:20px_0] max-[760px]:[gap:10px] max-[760px]:[font-size:9px]">
            <span>
              <LockKeyhole size={13} />
              {t.privacy}
            </span>
            <span>
              <ShieldCheck size={13} />
              {t.checked} {longDate(catalog.verifiedAt, language)}
            </span>
          </div>
        </main>
        <SiteFooter language={language} onAbout={() => setAbout(true)} />
        {artist && (
          <ArtistDetails
            key={artist.id}
            artist={artist}
            language={language}
            onClose={() => setSelected(null)}
            restoreFocus={restoreFocus}
          />
        )}
        <AboutDialog language={language} open={about} onOpenChange={setAbout} />
        <ManualCopyDialog
          language={language}
          payload={manual}
          onClose={() => setManual(null)}
          onExport={() => {
            void handleExport('csv');
          }}
        />
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              className="toast fixed [z-index:110] [bottom:28px] [left:50%] [transform:translateX(-50%)] [width:max-content] [max-width:calc(100vw_-_32px)] flex items-center [gap:10px] [color:var(--text)] [background:var(--panel)] [box-shadow:var(--shadow)] [border:1px_solid_var(--line)] rounded-3 [padding:15px_19px] text-xs max-[760px]:[bottom:20px] max-[760px]:[font-size:11px] max-[760px]:[line-height:1.6]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
            >
              <Check size={16} />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </ArtistPreviewContext.Provider>
    </MotionConfig>
  );
}
