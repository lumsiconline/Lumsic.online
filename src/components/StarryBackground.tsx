import React, { useMemo } from 'react';

interface StarryBackgroundProps {
  density?: 'normal' | 'dense';
  className?: string;
}

interface Star {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  color: string;
  duration: number; // seconds
  delay: number; // seconds
  minOpacity: number;
  maxOpacity: number;
  glow?: boolean;
}

export const StarryBackground: React.FC<StarryBackgroundProps> = ({ 
  density = 'normal',
  className = ''
}) => {
  // Generate deterministic stars with original delicate, little dot sizes
  const stars: Star[] = useMemo(() => {
    const count = density === 'dense' ? 85 : 55;
    const colors = [
      '#ffffff',
      '#faf7f2',
      '#f5e7a9',
      '#d4af37',
      '#e9d5ff',
      '#fef08a'
    ];

    const generated: Star[] = [];
    for (let i = 0; i < count; i++) {
      // Pseudo-random deterministic distribution
      const seedX = (Math.sin(i * 997 + 13) * 10000) % 1;
      const seedY = (Math.cos(i * 613 + 37) * 10000) % 1;
      const seedSize = (Math.sin(i * 331 + 71) * 10000) % 1;
      const seedColor = (Math.cos(i * 211 + 43) * 10000) % 1;
      const seedDuration = (Math.sin(i * 127 + 19) * 10000) % 1;
      const seedDelay = (Math.cos(i * 883 + 59) * 10000) % 1;

      const x = Math.abs(seedX) * 100;
      const y = Math.abs(seedY) * 100;
      
      // Sizes: original little dot stars (1px - 2px, max 2.5px)
      const sizeRatio = Math.abs(seedSize);
      let size = 1;
      if (sizeRatio > 0.85) size = 2.5;
      else if (sizeRatio > 0.55) size = 2;
      else if (sizeRatio > 0.3) size = 1.5;

      const colorIdx = Math.floor(Math.abs(seedColor) * colors.length) % colors.length;
      const color = colors[colorIdx];

      // Duration: 1.8s to 5.5s
      const duration = 1.8 + Math.abs(seedDuration) * 3.7;
      // Delay: 0 to 4.5s
      const delay = Math.abs(seedDelay) * 4.5;

      const minOpacity = 0.15 + Math.abs(seedX) * 0.2;
      const maxOpacity = 0.85 + Math.abs(seedY) * 0.15;

      generated.push({
        id: i,
        x,
        y,
        size,
        color,
        duration,
        delay,
        minOpacity,
        maxOpacity,
        glow: size >= 2
      });
    }
    return generated;
  }, [density]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full block transform-gpu pointer-events-none"
          style={{
            left: `${star.x.toFixed(2)}%`,
            top: `${star.y.toFixed(2)}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: star.glow ? `0 0 ${star.size * 2}px ${star.color}` : undefined,
            animationName: 'twinkleDot',
            animationDuration: `${star.duration.toFixed(2)}s`,
            animationDelay: `${star.delay.toFixed(2)}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
            ['--star-min-op' as string]: star.minOpacity,
            ['--star-max-op' as string]: star.maxOpacity
          }}
        />
      ))}
    </div>
  );
};
