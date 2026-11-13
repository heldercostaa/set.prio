import { Sparkle } from 'lucide-react';

const positions = [
  { left: '8%', top: '18%', delay: '0s' },
  { left: '88%', top: '12%', delay: '-1.8s' },
  { left: '16%', top: '76%', delay: '-2.7s' },
  { left: '82%', top: '72%', delay: '-0.9s' },
];

export function RatingSparkles({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="rating-sparkles pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      {positions.map(({ left, top, delay }, index) => (
        <Sparkle
          key={delay}
          size={compact ? 6 : index % 2 ? 10 : 14}
          fill="currentColor"
          strokeWidth={1}
          className="absolute text-[#ffd580] opacity-25 motion-safe:animate-[rating-sparkle_3.6s_ease-in-out_infinite]"
          style={{
            left: compact ? undefined : left,
            right: compact && index % 2 ? 3 : undefined,
            top: compact ? (index < 2 ? 2 : undefined) : top,
            bottom: compact && index >= 2 ? 2 : undefined,
            ...(compact && index % 2 === 0 ? { left: 3 } : {}),
            animationDelay: delay,
          }}
        />
      ))}
    </span>
  );
}
