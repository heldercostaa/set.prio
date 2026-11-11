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
        {!members.length && <Portrait artist={artist} className="artist-hero" />}
        <div className="artist-detail-body">
          {!members.length && (
            <>
              <div className="detail-topline">
                <span className="eyebrow">{t.genreShort}</span>
                <a href={artist.officialUrl} target="_blank" rel="noreferrer" className="text-link">
                  {t.officialProfile}
                  <ArrowUpRight size={13} />
                </a>
              </div>
              <Genres artist={artist} language={language} />
            </>
          )}
          <div className="detail-warning">
            <Info size={15} />
            <p>{t.genreWarning}</p>
          </div>
          {members.length ? (
            <section className="joint-artists" aria-label={t.jointArtists}>
              <h3>{t.jointArtists}</h3>
              {members.map((member) => (
                <section className="member-details" aria-label={member.name} key={member.id}>
                  <Portrait artist={member} className="member-portrait" />
                  <div className="member-details-body">
                    <div className="detail-topline">
                      <h3>{member.name}</h3>
                      <a
                        href={member.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        {t.officialProfile}
                        <ArrowUpRight size={13} />
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
          <section className="detail-section performances-editor">
            <h3>{t.related}</h3>
            {appearances.length === 0 && <p className="muted">{t.noSolo}</p>}
            {appearances.map((appearance) => {
              const billed = artistById.get(appearance.artistId);
              return (
                <div className="appearance-editor" key={appearance.id}>
                  <div className="appearance-heading">
                    <div>
                      <strong>{dayName(appearance.day, language)}</strong>
                      {appearance.day && <span>{longDate(appearance.day, language)}</span>}
                    </div>
                    <label className="priority-select">
                      <span className="sr-only">
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
                      <ChevronDown size={14} />
                    </label>
                  </div>
                  {appearance.artistId !== artist.id && (
                    <p className="billed-name">{billed?.name}</p>
                  )}
                  <p className="small muted">{appearance.stage ?? t.stageUnknown}</p>
                  <label className="notes-label" htmlFor={`comment-${appearance.id}`}>
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
                  <span className="small muted">{t.notesHint}</span>
                </div>
              );
            })}
          </section>
          <p className="saved-note">
            <Check size={13} />
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
      <section className="detail-section">
        <h3>{heading ?? t.recommended}</h3>
        <SetLink
          recording={recording}
          language={language}
          representative={artist.recommendedSetRepresentative}
        />
        {recording && (
          <>
            <div className="recording-meta">
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
            <div className="rating-row">
              <div>
                <label htmlFor={ratingId}>
                  <Star size={16} />
                  {t.rating}
                </label>
                <p className="muted small" id={helpId}>
                  {t.ratingHint}
                </p>
              </div>
              <div className="rating-controls">
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
                  className="text-link"
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
              <p role="alert" className="field-error">
                {t.invalidRating}
              </p>
            )}
          </>
        )}
      </section>
      <details className="research-details">
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
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </details>
    </>
  );
}
