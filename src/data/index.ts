import data from './catalog.json' with { type: 'json' };
import type { Artist, Catalog } from '../types';
export const catalog = data as unknown as Catalog;
export const artistById = new Map(catalog.artists.map((artist) => [artist.id, artist]));
export const recordingById = new Map(
  catalog.recordings.map((recording) => [recording.id, recording])
);
export function appearancesFor(artist: Artist) {
  return catalog.appearances.filter(
    (appearance) =>
      appearance.artistId === artist.id ||
      artistById.get(appearance.artistId)?.memberIds?.includes(artist.id)
  );
}
export function matchesSearch(artist: Artist, search: string, genres: readonly string[] = []) {
  if (
    genres.length &&
    !genres.includes(artist.genre ?? '') &&
    !membersFor(artist).some((member) => genres.includes(member.genre ?? ''))
  )
    return false;
  const normalize = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const members = artist.memberIds?.map((id) => artistById.get(id)?.name ?? '').join(' ') ?? '';
  return normalize([artist.name, artist.genre, ...artist.subgenres, members].join(' ')).includes(
    normalize(search.trim())
  );
}

export function membersFor(artist: Artist): Artist[] {
  return (artist.memberIds ?? []).flatMap((id) => {
    const member = artistById.get(id);
    return member ? [member] : [];
  });
}
