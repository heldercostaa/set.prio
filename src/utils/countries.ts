import type { Artist, Language } from '../types';
export const UNKNOWN_COUNTRY = 'unknown';
export function countryName(code: string, language: Language) {
  if (code === UNKNOWN_COUNTRY) return language === 'en' ? 'Unknown country' : 'País desconhecido';
  return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? code;
}
export function countryFlag(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function artistCountries(artist: Artist, members: Artist[] = []) {
  const acts = artist.countryAttributions ?? (members.length ? members : [artist]);
  return acts.flatMap((act) => (act.countryCodes ?? []).map((code) => ({ code, name: act.name })));
}
