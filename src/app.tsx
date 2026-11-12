import { useUrlFilters } from './hooks/use-url-filters';
import type { ArtistSort } from './utils/artist-sort';
import { FadeView } from './components/ui/fade-view';
import type { WatchFilter } from './data';
import { useMediaQuery } from './components/ui/use-media-query';
import { useImageShare } from './components/planner/use-image-share';
import { ImageShareDialog } from './components/planner/image-share-dialog';
import { MobileActions } from './components/planner/mobile-actions';
import { PriorityBoard } from './components/planner/priority-board';
import { ArtistCatalog } from './components/planner/artist-catalog';
import { ManualCopyDialog } from './components/planner/manual-copy-dialog';
import { AboutDialog } from './components/planner/about-dialog';
import { ExportMenu } from './components/planner/export-menu';
import { PlannerToolbar } from './components/planner/planner-toolbar';
import { SiteFooter } from './components/planner/site-footer';
import { SiteHeader } from './components/planner/site-header';
import { Check, CheckCheck, Info, LockKeyhole, ShieldCheck } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArtistPreviewContext, ArtistPreviewCoordinator } from './components/artist';
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
  const reducedMotion = useReducedMotion();
  const state = usePlanner();
  const language = state.language,
    t = messages(language);
  const {
    filters: { sort, search, watched, genres, countries, view },
    setFilter,
    resetFilters,
    hasFilters,
  } = useUrlFilters();
  const setSort = (value: ArtistSort) => setFilter('sort', value);
  const setSearch = (value: string) => setFilter('search', value);
  const setWatched = (value: WatchFilter) => setFilter('watched', value);
  const setGenres = (value: string[]) => setFilter('genres', value);
  const setCountries = (value: string[]) => setFilter('countries', value);
  const setView = (value: 'board' | 'artists') => setFilter('view', value);
  const [selected, setSelected] = useState<string | null>(null);
  const [about, setAbout] = useState(false);
  const [manual, setManual] = useState<ReturnType<typeof notionPayload> | null>(null);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const entries = useMemo(() => collectEntries(catalog, state), [state]);
  const mobile = useMediaQuery('(width < 47.5rem), (hover: none) and (pointer: coarse)');
  const imageShare = useImageShare(entries, language);
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
          'set.priority-brasil-2027.csv'
        );
        setToast(t.downloaded);
      } else if (format === 'image') {
        if (mobile) {
          if (!imageShare.file) {
            setToast(t.imagePreparing);
            return;
          }
          try {
            await navigator.share({
              files: [imageShare.file],
              title: 'set.priority | Tomorrowland Brasil 2027',
            });
          } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError'))
              setToast(t.imageShareFailed);
          }
          return;
        }
        const blob = await boardImage(entries, language);
        const file = new File([blob], 'set.priority-brasil-2027.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          setImageFile(file);
          return;
        }
        downloadBlob(file, file.name);
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
      if (mobile && format === 'image') {
        requestAnimationFrame(() =>
          document.querySelector<HTMLButtonElement>('.export-trigger')?.focus()
        );
      }
    }
  };
  return (
    <MotionConfig reducedMotion="user">
      <ArtistPreviewContext.Provider value={!selected && !about && !manual && !imageFile}>
        <ArtistPreviewCoordinator>
          <a
            className="skip-link fixed [top:-3.75rem] [left:1rem] [z-index:100] p-3 [background:var(--panel)] rounded-lg focus:[top:0.625rem]"
            href="#main"
          >
            {' '}
            {language === 'en' ? 'Skip to board' : 'Ir para o quadro'}
          </a>
          <SiteHeader language={language} />
          <main
            id="main"
            className="app-main max-w-384 px-10 pt-7 [margin:auto] max-[68.75rem]:[padding:1.875rem_1.5rem_0] max-[47.5rem]:[padding:1.75rem_1.25rem_0] max-[22.5rem]:[padding:1.5rem_1rem_0]"
          >
            <div className="page-heading mb-6 flex items-center justify-between gap-4 max-[47.5rem]:items-start">
              <div className="min-w-0">
                <h1
                  aria-label={t.planHeading}
                  className="text-4xl font-semibold leading-tight tracking-tight max-[47.5rem]:text-3xl"
                >
                  {t.planHeading.slice(0, -'Sets.'.length)}
                  <span className="whitespace-nowrap">
                    <span className="rounded-md bg-[#ff453a]/12 px-1 text-[#ff453a]">Sets</span>
                    <span
                      aria-hidden="true"
                      className="ml-0.5 inline-block size-[0.38086rem] rounded-full bg-[#ff453a] align-baseline max-[22.5rem]:size-[0.32645rem]"
                    />
                    <span className="sr-only">.</span>
                  </span>
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm max-[47.5rem]:text-xs">
                  <span className="text-content">Tomorrowland Brasil 2027</span>
                  <span aria-hidden="true" className="text-muted max-[47.5rem]:hidden">
                    ·
                  </span>
                  <span className="text-muted tabular-nums max-[47.5rem]:basis-full">
                    {t.dateRange}
                  </span>
                  <span className="plan-count inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
                    <CheckCheck size="0.875rem" className="text-[var(--teal)]" aria-hidden="true" />
                    <strong className="font-semibold tabular-nums text-content">
                      {entries.length}
                    </strong>
                    <span>{t.prioritized}</span>
                  </span>
                </div>
              </div>
              <ExportMenu
                language={language}
                count={entries.length}
                busy={busy}
                onExport={handleExport}
                mobile={mobile}
                imageShareStatus={imageShare.status}
                onPrepareImage={imageShare.prepare}
              />
            </div>
            {state.storageError && (
              <div
                className="storage-warning flex items-start gap-2.5 [padding:0.75rem_0.9375rem] mb-5 [border:0.0625rem_solid_color-mix(in_srgb,_var(--orange)_35%,_transparent)] [background:color-mix(in_srgb,_var(--orange)_6%,_transparent)] rounded-xl text-xs [line-height:1.65] [&_svg]:shrink-0 [&_svg]:[color:var(--orange)] [&_svg]:mt-0.5"
                role="alert"
              >
                <Info size="1.0625rem" />
                <p>
                  {state.storageError === 'recovered'
                    ? t.storageRecovered
                    : state.storageError === 'protected'
                      ? t.storageProtected
                      : state.storageError === 'migrationConflict'
                        ? t.storageMigrationConflict
                        : t.storageUnavailable}
                </p>
              </div>
            )}
            <PlannerToolbar
              onResetFilters={resetFilters}
              hasFilters={hasFilters}
              sort={sort}
              onSort={setSort}
              language={language}
              view={view}
              onView={setView}
              search={search}
              onSearch={setSearch}
              countries={countries}
              genres={genres}
              onCountries={setCountries}
              onGenres={setGenres}
              watched={watched}
              onWatched={setWatched}
            />
            <AnimatePresence mode="wait" initial={false}>
              <FadeView key={view}>
                {view === 'board' ? (
                  <PriorityBoard
                    sort={sort}
                    watched={watched}
                    language={language}
                    search={search}
                    countries={countries}
                    genres={genres}
                    onOpen={openArtist}
                  />
                ) : (
                  <ArtistCatalog
                    sort={sort}
                    watched={watched}
                    countries={countries}
                    genres={genres}
                    language={language}
                    search={search}
                    onSearch={setSearch}
                    onOpen={openArtist}
                  />
                )}
              </FadeView>
            </AnimatePresence>
            <div className="board-bottom flex justify-between gap-3 [padding:1.375rem_0_1.5rem] [color:var(--secondary)] [font-size:0.625rem] max-[47.5rem]:flex-col max-[47.5rem]:[padding:1.25rem_0] max-[47.5rem]:gap-2.5 max-[47.5rem]:[font-size:0.5625rem] [&_>_span]:inline-flex [&_>_span]:items-center [&_>_span]:gap-1.5">
              <span>
                <LockKeyhole size="0.8125rem" />
                {t.privacy}
              </span>
              <span>
                <ShieldCheck size="0.8125rem" />
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
          <ImageShareDialog
            mobile={mobile}
            file={imageFile}
            language={language}
            onClose={() => setImageFile(null)}
          />
          <MobileActions language={language} />
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
                className="toast fixed [z-index:110] [bottom:1.75rem] [left:50%] -translate-x-1/2 [width:max-content] [max-width:calc(100vw_-_2rem)] flex items-center gap-2.5 [color:var(--text)] [background:var(--panel)] [box-shadow:var(--shadow)] [border:0.0625rem_solid_var(--line)] rounded-xl [padding:0.9375rem_1.1875rem] text-xs max-[47.5rem]:[bottom:1.25rem] max-[47.5rem]:[font-size:0.6875rem] max-[47.5rem]:[line-height:1.6] [&_>_svg]:shrink-0 [&_>_svg]:[color:var(--teal)]"
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
              >
                <Check size="1rem" />
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </ArtistPreviewCoordinator>
      </ArtistPreviewContext.Provider>
    </MotionConfig>
  );
}
