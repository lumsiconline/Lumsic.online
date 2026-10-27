import React, { useState } from 'react';
import { Sparkles, Heart, Briefcase, Zap, ChevronRight, ShieldCheck } from 'lucide-react';

interface ZodiacForecast {
  id: string;
  name: string;
  symbol: string;
  dates: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  rulingPlanet: string;
  general: string;
  love: string;
  career: string;
  energyScore: number;
}

const ZODIAC_FORECASTS: ZodiacForecast[] = [
  {
    id: 'aries',
    name: 'Aries',
    symbol: '♈',
    dates: 'Mar 21 - Apr 19',
    element: 'Fire',
    rulingPlanet: 'Mars',
    general: 'A wave of decisive initiative surrounds your thoughts today. Focus on completing independent projects before branching out.',
    love: 'Open dialogues foster unexpected intimacy. Share your authentic ambitions with clarity.',
    career: 'Strategic momentum favors proactive propositions. Trust your intuitive instincts.',
    energyScore: 88
  },
  {
    id: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    dates: 'Apr 20 - May 20',
    element: 'Earth',
    rulingPlanet: 'Venus',
    general: 'A steady, grounding presence allows you to discern what truly brings lasting comfort and value into your daily sphere.',
    love: 'Quiet acts of devotion speak louder than grand gestures. Relish shared serenity.',
    career: 'Financial and resource evaluations yield practical breakthroughs. Patience proves lucrative.',
    energyScore: 82
  },
  {
    id: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    dates: 'May 21 - Jun 20',
    element: 'Air',
    rulingPlanet: 'Mercury',
    general: 'Curiosity is your compass today. Meaningful synchronicities arise through quick conversations and spontaneous research.',
    love: 'Playful wit brings spark back into connections. Listen as intently as you express.',
    career: 'Multiple threads demand attention; prioritize clear synthesis over frantic multitasking.',
    energyScore: 92
  },
  {
    id: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    dates: 'Jun 21 - Jul 22',
    element: 'Water',
    rulingPlanet: 'Moon',
    general: 'Intuitive tides run deep today. Create sacred sanctuary at home to process emotional insights with clarity.',
    love: 'Vulnerability strengthens relational bonds. Honour your emotional boundaries with gentle grace.',
    career: 'Colleagues appreciate your empathetic guidance. Lead by supporting the collective foundation.',
    energyScore: 78
  },
  {
    id: 'leo',
    name: 'Leo',
    symbol: '♌',
    dates: 'Jul 23 - Aug 22',
    element: 'Fire',
    rulingPlanet: 'Sun',
    general: 'Your natural creative vitality shines effortlessly. Use your warmth to inspire those navigating moments of uncertainty.',
    love: 'Generous affection warms your romantic sphere. Plan an intentional creative experience together.',
    career: 'Visibility is heightened; present your visions with sovereign confidence and humility.',
    energyScore: 94
  },
  {
    id: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    dates: 'Aug 23 - Sep 22',
    element: 'Earth',
    rulingPlanet: 'Mercury',
    general: 'Discernment and fine-tuned precision allow you to solve complex puzzles that others have overlooked.',
    love: 'Practical support is your love language today. Small gestures of thoughtfulness resonate deeply.',
    career: 'System refinements and editorial polish ensure your work stands out with unquestioned quality.',
    energyScore: 85
  },
  {
    id: 'libra',
    name: 'Libra',
    symbol: '♎',
    dates: 'Sep 23 - Oct 22',
    element: 'Air',
    rulingPlanet: 'Venus',
    general: 'Harmonious balance returns as recent tensions dissolve. Your diplomatic grace bridges gaps in community conversations.',
    love: 'Reciprocity is essential; ensure your needs are met with the same dedication you offer others.',
    career: 'Collaborative negotiations reach favorable consensus. Focus on aesthetic and ethical coherence.',
    energyScore: 86
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    dates: 'Oct 23 - Nov 21',
    element: 'Water',
    rulingPlanet: 'Pluto',
    general: 'Profound focus enables psychological breakthroughs. Trust your instincts to reveal core truths beneath surface appearances.',
    love: 'Deep soul-level conversations reveal shared evolutions. Release past protective armor.',
    career: 'Confidential research and strategic positioning yield silent, decisive advantages.',
    energyScore: 90
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    dates: 'Nov 22 - Dec 21',
    element: 'Fire',
    rulingPlanet: 'Jupiter',
    general: 'Expansive horizons beckon. Philosophical inquiries and distant connections spark enthusiasm for your next great journey.',
    love: 'Shared adventures and intellectual exploration keep romance vibrant and free-spirited.',
    career: 'Think globally; an unconventional perspective introduces fresh solutions to ongoing roadblocks.',
    energyScore: 91
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    dates: 'Dec 22 - Jan 19',
    element: 'Earth',
    rulingPlanet: 'Saturn',
    general: 'Disciplined focus yields tangible milestones. Your steady pace guarantees longevity where hurried ventures falter.',
    love: 'Reliability and mutual respect anchor romantic ties. Celebrate shared achievements together.',
    career: 'Long-range structural goals gain measurable traction. Authority figures recognize your stewardship.',
    energyScore: 87
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    dates: 'Jan 20 - Feb 18',
    element: 'Air',
    rulingPlanet: 'Uranus',
    general: 'Visionary ideals inspire collaborative alliances. Connect with like-minded collectives working towards progressive renewal.',
    love: 'Spiritual friendship forms the bedrock of love. Celebrate each other’s unique eccentricities.',
    career: 'Technological innovations and unconventional methodologies set your contributions apart.',
    energyScore: 89
  },
  {
    id: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    dates: 'Feb 19 - Mar 20',
    element: 'Water',
    rulingPlanet: 'Neptune',
    general: 'Mystical receptivity and creative imagination flow freely. Honour dream symbols and subtle serendipities throughout your day.',
    love: 'Soulful empathy dissolves misunderstandings. A poetic gesture touches hearts profoundly.',
    career: 'Intuitive problem solving bypasses rigid roadblocks. Channel inspiration into artistic tangible form.',
    energyScore: 84
  }
];

export const TodayHoroscopeSection: React.FC = () => {
  const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const selectedSign = ZODIAC_FORECASTS.find(s => s.id === selectedSignId) || ZODIAC_FORECASTS[0];

  return (
    <section id="horoscope" className="py-20 bg-[#070A18] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#7C5CFF] block mb-2">
            Celestial Forecast
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Today's Horoscope
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            Your cosmic forecast for today. Select your sign to discover your current planetary influences.
          </p>
        </div>

        {/* 12 Zodiac Signs Row (Horizontal scrolling on mobile per Specification 10) */}
        <div className="flex sm:grid sm:grid-cols-6 lg:grid-cols-12 gap-2 overflow-x-auto pb-4 sm:pb-0 scrollbar-none mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
          {ZODIAC_FORECASTS.map((sign) => {
            const isSelected = sign.id === selectedSignId;
            return (
              <button
                key={sign.id}
                type="button"
                onClick={() => setSelectedSignId(sign.id)}
                className={`flex-shrink-0 w-24 sm:w-auto p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#11162B] border-[#7C5CFF] shadow-lg shadow-[#7C5CFF]/15 text-white' 
                    : 'bg-[#0D1026] border-[#252A42] text-[#A8ADC2] hover:border-[#7C5CFF]/40 hover:text-white'
                }`}
              >
                <div className={`text-2xl mb-1 ${isSelected ? 'text-[#E7C878]' : 'text-[#A8ADC2]'}`}>
                  {sign.symbol}
                </div>
                <div className="text-xs font-semibold tracking-wide truncate">
                  {sign.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Interactive Horoscope Card for Selected Sign */}
        <div className="cosmic-card rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#252A42] gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0D1026] border border-[#7C5CFF]/30 flex items-center justify-center text-3xl text-[#E7C878]">
                {selectedSign.symbol}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">{selectedSign.name}</h3>
                  <span className="text-xs font-medium text-[#7C5CFF] bg-[#7C5CFF]/10 px-2 py-0.5 rounded-full">
                    {selectedSign.element} Element
                  </span>
                </div>
                <p className="text-xs text-[#A8ADC2] mt-0.5">
                  {selectedSign.dates} · Ruled by {selectedSign.rulingPlanet}
                </p>
              </div>
            </div>

            {/* Vitality score */}
            <div className="flex items-center gap-2 bg-[#0D1026] border border-[#252A42] px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
              <Zap className="w-4 h-4 text-[#E7C878]" />
              <div className="text-xs text-[#A8ADC2]">
                Vitality: <span className="font-bold text-white">{selectedSign.energyScore}%</span>
              </div>
            </div>
          </div>

          {/* Forecast Grid: General, Love, Career */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            <div className="p-4 rounded-xl bg-[#0D1026]/70 border border-[#252A42]/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E7C878]" />
                <span>General</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A8ADC2] leading-relaxed">
                {selectedSign.general}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1026]/70 border border-[#252A42]/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Love & Connection</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A8ADC2] leading-relaxed">
                {selectedSign.love}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1026]/70 border border-[#252A42]/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                <span>Career & Ambition</span>
              </div>
              <p className="text-xs sm:text-sm text-[#A8ADC2] leading-relaxed">
                {selectedSign.career}
              </p>
            </div>

          </div>

          {/* Ethical Trust Disclaimer (Specification 10, 33) */}
          <div className="flex items-center gap-2 text-[11px] text-[#A8ADC2]/70 pt-4 border-t border-[#252A42]/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0" />
            <span>
              Horoscope interpretations are reflective guides for self-discovery and personal reflection, not guaranteed outcomes or medical/financial advice.
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
