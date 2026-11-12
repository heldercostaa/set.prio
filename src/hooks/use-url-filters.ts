import { useEffect, useState } from 'react';
import { catalog, countriesFor, type WatchFilter } from '../data';
import { GENRES } from '../data/genres';
import { ARTIST_SORTS, type ArtistSort } from '../utils/artist-sort';
interface Filters {
  search: string;
  genres: string[];
  countries: string[];
  watched: WatchFilter;
  sort: ArtistSort;
  view: 'board' | 'artists';
}
const defaults: Filters = {
  search: '',
  genres: [],
  countries: [],
  watched: 'all',
  sort: 'name-asc',
  view: 'board',
};
const countryCodes = new Set(catalog.artists.flatMap(countriesFor));
function readFilters(): Filters {
  const params = new URLSearchParams(window.location.search);
  const watched = params.get('watched');
  const sort = params.get('sort');
  return {
    search: params.get('q') ?? '',
    genres: [
      ...new Set(params.getAll('genre').filter((value) => GENRES.some((genre) => genre === value))),
    ],
    countries: [...new Set(params.getAll('country').filter((value) => countryCodes.has(value)))],
    watched: watched === 'watched' || watched === 'unwatched' ? watched : 'all',
    sort: ARTIST_SORTS.find((value) => value === sort) ?? 'name-asc',
    view: params.get('view') === 'artists' ? 'artists' : 'board',
  };
}
export function useUrlFilters() {
  const [filters, setFilters] = useState(readFilters);
  useEffect(() => {
    const restore = () => setFilters(readFilters());
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  const update = (changes: Partial<Filters>, replace = false) => {
    const next = { ...readFilters(), ...changes };
    const url = new URL(window.location.href);
    for (const key of ['q', 'genre', 'country', 'watched', 'sort', 'view'])
      url.searchParams.delete(key);
    if (next.search) url.searchParams.set('q', next.search);
    for (const genre of next.genres) url.searchParams.append('genre', genre);
    for (const country of next.countries) url.searchParams.append('country', country);
    if (next.watched !== 'all') url.searchParams.set('watched', next.watched);
    if (next.sort !== 'name-asc') url.searchParams.set('sort', next.sort);
    if (next.view !== 'board') url.searchParams.set('view', next.view);
    if (url.href !== window.location.href) {
      // Typing edits the current entry; deliberate selections remain navigable with Back.
      window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', url);
    }
    setFilters(next);
  };
  return {
    filters,
    setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) =>
      update({ [key]: value }, key === 'search'),
    resetFilters: () => update({ ...defaults, view: filters.view }),
    hasFilters: Boolean(
      filters.search ||
        filters.genres.length ||
        filters.countries.length ||
        filters.watched !== 'all' ||
        filters.sort !== 'name-asc'
    ),
  };
}
