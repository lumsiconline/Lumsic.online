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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* 390 x 844 Mobile Viewport Frame */}
      <div 
        className="relative w-full sm:max-w-[390px] h-full sm:h-[844px] bg-[#FFF8E6] text-[#3A2A0A] font-sans shadow-2xl sm:rounded-[36px] overflow-hidden flex flex-col justify-between border-0 sm:border border-[#EAD8A4]/80"
        role="dialog"
        aria-modal="true"
      >
        {/* SCROLLABLE MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto scrollbar-none pb-28">
          
          {/* 1. HEADER: Amber-to-golden gradient (approx 120px tall) */}
          <div className="relative h-[120px] bg-gradient-to-r from-[#F5B301] to-[#B7791F] px-4 pt-4 flex items-start justify-between select-none">
            {/* Soft celestial background shimmer */}
            <div className="absolute inset-0 bg-radial-at-t from-white/20 via-transparent to-black/10 pointer-events-none" />

            {/* Left: Circular translucent back button */}
            <button
              type="button"
              onClick={onClose}
              className="relative z-10 w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 backdrop-blur-md flex items-center justify-center text-[#3A2A0A] border border-white/30 shadow-xs transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            {/* Right: 3-dot menu button */}
            <button
              type="button"
              className="relative z-10 w-10 h-10 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 backdrop-blur-md flex items-center justify-center text-[#3A2A0A] border border-white/30 shadow-xs transition-all cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 stroke-[2.4]" />
            </button>
          </div>

          {/* 2. PROFILE CARD OVERLAPPING THE HEADER */}
          <div className="px-4 -mt-12 relative z-10">
            <div className="bg-white rounded-2xl shadow-sm border border-[#EAD8A4]/70 overflow-hidden">
              <div className="p-4 flex gap-3.5 items-start">
                {/* Rounded-square photo on the left */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-amber-100 border-2 border-[#F5B301]/40 shadow-xs">
                  <img
                    src={reader.image_url || reader.avatar}
                    alt={reader.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Online / Offline status badge on photo */}
                  <span className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${reader.isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>

                {/* Right: Name, two small tags, price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-lg font-black text-[#3A2A0A] tracking-tight truncate leading-tight font-sans">
                      {reader.name}
                    </h1>
                  </div>

                  {/* Experience & Expert - Normal clean text */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
                    <span className="font-semibold text-purple-900">
                      Exp: {expYears} yrs
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="font-semibold text-gray-700">Expert</span>
                  </div>

                  {/* Skills - Normal clean text without header/label */}
                  <div className="flex items-center mt-1.5 text-xs truncate max-w-full">
                    <span className="text-gray-700 font-medium truncate">
                      {getReaderSkillBadges(reader).map(b => b.label).join(' · ')}
                    </span>
                  </div>

                  {/* Price: Struck-through old price & highlighted new price per minute */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400 line-through font-medium">
                      {priceInfo.originalPrice}
                    </span>
                    <span className="text-sm font-extrabold text-[#B7791F] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {priceInfo.currentPrice}/min
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom soft cream strip with flame icon */}
              <div className="bg-[#FFF8E6] px-4 py-2 border-t border-[#EAD8A4]/70 flex items-center gap-2 text-xs font-semibold text-[#B7791F]">
                <Flame className="w-3.5 h-3.5 fill-[#F5B301] text-[#F5B301]" />
                <span>27 people in last 24 hours</span>
              </div>
            </div>
          </div>

          {/* 3. STATS ROW (Three equal small cards) */}
          <div className="px-4 mt-3.5 grid grid-cols-3 gap-2.5">
            {/* Experience */}
            <div className="bg-white rounded-2xl p-3 border border-[#EAD8A4]/70 shadow-xs flex flex-col items-center text-center">
              <Briefcase className="w-4 h-4 text-[#B7791F] stroke-[2.2] mb-1" />
              <span className="text-sm font-extrabold text-[#3A2A0A]">{expYears} Yrs</span>
              <span className="text-[10px] text-gray-500 font-medium">Experience</span>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-2xl p-3 border border-[#EAD8A4]/70 shadow-xs flex flex-col items-center text-center">
              <MessageCircle className="w-4 h-4 text-[#B7791F] stroke-[2.2] mb-1" />
              <span className="text-sm font-extrabold text-[#3A2A0A]">{totalSessions}</span>
              <span className="text-[10px] text-gray-500 font-medium">Sessions</span>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-2xl p-3 border border-[#EAD8A4]/70 shadow-xs flex flex-col items-center text-center">
              <Star className="w-4 h-4 text-[#F5B301] fill-[#F5B301] mb-1" />
              <span className="text-sm font-extrabold text-[#3A2A0A]">{ratingVal}</span>
              <span className="text-[10px] text-gray-500 font-medium">Rating</span>
            </div>
          </div>

          {/* SPECIALIZED SKILLS & FOCUS AREAS */}
          <div className="px-4 mt-3.5">
            <div className="bg-white rounded-2xl p-3.5 border border-[#EAD8A4]/70 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-purple-900/80 mb-2.5">
                Specialized Skills &amp; Focus Areas
              </span>
              <div className="space-y-1.5">
                {getReaderSkillBadges(reader).map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold text-[#3A2A0A]">{badge.label}</span>
                    <span className="text-gray-400 text-[11px]">Specialist Reading</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. BIO SECTION */}
          <div className="px-4 mt-3.5">
            <div className="bg-white rounded-2xl p-3.5 border border-[#EAD8A4]/70 shadow-xs">
              <p className={`text-xs text-[#3A2A0A]/85 leading-relaxed font-normal ${!isBioExpanded ? 'line-clamp-3' : ''}`}>
                {reader.bio || 'Gifted spiritual practitioner dedicated to unraveling life crossroads, soulmate clarity, and divine timing through ancient cosmic insights. Every session is held in compassion, confidentiality, and deep energetic presence.'}
              </p>
              <button
                type="button"
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="mt-1 text-xs font-bold text-[#F5B301] hover:text-[#B7791F] transition-colors cursor-pointer inline-block"
              >
                {isBioExpanded ? 'Show less' : 'Read more'}
              </button>
            </div>
          </div>

          {/* 5. RATINGS & REVIEWS */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-[#3A2A0A]">
                  Ratings &amp; Reviews
                </h2>
                <span className="text-[11px] font-bold text-[#B7791F] bg-[#FFF8E6] px-2 py-0.5 rounded-full border border-[#EAD8A4]">
                  {reviewCountDisplay}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-xs font-bold text-[#B7791F] hover:text-[#3A2A0A] transition-colors cursor-pointer"
              >
                {showAllReviews ? 'Show less' : `View all (${reviewCountDisplay})`}
              </button>
            </div>

            {/* Review Cards (shows 2 by default, reveals 55+ verified client reviews on View all) */}
            <div className={`space-y-2 ${showAllReviews ? 'max-h-[380px] overflow-y-auto pr-1 scrollbar-thin' : ''}`}>
              {(showAllReviews ? allReviews : allReviews.slice(0, 2)).map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#EAD8A4]/70 shadow-xs flex gap-2.5 items-start hover:border-[#F5B301]/50 transition-colors">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-200"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-[#3A2A0A] truncate">{rev.name}</span>
                        {rev.topic && (
                          <span className="hidden sm:inline-block text-[9px] bg-amber-50 text-[#B7791F] px-1.5 py-0.2 rounded font-medium border border-amber-200/60 truncate">
                            {rev.topic}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 text-[#F5B301] fill-[#F5B301]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                      "{rev.text}"
                    </p>
                    {rev.date && (
                      <div className="text-[9px] text-gray-400 mt-1 font-medium flex items-center justify-between">
                        <span>{rev.date}</span>
                        <span className="text-emerald-600 font-semibold">✓ Verified Session</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Verified client notice */}
            <div className="mt-2 text-center">
              <span className="text-[10px] text-[#B7791F] font-semibold">
                ★ {ratingVal} rating from {reviewCountDisplay} verified client sessions
              </span>
            </div>
          </div>

          {/* 6. PRIORITY CONSULTATION INQUIRY */}
          <div className="px-4 mt-3.5">
            <button
              type="button"
              onClick={() => onStartReading(reader)}
              className="w-full bg-white rounded-2xl p-3.5 border border-[#EAD8A4]/70 shadow-xs flex items-center justify-between hover:bg-amber-50/40 active:scale-[0.99] transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] border border-[#EAD8A4] flex items-center justify-center text-[#B7791F]">
                  <MessageCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#3A2A0A]">Priority Reading Inquiry</h3>
                  <p className="text-[10px] text-gray-500">Connect directly with {reader.name} for your session</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#B7791F] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* 7. SEND A GIFT SECTION */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-[#3A2A0A]">Send a gift</h2>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              {/* Wallet Balance Chip */}
              <div className="px-2.5 py-1 rounded-full bg-[#FFF8E6] border border-[#EAD8A4] text-[11px] font-bold text-[#B7791F]">
                Balance: {sym}25.00
              </div>
            </div>

            {/* 4-Column Grid of 8 Gifts */}
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
                        ? 'border-2 border-[#F5B301] shadow-xs bg-amber-50/30' 
                        : 'border border-[#EAD8A4]/80 hover:border-amber-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F5B301] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className="mb-1">
                      {g.icon}
                    </div>
                    <span className="text-[10.5px] font-bold text-[#3A2A0A] truncate w-full leading-tight">
                      {g.name}
                    </span>
                    <span className="text-[9.5px] font-semibold text-[#B7791F] mt-0.5">
                      {g.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 8. STICKY BOTTOM BAR IN DARK BROWN (#3A2A0A) */}
        <div className="absolute bottom-0 inset-x-0 bg-[#3A2A0A] rounded-t-3xl p-3.5 px-4 shadow-2xl z-30 border-t border-amber-900/30">
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
                  Chat
                </span>
                <span className="block text-[10px] font-bold text-emerald-800 leading-tight">
                  Online
                </span>
              </div>
            </button>

            {/* Call Button (Offline / Wait Variant demonstration) */}
            <button
              type="button"
              onClick={() => {
                if (reader.isCallEnabled && activeCallStatus === 'online') {
                  onStartReading(reader);
                }
              }}
              disabled={!reader.isCallEnabled}
              className={`min-h-[48px] rounded-2xl px-3 py-2 flex items-center justify-center gap-2.5 shadow-md transition-all ${
                reader.isCallEnabled
                  ? 'bg-white hover:bg-amber-50 active:scale-95 cursor-pointer text-[#3A2A0A]'
                  : 'bg-white/80 opacity-75 cursor-not-allowed text-gray-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                reader.isCallEnabled ? 'bg-amber-100 text-[#B7791F]' : 'bg-gray-100 text-gray-400'
              }`}>
                <Phone className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black leading-tight">
                  Call
                </span>
                <span className="block text-[10px] font-bold leading-tight truncate">
                  {reader.isCallEnabled ? 'Wait ~5 min' : 'Currently offline'}
                </span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
