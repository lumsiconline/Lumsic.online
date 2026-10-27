import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';

const TAROT_DECK = [
  {
    name: 'The Star',
    arcana: 'Major Arcana XVII',
    meaning: 'Renewed hope, divine inspiration, serenity, and spiritual guidance after the storm.',
    advice: 'Trust the quiet whispers of faith; your highest path is illuminating effortlessly before you.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'The Lovers',
    arcana: 'Major Arcana VI',
    meaning: 'Sacred soul connection, harmonious alignment, values in sync, and heartfelt choices.',
    advice: 'Lead with open vulnerability and choose alignment with your authentic heart.',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'The Sun',
    arcana: 'Major Arcana XIX',
    meaning: 'Radiant vitality, celebratory breakthrough, clarity, joy, and warmth.',
    advice: 'Step boldly into the solar light; your authenticity disarms all obstacles.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'The High Priestess',
    arcana: 'Major Arcana II',
    meaning: 'Intuition, sacred mysteries, subconscious wisdom, and dreams.',
    advice: 'Do not seek answers externally today; sit in silence and listen to your inner sanctum.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'The Empress',
    arcana: 'Major Arcana III',
    meaning: 'Fertility, abundance, creative nurturing, sensual grace, and material flourishing.',
    advice: 'Nurture your creations with unhurried devotion; harvest is ripening.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wheel of Fortune',
    arcana: 'Major Arcana X',
    meaning: 'Karmic turning point, serendipity, positive destiny, cycles of ascension.',
    advice: 'Surrender control over the winds and align with cosmic synchronicity.',
    image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=600&q=80'
  }
];

interface DailyTarotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyTarotModal: React.FC<DailyTarotModalProps> = ({ isOpen, onClose }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const currentCard = TAROT_DECK[cardIndex];

  const handleDrawNew = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % TAROT_DECK.length);
      setIsFlipped(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#140726] border border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Top-Left Back Arrow Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 px-2.5 py-1.5 rounded-full bg-[#200f38] text-[#f5e7a9] hover:text-[#faf7f2] hover:bg-[#2e154f] border border-[#d4af37]/35 transition-all text-xs font-semibold flex items-center gap-1 active:scale-95 cursor-pointer shadow-md"
          title="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Back</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#200f38] text-[#bda5db] hover:text-[#faf7f2] hover:bg-[#2e154f] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Daily Divination</span>
        </div>

        <h3 className="font-serif text-2xl font-semibold text-[#faf7f2] mb-1">
          Your Card of the Day
        </h3>
        <p className="text-xs text-[#bda5db] mb-6">
          A consecrated single-card pull for immediate spiritual guidance
        </p>

        {/* Tarot Card Display */}
        <div className="relative w-48 h-72 mx-auto rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.3)] mb-6 bg-[#210c3b] group">
          <img
            src={currentCard.image}
            alt={currentCard.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140726] via-transparent to-black/30" />
          
          <div className="absolute bottom-3 left-3 right-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-mono">
              {currentCard.arcana}
            </span>
            <h4 className="font-serif text-xl font-bold text-[#faf7f2]">
              {currentCard.name}
            </h4>
          </div>
        </div>

        {/* Card Interpretation */}
        <div className="p-4 rounded-2xl bg-[#1b0a33] border border-[#2c184d] text-left space-y-2 mb-6 text-xs">
          <div>
            <span className="font-bold text-[#f5e7a9]">Divine Essence: </span>
            <span className="text-[#faf7f2]/90">{currentCard.meaning}</span>
          </div>
          <div>
            <span className="font-bold text-[#d4af37]">Action Guidance: </span>
            <span className="text-[#bda5db]">{currentCard.advice}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDrawNew}
            className="flex-1 py-2.5 rounded-xl border border-[#d4af37]/50 bg-[#1e0d38] text-xs font-semibold text-[#faf7f2] hover:bg-[#2c1352] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Draw Another Card</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5e7a9] text-[#0b0514] text-xs font-bold shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            Reflect &amp; Continue
          </button>
        </div>

      </div>
    </div>
  );
};
