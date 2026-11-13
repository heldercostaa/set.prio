import { membersFor } from '../data';
import type { Artist, Language } from '../types';
import { artistCountries, countryFlag, countryName } from '../utils/countries';

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
  const countries = artistCountries(artist, members);
  if (!countries.length)
    return expanded ? (
      <span className="text-xs text-muted">
        {language === 'en' ? 'Country not verified' : 'País não confirmado'}
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
export function ArtistName({
  artist,
  language,
  showFlag = true,
}: {
  artist: Artist;
  language: Language;
  showFlag?: boolean;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {showFlag && <ArtistNationality artist={artist} language={language} />}
      <span className="min-w-0 [overflow-wrap:anywhere]">{artist.name}</span>
    </span>
  );
}
