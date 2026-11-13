import type { CSSProperties } from 'react';
import { boardSparkles } from '../utils/board-sparkles';
import { Sparkle } from 'lucide-react';

const positions = [
  { left: '8%', top: '18%', delay: '0s' },
  { left: '88%', top: '12%', delay: '-1.8s' },
  { left: '16%', top: '76%', delay: '-2.7s' },
  { left: '82%', top: '72%', delay: '-0.9s' },
];

export function RatingSparkles({
  compact = false,
  seed = 'rating',
}: {
  compact?: boolean;
  seed?: string;
}) {
  if (compact)
    return (
      <span
        aria-hidden="true"
        className="rating-sparkles pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        {boardSparkles(seed).map((star) => (
          <span
            key={star.id}
            className="absolute left-0 top-0 h-[calc(100%_-_5px)] w-[calc(100%_-_5px)] origin-top-left text-[#ffd580] opacity-20 motion-safe:animate-[board-sparkle_linear_infinite]"
            style={
              {
                ...Object.fromEntries(
                  star.positions.flatMap((position, index) => [
                    [`--star-x-${index}`, `${position.x * 100}%`],
                    [`--star-y-${index}`, `${position.y * 100}%`],
                  ])
                ),
                transform: 'translate(var(--star-x-0), var(--star-y-0))',
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              } as CSSProperties
            }
          >
            <Sparkle size={star.size} fill="currentColor" strokeWidth={1} />
          </span>
        ))}
      </span>
    );
  return (
    <span
      aria-hidden="true"
      className="rating-sparkles pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      {positions.map(({ left, top, delay }, index) => (
        <Sparkle
          key={delay}
          size={index % 2 ? 10 : 14}
          fill="currentColor"
          strokeWidth={1}
          className="absolute text-[#ffd580] opacity-25 motion-safe:animate-[rating-sparkle_3.6s_ease-in-out_infinite]"
          style={{
            left,
            top,
            animationDelay: delay,
          }}
        />
      ))}
    </span>
  );
}
