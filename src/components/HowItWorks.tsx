import React from 'react';
import { Target, Sparkles, PackageCheck, Flame, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose Remedy',
      tagline: 'Select Sacred Offering',
      desc: 'Pick your consecrated item, love & reunion ritual, chakra healing, or prosperity yantra.',
      icon: Target,
      bgColor: '#FEF3C7',
      color: '#B45309'
    },
    {
      num: '02',
      title: 'Consecration',
      tagline: 'Vedic Energy Cleansing',
      desc: 'Each sacred artifact and ritual is custom-cleansed and energized under sacred Vedic mantras.',
      icon: Sparkles,
      bgColor: '#EEF2FF',
      color: '#4F46E5'
    },
    {
      num: '03',
      title: 'Sacred Ceremony',
      tagline: 'Distance Pujas & Healing',
      desc: 'Distance healings and puja ceremonies are performed with photo/video proof sent to you.',
      icon: Flame,
      bgColor: '#ECFDF5',
      color: '#059669'
    },
    {
      num: '04',
      title: 'Global Delivery',
      tagline: 'Tracked & Insured',
      desc: 'Physical items are safely packed with sacred vibhuti and delivered directly to your doorstep.',
      icon: PackageCheck,
      bgColor: '#FFF1F2',
      color: '#E11D48'
    }
  ];

  return (
    <section id="how-it-works" className="py-7 sm:py-9 bg-white border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#B45309] block mb-1">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mb-1.5 font-serif">
            How Remedies &amp; Store Work
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            From Vedic consecration to sacred distance healing and doorstep delivery — authentic sanctuary quality guaranteed.
          </p>
        </div>

        {/* 4 Steps Grid - Compact smaller boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span 
                      className="font-black text-base sm:text-lg font-mono tracking-tight"
                      style={{ color: step.color }}
                    >
                      {step.num}
                    </span>
                    <div 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: step.bgColor }}
                    >
                      <Icon className="w-4 h-4" style={{ color: step.color }} />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-gray-950 mb-0.5">
                    {step.title}
                  </h3>
                  <div className="text-[10px] sm:text-xs font-bold mb-1.5 line-clamp-1" style={{ color: step.color }}>
                    {step.tagline}
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-600 leading-snug font-normal line-clamp-3">
                    {step.desc}
                  </p>
                </div>

                {idx < 3 && (
                  <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 items-center justify-center shadow-xs">
                    <ArrowRight className="w-2.5 h-2.5 text-amber-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
