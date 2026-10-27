import React from 'react';
import { Sparkles, Compass, Moon, ShieldCheck, Sun, ArrowRight, Award } from 'lucide-react';

interface VedicAstrologySectionProps {
  onOpenTool: (toolId: string) => void;
  onConsultVedicElder: () => void;
}

export const VedicAstrologySection: React.FC<VedicAstrologySectionProps> = ({
  onOpenTool,
  onConsultVedicElder
}) => {
  const vedicModules = [
    {
      title: 'Kundli (Janampatri)',
      desc: 'The divine sidereal birth map calculating planetary degrees in the 12 Bhavas (houses).',
      tag: 'Birth Chart'
    },
    {
      title: 'Rashi & Lagna',
      desc: 'Your true Moon sign for emotional karma and the exact rising sign constellation.',
      tag: 'Soul Core'
    },
    {
      title: '27 Nakshatras',
      desc: 'Ashwini to Revati — micro-energies governing temperament and divine destiny.',
      tag: 'Lunar Mansions'
    },
    {
      title: 'Dasha & Mahadasha',
      desc: '120-year Vimshottari timeline mapping planetary rulership across your life chapters.',
      tag: 'Life Periods'
    },
    {
      title: 'Manglik Dosha',
      desc: 'Mars placement analysis in 1st, 4th, 7th, 8th or 12th house with sacred Vedic remedies.',
      tag: 'Marriage'
    },
    {
      title: 'Sade Sati Transit',
      desc: 'Saturn’s 7.5-year metamorphic transit over natal Moon, lessons, and protection.',
      tag: 'Saturn Cycle'
    }
  ];

  return (
    <section id="vedic" className="py-12 sm:py-16 md:py-20 bg-[#090314] relative border-b border-[#2c184d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <Sun className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Sacred Sidereal Jyotish Tradition</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
              Vedic Wisdom
            </h2>
            <p className="text-sm md:text-base text-[#bda5db] mt-2 max-w-2xl font-light">
              Originating from the Vedic Rishis, Jyotish (&quot;Science of Light&quot;) reveals karma, life purpose, and authentic planetary remedies.
            </p>
          </div>

          <button
            type="button"
            onClick={onConsultVedicElder}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-[#0b0514] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Vedic Acharya</span>
          </button>
        </div>

        {/* 6 Vedic Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {vedicModules.map((m, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#140626] border border-[#2d144e] hover:border-[#d4af37]/60 shadow-lg transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#200c3b] text-[#d4af37] border border-[#d4af37]/30">
                  {m.tag}
                </span>
                <span className="text-xs font-mono text-[#bda5db]/40">0{idx + 1}</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-[#faf7f2] group-hover:text-[#f5e7a9] transition-colors">
                {m.title}
              </h3>
              <p className="text-xs text-[#bda5db] leading-relaxed font-light">
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Highlight Banner: Kundli Milan & Remedies */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#1f0b38] via-[#2c104e] to-[#1f0b38] border border-[#d4af37]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif text-lg sm:text-xl text-[#faf7f2] font-semibold">
              Kundli Matching (Ashtakoota 36 Guna Milan) &amp; Planetary Remedies
            </h4>
            <p className="text-xs text-[#bda5db] max-w-xl">
              Evaluate compatibility for sacred marriage or discover gemstone, mantra, and charity remedies for challenging planetary periods.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenTool('kundli-matching')}
            className="px-4 py-2 rounded-xl bg-[#140628] hover:bg-[#200c3b] border border-[#d4af37]/50 text-xs font-semibold text-[#f5e7a9] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Kundli Milan</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
          </button>
        </div>

      </div>
    </section>
  );
};
