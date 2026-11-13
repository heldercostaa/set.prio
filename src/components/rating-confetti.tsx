import { Sparkle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';

// Stable variation keeps each burst irregular without changing on a rerender.
function variation(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const particles = Array.from({ length: 72 }, (_, index) => {
  const seed = index * 11;
  const angle = ((205 + variation(seed) * 130) * Math.PI) / 180;
  const speed = 340 + variation(seed + 1) * 300;
  const duration = 1500 + variation(seed + 2) * 650;
  const spin = (variation(seed + 3) - 0.5) * 900;
  const flutter = 3 + variation(seed + 4) * 9;
  const phase = variation(seed + 5) * Math.PI * 2;
  const drift = (variation(seed + 6) - 0.5) * 28;
  const startX = (variation(seed + 7) - 0.5) * 16;
  const startY = (variation(seed + 8) - 0.5) * 10;
  const keyframes = Array.from({ length: 43 }, (_, frame) => {
    const progress = frame / 42;
    const time = (progress * duration) / 1000;
    const drag = (1 - Math.exp(-1.8 * time)) / 1.8;
    const x =
      startX +
      Math.cos(angle) * speed * drag +
      drift * time +
      Math.sin(time * 7 + phase) * flutter * progress;
    const y = startY + Math.sin(angle) * speed * time + 0.5 * 620 * time * time;
    return {
      offset: progress,
      opacity: Math.min(progress / 0.06, 1, (1 - progress) / 0.25),
      transform: `perspective(500px) translate3d(${x}px, ${y}px, 0) rotate(${phase + spin * time}deg) rotateX(${spin * time * 0.7}deg) rotateY(${spin * time * 0.4}deg)`,
    };
  });
  return {
    id: `confetti-${index}`,
    keyframes,
    duration,
    delay: variation(seed + 9) * 110,
    color: ['#ffd580', '#ff8fc8', '#b8a4ff', '#ffe4a3'][index % 4],
    width: 3 + variation(seed + 10) * 4,
    height: 5 + variation(seed + 1) * 5,
  };
});

export function RatingConfetti({
  container,
  x,
  y,
  onComplete,
  viewport = false,
}: {
  container: HTMLElement;
  x: number;
  y: number;
  onComplete: () => void;
  viewport?: boolean;
}) {
  const layer = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!layer.current) return;
    let active = true;
    const animations = Array.from(layer.current.children, (element, index) => {
      const particle = particles[index];
      return element.animate(particle.keyframes, {
        duration: particle.duration,
        delay: particle.delay,
        easing: 'linear',
        fill: 'both',
      });
    });
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (active) onComplete();
    });
    return () => {
      active = false;
      for (const animation of animations) animation.cancel();
    };
  }, [onComplete]);

  return createPortal(
    <span
      ref={layer}
      aria-hidden="true"
      className={`rating-confetti pointer-events-none inset-0 overflow-hidden rounded-[inherit] motion-reduce:hidden ${viewport ? 'fixed z-80' : 'absolute z-20'}`}
    >
      {particles.map((particle, index) => (
        <span
          key={particle.id}
          className="absolute opacity-0"
          style={{ left: x, top: y, color: particle.color }}
        >
          {index % 6 === 0 ? (
            <Sparkle size={particle.height + 3} fill="currentColor" strokeWidth={1} />
          ) : (
            <span
              className={`block bg-current ${index % 3 ? 'rounded-xs' : 'rounded-full'}`}
              style={{ width: particle.width, height: particle.height }}
            />
          )}
        </span>
      ))}
    </span>,
    container
  );
}
