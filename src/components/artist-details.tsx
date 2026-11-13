import { FilterNotice } from './planner/filter-notice';
import { ArtistNationality } from './artist-nationality';
import { ArtistNotes } from './artist-notes';
import { RecordingRating } from './recording-rating';
import { ExceptionalCrown } from './exceptional-crown';
import { Check, ChevronDown, ExternalLink } from 'lucide-react';
import {
  appearancesFor,
  artistById,
  catalog,
  recordingById,
  membersFor,
  jointRecordingFor,
  hasExceptionalRating,
} from '../data';
import { dayName, longDate, messages, priorityHasCode, priorityLabel } from '../i18n';
import { usePlanner } from '../store/planner';
import { PRIORITIES, type Artist, type Language, type Priority } from '../types';
import { Genres, Portrait, SetLink } from './artist';
import { Modal } from './ui/modal';

export function ArtistDetails({
  artist,
  language,
  onClose,
  restoreFocus,
}: {
  artist: Artist;
  language: Language;
  onClose: () => void;
  restoreFocus: () => void;
}) {
  const t = messages(language);
  const state = usePlanner();
  const members = membersFor(artist);
  const jointRecording = jointRecordingFor(artist);
  const jointRated = jointRecording && state.ratings[jointRecording.id] != null;
  const exceptional = hasExceptionalRating(artist, state.ratings);
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={artist.name}
      titleAdornment={
        members.length > 0 && exceptional ? (
          <ExceptionalCrown language={language} className="size-7" />
        ) : undefined
      }
      headingAdornment={
        !members.length && exceptional ? (
          <ExceptionalCrown
            language={language}
            className="absolute -bottom-4 left-1/2 z-10 size-8 -translate-x-1/2"
          />
        ) : undefined
      }
      description="Tomorrowland Brasil 2027"
      closeLabel={t.close}
      className="artist-modal"
      onRestoreFocus={restoreFocus}
    >
      <div className="artist-modal-scroll [overflow-y:auto] [overscroll-behavior:contain]">
        {!members.length ? (
          <ArtistHero artist={artist} language={language} disclaimer />
        ) : (
          <div className="border-b border-separator px-5 py-2 min-[47.5rem]:px-6">
            <FilterNotice
              language={language}
              notice={t.genreWarning}
              className="my-0 text-[0.625rem]! [&_svg]:size-3"
            />
          </div>
        )}
        <div className="artist-detail-body px-6 pb-5 max-[47.5rem]:px-5">
          <AppearancesEditor artist={artist} language={language} />
          {jointRecording && (
            <RecordingDetails artist={artist} language={language} heading={artist.name} primary />
          )}
          {members.length ? (
            <section
              className="joint-artists grid gap-5 mt-6 [&_>_h3]:text-base"
              aria-label={t.jointArtists}
            >
              <h3>{t.jointArtists}</h3>
              {members.map((member) => (
                <section
                  className="member-details border border-separator rounded-xl overflow-hidden"
                  aria-label={member.name}
                  key={member.id}
                >
                  <ArtistHero artist={member} language={language} heading />
                  <div className="member-details-body px-4.5 pb-4.5">
                    <RecordingDetails
                      artist={member}
                      language={language}
                      showRating={!jointRated}
                    />
                  </div>
                </section>
              ))}
            </section>
          ) : null}
          {!members.length && <RecordingDetails artist={artist} language={language} />}
          {members.length > 0 && !jointRecording && (
            <ArtistNotes artist={artist} language={language} />
          )}
          <ResearchDetails
            artists={members.length ? [artist, ...members] : [artist]}
            language={language}
          />
          <p className="saved-note flex items-center justify-center gap-1.25 text-muted [font-size:0.5625rem] pt-4.25">
            <Check size="0.8125rem" />
            {state.storageError ? t.privacy : t.saved}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function AppearancesEditor({ artist, language }: { artist: Artist; language: Language }) {
  const t = messages(language);
  const state = usePlanner();
  const appearances = appearancesFor(artist);
  return (
    <section className="detail-section py-3 performances-editor">
      {appearances.length === 0 && <p className="muted text-muted">{t.noSolo}</p>}
      {appearances.map((appearance) => {
        const billed = artistById.get(appearance.artistId);
        const selectedPriority = state.priorities[appearance.id];
        return (
          <div
            className="appearance-editor py-3 [&_+_.appearance-editor]:border-t [&_+_.appearance-editor]:border-separator"
            key={appearance.id}
          >
            <div className="appearance-heading grid grid-cols-[minmax(0,1fr)_13.75rem] items-center gap-3.5 max-[22.5rem]:grid-cols-1 max-[22.5rem]:gap-2">
              <div className="min-w-0">
                <strong className="block text-[0.8125rem] leading-5 font-semibold">
                  {dayName(appearance.day, language)}
                </strong>
                {appearance.day && (
                  <span className="mt-1 block text-[0.625rem] leading-4 text-muted">
                    {longDate(appearance.day, language)}
                  </span>
                )}
              </div>
              <label
                className={`priority-select relative inline-flex h-11 w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold [--priority:var(--secondary)] [color:var(--priority)] [border-color:color-mix(in_srgb,_var(--priority)_20%,_transparent)] [background:color-mix(in_srgb,_var(--priority)_9%,_transparent)] focus-within:ring-2 focus-within:ring-focus max-[47.5rem]:w-full ${selectedPriority ? `priority-${selectedPriority.toLowerCase()}` : ''}`}
              >
                <span
                  aria-hidden="true"
                  className="flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                  {selectedPriority ? (
                    <>
                      {priorityHasCode(selectedPriority) && (
                        <span className="border-r pr-1.5 [border-color:color-mix(in_srgb,_var(--priority)_27%,_transparent)]">
                          {selectedPriority}
                        </span>
                      )}
                      <span className="truncate">{priorityLabel(selectedPriority, language)}</span>
                    </>
                  ) : (
                    <span className="truncate">{t.noPriority}</span>
                  )}
                </span>
                <span className="sr-only absolute w-0.25 h-0.25 overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap">
                  {t.priority} · {dayName(appearance.day, language)} · {billed?.name}
                </span>
                <select
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 text-base"
                  aria-label={`${t.priority} · ${dayName(appearance.day, language)} · ${billed?.name}`}
                  value={selectedPriority ?? ''}
                  onChange={(event) =>
                    state.setPriority(
                      appearance.id,
                      (event.target.value || null) as Priority | null
                    )
                  }
                >
                  <option value="">{t.noPriority}</option>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {!priorityHasCode(priority)
                        ? priorityLabel(priority, language)
                        : `${priority} · ${priorityLabel(priority, language)}`}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size="0.875rem"
                  aria-hidden="true"
                  className="pointer-events-none shrink-0"
                />
              </label>
            </div>
            {appearance.artistId !== artist.id && (
              <p className="billed-name mt-2 text-[0.6875rem] leading-relaxed font-medium">
                {billed?.name}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

function ArtistHero({
  artist,
  language,
  heading = false,
  disclaimer = false,
}: {
  artist: Artist;
  language: Language;
  heading?: boolean;
  disclaimer?: boolean;
}) {
  const t = messages(language);
  return (
    <div className="relative isolate grid min-h-60 items-end overflow-hidden bg-raised">
      <Portrait artist={artist} landscape className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-black/5"
      />
      <div className="relative grid gap-2.5 px-6 pt-20 pb-3 text-white max-[47.5rem]:px-5 [&_.text-muted]:text-white/75 [&_.genre-tag]:bg-white/15 [&_.genre-tag]:text-white [&_.subgenre-tag]:bg-black/30 [&_.subgenre-tag]:text-white/80 [&_.genre-tag]:text-xs [&_.subgenre-tag]:text-xs [&_a]:text-white/75">
        {heading && <h3 className="text-xl font-semibold tracking-tight">{artist.name}</h3>}
        <ArtistNationality artist={artist} language={language} expanded />
        <div>
          <Genres artist={artist} language={language} />
          {disclaimer && (
            <FilterNotice
              language={language}
              notice={t.genreWarning}
              className="my-0 min-h-6! items-start! pt-1 text-[0.625rem]! leading-snug! [&_svg]:mt-0.5 [&_svg]:size-3"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RecordingDetails({
  artist,
  language,
  heading,
  primary = false,
  showRating = true,
}: {
  artist: Artist;
  language: Language;
  heading?: string;
  primary?: boolean;
  showRating?: boolean;
}) {
  const t = messages(language);
  const recording = artist.recommendedSetId
    ? recordingById.get(artist.recommendedSetId)
    : undefined;
  return (
    <section
      aria-label={heading ?? t.recommended}
      className={
        primary
          ? 'detail-section mb-6 rounded-2xl border border-separator bg-raised p-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-4'
          : 'detail-section py-4 border-t border-separator [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mb-3'
      }
    >
      <h3>{heading ?? t.recommended}</h3>
      <SetLink
        recording={recording}
        language={language}
        representative={artist.recommendedSetRepresentative}
        prominent={primary}
      />
      {recording && (
        <>
          <div className="recording-meta flex flex-wrap [gap:0.3125rem_0.75rem] text-muted [font-size:0.5625rem] [line-height:1.6] [margin:0.625rem_0.0625rem_0]">
            <span>{recording.channel}</span>
            {recording.uploadedAt && (
              <span>
                {t.posted} {longDate(recording.uploadedAt.slice(0, 10), language)}
              </span>
            )}
            {recording.viewCount !== null && (
              <span>
                {new Intl.NumberFormat(language).format(recording.viewCount)} {t.views}
              </span>
            )}
          </div>
          {showRating && (
            <RecordingRating recordingId={recording.id} artistId={artist.id} language={language} />
          )}
        </>
      )}
      <ArtistNotes artist={artist} language={language} />
    </section>
  );
}

function ResearchDetails({ artists, language }: { artists: Artist[]; language: Language }) {
  const t = messages(language);
  return (
    <details className="research-details group border-t border-separator text-xs text-muted [&_a]:inline-flex [&_a]:items-start [&_a]:gap-1.5 [&_a]:text-accent [&_a]:[overflow-wrap:anywhere] [&_a_svg]:mt-1 [&_a_svg]:shrink-0">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-3 leading-relaxed [&::-webkit-details-marker]:hidden">
        <ChevronDown
          size="0.875rem"
          aria-hidden="true"
          className="shrink-0 -rotate-90 transition-transform duration-150 group-open:rotate-0 motion-reduce:transition-none"
        />
        <span>
          {t.setDetails}
          {language === 'en' ? ' & ' : ' e '}
          {t.genreSources}
        </span>
      </summary>
      {artists.map((artist) => {
        const recording = artist.recommendedSetId
          ? recordingById.get(artist.recommendedSetId)
          : undefined;
        return (
          <div key={artist.id} className="grid min-w-0 gap-3 pb-4 pl-5.5 leading-relaxed">
            {artists.length > 1 && <h3 className="font-semibold text-content">{artist.name}</h3>}
            <p>
              {t.researched}: {longDate(recording?.verifiedAt ?? catalog.verifiedAt, language)}
            </p>
            {recording && <p>{recording.title}</p>}
            {artist.genreSources.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {new URL(url).hostname}
                <ExternalLink size="0.75rem" />
              </a>
            ))}
          </div>
        );
      })}
    </details>
  );
}
