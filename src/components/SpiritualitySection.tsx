import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Flame, Heart, Shield, ArrowRight } from 'lucide-react';

export const SpiritualitySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chakras' | 'moon' | 'crystals'>('chakras');

  const chakras = [
    { name: 'Root (Muladhara)', color: 'bg-red-500/20 text-red-300 border-red-500/30', focus: 'Grounding, physical safety, stability and earth connection' },
    { name: 'Sacral (Svadhisthana)', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', focus: 'Sensuality, creative flow, emotional fluidity and pleasure' },
    { name: 'Solar Plexus (Manipura)', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', focus: 'Willpower, sovereignty, digestion, confidence and purpose' },
    { name: 'Heart (Anahata)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', focus: 'Unconditional love, forgiveness, empathy and inner peace' },
    { name: 'Throat (Vishuddha)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', focus: 'Authentic truth, clear expression, vocal empowerment and honesty' },
    { name: 'Third Eye (Ajna)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', focus: 'Intuition, astral vision, symbolic perception and spiritual clarity' },
    { name: 'Crown (Sahasrara)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', focus: 'Universal consciousness, divine oneness and cosmic enlightenment' }
  ];

  return (
    <section id="spirituality" className="py-12 sm:py-16 md:py-20 bg-[#090314] relative border-b border-[#2c184d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inner Alchemy, Energy &amp; Lunar Cycles</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
            Spirituality &amp; Sacred Practice
          </h2>
          <p className="text-sm md:text-base text-[#bda5db] mt-2 font-light">
            Align your personal field with the 7 sacred chakras, healing crystals, and lunar tides.
          </p>

          {/* Navigation Pills */}
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('chakras')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'chakras' ? 'bg-[#d4af37] text-[#0b0514] font-bold shadow' : 'bg-[#18092f] text-[#bda5db] hover:text-white'
              }`}
            >
              The 7 Chakras
            </button>
            <button
              onClick={() => setActiveTab('moon')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'moon' ? 'bg-[#d4af37] text-[#0b0514] font-bold shadow' : 'bg-[#18092f] text-[#bda5db] hover:text-white'
              }`}
            >
              Moon Phases
            </button>
            <button
              onClick={() => setActiveTab('crystals')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'crystals' ? 'bg-[#d4af37] text-[#0b0514] font-bold shadow' : 'bg-[#18092f] text-[#bda5db] hover:text-white'
              }`}
            >
              Healing Crystals
            </button>
          </div>
        </div>

        {/* Tab 1: Chakras */}
        {activeTab === 'chakras' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in">
            {chakras.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#140626] border border-[#2d144e] space-y-2 hover:border-[#d4af37]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${c.color}`}>
                    Chakra 0{idx + 1}
                  </span>
                </div>
                <h4 className="font-serif text-base font-semibold text-[#faf7f2]">
                  {c.name}
                </h4>
                <p className="text-xs text-[#bda5db] leading-relaxed">
                  {c.focus}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Moon Phases */}
        {activeTab === 'moon' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
            {[
              { phase: 'New Moon', action: 'Plant Intentions', text: 'Fertile void for setting 6-month goals, quiet meditation and seed planting.' },
              { phase: 'Waxing Moon', action: 'Build Momentum', text: 'Action, creative nourishment, and strengthening affirmations.' },
              { phase: 'Full Moon', action: 'Illumination & Peak', text: 'Celebration, intuitive downloads, crystal cleansing and releasing gratitude.' },
              { phase: 'Waning Moon', action: 'Cord Cutting & Cleanse', text: 'Banishing toxic ties, decluttering sacred space, and gentle inner rest.' }
            ].map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#140626] border border-[#2d144e] space-y-2">
                <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold block">{m.action}</span>
                <h4 className="font-serif text-lg text-[#faf7f2] font-semibold">{m.phase}</h4>
                <p className="text-xs text-[#bda5db] leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Crystals */}
        {activeTab === 'crystals' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
            {[
              { stone: 'Amethyst', realm: 'Third Eye & Crown', prop: 'Transmutes negative vibrations, deepens meditation, and calms an overactive nervous system.' },
              { stone: 'Black Tourmaline', realm: 'Root & Aura Shield', prop: 'Powerful psychic shield deflecting electromagnetic static and toxic external projections.' },
              { stone: 'Rose Quartz', realm: 'Heart & Harmony', prop: 'Attracts soulmate alignment, restores trust, and dissolves old heart wounds with tender mercy.' },
              { stone: 'Selenite', realm: 'Crown & Purification', prop: 'Liquid light wand that cleanses other crystals and creates a sacred perimeter of peace.' },
              { stone: 'Citrine', realm: 'Solar Plexus & Abundance', prop: 'The merchant’s stone holding pure solar light; manifests wealth without holding negative energy.' },
              { stone: 'Clear Quartz', realm: 'Universal Amplifier', prop: 'Master healer programmable for any high-frequency manifestation or healing intention.' }
            ].map((c, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#140626] border border-[#2d144e] space-y-2">
                <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold block">{c.realm}</span>
                <h4 className="font-serif text-lg text-[#faf7f2] font-semibold">{c.stone}</h4>
                <p className="text-xs text-[#bda5db] leading-relaxed">{c.prop}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
