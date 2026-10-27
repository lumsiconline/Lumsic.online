import React from 'react';

export type ZodiacSignName =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export interface ZodiacSignMeta {
  name: ZodiacSignName;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dates: string;
  gradient: string;
  themeColor: string;
  bgLight: string;
}

export const ZODIAC_SIGNS_DATA: ZodiacSignMeta[] = [
  { name: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19', gradient: 'from-[#059669] to-[#10B981]', themeColor: '#059669', bgLight: '#ECFDF5' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20', gradient: 'from-[#4F46E5] to-[#7C3AED]', themeColor: '#4F46E5', bgLight: '#EEF2FF' },
  { name: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20', gradient: 'from-[#EA580C] to-[#F97316]', themeColor: '#EA580C', bgLight: '#FFF7ED' },
  { name: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22', gradient: 'from-[#A21CAF] to-[#D946EF]', themeColor: '#A21CAF', bgLight: '#FDF4FF' },
  { name: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22', gradient: 'from-[#DC2626] via-[#EA580C] to-[#F59E0B]', themeColor: '#DC2626', bgLight: '#FEF2F2' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22', gradient: 'from-[#CA8A04] to-[#FBBF24]', themeColor: '#CA8A04', bgLight: '#FEFCE8' },
  { name: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22', gradient: 'from-[#E11D48] to-[#FB7185]', themeColor: '#E11D48', bgLight: '#FFF1F2' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21', gradient: 'from-[#047857] to-[#10B981]', themeColor: '#047857', bgLight: '#ECFDF5' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21', gradient: 'from-[#BE185D] to-[#EC4899]', themeColor: '#BE185D', bgLight: '#FDF2F8' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19', gradient: 'from-[#4338CA] to-[#6366F1]', themeColor: '#4338CA', bgLight: '#EEF2FF' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18', gradient: 'from-[#0284C7] to-[#06B6D4]', themeColor: '#0284C7', bgLight: '#F0FDFA' },
  { name: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20', gradient: 'from-[#0369A1] to-[#38BDF8]', themeColor: '#0369A1', bgLight: '#F0F9FF' },
];

interface ZodiacSignArtProps {
  sign: ZodiacSignName | string;
  size?: number;
  className?: string;
  showHalo?: boolean;
}

/**
 * Real, vibrant stylized zodiac sign vector illustration
 * Exactly matching the colorful archetypal silhouettes provided by user
 */
export const ZodiacSignArt: React.FC<ZodiacSignArtProps> = ({
  sign,
  size = 48,
  className = '',
  showHalo = true,
}) => {
  const norm = (sign || 'Aries').trim();
  const meta = ZODIAC_SIGNS_DATA.find(s => s.name.toLowerCase() === norm.toLowerCase()) || ZODIAC_SIGNS_DATA[0];

  const renderSignPath = () => {
    switch (meta.name) {
      case 'Aries':
        // Vibrant Ram Head with grand curled horn
        return (
          <g transform="translate(10, 10)">
            {/* Horn curved spiral */}
            <path
              d="M38 18 C30 6 12 10 10 24 C8 36 20 44 30 42 C38 40 42 32 38 24 C34 16 22 20 20 28 C18 34 26 36 30 34"
              fill="none"
              stroke="url(#ariesGrad)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Ram face & muzzle profile */}
            <path
              d="M32 30 C34 38 42 46 52 50 C58 52 64 48 62 42 C60 36 50 34 46 28 C42 22 36 22 32 30 Z"
              fill="url(#ariesGrad)"
            />
            {/* Horn inner ring accent */}
            <circle cx="24" cy="27" r="4.5" fill="#A7F3D0" />
            <circle cx="48" cy="38" r="2.2" fill="#FFFFFF" />
          </g>
        );

      case 'Taurus':
        // Strong horned bull head
        return (
          <g transform="translate(10, 12)">
            {/* Sharp upward crescent horns */}
            <path
              d="M10 16 C18 26 26 32 38 32 C50 32 58 26 66 16 C60 22 48 24 38 24 C28 24 16 22 10 16 Z"
              fill="#312E81"
            />
            {/* Horn tips */}
            <path d="M10 16 C8 8 16 2 24 8 C18 10 14 14 10 16 Z" fill="url(#taurusGrad)" />
            <path d="M66 16 C68 8 60 2 52 8 C58 10 62 14 66 16 Z" fill="url(#taurusGrad)" />
            {/* Bull skull & muzzle */}
            <path
              d="M24 28 C24 22 52 22 52 28 C52 38 56 46 54 54 C52 60 24 60 22 54 C20 46 24 38 24 28 Z"
              fill="url(#taurusGrad)"
            />
            {/* Snout & nostrils */}
            <ellipse cx="38" cy="52" rx="10" ry="5.5" fill="#C7D2FE" />
            <circle cx="34" cy="52" r="1.8" fill="#312E81" />
            <circle cx="42" cy="52" r="1.8" fill="#312E81" />
            {/* Eyes */}
            <circle cx="30" cy="36" r="2" fill="#FFFFFF" />
            <circle cx="46" cy="36" r="2" fill="#FFFFFF" />
          </g>
        );

      case 'Gemini':
        // Twin maiden profiles with flowing intertwined hair
        return (
          <g transform="translate(12, 10)">
            {/* Back twin profile */}
            <path
              d="M26 14 C18 18 16 28 20 36 C22 38 20 42 16 46 C24 48 30 44 32 38 C32 28 32 18 26 14 Z"
              fill="#9A3412"
            />
            {/* Front twin silhouette with flowing tresses */}
            <path
              d="M32 10 C38 6 46 12 48 20 C50 26 46 32 44 38 C42 44 46 52 48 58 C44 58 38 54 36 48 C34 42 36 34 34 26 C32 18 28 14 32 10 Z"
              fill="url(#geminiGrad)"
            />
            {/* Delicate front profile */}
            <path
              d="M44 22 C48 22 50 25 48 28 C46 30 48 33 46 35 C44 37 40 37 38 34"
              stroke="#FFF7ED"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Braid strand */}
            <path
              d="M42 42 C46 48 44 54 40 60"
              stroke="url(#geminiGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'Cancer':
        // Vibrant stylized Crab with two prominent pincers
        return (
          <g transform="translate(10, 12)">
            {/* Left large pincer claw */}
            <path
              d="M12 24 C10 12 24 8 28 18 C26 22 20 22 18 20 C16 22 18 26 22 28 C16 30 12 28 12 24 Z"
              fill="url(#cancerGrad)"
            />
            {/* Right large pincer claw */}
            <path
              d="M64 24 C66 12 52 8 48 18 C50 22 56 22 58 20 C60 22 58 26 54 28 C60 30 64 28 64 24 Z"
              fill="url(#cancerGrad)"
            />
            {/* Crab central dome carapace shell */}
            <ellipse cx="38" cy="38" rx="20" ry="16" fill="url(#cancerGrad)" />
            {/* Little legs on sides */}
            <path d="M14 38 C8 40 8 46 14 48" stroke="url(#cancerGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M16 46 C12 50 12 56 18 58" stroke="url(#cancerGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M62 38 C68 40 68 46 62 48" stroke="url(#cancerGrad)" strokeWidth="3" strokeLinecap="round" />
            <path d="M60 46 C64 50 64 56 58 58" stroke="url(#cancerGrad)" strokeWidth="3" strokeLinecap="round" />
            {/* Little eye stalks */}
            <circle cx="33" cy="22" r="2.5" fill="#FDF4FF" />
            <circle cx="43" cy="22" r="2.5" fill="#FDF4FF" />
          </g>
        );

      case 'Leo':
        // Radiant fiery Sunburst Lion Face
        return (
          <g transform="translate(10, 10)">
            {/* 16 Radiating solar fire flames */}
            <path
              d="M38 4 L42 16 L52 8 L50 20 L62 16 L56 26 L68 26 L58 34 L68 40 L56 42 L64 52 L52 48 L54 60 L44 54 L40 64 L36 54 L28 62 L28 50 L16 54 L22 44 L10 42 L20 34 L10 28 L22 26 L16 16 L28 20 L26 8 L36 16 Z"
              fill="url(#leoGrad)"
            />
            {/* Lion face central sanctuary */}
            <ellipse cx="38" cy="36" rx="14" ry="17" fill="#FFFBEB" />
            {/* Forehead markings */}
            <path d="M38 23 L38 31" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
            {/* Expressive lion eyes */}
            <path d="M31 32 C33 30 35 32 35 34 C33 34 31 34 31 32 Z" fill="#B91C1C" />
            <path d="M45 32 C43 30 41 32 41 34 C43 34 45 34 45 32 Z" fill="#B91C1C" />
            {/* Lion nose & chin */}
            <path d="M35 40 L41 40 L38 44 Z" fill="#DC2626" />
            <path d="M38 44 L38 47 M35 47 C37 49 39 49 41 47" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );

      case 'Virgo':
        // Celestial Maiden with golden cascading hair
        return (
          <g transform="translate(10, 10)">
            {/* Cascading flowing locks */}
            <path
              d="M20 28 C12 34 16 48 24 54 C16 48 18 36 28 32 C22 26 26 14 36 12 C44 10 52 16 52 24 C54 34 48 42 44 50 C48 46 54 36 56 26 C58 14 46 6 34 8 C22 10 16 20 20 28 Z"
              fill="url(#virgoGrad)"
            />
            {/* Soft face contour */}
            <path
              d="M32 20 C36 16 42 18 44 24 C46 32 44 40 40 46 C36 44 34 38 34 32 C34 26 30 22 32 20 Z"
              fill="#FEF08A"
            />
            {/* Meditative eye line */}
            <path d="M38 28 C41 28 42 30 42 30" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Soft lips line */}
            <path d="M38 38 C40 38 41 39 41 39" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'Libra':
        // Elegant balancing scales of justice
        return (
          <g transform="translate(10, 10)">
            {/* Central beam / pillar */}
            <path d="M38 8 L38 56" stroke="url(#libraGrad)" strokeWidth="4" strokeLinecap="round" />
            {/* Top apex diamond */}
            <polygon points="38,4 42,9 38,14 34,9" fill="#E11D48" />
            {/* Crossbeam balance bar */}
            <path d="M14 20 L62 20" stroke="url(#libraGrad)" strokeWidth="3.5" strokeLinecap="round" />
            {/* Left strings & pan */}
            <path d="M16 20 L8 36 M16 20 L26 36" stroke="#FDA4AF" strokeWidth="1.5" />
            <path d="M6 36 C8 46 26 46 28 36 Z" fill="url(#libraGrad)" />
            {/* Right strings & pan */}
            <path d="M60 20 L50 36 M60 20 L68 36" stroke="#FDA4AF" strokeWidth="1.5" />
            <path d="M48 36 C50 46 68 46 70 36 Z" fill="url(#libraGrad)" />
            {/* Base stand */}
            <path d="M26 56 C32 54 44 54 50 56" stroke="url(#libraGrad)" strokeWidth="5" strokeLinecap="round" />
          </g>
        );

      case 'Scorpio':
        // Stylized dynamic Scorpion with stinger
        return (
          <g transform="translate(10, 10)">
            {/* Segmented body arch */}
            <path
              d="M26 36 C24 24 36 12 48 10 C56 8 62 14 60 22 C58 28 50 32 46 26 C44 22 50 18 52 20"
              fill="none"
              stroke="url(#scorpioGrad)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Stinger barb sharp tip */}
            <path d="M52 20 L58 14 L56 22 Z" fill="#064E3B" />
            {/* Carapace main body oval */}
            <ellipse cx="32" cy="40" rx="14" ry="10" fill="url(#scorpioGrad)" />
            {/* Left large pincer claw */}
            <path
              d="M20 38 C12 34 8 24 14 18 C18 16 24 20 22 26 C20 30 16 32 20 38 Z"
              fill="url(#scorpioGrad)"
            />
            {/* Right smaller pincer */}
            <path d="M38 34 C44 32 46 26 42 22" stroke="url(#scorpioGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Small legs */}
            <path d="M24 46 C20 52 22 56 26 58" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M32 48 C30 54 34 58 38 60" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'Sagittarius':
        // Drawn celestial recurve bow & arrow
        return (
          <g transform="translate(10, 10)">
            {/* Classical decorative bow curve */}
            <path
              d="M18 56 C26 44 26 28 18 16 C34 14 54 26 62 36 C54 46 34 58 18 56 Z"
              fill="none"
              stroke="url(#sagittariusGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Central arrow shaft */}
            <path d="M12 40 L60 16" stroke="#BE185D" strokeWidth="3.5" strokeLinecap="round" />
            {/* Sharp arrow point */}
            <polygon points="64,14 54,16 58,24" fill="url(#sagittariusGrad)" />
            {/* Fletching feather tails */}
            <path d="M12 40 L8 46 M16 38 L12 44" stroke="#BE185D" strokeWidth="3" strokeLinecap="round" />
            {/* Ornamental grip */}
            <circle cx="23" cy="36" r="3.5" fill="#FCE7F3" />
          </g>
        );

      case 'Capricorn':
        // Majestic Sea-Goat with spiral horn profile
        return (
          <g transform="translate(10, 10)">
            {/* Sweeping backward ram/goat horn */}
            <path
              d="M32 26 C28 12 16 6 8 18 C14 12 24 16 26 26 C28 32 30 36 32 40"
              fill="none"
              stroke="url(#capricornGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Noble goat head profile */}
            <path
              d="M28 26 C34 22 42 24 48 30 C56 36 60 48 54 54 C48 60 40 54 36 44 C34 38 30 34 28 26 Z"
              fill="url(#capricornGrad)"
            />
            {/* Goat ear */}
            <path d="M24 28 C20 32 20 38 24 40 Z" fill="#C7D2FE" />
            {/* Eye point */}
            <circle cx="42" cy="34" r="2.2" fill="#FFFFFF" />
            {/* Stylized chin beard tress */}
            <path d="M52 50 C58 56 62 60 64 62" stroke="#4338CA" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'Aquarius':
        // Water urn jug with sweeping tidal crescent
        return (
          <g transform="translate(10, 10)">
            {/* Sweeping crescent tidal wave */}
            <path
              d="M12 40 C10 24 22 10 38 8 C54 6 66 18 64 34 C62 46 52 56 38 56 C26 56 14 50 12 40 Z"
              fill="none"
              stroke="url(#aquariusGrad)"
              strokeWidth="6.5"
            />
            {/* Central water amphora vessel jug */}
            <path
              d="M38 18 C36 16 46 16 44 18 L43 24 C48 26 52 32 50 42 C48 50 36 50 34 42 C32 32 36 26 41 24 Z"
              fill="url(#aquariusGrad)"
            />
            {/* Jug handle */}
            <path
              d="M48 26 C56 28 58 38 50 40"
              fill="none"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Flowing liquid ribbons */}
            <path d="M38 16 C34 18 30 26 32 34" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'Pisces':
        // Two gracefully swimming yin-yang koi fish
        return (
          <g transform="translate(10, 10)">
            {/* Top-left fish swimming down */}
            <path
              d="M16 28 C14 16 24 8 32 10 C38 12 40 20 36 28 C32 34 24 38 20 44 C22 36 18 34 16 28 Z"
              fill="url(#piscesGrad)"
            />
            <path d="M16 28 C12 26 8 30 10 34" stroke="url(#piscesGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="18" r="1.8" fill="#FFFFFF" />

            {/* Bottom-right fish swimming up */}
            <path
              d="M58 34 C60 46 50 54 42 52 C36 50 34 42 38 34 C42 28 50 24 54 18 C52 26 56 28 58 34 Z"
              fill="#0284C7"
            />
            <path d="M58 34 C62 36 66 32 64 28" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="46" cy="44" r="1.8" fill="#FFFFFF" />

            {/* Whisker & water swirl */}
            <path d="M30 30 C34 28 38 32 42 32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 ${className}`}
      style={{ width: size, height: size }}
      title={`${meta.name} (${meta.element})`}
    >
      {/* Background Soft Glow Aura */}
      {showHalo && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-25 -z-10"
          style={{ backgroundColor: meta.themeColor }}
        />
      )}

      {/* Embedded SVG Artwork */}
      <svg
        viewBox="0 0 92 92"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients tailored to user reference image */}
          <linearGradient id="ariesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="taurusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="60%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>

          <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="60%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>

          <linearGradient id="cancerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="50%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#86198F" />
          </linearGradient>

          <linearGradient id="leoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>

          <linearGradient id="virgoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>

          <linearGradient id="libraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="60%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#9F1239" />
          </linearGradient>

          <linearGradient id="scorpioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="60%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          <linearGradient id="sagittariusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="60%" stopColor="#DB2777" />
            <stop offset="100%" stopColor="#9D174D" />
          </linearGradient>

          <linearGradient id="capricornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>

          <linearGradient id="aquariusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          <linearGradient id="piscesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0C4A6E" />
          </linearGradient>
        </defs>

        {renderSignPath()}
      </svg>
    </div>
  );
};
