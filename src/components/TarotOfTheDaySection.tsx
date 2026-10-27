import React, { useState } from 'react';
import { Star, Sparkles, RefreshCw, Moon, ArrowRight, Layers } from 'lucide-react';

interface TarotCard {
  name: string;
  arcana: 'Major' | 'Minor';
  element: string;
  upright: string;
  reversed: string;
  advice: string;
  affirmation: string;
}

const DECK: TarotCard[] = [
  {
    name: 'The Fool (0)',
    arcana: 'Major',
    element: 'Air',
    upright: 'Innocence, fresh beginnings, leap of faith, boundless possibilities.',
    reversed: 'Recklessness, fear of the unknown, holding back from a vital step.',
    advice: 'Step forward boldly without the baggage of past disappointments. The universe will support your faith.',
    affirmation: 'I trust the sacred unknown and embrace new cosmic adventures.'
  },
  {
    name: 'The Magician (I)',
    arcana: 'Major',
    element: 'Mercury',
    upright: 'Manifestation, creative mastery, inspired action, sacred alignment.',
    reversed: 'Scattered energy, illusions, untapped potential, delay in focus.',
    advice: 'All four elemental tools are already on your altar. Channel your willpower with singular clarity.',
    affirmation: 'As above, so below; I have everything required to create my reality.'
  },
  {
    name: 'The High Priestess (II)',
    arcana: 'Major',
    element: 'Moon / Water',
    upright: 'Intuition, sacred secrets, dream wisdom, divine feminine knowing.',
    reversed: 'Ignoring gut instincts, surface superficiality, repressed emotions.',
    advice: 'Silence external chatter. The answer is already whispering within your heart center.',
    affirmation: 'I honor my intuition and trust the stillness of my sacred inner temple.'
  },
  {
    name: 'The Empress (III)',
    arcana: 'Major',
    element: 'Venus / Earth',
    upright: 'Abundance, sensual luxury, fertility, nurturing warmth, creation.',
    reversed: 'Creative block, exhaustion, over-giving, disconnect from nature.',
    advice: 'Nurture yourself and your creative projects with gentle, patient devotion. Abundance is your birthright.',
    affirmation: 'I am radiant, fertile with divine ideas, and open to unconditional love.'
  },
  {
    name: 'The Star (XVII)',
    arcana: 'Major',
    element: 'Aquarius / Air',
    upright: 'Hope, inspired healing, serene restoration, spiritual faith.',
    reversed: 'Disillusionment, despair, impatience with spiritual timing.',
    advice: 'Pour your waters freely upon the earth. A deep healing cycle has arrived to replenish your spirit.',
    affirmation: 'I am guided by the sacred light of the cosmic stars.'
  },
  {
    name: 'The Sun (XIX)',
    arcana: 'Major',
    element: 'Sun / Fire',
    upright: 'Radiant success, vitality, joyful celebration, authentic truth.',
    reversed: 'Temporary clouds, delayed celebration, dimmed optimism.',
    advice: 'Step into the center of your light without modesty. Share your authentic warmth with the world.',
    affirmation: 'I shine with solar vitality, clarity, and unshakeable joy.'
  }
];

export const TarotOfTheDaySection: React.FC = () => {
  const [spreadMode, setSpreadMode] = useState<'single' | 'three'>('single');
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDraw = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (spreadMode === 'single') {
        const card = DECK[Math.floor(Math.random() * DECK.length)];
        setDrawnCards([card]);
      } else {
        const shuffled = [...DECK].sort(() => 0.5 - Math.random());
        setDrawnCards(shuffled.slice(0, 3));
      }
      setIsFlipped(true);
    }, 200);
  };

  return (
    <section id="tarot" className="py-12 sm:py-16 md:py-20 bg-[#0b0416] relative border-b border-[#2c184d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Consecrated Virtual Card Deck</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
              Tarot of the Day
            </h2>
            <p className="text-sm md:text-base text-[#bda5db] mt-2 max-w-2xl font-light">
              Receive your morning divine guidance or draw a 3-card Past / Present / Future spread.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-[#17082e] p-1 rounded-2xl border border-[#33165b] self-start sm:self-auto">
            <button
              onClick={() => { setSpreadMode('single'); setDrawnCards([]); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                spreadMode === 'single' ? 'bg-[#d4af37] text-[#0b0514] font-bold shadow' : 'text-[#bda5db] hover:text-[#faf7f2]'
              }`}
            >
              1 Card Daily
            </button>
            <button
              onClick={() => { setSpreadMode('three'); setDrawnCards([]); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                spreadMode === 'three' ? 'bg-[#d4af37] text-[#0b0514] font-bold shadow' : 'text-[#bda5db] hover:text-[#faf7f2]'
              }`}
            >
              3-Card Spread
            </button>
          </div>
        </div>

        {/* Card Interaction Arena */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#140628] border border-[#2d144f] shadow-2xl flex flex-col items-center text-center space-y-6">
          
          {drawnCards.length === 0 ? (
            <div className="space-y-4 py-8">
              <div className="w-24 h-36 mx-auto rounded-2xl bg-[#1d0b38] border-2 border-dashed border-[#d4af37]/50 flex items-center justify-center shadow-lg">
                <Moon className="w-8 h-8 text-[#d4af37]/60 animate-pulse" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#faf7f2]">
                {spreadMode === 'single' ? 'Draw Your Daily Whispering Card' : 'Draw Your 3-Card Timeline Spread'}
              </h3>
              <p className="text-xs sm:text-sm text-[#bda5db] max-w-md mx-auto">
                Breathe deeply, focus on your question or today’s energy, and click below to reveal the card.
              </p>
              <button
                type="button"
                onClick={handleDraw}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5e7a9] to-[#d4af37] text-[#0b0514] font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all cursor-pointer active:scale-95"
              >
                Draw Consecrated Card
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className={`grid gap-4 ${spreadMode === 'single' ? 'max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
                {drawnCards.map((card, idx) => {
                  const labels = ['Past Influences', 'Present Energy', 'Ripening Outcome'];
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#1d0b3b] border border-[#d4af37]/50 shadow-xl text-left space-y-3 animate-in zoom-in-95 duration-200"
                    >
                      <div className="flex items-center justify-between border-b border-[#3b1c6b] pb-2">
                        <span className="text-[11px] font-mono text-[#d4af37] uppercase font-bold">
                          {spreadMode === 'three' ? labels[idx] : 'Card of the Day'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a1050] text-[#f5e7a9]">
                          {card.arcana} Arcana
                        </span>
                      </div>

                      <h4 className="font-serif text-xl font-bold text-[#faf7f2]">
                        {card.name}
                      </h4>

                      <p className="text-xs text-[#d8c7ed] leading-relaxed">
                        <strong className="text-[#f5e7a9]">Upright Meaning:</strong> {card.upright}
                      </p>

                      <div className="p-3 rounded-xl bg-[#140628] border border-[#2f1454] text-xs text-[#bda5db] space-y-1">
                        <span className="text-[#d4af37] font-semibold block text-[10px] uppercase font-mono">Cosmic Advice</span>
                        <p>{card.advice}</p>
                      </div>

                      <p className="text-[11px] italic text-[#f5e7a9]/90 border-t border-[#311756] pt-2">
                        &quot;{card.affirmation}&quot;
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleDraw}
                className="px-4 py-2 rounded-xl bg-[#1e0d38] hover:bg-[#2b124e] border border-[#d4af37]/40 text-xs font-semibold text-[#f5e7a9] flex items-center gap-1.5 mx-auto cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Draw Again</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
