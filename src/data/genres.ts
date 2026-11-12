export const GENRES = [
  'Progressive house',
  'House',
  'Tech house',
  'Psytrance',
  'Trance',
  'Melodic techno',
  'Techno',
  'Hardstyle',
  'Drum & Bass',
  'Dubstep',
  'Big room',
  'Melodic house',
  'Afro house',
] as const;
export type Genre = (typeof GENRES)[number];
