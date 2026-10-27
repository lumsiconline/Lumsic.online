import React, { useState } from 'react';
import { Sparkles, RefreshCw, Heart, Briefcase, HelpCircle, ShieldCheck } from 'lucide-react';

interface TarotCard {
  id: string;
  name: string;
  arcana: 'Major' | 'Minor';
  glyph: string;
  keywords: string[];
  meaning: string;
  love: string;
  career: string;
  reflectionPrompt: string;
  yesNo: 'Yes' | 'No' | 'Maybe';
}

const TAROT_DECK: TarotCard[] = [
  {
    id: 'the-star',
    name: 'XVII · The Star',
    arcana: 'Major',
    glyph: '⭐',
    keywords: ['Hope', 'Inspiration', 'Serenity', 'Spiritual Grace'],
    meaning: 'The Star brings renewed faith and emotional healing following profound transformation. Clear, quiet light guides your genuine purpose.',
    love: 'Authentic vulnerability and mutual trust dissolve lingering defenses. Emotional transparency reigns.',
    career: 'Visionary ideas receive supportive recognition. Trust your long-range creative convictions.',
    reflectionPrompt: 'What authentic dream are you now ready to nurture with quiet, unwavering faith?',
    yesNo: 'Yes'
  },
  {
    id: 'the-magician',
    name: 'I · The Magician',
    arcana: 'Major',
    glyph: '🪄',
    keywords: ['Manifestation', 'Resourcefulness', 'Willpower', 'Skill'],
    meaning: 'As above, so below. You possess every vital tool required to translate abstract vision into tangible reality.',
    love: 'Direct, clear communication sparks meaningful attraction. Channel intention into proactive care.',
    career: 'Initiate new ventures with decisive authority. Your creative craft is at a peak of execution.',
    reflectionPrompt: 'Which dormant talent in your life is waiting for intentional practice today?',
    yesNo: 'Yes'
  },
  {
    id: 'the-high-priestess',
    name: 'II · The High Priestess',
    arcana: 'Major',
    glyph: '🌙',
    keywords: ['Intuition', 'Sacred Knowledge', 'Subconscious', 'Mystery'],
    meaning: 'She sits between the pillars of light and shadow, reminding you that silence holds deeper answers than external noise.',
    love: 'Look beyond surface words; listen to unspoken energetic currents and subtle emotional cues.',
    career: 'Patience and strategic observation yield profound advantages over hurried action.',
    reflectionPrompt: 'What is your quiet inner instinct whispering that your conscious mind has overlooked?',
    yesNo: 'Maybe'
  },
  {
    id: 'the-sun',
    name: 'XIX · The Sun',
    arcana: 'Major',
    glyph: '☀️',
    keywords: ['Vitality', 'Joy', 'Clarity', 'Success'],
    meaning: 'Unclouded radiance illuminates your current path. Warmth, optimism, and sovereign self-expression blossom.',
    love: 'Playful affection and transparent joy strengthen partnership. A time of shared celebration.',
    career: 'High visibility and creative acclaim crown your efforts. Projects advance with radiant ease.',
    reflectionPrompt: 'How can you embody pure, unapologetic warmth for yourself and your community today?',
    yesNo: 'Yes'
  },
  {
    id: 'the-hermit',
    name: 'IX · The Hermit',
    arcana: 'Major',
    glyph: '🏮',
    keywords: ['Introspection', 'Solitude', 'Inner Light', 'Guidance'],
    meaning: 'The Hermit carries his lantern not to illuminate the entire forest, but only the next immediate, conscious step.',
    love: 'Take moments of reflective solitude to reconnect with your self-worth before engaging external bonds.',
    career: 'Deep contemplation and independent research solve foundational structural hurdles.',
    reflectionPrompt: 'Where in your life do you need to withdraw from external noise to find inner truth?',
    yesNo: 'Maybe'
  },
  {
    id: 'the-empress',
    name: 'III · The Empress',
    arcana: 'Major',
    glyph: '🌿',
    keywords: ['Fertility', 'Nurturance', 'Abundance', 'Sensory Grace'],
    meaning: 'The archetype of generative beauty and creative abundance. Honour the natural rhythms of gestation and growth.',
    love: 'Sensual warmth and deep emotional nourishment create a safe, blooming relational sanctuary.',
    career: 'Ideas planted in fertile ground begin to bear generous, aesthetic fruit. Cultivate with care.',
    reflectionPrompt: 'What creative endeavor or relationship are you ready to nourish unconditionally?',
    yesNo: 'Yes'
  }
];

export const TarotSection: React.FC = () => {
  const [spreadMode, setSpreadMode] = useState<'one' | 'three' | 'yesNo' | 'love' | 'career'>('one');
  const [revealed, setRevealed] = useState<boolean>(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [threeCardDeck, setThreeCardDeck] = useState<TarotCard[]>([]);

  const currentCard = TAROT_DECK[activeCardIndex];

  const handleReveal = () => {
    if (!revealed) {
      const randIdx = Math.floor(Math.random() * TAROT_DECK.length);
      setActiveCardIndex(randIdx);

      // Generate 3 random cards for Three-Card spread
      const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
      setThreeCardDeck(shuffled.slice(0, 3));

      setRevealed(true);
    } else {
      setRevealed(false);
      setTimeout(() => {
        const randIdx = Math.floor(Math.random() * TAROT_DECK.length);
        setActiveCardIndex(randIdx);
        setRevealed(true);
      }, 250);
    }
  };

  return (
    <section id="tarot" className="py-20 bg-[#070A18] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Specification 13) */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#E7C878] block mb-2">
            Divinatory Reflection & Archetypes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Your Card for Today
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            Draw from the archetypal deck for daily contemplative insights, symbolic self-inquiry, and relational reflections.
          </p>
        </div>

        {/* Spread Modes Tabs (Specification 13) */}
        <div className="flex justify-center gap-1.5 p-1 bg-[#11162B] border border-[#252A42] rounded-xl max-w-md mx-auto mb-10 overflow-x-auto">
          {[
            { id: 'one', label: 'One Card Tarot' },
            { id: 'three', label: 'Three Card Tarot' },
            { id: 'yesNo', label: 'Yes / No Tarot' },
            { id: 'love', label: 'Love Tarot' },
            { id: 'career', label: 'Career Tarot' },
          ].map((tab) => {
            const isLove = tab.id === 'love';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSpreadMode(tab.id as any);
                  setRevealed(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  spreadMode === tab.id 
                    ? isLove
                      ? 'bg-[#EBC8CC] text-[#7A5C9E] font-bold shadow-xs'
                      : 'bg-[#7A5C9E] text-[#FBF9F6]' 
                    : isLove
                    ? 'text-[#7A5C9E] bg-[#EBC8CC]/40 border border-[#EBC8CC]'
                    : 'text-[#7A5C9E] hover:text-[#7A5C9E]/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Tarot Interactive Experience */}
        {spreadMode !== 'three' ? (
          <div className="max-w-2xl mx-auto cosmic-card rounded-2xl p-6 sm:p-10 text-center">
            
            {/* The Tarot Card Visual with 3D Flip */}
            <div className="relative w-48 h-72 sm:w-56 sm:h-80 mx-auto mb-8 perspective-1000">
              <div 
                className={`w-full h-full rounded-2xl border-2 transition-transform duration-500 shadow-2xl flex flex-col items-center justify-between p-6 ${
                  revealed 
                    ? 'bg-[#11162B] border-[#E7C878] rotate-y-0' 
                    : 'bg-[#0D1026] border-[#252A42] hover:border-[#7C5CFF]/60 cursor-pointer'
                }`}
                onClick={handleReveal}
              >
                {!revealed ? (
                  // Face-Down Card Back
                  <div className="w-full h-full border border-[#252A42] rounded-xl flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#11162B] to-[#070A18]">
                    <div className="w-16 h-16 rounded-full border border-[#7C5CFF]/40 flex items-center justify-center text-xl text-[#E7C878] mb-3">
                      ✦
                    </div>
                    <span className="text-xs uppercase tracking-widest text-[#A8ADC2] font-semibold">
                      LUMSIC DECK
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1">Tap to Reveal</span>
                  </div>
                ) : (
                  // Face-Up Revealed Card
                  <div className="w-full h-full flex flex-col items-center justify-between">
                    <div className="text-xs font-mono tracking-widest uppercase text-[#E7C878]">
                      {currentCard.arcana} Arcana
                    </div>
                    <div className="text-5xl my-auto transform transition-transform hover:scale-110">
                      {currentCard.glyph}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-wide">{currentCard.name}</h4>
                      <div className="flex justify-center gap-1 mt-1 text-[10px] text-[#A8ADC2]">
                        {currentCard.keywords.slice(0, 2).join(' · ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button: Reveal Card */}
            <div className="mb-8">
              <button
                type="button"
                onClick={handleReveal}
                className="px-8 py-3 rounded-xl bg-[#7C5CFF] hover:bg-[#6A47FF] text-white font-semibold text-sm shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${revealed ? '' : 'animate-spin'}`} />
                <span>{revealed ? 'Draw Another Card' : 'Reveal Card'}</span>
              </button>
            </div>

            {/* Revealed Meaning Interpretations */}
            {revealed && (
              <div className="text-left space-y-4 pt-6 border-t border-[#252A42] animate-in fade-in duration-200">
                
                {spreadMode === 'yesNo' && (
                  <div className="p-3 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-between">
                    <span className="text-xs text-[#A8ADC2]">Yes/No Direct Guidance:</span>
                    <span className={`text-sm font-bold ${currentCard.yesNo === 'Yes' ? 'text-emerald-400' : currentCard.yesNo === 'No' ? 'text-rose-400' : 'text-[#E7C878]'}`}>
                      {currentCard.yesNo}
                    </span>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">General Meaning</h4>
                  <p className="text-xs text-[#A8ADC2] leading-relaxed">{currentCard.meaning}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#EBC8CC]/30 border border-[#EBC8CC]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A5C9E] mb-1">
                      <Heart className="w-3.5 h-3.5 fill-[#EBC8CC] text-[#7A5C9E]" />
                      <span>Love Interpretation</span>
                    </div>
                    <p className="text-[11px] text-[#A8ADC2] leading-relaxed">{currentCard.love}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0D1026] border border-[#252A42]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 mb-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Career & Purpose</span>
                    </div>
                    <p className="text-[11px] text-[#A8ADC2] leading-relaxed">{currentCard.career}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D1026]/60 border border-[#7C5CFF]/30">
                  <div className="text-xs font-bold text-[#E7C878] mb-1">Contemplation Prompt</div>
                  <p className="text-xs text-[#A8ADC2] italic">"{currentCard.reflectionPrompt}"</p>
                </div>

              </div>
            )}

          </div>
        ) : (
          // Three Card Spread (Past, Present, Future)
          <div className="max-w-4xl mx-auto cosmic-card rounded-2xl p-6 sm:p-8 text-center space-y-6">
            <h3 className="text-xl font-bold text-white">Three-Card Spread: Past · Present · Future</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {threeCardDeck.length === 3 ? (
                threeCardDeck.map((card, i) => (
                  <div key={i} className="p-5 rounded-xl bg-[#0D1026] border border-[#252A42] text-left space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#7C5CFF]">
                      {i === 0 ? '1. Past Foundation' : i === 1 ? '2. Present Dynamic' : '3. Emerging Outcome'}
                    </div>
                    <div className="text-3xl">{card.glyph}</div>
                    <div className="text-sm font-bold text-white">{card.name}</div>
                    <p className="text-xs text-[#A8ADC2] leading-relaxed">{card.meaning}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-12 text-[#A8ADC2] text-sm">
                  Click below to shuffle and deal your 3-card spread.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleReveal}
              className="px-6 py-3 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              Deal 3 Cards
            </button>
          </div>
        )}

        {/* Ethical Disclaimer (Specification 13, 33) */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#A8ADC2]/70">
          <ShieldCheck className="w-4 h-4 text-[#7C5CFF]" />
          <span>
            Tarot is practiced as a symbolic mirror for reflective contemplation. It does not claim to predict absolute or unalterable future events.
          </span>
        </div>

      </div>
    </section>
  );
};
