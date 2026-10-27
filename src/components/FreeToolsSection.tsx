import React, { useState } from 'react';
import { 
  Calculator, Compass, Moon, Sun, Heart, Sparkles, Eye, Waves, Calendar, Hash, ArrowRight 
} from 'lucide-react';

interface FreeToolsSectionProps {
  onOpenBirthChart: () => void;
  onOpenTarot: () => void;
  onOpenPsychic: () => void;
  onOpenCompatibility: () => void;
  onOpenNumerology: () => void;
}

export const FreeToolsSection: React.FC<FreeToolsSectionProps> = ({
  onOpenBirthChart,
  onOpenTarot,
  onOpenPsychic,
  onOpenCompatibility,
  onOpenNumerology
}) => {
  const tools = [
    { title: 'Birth Chart Calculator', desc: 'Compute full natal wheel, degrees and aspects.', action: onOpenBirthChart },
    { title: 'Moon Sign Calculator', desc: 'Discover your subconscious emotional processor.', action: onOpenBirthChart },
    { title: 'Rising Sign Calculator', desc: 'Calculate your Ascendant and outer perspective.', action: onOpenBirthChart },
    { title: 'Sun Sign Calculator', desc: 'Identify your conscious solar vitality and archetype.', action: onOpenBirthChart },
    { title: 'Compatibility Calculator', desc: 'Elemental synastry and relationship harmony score.', action: onOpenCompatibility },
    { title: 'Kundli Calculator', desc: 'Vedic Janam Kundli generation with 12 Bhavas.', action: onOpenBirthChart },
    { title: 'Rashi Calculator', desc: 'Calculate Vedic Moon Sign and planetary lord.', action: onOpenBirthChart },
    { title: 'Nakshatra Calculator', desc: 'Find your birth constellation among 27 sacred stars.', action: onOpenBirthChart },
    { title: 'Life Path Calculator', desc: 'Pythagorean numerology life direction number.', action: onOpenNumerology },
    { title: 'Angel Number Calculator', desc: 'Decode synchronistic repeating numerical sequences.', action: onOpenNumerology },
    { title: 'One Card Tarot', desc: 'Daily single card draw for instant contemplative clarity.', action: onOpenTarot },
    { title: 'Three Card Tarot', desc: 'Past, Present, and Unfolding Future archetypal spread.', action: onOpenTarot },
    { title: 'Yes / No Tarot', desc: 'Direct oracle answer to clear, single inquiries.', action: onOpenTarot },
    { title: 'Psychic Test', desc: 'Evaluate intuitive sensitivity and clairsentience.', action: onOpenPsychic },
    { title: 'Intuition ESP Test', desc: 'Interactive real-time symbol resonance test.', action: onOpenPsychic },
    { title: 'Aura Resonance Quiz', desc: 'Identify your subtle energetic field frequency.', action: onOpenPsychic },
    { title: 'Moon Calendar & Ephemeris', desc: 'Track New Moons, Full Moons, and void-of-course cycles.', action: onOpenBirthChart },
  ];

  return (
    <section id="tools" className="py-20 bg-[#070A18] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Specification 17) */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#E7C878] block mb-2">
            Instant Online Calculators
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Free Mystic &amp; Spiritual Tools
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            Explore our comprehensive suite of 17 open-access calculators, tests, and divination utilities. No signup required.
          </p>
        </div>

        {/* 17 Working Tools Grid (Specification 17) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {tools.map((tool, i) => (
            <div
              key={i}
              onClick={tool.action}
              className="cosmic-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer hover:border-[#7C5CFF]/60 transition-all active:scale-[0.98]"
            >
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#E7C878] transition-colors flex items-center justify-between">
                  <span>{tool.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A8ADC2] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-[#A8ADC2] leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#252A42]/60 flex items-center justify-between text-[11px] text-[#7C5CFF] font-semibold">
                <span>Launch Tool</span>
                <span>Free · Instant</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onOpenBirthChart}
            className="px-8 py-3.5 rounded-xl bg-[#11162B] hover:bg-[#1A2038] border border-[#252A42] hover:border-[#7C5CFF] text-white text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>View All Free Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
