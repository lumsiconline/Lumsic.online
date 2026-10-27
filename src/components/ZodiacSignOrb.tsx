import React from 'react';

export interface ZodiacSignMeta {
  id: string;
  name: string;
  dates: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  primaryColor: string;
  secondaryColor: string;
  deepColor: string;
  accentGlow: string;
}

export const ZODIAC_ORB_CONFIG: Record<string, ZodiacSignMeta> = {
  aries: {
    id: 'aries',
    name: 'Aries',
    dates: '21 Mar – 19 Apr',
    element: 'Fire',
    primaryColor: '#E61C1C',
    secondaryColor: '#FF6B6B',
    deepColor: '#B71C1C',
    accentGlow: '#FF3B30'
  },
  taurus: {
    id: 'taurus',
    name: 'Taurus',
    dates: '20 Apr – 20 May',
    element: 'Earth',
    primaryColor: '#FF6F3D',
    secondaryColor: '#FFA270',
    deepColor: '#D84315',
    accentGlow: '#FF7043'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    dates: '21 May – 20 Jun',
    element: 'Air',
    primaryColor: '#F5B700',
    secondaryColor: '#FFE066',
    deepColor: '#C79100',
    accentGlow: '#FFC107'
  },
  cancer: {
    id: 'cancer',
    name: 'Cancer',
    dates: '21 Jun – 22 Jul',
    element: 'Water',
    primaryColor: '#8CC63F',
    secondaryColor: '#CEF56C',
    deepColor: '#558B2F',
    accentGlow: '#9EE035'
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    dates: '23 Jul – 22 Aug',
    element: 'Fire',
    primaryColor: '#70C426',
    secondaryColor: '#B2F051',
    deepColor: '#438914',
    accentGlow: '#7CB342'
  },
  virgo: {
    id: 'virgo',
    name: 'Virgo',
    dates: '23 Aug – 22 Sep',
    element: 'Earth',
    primaryColor: '#12B886',
    secondaryColor: '#5EF0C8',
    deepColor: '#09795A',
    accentGlow: '#20C997'
  },
  libra: {
    id: 'libra',
    name: 'Libra',
    dates: '23 Sep – 22 Oct',
    element: 'Air',
    primaryColor: '#00B4D8',
    secondaryColor: '#70E3FF',
    deepColor: '#0077B6',
    accentGlow: '#00D4FF'
  },
  scorpio: {
    id: 'scorpio',
    name: 'Scorpio',
    dates: '23 Oct – 21 Nov',
    element: 'Water',
    primaryColor: '#0096C7',
    secondaryColor: '#60D2F4',
    deepColor: '#023E8A',
    accentGlow: '#0096C7'
  },
  sagittarius: {
    id: 'sagittarius',
    name: 'Sagittarius',
    dates: '22 Nov – 21 Dec',
    element: 'Fire',
    primaryColor: '#0096C7',
    secondaryColor: '#74E5FF',
    deepColor: '#005F73',
    accentGlow: '#00B4D8'
  },
  capricorn: {
    id: 'capricorn',
    name: 'Capricorn',
    dates: '22 Dec – 19 Jan',
    element: 'Earth',
    primaryColor: '#5C6BC0',
    secondaryColor: '#9FA8DA',
    deepColor: '#283593',
    accentGlow: '#5C6BC0'
  },
  aquarius: {
    id: 'aquarius',
    name: 'Aquarius',
    dates: '20 Jan – 18 Feb',
    element: 'Air',
    primaryColor: '#8E24AA',
    secondaryColor: '#CE78E6',
    deepColor: '#4A148C',
    accentGlow: '#AB47BC'
  },
  pisces: {
    id: 'pisces',
    name: 'Pisces',
    dates: '19 Feb – 20 Mar',
    element: 'Water',
    primaryColor: '#C2185B',
    secondaryColor: '#F48FB1',
    deepColor: '#7B0D38',
    accentGlow: '#E91E63'
  }
};

interface ZodiacSignOrbProps {
  signId: string;
  size?: number | string;
  showName?: boolean;
  className?: string;
  glyphColor?: string;
  glow?: boolean;
}

export const ZodiacSignOrb: React.FC<ZodiacSignOrbProps> = ({
  signId,
  size = 48,
  showName = false,
  className = '',
  glyphColor = '#120524',
  glow = false
}) => {
  const normalizedId = signId.toLowerCase().trim();
  const config = ZODIAC_ORB_CONFIG[normalizedId] || ZODIAC_ORB_CONFIG.aries;

  // Render exact astrological vector glyph matching the user's reference image
  const renderGlyph = () => {
    switch (normalizedId) {
      case 'aries':
        return (
          // Aries Ram Horns: central stem rising and branching into sweeping curling horns
          <path
            d="M 50 78 L 50 42 C 50 30, 42 22, 30 24 C 20 26, 16 38, 22 46 C 24 49, 29 48, 29 44 C 29 39, 24 33, 26 31 C 28 29, 34 29, 38 34 C 44 40, 44 48, 44 78 Z 
               M 50 42 C 50 30, 58 22, 70 24 C 80 26, 84 38, 78 46 C 76 49, 71 48, 71 44 C 71 39, 76 33, 74 31 C 72 29, 66 29, 62 34 C 56 40, 56 48, 56 78 Z"
            fill={glyphColor}
          />
        );

      case 'taurus':
        return (
          // Taurus Bull: lower round head with upper wide horn crescent
          <g fill={glyphColor}>
            <path
              d="M 23 23 C 27 34, 38 41, 50 41 C 62 41, 73 34, 77 23 C 78 21, 81 22, 80 25 C 76 38, 64 47, 50 47 C 36 47, 24 38, 20 25 C 19 22, 22 21, 23 23 Z"
            />
            <path
              fillRule="evenodd"
              d="M 50 45 C 37 45, 27 55, 27 68 C 27 80, 37 90, 50 90 C 63 90, 73 80, 73 68 C 73 55, 63 45, 50 45 Z 
                 M 50 51 C 60 51, 67 58, 67 68 C 67 77, 60 84, 50 84 C 40 84, 33 77, 33 68 C 33 58, 40 51, 50 51 Z"
            />
          </g>
        );

      case 'gemini':
        return (
          // Gemini Roman Numeral II with curved horizontal top & bottom crossbars
          <path
            d="M 24 23 C 40 28, 60 28, 76 23 C 78 22, 80 25, 78 27 C 62 33, 38 33, 22 27 C 20 25, 22 22, 24 23 Z
               M 24 77 C 40 72, 60 72, 76 77 C 78 78, 80 75, 78 73 C 62 67, 38 67, 22 73 C 20 75, 22 78, 24 77 Z
               M 37 28 L 43 28 L 43 72 L 37 72 Z
               M 57 28 L 63 28 L 63 72 L 57 72 Z"
            fill={glyphColor}
          />
        );

      case 'cancer':
        return (
          // Cancer 69 horizontal crab claws
          <g fill={glyphColor}>
            <circle cx="34" cy="38" r="8" fill="none" stroke={glyphColor} strokeWidth="5.5" />
            <path
              d="M 34 30 C 46 30, 68 31, 74 44 C 75 46, 72 48, 70 47 C 62 37, 44 35, 34 35 Z"
              fill={glyphColor}
            />
            <circle cx="66" cy="62" r="8" fill="none" stroke={glyphColor} strokeWidth="5.5" />
            <path
              d="M 66 70 C 54 70, 32 69, 26 56 C 25 54, 28 52, 30 53 C 38 63, 56 65, 66 65 Z"
              fill={glyphColor}
            />
          </g>
        );

      case 'leo':
        return (
          // Leo Lion Tail with bottom small loop and soaring arched head
          <path
            d="M 31 71 C 26 71, 22 67, 22 62 C 22 57, 26 53, 31 53 C 35 53, 38 55, 40 58 C 42 42, 50 24, 62 24 C 71 24, 78 30, 77 40 C 76 56, 67 69, 70 73 C 72 75, 76 73, 79 67 C 80 65, 83 67, 82 70 C 77 78, 71 80, 65 77 C 59 72, 69 54, 71 40 C 72 33, 67 29, 61 29 C 52 29, 46 45, 44 65 C 43 69, 39 71, 31 71 Z
               M 31 66 C 33 66, 35 64, 35 62 C 35 60, 33 58, 31 58 C 29 58, 27 60, 27 62 C 27 64, 29 66, 31 66 Z"
            fill={glyphColor}
          />
        );

      case 'virgo':
        return (
          // Virgo Maiden 'm' with final loop and crossing tail
          <path
            d="M 23 75 L 29 75 L 29 42 C 29 36, 33 32, 38 32 C 43 32, 46 36, 46 42 L 46 75 L 52 75 L 52 42 C 52 36, 56 32, 61 32 C 67 32, 70 36, 70 42 L 70 60 C 70 67, 75 73, 81 67 C 84 64, 85 57, 83 50 C 85 50, 88 53, 87 56 C 85 64, 80 72, 74 72 C 69 72, 65 67, 65 60 L 65 42 C 65 33, 59 27, 52 28 C 47 28, 43 31, 41 35 C 39 30, 34 28, 29 28 L 23 28 Z"
            fill={glyphColor}
          />
        );

      case 'libra':
        return (
          // Libra Celestial Scales: Arch over straight baseline
          <g fill={glyphColor}>
            <path
              d="M 22 47 L 34 47 C 36 37, 42 30, 50 30 C 58 30, 64 37, 66 47 L 78 47 L 78 53 L 68 53 C 67 40, 60 36, 50 36 C 40 36, 33 40, 32 53 L 22 53 Z"
            />
            <rect x="22" y="66" width="56" height="6.5" rx="3" />
          </g>
        );

      case 'scorpio':
        return (
          // Scorpio 'm' with sharp pointed barbed arrow tail
          <path
            d="M 22 75 L 28 75 L 28 42 C 28 36, 32 32, 37 32 C 42 32, 45 36, 45 42 L 45 75 L 51 75 L 51 42 C 51 36, 55 32, 60 32 C 66 32, 69 36, 69 42 L 69 68 C 69 72, 72 75, 76 75 L 81 75 L 77 71 L 81 63 L 88 73 L 80 81 L 80 77 L 75 77 C 68 77, 63 73, 63 66 L 63 42 C 63 33, 58 28, 51 28 C 46 28, 42 31, 40 35 C 38 30, 33 28, 28 28 L 22 28 Z"
            fill={glyphColor}
          />
        );

      case 'sagittarius':
        return (
          // Sagittarius Archer arrow diagonal with crossed stave
          <g fill={glyphColor}>
            <path
              d="M 26 76 L 73 29 L 77 33 L 30 80 Z"
            />
            <path
              d="M 54 23 L 80 23 L 80 49 L 74 49 L 74 30 L 54 30 Z"
            />
            <path
              d="M 33 48 L 52 67 L 48 71 L 29 52 Z"
            />
          </g>
        );

      case 'capricorn':
        return (
          // Capricorn Sea-Goat horns with twisted tail
          <path
            d="M 27 30 L 33 30 L 37 60 L 46 26 L 53 26 C 61 26, 66 32, 66 40 C 66 50, 58 57, 56 61 C 53 66, 53 73, 58 77 C 63 80, 68 78, 70 72 C 72 66, 68 62, 62 62 L 62 56 C 72 56, 78 63, 76 73 C 73 83, 63 86, 55 81 C 47 75, 47 65, 51 58 C 53 54, 60 48, 60 40 C 60 35, 57 32, 52 32 C 49 32, 45 35, 42 42 L 32 77 L 27 77 L 22 30 Z"
            fill={glyphColor}
          />
        );

      case 'aquarius':
        return (
          // Aquarius Dual zigzag flowing water waves
          <g fill={glyphColor}>
            <path
              d="M 22 39 L 32 29 L 44 41 L 56 29 L 68 41 L 78 31 L 78 38 L 68 48 L 56 36 L 44 48 L 32 36 L 22 46 Z"
            />
            <path
              d="M 22 59 L 32 49 L 44 61 L 56 49 L 68 61 L 78 51 L 78 58 L 68 68 L 56 56 L 44 68 L 32 56 L 22 66 Z"
            />
          </g>
        );

      case 'pisces':
        return (
          // Pisces Two curved swimming fish tied by horizontal cord
          <g fill={glyphColor}>
            <path
              d="M 33 22 C 30 38, 30 62, 33 78 C 30 78, 25 62, 25 50 C 25 38, 30 22, 33 22 Z"
            />
            <path
              d="M 31 22 C 40 38, 40 62, 31 78 L 37 78 C 46 62, 46 38, 37 22 Z"
            />
            <path
              d="M 69 22 C 60 38, 60 62, 69 78 L 63 78 C 54 62, 54 38, 63 22 Z"
            />
            <path
              d="M 67 22 C 70 38, 70 62, 67 78 C 70 78, 75 62, 75 50 C 75 38, 70 22, 67 22 Z"
            />
            <rect x="22" y="47" width="56" height="6.5" rx="3" />
          </g>
        );

      default:
        return null;
    }
  };

  const parsedSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div className={`inline-flex flex-col items-center justify-center shrink-0 ${className}`}>
      {/* 3D Glossy Sphere Orb using robust CSS radial-gradients (100% reliable on all desktop & mobile browsers) */}
      <div 
        className="relative rounded-full flex items-center justify-center select-none overflow-hidden transition-transform"
        style={{
          width: parsedSize,
          height: parsedSize,
          background: `radial-gradient(circle at 45% 35%, ${config.secondaryColor} 0%, ${config.primaryColor} 62%, ${config.deepColor} 100%)`,
          boxShadow: glow 
            ? `0 0 24px ${config.accentGlow}, 0 4px 14px rgba(0,0,0,0.65)`
            : `0 3px 10px rgba(0,0,0,0.55), inset 0 -3px 6px rgba(0,0,0,0.35)`,
          border: '1.5px solid rgba(255, 255, 255, 0.45)'
        }}
      >
        {/* Top 3D Glass Dome Highlight (produces the glossy marble shine from reference photo) */}
        <div 
          className="absolute inset-x-1 top-0.5 pointer-events-none"
          style={{
            height: '48%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.22) 58%, rgba(255,255,255,0) 100%)',
            borderRadius: '50% 50% 45% 45% / 100% 100% 30% 30%'
          }}
        />

        {/* Bottom subtle ambient reflection rim */}
        <div 
          className="absolute inset-x-2 bottom-0.5 pointer-events-none rounded-b-full"
          style={{
            height: '22%',
            background: 'linear-gradient(0deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)'
          }}
        />

        {/* Central Crisp Astrological Vector Glyph */}
        <svg
          viewBox="0 0 100 100"
          className="w-[66%] h-[66%] relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
          style={{ overflow: 'visible' }}
        >
          {renderGlyph()}
        </svg>
      </div>

      {showName && (
        <span className="text-[11px] font-bold tracking-wider uppercase mt-1.5 text-[#faf7f2] font-mono">
          {config.name}
        </span>
      )}
    </div>
  );
};
