import { Check, ChevronDown, ExternalLink, Info, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { appearancesFor, artistById, catalog, recordingById, membersFor } from '../data';
import { dayName, longDate, messages, priorityLabel } from '../i18n';
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
  const recording = artist.recommendedSetId
    ? recordingById.get(artist.recommendedSetId)
    : undefined;
  const appearances = appearancesFor(artist);
  const members = membersFor(artist);
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={artist.name}
      description="Tomorrowland Brasil 2027"
      closeLabel={t.close}
      className="artist-modal"
      onRestoreFocus={restoreFocus}
    >
      <div className="artist-modal-scroll [overflow-y:auto] [overscroll-behavior:contain]">
        {!members.length && (
          <Portrait
            artist={artist}
            landscape
            className="artist-hero w-full h-57.5 [font-size:3.75rem] max-[47.5rem]:h-50"
          />
        )}
        <div className="artist-detail-body [padding:1.375rem_1.5rem_1.25rem] max-[47.5rem]:p-5 max-[47.5rem]:[&_.genre-tag]:[font-size:0.6875rem] max-[47.5rem]:[&_.subgenre-tag]:[font-size:0.6875rem]">
          {!members.length && (
            <>
              <div className="detail-topline flex items-center justify-between gap-2.5 mb-3 max-[47.5rem]:items-start max-[22.5rem]:flex-col max-[22.5rem]:gap-1.5 [&_.eyebrow]:text-muted max-[47.5rem]:[&_.text-link]:[font-size:0.625rem]">
                <span className="eyebrow [font-size:0.6875rem] font-semibold [letter-spacing:0.045em]">
                  {t.genreShort}
                </span>
              </div>
              <Genres artist={artist} language={language} />
            </>
          )}
          <div className="detail-warning flex gap-2 [font-size:0.625rem] [line-height:1.65] text-muted [margin:0.9375rem_0_1.25rem] [&_>_svg]:shrink-0 [&_>_svg]:text-accent [&_>_svg]:mt-0.25">
            <Info size="0.9375rem" />
            <p>{t.genreWarning}</p>
          </div>
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
                  <Portrait artist={member} landscape className="member-portrait w-full h-45" />
                  <div className="member-details-body p-4.5 [&_.detail-topline]:mb-3.5 [&_.detail-topline_h3]:text-xl">
                    <div className="detail-topline flex items-center justify-between gap-2.5 mb-3 max-[47.5rem]:items-start max-[22.5rem]:flex-col max-[22.5rem]:gap-1.5 [&_.eyebrow]:text-muted max-[47.5rem]:[&_.text-link]:[font-size:0.625rem]">
                      <h3>{member.name}</h3>
                    </div>
                    <Genres artist={member} language={language} />
                    <RecordingDetails artist={member} language={language} />
                  </div>
                </section>
              ))}
            </section>
          ) : null}
          {(!members.length ||
            (recording && !(artist.recommendedSetRepresentative ?? recording.representative))) && (
            <RecordingDetails
              artist={artist}
              language={language}
              heading={members.length ? t.jointRecording : undefined}
            />
          )}
          <section className="detail-section [padding:1.25rem_0] [border-top:0.0625rem_solid_var(--line)] performances-editor [&_h3]:[font-size:0.8125rem] [&_h3]:font-semibold [&_h3]:mb-3.25">
            <h3>{t.related}</h3>
            {appearances.length === 0 && <p className="muted text-muted">{t.noSolo}</p>}
            {appearances.map((appearance) => {
              const billed = artistById.get(appearance.artistId);
              const selectedPriority = state.priorities[appearance.id];
              return (
                <div
                  className="appearance-editor [padding:1rem_0] [&_+_.appearance-editor]:[border-top:0.0625rem_solid_var(--line)] [&_textarea]:w-full [&_textarea]:[resize:vertical] [&_textarea]:min-h-18.5 [&_textarea]:[max-height:21.875rem] [&_textarea]:bg-raised [&_textarea]:[border:0.0625rem_solid_var(--line)] [&_textarea]:rounded-lg [&_textarea]:p-2.75 [&_textarea]:text-xs [&_textarea]:[line-height:1.65] max-[47.5rem]:[&_textarea]:text-base"
                  key={appearance.id}
                >
                  <div className="appearance-heading flex justify-between items-center gap-3.5 mb-1.5 max-[22.5rem]:gap-2 max-[47.5rem]:flex-col max-[47.5rem]:items-stretch max-[47.5rem]:gap-3 [&_>_div]:flex [&_>_div]:flex-col [&_>_div]:gap-1.25 [&_strong]:[font-size:0.8125rem] [&_strong]:font-semibold [&_>_div_>_span]:[font-size:0.625rem] [&_>_div_>_span]:text-muted">
                    <div>
                      <strong>{dayName(appearance.day, language)}</strong>
                      {appearance.day && <span>{longDate(appearance.day, language)}</span>}
                    </div>
                    <label
                      className={`priority-select relative inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold [--priority:var(--secondary)] [color:var(--priority)] [border-color:color-mix(in_srgb,_var(--priority)_20%,_transparent)] [background:color-mix(in_srgb,_var(--priority)_9%,_transparent)] focus-within:ring-2 focus-within:ring-accent max-[47.5rem]:w-full ${selectedPriority ? `priority-${selectedPriority.toLowerCase()}` : ''}`}
                    >
                      <span aria-hidden="true" className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                        {selectedPriority ? (
                          <>
                            {selectedPriority !== 'P4' && (
                              <span className="border-r pr-1.5 [border-color:color-mix(in_srgb,_var(--priority)_27%,_transparent)]">
                                {selectedPriority}
                              </span>
                            )}
                            {priorityLabel(selectedPriority, language)}
                          </>
                        ) : (
                          t.noPriority
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
                            {priority === 'P4'
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
                    <p className="billed-name [font-size:0.6875rem] [line-height:1.6] [margin:0.5rem_0_0.25rem] font-medium">
                      {billed?.name}
                    </p>
                  )}
                  <label
                    className="notes-label block [margin:1rem_0_0.4375rem] [font-size:0.6875rem] font-semibold"
                    htmlFor={`comment-${appearance.id}`}
                  >
                    {t.notes}
                  </label>
                  <textarea
                    id={`comment-${appearance.id}`}
                    rows={2}
                    maxLength={10000}
                    value={state.comments[appearance.id] ?? ''}
                    placeholder={t.notesPlaceholder}
                    onChange={(event) => state.setComment(appearance.id, event.target.value)}
                  />
                </div>
              );
            })}
          </section>
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

function RecordingDetails({
  artist,
  language,
  heading,
}: {
  artist: Artist;
  language: Language;
  heading?: string;
}) {
  const t = messages(language);
  const state = usePlanner();
  const recording = artist.recommendedSetId
    ? recordingById.get(artist.recommendedSetId)
    : undefined;
  const [ratingError, setRatingError] = useState(false);
  const rating = recording ? state.ratings[recording.id] : null;
  const [draft, setDraft] = useState(String(rating ?? ''));
  useEffect(() => setDraft(String(rating ?? '')), [rating]);
  const ratingId = `set-rating-${artist.id}`;
  const helpId = `rating-help-${artist.id}`;
  return (
    <section className="detail-section [padding:1.25rem_0] [border-top:0.0625rem_solid_var(--line)] [&_h3]:[font-size:0.8125rem] [&_h3]:font-semibold [&_h3]:mb-3.25">
      <h3>{heading ?? t.recommended}</h3>
      <SetLink
        recording={recording}
        language={language}
        representative={artist.recommendedSetRepresentative}
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
          <div className="rating-row flex justify-between items-start gap-4 mt-5.25 max-[47.5rem]:gap-2.5 [&_label]:flex [&_label]:items-center [&_label]:gap-1.5 [&_label]:text-xs [&_label]:font-semibold [&_label]:min-h-11 [&_label_svg]:[color:var(--orange)] [&_.small]:[font-size:0.625rem] [&_.small]:[max-width:16.25rem] max-[47.5rem]:[&_.small]:[font-size:0.5625rem]">
            <div>
              <label htmlFor={ratingId}>
                <Star size="1rem" />
                {t.rating}
              </label>
              <p className="muted text-muted small text-xs [line-height:1.55]" id={helpId}>
                {t.ratingHint}
              </p>
            </div>
            <div className="rating-controls flex items-center gap-1.5 flex-wrap max-w-28.75 shrink-0 [justify-content:flex-end] max-[47.5rem]:max-w-26 [&_input]:w-13.75 [&_input]:min-h-11 [&_input]:p-2 [&_input]:[border:0.0625rem_solid_var(--line)] [&_input]:rounded-lg [&_input]:bg-raised [&_input]:[text-align:center] [&_input]:text-base [&_>_span]:text-muted [&_>_span]:[font-size:0.6875rem] [&_>_button]:[font-size:0.5625rem] max-[47.5rem]:[&_>_button]:min-h-11">
              <input
                id={ratingId}
                inputMode="decimal"
                type="text"
                role="spinbutton"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={rating ?? undefined}
                placeholder="—"
                aria-describedby={helpId}
                aria-invalid={ratingError}
                value={draft}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                  event.preventDefault();
                  const next = Math.min(
                    10,
                    Math.max(0, (rating ?? 0) + (event.key === 'ArrowUp' ? 1 : -1))
                  );
                  setDraft(String(next));
                  setRatingError(false);
                  state.setRating(recording.id, next);
                }}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft(value);
                  const normalized = value.replace(',', '.');
                  const number = Number(normalized);
                  if (
                    value !== '' &&
                    (!/^\d*(?:[.,]\d*)?$/.test(value) ||
                      !Number.isFinite(number) ||
                      number < 0 ||
                      number > 10)
                  ) {
                    setRatingError(true);
                    return;
                  }
                  setRatingError(false);
                  state.setRating(recording.id, value === '' ? null : number);
                }}
              />
              <span>/ 10</span>
              <button
                type="button"
                className="text-link inline-flex items-center gap-1 text-accent [font-size:0.6875rem] bg-transparent p-0 [&:hover:not(:disabled)]:underline max-[47.5rem]:min-h-11 max-[47.5rem]:items-center"
                disabled={state.ratings[recording.id] == null}
                onClick={() => {
                  state.setRating(recording.id, null);
                  setRatingError(false);
                }}
              >
                {t.clearRating}
              </button>
            </div>
          </div>
          {ratingError && (
            <p role="alert" className="field-error [font-size:0.6875rem] [color:var(--red)] mt-2.5">
              {t.invalidRating}
            </p>
          )}
        </>
      )}
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
          {t.setDetails} &amp; {t.genreSources}
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
