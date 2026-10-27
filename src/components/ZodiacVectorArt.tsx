import React from 'react';

interface ZodiacVectorArtProps {
  signId: string;
  className?: string;
  size?: number | string;
}

export const ZodiacVectorArt: React.FC<ZodiacVectorArtProps> = ({
  signId,
  className = '',
  size = 72
}) => {
  const id = signId.toLowerCase().trim();

  // Color palette matching the screenshot:
  // Primary lines: Royal Blue (#2563EB) & Electric Indigo (#4F46E5)
  // Secondary accents: Purple (#9333EA)
  // Sparkle stars: Amber Gold (#F59E0B)
  const blue = '#2563EB';
  const purple = '#7C3AED';
  const gold = '#F59E0B';

  const renderArtwork = () => {
    switch (id) {
      case 'aries':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Celestial stars around */}
            <circle cx="22" cy="22" r="1.5" fill={gold} stroke="none" />
            <circle cx="78" cy="22" r="1.5" fill={gold} stroke="none" />
            <circle cx="50" cy="14" r="1.8" fill={gold} stroke="none" />
            {/* Curved Ram Horns */}
            <path
              d="M 50 48 Q 42 32 30 32 Q 18 32 18 46 Q 18 60 32 60 Q 40 60 46 52"
              stroke={blue}
            />
            <path
              d="M 50 48 Q 58 32 70 32 Q 82 32 82 46 Q 82 60 68 60 Q 60 60 54 52"
              stroke={blue}
            />
            {/* Ram Face & Muzzle */}
            <path
              d="M 44 48 L 56 48 L 54 70 Q 50 78 46 70 Z"
              stroke={purple}
              fill="rgba(124, 58, 237, 0.05)"
            />
            {/* Eyes */}
            <circle cx="43" cy="56" r="1.5" fill={purple} stroke="none" />
            <circle cx="57" cy="56" r="1.5" fill={purple} stroke="none" />
            {/* Nostrils */}
            <ellipse cx="50" cy="72" rx="3" ry="1.5" stroke={blue} />
            {/* Star sparkle forehead */}
            <path d="M 50 36 L 50 44 M 46 40 L 54 40" stroke={gold} strokeWidth="1.8" />
          </g>
        );

      case 'taurus':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="20" cy="20" r="1.5" fill={gold} stroke="none" />
            <circle cx="80" cy="20" r="1.5" fill={gold} stroke="none" />
            {/* Majestic Bull Horns */}
            <path
              d="M 24 24 Q 28 42 42 46 Q 50 48 58 46 Q 72 42 76 24"
              stroke={blue}
            />
            <path
              d="M 22 22 Q 18 16 14 18 Q 12 24 20 28"
              stroke={blue}
            />
            <path
              d="M 78 22 Q 82 16 86 18 Q 88 24 80 28"
              stroke={blue}
            />
            {/* Bull Head */}
            <path
              d="M 36 44 L 64 44 L 60 74 Q 50 82 40 74 Z"
              stroke={purple}
              fill="rgba(124, 58, 237, 0.05)"
            />
            {/* Forehead star */}
            <circle cx="50" cy="52" r="2" fill={gold} stroke="none" />
            {/* Eyes */}
            <circle cx="42" cy="58" r="1.5" fill={purple} stroke="none" />
            <circle cx="58" cy="58" r="1.5" fill={purple} stroke="none" />
            {/* Nose Ring */}
            <circle cx="50" cy="75" r="5" stroke={blue} />
          </g>
        );

      case 'gemini':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="14" r="1.8" fill={gold} stroke="none" />
            {/* Left Twin Face Profile */}
            <path
              d="M 36 28 Q 42 28 42 38 Q 40 50 36 56 Q 30 64 36 76"
              stroke={blue}
            />
            <circle cx="38" cy="38" r="1.5" fill={blue} stroke="none" />
            <path d="M 30 46 Q 35 48 30 52" stroke={purple} />
            {/* Right Twin Face Profile */}
            <path
              d="M 64 28 Q 58 28 58 38 Q 60 50 64 56 Q 70 64 64 76"
              stroke={blue}
            />
            <circle cx="62" cy="38" r="1.5" fill={blue} stroke="none" />
            <path d="M 70 46 Q 65 48 70 52" stroke={purple} />
            {/* Cosmic Pillars & Sparkle linking them */}
            <path d="M 46 22 L 54 22 M 46 80 L 54 80" stroke={gold} />
            <path d="M 50 30 L 50 72" stroke={purple} strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="2" fill={gold} stroke="none" />
          </g>
        );

      case 'cancer':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="30" r="1.5" fill={gold} stroke="none" />
            <circle cx="82" cy="30" r="1.5" fill={gold} stroke="none" />
            {/* Crab Body */}
            <ellipse cx="50" cy="54" rx="16" ry="12" stroke={purple} fill="rgba(124, 58, 237, 0.05)" />
            {/* Left Pincer Claw */}
            <path
              d="M 36 46 Q 24 38 22 28 Q 28 24 34 32 Q 36 38 42 42"
              stroke={blue}
            />
            <path d="M 22 28 Q 28 20 34 26" stroke={blue} />
            {/* Right Pincer Claw */}
            <path
              d="M 64 46 Q 76 38 78 28 Q 72 24 66 32 Q 64 38 58 42"
              stroke={blue}
            />
            <path d="M 78 28 Q 72 20 66 26" stroke={blue} />
            {/* Eyes */}
            <circle cx="44" cy="46" r="2" fill={blue} stroke="none" />
            <circle cx="56" cy="46" r="2" fill={blue} stroke="none" />
            {/* Legs */}
            <path d="M 36 60 Q 26 66 22 74" stroke={purple} />
            <path d="M 38 64 Q 30 72 28 80" stroke={purple} />
            <path d="M 64 60 Q 74 66 78 74" stroke={purple} />
            <path d="M 62 64 Q 70 72 72 80" stroke={purple} />
            <circle cx="50" cy="54" r="1.8" fill={gold} stroke="none" />
          </g>
        );

      case 'leo':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Sunburst Radiance around Lion Mane */}
            <circle cx="50" cy="14" r="1.8" fill={gold} stroke="none" />
            <path
              d="M 28 28 Q 38 18 50 18 Q 62 18 72 28 Q 84 40 82 56 Q 80 72 68 80 Q 50 86 32 80 Q 20 72 18 56 Q 16 40 28 28 Z"
              stroke={blue}
            />
            {/* Inner Lion Face */}
            <path
              d="M 38 44 Q 50 40 62 44 L 60 62 Q 50 72 40 62 Z"
              stroke={purple}
              fill="rgba(124, 58, 237, 0.05)"
            />
            {/* Crown / Forehead star */}
            <path d="M 50 26 L 50 34 M 46 30 L 54 30" stroke={gold} strokeWidth="1.8" />
            {/* Eyes */}
            <circle cx="44" cy="50" r="1.5" fill={purple} stroke="none" />
            <circle cx="56" cy="50" r="1.5" fill={purple} stroke="none" />
            {/* Nose & Whiskers */}
            <path d="M 48 58 L 52 58 L 50 61 Z" fill={blue} stroke="none" />
            <path d="M 34 60 L 26 58 M 34 63 L 26 64" stroke={gold} strokeWidth="1.2" />
            <path d="M 66 60 L 74 58 M 66 63 L 74 64" stroke={gold} strokeWidth="1.2" />
          </g>
        );

      case 'virgo':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Wheat stalk / Maiden Crown with stars */}
            <circle cx="50" cy="14" r="1.8" fill={gold} stroke="none" />
            <circle cx="28" cy="24" r="1.5" fill={gold} stroke="none" />
            <circle cx="72" cy="24" r="1.5" fill={gold} stroke="none" />
            {/* Flowing Celestial Hair */}
            <path
              d="M 34 32 Q 22 44 26 66 Q 30 78 38 80"
              stroke={blue}
            />
            <path
              d="M 66 32 Q 78 44 74 66 Q 70 78 62 80"
              stroke={blue}
            />
            {/* Elegant Face & Jawline */}
            <path
              d="M 36 34 Q 50 30 64 34 L 62 54 Q 50 68 38 54 Z"
              stroke={purple}
              fill="rgba(124, 58, 237, 0.05)"
            />
            {/* Eyes closed in meditation */}
            <path d="M 42 44 Q 45 47 48 44" stroke={purple} />
            <path d="M 52 44 Q 55 47 58 44" stroke={purple} />
            {/* Gentle lips */}
            <path d="M 47 56 Q 50 58 53 56" stroke={blue} strokeWidth="1.8" />
            {/* Sacred Wheat grain sprig */}
            <path d="M 50 66 L 50 80" stroke={gold} />
            <ellipse cx="46" cy="70" rx="2.5" ry="1.5" stroke={gold} />
            <ellipse cx="54" cy="74" rx="2.5" ry="1.5" stroke={gold} />
          </g>
        );

      case 'libra':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="14" r="1.8" fill={gold} stroke="none" />
            {/* Central Pillar of Truth */}
            <path d="M 50 18 L 50 78" stroke={blue} />
            {/* Horizontal Balance Beam */}
            <path d="M 22 34 L 78 34" stroke={blue} />
            <circle cx="50" cy="34" r="3" fill={gold} stroke="none" />
            {/* Left Pan Hanging Cords & Plate */}
            <path d="M 26 34 L 20 54 M 26 34 L 32 54" stroke={purple} />
            <path d="M 16 54 Q 26 62 36 54 Z" stroke={purple} fill="rgba(124, 58, 237, 0.08)" />
            {/* Right Pan Hanging Cords & Plate */}
            <path d="M 74 34 L 68 54 M 74 34 L 80 54" stroke={purple} />
            <path d="M 64 54 Q 74 62 84 54 Z" stroke={purple} fill="rgba(124, 58, 237, 0.08)" />
            {/* Base */}
            <path d="M 38 78 L 62 78" stroke={blue} />
            <circle cx="26" cy="62" r="1.5" fill={gold} stroke="none" />
            <circle cx="74" cy="62" r="1.5" fill={gold} stroke="none" />
          </g>
        );

      case 'scorpio':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22" cy="18" r="1.5" fill={gold} stroke="none" />
            <circle cx="78" cy="18" r="1.5" fill={gold} stroke="none" />
            {/* Scorpio Pincers */}
            <path
              d="M 38 48 Q 28 38 24 26 Q 30 22 36 30 Q 38 38 44 44"
              stroke={blue}
            />
            <path
              d="M 62 48 Q 72 38 76 26 Q 70 22 64 30 Q 62 38 56 44"
              stroke={blue}
            />
            {/* Armored Carapace Body */}
            <ellipse cx="50" cy="52" rx="10" ry="14" stroke={purple} fill="rgba(124, 58, 237, 0.06)" />
            {/* Curving Stinger Tail */}
            <path
              d="M 50 66 Q 50 78 60 80 Q 72 80 74 68 Q 74 54 62 50"
              stroke={blue}
            />
            {/* Sharp Stinger Barb */}
            <path d="M 62 50 L 68 46 L 64 54 Z" fill={gold} stroke="none" />
            <circle cx="50" cy="46" r="1.5" fill={purple} stroke="none" />
            <circle cx="50" cy="54" r="1.5" fill={purple} stroke="none" />
          </g>
        );

      case 'sagittarius':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="80" cy="18" r="1.8" fill={gold} stroke="none" />
            {/* Cosmic Bow */}
            <path
              d="M 26 68 Q 42 42 68 26"
              stroke={blue}
            />
            {/* Bow String */}
            <path d="M 26 68 L 48 54 L 68 26" stroke={purple} strokeDasharray="2 2" />
            {/* Arrow aimed upward */}
            <path d="M 28 72 L 76 24" stroke={blue} strokeWidth="2.5" />
            {/* Arrowhead */}
            <path d="M 66 22 L 78 22 L 78 34" stroke={gold} strokeWidth="2.5" />
            {/* Arrow fletching feathers */}
            <path d="M 26 68 L 22 76 M 32 74 L 28 82" stroke={purple} />
            {/* Starlight burst */}
            <circle cx="52" cy="48" r="2" fill={gold} stroke="none" />
          </g>
        );

      case 'capricorn':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="20" cy="18" r="1.5" fill={gold} stroke="none" />
            <circle cx="80" cy="18" r="1.5" fill={gold} stroke="none" />
            {/* Mountain Horns */}
            <path
              d="M 44 42 Q 32 24 24 20 Q 20 28 32 38"
              stroke={blue}
            />
            <path
              d="M 56 42 Q 68 24 76 20 Q 80 28 68 38"
              stroke={blue}
            />
            {/* Goat Head */}
            <path
              d="M 40 40 L 60 40 L 56 64 Q 50 72 44 64 Z"
              stroke={purple}
              fill="rgba(124, 58, 237, 0.05)"
            />
            {/* Eyes & Beard */}
            <circle cx="45" cy="48" r="1.5" fill={purple} stroke="none" />
            <circle cx="55" cy="48" r="1.5" fill={purple} stroke="none" />
            <path d="M 48 68 L 50 78 L 52 68" stroke={gold} />
            {/* Sea-Goat Fishtail swirl */}
            <path
              d="M 50 68 Q 62 76 68 68 Q 72 58 80 64"
              stroke={blue}
            />
          </g>
        );

      case 'aquarius':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22" cy="22" r="1.5" fill={gold} stroke="none" />
            <circle cx="78" cy="22" r="1.5" fill={gold} stroke="none" />
            {/* Sacred Water Urn / Amphora */}
            <ellipse cx="44" cy="36" rx="6" ry="3" stroke={blue} />
            <path
              d="M 38 36 Q 30 46 36 56 Q 42 66 54 62 Q 62 58 58 48 Q 54 38 50 36"
              stroke={blue}
              fill="rgba(37, 99, 235, 0.05)"
            />
            {/* Handle of the vessel */}
            <path d="M 34 42 Q 26 48 32 54" stroke={purple} />
            {/* Cosmic Waves of Celestial Light flowing out */}
            <path
              d="M 46 48 Q 54 44 62 50 Q 70 56 78 52"
              stroke={purple}
            />
            <path
              d="M 44 58 Q 52 54 60 60 Q 68 66 76 62"
              stroke={purple}
            />
            <path
              d="M 42 68 Q 50 64 58 70 Q 66 76 74 72"
              stroke={blue}
            />
            {/* Star drops */}
            <circle cx="64" cy="42" r="1.5" fill={gold} stroke="none" />
            <circle cx="72" cy="78" r="1.5" fill={gold} stroke="none" />
          </g>
        );

      case 'pisces':
        return (
          <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="14" r="1.8" fill={gold} stroke="none" />
            <circle cx="50" cy="86" r="1.8" fill={gold} stroke="none" />
            {/* Top Swimming Fish */}
            <path
              d="M 30 36 Q 50 24 70 36 Q 50 48 30 36 Z"
              stroke={blue}
              fill="rgba(37, 99, 235, 0.05)"
            />
            {/* Top Fish Fins & Eye */}
            <path d="M 28 36 L 20 30 M 28 36 L 20 42" stroke={purple} />
            <circle cx="64" cy="36" r="1.5" fill={blue} stroke="none" />
            {/* Bottom Swimming Fish (swimming opposite) */}
            <path
              d="M 70 64 Q 50 52 30 64 Q 50 76 70 64 Z"
              stroke={blue}
              fill="rgba(37, 99, 235, 0.05)"
            />
            {/* Bottom Fish Fins & Eye */}
            <path d="M 72 64 L 80 58 M 72 64 L 80 70" stroke={purple} />
            <circle cx="36" cy="64" r="1.5" fill={blue} stroke="none" />
            {/* Sacred Silver Cord uniting both fish */}
            <path d="M 50 36 L 50 64" stroke={gold} strokeDasharray="2.5 2.5" />
            <circle cx="50" cy="50" r="2.2" fill={gold} stroke="none" />
          </g>
        );

      default:
        return null;
    }
  };

  const parsedSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative rounded-full flex items-center justify-center select-none ${className}`}
      style={{
        width: parsedSize,
        height: parsedSize,
        background: 'linear-gradient(180deg, #FAF5FF 0%, #F5F3FF 50%, #EFF6FF 100%)',
        border: '1.5px solid rgba(224, 231, 255, 0.9)',
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08), inset 0 1px 3px rgba(255, 255, 255, 0.9)'
      }}
    >
      {/* Outer delicate concentric ring */}
      <div className="absolute inset-1.5 rounded-full border border-purple-200/50 pointer-events-none" />
      
      {/* Central SVG Line-Art */}
      <svg
        viewBox="0 0 100 100"
        className="w-[84%] h-[84%] relative z-10"
        style={{ overflow: 'visible' }}
      >
        {renderArtwork()}
      </svg>
    </div>
  );
};
