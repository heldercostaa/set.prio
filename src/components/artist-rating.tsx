import { messages } from '../i18n';
import { ArtistName } from './artist-nationality';
import { membersFor, ratingArtistsFor } from '../data';
import { usePlanner } from '../store/planner';
import type { Artist, Language } from '../types';
import { WatchedStatus } from './watched-status';

export function ArtistRating({
  artist,
  language,
  name,
  catalog = false,
}: {
  artist: Artist;
  language: Language;
  name?: string;
  catalog?: boolean;
}) {
  const t = messages(language);
  const ratings = usePlanner((s) => s.ratings);
  const showFlags = usePlanner((s) => s.showArtistFlags);
  const showRatings = usePlanner((s) => s.showArtistRatings);
  const members = membersFor(artist);
  const acts = ratingArtistsFor(artist, ratings);
  const rated = acts.filter((act) => act.recommendedSetId && ratings[act.recommendedSetId] != null);
  if (!showRatings || !rated.length)
    return name ? (
      <ArtistName artist={artist} language={language} showFlag={showFlags} compact />
    ) : null;
  return (
    <span className="flex w-full min-w-0 flex-col gap-1">
      {name && members.length > 0 && (
        <ArtistName artist={artist} language={language} showFlag={showFlags} compact />
      )}
      <span className="sr-only">
        <WatchedStatus artist={artist} language={language} />
      </span>
      {rated.map((act) => {
        const score = act.recommendedSetId ? ratings[act.recommendedSetId] : null;
        if (score == null) return null;
        const bonus = score === 11;
        return (
          <span key={act.id} className="block min-w-0">
            <span className="flex items-center justify-between gap-2 text-[0.6875rem] leading-relaxed">
              {(members.length > 0 || name || catalog) && (
                <span
                  className={
                    members.length || catalog ? 'text-muted' : 'text-sm font-medium text-content'
                  }
                >
                  {members.length && act.id !== artist.id ? (
                    act.name
                  ) : catalog || members.length ? (
                    t.ratingLabel
                  ) : (
                    <ArtistName artist={artist} language={language} showFlag={showFlags} compact />
                  )}
                </span>
              )}
              <span
                className={`ml-auto font-semibold tabular-nums ${bonus ? `text-[#ffd580] ${catalog ? 'rounded bg-linear-to-r from-[#ffd58012] via-[#ff8fc812] to-[#b8a4ff18] px-1.5' : ''}` : 'text-[var(--orange)]'}`}
              >
                {new Intl.NumberFormat(language).format(score)}
                {bonus || catalog ? '/10' : ''}
              </span>
            </span>
            <span className="block h-0.75 overflow-hidden rounded-full bg-separator">
              <span
                className={`block h-full rounded-full ${bonus ? 'bg-[linear-gradient(90deg,#ffd580_0%,#ff8fc8_25%,#b8a4ff_50%,#ff8fc8_75%,#ffd580_100%)] bg-size-[200%_100%] bg-repeat-x motion-safe:animate-[rating-flow_5s_linear_infinite]' : 'bg-[var(--orange)]'}`}
                style={{ width: `${Math.min(score, 10) * 10}%` }}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
