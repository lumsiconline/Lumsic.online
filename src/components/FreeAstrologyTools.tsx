import React from 'react';
import { Compass, Moon, Sun, Heart, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

interface FreeAstrologyToolsProps {
  onOpenBirthChart: () => void;
  onOpenTarot: () => void;
  onOpenCompatibility: () => void;
  onOpenAllTools?: () => void;
}

export const FreeAstrologyTools: React.FC<FreeAstrologyToolsProps> = ({
  onOpenBirthChart,
  onOpenTarot,
  onOpenCompatibility,
  onOpenAllTools
}) => {
  const tools = [
    {
      id: 'birth-chart',
      title: 'Free Birth Chart',
      badge: '100% Accurate',
      desc: 'Calculate full planetary positions, 12 Bhavas, Ascendant sign, and Vimshottari Dasha.',
      icon: Compass,
      color: '#B45309',
      bgColor: '#FEF3C7',
      action: onOpenBirthChart
    },
    {
      id: 'moon-sign',
      title: 'Moon Sign Calculator',
      badge: 'Emotional Self',
      desc: 'Discover your true celestial Moon sign, governing element, and emotional temperament.',
      icon: Moon,
      color: '#0284C7',
      bgColor: '#E0F2FE',
      action: onOpenBirthChart
    },
    {
      id: 'sun-sign',
      title: 'Sun Sign Calculator',
      badge: 'Core Identity',
      desc: 'Analyze your conscious solar life force, vitality, personality strengths, and archetype.',
      icon: Sun,
      color: '#D97706',
      bgColor: '#FFFBEB',
      action: onOpenBirthChart
    },
    {
      id: 'compatibility',
      title: 'Love Compatibility Score',
      badge: 'Synastry Match',
      desc: 'Check detailed cosmic compatibility between partner charts for love and relationships.',
      icon: Heart,
      color: '#E11D48',
      bgColor: '#FFE4E6',
      action: onOpenCompatibility
    },
    {
      id: 'tarot-card',
      title: 'Daily Tarot Reading',
      badge: 'Daily Oracle',
      desc: 'Pick your single card for today to reveal immediate subconscious direction and love forecast.',
      icon: BookOpen,
      color: '#9333EA',
      bgColor: '#FAF5FF',
      action: onOpenTarot
    }
  ];

  return (
    <section id="tools" className="py-14 sm:py-18 bg-[#FAF8F5] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#B45309] block mb-1.5">
            Instant Spiritual Calculators
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-2">
            Free Spiritual &amp; Mystic Tools
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Generate accurate birth charts, daily tarot readings, and compatibility reports with zero fees.
          </p>
        </div>

        {/* 5 Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={tool.action}
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: tool.bgColor }}
                    >
                      <Icon className="w-6 h-6" style={{ color: tool.color }} />
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full truncate"
                      style={{ backgroundColor: tool.bgColor, color: tool.color }}
                    >
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-950 group-hover:text-[#B45309] mb-2 leading-snug transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6 font-normal">
                    {tool.desc}
                  </p>
                </div>

                <div 
                  className="inline-flex items-center gap-1.5 text-xs font-bold pt-3 border-t border-gray-100 transition-colors"
                  style={{ color: tool.color }}
                >
                  <span>Launch Free Tool</span>
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
