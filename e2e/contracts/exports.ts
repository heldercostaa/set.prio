import { expect } from '@playwright/test';
import type { Catalog, Preferences } from '../../src/types';
import { collectEntries, notionPayload, toCsv } from '../../src/utils/exports';

const catalog: Catalog = {
  version: 'fixture',
  verifiedAt: '2026-11-11',
  sources: [],
  artists: [
    {
      id: 'artist',
      name: 'Música "Ao vivo", & friends',
      photoUrl: null,
      officialUrl: 'https://example.com/artist',
      genre: 'House',
      subgenres: ['Tech house', 'Deep house'],
      genreSources: [],
      recommendedSetId: 'video',
    },
  ],
  appearances: [
    { id: 'saturday', artistId: 'artist', day: '2027-05-01', stage: null },
    { id: 'friday', artistId: 'artist', day: '2027-04-30', stage: null },
    { id: 'sunday', artistId: 'artist', day: '2027-05-02', stage: null },
  ],
  recordings: [
    {
      id: 'video',
      youtubeUrl: 'https://www.youtube.com/watch?v=DuXXMZLfAkQ',
      title: 'Artist live at Tomorrowland',
      eventLabel: 'Tomorrowland Belgium 2026',
      channel: 'Tomorrowland',
      uploadedAt: null,
      viewCount: null,
      verifiedAt: '2026-11-11',
      selectionReason: 'Relevant full recording.',
      representative: false,
    },
  ],
};
const preferences: Preferences = {
  version: 1,
  language: 'en',
  activeDay: '2027-05-02',
  priorities: { friday: 'P0', saturday: 'P2' },
  ratings: { video: 0 },
  comments: { friday: 'Olá,\n"até amanhã"', saturday: '=1+1' },
};

export const contracts = {
  'exports only prioritized appearances in festival order and shares a zero recording score':
    () => {
      const entries = collectEntries(catalog, preferences);
      expect(entries.map((entry) => [entry.appearance.id, entry.priority, entry.rating])).toEqual([
        ['friday', 'P0', 0],
        ['saturday', 'P2', 0],
      ]);
      expect(
        collectEntries(catalog, {
          ...preferences,
          ratings: {},
        })[0].rating
      ).toBeNull();
    },
  'produces the specified eight-column CSV, preserves Unicode and multiline text, and neutralizes formulas':
    () => {
      const csv = toCsv(collectEntries(catalog, preferences), 'en');
      expect(
        csv.startsWith(
          '\uFEFF"Name","At","Day","Priority","Genre","Sub-genres","Rating","Comment"\r\n'
        )
      ).toBe(true);
      expect(csv).toContain('"Música ""Ao vivo"", & friends"');
      expect(csv).toContain(
        '"Tomorrowland Belgium 2026 (https://www.youtube.com/watch?v=DuXXMZLfAkQ)"'
      );
      expect(csv).toContain(
        '"Friday","P0","House","Tech house, Deep house","0","Olá,\n""até amanhã"""'
      );
      expect(csv).toContain('"' + "'=1+1" + '"');
    },
  'copies named links and escapes HTML content while providing a localized text fallback': () => {
    const entries = collectEntries(catalog, {
      ...preferences,
      comments: {
        friday: '<script>alert("x")</script>\nnext',
      },
    });
    const payload = notionPayload(entries, 'pt-BR');
    expect(payload.html).toContain(
      '<a href="https://www.youtube.com/watch?v=DuXXMZLfAkQ">Tomorrowland Belgium 2026</a>'
    );
    expect(payload.html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;<br>next');
    expect(payload.html).not.toContain('<script>');
    expect(payload.text).toContain('\tSexta-feira\tP0\t');
    expect(payload.text).toContain('\t0\t');
  },
  'labels representative member recordings without changing their named festival link': () => {
    const representativeCatalog = {
      ...catalog,
      artists: catalog.artists.map((artist) => ({
        ...artist,
        recommendedSetRepresentative: true,
      })),
    };
    const entries = collectEntries(representativeCatalog, preferences);
    expect(toCsv(entries, 'en')).toContain(' · Representative recording');
    expect(notionPayload(entries, 'pt-BR').html).toContain(
      '>Tomorrowland Belgium 2026</a> · Gravação representativa'
    );
  },
  'expands a b2b into attributed artist rows with their own sets, genres and ratings': () => {
    const first = catalog.artists[0];
    const second = {
      ...first,
      id: 'second',
      name: 'Second artist',
      genre: 'Trance',
      subgenres: ['Progressive trance'],
      recommendedSetId: 'other-video',
    };
    const joint = {
      ...first,
      id: 'joint',
      name: `${first.name} b2b ${second.name}`,
      memberIds: [first.id, second.id],
      recommendedSetRepresentative: true,
    };
    const jointCatalog = {
      ...catalog,
      artists: [first, second, joint],
      appearances: [
        {
          ...catalog.appearances[1],
          artistId: joint.id,
        },
      ],
      recordings: [
        ...catalog.recordings,
        {
          ...catalog.recordings[0],
          id: 'other-video',
          youtubeUrl: 'https://www.youtube.com/watch?v=nSYt0B-EGwA',
          eventLabel: 'Second event 2026',
        },
      ],
    };
    const entries = collectEntries(jointCatalog, {
      ...preferences,
      ratings: {
        video: 0,
        'other-video': 8,
      },
      comments: {
        friday: 'Meet together',
      },
    });
    expect(entries).toHaveLength(1);
    const table = new DOMParser().parseFromString(notionPayload(entries, 'en').html, 'text/html');
    const rows = [...table.querySelectorAll('tbody tr')];
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.querySelector('td')?.textContent)).toEqual([
      `${first.name} (from b2b: ${joint.name})`,
      `${second.name} (from b2b: ${joint.name})`,
    ]);
    expect(
      rows.map((row) => [...row.querySelectorAll('td')].slice(2).map((cell) => cell.textContent))
    ).toEqual([
      ['Friday', 'P0', 'House', 'Tech house, Deep house', '0', 'Meet together'],
      ['Friday', 'P0', 'Trance', 'Progressive trance', '8', 'Meet together'],
    ]);
    expect(rows.map((row) => row.querySelector('a')?.getAttribute('href'))).toEqual([
      catalog.recordings[0].youtubeUrl,
      jointCatalog.recordings[1].youtubeUrl,
    ]);
    const csv = toCsv(entries, 'pt-BR');
    expect(csv).toContain('(do b2b:');
    expect(csv).toContain('"Trance","Progressive trance","8"');
    expect(csv).toContain('Second event 2026 (https://www.youtube.com/watch?v=nSYt0B-EGwA)');
  },
};
