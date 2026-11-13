import { useSetShare } from './set-share';
import { RatingConfetti } from './rating-confetti';
import { useCallback, useRef, useState } from 'react';
import { RatingSparkles } from './rating-sparkles';
import { Check, Sparkles, Share } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { messages } from '../i18n';
import { usePlanner } from '../store/planner';
import type { Language } from '../types';
import { ratingFromStep, ratingStep } from '../utils/ratings';

export function RecordingRating({
  recordingId,
  artistId,
  language,
}: {
  recordingId: string;
  artistId: string;
  language: Language;
}) {
  const share = useSetShare();
  const rating = usePlanner((s) => s.ratings[recordingId]) ?? null;
  const setRating = usePlanner((s) => s.setRating);
  const reduced = useReducedMotion();
  const burstId = useRef(0);
  const finishBurst = useCallback(() => setBurst(null), []);
  const [burst, setBurst] = useState<{
    id: number;
    container: HTMLElement;
    x: number;
    y: number;
  } | null>(null);
  const updateRating = (value: number, input: HTMLInputElement) => {
    const previous = usePlanner.getState().ratings[recordingId];
    setRating(recordingId, value);
    if (value !== 11) {
      setBurst(null);
      return;
    }
    if (previous === 11 || reduced) return;
    const container = input.closest<HTMLElement>('[role="dialog"]');
    if (!container) return;
    const modalBounds = container.getBoundingClientRect();
    const inputBounds = input.getBoundingClientRect();
    setBurst({
      id: ++burstId.current,
      container,
      x: inputBounds.left + inputBounds.width / 2 - modalBounds.left,
      y: Math.min(inputBounds.bottom + 48 - modalBounds.top, modalBounds.height - 40),
    });
  };
  const t = messages(language);
  const special = rating === 11;
  const formatted = rating === null ? '—' : new Intl.NumberFormat(language).format(rating);
  const id = `set-rating-${artistId}`;
  return (
    <div className="mt-6">
      {burst && special && !reduced && (
        <RatingConfetti key={burst.id} {...burst} onComplete={finishBurst} />
      )}
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-xs font-semibold">
        {t.rating}
        <span className="text-muted font-normal">{t.personalRating}</span>
      </label>
      <input
        id={id}
        aria-label={t.rating}
        type="range"
        min={0}
        max={21}
        step={1}
        value={ratingStep(rating)}
        aria-valuemin={0}
        aria-valuemax={11}
        aria-valuenow={rating ?? 0}
        aria-valuetext={rating === null ? t.unrated : `${formatted} / 10`}
        aria-describedby={`${id}-hint`}
        className="mt-2 min-h-11 w-full cursor-pointer accent-[var(--orange)]"
        onChange={(event) =>
          updateRating(ratingFromStep(Number(event.currentTarget.value)), event.currentTarget)
        }
        onPointerUp={(event) =>
          updateRating(ratingFromStep(Number(event.currentTarget.value)), event.currentTarget)
        }
        onKeyDown={(event) => {
          if (rating === null && ['Home', 'ArrowLeft', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            setRating(recordingId, 0);
          }
        }}
      />
      <div aria-hidden="true" className="flex justify-between text-xs text-muted">
        <span>0</span>
        <span>5</span>
        <span>
          10 · <span className="text-[#ffd580]">11</span>
        </span>
      </div>
      <motion.div
        key={special ? 'bonus' : 'regular'}
        initial={special && !reduced ? { scale: 0.97 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className={`relative isolate mt-5 overflow-hidden rounded-2xl p-5 text-center ${special ? 'bg-linear-130 from-[#3b3023] via-[#352631] to-[#2c293f] inset-ring inset-ring-[#ffd58028] motion-safe:after:absolute motion-safe:after:inset-[-100%] motion-safe:after:pointer-events-none motion-safe:after:bg-linear-110 motion-safe:after:from-transparent motion-safe:after:via-white/10 motion-safe:after:to-transparent motion-safe:after:animate-[rating-sheen_0.9s_ease-out_both]' : 'bg-raised'}`}
      >
        {special && <RatingSparkles />}
        <output htmlFor={id} className="inline-flex items-baseline gap-2" aria-live="polite">
          <span
            className={`text-6xl font-semibold tracking-tighter tabular-nums ${special ? 'bg-linear-120 from-[#ffe4a3] via-[#ffb7d6] to-[#c8baff] bg-clip-text text-transparent' : 'text-content'}`}
          >
            {formatted}
          </span>
          <span className="text-base text-muted">/ 10</span>
        </output>
        <p
          className={`mt-2 flex items-center justify-center gap-1.5 text-xs ${special ? 'text-[#e9cee4]' : 'text-muted'}`}
        >
          {special && <Sparkles size="0.875rem" aria-hidden="true" className="shrink-0" />}
          {rating === null ? t.unrated : special ? t.beyondPerfect : t.yourRating}
        </p>
      </motion.div>
      {rating !== null && (
        <button
          type="button"
          onClick={(event) => share({ artistId, recordingId }, event.currentTarget)}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-separator bg-raised px-4 text-sm font-medium hover:bg-[var(--hover)]"
        >
          <Share size={16} />
          {t.shareMyRating}
        </button>
      )}
      <div className="mt-1 flex items-center justify-between gap-3 text-xs">
        <span id={`${id}-hint`} className="flex items-center gap-1 text-muted">
          {rating === null ? (
            t.notWatched
          ) : (
            <>
              <Check size="0.875rem" aria-hidden="true" />
              {t.watched}
            </>
          )}
        </span>
        <button
          type="button"
          className="min-h-11 bg-transparent text-accent disabled:text-muted disabled:opacity-50"
          disabled={rating === null}
          onClick={() => {
            setBurst(null);
            setRating(recordingId, null);
          }}
        >
          {t.clearRating}
        </button>
      </div>
    </div>
  );
}
