import { messages } from '../i18n';
import { usePlanner } from '../store/planner';
import type { Artist, Language } from '../types';
import { artistNotes, MAX_NOTES_LENGTH } from '../utils/artist-notes';

export function ArtistNotes({ artist, language }: { artist: Artist; language: Language }) {
  const t = messages(language);
  const comments = usePlanner((state) => state.comments);
  const setComment = usePlanner((state) => state.setComment);
  const note = artistNotes(artist, comments);
  const id = `notes-${artist.id}`;
  return (
    <div className="mt-4">
      <label htmlFor={id} className="mb-2 block text-xs font-semibold">
        {t.notes}
      </label>
      <textarea
        id={id}
        rows={3}
        maxLength={MAX_NOTES_LENGTH}
        aria-describedby={`${id}-count`}
        value={note}
        placeholder={t.notesPlaceholder}
        onChange={(event) => setComment(artist.id, event.target.value.slice(0, MAX_NOTES_LENGTH))}
        className="min-h-24 max-h-88 w-full resize-y rounded-lg border border-separator bg-raised p-3 text-sm leading-relaxed max-[47.5rem]:text-base"
      />
      <p id={`${id}-count`} className="mt-1 text-right text-xs tabular-nums text-muted">
        {note.length} / {MAX_NOTES_LENGTH}
      </p>
    </div>
  );
}
