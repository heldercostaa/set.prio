import type { Locator } from '@playwright/test';
export async function setSliderRating(slider: Locator, rating: number) {
  await slider.press('Home');
  const steps = rating === 11 ? 21 : rating * 2;
  for (let step = 0; step < steps; step++) await slider.press('ArrowRight');
}
