import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Compass, Sun } from 'lucide-react';
import { ZodiacSignOrb } from './ZodiacSignOrb';
import { DailyHoroscopeModal } from './DailyHoroscopeModal';

interface ZodiacSign {
  id: string;
  name: string;
  glyph: string;
  dates: string;
  element: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'aries', name: 'Aries', glyph: '♈', dates: 'Mar 21 – Apr 19', element: 'Fire' },
  { id: 'taurus', name: 'Taurus', glyph: '♉', dates: 'Apr 20 – May 20', element: 'Earth' },
  { id: 'gemini', name: 'Gemini', glyph: '♊', dates: 'May 21 – Jun 20', element: 'Air' },
  { id: 'cancer', name: 'Cancer', glyph: '♋', dates: 'Jun 21 – Jul 22', element: 'Water' },
  { id: 'leo', name: 'Leo', glyph: '♌', dates: 'Jul 23 – Aug 22', element: 'Fire' },
  { id: 'virgo', name: 'Virgo', glyph: '♍', dates: 'Aug 23 – Sep 22', element: 'Earth' },
  { id: 'libra', name: 'Libra', glyph: '♎', dates: 'Sep 23 – Oct 22', element: 'Air' },
  { id: 'scorpio', name: 'Scorpio', glyph: '♏', dates: 'Oct 23 – Nov 21', element: 'Water' },
  { id: 'sagittarius', name: 'Sagittarius', glyph: '♐', dates: 'Nov 22 – Dec 21', element: 'Fire' },
  { id: 'capricorn', name: 'Capricorn', glyph: '♑', dates: 'Dec 22 – Jan 19', element: 'Earth' },
  { id: 'aquarius', name: 'Aquarius', glyph: '♒', dates: 'Jan 20 – Feb 18', element: 'Air' },
  { id: 'pisces', name: 'Pisces', glyph: '♓', dates: 'Feb 19 – Mar 20', element: 'Water' },
];

export const CelestialZodiacWheel: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [pulseTime, setPulseTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSign, setActiveSign] = useState<ZodiacSign | null>(null);
  const [isHoroscopeOpen, setIsHoroscopeOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ angle: number; initialRotation: number }>({ angle: 0, initialRotation: 0 });
  const lastTimeRef = useRef<number | null>(null);

  // Solar System Continuous Rotation & Dynamic Planetary Scale Pulse Loop
  useEffect(() => {
    let animId: number;
    const animate = (time: number) => {
      if (lastTimeRef.current !== null && !isDragging) {
        const delta = (time - lastTimeRef.current) / 1000;
        // Smooth planetary orbital revolution
        setRotation((prev) => (prev + delta * 6.5) % 360);
      }
      // Running cosmic clock for size pulsation ("chote bde kabhi bde kabhi chote")
      setPulseTime(time / 1000);
      lastTimeRef.current = time;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isDragging]);

  // Calculate angle from center of wheel to client cursor position
  const getAngle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    return rad * (180 / Math.PI);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    const angle = getAngle(e.clientX, e.clientY);
    dragStartRef.current = { angle, initialRotation: rotation };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentAngle = getAngle(e.clientX, e.clientY);
    const delta = currentAngle - dragStartRef.current.angle;
    setRotation((dragStartRef.current.initialRotation + delta) % 360);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative select-none">
      {/* Outer Glow container */}
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full aspect-square max-w-[490px] sm:max-w-[550px] md:max-w-[590px] lg:max-w-[620px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing touch-none transition-shadow ${
          isDragging ? 'shadow-2xl shadow-[#d4af37]/25' : ''
        }`}
        title="Solar Zodiac Orrery: Signs revolve like planets in orbit. Click & drag to rotate!"
      >
        {/* Rotating Celestial Dial SVG - Sacred Geometry & Orbital Rails */}
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full text-[#d4af37] will-change-transform drop-shadow-[0_0_18px_rgba(212,175,55,0.25)] pointer-events-none"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <defs>
            <radialGradient id="celestialRingGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#150b24" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#1e0f38" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.12" />
            </radialGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background circular track */}
          <circle cx="160" cy="160" r="148" fill="url(#celestialRingGrad)" />

          {/* Outer astronomical circles */}
          <circle cx="160" cy="160" r="150" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.6" />
          <circle cx="160" cy="160" r="142" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.7" />
          <circle cx="160" cy="160" r="118" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.85" />
          <circle cx="160" cy="160" r="92" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.75" />

          {/* 360 degree tick marks (72 small ticks, every 5 degrees) */}
          {Array.from({ length: 72 }).map((_, i) => (
            <line
              key={`tick-${i}`}
              x1="160"
              y1={i % 6 === 0 ? "142" : "145"}
              x2="160"
              y2="150"
              stroke="currentColor"
              strokeWidth={i % 6 === 0 ? "1.2" : "0.5"}
              strokeOpacity={i % 6 === 0 ? "0.85" : "0.35"}
              transform={`rotate(${i * 5} 160 160)`}
            />
          ))}

          {/* 12 House Radial Rays */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`ray-${i}`}
              x1="160"
              y1="92"
              x2="160"
              y2="142"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeOpacity="0.65"
              transform={`rotate(${i * 30 + 15} 160 160)`}
            />
          ))}

          {/* Sacred geometry aspect polygons */}
          <polygon
            points="160,20 274,86 274,216 160,282 46,216 46,86"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.25"
          />
          <polygon
            points="160,282 274,216 274,86 160,20 46,86 46,216"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.18"
            transform="rotate(30 160 160)"
          />

          {/* Concentric planetary rings inside */}
          <circle cx="160" cy="160" r="58" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2 3" />
          <circle cx="160" cy="160" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
        </svg>

        {/* 12 COLORFUL ZODIAC SIGNS ROTATING LIKE PLANETS IN A SOLAR SYSTEM */}
        {/* Pulsing size: "chote bde kabhi bde kabhi chote ese hote rhne chye" */}
        <div className="absolute inset-0 pointer-events-none">
          {ZODIAC_SIGNS.map((item, idx) => {
            // Angle of this sign in current rotation
            const angleDeg = idx * 30 + rotation;
            const angleRad = (angleDeg - 90) * (Math.PI / 180);
            
            // Orbital track radius (approx 34% from center)
            const radiusPercent = 34.2;
            const leftPercent = 50 + radiusPercent * Math.cos(angleRad);
            const topPercent = 50 + radiusPercent * Math.sin(angleRad);

            // Dynamic cosmic breathing wave offset per planet
            // Causes each planet to smoothly grow larger and shrink smaller at its own cosmic rhythm
            const harmonicOffset = idx * 0.52;
            const dynamicScale = 0.88 + 0.32 * Math.sin(pulseTime * 2.2 + harmonicOffset);
            
            const isHovered = activeSign?.id === item.id;
            const finalScale = isHovered ? 1.42 : dynamicScale;

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: `translate(-50%, -50%) scale(${finalScale})`,
                  zIndex: isHovered ? 35 : Math.round(finalScale * 10),
                  transition: isDragging ? 'none' : 'transform 0.12s ease-out',
                }}
                className="pointer-events-auto cursor-pointer select-none transition-transform"
                onMouseEnter={() => setActiveSign(item)}
                onMouseLeave={() => setActiveSign(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSign(item);
                  setIsHoroscopeOpen(true);
                }}
                title={`Click to read ${item.name} Daily Horoscope (${item.dates})`}
              >
                <ZodiacSignOrb
                  signId={item.id}
                  size="clamp(32px, 4.2vw, 44px)"
                  glow={isHovered || finalScale > 1.12}
                />
              </div>
            );
          })}
        </div>

        {/* CENTER GLOWING SUN / CELESTIAL CORE */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center z-10">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Solar Glow Aura */}
            <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#d4af37]/35 via-amber-500/25 to-purple-600/35 blur-xl animate-pulse" />

            {/* Central Sun Emblem */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#2a134a] via-[#1a0930] to-[#0c0417] border-2 border-[#d4af37] flex items-center justify-center shadow-2xl shadow-[#d4af37]/40 backdrop-blur-md">
              <Sun 
                className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37] animate-spin" 
                style={{ animationDuration: '30s' }} 
              />
            </div>
          </div>

          {/* Active Hover / Click Sign Indicator - Clickable to open reading */}
          {activeSign ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsHoroscopeOpen(true);
              }}
              className="absolute -bottom-8 px-4 py-1.5 rounded-full bg-[#1b0a33]/95 border border-[#d4af37] text-xs sm:text-sm font-semibold text-[#f5e7a9] shadow-xl animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2 pointer-events-auto cursor-pointer hover:bg-[#2c1352] transition-colors"
              title="Click to view daily horoscope"
            >
              <ZodiacSignOrb signId={activeSign.id} size={24} glow={true} />
              <span className="font-serif text-[#faf7f2] font-bold">{activeSign.name}</span>
              <span className="text-[#d4af37] text-xs font-mono">({activeSign.dates})</span>
            </button>
          ) : (
            <div className="absolute -bottom-8 px-3.5 py-1 rounded-full bg-[#120822]/90 border border-[#2c184d] text-[11px] text-[#bda5db] flex items-center gap-1.5 shadow-md">
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Tap any sign to view horoscope</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Horoscope Modal (Opens directly on tap) */}
      <DailyHoroscopeModal
        isOpen={isHoroscopeOpen}
        onClose={() => setIsHoroscopeOpen(false)}
        initialSignId={activeSign?.id || 'virgo'}
      />
    </div>
  );
};
