export type Language = 'en' | 'pt-BR';
export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export const DAYS = ['2027-04-30', '2027-05-01', '2027-05-02'] as const;
export type Day = (typeof DAYS)[number];
export const PRIORITIES: Priority[] = ['P0', 'P1', 'P2', 'P3', 'P4'];
export interface Artist {
  id: string;
  name: string;
  photoUrl: string | null;
  officialUrl: string;
  genre: string | null;
  subgenres: string[];
  genreSources: string[];
  genreVerifiedAt?: string;
  recommendedSetId: string | null;
  memberIds?: string[];
  recommendedSetRepresentative?: boolean;
  recommendationNote?: string;
}
export interface Appearance {
  id: string;
  artistId: string;
  day: Day | null;
  stage: string | null;
}
export interface Recording {
  id: string;
  youtubeUrl: string;
  title: string;
  eventLabel: string;
  channel: string;
  uploadedAt: string | null;
  viewCount: number | null;
  verifiedAt: string;
  selectionReason: string;
  representative: boolean;
}
export interface Catalog {
  version: string;
  verifiedAt: string;
  sources: string[];
  sourceArtistCount?: number;
  billedActCount?: number;
  artists: Artist[];
  appearances: Appearance[];
  recordings: Recording[];
}
export interface Preferences {
  version: 1;
  language: Language;
  activeDay: Day;
  priorities: Record<string, Priority | null>;
  comments: Record<string, string>;
  ratings: Record<string, number | null>;
}
