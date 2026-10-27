import React from 'react';
import { Compass, Moon, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface QuickDiscoveryCardsProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenBirthChart: () => void;
  onOpenTarot: () => void;
  onOpenPsychic: () => void;
}

export const QuickDiscoveryCards: React.FC<QuickDiscoveryCardsProps> = ({
  onNavigateSection,
  onOpenBirthChart,
  onOpenTarot,
  onOpenPsychic
}) => {
  const cards = [
    {
      title: 'Birth Chart',
      description: 'Discover your Sun, Moon and Rising signs.',
      icon: Compass,
      iconColor: '#7C5CFF',
      cta: 'Explore',
      action: onOpenBirthChart
    },
    {
      title: 'Daily Horoscope',
      description: 'Your personalized cosmic forecast for today.',
      icon: Moon,
      iconColor: '#E7C878',
      cta: 'Explore',
      action: () => onNavigateSection('horoscope')
    },
    {
      title: 'Psychic Test',
      description: 'Explore your intuitive sensory score.',
      icon: Sparkles,
      iconColor: '#5B4AE8',
      cta: 'Explore',
      action: onOpenPsychic
    },
    {
      title: 'Tarot Reading',
      description: 'Draw your card for daily reflection.',
      icon: BookOpen,
      iconColor: '#E7C878',
      cta: 'Explore',
      action: onOpenTarot
    }
  ];

  return (
    <section className="relative z-10 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="cosmic-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer active:scale-[0.98] transition-all"
            >
              <div>
                <div 
                  className="w-12 h-12 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                >
                  <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-[#E7C878] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-[#A8ADC2] leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-[#7C5CFF] transition-colors">
                <span>{card.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
