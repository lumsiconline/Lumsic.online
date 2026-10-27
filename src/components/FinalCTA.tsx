import React from 'react';
import { ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';

interface FinalCTAProps {
  onStartBirthChart: () => void;
  onFindAstrologer: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onStartBirthChart,
  onFindAstrologer
}) => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-[#FFFDF9] via-[#FFF9ED] to-[#FFF5DC] border-b border-amber-200/80 relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#B45309] block mb-2">
          Start Your Spiritual Journey
        </span>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.1] mb-4">
          Your Questions. <br className="hidden sm:inline" />
          <span className="text-[#C25E00]">Your Journey. Your Guidance.</span>
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
          Connect with 1,200+ Verified Psychics &amp; Tarot Readers for love, relationships, career, and life guidance. Your first chat is on us.
        </p>

        <div className="flex items-center justify-center max-w-md mx-auto">
          <button
            type="button"
            onClick={onFindAstrologer}
            className="w-full sm:w-auto px-10 py-4.5 rounded-full bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 text-gray-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 border border-[#EAB308]"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Start Free Chat with Psychics</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-6 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Confidential · Average Reply Under 15 Seconds · Thousands of Consultations</span>
        </div>

      </div>
    </section>
  );
};
