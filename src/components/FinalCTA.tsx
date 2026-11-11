import React from 'react';
import { ArrowRight, Flame, ShoppingBag, ShieldCheck } from 'lucide-react';

interface FinalCTAProps {
  onStartBirthChart?: () => void;
  onFindAstrologer?: () => void;
  onExploreRemedies?: () => void;
  onOpenStore?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onExploreRemedies,
  onOpenStore,
  onFindAstrologer
}) => {
  const handleRemedies = () => {
    if (onExploreRemedies) onExploreRemedies();
    else if (onFindAstrologer) onFindAstrologer();
  };

  const handleStore = () => {
    if (onOpenStore) onOpenStore();
    else if (onExploreRemedies) onExploreRemedies();
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-[#FFFDF9] via-[#FFF9ED] to-[#FFF5DC] border-b border-amber-200/80 relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#B45309] block mb-2 font-mono">
          Sacred Sanctuary Blessings
        </span>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.1] mb-4 font-serif">
          Experience Authentic <br className="hidden sm:inline" />
          <span className="text-[#C25E00]">Sacred Remedies &amp; Cosmic Store</span>
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
          Consecrated yantras, distance energy healings, Vedic puja ceremonies, and sacred crystal artifacts blessed by seasoned masters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleRemedies}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 text-gray-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-[#EAB308]"
          >
            <Flame className="w-4.5 h-4.5 fill-current" />
            <span>Explore Remedies</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={handleStore}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-amber-50 text-gray-900 font-bold text-sm uppercase tracking-wider shadow-md border border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4.5 h-4.5 text-[#B45309]" />
            <span>Visit Store</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-6 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Vedic Consecration Guarantee · Insured Tracked Global Shipping · Sanctuary Cleansed</span>
        </div>

      </div>
    </section>
  );
};
