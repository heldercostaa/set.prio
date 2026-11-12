import { membersFor } from '../data';
import type { Artist, Language } from '../types';
import { countryFlag, countryName } from '../utils/countries';

export function ArtistNationality({
  artist,
  language,
  expanded = false,
}: {
  artist: Artist;
  language: Language;
  expanded?: boolean;
}) {
  const members = membersFor(artist);
  const acts = artist.countryAttributions ?? (members.length ? members : [artist]);
  const countries = acts.flatMap((act) =>
    (act.countryCodes ?? []).map((code) => ({ code, name: act.name }))
  );
  if (!countries.length)
    return expanded ? (
      <span className="text-xs text-muted">
        {language === 'en' ? 'Country not verified' : 'País não verificado'}
      </span>
    ) : null;
  return (
    <span
      className={`inline-flex shrink-0 flex-wrap items-center gap-1.5 align-middle ${expanded ? 'text-xs text-muted' : 'text-sm'}`}
    >
      {countries.map(({ code, name }) => (
        <span
          key={`${name}-${code}`}
          className="inline-flex items-center gap-1.5"
          title={`${name} · ${countryName(code, language)}`}
        >
          <span
            role="img"
            aria-label={`${name} · ${countryName(code, language)}`}
            className="leading-none"
          >
            {countryFlag(code)}
          </span>
          {expanded && (
            <span>
              {artist.countryAttributions ? `${name} · ` : ''}
              {countryName(code, language)}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
export function ArtistName({ artist, language }: { artist: Artist; language: Language }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <ArtistNationality artist={artist} language={language} />
      <span className="min-w-0 [overflow-wrap:anywhere]">{artist.name}</span>
    </span>
  );
}
