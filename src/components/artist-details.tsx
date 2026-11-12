import { ArrowUpRight, Check, ChevronDown, ExternalLink, Info, Star } from 'lucide-react';
import { useState } from 'react';
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
      <div className="artist-modal-scroll">
        {!members.length && (
          <Portrait
            artist={artist}
            className="artist-hero w-full h-57.5 [object-position:50%_35%] [font-size:3.75rem] max-[47.5rem]:h-50"
          />
        )}
        <div className="artist-detail-body [padding:1.375rem_24px_20px]">
          {!members.length && (
            <>
              <div className="detail-topline flex items-center justify-between gap-2.5 mb-3 max-[47.5rem]:items-start max-[22.5rem]:flex-col max-[22.5rem]:gap-1.5">
                <span className="eyebrow [font-size:0.6875rem] font-semibold [letter-spacing:0.045em]">
                  {t.genreShort}
                </span>
                <a
                  href={artist.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link inline-flex items-center gap-1 text-accent [font-size:0.6875rem] bg-transparent p-0"
                >
                  {t.officialProfile}
                  <ArrowUpRight size="0.8125rem" />
                </a>
              </div>
              <Genres artist={artist} language={language} />
            </>
          )}
          <div className="detail-warning flex gap-2 [font-size:0.625rem] [line-height:1.65] text-muted [margin:0.9375rem_0_20px]">
            <Info size="0.9375rem" />
            <p>{t.genreWarning}</p>
          </div>
          {members.length ? (
            <section className="joint-artists grid gap-5 mt-6" aria-label={t.jointArtists}>
              <h3>{t.jointArtists}</h3>
              {members.map((member) => (
                <section
                  className="member-details border border-separator rounded-3 overflow-hidden"
                  aria-label={member.name}
                  key={member.id}
                >
                  <Portrait artist={member} className="member-portrait w-full h-45" />
                  <div className="member-details-body p-4.5">
                    <div className="detail-topline flex items-center justify-between gap-2.5 mb-3 max-[47.5rem]:items-start max-[22.5rem]:flex-col max-[22.5rem]:gap-1.5">
                      <h3>{member.name}</h3>
                      <a
                        href={member.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link inline-flex items-center gap-1 text-accent [font-size:0.6875rem] bg-transparent p-0"
                      >
                        {t.officialProfile}
                        <ArrowUpRight size="0.8125rem" />
                      </a>
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
          <section className="detail-section [padding:1.25rem_0] [border-top:0.0625rem_solid_var(--line)] performances-editor">
            <h3>{t.related}</h3>
            {appearances.length === 0 && <p className="muted text-muted">{t.noSolo}</p>}
            {appearances.map((appearance) => {
              const billed = artistById.get(appearance.artistId);
              return (
                <div className="appearance-editor [padding:1rem_0]" key={appearance.id}>
                  <div className="appearance-heading flex justify-between items-center gap-3.5 mb-1.5 max-[22.5rem]:gap-2 max-[47.5rem]:flex-col max-[47.5rem]:items-stretch max-[47.5rem]:gap-3">
                    <div>
                      <strong>{dayName(appearance.day, language)}</strong>
                      {appearance.day && <span>{longDate(appearance.day, language)}</span>}
                    </div>
                    <label className="priority-select relative max-w-51.25 [min-width:9.375rem] max-[47.5rem]:min-w-0 max-[47.5rem]:[max-width:none] max-[47.5rem]:w-full max-[22.5rem]:[min-width:7.8125rem]">
                      <span className="sr-only absolute w-0.25 h-0.25 overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap">
                        {t.priority} · {dayName(appearance.day, language)} · {billed?.name}
                      </span>
                      <select
                        aria-label={`${t.priority} · ${dayName(appearance.day, language)} · ${billed?.name}`}
                        value={state.priorities[appearance.id] ?? ''}
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
                            {priority} · {priorityLabel(priority, language)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size="0.875rem" />
                    </label>
                  </div>
                  {appearance.artistId !== artist.id && (
                    <p className="billed-name [font-size:0.6875rem] [line-height:1.6] [margin:0.5rem_0_4px] font-medium">
                      {billed?.name}
                    </p>
                  )}
                  <p className="small text-xs [line-height:1.55] muted text-muted">
                    {appearance.stage ?? t.stageUnknown}
                  </p>
                  <label
                    className="notes-label block [margin:1rem_0_7px] [font-size:0.6875rem] font-semibold"
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
                  <span className="small text-xs [line-height:1.55] muted text-muted">
                    {t.notesHint}
                  </span>
                </div>
              );
            })}
          </section>
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
  const ratingId = `set-rating-${artist.id}`;
  const helpId = `rating-help-${artist.id}`;
  return (
    <>
      <section className="detail-section [padding:1.25rem_0] [border-top:0.0625rem_solid_var(--line)]">
        <h3>{heading ?? t.recommended}</h3>
        <SetLink
          recording={recording}
          language={language}
          representative={artist.recommendedSetRepresentative}
        />
        {recording && (
          <>
            <div className="recording-meta flex flex-wrap [gap:0.3125rem_12px] text-muted [font-size:0.5625rem] [line-height:1.6] [margin:0.625rem_1px_0]">
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
            <div className="rating-row flex justify-between items-center gap-4 mt-5.25 max-[47.5rem]:gap-2.5">
              <div>
                <label htmlFor={ratingId}>
                  <Star size="1rem" />
                  {t.rating}
                </label>
                <p className="muted text-muted small text-xs [line-height:1.55]" id={helpId}>
                  {t.ratingHint}
                </p>
              </div>
              <div className="rating-controls flex items-center gap-1.5 flex-wrap max-w-28.75 shrink-0 [justify-content:flex-end] max-[47.5rem]:max-w-26">
                <input
                  id={ratingId}
                  inputMode="numeric"
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  placeholder="—"
                  aria-describedby={helpId}
                  aria-invalid={ratingError}
                  value={state.ratings[recording.id] ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    const number = Number(value);
                    if (value !== '' && (!Number.isInteger(number) || number < 0 || number > 10)) {
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
                  className="text-link inline-flex items-center gap-1 text-accent [font-size:0.6875rem] bg-transparent p-0"
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
              <p
                role="alert"
                className="field-error [font-size:0.6875rem] [color:var(--red)] mt-2.5"
              >
                {t.invalidRating}
              </p>
            )}
          </>
        )}
      </section>
      <details className="research-details [border-top:0.0625rem_solid_var(--line)] pt-3.75 [font-size:0.625rem] text-muted">
        <summary>
          {t.setDetails} &amp; {t.genreSources}
        </summary>
        <div>
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
      </details>
    </>
  );
}
