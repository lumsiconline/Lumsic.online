import React from 'react';
import { 
  Sparkles, 
  Moon, 
  Compass, 
  Layers, 
  Eye, 
  Grid, 
  Hash, 
  Heart, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface PopularToolsSectionProps {
  onSelectTool: (toolId: string) => void;
}

export const PopularToolsSection: React.FC<PopularToolsSectionProps> = ({ onSelectTool }) => {
  const tools = [
    {
      id: 'birth-chart',
      title: 'Birth Chart Calculator',
      description: 'Calculate your exact natal chart wheel, sun, moon, and rising sign with London Ephemeris.',
      icon: Sparkles,
      tag: 'Most Popular',
      color: 'from-amber-500/20 to-purple-500/10',
      badgeColor: 'text-[#d4af37] border-[#d4af37]/40 bg-[#d4af37]/10'
    },
    {
      id: 'moon-sign',
      title: 'Moon Sign Calculator',
      description: 'Discover your deepest emotional nature, subconscious instincts, and lunar archetype.',
      icon: Moon,
      tag: 'Emotional DNA',
      color: 'from-indigo-500/20 to-blue-500/10',
      badgeColor: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10'
    },
    {
      id: 'rising-sign',
      title: 'Rising Sign (Ascendant)',
      description: 'Unveil your outer aura, physical constitution, and the mask you present to the world.',
      icon: Compass,
      tag: 'Outer Persona',
      color: 'from-violet-500/20 to-pink-500/10',
      badgeColor: 'text-violet-300 border-violet-500/40 bg-violet-500/10'
    },
    {
      id: 'tarot',
      title: 'Tarot of the Day',
      description: 'Draw 1-card, 3-card past-present-future, or yes/no oracle readings with authentic tarot deck.',
      icon: Layers,
      tag: 'Instant Oracle',
      color: 'from-purple-500/20 to-amber-500/10',
      badgeColor: 'text-purple-300 border-purple-500/40 bg-purple-500/10'
    },
    {
      id: 'psychic',
      title: 'Psychic & Intuition Test',
      description: 'Test your sixth sense, clairvoyance, and aura perception with our interactive psychic quiz.',
      icon: Eye,
      tag: 'ESP Assessment',
      color: 'from-emerald-500/20 to-teal-500/10',
      badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
    },
    {
      id: 'kundli',
      title: 'Vedic Kundli Generator',
      description: 'Traditional Vedic birth chart showing Rashi, Lagna, Nakshatras, and planetary dashas.',
      icon: Grid,
      tag: 'Vedic Tradition',
      color: 'from-amber-600/20 to-red-500/10',
      badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10'
    },
    {
      id: 'numerology',
      title: 'Life Path Numerology',
      description: 'Calculate your Life Path number, Destiny number, and decode repeating angel number synchronicities.',
      icon: Hash,
      tag: 'Sacred Mathematics',
      color: 'from-cyan-500/20 to-blue-500/10',
      badgeColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
    },
    {
      id: 'compatibility',
      title: 'Zodiac Love Compatibility',
      description: 'Compare two signs or birth dates for romantic, emotional, and long-term synastry harmony.',
      icon: Heart,
      tag: 'Love & Synastry',
      color: 'from-rose-500/20 to-pink-500/10',
      badgeColor: 'text-rose-300 border-rose-500/40 bg-rose-500/10'
    }
  ];

  return (
    <section id="popular-tools" className="py-12 sm:py-16 bg-[#090314] relative border-b border-[#2c184d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free Cosmic Access</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
              Popular Free Tools
            </h2>
            <p className="text-sm text-[#bda5db] mt-2 max-w-2xl font-light">
              Explore our suite of precision astronomical and divination instruments. Instant, anonymous, and calculated with high-precision global ephemeris data.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#d4af37] bg-[#1a0c33] border border-[#d4af37]/30 px-3.5 py-2 rounded-xl shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>No Account Required · Instant Results</span>
          </div>
        </div>

        {/* 8 Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {tools.map(tool => {
            const IconComp = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`group relative p-5 rounded-2xl bg-gradient-to-br ${tool.color} bg-[#130726]/80 border border-[#2c184d] hover:border-[#d4af37]/60 transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.18)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#230f3f] border border-[#d4af37]/35 flex items-center justify-center text-[#f5e7a9] group-hover:scale-110 transition-transform">
                      <IconComp className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-[#faf7f2] group-hover:text-[#d4af37] transition-colors mb-1.5">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-[#bda5db] leading-relaxed font-light mb-4">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2c184d]/60 flex items-center justify-between text-xs font-semibold text-[#d4af37] group-hover:text-[#faf7f2] transition-colors">
                  <span>Open Free Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
