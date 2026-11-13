export function boardSparkles(artistId: string) {
  const seed = Array.from(artistId).reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) | 0,
    0
  );
  const random = (offset: number) => {
    const value = Math.sin(seed + offset * 127.1) * 43758.5453;
    return value - Math.floor(value);
  };
  return Array.from({ length: 3 }, (_, index) => ({
    id: index,
    size: 3 + random(index * 10 + 1) * 1.5,
    duration: 6 + random(index * 10 + 2) * 4,
    delay: -random(index * 10 + 3) * 10,
    positions: Array.from({ length: 3 }, (_, position) => ({
      x: 0.06 + random(index * 10 + position * 2 + 4) * 0.88,
      y: 0.06 + random(index * 10 + position * 2 + 5) * 0.88,
    })),
  }));
}
