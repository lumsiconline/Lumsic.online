import React, { useState } from 'react';
import { Reader } from '../types';
import { formatCurrencyPrice } from '../utils/currency';
import { getReaderSkillBadges } from '../utils/readerSkills';
import { VERIFIED_REVIEWS_POOL } from '../data/reviewsData';
import { 
  ArrowLeft, 
  MoreVertical, 
  Flame, 
  Briefcase, 
  MessageCircle, 
  Star, 
  Info, 
  ChevronRight, 
  Phone, 
  Check, 
  Gift, 
  Sparkles, 
  Heart, 
  Gem, 
  Award, 
  CircleDot 
} from 'lucide-react';

interface ReaderProfileModalProps {
  reader: Reader | null;
  onClose: () => void;
  onStartReading: (reader: Reader) => void;
  currentCurrency?: string;
}

// 8 Sacred Gifts as specified in user request
interface GiftItem {
  id: string;
  name: string;
  price: string;
  icon: React.ReactNode;
}

export const ReaderProfileModal: React.FC<ReaderProfileModalProps> = ({
  reader,
  onClose,
  onStartReading,
  currentCurrency = 'USD'
}) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string>('diya');
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [activeCallStatus] = useState<'online' | 'busy' | 'offline'>('online');

  if (!reader) return null;

  const priceInfo = formatCurrencyPrice(reader.ratePerMinute || 1.0, currentCurrency);
  const expYears = reader.experience_years ?? reader.experienceYears ?? 12;
  // Dynamic rating matching upper profile card exactly (4.98 or 4.99, never 5.0)
  const ratingVal = (reader.rating && reader.rating < 5.0 ? reader.rating : 4.98).toFixed(2);
  // Unique session count for each astrologer (e.g. 989 for Tamara, distinct for others)
  const totalSessions = reader.sessionsCount 
    ? reader.sessionsCount.toLocaleString() 
    : reader.reviewCount 
      ? (reader.reviewCount * 3 + 29).toLocaleString() 
      : '989';
  const reviewCount = reader.reviewCount && reader.reviewCount >= 100 ? reader.reviewCount : 100;
  const reviewCountDisplay = `${reviewCount}+`;

  // Currency-aware gift prices
  const isGBP = currentCurrency === 'GBP';
  const sym = isGBP ? '£' : '$';

  const GIFTS: GiftItem[] = [
    { id: 'diya', name: 'Diya', price: `${sym}1`, icon: <Flame className="w-5 h-5 text-amber-500" /> },
    { id: 'rudraksha', name: 'Rudraksha', price: `${sym}2`, icon: <CircleDot className="w-5 h-5 text-amber-700" /> },
    { id: 'lotus', name: 'Lotus', price: `${sym}3`, icon: <Sparkles className="w-5 h-5 text-pink-500" /> },
    { id: 'gold-coin', name: 'Gold Coin', price: `${sym}5`, icon: <Award className="w-5 h-5 text-yellow-500" /> },
    { id: 'shankh', name: 'Shankh', price: `${sym}7`, icon: <Gem className="w-5 h-5 text-teal-600" /> },
    { id: 'kalash', name: 'Kalash', price: `${sym}11`, icon: <Gift className="w-5 h-5 text-orange-600" /> },
    { id: 'gemstone', name: 'Gemstone', price: `${sym}15`, icon: <Gem className="w-5 h-5 text-indigo-600" /> },
    { id: 'lucky-charm', name: 'Lucky Charm', price: `${sym}21`, icon: <Heart className="w-5 h-5 text-rose-500" /> }
  ];

  // 55+ Verified seeker reviews from pool
  const allReviews = VERIFIED_REVIEWS_POOL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* 400 x 860 Clean Professional White Viewport Frame */}
      <div 
        className="relative w-full sm:max-w-[410px] h-full sm:h-[860px] bg-white text-gray-900 font-sans shadow-2xl sm:rounded-[36px] overflow-hidden flex flex-col justify-between border-0 sm:border border-gray-200/90"
        role="dialog"
        aria-modal="true"
      >
        {/* SCROLLABLE MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto scrollbar-none pb-28 bg-[#FAFAFA]">
          
          {/* 1. TOP HEADER: Clean Professional White Nav Bar */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between select-none">
            {/* Left: Circular back button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 active:scale-95 flex items-center justify-center text-gray-800 border border-gray-200/80 shadow-2xs transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>

            {/* Center: Astrologer ID Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{reader.astroId || 'LYS-10001'} • Verified Master</span>
            </div>

            {/* Right: Close or More Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 active:scale-95 flex items-center justify-center text-gray-600 hover:text-gray-900 border border-gray-200/80 shadow-2xs transition-all cursor-pointer"
              aria-label="Close"
            >
              <MoreVertical className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* 2. PROFILE HERO CARD (Clean White Background) */}
          <div className="bg-white border-b border-gray-100 p-4 sm:p-5 shadow-2xs">
            <div className="flex gap-4 items-start">
              {/* Rounded-square photo on the left with status dot */}
              <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border-2 border-amber-300/60 shadow-xs">
                <img
                  src={reader.image_url || reader.avatar}
                  alt={reader.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Online / Offline status badge on photo */}
                <span 
                  className={`absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                    reader.isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} 
                  title={reader.isOnline ? 'Online Now' : 'Offline'}
                />
              </div>

              {/* Right: Name, Category, Experience, Dynamic Price */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-xl font-black text-gray-950 tracking-tight truncate leading-tight font-sans">
                    {reader.name}
                  </h1>
                </div>

                {/* Category Tag */}
                <div className="mt-1">
                  <span className="inline-block text-[11px] font-bold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60 truncate max-w-full">
                    ✦ {reader.category || 'Psychic & Intuitive'}
                  </span>
                </div>

                {/* Experience & Expert - Clean normal text */}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 font-medium">
                  <span>
                    Exp: <strong className="text-purple-950 font-bold">{expYears} yrs</strong>
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-700 font-semibold">Expert Reader</span>
                </div>

                {/* Price: Struck-through old price & highlighted new price per minute */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400 line-through font-medium">
                    {priceInfo.originalPrice}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-300/80 shadow-2xs">
                    {priceInfo.currentPrice}/min
                  </span>
                </div>
              </div>
            </div>

            {/* Social proof strip: Consultations completed */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-amber-800">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>27 consultations in last 24 hours</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ 99.4% Positive
              </span>
            </div>
          </div>

          {/* 3. STATS ROW (Three equal crisp white cards) */}
          <div className="px-4 mt-3.5 grid grid-cols-3 gap-2.5">
            {/* Experience */}
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-2xs flex flex-col items-center text-center">
              <Briefcase className="w-4 h-4 text-amber-600 stroke-[2.2] mb-1" />
              <span className="text-sm font-black text-gray-950">{expYears} Yrs</span>
              <span className="text-[10px] text-gray-500 font-medium">Experience</span>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-2xs flex flex-col items-center text-center">
              <MessageCircle className="w-4 h-4 text-purple-600 stroke-[2.2] mb-1" />
              <span className="text-sm font-black text-gray-950">{totalSessions}</span>
              <span className="text-[10px] text-gray-500 font-medium">Sessions</span>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-2xs flex flex-col items-center text-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 mb-1" />
              <span className="text-sm font-black text-gray-950">{ratingVal}</span>
              <span className="text-[10px] text-gray-500 font-medium">Rating</span>
            </div>
          </div>

          {/* 4. SPECIALIZED SKILLS & FOCUS AREAS (Clean White Card) */}
          <div className="px-4 mt-3.5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="block text-[11px] font-black uppercase tracking-wider text-purple-950 mb-2.5">
                Specialized Skills &amp; Focus Areas
              </span>
              <div className="space-y-2">
                {getReaderSkillBadges(reader).map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-2xs" />
                    <span className="font-bold text-gray-900">{badge.label}</span>
                    <span className="text-gray-400 text-[11px]">· Specialist Consult</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. BIO SECTION (Clean White Card) */}
          <div className="px-4 mt-3.5">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs">
              <span className="block text-[11px] font-black uppercase tracking-wider text-purple-950 mb-2">
                About {reader.name}
              </span>
              <p className={`text-xs text-gray-700 leading-relaxed font-normal ${!isBioExpanded ? 'line-clamp-3' : ''}`}>
                {reader.bio || 'Gifted spiritual practitioner dedicated to unraveling life crossroads, soulmate clarity, and divine timing through ancient cosmic insights. Every session is held in compassion, confidentiality, and deep energetic presence.'}
              </p>
              <button
                type="button"
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="mt-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer inline-block"
              >
                {isBioExpanded ? 'Show less' : 'Read more'}
              </button>
            </div>
          </div>

          {/* 6. RATINGS & REVIEWS (Clean White Cards) */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-950">
                  Verified Seeker Reviews
                </h2>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {reviewCountDisplay}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-xs font-bold text-purple-900 hover:text-purple-700 transition-colors cursor-pointer"
              >
                {showAllReviews ? 'Show less' : `View all (${reviewCountDisplay})`}
              </button>
            </div>

            {/* Review Cards (Clean white background) */}
            <div className={`space-y-2.5 ${showAllReviews ? 'max-h-[380px] overflow-y-auto pr-1 scrollbar-thin' : ''}`}>
              {(showAllReviews ? allReviews : allReviews.slice(0, 2)).map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-200/80 shadow-2xs flex gap-3 items-start hover:border-amber-300 transition-colors"
                >
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-gray-950 truncate">{rev.name}</span>
                        {rev.topic && (
                          <span className="hidden sm:inline-block text-[9px] bg-slate-100 text-gray-700 px-2 py-0.5 rounded font-medium border border-gray-200/80 truncate">
                            {rev.topic}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      &quot;{rev.text}&quot;
                    </p>
                    {rev.date && (
                      <div className="text-[9.5px] text-gray-400 mt-1 font-medium flex items-center justify-between">
                        <span>{rev.date}</span>
                        <span className="text-emerald-700 font-semibold">✓ Verified Consultation</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Verified client notice */}
            <div className="mt-2 text-center">
              <span className="text-[10.5px] text-gray-500 font-semibold">
                ★ {ratingVal} rating from {reviewCountDisplay} verified client consultations
              </span>
            </div>
          </div>

          {/* 7. PRIORITY CONSULTATION INQUIRY (Clean White Card) */}
          <div className="px-4 mt-3.5">
            <button
              type="button"
              onClick={() => onStartReading(reader)}
              className="w-full bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-2xs flex items-center justify-between hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/70 flex items-center justify-center text-purple-800">
                  <MessageCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-950">Priority Reading Inquiry</h3>
                  <p className="text-[10px] text-gray-500">Connect directly with {reader.name} for your session</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-800 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* 8. SEND A GIFT SECTION (Clean White Card) */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-gray-950">Send a Sacred Blessing</h2>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              {/* Wallet Balance Chip */}
              <div className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200/70 text-[11px] font-bold text-purple-900">
                Balance: {sym}25.00
              </div>
            </div>

            {/* 4-Column Grid of 8 Gifts on White Background */}
            <div className="grid grid-cols-4 gap-2">
              {GIFTS.map((g) => {
                const isSelected = selectedGiftId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGiftId(g.id)}
                    className={`p-2 rounded-2xl bg-white flex flex-col items-center justify-center text-center transition-all cursor-pointer relative min-h-[76px] ${
                      isSelected 
                        ? 'border-2 border-amber-400 shadow-sm bg-amber-50/40' 
                        : 'border border-gray-200/80 hover:border-amber-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className="mb-1">
                      {g.icon}
                    </div>
                    <span className="text-[10.5px] font-bold text-gray-900 truncate w-full leading-tight">
                      {g.name}
                    </span>
                    <span className="text-[9.5px] font-semibold text-amber-800 mt-0.5">
                      {g.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 9. STICKY BOTTOM BAR IN CLEAN WHITE */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md rounded-t-3xl p-3.5 px-4 shadow-2xl z-30 border-t border-gray-200/90">
          <div className="grid grid-cols-2 gap-3">
            {/* Chat Button (Online Variant - Yellow/Gold) */}
            <button
              type="button"
              onClick={() => onStartReading(reader)}
              className="min-h-[48px] bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 active:scale-95 rounded-2xl px-3 py-2 flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer group border border-amber-300"
            >
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 stroke-[2.4]" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-gray-950 leading-tight">
                  Chat Now
                </span>
                <span className="block text-[10px] font-bold text-emerald-800 leading-tight">
                  Online
                </span>
              </div>
            </button>

            {/* Call Button (Clean White Variant) */}
            <button
              type="button"
              onClick={() => {
                if (reader.isCallEnabled && activeCallStatus === 'online') {
                  onStartReading(reader);
                }
              }}
              disabled={!reader.isCallEnabled}
              className={`min-h-[48px] rounded-2xl px-3 py-2 flex items-center justify-center gap-2.5 shadow-xs transition-all border ${
                reader.isCallEnabled
                  ? 'bg-white hover:bg-slate-50 active:scale-95 cursor-pointer text-gray-900 border-gray-300'
                  : 'bg-gray-100 opacity-60 cursor-not-allowed text-gray-400 border-gray-200'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                reader.isCallEnabled ? 'bg-purple-100 text-purple-900' : 'bg-gray-200 text-gray-500'
              }`}>
                <Phone className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black leading-tight text-gray-950">
                  Voice Call
                </span>
                <span className="block text-[10px] font-bold leading-tight truncate text-gray-500">
                  {reader.isCallEnabled ? 'Available' : 'Offline'}
                </span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
