import { CircleCheck } from 'lucide-react';
import { ratingArtistsFor } from '../data';
import { usePlanner } from '../store/planner';
import type { Artist, Language } from '../types';
export function WatchedStatus({ artist, language }: { artist: Artist; language: Language }) {
  const ratings = usePlanner((s) => s.ratings);
  const artists = ratingArtistsFor(artist, ratings);
  const watched = artists.filter((a) => a.recommendedSetId && ratings[a.recommendedSetId] != null);
  if (!watched.length) return null;
  const complete = watched.length === artists.length;
  const title =
    language === 'en'
      ? complete
        ? 'Watched set'
        : 'Some sets watched'
      : complete
        ? 'Set assistido'
        : 'Alguns sets assistidos';
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      className="inline-flex shrink-0 items-center [color:var(--teal)]"
    >
      <CircleCheck
        size="0.875rem"
        fill={complete ? 'currentColor' : 'none'}
        className={complete ? '[&_path]:stroke-surface' : ''}
      />
    </span>
  );
}
