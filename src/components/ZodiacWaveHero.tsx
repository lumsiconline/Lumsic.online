import React, { useState, useEffect } from 'react';

interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dates: string;
}

// 12 Zodiac Signs partitioned into 3 columns per specification
const COLUMN_1_SIGNS: ZodiacSign[] = [
  { id: 'aries', name: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22' },
  { id: 'leo', name: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22' },
  { id: 'libra', name: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22' },
];

const COLUMN_2_SIGNS: ZodiacSign[] = [
  { id: 'taurus', name: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19' },
];

const COLUMN_3_SIGNS: ZodiacSign[] = [
  { id: 'gemini', name: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20' },
];

// Phase sequence: 0: Small, 1: Medium, 2: Large, 3: Medium
const PHASE_PATTERNS = {
  // Col 1: Small -> Medium -> Large -> Medium
  col1: [0, 1, 2, 1],
  // Col 2: Medium -> Large -> Medium -> Small
  col2: [1, 2, 1, 0],
  // Col 3: Large -> Medium -> Small -> Medium
  col3: [2, 1, 0, 1],
};

type SizeTier = 'small' | 'medium' | 'large';

const TIER_MAPPING: Record<number, SizeTier> = {
  0: 'small',
  1: 'medium',
  2: 'large',
};

export const ZodiacWaveHero: React.FC = () => {
  // Dynamic wave step pointer (0 to 3), cycling every 3.2s
  const [waveStep, setWaveStep] = useState<number>(0);
  const [hoveredSign, setHoveredSign] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setWaveStep((prev) => (prev + 1) % 4);
    }, 3200);

    return () => clearInterval(timer);
  }, []);

  const getSignTier = (colPattern: number[], rowIndex: number): SizeTier => {
    // Shift pattern index smoothly based on waveStep
    const patternIndex = (rowIndex + waveStep) % 4;
    const tierNum = colPattern[patternIndex];
    return TIER_MAPPING[tierNum] || 'medium';
  };

  const renderZodiacNode = (sign: ZodiacSign, tier: SizeTier) => {
    const isHovered = hoveredSign === sign.id;
    const isLarge = isHovered || tier === 'large';
    const isMedium = !isHovered && tier === 'medium';
    const isSmall = !isHovered && tier === 'small';

    return (
      <div
        key={sign.id}
        onMouseEnter={() => setHoveredSign(sign.id)}
        onMouseLeave={() => setHoveredSign(null)}
        className="relative flex items-center justify-center transition-all duration-1000 ease-in-out cursor-pointer select-none"
        style={{
          transform: isLarge
            ? 'scale(1.14)'
            : isMedium
            ? 'scale(0.96)'
            : 'scale(0.82)',
          zIndex: isLarge ? 30 : isMedium ? 20 : 10,
        }}
      >
        {/* Glow halo when large/prominent */}
        <div
          className={`absolute -inset-1.5 rounded-full transition-all duration-1000 ${
            isLarge
              ? 'bg-gradient-to-r from-amber-300/40 via-yellow-200/50 to-orange-300/40 blur-md opacity-100 scale-105'
              : 'opacity-0 scale-90'
          }`}
        />

        {/* Minimal Circular Badge */}
        <div
          className={`relative rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
            isLarge
              ? 'w-22 h-22 sm:w-26 sm:h-26 bg-white border-2 border-[#EAB308] shadow-xl shadow-amber-500/20'
              : isMedium
              ? 'w-18 h-18 sm:w-21 sm:h-21 bg-white/95 border border-amber-300/80 shadow-md shadow-amber-400/10'
              : 'w-15 h-15 sm:w-18 sm:h-18 bg-[#FFFDF9]/90 border border-amber-200/60 shadow-xs opacity-85'
          }`}
        >
          {/* Subtle Outer Concentric Ring Accent for Large */}
          {isLarge && (
            <div className="absolute inset-0.5 rounded-full border border-amber-200 pointer-events-none" />
          )}

          {/* Clean Zodiac Glyph */}
          <span
            className={`font-serif leading-none transition-all duration-1000 select-none ${
              isLarge
                ? 'text-3xl sm:text-4xl text-gray-950 font-black'
                : isMedium
                ? 'text-2xl sm:text-3xl text-gray-900 font-bold'
                : 'text-xl sm:text-2xl text-gray-800 font-semibold'
            }`}
          >
            {sign.symbol}
          </span>

          {/* Clean Name Linework */}
          <span
            className={`font-sans tracking-wider uppercase transition-all duration-1000 font-bold ${
              isLarge
                ? 'text-[10px] sm:text-[11px] text-[#C25E00] mt-1'
                : isMedium
                ? 'text-[9px] sm:text-[10px] text-gray-700 mt-0.5'
                : 'text-[8px] sm:text-[9px] text-gray-500 mt-0.5'
            }`}
          >
            {sign.name}
          </span>

          {/* Element dot when prominent */}
          {isLarge && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] mt-0.5 animate-pulse" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[490px] h-[390px] sm:h-[450px] flex items-center justify-center select-none overflow-visible">
      
      {/* 9. CENTER FOCAL POINT: Subtle Circular Orbital Lines & Soft Radial Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        
        {/* Soft Radial Warm Gold & Orange Glow (Light & Elegant, NOT Dark) */}
        <div className="w-[320px] sm:w-[380px] h-[320px] sm:h-[380px] rounded-full bg-gradient-to-r from-amber-200/35 via-yellow-100/30 to-orange-100/25 blur-3xl" />

        {/* Outer Orbital Rotating Celestial Circle */}
        <div className="absolute w-[340px] sm:w-[410px] h-[340px] sm:h-[410px] rounded-full border border-amber-300/30 animate-celestial-orbit pointer-events-none">
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] text-amber-500">✦</span>
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] text-amber-500">✦</span>
          <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 text-[9px] text-amber-500">✦</span>
          <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 text-[9px] text-amber-500">✦</span>
        </div>

        {/* Middle Dashed Orbital Ring */}
        <div className="absolute w-[260px] sm:w-[310px] h-[260px] sm:h-[310px] rounded-full border border-dashed border-amber-400/40 animate-celestial-orbit-reverse pointer-events-none" />

        {/* Inner Solid Subtle Ring with Compass Accents */}
        <div className="absolute w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] rounded-full border border-amber-300/35 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" stroke="#EAB308" strokeWidth="0.75" />
              <circle cx="30" cy="30" r="14" stroke="#FACC15" strokeWidth="0.5" />
              <line x1="30" y1="4" x2="30" y2="56" stroke="#EAB308" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="4" y1="30" x2="56" y2="30" stroke="#EAB308" strokeWidth="0.5" strokeDasharray="2 3" />
              <polygon points="30,18 33,30 30,27 27,30" fill="#EAB308" />
              <polygon points="30,42 33,30 30,33 27,30" fill="#CA8A04" />
            </svg>
          </div>
        </div>

      </div>

      {/* 8. ZODIAC 3-COLUMN FLOWING COMPOSITION */}
      <div className="relative z-10 w-full grid grid-cols-3 gap-2 sm:gap-4 items-center justify-items-center">
        
        {/* COLUMN 1: Aries, Cancer, Leo, Libra (Flow wave 1) */}
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 animate-column-wave-1">
          {COLUMN_1_SIGNS.map((sign, idx) => {
            const tier = getSignTier(PHASE_PATTERNS.col1, idx);
            return renderZodiacNode(sign, tier);
          })}
        </div>

        {/* COLUMN 2: Taurus, Virgo, Scorpio, Capricorn (Flow wave 2 - offset) */}
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 animate-column-wave-2 pt-2 sm:pt-4">
          {COLUMN_2_SIGNS.map((sign, idx) => {
            const tier = getSignTier(PHASE_PATTERNS.col2, idx);
            return renderZodiacNode(sign, tier);
          })}
        </div>

        {/* COLUMN 3: Gemini, Sagittarius, Aquarius, Pisces (Flow wave 3 - offset) */}
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 animate-column-wave-3">
          {COLUMN_3_SIGNS.map((sign, idx) => {
            const tier = getSignTier(PHASE_PATTERNS.col3, idx);
            return renderZodiacNode(sign, tier);
          })}
        </div>

      </div>

      {/* Subtle Bottom Caption for Context */}
      <div className="absolute -bottom-5 inset-x-0 flex items-center justify-center pointer-events-none">
        <span className="text-[11px] font-semibold text-amber-800/80 bg-amber-50/80 px-3 py-0.5 rounded-full border border-amber-200/60 shadow-2xs">
          ✦ 12 Cosmic Zodiac Archetypes · In Perpetual Motion
        </span>
      </div>

    </div>
  );
};
