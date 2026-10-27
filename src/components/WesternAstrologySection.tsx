import React, { useState } from 'react';
import { Compass, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';
import { ZODIAC_SIGNS } from '../data/horoscope';

export const WesternAstrologySection: React.FC = () => {
  const [activeSignId, setActiveSignId] = useState('aries');
  const activeSign = ZODIAC_SIGNS.find(s => s.id === activeSignId) || ZODIAC_SIGNS[0];

  return (
    <section id="astrology" className="py-12 sm:py-16 md:py-20 bg-[#0b0416] relative border-b border-[#2c184d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
            <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Tropical Solar Wheel &amp; Planetary Archetypes</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
            Western Zodiac Traditions
          </h2>
          <p className="text-sm md:text-base text-[#bda5db] mt-2 font-light">
            Explore the 12 archetypal zodiac signs, 10 planetary rulers, 12 houses of human experience, and sacred geometric aspects.
          </p>
        </div>

        {/* 12 Zodiac Sign Selection Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar justify-start md:justify-center">
          {ZODIAC_SIGNS.map((s) => {
            const isSelected = s.id === activeSignId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSignId(s.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#29134a] border-[#d4af37] text-[#f5e7a9] shadow-[0_0_15px_rgba(212,175,55,0.25)] scale-105'
                    : 'bg-[#150728] border-[#301654] text-[#bda5db] hover:border-[#d4af37]/40 hover:text-[#faf7f2]'
                }`}
              >
                <span className="text-base font-serif font-bold">{s.symbol}</span>
                <span className="text-[11px] font-semibold">{s.name}</span>
                <span className="text-[9px] text-[#bda5db]/60 font-mono">{s.element}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Sign Highlight Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#140628] border border-[#2e1554] shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-[#2d144e] pb-4 md:pb-0 md:pr-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#d4af37] bg-[#220c3b] px-3 py-1 rounded-full border border-[#d4af37]/30">
              <span>{activeSign.symbol} {activeSign.name}</span>
              <span>·</span>
              <span>{activeSign.element} Element</span>
            </div>
            <h3 className="font-serif text-3xl font-light text-[#faf7f2]">
              {activeSign.name} Archetype
            </h3>
            <p className="text-xs text-[#bda5db] font-mono">
              Dates: {activeSign.dates}
            </p>
            <p className="text-xs text-[#bda5db] font-mono">
              Ruling Planet: <strong className="text-[#f5e7a9]">{activeSign.rulingPlanet}</strong>
            </p>
          </div>

          <div className="md:col-span-8 space-y-4">
            <p className="text-sm text-[#e0d3f2] leading-relaxed">
              {activeSign.dailySummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#1d0b38] border border-[#3b1c6b] space-y-1">
                <span className="text-[#d4af37] font-bold block uppercase font-mono text-[10px]">Love &amp; Devotion</span>
                <p className="text-[#bda5db]">{activeSign.loveGuidance}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1d0b38] border border-[#3b1c6b] space-y-1">
                <span className="text-emerald-400 font-bold block uppercase font-mono text-[10px]">Vocation &amp; Career</span>
                <p className="text-[#bda5db]">{activeSign.careerGuidance}</p>
              </div>
            </div>

            <p className="text-xs italic text-[#f5e7a9]/90 border-t border-[#2d144e] pt-2">
              Affirmation: &quot;{activeSign.affirmation}&quot;
            </p>
          </div>
        </div>

        {/* 4 Pillars of Western Zodiac */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { title: 'The Planets', desc: '10 cosmic actors channeling solar vitality, emotional tides, and generational transformation.' },
            { title: 'The 12 Houses', desc: 'The stage of earthly incarnation, mapping finances, relationships, career and transcendence.' },
            { title: 'Sacred Aspects', desc: 'Trines, squares, sextiles and oppositions linking celestial energies into soul dialogue.' },
            { title: 'Retrogrades & Transits', desc: 'Real-time planetary motion activating the natal horoscope blueprint.' }
          ].map((col, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#120524] border border-[#291347] space-y-1">
              <h4 className="font-serif text-base font-semibold text-[#faf7f2]">{col.title}</h4>
              <p className="text-xs text-[#bda5db]/75 leading-relaxed">{col.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
