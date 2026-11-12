import { membersFor } from '../data';
import type { Artist, Language, Preferences } from '../types';
export const ARTIST_SORTS = [
  'name-asc',
  'name-desc',
  'rating-desc',
  'rating-asc',
  'genre',
] as const;
export type ArtistSort = (typeof ARTIST_SORTS)[number];

/** Joint acts sort by their highest-rated member recording, never an invented average. */
function grade(artist: Artist, ratings: Preferences['ratings']) {
  const members = membersFor(artist);
  const scores = (members.length ? members : [artist]).flatMap((act) => {
    const score = act.recommendedSetId ? ratings[act.recommendedSetId] : null;
    return score == null ? [] : [score];
  });
  return scores.length ? Math.max(...scores) : null;
}
export function compareArtists(
  sort: ArtistSort,
  language: Language,
  ratings: Preferences['ratings']
) {
  const collator = new Intl.Collator(language, { sensitivity: 'base' });
  return (a: Artist, b: Artist) => {
    const byName = collator.compare(a.name, b.name) || a.id.localeCompare(b.id);
    if (sort === 'name-desc') return -byName;
    if (sort === 'rating-desc' || sort === 'rating-asc') {
      const left = grade(a, ratings),
        right = grade(b, ratings);
      if (left === null) return right === null ? byName : 1;
      if (right === null) return -1;
      return (sort === 'rating-desc' ? right - left : left - right) || byName;
    }
    if (sort === 'genre') {
      if (!a.genre) return b.genre ? 1 : byName;
      if (!b.genre) return -1;
      return collator.compare(a.genre, b.genre) || byName;
    }
    return byName;
  };
}
