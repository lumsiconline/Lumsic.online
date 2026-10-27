import React from 'react';
import { ShieldCheck, Lock, Award, Clock } from 'lucide-react';

export const WhyAstralSection: React.FC = () => {
  const pillars = [
    {
      title: 'Verified Readers',
      subtitle: 'Rigorous 4-Stage Vetting',
      desc: 'Every psychic, tarot reader, and spiritual advisor passes written exams, credentials verification, and live evaluations. Only top 2% qualify.',
      icon: ShieldCheck,
      color: '#B45309',
      bgColor: '#FEF3C7'
    },
    {
      title: 'Private & Secure',
      subtitle: '100% Confidentiality',
      desc: 'All chats, calls, and birth records are encrypted end-to-end. Your details are never exposed or shared with third parties.',
      icon: Lock,
      color: '#4F46E5',
      bgColor: '#EEF2FF'
    },
    {
      title: 'Satisfaction Guarantee',
      subtitle: 'Full Peace of Mind',
      desc: 'If you do not feel an authentic spiritual connection in your consultation, your credits are refunded immediately.',
      icon: Award,
      color: '#0284C7',
      bgColor: '#E0F2FE'
    },
    {
      title: '24/7 Availability',
      subtitle: 'Instant Connect Anytime',
      desc: 'Verified psychics and tarot readers are online around the clock across USA & UK time zones. Guidance is always a single tap away.',
      icon: Clock,
      color: '#D97706',
      bgColor: '#FEF3C7'
    }
  ];

  return (
    <section id="why-astral" className="py-10 sm:py-14 bg-[#FAF8F5] border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#B45309] block mb-1">
            The LUMSIC Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mb-1.5 font-serif">
            Why LUMSIC
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            The trusted sanctuary for authentic psychic readings, spiritual guidance, and tarot clarity across the USA &amp; UK.
          </p>
        </div>

        {/* 4 Pillars Grid - Smaller, compact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div 
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3.5 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: pillar.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: pillar.color }} />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-950 mb-0.5 leading-snug">
                    {pillar.title}
                  </h3>
                  <div className="text-[11px] font-bold mb-2 tracking-tight" style={{ color: pillar.color }}>
                    {pillar.subtitle}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
