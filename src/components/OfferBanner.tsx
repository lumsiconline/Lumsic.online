import React from 'react';

interface OfferBannerProps {
  onClaimOffer?: () => void;
}

export const OfferBanner: React.FC<OfferBannerProps> = ({ onClaimOffer }) => {
  const tickerItems = (
    <div className="flex items-center gap-8 text-[11px] sm:text-xs font-semibold tracking-wide whitespace-nowrap px-4 text-slate-300">
      <span className="inline-flex items-center gap-1.5 text-white font-black">
        <span>✨</span>
        <span>FIRST CHAT FREE</span>
      </span>
      <span className="text-[#F5C542]">•</span>
      <span className="inline-flex items-center gap-1.5 text-slate-100 font-bold">
        <span>🌎</span>
        <span>CONNECT WITH VERIFIED READERS &amp; PSYCHICS</span>
      </span>
      <span className="text-[#F5C542]">•</span>
      <span className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
        <span>🔒</span>
        <span>PRIVATE &amp; SECURE</span>
      </span>
      <span className="text-[#F5C542]">•</span>
      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#F5C542] via-[#FFD86B] to-[#F5C542] text-[#070B1F] font-black border border-[#F5C542] shadow-xs hover:brightness-110 transition-all">
        <span>🎁</span>
        <span>CLAIM FREE CHAT</span>
      </span>
      <span className="text-[#F5C542]">•</span>
    </div>
  );

  return (
    <aside
      aria-label="Announcement ticker"
      className="w-full h-8 bg-gradient-to-r from-[#060A1C] via-[#0B153D] to-[#060A1C] border-b border-[#F5C542]/20 flex items-center overflow-hidden select-none cursor-pointer"
      onClick={onClaimOffer}
      title="Click to claim your first 5 free minutes"
    >
      <div className="relative w-full overflow-hidden flex items-center">
        <div className="animate-marquee-ltr flex items-center">
          {tickerItems}
          {tickerItems}
          {tickerItems}
          {tickerItems}
        </div>
      </div>
    </aside>
  );
};
