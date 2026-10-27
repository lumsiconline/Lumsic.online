import React from 'react';
import { Sparkles, User, Calendar, Clock, MessageSquare } from 'lucide-react';

export const ConsultationProcess: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Select Your Specialist',
      desc: 'Browse our curated directory of 20 seasoned UK and Vedic practitioners. Review their 15+ years background, specialties, and client testimonials.',
      icon: User
    },
    {
      num: '02',
      title: 'State Your Topic & Question',
      desc: 'Share what is on your mind—love, career, or life direction. For Tarot and Psychic readings, no birth time or birth chart is ever required.',
      icon: MessageSquare
    },
    {
      num: '03',
      title: 'Your Specialist Connects',
      desc: 'Your request connects directly with your specialist. Your 5 free minutes begin ONLY once your assigned reader connects—not a second while you wait.',
      icon: Clock
    },
    {
      num: '04',
      title: 'Real-Time Counsel & Clarity',
      desc: 'Enjoy authentic, private dialogue with your specialist. Continue at standard per-minute rates only if you find value, with zero pressure.',
      icon: Sparkles
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-[#0d0618] border-t border-[#2c184d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Journey</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
            How Consultations Work
          </h2>
          <p className="text-sm md:text-base text-[#bda5db] mt-2 font-light">
            Simple, honest, and entirely handled by vetted practitioners.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-6 rounded-2xl bg-[#140824] border border-[#2c184d] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-[#d4af37]/60">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#241142] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-[#faf7f2] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#faf7f2]/70 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#2c184d]/50 flex items-center gap-1.5 text-[11px] text-[#d4af37]">
                  <Sparkles className="w-3 h-3" />
                  <span>Direct Personal Consultation</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
