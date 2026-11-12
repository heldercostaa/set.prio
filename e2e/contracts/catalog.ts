import { expect } from '@playwright/test';
import { catalog } from '../../src/data';

export const contracts = {
  'keeps every appearance and recording reference resolvable without inventing performance dates':
    () => {
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
