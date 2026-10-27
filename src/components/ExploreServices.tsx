import React, { useState, useRef } from 'react';
import { 
  Compass, Moon, Sparkles, BookOpen, Layers, ArrowRight, 
  Heart, Star, Play, Pause, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

interface ExploreServicesProps {
  onSelectService: (serviceId: string) => void;
}

export const ExploreServices: React.FC<ExploreServicesProps> = ({ onSelectService }) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<'1x' | '0.5x' | '1.5x'>('1x');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      id: 'vedic-astrology',
      number: '01',
      title: 'Vedic Wisdom',
      system: 'Sidereal Jyotish',
      category: 'Ancient Wisdom',
      desc: 'The ancient Indian system decoding your Janam Kundli, planetary Dasha cycles, Nakshatras, and Dosha remedies.',
      icon: Sparkles,
      iconColor: '#D97706',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
      borderGlow: 'hover:border-amber-400 hover:shadow-amber-500/15',
      highlights: ['Janam Kundli Reading', 'Vimshottari Dasha', 'Nakshatra Analysis', 'Manglik & Sade Sati'],
      actionText: 'Explore Vedic Wisdom'
    },
    {
      id: 'western-astrology',
      number: '02',
      title: 'Western Zodiac',
      system: 'Tropical Zodiac',
      category: 'Psychological',
      desc: 'Psychological and Hellenistic cosmic mapping of your psychological archetype, transit aspects, and solar returns.',
      icon: Compass,
      iconColor: '#6366F1',
      badgeBg: '#EEF2FF',
      badgeText: '#3730A3',
      borderGlow: 'hover:border-indigo-400 hover:shadow-indigo-500/15',
      highlights: ['Natal Chart Analysis', 'Synastry & Chemistry', 'Planetary Transits', 'Progressed Charts'],
      actionText: 'Explore Western Zodiac'
    },
    {
      id: 'tarot',
      number: '03',
      title: 'Tarot Reading',
      system: 'Sacred Archetypes',
      category: 'Divination',
      desc: '78 sacred cards revealing hidden currents, crossroads, partner intentions, and upcoming milestones.',
      icon: BookOpen,
      iconColor: '#E11D48',
      badgeBg: '#FFE4E6',
      badgeText: '#9F1239',
      borderGlow: 'hover:border-rose-400 hover:shadow-rose-500/15',
      highlights: ['Love Cross Spreads', 'Daily Three-Card Draw', 'Career Crossroads', 'Yes / No Inquiries'],
      actionText: 'Explore Tarot Spreads'
    },
    {
      id: 'psychic',
      number: '04',
      title: 'Psychic & Intuitive',
      system: 'Clairvoyance',
      category: 'Spiritual Vision',
      desc: 'Compassionate clairvoyance, aura scanning, and spiritual perception offering peaceful mental clarity.',
      icon: Moon,
      iconColor: '#0284C7',
      badgeBg: '#E0F2FE',
      badgeText: '#075985',
      borderGlow: 'hover:border-sky-400 hover:shadow-sky-500/15',
      highlights: ['Clairvoyant Readings', 'Aura Energy Scan', 'Mediumship Guidance', 'Dream Interpretation'],
      actionText: 'Explore Psychic Arts'
    },
    {
      id: 'birth-chart',
      number: '05',
      title: 'Free Kundli & Birth Chart',
      system: 'Ephemeris Math',
      category: 'Core Blueprint',
      desc: 'Exact mathematical calculation computing your Sun, Moon, Lagna (Ascendant), and 12 Bhavas instantly.',
      icon: Layers,
      iconColor: '#059669',
      badgeBg: '#D1FAE5',
      badgeText: '#065F46',
      borderGlow: 'hover:border-emerald-400 hover:shadow-emerald-500/15',
      highlights: ['Big 3 Breakdown', '12 House Cusps', 'Exact Planetary Degrees', 'Planetary Aspects'],
      actionText: 'Calculate Free Chart'
    },
    {
      id: 'compatibility',
      number: '06',
      title: 'Love & Relationship Synastry',
      system: 'Cosmic Match',
      category: 'Connection',
      desc: 'Dual-chart planetary overlays examining Venus-Mars chemistry, 7th house connection, and lasting karma.',
      icon: Heart,
      iconColor: '#F43F5E',
      badgeBg: '#FFF1F2',
      badgeText: '#BE123C',
      borderGlow: 'hover:border-pink-400 hover:shadow-pink-500/15',
      highlights: ['Soulmate Indicators', 'Communication Chemistry', 'Emotional Compatibility', 'Long-term Karma'],
      actionText: 'Check Compatibility'
    },
    {
      id: 'palmistry',
      number: '07',
      title: 'Palmistry & Hand Reading',
      system: 'Hastarekha',
      category: 'Ancient Chiromancy',
      desc: 'Detailed decoding of Life, Heart, and Head lines to reveal health vitality, destiny marks, and personal gifts.',
      icon: Star,
      iconColor: '#D97706',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
      borderGlow: 'hover:border-amber-400 hover:shadow-amber-500/15',
      highlights: ['Major Line Tracing', 'Mounts & Energy Centers', 'Fate Line Analysis', 'Intuition Markings'],
      actionText: 'Explore Palmistry'
    }
  ];

  // Duplicate cards for seamless continuous infinite CSS loop (right-to-left)
  const infiniteCards = [...services, ...services];

  // Base 1x speed duration: 36 seconds
  const speedDuration = speedMultiplier === '0.5x' ? 56 : speedMultiplier === '1.5x' ? 24 : 36;

  // Manual scroll nudges
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-14 sm:py-20 bg-white border-b border-gray-200/80 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Core Disciplines & Modalities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-2">
              Explore Services
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Personalised readings, birth charts, tarot, and expert insights auto-shuffling in real time. Choose your modality to begin.
            </p>
          </div>

          {/* Interactive Controls Bar: Auto-Shuffle Indicator, 1x Speed & Play/Pause */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {/* Auto-Shuffle 1x Speed Status Badge */}
            <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-ping'}`} />
              <span className="font-semibold text-gray-900">
                {isPaused ? 'Shuffle Paused' : 'Auto-Shuffle Active'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-bold">
                {speedMultiplier}
              </span>
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-semibold text-gray-800 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title={isPaused ? "Resume auto-shuffle" : "Pause auto-shuffle"}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-gray-700" />
                  <span>Pause</span>
                </>
              )}
            </button>

            {/* Speed Multiplier Cycle */}
            <button
              type="button"
              onClick={() => {
                setSpeedMultiplier(prev => prev === '1x' ? '1.5x' : prev === '1.5x' ? '0.5x' : '1x');
              }}
              className="px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold text-gray-700 transition-all cursor-pointer flex items-center gap-1"
              title="Change scroll speed"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{speedMultiplier} Speed</span>
            </button>

            {/* Manual Nudge Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleScrollLeft}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 border border-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleScrollRight}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 border border-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* HORIZONTAL CONTINUOUS AUTO-SHUFFLE TRACK (RIGHT TO LEFT AT 1X SPEED) */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto no-scrollbar py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft edge gradient fades for infinite feel */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-20" />

        {/* Continuous Right-to-Left CSS Marquee Container */}
        <div 
          className="animate-marquee-rtl flex items-stretch gap-6 px-6"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
            animationDuration: `${speedDuration}s`
          }}
        >
          {infiniteCards.map((svc, index) => {
            const Icon = svc.icon;
            return (
              <div
                key={`${svc.id}-${index}`}
                onClick={() => onSelectService(svc.id)}
                className={`w-[310px] sm:w-[350px] shrink-0 bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden select-none hover:-translate-y-1.5 ${svc.borderGlow}`}
              >
                {/* Subtle top color highlight bar */}
                <div 
                  className="absolute top-0 inset-x-0 h-1.5 opacity-90 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: svc.iconColor }}
                />

                <div>
                  {/* Card Top: Icon + Badge + Sequence Number */}
                  <div className="flex items-center justify-between mb-5">
                    <div 
                      className="w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
                      style={{ backgroundColor: svc.badgeBg }}
                    >
                      <Icon className="w-6 h-6" style={{ color: svc.iconColor }} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs"
                        style={{ 
                          backgroundColor: svc.badgeBg, 
                          color: svc.badgeText 
                        }}
                      >
                        {svc.system}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-gray-400">
                        {svc.number}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-950 mb-2 group-hover:text-amber-800 transition-colors line-clamp-1">
                    {svc.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5 font-normal line-clamp-3">
                    {svc.desc}
                  </p>

                  {/* Highlights Bullet points */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-gray-100">
                    {svc.highlights.map((hl, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <span 
                          className="w-1.5 h-1.5 rounded-full shrink-0" 
                          style={{ backgroundColor: svc.iconColor }} 
                        />
                        <span className="truncate">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectService(svc.id);
                  }}
                  className="w-full py-3 rounded-full bg-gray-50 group-hover:bg-[#FCE34D] text-gray-800 group-hover:text-gray-950 border border-gray-200 group-hover:border-[#EAB308] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>{svc.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>

              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful hover instruction subtitle */}
      <div className="text-center mt-4">
        <span className="text-xs text-gray-500 font-medium inline-flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Cards continuously auto-shuffle from right to left • Hover any card to pause • Click to start reading</span>
        </span>
      </div>

    </section>
  );
};
