import React from 'react';
import { Heart, Briefcase, Sparkles, Coins, Moon, ArrowRight } from 'lucide-react';

interface ChooseYourPathProps {
  onSelectPath: (pathId: string, pathName: string) => void;
}

export const ChooseYourPath: React.FC<ChooseYourPathProps> = ({ onSelectPath }) => {
  const paths = [
    {
      id: 'love',
      emoji: '❤️',
      title: 'Love & Relationship',
      tagline: 'Soulmates & Marriage',
      desc: 'Discover compatibility, marriage timing, partner intentions, and emotional alignment.',
      accentColor: '#E11D48',
      bgLight: '#FFF1F2'
    },
    {
      id: 'career',
      emoji: '💼',
      title: 'Career & Job',
      tagline: 'Job Change & Growth',
      desc: 'Clarity on promotions, job transitions, business ventures, and professional milestones.',
      accentColor: '#0284C7',
      bgLight: '#F0F9FF'
    },
    {
      id: 'future',
      emoji: '🔮',
      title: 'Future Prediction',
      tagline: 'Life Path & Destiny',
      desc: 'Detailed timeline forecasts, upcoming planetary transits, and critical life crossroads.',
      accentColor: '#9333EA',
      bgLight: '#FAF5FF'
    },
    {
      id: 'money',
      emoji: '💰',
      title: 'Finance & Wealth',
      tagline: 'Money & Prosperity',
      desc: 'Understand wealth cycles, financial obstacles, real estate, and investment timing.',
      accentColor: '#D97706',
      bgLight: '#FFFBEB'
    },
    {
      id: 'spirituality',
      emoji: '🌙',
      title: 'Spirituality & Remedies',
      tagline: 'Inner Peace & Healing',
      desc: 'Karmic healing, energy balancing, spiritual guidance, and a peaceful mindset.',
      accentColor: '#059669',
      bgLight: '#ECFDF5'
    }
  ];

  return (
    <section id="paths" className="py-14 sm:py-18 bg-[#FAF8F5] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#B45309] block mb-1.5">
            Guidance Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-2">
            Choose Your Path
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Select what is on your mind today to consult with verified psychics, tarot readers &amp; top-rated spiritual advisors.
          </p>
        </div>

        {/* 5 Path Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {paths.map((path) => (
            <div
              key={path.id}
              onClick={() => onSelectPath(path.id, path.title)}
              className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: path.bgLight }}
                >
                  {path.emoji}
                </div>

                <h3 className="text-lg font-bold text-gray-950 mb-1 group-hover:text-[#B45309] transition-colors">
                  {path.title}
                </h3>
                <div className="text-xs font-semibold mb-2.5" style={{ color: path.accentColor }}>
                  {path.tagline}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-normal mb-5">
                  {path.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-bold text-gray-900 group-hover:text-[#B45309]">
                <span>Consult Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
