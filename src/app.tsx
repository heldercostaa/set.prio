import { publicAsset } from './utils/assets';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  Clipboard,
  Download,
  Flame,
  Code,
  Globe2,
  Grid2X2,
  Info,
  ListMusic,
  LoaderCircle,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArtistCard, ArtistChip, ArtistPreviewContext } from './components/artist';
import { ArtistDetails } from './components/artist-details';
import { Modal } from './components/ui/modal';
import { appearancesFor, artistById, catalog, matchesSearch } from './data';
import { dayName, longDate, messages, priorityLabel, shortDate } from './i18n';
import { usePlanner } from './store/planner';
import { DAYS, PRIORITIES, type Appearance, type Day, type Language, type Priority } from './types';
import {
  boardImage,
  collectEntries,
  copyNotion,
  downloadBlob,
  notionPayload,
  toCsv,
} from './utils/exports';

function Brand() {
  return (
    <div className="brand">
      <img src={publicAsset('/logo.svg')} width={46} height={46} alt="" />
      <div>
        <div className="wordmark">
          set<span>.</span>
          <strong>prio</strong>
        </div>
        <p>Tomorrowland Brasil 2027</p>
      </div>
    </div>
  );
}
function PriorityGroup({
  day,
  priority,
  appearances,
  language,
  onOpen,
}: {
  day: Day | null;
  priority: Priority | null;
  appearances: Appearance[];
  language: Language;
  onOpen: (id: string) => void;
}) {
  const t = messages(language);
  const { setNodeRef, isOver } = useDroppable({
    id: `${day ?? 'tba'}:${priority ?? 'none'}`,
    data: { day, priority },
  });
  const [expanded, setExpanded] = useState(true);
  const label = priority ? priorityLabel(priority, language) : t.unprioritized;
  return (
    <section
      ref={setNodeRef}
      className={`priority-group ${isOver ? 'drop-active ' : ''}${priority ? `priority-${priority.toLowerCase()}` : 'unranked-group'}`}
      aria-label={`${dayName(day, language)} · ${label}`}
      data-testid={`${day ?? 'tba'}-${priority ?? 'unprioritized'}`}
    >
      <div className="group-heading">
        {priority ? (
          <h3 className="priority-badge">
            <span className="priority-dot" />
            {priority}
            <span className="priority-name">{label}</span>
          </h3>
        ) : (
          <button
            type="button"
            className="unranked-toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown size={13} className={expanded ? '' : 'collapsed'} />
            {label}
          </button>
        )}
        <span className="group-count">{appearances.length}</span>
      </div>
      {expanded && (
        <div className="artist-chips">
          <AnimatePresence initial={false}>
            {appearances.map((appearance) => (
              <ArtistChip
                key={appearance.id}
                appearance={appearance}
                language={language}
                priority={priority}
                onOpen={onOpen}
              />
            ))}
          </AnimatePresence>
          {appearances.length === 0 && (
            <p className="empty-priority">{priority === 'P0' ? t.emptyPriority : '—'}</p>
          )}
        </div>
      )}
    </section>
  );
}
function DayColumn({
  day,
  index,
  search,
  language,
  onOpen,
}: {
  day: Day | null;
  index: number;
  search: string;
  language: Language;
  onOpen: (id: string) => void;
}) {
  const priorities = usePlanner((state) => state.priorities);
  const Icon = [Flame, Zap, Sparkles][index] ?? CalendarDays;
  const appearances = catalog.appearances
    .filter((appearance) => {
      const artist = artistById.get(appearance.artistId);
      return appearance.day === day && artist !== undefined && matchesSearch(artist, search);
    })
    .sort((a, b) =>
      (artistById.get(a.artistId)?.name ?? '').localeCompare(
        artistById.get(b.artistId)?.name ?? '',
        language
      )
    );
  const total = catalog.appearances.filter((appearance) => appearance.day === day);
  const ranked = total.filter((appearance) => priorities[appearance.id]).length;
  const t = messages(language);
  return (
    <article className={`day-column day-${index}`} aria-label={dayName(day, language)}>
      <header className="day-heading">
        <div className="day-date">
          {day ? shortDate(day, language) : '—'}
          <span>
            {total.length} {t.performances}
          </span>
        </div>
        <div className="day-title">
          <span className="day-icon">
            <Icon size={20} strokeWidth={1.8} />
          </span>
          <h2>{dayName(day, language)}</h2>
          <span className="day-progress" title={`${ranked}/${total.length}`}>
            {ranked}
            <span>/{total.length}</span>
          </span>
        </div>
      </header>
      <div className="day-groups">
        {[...PRIORITIES, null].map((priority) => (
          <PriorityGroup
            key={priority ?? 'none'}
            day={day}
            priority={priority}
            appearances={appearances.filter(
              (appearance) => (priorities[appearance.id] ?? null) === priority
            )}
            language={language}
            onOpen={onOpen}
          />
        ))}
      </div>
    </article>
  );
}
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
  const [dragName, setDragName] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const trigger = useRef<HTMLElement | null>(null);
  const manualText = useRef<HTMLTextAreaElement>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 7 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );
  const entries = useMemo(() => collectEntries(catalog, state), [state]);
  const artist = selected ? artistById.get(selected) : undefined;
  const individualCount =
    catalog.sourceArtistCount ?? catalog.artists.filter((a) => !a.memberIds?.length).length;
  const visibleArtists = useMemo(
    () =>
      catalog.artists
        .filter((a) => matchesSearch(a, search))
        .sort((a, b) => a.name.localeCompare(b.name, language)),
    [search, language]
  );
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
  const endDrag = ({ active, over }: DragEndEvent) => {
    setDragName(null);
    const appearance = active.data.current?.appearance as Appearance | undefined;
    if (appearance && over && over.data.current?.day === appearance.day) {
      state.setPriority(appearance.id, over.data.current.priority as Priority | null);
      setAnnouncement(t.dragFinished);
    } else setAnnouncement(t.dragRejected);
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
        <a className="skip-link" href="#main">
          {' '}
          {language === 'en' ? 'Skip to board' : 'Ir para o quadro'}
        </a>
        <header className="site-header">
          <div className="header-inner">
            <Brand />
            <div className="header-actions">
              <fieldset
                className="language-control"
                aria-label={language === 'en' ? 'Language' : 'Idioma'}
              >
                <Globe2 size={15} />
                <button
                  type="button"
                  aria-pressed={language === 'en'}
                  aria-label={t.english}
                  onClick={() => state.setLanguage('en')}
                >
                  EN
                </button>
                <button
                  type="button"
                  aria-pressed={language === 'pt-BR'}
                  aria-label={t.portuguese}
                  onClick={() => state.setLanguage('pt-BR')}
                >
                  PT
                </button>
              </fieldset>
              <a
                className="icon-button github-link"
                href="https://github.com/heldercostaa/set.prio"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <Code size={19} />
              </a>
            </div>
          </div>
        </header>
        <main id="main" className="app-main">
          <div className="page-heading">
            <div>
              <div className="event-kicker">
                <span className="live-dot" />
                {t.dateRange}
                <span className="location">ITU, SÃO PAULO</span>
              </div>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="button primary export-trigger"
                  disabled={!entries.length || busy}
                  title={!entries.length ? t.noPlan : undefined}
                >
                  {busy ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <ArrowDownToLine size={17} />
                  )}
                  {busy ? t.copying : t.export}
                  <ChevronDown size={14} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="menu export-menu"
                  align="end"
                  sideOffset={10}
                  collisionPadding={12}
                >
                  <DropdownMenu.Label>
                    {entries.length} {t.rowCount}
                  </DropdownMenu.Label>
                  <p className="export-scope">{t.exportScope}</p>
                  {(
                    [
                      { key: 'image', Icon: Download, label: t.image, hint: t.imageHint },
                      { key: 'csv', Icon: Grid2X2, label: t.csv, hint: t.csvHint },
                      { key: 'notion', Icon: Clipboard, label: t.notion, hint: t.notionHint },
                    ] as const
                  ).map(({ key, Icon, label, hint }) => (
                    <DropdownMenu.Item
                      key={key}
                      className="menu-item export-item"
                      onSelect={() => {
                        void handleExport(key);
                      }}
                    >
                      <Icon size={19} />
                      <span>
                        <strong>{label}</strong>
                        <small>{hint}</small>
                      </span>
                      <ArrowUpRight size={14} />
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          {state.storageError && (
            <div className="storage-warning" role="alert">
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
          <div className="toolbar">
            <fieldset
              className="view-switch"
              aria-label={language === 'en' ? 'View' : 'Visualização'}
            >
              <button
                id="board-view"
                type="button"
                aria-pressed={view === 'board'}
                onClick={() => setView('board')}
              >
                <Grid2X2 size={16} />
                {t.board}
              </button>
              <button
                type="button"
                aria-pressed={view === 'artists'}
                onClick={() => setView('artists')}
              >
                <ListMusic size={17} />
                {t.artists}
                <span>{individualCount}</span>
              </button>
            </fieldset>
            <div className="search">
              <Search size={17} />
              <input
                type="search"
                placeholder={t.search}
                aria-label={t.search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label={t.clearSearch}
                  onClick={() => setSearch('')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <span className="plan-count">
              <CheckCheck size={16} />
              <strong>{entries.length}</strong>
              <span>{t.prioritized}</span>
            </span>
          </div>
          <div className="genre-notice">
            <Info size={17} />
            <p>
              <strong>{t.genreTitle}.</strong> {t.genreWarning}
            </p>
            <button
              type="button"
              className="icon-button"
              aria-label={t.sources}
              onClick={() => setAbout(true)}
            >
              <ArrowUpRight size={17} />
            </button>
          </div>
          {view === 'board' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => {
                const a = active.data.current?.appearance as Appearance;
                setDragName(artistById.get(a.artistId)?.name ?? null);
                setAnnouncement(t.dragStarted);
              }}
              onDragEnd={endDrag}
              onDragCancel={() => setDragName(null)}
              accessibility={{ screenReaderInstructions: { draggable: t.move } }}
            >
              <fieldset className="mobile-days" aria-label={t.officialDay}>
                {DAYS.map((day) => (
                  <button
                    type="button"
                    key={day}
                    aria-pressed={state.activeDay === day}
                    onClick={() => state.setDay(day)}
                  >
                    {dayName(day, language)}
                  </button>
                ))}
              </fieldset>
              <div className="board-grid">
                {DAYS.map((day, index) => (
                  <div
                    className={`day-slot ${state.activeDay === day ? 'active-day' : ''}`}
                    key={day}
                  >
                    <DayColumn
                      day={day}
                      index={index}
                      search={search}
                      language={language}
                      onOpen={openArtist}
                    />
                  </div>
                ))}
              </div>
              {catalog.appearances.some((appearance) => appearance.day === null) && (
                <div className="tba-board">
                  <DayColumn
                    day={null}
                    index={3}
                    search={search}
                    language={language}
                    onOpen={openArtist}
                  />
                </div>
              )}
              <DragOverlay>
                {dragName && <div className="drag-overlay">{dragName}</div>}
              </DragOverlay>
            </DndContext>
          ) : (
            <section className="catalog-section" aria-label={t.allArtists}>
              <div className="catalog-heading">
                <h2>{t.allArtists}</h2>
                <span>
                  {catalog.appearances.length} {t.performances} · {individualCount} {t.artistsLower}
                </span>
              </div>
              {visibleArtists.length ? (
                <div className="catalog-grid">
                  {visibleArtists.map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      language={language}
                      prioritized={appearancesFor(artist).some(
                        (appearance) => state.priorities[appearance.id]
                      )}
                      onOpen={openArtist}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <Search size={28} />
                  <h3>{t.noResults}</h3>
                  <p>{t.noResultsHint}</p>
                  <button type="button" className="text-link" onClick={() => setSearch('')}>
                    {t.clearSearch}
                  </button>
                </div>
              )}
            </section>
          )}
          <div className="board-bottom">
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
        <footer className="site-footer">
          <div>
            <span>
              {t.createdBy}{' '}
              <a href="https://github.com/heldercostaa" target="_blank" rel="noreferrer">
                Helder Costa
                <ArrowUpRight size={12} />
              </a>
            </span>
            <span className="footer-note">{t.officialNote}</span>
          </div>
          <div>
            <a
              href="https://brasil.tomorrowland.com/pt/line-up/?page=artists"
              target="_blank"
              rel="noreferrer"
            >
              {t.source}
              <ArrowUpRight size={12} />
            </a>
            <button type="button" onClick={() => setAbout(true)}>
              {t.sources}
            </button>
          </div>
        </footer>
        {artist && (
          <ArtistDetails
            key={artist.id}
            artist={artist}
            language={language}
            onClose={() => setSelected(null)}
            restoreFocus={restoreFocus}
          />
        )}
        <Modal
          open={about}
          onOpenChange={setAbout}
          title="set.prio"
          description="Tomorrowland Brasil 2027"
          closeLabel={t.close}
          className="about-modal"
        >
          <div className="about-body">
            <section>
              <LockKeyhole size={22} />
              <h3>{t.localTitle}</h3>
              <p>{t.localBody}</p>
            </section>
            <section>
              <ShieldCheck size={22} />
              <h3>{t.dataTitle}</h3>
              <p>{t.dataBody}</p>
              <p className="small muted">
                {t.checked}: {longDate(catalog.verifiedAt, language)} · {catalog.appearances.length}{' '}
                {t.performances}
              </p>
              {catalog.sources.map((url) => (
                <a className="source-link" href={url} target="_blank" rel="noreferrer" key={url}>
                  {new URL(url).hostname}
                  <ArrowUpRight size={12} />
                </a>
              ))}
            </section>
          </div>
        </Modal>
        <Modal
          open={manual !== null}
          onOpenChange={(open) => {
            if (!open) setManual(null);
          }}
          title={t.manualTitle}
          description={t.manualHint}
          closeLabel={t.close}
          className="manual-modal"
        >
          <div className="manual-body">
            <textarea
              ref={manualText}
              readOnly
              value={manual?.text ?? ''}
              aria-label={t.manualTitle}
              onFocus={(event) => event.target.select()}
            />
            <div className="manual-actions">
              <button
                type="button"
                className="button"
                onClick={() => {
                  manualText.current?.focus();
                  manualText.current?.select();
                }}
              >
                {t.selectText}
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  void handleExport('csv');
                }}
              >
                {t.csv}
              </button>
            </div>
          </div>
        </Modal>
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              className="toast"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
            >
              <Check size={16} />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>
      </ArtistPreviewContext.Provider>
    </MotionConfig>
  );
}
