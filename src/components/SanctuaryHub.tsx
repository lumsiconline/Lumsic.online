import React, { useState } from 'react';
import { Compass, Flame, Users, Sparkles, ArrowRight, Heart, Shield, Star } from 'lucide-react';
import { DailyTarotModal } from './DailyTarotModal';
import { DailyHoroscopeModal } from './DailyHoroscopeModal';
import { SacredRitualsModal } from './SacredRitualsModal';
import { ZodiacSignOrb } from './ZodiacSignOrb';

interface SanctuaryHubProps {
  onNavigateSection: (sectionId: string) => void;
  onStartReading: () => void;
  onOpenExplorer?: (categoryId?: string) => void;
}

export const SanctuaryHub: React.FC<SanctuaryHubProps> = ({
  onNavigateSection,
  onStartReading,
  onOpenExplorer
}) => {
  // Modal states - everything opens directly on tap without scrolling down
  const [isTarotOpen, setIsTarotOpen] = useState(false);
  const [isHoroscopeOpen, setIsHoroscopeOpen] = useState(false);
  const [selectedHoroscopeSign, setSelectedHoroscopeSign] = useState<string>('virgo');
  const [isRitualsOpen, setIsRitualsOpen] = useState(false);

  const handleOpenHoroscope = (signId?: string) => {
    if (signId) setSelectedHoroscopeSign(signId);
    setIsHoroscopeOpen(true);
  };

  return (
    <section aria-label="Sanctuary Feature Hub" className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-[#120722] via-[#0e051a] to-[#0b0514] border-b border-[#2c184d] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#d4af37] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Sanctuary Daily Highlights</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-[#faf7f2]">
              Explore Daily Cosmic Services
            </h2>
          </div>

          {/* Quick-Action Pills: Opens Modals Directly Without Scrolling */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {onOpenExplorer && (
              <button
                onClick={() => onOpenExplorer('astrology')}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-[#0b0514] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Global Structure (18 Pillars)</span>
              </button>
            )}

            <button
              onClick={() => handleOpenHoroscope('virgo')}
              className="px-3.5 py-1.5 rounded-full bg-[#1b0a33] border border-[#d4af37]/40 text-xs font-medium text-[#f5e7a9] hover:bg-[#2c1352] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Daily Horoscope</span>
            </button>

            <button
              onClick={() => setIsRitualsOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#1b0a33] border border-pink-500/40 text-xs font-medium text-pink-300 hover:bg-[#2c1352] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-pink-400" />
              <span>Love Spells &amp; Rituals</span>
            </button>

            <button
              onClick={onStartReading}
              className="px-3.5 py-1.5 rounded-full bg-[#1b0a33] border border-emerald-500/40 text-xs font-medium text-emerald-300 hover:bg-[#2c1352] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>20 Live Readers</span>
            </button>

            <button
              onClick={() => setIsTarotOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37]/20 to-[#f5e7a9]/20 border border-[#d4af37] text-xs font-semibold text-[#faf7f2] hover:bg-[#d4af37]/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Free Daily Tarot</span>
            </button>
          </div>
        </div>

        {/* 4 Feature Portal Cards - All open directly on tap without page scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* 1. Daily Horoscope Card - Opens DailyHoroscopeModal directly */}
          <div 
            onClick={() => handleOpenHoroscope()}
            className="group relative p-5 rounded-3xl bg-gradient-to-b from-[#1b0a33] to-[#140626] border border-[#2c184d] hover:border-[#d4af37]/60 shadow-xl shadow-black/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/30">
                  Updated Daily
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-[#faf7f2] group-hover:text-[#f5e7a9] transition-colors">
                Daily Horoscope
              </h3>
              <p className="text-xs text-[#bda5db] mt-1.5 leading-relaxed font-light">
                Today's celestial planetary transits, natal alignment, and vital percentage scores for Love, Career, and Health.
              </p>

              {/* 12 Signs Preview Strip - Clicking any sign opens that sign directly */}
              <div className="flex items-center gap-1.5 mt-3 pt-2 overflow-x-auto no-scrollbar">
                {['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenHoroscope(s);
                    }}
                    className="hover:scale-110 transition-transform cursor-pointer"
                    title={`Read ${s} horoscope`}
                  >
                    <ZodiacSignOrb signId={s} size={22} />
                  </button>
                ))}
                <span className="text-[10px] text-[#d4af37] font-mono ml-1 font-semibold">+4</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#2c184d]/60 flex items-center justify-between text-xs font-semibold text-[#d4af37]">
              <span>Read Your Transit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Sacred Love Spells & Rituals Card - Opens SacredRitualsModal directly */}
          <div 
            onClick={() => setIsRitualsOpen(true)}
            className="group relative p-5 rounded-3xl bg-gradient-to-b from-[#1e0a30] to-[#150624] border border-[#2c184d] hover:border-pink-400/60 shadow-xl shadow-black/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-900/60 text-pink-200 border border-pink-500/30">
                  From £35 · Sale
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-[#faf7f2] group-hover:text-pink-200 transition-colors">
                Sacred Rituals &amp; Spells
              </h3>
              <p className="text-xs text-[#bda5db] mt-1.5 leading-relaxed font-light">
                Reconciliation spells, love binding, evil eye removal, and remote 7-chakra reiki healing with altar photo proof.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#2c184d]/60 flex items-center justify-between text-xs font-semibold text-pink-300">
              <span>View Sacred Spells</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. 20 Live Readers Card - Opens Consultation Intake directly */}
          <div 
            onClick={onStartReading}
            className="group relative p-5 rounded-3xl bg-gradient-to-b from-[#150e2e] to-[#0f0922] border border-[#2c184d] hover:border-emerald-400/60 shadow-xl shadow-black/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>20 Online Now</span>
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-[#faf7f2] group-hover:text-emerald-200 transition-colors">
                Live Specialist Readers
              </h3>
              <p className="text-xs text-[#bda5db] mt-1.5 leading-relaxed font-light">
                Private, confidential 1-on-1 consultations with verified Tarot readers, clairvoyants, and intuitive spiritual guides.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#2c184d]/60 flex items-center justify-between text-xs font-semibold text-emerald-300">
              <span>Chat Live (First Chat Free)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Daily Tarot Card of the Day - Opens DailyTarotModal directly */}
          <div 
            onClick={() => setIsTarotOpen(true)}
            className="group relative p-5 rounded-3xl bg-gradient-to-b from-[#21123a] via-[#1a0c2e] to-[#120722] border border-[#d4af37]/45 hover:border-[#d4af37] shadow-xl shadow-[#d4af37]/15 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#f5e7a9] group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f5e7a9] border border-[#d4af37]/40">
                  Instant Draw
                </span>
              </div>
              <h3 className="font-serif text-xl font-medium text-[#faf7f2] group-hover:text-[#f5e7a9] transition-colors">
                Daily Tarot Pull
              </h3>
              <p className="text-xs text-[#bda5db] mt-1.5 leading-relaxed font-light">
                Draw your personal consecrated card of the day for instant divine direction, clarity, and spiritual reflection.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#d4af37]/30 flex items-center justify-between text-xs font-bold text-[#faf7f2]">
              <span className="text-[#f5e7a9]">Draw Your Card Now</span>
              <ArrowRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </div>

      {/* 1. Daily Horoscope Transit Modal (Opens Directly on Screen) */}
      <DailyHoroscopeModal
        isOpen={isHoroscopeOpen}
        onClose={() => setIsHoroscopeOpen(false)}
        initialSignId={selectedHoroscopeSign}
        onStartReading={onStartReading}
      />

      {/* 2. Sacred Rituals & Spells Modal (Opens Directly on Screen) */}
      <SacredRitualsModal
        isOpen={isRitualsOpen}
        onClose={() => setIsRitualsOpen(false)}
      />

      {/* 3. Daily Tarot Draw Modal (Opens Directly on Screen) */}
      <DailyTarotModal
        isOpen={isTarotOpen}
        onClose={() => setIsTarotOpen(false)}
      />
    </section>
  );
};
