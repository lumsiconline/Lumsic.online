import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageSquare, Star, Sparkles } from 'lucide-react';
import { MysticFannedCardsHero } from './MysticFannedCardsHero';

interface HeroProps {
  onCreateBirthChart?: () => void;
  onFindAstrologer?: () => void;
  onOpenCompatibility?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onCreateBirthChart,
  onFindAstrologer,
  onOpenCompatibility
}) => {
  // Live "Online Now" counter: updates every 2 to 3 seconds, strictly between 456 and 734
  const [onlineCount, setOnlineCount] = useState<number>(() => {
    return Math.floor(Math.random() * (734 - 456 + 1)) + 456;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4; // changes by -4 to +4
        let next = prev + delta;
        if (next < 456) next = 456 + Math.floor(Math.random() * 10);
        if (next > 734) next = 734 - Math.floor(Math.random() * 10);
        return next;
      });
    }, 2500); // Every 2.5 seconds (in the requested 2 to 3 second window)

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative pt-5 pb-7 sm:pt-9 sm:pb-12 bg-gradient-to-b from-[#060A1C] via-[#09112E] to-[#060918] border-b border-indigo-950/60 overflow-hidden text-white">
      
      {/* Subtle Cosmic Starlight & Nebula Glow in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-amber-400/15 blur-[140px]" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-indigo-600/15 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid: Left Typography & Right 3D Fanned Cards + Orb Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Online Pill & Reviews in Upper Side, Headline, Subtitle, CTA Button */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            
            {/* 1. UPPER ROW: Online Status Pill + Customer Reviews Rating Badge */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Online Pill */}
              <div className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] px-3.5 py-1.5 rounded-full border border-emerald-400/30 shadow-lg backdrop-blur-md transition-all">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500" />
                </span>
                <span className="font-semibold text-white tracking-wide text-xs sm:text-sm">
                  <b className="font-mono text-emerald-400 font-bold text-xs sm:text-sm">{onlineCount}</b> online now
                </span>
                <span className="text-emerald-400/60 font-mono text-xs hidden sm:inline">• Live</span>
              </div>

              {/* Reviews Badge - Fixed in Upper Side */}
              <div className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] px-3.5 py-1.5 rounded-full border border-amber-400/35 shadow-lg backdrop-blur-md transition-all">
                <div className="flex text-amber-400">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                </div>
                <span className="font-bold text-white text-xs sm:text-sm">4.9/5</span>
                <span className="text-[#F6D06E] font-medium text-[11px] sm:text-xs">(2,896+ reviews)</span>
              </div>
            </div>

            {/* 2. Elegant Headline with matching font-serif italic style in white and gold */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.14] sm:leading-[1.08] font-serif italic">
              <span className="text-white drop-shadow-sm">
                Clarity for your
              </span>{' '}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D06E] via-[#FCE38A] to-[#E5B744] drop-shadow-sm">
                love, career &amp; life.
              </span>
            </h1>

            {/* 3. Subtitle matching screenshot phrasing */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
              Talk to trusted psychics and tarot readers 24/7 by chat — and take your next step with confidence.
            </p>

            {/* 4. Action Button: Start Free Chat with Psychics (Yellow/Gold style as earlier) */}
            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onFindAstrologer}
                className="w-full sm:w-auto px-7 py-3.5 sm:px-9 sm:py-4 rounded-full bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 text-gray-950 font-black text-sm sm:text-base leading-none shadow-xl shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border border-amber-300"
              >
                <MessageSquare className="w-5 h-5 fill-gray-950 shrink-0" />
                <span className="leading-tight">Start Free Chat with Psychics</span>
              </button>
            </div>

          </div>

          {/* Right Column: 3D Fanned Cards & Radiant Celestial Orb (Hidden on mobile, visible on tablet and desktop) */}
          <div className="hidden md:flex lg:col-span-5 items-center justify-center relative mt-8 lg:mt-0">
            <MysticFannedCardsHero
              onOpenBirthChart={onCreateBirthChart}
              onOpenTarot={onCreateBirthChart}
              onOpenCompatibility={onOpenCompatibility}
            />
          </div>

        </div>

      </div>
    </section>
  );
};
