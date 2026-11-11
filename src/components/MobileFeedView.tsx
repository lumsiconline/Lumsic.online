import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Sparkles, Star } from 'lucide-react';
import { Reader } from '../types';
import { formatCurrencyPrice } from '../utils/currency';
import { getReaderSkillBadges } from '../utils/readerSkills';
import { SectionHeader } from './SectionHeader';

interface MobileFeedViewProps {
  readers: Reader[];
  onStartChat: (reader: Reader) => void;
  onViewProfile: (reader: Reader) => void;
  onExploreAll: (category?: string) => void;
  onSelectPromptQuestion: (question: string) => void;
  currentCurrency?: string;
}

const PROMPT_QUESTIONS = [
  'When will I get married',
  'Will my ex contact me again?',
  'What does my career hold in 2026?',
  'Is he/she my true soulmate?',
  'What celestial energy surrounds me now?'
];

export const MobileFeedView: React.FC<MobileFeedViewProps> = ({
  readers,
  onStartChat,
  onViewProfile,
  onExploreAll,
  onSelectPromptQuestion,
  currentCurrency = 'USD'
}) => {
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  // Auto-cycle prompt questions every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % PROMPT_QUESTIONS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const activeQuestion = PROMPT_QUESTIONS[activePromptIndex];

  // Price formatting helper using universal currency engine
  const formatPrices = (rate: number) => {
    const res = formatCurrencyPrice(rate, currentCurrency);
    return {
      original: res.originalPrice,
      current: res.currentPrice
    };
  };

  // Group completely distinct, non-overlapping readers for all 4 rows
  // Ensures NO astrologer profile picture is ever duplicated across rows
  const { loveReaders, mostAccurateReaders, chartReaders, careerReaders } = useMemo(() => {
    const used = new Set<string>();

    // Row 1: Best In Love Readings (Tamara, Gabrielle, Colleen, Naomi, Oliver, Jasper, Beatrice, etc.)
    const love: Reader[] = [];
    for (const r of readers) {
      if (r.isActive === false) continue;
      const isLove = 
        r.id === 'psychic-tamara' ||
        r.id === 'psychic-gabrielle' ||
        r.id === 'psychic-colleen' ||
        r.id === 'psychic-naomi' ||
        r.id === 'tarot-oliver' ||
        r.id === 'tarot-jasper' ||
        r.id === 'tarot-beatrice' ||
        r.specialities?.some(s => s.toLowerCase().includes('love') || s.toLowerCase().includes('soul') || s.toLowerCase().includes('relationship')) ||
        r.specialties?.some(s => s.toLowerCase().includes('love') || s.toLowerCase().includes('relationship')) ||
        r.category === 'Tarot';
      if (isLove && !used.has(r.id)) {
        love.push(r);
        used.add(r.id);
        if (love.length >= 8) break;
      }
    }

    // Row 2: Most Accurate (Vera, Emerson, Marcus, Liam, Clara, Soren, Astrid, Maya, etc.)
    const accurate: Reader[] = [];
    for (const r of readers) {
      if (r.isActive === false || used.has(r.id)) continue;
      const isAccurate = r.id === 'psychic-vera' || r.id === 'psychic-emerson' || r.rating >= 4.95 || (r.experienceYears ?? r.experience_years ?? 0) >= 12;
      if (isAccurate) {
        accurate.push(r);
        used.add(r.id);
        if (accurate.length >= 8) break;
      }
    }

    // Row 3: Based On Your Chart (Western & Natal Chart Astrologers)
    const chart: Reader[] = [];
    for (const r of readers) {
      if (r.isActive === false || used.has(r.id)) continue;
      const isChart = 
        r.category === 'Western Astrology' ||
        r.specialities?.some(s => s.toLowerCase().includes('chart') || s.toLowerCase().includes('natal') || s.toLowerCase().includes('astrology')) ||
        r.specialties?.some(s => s.toLowerCase().includes('chart') || s.toLowerCase().includes('astrology'));
      if (isChart) {
        chart.push(r);
        used.add(r.id);
        if (chart.length >= 8) break;
      }
    }

    // Row 4: Career & Vedic Guidance (Vedic Masters & Career Advisors)
    const career: Reader[] = [];
    for (const r of readers) {
      if (r.isActive === false || used.has(r.id)) continue;
      const isCareer = 
        r.category === 'Vedic Astrology' ||
        r.specialities?.some(s => s.toLowerCase().includes('career') || s.toLowerCase().includes('vedic') || s.toLowerCase().includes('wealth') || s.toLowerCase().includes('business')) ||
        r.specialties?.some(s => s.toLowerCase().includes('career') || s.toLowerCase().includes('vedic'));
      if (isCareer) {
        career.push(r);
        used.add(r.id);
        if (career.length >= 8) break;
      }
    }

    // Fill any row that has fewer than 8 with remaining unassigned unique readers
    const fillRow = (row: Reader[]) => {
      if (row.length < 8) {
        for (const r of readers) {
          if (r.isActive === false || used.has(r.id)) continue;
          row.push(r);
          used.add(r.id);
          if (row.length >= 8) break;
        }
      }
    };
    fillRow(love);
    fillRow(accurate);
    fillRow(chart);
    fillRow(career);

    return { loveReaders: love, mostAccurateReaders: accurate, chartReaders: chart, careerReaders: career };
  }, [readers]);

  const renderReaderCard = (reader: Reader, keyPrefix: string) => {
    const prices = formatPrices(reader.ratePerMinute);
    const expYears = reader.experience_years ?? reader.experienceYears ?? 10;
    const expText = `Exp: ${expYears} yrs`;

    return (
      <div
        key={`${keyPrefix}-${reader.id}`}
        className="w-[158px] min-w-[158px] max-w-[158px] bg-white hover:bg-slate-50/80 border border-gray-200/90 hover:border-amber-400/50 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between shrink-0 snap-start text-center group"
      >
        {/* Reader Photo with Rating Badge */}
        <div 
          onClick={() => onViewProfile(reader)}
          className="relative w-full h-[148px] rounded-xl overflow-hidden cursor-pointer bg-slate-100"
        >
          <img
            src={reader.image_url || reader.avatar}
            alt={reader.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Top-Left Rating Pill Badge ★ 4.98 / 4.99 */}
          <div className="absolute top-2 left-2 bg-purple-950/90 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md backdrop-blur-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-white">{(reader.rating && reader.rating < 5.0 ? reader.rating : 4.98).toFixed(2)}</span>
          </div>

          {/* Top-Right Online Dot */}
          <div className="absolute top-2 right-2 flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
            </span>
          </div>
        </div>

        {/* Reader Name (Fixed height for alignment) */}
        <h4 
          onClick={() => onViewProfile(reader)}
          className="text-[14px] font-bold text-gray-950 mt-2 truncate px-1 cursor-pointer hover:text-amber-800 transition-colors h-5 flex items-center justify-center font-sans"
          title={reader.name}
        >
          {reader.name}
        </h4>

        {/* Row 1: Exp & Expert - Clean normal text */}
        <div className="h-5 flex items-center justify-center gap-1.5 mt-1 text-[11px]">
          <span className="text-purple-900 font-semibold">
            {expText}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-700 font-medium">
            Expert
          </span>
        </div>

        {/* Row 2: Skills - Clean normal text without header/label */}
        <div className="h-5 flex items-center justify-center mt-0.5 px-1 text-[11px] truncate max-w-full">
          <span className="text-gray-600 font-medium truncate">
            {getReaderSkillBadges(reader).map(b => b.label).join(' · ')}
          </span>
        </div>

        {/* Chat Action Button (Yellow/Gold style as requested) */}
        <button
          type="button"
          onClick={() => onStartChat(reader)}
          className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 active:scale-95 text-gray-950 font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs border border-amber-300"
        >
          <span>Chat</span>
        </button>

        {/* Price Line Below Chat Button */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] mt-2 font-medium">
          <span className="line-through text-gray-400">{prices.original}</span>
          <span className="text-gray-950 font-black">{prices.current}/min</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-7 pt-2 pb-8 px-4 text-[#1F1929]">
      {/* 1. Yellow/Gold Rotating Question Prompt Banner */}
      <div className="w-full">
        <button
          type="button"
          onClick={() => onSelectPromptQuestion(activeQuestion)}
          className="w-full rounded-2xl bg-gradient-to-r from-[#FDE68A] via-[#FCD34D] to-[#F59E0B] hover:brightness-105 active:scale-[0.99] text-gray-950 p-3.5 sm:p-4 shadow-xl shadow-amber-500/15 transition-all flex items-center justify-between gap-3 border border-amber-300 text-left cursor-pointer group"
        >
          {/* Left: Glowing Lightbulb / Question Circle Icon */}
          <div className="w-9 h-9 rounded-full bg-amber-100/90 border border-amber-300/80 flex items-center justify-center text-amber-900 shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <span className="text-base select-none">💡</span>
          </div>

          {/* Center: Dynamic Question Text */}
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-[15px] sm:text-base font-bold text-gray-950 tracking-tight truncate font-sans">
              {activeQuestion}
            </p>
          </div>

          {/* Right: Chevron Arrow Circle */}
          <div className="w-7 h-7 rounded-full border border-gray-950/20 flex items-center justify-center text-gray-950 shrink-0 group-hover:translate-x-0.5 transition-transform">
            <ChevronRight className="w-4 h-4 text-gray-950" />
          </div>
        </button>

        {/* 3 Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {PROMPT_QUESTIONS.slice(0, 3).map((_, idx) => {
            const isActive = (activePromptIndex % 3) === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePromptIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  isActive ? 'w-4 bg-[#A78BFA]' : 'w-1.5 bg-slate-400/60'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. SECTION: Best In Love Readings (TOP ROW - Highest Priority) */}
      <div className="space-y-3">
        <SectionHeader
          icon="💖"
          iconBg="bg-rose-100"
          iconBorder="border-rose-300"
          title="Best In Love Readings"
          badge="TOP RATED"
          badgeBg="bg-rose-100"
          badgeText="text-rose-900"
          badgeBorder="border-rose-300"
          titleColor="text-[#881337]"
          subtitle="Soulmate clarity, breakup recovery & romantic reconnection"
          onViewAll={() => onExploreAll('tarot')}
        />

        {/* Horizontal Scrollable Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {loveReaders.slice(0, 8).map((reader: Reader) => renderReaderCard(reader, 'love'))}
        </div>
      </div>

      {/* 3. SECTION: Most Accurate (Accuracy percentage removed completely) */}
      <div className="space-y-3 pt-1">
        <SectionHeader
          icon="✨"
          iconBg="bg-amber-100"
          iconBorder="border-amber-300"
          title="Most Accurate"
          titleColor="text-[#1E3A8A]"
          subtitle="Top accuracy scores from 10,000+ verified seeker consultations"
          onViewAll={() => onExploreAll('psychic')}
        />

        {/* Horizontal Scrollable Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {mostAccurateReaders.slice(0, 8).map((reader: Reader) => renderReaderCard(reader, 'accurate'))}
        </div>
      </div>

      {/* 4. SECTION: Based On Your Chart */}
      <div className="space-y-3 pt-1">
        <SectionHeader
          icon="🪐"
          iconBg="bg-purple-100"
          iconBorder="border-purple-300"
          title="Based On Your Chart"
          titleColor="text-[#581C87]"
          subtitle="Aligned with your astrological zodiac houses & planetary transits"
          onViewAll={() => onExploreAll('astrology')}
        />

        {/* Horizontal Scrollable Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {chartReaders.slice(0, 8).map((reader: Reader) => renderReaderCard(reader, 'chart'))}
        </div>
      </div>

      {/* 5. SECTION: Career & Vedic Guidance */}
      {careerReaders.length > 0 && (
        <div className="space-y-3 pt-1">
          <SectionHeader
            icon="🔮"
            iconBg="bg-emerald-100"
            iconBorder="border-emerald-300"
            title="Career & Vedic Guidance"
            titleColor="text-[#065F46]"
            subtitle="Job promotion timing, business pivots & life direction"
            onViewAll={() => onExploreAll('vedic')}
          />

          {/* Horizontal Scrollable Row */}
          <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
            {careerReaders.slice(0, 8).map((reader: Reader) => renderReaderCard(reader, 'career'))}
          </div>
        </div>
      )}

      {/* Mobile Feed Bottom: View All Astrologers Button */}
      <div className="pt-3 pb-1">
        <button
          type="button"
          onClick={() => onExploreAll()}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 active:scale-98 text-gray-950 font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>View All 100+ Astrologers</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
