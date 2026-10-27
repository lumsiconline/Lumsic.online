import React from 'react';
import { 
  Sparkles, Compass, Moon, Sun, Heart, Calculator, Star, Eye, Calendar, ArrowRight, Wrench 
} from 'lucide-react';

interface PopularFreeToolsSectionProps {
  onOpenBirthChart: () => void;
  onOpenTool: (toolId: string) => void;
}

export const PopularFreeToolsSection: React.FC<PopularFreeToolsSectionProps> = ({
  onOpenBirthChart,
  onOpenTool
}) => {
  const tools = [
    {
      id: 'birth-chart-calculator',
      name: 'Birth Chart Calculator',
      category: 'Birth Charts',
      badge: 'Most Popular',
      icon: Compass,
      desc: 'Instant high-resolution natal wheel with Sun, Moon, Rising and houses.',
      color: 'from-purple-900/40 to-indigo-900/20',
      action: onOpenBirthChart
    },
    {
      id: 'moon-sign-calculator',
      name: 'Moon Sign Calculator',
      category: 'Subconscious',
      badge: 'Free',
      icon: Moon,
      desc: 'Discover your subconscious emotional anchor and instinctual nature.',
      color: 'from-blue-900/40 to-indigo-900/20',
      action: () => onOpenTool('moon-sign-calculator')
    },
    {
      id: 'compatibility-calculator',
      name: 'Love Compatibility',
      category: 'Synastry',
      badge: 'High Match',
      icon: Heart,
      desc: 'Evaluate elemental harmony and romance chemistry between any two signs.',
      color: 'from-pink-900/40 to-purple-900/20',
      action: () => onOpenTool('compatibility-calculator')
    },
    {
      id: 'kundli-calculator',
      name: 'Vedic Kundli (Janampatri)',
      category: 'Vedic Jyotish',
      badge: 'Sidereal',
      icon: Sparkles,
      desc: 'Generate traditional North and South Indian Vedic birth charts with Dashas.',
      color: 'from-amber-900/40 to-purple-900/20',
      action: () => onOpenTool('kundli-calculator')
    },
    {
      id: 'life-path-calculator',
      name: 'Life Path Number',
      category: 'Numerology',
      badge: 'Pythagorean',
      icon: Calculator,
      desc: 'Calculate your core incarnation path and master number vibration.',
      color: 'from-emerald-900/40 to-teal-900/20',
      action: () => onOpenTool('life-path-calculator')
    },
    {
      id: 'tarot-reading',
      name: 'One & Three Card Tarot',
      category: 'Divination',
      badge: 'Interactive',
      icon: Star,
      desc: 'Consecrated virtual card draw for instant daily clarity or timeline spread.',
      color: 'from-fuchsia-900/40 to-purple-900/20',
      action: () => onOpenTool('tarot-reading')
    },
    {
      id: 'psychic-test',
      name: 'Psychic Intuition Test',
      category: 'Extrasensory',
      badge: 'Quiz',
      icon: Eye,
      desc: 'Evaluate your strongest Clair psychic sense (Vision, Hearing, or Feeling).',
      color: 'from-violet-900/40 to-purple-900/20',
      action: () => onOpenTool('psychic-test')
    },
    {
      id: 'moon-calendar',
      name: 'Moon Calendar & Phases',
      category: 'Lunar Wisdom',
      badge: 'Live',
      icon: Calendar,
      desc: 'Live lunar phase tracker for manifestation, releases, and ritual timings.',
      color: 'from-slate-900/40 to-purple-900/20',
      action: () => onOpenTool('moon-calendar')
    }
  ];

  return (
    <section id="tools" className="py-12 sm:py-16 md:py-20 bg-[#090314] relative border-b border-[#2c184d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <Wrench className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>100% Free · No Sign Up Required</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
              Popular Free Tools
            </h2>
            <p className="text-sm md:text-base text-[#bda5db] mt-2 max-w-2xl font-light">
              Instant, accurate calculations powered by real astronomical ephemeris and sacred traditions.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBirthChart}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#1b0a33] hover:bg-[#2c1352] border border-[#d4af37]/40 text-xs font-semibold text-[#f5e7a9] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>Create Birth Chart</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
          </button>
        </div>

        {/* 8 Popular Free Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={tool.action}
                className={`group p-5 rounded-2xl bg-gradient-to-b ${tool.color} bg-[#130726] border border-[#2d144f] hover:border-[#d4af37]/60 shadow-lg shadow-black/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#230d42] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1b0c36] text-[#d4af37] border border-[#d4af37]/30">
                      {tool.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#bda5db]/60 uppercase tracking-wider block mb-1">
                    {tool.category}
                  </span>
                  <h3 className="font-serif text-lg font-medium text-[#faf7f2] group-hover:text-[#f5e7a9] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-[#bda5db] mt-1.5 leading-relaxed font-light">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#311656] flex items-center justify-between text-xs font-semibold text-[#f5e7a9]">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
