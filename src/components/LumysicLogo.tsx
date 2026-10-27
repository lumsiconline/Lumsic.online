import React from 'react';

interface LumysicLogoProps {
  size?: number; // pixel size for the icon, e.g. 84
  showText?: boolean;
  tagline?: string;
  className?: string;
  textClassName?: string;
  glow?: boolean;
}

export const LumysicLogo: React.FC<LumysicLogoProps> = ({
  size = 80,
  showText = false,
  tagline,
  className = '',
  textClassName = '',
  glow = true,
}) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Logo Emblem Container */}
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Ambient Golden Glow Halo behind the emblem */}
        {glow && (
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#F6D06E]/30 via-[#E5B744]/20 to-[#9333EA]/20 blur-xl pointer-events-none transform scale-110"
          />
        )}

        {/* Master SVG Emblem matching the uploaded celestial Aries emblem */}
        <svg
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="relative z-10 w-full h-full filter drop-shadow-[0_4px_16px_rgba(246,208,110,0.35)] transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Outer Ring Gold Gradient */}
            <linearGradient id="lumysicGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D0" />
              <stop offset="35%" stopColor="#F6D06E" />
              <stop offset="70%" stopColor="#D4A034" />
              <stop offset="100%" stopColor="#8C5E16" />
            </linearGradient>

            {/* Horns & Face Gold Metallic Gradient */}
            <linearGradient id="lumysicGoldHorns" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FFF9E0" />
              <stop offset="25%" stopColor="#FCE38A" />
              <stop offset="55%" stopColor="#F6D06E" />
              <stop offset="85%" stopColor="#C9972E" />
              <stop offset="100%" stopColor="#7A5212" />
            </linearGradient>

            {/* Horn Ridges Gradient */}
            <linearGradient id="hornRidges" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFF2BF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F6D06E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8A5E18" stopOpacity="0.8" />
            </linearGradient>

            {/* Inner Cosmic Radial Background */}
            <radialGradient id="lumysicCosmicBg" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#151D42" />
              <stop offset="45%" stopColor="#0B112C" />
              <stop offset="85%" stopColor="#050818" />
              <stop offset="100%" stopColor="#03050F" />
            </radialGradient>

            {/* Soft Central Warm Glow */}
            <radialGradient id="lumysicInnerGlow" cx="50%" cy="50%" r="40%">
              <stop offset="0%" stopColor="#F6D06E" stopOpacity="0.32" />
              <stop offset="50%" stopColor="#D4A034" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0B112C" stopOpacity="0" />
            </radialGradient>

            {/* Golden Star Sparkle Gradient */}
            <linearGradient id="lumysicStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FFF2C6" />
              <stop offset="100%" stopColor="#F6D06E" />
            </linearGradient>
          </defs>

          {/* 1. Deep Celestial Base Circle */}
          <circle cx="100" cy="100" r="94" fill="url(#lumysicCosmicBg)" />
          
          {/* Subtle Ambient Cosmic Light inside */}
          <circle cx="100" cy="100" r="82" fill="url(#lumysicInnerGlow)" />

          {/* 2. Concentric Astrological / Orbit Rings */}
          {/* Outer primary gold ring */}
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="url(#lumysicGoldBorder)"
            strokeWidth="3"
          />

          {/* Secondary thin orbit ring */}
          <circle
            cx="100"
            cy="100"
            r="87"
            fill="none"
            stroke="#F6D06E"
            strokeWidth="0.8"
            strokeOpacity="0.45"
          />

          {/* Celestial dotted astrolabe ring */}
          <circle
            cx="100"
            cy="100"
            r="79"
            fill="none"
            stroke="#F6D06E"
            strokeWidth="1.2"
            strokeDasharray="2.5 5"
            strokeOpacity="0.6"
          />

          {/* Inner orbit boundary ring */}
          <circle
            cx="100"
            cy="100"
            r="69"
            fill="none"
            stroke="#F6D06E"
            strokeWidth="0.75"
            strokeOpacity="0.3"
          />

          {/* 3. Small Orbit Planets / Celestial Nodes (Cardinal & Diagonals) */}
          <circle cx="100" cy="6" r="2.2" fill="#FFF4D0" />
          <circle cx="100" cy="194" r="2.2" fill="#FFF4D0" />
          <circle cx="6" cy="100" r="2.2" fill="#FFF4D0" />
          <circle cx="194" cy="100" r="2.2" fill="#FFF4D0" />
          <circle cx="33" cy="33" r="1.6" fill="#F6D06E" fillOpacity="0.8" />
          <circle cx="167" cy="33" r="1.6" fill="#F6D06E" fillOpacity="0.8" />
          <circle cx="33" cy="167" r="1.6" fill="#F6D06E" fillOpacity="0.8" />
          <circle cx="167" cy="167" r="1.6" fill="#F6D06E" fillOpacity="0.8" />

          {/* 4. Background Constellation Dust & Star Sparkles */}
          {/* Top-Left Star */}
          <path
            d="M52 46 L53.5 52 L59.5 53.5 L53.5 55 L52 61 L50.5 55 L44.5 53.5 L50.5 52 Z"
            fill="url(#lumysicStarGrad)"
            opacity="0.85"
          />
          {/* Top-Right Star */}
          <path
            d="M148 46 L149.5 52 L155.5 53.5 L149.5 55 L148 61 L146.5 55 L140.5 53.5 L146.5 52 Z"
            fill="url(#lumysicStarGrad)"
            opacity="0.85"
          />
          {/* Micro Stardust dots */}
          <circle cx="42" cy="78" r="1" fill="#FFF" opacity="0.6" />
          <circle cx="158" cy="78" r="1" fill="#FFF" opacity="0.6" />
          <circle cx="70" cy="40" r="1.2" fill="#FCE38A" opacity="0.7" />
          <circle cx="130" cy="40" r="1.2" fill="#FCE38A" opacity="0.7" />
          <circle cx="58" cy="142" r="1" fill="#FFF" opacity="0.5" />
          <circle cx="142" cy="142" r="1" fill="#FFF" opacity="0.5" />

          {/* 5. Central Majestic Aries Celestial Ram */}
          <g id="aries-ram-emblem">
            {/* LEFT HORN: Grand sweeping spiral curvature */}
            {/* Main Horn Outer Shell */}
            <path
              d="M94 72 
                 C82 52, 54 48, 38 66 
                 C24 82, 25 106, 42 118 
                 C56 128, 74 122, 79 108 
                 C83 97, 76 87, 65 86 
                 C56 85, 49 92, 52 101 
                 C54 107, 61 108, 64 104
                 C66 100, 62 97, 58 97
                 C52 98, 50 106, 58 111
                 C69 116, 80 104, 75 92
                 C70 80, 52 76, 42 88
                 C32 100, 35 116, 48 122
                 C64 130, 88 118, 92 90
                 C94 82, 94 76, 94 72 Z"
              fill="url(#lumysicGoldHorns)"
              stroke="#FFF4D0"
              strokeWidth="0.6"
            />

            {/* Left Horn Ridges / Sacred Geometry Accents */}
            <path
              d="M48 64 C60 58, 76 62, 88 74"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M38 76 C46 68, 64 70, 78 84"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M34 90 C38 82, 52 82, 68 94"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M36 104 C40 98, 52 98, 62 106"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* RIGHT HORN: Symmetrical grand sweeping spiral curvature */}
            {/* Main Horn Outer Shell */}
            <path
              d="M106 72 
                 C118 52, 146 48, 162 66 
                 C176 82, 175 106, 158 118 
                 C144 128, 126 122, 121 108 
                 C117 97, 124 87, 135 86 
                 C144 85, 151 92, 148 101 
                 C146 107, 139 108, 136 104
                 C134 100, 138 97, 142 97
                 C148 98, 150 106, 142 111
                 C131 116, 120 104, 125 92
                 C130 80, 148 76, 158 88
                 C168 100, 165 116, 152 122
                 C136 130, 112 118, 108 90
                 C106 82, 106 76, 106 72 Z"
              fill="url(#lumysicGoldHorns)"
              stroke="#FFF4D0"
              strokeWidth="0.6"
            />

            {/* Right Horn Ridges / Sacred Geometry Accents */}
            <path
              d="M152 64 C140 58, 124 62, 112 74"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M162 76 C154 68, 136 70, 122 84"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M166 90 C162 82, 148 82, 132 94"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M164 104 C160 98, 148 98, 138 106"
              fill="none"
              stroke="url(#hornRidges)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* RAM FACE / FOREHEAD / SNOUT (Regal & Stylized Sacred Geometry) */}
            {/* Central Forehead Crown */}
            <polygon
              points="100,68 109,84 100,94 91,84"
              fill="url(#lumysicGoldHorns)"
              stroke="#FFF4D0"
              strokeWidth="0.8"
            />

            {/* Upper Crown Third-Eye 4-Point Star Diamond */}
            <path
              d="M100 56 L102.5 64 L108 66 L102.5 68 L100 76 L97.5 68 L92 66 L97.5 64 Z"
              fill="url(#lumysicStarGrad)"
            />

            {/* Bridge of Nose / Facial Planes */}
            <polygon
              points="91,84 100,94 100,128 93,118"
              fill="url(#lumysicGoldHorns)"
              fillOpacity="0.85"
            />
            <polygon
              points="109,84 100,94 100,128 107,118"
              fill="url(#lumysicGoldHorns)"
              fillOpacity="1"
            />

            {/* Muzzle / Nose Base */}
            <polygon
              points="100,128 94,136 100,142 106,136"
              fill="url(#lumysicGoldHorns)"
              stroke="#FFF4D0"
              strokeWidth="0.8"
            />

            {/* Celestial Eyes (Left & Right mystical angled slits with gold glow) */}
            {/* Left Eye */}
            <polygon
              points="84,86 92,89 87,93 82,90"
              fill="#FFF7D6"
              stroke="#F6D06E"
              strokeWidth="0.5"
            />
            <circle cx="87" cy="89.5" r="1.2" fill="#060B1E" />

            {/* Right Eye */}
            <polygon
              points="116,86 108,89 113,93 118,90"
              fill="#FFF7D6"
              stroke="#F6D06E"
              strokeWidth="0.5"
            />
            <circle cx="113" cy="89.5" r="1.2" fill="#060B1E" />

            {/* Chin / Jaw Geometry Line */}
            <path
              d="M93 138 L100 148 L107 138"
              fill="none"
              stroke="#F6D06E"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Beneath Muzzle: Sacred Triangle & Lower Star Pendant */}
            <polygon
              points="100,148 96,155 104,155"
              fill="#F6D06E"
              fillOpacity="0.7"
            />
            <circle cx="100" cy="162" r="1.8" fill="#FFF4D0" />
            <circle cx="100" cy="169" r="1.2" fill="#F6D06E" />
          </g>
        </svg>
      </div>

      {/* Optional Brand Name & Tagline */}
      {showText && (
        <div className={`mt-3 flex flex-col items-center text-center ${textClassName}`}>
          <div className="relative">
            <span 
              className="font-serif tracking-[0.28em] font-extrabold text-2xl sm:text-3xl uppercase bg-gradient-to-r from-[#FFF5C8] via-[#F6D06E] to-[#D4A034] bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(246,208,110,0.45)]"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                letterSpacing: '0.24em'
              }}
            >
              LUMSIC
            </span>
            {/* Subtle underglow line */}
            <div className="w-16 h-0.5 mx-auto mt-1 rounded-full bg-gradient-to-r from-transparent via-[#F6D06E]/70 to-transparent" />
          </div>

          {tagline && (
            <p className="mt-1 text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium text-[#FCE38A]/80">
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
