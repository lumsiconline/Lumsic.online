import React from 'react';
import { ShieldCheck, MessageSquare, Star, Globe } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const benefits = [
    {
      title: 'Verified Readers',
      subtitle: 'Trusted & carefully screened',
      icon: ShieldCheck,
      iconColor: '#7C5CFF'
    },
    {
      title: 'Private & Secure',
      subtitle: 'Your conversations stay confidential',
      icon: MessageSquare,
      iconColor: '#E7C878'
    },
    {
      title: 'Secure Payments',
      subtitle: 'Safe & encrypted checkout',
      icon: Star,
      iconColor: '#F59E0B'
    },
    {
      title: 'Satisfaction Guarantee',
      subtitle: 'Feel confident with every reading',
      icon: Globe,
      iconColor: '#06B6D4'
    }
  ];

  return (
    <section aria-label="Trust & Benefits" className="border-b border-[#252A42] bg-[#0D1026] py-6 sm:py-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#252A42]/60">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3.5 ${idx > 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}
              >
                <div 
                  className="w-12 h-12 rounded-2xl bg-[#11162B] border border-[#252A42] flex items-center justify-center shrink-0 shadow-inner"
                  style={{ borderColor: `${item.iconColor}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight">
                    {item.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#A8ADC2] leading-tight mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
