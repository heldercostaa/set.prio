import { expect } from '@playwright/test';
import { catalog } from '../../src/data';
import { GENRES } from '../../src/data/genres';

export const contracts = {
  'keeps catalog identifiers, references, genres, and recording metadata valid': () => {
    const artistIds = new Set(catalog.artists.map((artist) => artist.id));
    const recordingIds = new Set(catalog.recordings.map((recording) => recording.id));
    expect(artistIds.size).toBe(catalog.artists.length);
    expect(recordingIds.size).toBe(catalog.recordings.length);
    expect(new Set(catalog.appearances.map((appearance) => appearance.id)).size).toBe(
      catalog.appearances.length
    );
    for (const appearance of catalog.appearances) {
      expect(artistIds.has(appearance.artistId), appearance.id).toBe(true);
      expect([null, '2027-04-30', '2027-05-01', '2027-05-02']).toContain(appearance.day);
    }
    for (const artist of catalog.artists) {
      expect(artist.subgenres.length, artist.name).toBeLessThanOrEqual(2);
      if (artist.genre) expect([...GENRES], artist.name).toContain(artist.genre);
      for (const genre of artist.subgenres) expect([...GENRES], artist.name).toContain(genre);
      if (artist.recommendedSetId)
        expect(recordingIds.has(artist.recommendedSetId), artist.name).toBe(true);
      for (const id of artist.memberIds ?? []) expect(artistIds.has(id), artist.name).toBe(true);
    }
    for (const recording of catalog.recordings) {
      expect(recording.youtubeUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
      expect(recording.eventLabel.trim()).not.toBe('');
      expect(recording.viewCount === null || recording.viewCount >= 0).toBe(true);
    }
  },
};
