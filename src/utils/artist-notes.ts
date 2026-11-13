import { catalog } from '../data';
import type { Artist } from '../types';

export const MAX_NOTES_LENGTH = 280;

export function artistNotes(artist: Artist, comments: Record<string, string>): string {
  // Keep appearance-scoped notes readable until the artist's notes are edited.
  return (
    comments[artist.id] ??
    [
      ...new Set(
        catalog.appearances
          .filter((appearance) => appearance.artistId === artist.id)
          .map((appearance) => comments[appearance.id])
          .filter((note) => note?.trim())
      ),
    ].join('\n\n')
  ).slice(0, MAX_NOTES_LENGTH);
}
