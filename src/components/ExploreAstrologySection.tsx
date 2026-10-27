import React, { useState } from 'react';
import { Compass, Globe, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

interface ExploreAstrologyProps {
  onOpenBirthChart: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const ExploreAstrologySection: React.FC<ExploreAstrologyProps> = ({
  onOpenBirthChart,
  onNavigateSection
}) => {
  return (
    <section id="astrology" className="py-20 bg-[#0D1026] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Specification 16) */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#7C5CFF] block mb-2">
            Ancient & Modern Ephemeris
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Explore Cosmic Traditions
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            LUMSIC brings together the two primary celestial systems of the world, clearly identified and calculated with astronomical precision.
          </p>
        </div>

        {/* Two Premium Side-by-Side Cards (Specification 16) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: Western Traditions (Tropical Zodiac) */}
          <div className="cosmic-card p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7C5CFF] bg-[#7C5CFF]/10 px-2.5 py-1 rounded-full">
                  Tropical Zodiac System
                </span>
                <span className="text-xs text-[#A8ADC2]">Solar Solstice/Equinox Based</span>
              </div>

              <h3 className="text-2xl font-bold text-white">Western Traditions</h3>
              
              <p className="text-sm text-[#A8ADC2] leading-relaxed">
                Founded on the cardinal relationship between Earth's axial tilt and seasonal solar cycles. Western traditions emphasize psychological archetypes, individuality, and conscious evolution through natal houses and dynamic aspects.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                {[
                  { name: '12 Zodiac Archetypes', desc: 'Aries through Pisces' },
                  { name: '10 Planetary Bodies', desc: 'Inner & Transpersonal' },
                  { name: '12 Natal Houses', desc: 'Placidus & Whole Sign' },
                  { name: 'Planetary Aspects', desc: 'Trines, Squares, Sextiles' },
                  { name: 'Real-Time Transits', desc: 'Current sky alignments' },
                  { name: 'Planetary Retrogrades', desc: 'Reflective cycles' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#070A18] border border-[#252A42]/60">
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[10px] text-[#A8ADC2]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBirthChart}
              className="w-full py-3 rounded-xl bg-[#1A2038] hover:bg-[#7C5CFF] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Calculate Western Natal Wheel</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Vedic Traditions (Sidereal Zodiac) */}
          <div className="cosmic-card p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E7C878] bg-[#E7C878]/10 px-2.5 py-1 rounded-full">
                  Sidereal (Nirayana) System
                </span>
                <span className="text-xs text-[#A8ADC2]">Observable Constellation Based</span>
              </div>

              <h3 className="text-2xl font-bold text-white">Vedic Traditions (Jyotish)</h3>
              
              <p className="text-sm text-[#A8ADC2] leading-relaxed">
                Anchored in the observable fixed constellations using the Lahiri Ayanamsha correction. Vedic traditions explore karmic timing (Dashas), lunar mansions (Nakshatras), and evolutionary soul journey (Kundli).
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                {[
                  { name: 'Janam Kundli', desc: '12 Bhava Vedic Chart' },
                  { name: '27 Lunar Nakshatras', desc: 'Moon mansions & deities' },
                  { name: 'Rashi & Lagna', desc: 'Moon sign & Rising sign' },
                  { name: 'Vimshottari Dasha', desc: '120-year planetary timing' },
                  { name: 'Sade Sati Calculations', desc: '7.5 year Saturn transit' },
                  { name: 'Manglik Analysis', desc: 'Mars placement & remedies' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#070A18] border border-[#252A42]/60">
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[10px] text-[#A8ADC2]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenBirthChart}
              className="w-full py-3 rounded-xl bg-[#1A2038] hover:bg-[#7C5CFF] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Calculate Vedic Kundli Chart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
