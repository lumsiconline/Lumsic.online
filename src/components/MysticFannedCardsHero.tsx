import React, { useState, useEffect } from 'react';
import { Eye, Moon, Sun, Heart, Briefcase, Compass, Star, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface MysticFannedCardsHeroProps {
  onSelectCard?: (cardId: string) => void;
  onOpenBirthChart?: () => void;
  onOpenTarot?: () => void;
  onOpenCompatibility?: () => void;
}

interface DeckCard {
  id: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  iconSymbol: string;
  cornerSymbol: string;
  secondarySymbol: string;
  desc: string;
  actionLabel: string;
  gradient: string;
  glowColor: string;
  isMainThree: boolean;
}

export const MysticFannedCardsHero: React.FC<MysticFannedCardsHeroProps> = ({
  onOpenBirthChart,
  onOpenTarot,
  onOpenCompatibility
}) => {
  // 5 Physical slots arranged in an arc from LEFT to RIGHT
  // Slot 0 = Far Left, Slot 1 = Mid Left, Slot 2 = CENTER (OPEN), Slot 3 = Mid Right, Slot 4 = Far Right
  const SLOTS = [
    { x: -175, y: 26, rot: -22, scale: 0.82, zIndex: 10, opacity: 0.55, isCenter: false },
    { x: -90,  y: 10, rot: -11, scale: 0.95, zIndex: 25, opacity: 0.85, isCenter: false },
    { x: 0,    y: -18, rot: 0,   scale: 1.16, zIndex: 50, opacity: 1.0,  isCenter: true },
    { x: 90,   y: 10, rot: 11,  scale: 0.95, zIndex: 25, opacity: 0.85, isCenter: false },
    { x: 175,  y: 26, rot: 22,  scale: 0.82, zIndex: 10, opacity: 0.55, isCenter: false },
  ];

  // The Deck Cards in order: 0: Love Life, 1: Career, 2: Life, 3: Palm Reading, 4: Cosmic Tarot
  const DECK: DeckCard[] = [
    {
      id: 'love-life',
      title: 'Love Life',
      tagline: 'Soulmate & Heart',
      icon: Heart,
      iconSymbol: '❤️',
      cornerSymbol: '☾',
      secondarySymbol: '♡',
      desc: 'Discover true soulmate alignment, partner intentions, marriage timing & emotional connection.',
      actionLabel: 'Explore Love Reading',
      gradient: 'from-[#161C42] via-[#20275C] to-[#0E132D]',
      glowColor: 'border-rose-400 shadow-rose-500/25',
      isMainThree: true
    },
    {
      id: 'career',
      title: 'Career',
      tagline: 'Wealth & Growth',
      icon: Briefcase,
      iconSymbol: '💼',
      cornerSymbol: '☼',
      secondarySymbol: '✦',
      desc: 'Clarity on promotions, job transitions, business ventures, wealth cycles & career milestones.',
      actionLabel: 'Explore Career Forecast',
      gradient: 'from-[#14224C] via-[#1D306C] to-[#0D1635]',
      glowColor: 'border-amber-400 shadow-amber-500/25',
      isMainThree: true
    },
    {
      id: 'life',
      title: 'Life',
      tagline: 'Destiny & Purpose',
      icon: Compass,
      iconSymbol: '✦',
      cornerSymbol: '✋',
      secondarySymbol: '👁️',
      desc: 'Unveil your sacred life path, karmic blueprint, spiritual awakening & personal direction.',
      actionLabel: 'Explore Life Guidance',
      gradient: 'from-[#122752] via-[#1A3772] to-[#0C1B3A]',
      glowColor: 'border-cyan-400 shadow-cyan-500/25',
      isMainThree: true
    },
    {
      id: 'palm-reading',
      title: 'Palm Reading',
      tagline: 'Ancient Life Lines',
      icon: Star,
      iconSymbol: '✋',
      cornerSymbol: '✧',
      secondarySymbol: '⭐',
      desc: 'Sacred palmistry insights on health lines, heart vitality, destiny marks & intuitive energy.',
      actionLabel: 'Explore Palmistry',
      gradient: 'from-[#101D44] via-[#172960] to-[#0B1430]',
      glowColor: 'border-amber-300 shadow-amber-400/20',
      isMainThree: false
    },
    {
      id: 'tarot-oracle',
      title: 'Cosmic Tarot',
      tagline: 'Universal Truths',
      icon: Moon,
      iconSymbol: '🎴',
      cornerSymbol: '✦',
      secondarySymbol: '🌙',
      desc: '78 archetypal keys revealing immediate subconscious guidance and fate crossroads.',
      actionLabel: 'Draw Daily Card',
      gradient: 'from-[#131B3E] via-[#1C2556] to-[#0C122C]',
      glowColor: 'border-indigo-400 shadow-indigo-500/20',
      isMainThree: false
    }
  ];

  // Shift offset: increments automatically so cards physically slide left-to-right!
  // At step = 0: Card 0 (Love Life) is at Slot 2 (Center)
  // To move cards LEFT TO RIGHT:
  // When card moves from slot 1 -> slot 2 -> slot 3, position index increases!
  const [step, setStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Automatic Left-to-Right 1x Speed Movement Timer (cycles every 3.2 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      // Increment step so all cards physically glide to the right!
      setStep((prev) => prev + 1);
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Function to move cards left to right manually
  const moveNext = () => {
    setStep((prev) => prev + 1);
  };

  const movePrev = () => {
    setStep((prev) => prev - 1);
  };

  // Jump to specific main card in the center (0 = Love Life, 1 = Career, 2 = Life)
  const jumpToCard = (targetCardIndex: number) => {
    // We want card `targetCardIndex` to end up at Slot 2 (Center):
    // Slot = (i + step) % 5 === 2 => step === (2 - targetCardIndex + 5000) % 5
    const currentSlot = (targetCardIndex + step) % 5;
    const diff = (2 - currentSlot + 5) % 5;
    setStep((prev) => prev + diff);
  };

  // Determine which card is currently in the center slot (slot 2)
  // (cardIndex + step) % 5 === 2 => cardIndex = (2 - (step % 5) + 5) % 5
  const centerCardIndex = ((2 - (step % 5)) + 5) % 5;
  const activeCenterCard = DECK[centerCardIndex];

  const handleCardAction = (card: DeckCard) => {
    if (card.id === 'love-life' && onOpenCompatibility) {
      onOpenCompatibility();
    } else if (card.id === 'career' && onOpenBirthChart) {
      onOpenBirthChart();
    } else if (onOpenTarot) {
      onOpenTarot();
    }
  };

  return (
    <div 
      className="relative w-full max-w-[580px] h-[460px] sm:h-[500px] flex items-center justify-center select-none overflow-visible"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* 1. CENTRAL CELESTIAL GLOWING CRYSTAL ORB */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        {/* Soft Radial Ambient Nebula Glow in Astral Gold & Cyan */}
        <div className="w-[350px] sm:w-[440px] h-[350px] sm:h-[440px] rounded-full bg-gradient-to-tr from-amber-400/20 via-cyan-400/15 to-indigo-500/25 blur-3xl animate-pulse" />

        {/* Concentric Rotating Astrolabe Rings */}
        <div className="absolute w-[330px] sm:w-[400px] h-[330px] sm:h-[400px] rounded-full border border-amber-300/25 border-dashed animate-celestial-orbit pointer-events-none" />
        <div className="absolute w-[250px] sm:w-[310px] h-[250px] sm:h-[310px] rounded-full border border-cyan-400/20 animate-celestial-orbit-reverse pointer-events-none" />

        {/* 3D Glass Crystal Orb (as seen in screenshot behind cards) */}
        <div className="relative w-38 h-38 sm:w-46 sm:h-46 rounded-full bg-gradient-to-b from-[#1C2C64] via-[#0E1738] to-[#060A1A] border-2 border-amber-300/40 shadow-2xl shadow-cyan-500/20 flex items-center justify-center overflow-hidden">
          <div className="absolute top-2 left-6 w-18 h-8 rounded-full bg-white/20 blur-sm transform -rotate-12" />
          
          <div className="relative flex flex-col items-center justify-center text-amber-200">
            <div className="w-12 h-12 rounded-full border border-amber-300/40 flex items-center justify-center bg-amber-400/10 shadow-inner">
              <Eye className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-sm shadow-cyan-300 mt-2" />
          </div>

          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* 2. LEFT / RIGHT SMOOTH GLIDE ARROWS (FOR PHYSICAL MOVEMENT) */}
      <button
        type="button"
        onClick={movePrev}
        className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-[#060A1C]/80 hover:bg-[#0E1538] border border-amber-300/40 text-amber-300 flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
        aria-label="Previous card"
        title="Slide card left"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={moveNext}
        className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-[#060A1C]/80 hover:bg-[#0E1538] border border-amber-300/40 text-amber-300 flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
        aria-label="Next card"
        title="Slide card right"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 3. PHYSICAL 5-CARD SHUFFLING DECK (CONTINUOUSLY GLIDING FROM LEFT TO RIGHT) */}
      <div className="relative z-30 w-full h-full flex items-center justify-center">
        {DECK.map((card, cardIndex) => {
          // Calculate this card's slot in the 5-slot physical arc
          // As step increments, (cardIndex + step) % 5 moves from left to right: 0 -> 1 -> 2 -> 3 -> 4!
          const slotIndex = ((cardIndex + step) % 5 + 5) % 5;
          const slot = SLOTS[slotIndex];
          const isCenter = slot.isCenter;
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (isCenter) {
                  handleCardAction(card);
                } else {
                  jumpToCard(cardIndex);
                }
              }}
              style={{
                transform: `translateX(${slot.x}px) translateY(${slot.y}px) rotate(${slot.rot}deg) scale(${slot.scale})`,
                zIndex: slot.zIndex,
                opacity: slot.opacity,
                transition: 'transform 0.9s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.9s ease-in-out, z-index 0.9s step-end',
              }}
              className={`absolute rounded-3xl cursor-pointer select-none ${
                isCenter 
                  ? 'w-46 sm:w-52 h-70 sm:h-78 shadow-2xl shadow-amber-500/30' 
                  : 'w-36 sm:w-42 h-56 sm:h-64 shadow-xl shadow-black/60'
              }`}
            >
              {/* Card Container with Golden Foil Border */}
              <div
                className={`relative w-full h-full rounded-3xl p-3 bg-gradient-to-b ${card.gradient} border-2 ${
                  isCenter ? 'border-[#F6D06E]' : 'border-amber-400/40 hover:border-amber-300'
                } flex flex-col justify-between overflow-hidden transition-colors`}
              >
                {/* Subtle Inner Gold Filament Border */}
                <div className="absolute inset-1.5 rounded-2xl border border-amber-400/30 pointer-events-none" />

                {/* Golden corner flourishes */}
                <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300" />
                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300" />
                <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300" />
                <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300" />

                {/* Top Card Header */}
                <div className="relative z-10 flex items-center justify-between text-amber-200 text-xs px-1 pt-0.5">
                  <span className="font-serif text-sm text-amber-300 font-bold flex items-center gap-1">
                    <span>{card.iconSymbol}</span>
                    <span className="text-[10px] text-amber-300/80 font-mono tracking-wider uppercase">
                      {isCenter ? 'OPEN' : 'ARC'}
                    </span>
                  </span>
                  <span className="text-[11px] text-amber-300/80 tracking-widest uppercase">
                    {card.secondarySymbol}
                  </span>
                </div>

                {/* Center Content of Card (OPEN when center) */}
                <div className="relative z-10 text-center my-auto px-1 flex flex-col items-center">
                  
                  {/* Glowing Icon Emblem */}
                  <div className={`rounded-full border flex items-center justify-center shadow-lg transition-transform ${
                    isCenter 
                      ? 'w-14 h-14 sm:w-16 sm:h-16 border-2 border-amber-300 bg-amber-400/15 mb-2 shadow-amber-500/25 scale-105' 
                      : 'w-10 h-10 sm:w-12 sm:h-12 border-amber-400/30 bg-white/5 mb-1.5'
                  }`}>
                    <Icon className={`${isCenter ? 'w-7 h-7 sm:w-8 sm:h-8 text-amber-300 animate-pulse' : 'w-5 h-5 text-amber-300/70'}`} />
                  </div>

                  {/* Card Title: Love Life / Career / Life */}
                  <h3 className={`font-serif font-bold text-white tracking-wide leading-tight drop-shadow-sm ${
                    isCenter ? 'text-xl sm:text-2xl mb-0.5' : 'text-sm sm:text-base'
                  }`}>
                    {card.title}
                  </h3>

                  {/* Tagline */}
                  <span className={`font-bold text-amber-300 uppercase tracking-widest ${
                    isCenter ? 'text-[10px] sm:text-[11px] mt-0.5' : 'text-[8px] text-amber-300/70 mt-0.5'
                  }`}>
                    {card.tagline}
                  </span>

                  {/* Subtitle automatically revealed when in center */}
                  {isCenter && (
                    <p className="text-[10px] sm:text-[11px] text-slate-200 leading-snug mt-2 px-1 line-clamp-3 font-sans font-medium animate-in fade-in duration-300">
                      {card.desc}
                    </p>
                  )}
                </div>

                {/* Bottom CTA Button */}
                <div className="relative z-10 text-center pb-1">
                  {isCenter ? (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#070B1E] bg-gradient-to-r from-[#F6D06E] to-[#E5B744] px-4 py-1.5 rounded-full shadow-md hover:brightness-110 transition-all">
                      <span>{card.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-amber-400/40 text-[9px]">
                      <span>✦</span>
                      <span>✦</span>
                      <span>✦</span>
                    </div>
                  )}
                </div>

                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. THREE STEPPER PILLS BELOW DECK TO JUMP TO LOVE LIFE • CAREER • LIFE */}
      <div className="absolute -bottom-3 inset-x-0 flex flex-col items-center justify-center gap-1.5 z-40">
        
        {/* Quick Stepper Pills */}
        <div className="flex items-center gap-2 bg-[#060A1C]/90 p-1 rounded-full border border-amber-300/30 backdrop-blur-md shadow-xl">
          {DECK.slice(0, 3).map((card, idx) => {
            const isCurrentlyCenter = centerCardIndex === idx;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => jumpToCard(idx)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrentlyCenter
                    ? 'bg-gradient-to-r from-[#F6D06E] to-[#E5B744] text-[#070B1E] shadow-sm scale-105 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{card.iconSymbol}</span>
                <span>{card.title}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Motion indicator */}
        <div className="flex items-center gap-2 text-[10px] text-amber-300/75 font-mono tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Cards Automatically Gliding Left → Right (1x Speed)</span>
        </div>

      </div>

    </div>
  );
};
