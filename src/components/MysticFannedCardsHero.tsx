import React, { useState, useEffect } from 'react';
import { Heart, Flame, RefreshCw, Compass, Sparkles, ChevronRight } from 'lucide-react';

interface MysticFannedCardsHeroProps {
  onSelectCard?: (cardId: string) => void;
  onOpenBirthChart?: () => void;
  onOpenTarot?: () => void;
  onOpenCompatibility?: () => void;
  onStartReading?: (topic?: string) => void;
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
  onSelectCard,
  onOpenBirthChart,
  onOpenTarot,
  onOpenCompatibility,
  onStartReading
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

  // Exactly 5 Love & Destiny Deck Cards
  const DECK: DeckCard[] = [
    {
      id: 'love-destiny',
      title: 'LOVE DESTINY',
      tagline: 'LOVE & RELATIONSHIPS',
      icon: Heart,
      iconSymbol: '❤️',
      cornerSymbol: '☾',
      secondarySymbol: '♡',
      desc: "Will you find the love you've been waiting for?",
      actionLabel: 'Explore Love Reading',
      gradient: 'from-[#161C42] via-[#20275C] to-[#0E132D]',
      glowColor: 'border-rose-400 shadow-rose-500/25',
      isMainThree: true
    },
    {
      id: 'breakup-healing',
      title: 'BREAKUP & HEALING',
      tagline: 'HEARTBREAK JOURNEY',
      icon: Flame,
      iconSymbol: '💔',
      cornerSymbol: '☼',
      secondarySymbol: '✧',
      desc: 'Is this chapter really over, or is another beginning possible?',
      actionLabel: 'Explore Breakup Reading',
      gradient: 'from-[#172049] via-[#222E64] to-[#0F1634]',
      glowColor: 'border-amber-400 shadow-amber-500/25',
      isMainThree: true
    },
    {
      id: 'ex-reunion',
      title: 'EX & REUNION',
      tagline: 'PAST LOVE CONNECTION',
      icon: RefreshCw,
      iconSymbol: '🔄',
      cornerSymbol: '✦',
      secondarySymbol: '∞',
      desc: 'Will your ex come back into your life?',
      actionLabel: 'Explore Reunion',
      gradient: 'from-[#14234E] via-[#1D326E] to-[#0D1737]',
      glowColor: 'border-cyan-400 shadow-cyan-500/25',
      isMainThree: true
    },
    {
      id: 'future-meeting',
      title: 'FUTURE MEETING',
      tagline: 'YOUR NEXT CONNECTION',
      icon: Compass,
      iconSymbol: '✨',
      cornerSymbol: '✧',
      secondarySymbol: '⭐',
      desc: 'When will you meet someone special?',
      actionLabel: 'Explore Future Meeting',
      gradient: 'from-[#122855] via-[#1A3876] to-[#0C1B3C]',
      glowColor: 'border-amber-300 shadow-amber-400/20',
      isMainThree: true
    },
    {
      id: 'soulmate-connection',
      title: 'SOULMATE CONNECTION',
      tagline: 'DESTINED LOVE',
      icon: Sparkles,
      iconSymbol: '🔮',
      cornerSymbol: '✦',
      secondarySymbol: '🌙',
      desc: 'Who is your soulmate, and when might you meet?',
      actionLabel: 'Explore Soulmate Reading',
      gradient: 'from-[#161B40] via-[#212759] to-[#0E122B]',
      glowColor: 'border-indigo-400 shadow-indigo-500/20',
      isMainThree: true
    }
  ];

  // Shift offset: increments automatically so cards physically slide left-to-right!
  // At step = 0: Card 0 (LOVE DESTINY) is at Slot 2 (Center)
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

  // Jump to specific card in the center (0 to 4)
  const jumpToCard = (targetCardIndex: number) => {
    const currentSlot = (targetCardIndex + step) % 5;
    const diff = (2 - currentSlot + 5) % 5;
    setStep((prev) => prev + diff);
  };

  const handleCardAction = (card: DeckCard) => {
    if (onStartReading) {
      onStartReading(card.title);
    } else if (onSelectCard) {
      onSelectCard(card.id);
    } else if (onOpenCompatibility) {
      onOpenCompatibility();
    } else if (onOpenTarot) {
      onOpenTarot();
    } else if (onOpenBirthChart) {
      onOpenBirthChart();
    }
  };

  return (
    <div 
      className="relative w-full max-w-[580px] h-[460px] sm:h-[500px] flex items-center justify-center select-none overflow-visible"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* 5-CARD SHUFFLING DECK (CONTINUOUSLY GLIDING FROM LEFT TO RIGHT) */}
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

    </div>
  );
};
