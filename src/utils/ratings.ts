/** Existing fractional scores remain valid; the bonus score is exactly 11. */
export function isRating(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    ((value >= 0 && value <= 10) || value === 11)
  );
}
export function ratingStep(rating: number | null | undefined) {
  return rating === 11 ? 21 : Math.round((rating ?? 0) * 2);
}
export function ratingFromStep(step: number) {
  return step === 21 ? 11 : step / 2;
}
