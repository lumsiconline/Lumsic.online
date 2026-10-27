import React, { useState } from 'react';
import { Heart, Sparkles, MessageSquare, ChevronDown, Flame, Waves, Wind, Mountain, ArrowRight } from 'lucide-react';
import { ZodiacSignArt, ZODIAC_SIGNS_DATA, ZodiacSignName } from './ZodiacSignArt';

interface CompatibilitySectionProps {
  onChatWithLovePsychics?: (preferredTopic?: string) => void;
}

export const CompatibilitySection: React.FC<CompatibilitySectionProps> = ({
  onChatWithLovePsychics
}) => {
  const [signA, setSignA] = useState<ZodiacSignName>('Leo');
  const [signB, setSignB] = useState<ZodiacSignName>('Sagittarius');

  const objA = ZODIAC_SIGNS_DATA.find(s => s.name === signA) || ZODIAC_SIGNS_DATA[4];
  const objB = ZODIAC_SIGNS_DATA.find(s => s.name === signB) || ZODIAC_SIGNS_DATA[8];

  // Element Icons
  const getElementIcon = (elem: string) => {
    switch (elem) {
      case 'Fire': return <Flame className="w-3.5 h-3.5 text-rose-500" />;
      case 'Water': return <Waves className="w-3.5 h-3.5 text-sky-500" />;
      case 'Air': return <Wind className="w-3.5 h-3.5 text-amber-500" />;
      case 'Earth': return <Mountain className="w-3.5 h-3.5 text-emerald-600" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  // Dynamic elemental synergy calculations
  const calculateSynergy = () => {
    const isSame = signA === signB;
    const sameElement = objA.element === objB.element;
    const fireAir = (objA.element === 'Fire' && objB.element === 'Air') || (objA.element === 'Air' && objB.element === 'Fire');
    const earthWater = (objA.element === 'Earth' && objB.element === 'Water') || (objA.element === 'Water' && objB.element === 'Earth');
    const fireWater = (objA.element === 'Fire' && objB.element === 'Water') || (objA.element === 'Water' && objB.element === 'Fire');
    const fireEarth = (objA.element === 'Fire' && objB.element === 'Earth') || (objA.element === 'Earth' && objB.element === 'Fire');
    const airEarth = (objA.element === 'Air' && objB.element === 'Earth') || (objA.element === 'Earth' && objB.element === 'Air');
    const airWater = (objA.element === 'Air' && objB.element === 'Water') || (objA.element === 'Water' && objB.element === 'Air');

    let overall = 68;
    let chemistry = 66;
    let comm = 65;
    let emotional = 62;
    let style = 'Dynamic Contrast & Individual Growth';

    if (isSame) {
      overall = 90;
      chemistry = 88;
      comm = 92;
      emotional = 89;
      style = 'Deep Mirror Resonance & Intuitive Bond';
    } else if (sameElement) {
      overall = 94;
      chemistry = 95;
      comm = 91;
      emotional = 90;
      style = 'Natural Elemental Harmony & Shared Passion';
    } else if (fireAir) {
      overall = 91;
      chemistry = 92;
      comm = 94;
      emotional = 86;
      style = 'Mutual Inspiration, Electric Spark & Endless Curiosity';
    } else if (earthWater) {
      overall = 89;
      chemistry = 88;
      comm = 86;
      emotional = 93;
      style = 'Nurturing Devotion, Lasting Security & Emotional Grounding';
    } else if (fireWater) {
      // Steam tension: volatile passion, emotional turbulence, friction
      overall = 62;
      chemistry = 68;
      comm = 58;
      emotional = 55;
      style = 'Steam Dynamic — Passionate Intensity Needing Conscious Balancing';
    } else if (fireEarth) {
      // Molten/Scorched earth: pacing conflict, spontaneous vs structured
      overall = 65;
      chemistry = 64;
      comm = 61;
      emotional = 59;
      style = 'Fire & Earth Friction — Visionary Drive Meets Pragmatic Caution';
    } else if (airEarth) {
      // Dust storm: abstract thought vs physical reality
      overall = 64;
      chemistry = 60;
      comm = 68;
      emotional = 56;
      style = 'Air & Earth Dilemma — High Concepts Meet Material Realism';
    } else if (airWater) {
      // Waves & Wind: intellectual logic vs emotional currents
      overall = 66;
      chemistry = 67;
      comm = 63;
      emotional = 58;
      style = 'Mist Dynamics — Emotional Waves Meet Intellectual Breezes';
    }

    return { overall, chemistry, comm, emotional, style };
  };

  const scores = calculateSynergy();

  const handleConsultPsychic = () => {
    if (onChatWithLovePsychics) {
      onChatWithLovePsychics(`Love Compatibility reading for ${signA} & ${signB}`);
    } else {
      const el = document.getElementById('readers');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="compatibility" className="py-12 sm:py-16 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EB] to-[#FFF8DF] border-b border-[#EAD8A4]/80 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Prominent, Highlighted Heading in a Single Line */}
        <div className="flex flex-col items-center text-center space-y-2 pb-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-rose-100 border border-rose-200/90 shadow-2xs">
            <span className="text-base select-none">💖</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#881337] font-sans">
              ZODIAC SYNERGY &amp; SOULMATE CALCULATOR
            </span>
            <span className="text-base select-none">✨</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-[#2B2418] font-serif tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            Love &amp; Zodiac Compatibility
          </h2>

          <p className="text-xs sm:text-sm text-[#78350F] font-medium max-w-2xl mx-auto leading-relaxed">
            Explore elemental chemistry, celestial resonance and romantic alignment between zodiac signs
          </p>
        </div>

        {/* COMPACT & STYLISH LOVE MATCH CARD */}
        <div className="bg-[#FFFDF9] border border-[#EAD8A4] rounded-3xl p-4 sm:p-7 shadow-md shadow-amber-950/5 relative overflow-hidden">
          
          {/* Subtle Celestial Warm Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-200/20 via-amber-200/20 to-transparent rounded-full blur-2xl pointer-events-none -z-0" />

          {/* 1. DUAL REAL ZODIAC ART SIGN SELECTOR */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 items-center relative z-10 pb-6 border-b border-[#EAD8A4]/70">
            
            {/* SIGN A: YOUR SIGN */}
            <div className="md:col-span-5 bg-[#FAF6EB] hover:bg-[#F7F2E2] transition-colors border border-[#EAD8A4] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs">
              {/* Real Zodiac Artwork */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#EAD8A4] p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                <ZodiacSignArt sign={objA.name} size={48} showHalo={false} />
              </div>

              {/* Selector details */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-[#8C6D23] uppercase tracking-wider block">
                  Your Sign
                </span>
                <div className="relative mt-0.5">
                  <select
                    value={signA}
                    onChange={(e) => setSignA(e.target.value as ZodiacSignName)}
                    className="w-full appearance-none bg-white border border-[#EAD8A4] rounded-xl px-3 py-1.5 pr-8 text-sm font-bold text-[#2B2418] font-serif focus:outline-none focus:border-[#D6A83F] shadow-2xs cursor-pointer truncate"
                  >
                    {ZODIAC_SIGNS_DATA.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.element})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8C6D23] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#6F6654] font-medium">
                  {getElementIcon(objA.element)}
                  <span>{objA.element} Element · {objA.dates}</span>
                </div>
              </div>
            </div>

            {/* HEART CONNECTOR BADGE */}
            <div className="md:col-span-1 flex items-center justify-center py-1 md:py-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-sm shadow-rose-900/10 flex items-center justify-center animate-pulse">
                <div className="w-full h-full rounded-full bg-[#FFFDF9] flex items-center justify-center text-sm">
                  ❤️
                </div>
              </div>
            </div>

            {/* SIGN B: PARTNER'S SIGN */}
            <div className="md:col-span-5 bg-[#FAF6EB] hover:bg-[#F7F2E2] transition-colors border border-[#EAD8A4] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs">
              {/* Real Zodiac Artwork */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#EAD8A4] p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                <ZodiacSignArt sign={objB.name} size={48} showHalo={false} />
              </div>

              {/* Selector details */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-[#8C6D23] uppercase tracking-wider block">
                  Partner / Companion
                </span>
                <div className="relative mt-0.5">
                  <select
                    value={signB}
                    onChange={(e) => setSignB(e.target.value as ZodiacSignName)}
                    className="w-full appearance-none bg-white border border-[#EAD8A4] rounded-xl px-3 py-1.5 pr-8 text-sm font-bold text-[#2B2418] font-serif focus:outline-none focus:border-[#D6A83F] shadow-2xs cursor-pointer truncate"
                  >
                    {ZODIAC_SIGNS_DATA.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.element})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8C6D23] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#6F6654] font-medium">
                  {getElementIcon(objB.element)}
                  <span>{objB.element} Element · {objB.dates}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 2. COMPACT SYNERGY BREAKDOWN */}
          <div className="pt-5 space-y-4 relative z-10">
            
            {/* Resonance Pill & Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6EB] p-3.5 sm:p-4 rounded-2xl border border-[#EAD8A4]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base sm:text-lg font-black text-[#2B2418] font-serif">
                    {objA.name} &amp; {objB.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                    {objA.element} + {objB.element}
                  </span>
                </div>
                <p className="text-xs text-[#6F6654] mt-0.5 font-medium">
                  Relationship Style: <span className="text-[#2B2418] font-semibold">{scores.style}</span>
                </p>
              </div>

              {/* Glowing Overall Score */}
              <div className="flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-xl bg-white border border-[#EAD8A4] shadow-xs shrink-0">
                <span className="text-2xl sm:text-3xl font-black text-[#B45309] font-serif leading-none">
                  {scores.overall}%
                </span>
                <span className="text-[10px] text-[#8C6D23] font-black uppercase tracking-wider">
                  Resonance
                </span>
              </div>
            </div>

            {/* 3 Compact Metric Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAD8A4]/80">
                <div className="flex justify-between items-center text-[11px] text-[#6F6654] mb-1.5 font-semibold">
                  <span>Romantic Chemistry</span>
                  <span className="font-bold text-[#B45309]">{scores.chemistry}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EAD8A4]/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${scores.chemistry}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAD8A4]/80">
                <div className="flex justify-between items-center text-[11px] text-[#6F6654] mb-1.5 font-semibold">
                  <span>Communication Flow</span>
                  <span className="font-bold text-[#0284C7]">{scores.comm}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EAD8A4]/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${scores.comm}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAD8A4]/80">
                <div className="flex justify-between items-center text-[11px] text-[#6F6654] mb-1.5 font-semibold">
                  <span>Emotional Depth</span>
                  <span className="font-bold text-[#D97706]">{scores.emotional}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EAD8A4]/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                    style={{ width: `${scores.emotional}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Key Dynamic Strengths & Advice in 2 compact columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#EAD8A4]/80">
                <div className="flex items-center gap-1.5 font-bold text-[#B45309] mb-1">
                  <span>💖</span>
                  <span>Core Astrological Strength</span>
                </div>
                <p className="text-[#6F6654] leading-relaxed text-[11.5px]">
                  {objA.element === objB.element
                    ? `Sharing the same ${objA.element} element creates instinctive mutual understanding, effortless pacing, and natural emotional warmth.`
                    : `${objA.name} and ${objB.name} complement each other's elemental poles, generating deep curiosity, magnetic attraction, and growth.`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#EAD8A4]/80">
                <div className="flex items-center gap-1.5 font-bold text-[#8C6D23] mb-1">
                  <span>✨</span>
                  <span>Harmonizing Guidance</span>
                </div>
                <p className="text-[#6F6654] leading-relaxed text-[11.5px]">
                  Honor personal boundaries while maintaining honest communication. Align on long-term values to cultivate enduring intimacy and devotion.
                </p>
              </div>
            </div>

            {/* HIGHLIGHTED NOTICE WHEN SCORE IS LESS THAN 70% */}
            {scores.overall < 70 && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-pink-50 border-2 border-rose-300 shadow-md shadow-rose-950/5 flex items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs sm:text-sm font-black text-[#9F1239] leading-snug tracking-tight">
                  Don't Worry Connect with expert psychics with 10+ years of experience and make 100% of your love life. ❤️
                </p>
              </div>
            )}

            {/* 3. FINAL ACTION BUTTON: CHAT WITH LOVE PSYCHICS (As explicitly requested) */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleConsultPsychic}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 active:scale-95 text-gray-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-amber-500/25 border border-amber-300 transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer group"
              >
                <MessageSquare className="w-4 h-4 fill-gray-950 group-hover:scale-110 transition-transform" />
                <span>Chat with Love Psychics</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="text-[11px] text-[#78350F] font-semibold mt-2">
                Get custom twin-flame &amp; relationship timeline readings from top verified psychics
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
