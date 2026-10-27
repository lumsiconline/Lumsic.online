import React, { useState, useMemo } from 'react';
import { Reader } from '../types';
import { Search, Sparkles, Moon, BookOpen, Heart, Compass, ArrowLeft, Star, MessageCircle } from 'lucide-react';
import { formatCurrencyPrice } from '../utils/currency';
import { getReaderSkillBadges } from '../utils/readerSkills';

interface ViewAllReadersPageProps {
  readers: Reader[];
  onBack: () => void;
  onViewProfile: (reader: Reader) => void;
  onStartChat: (reader: Reader) => void;
  currentCurrency?: string;
}

export const ViewAllReadersPage: React.FC<ViewAllReadersPageProps> = ({
  readers,
  onBack,
  onViewProfile,
  onStartChat,
  currentCurrency = 'USD'
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayCount, setDisplayCount] = useState<number>(24); // 24 per page as requested

  // Filter readers based on category tab and search query
  const filteredReaders = useMemo(() => {
    return readers.filter(r => {
      // Must not be deactivated by admin
      if (r.isActive === false) return false;

      // Category filter
      if (activeFilter === 'love') {
        const isLove = 
          r.id === 'psychic-tamara' ||
          r.id === 'psychic-gabrielle' ||
          r.id === 'psychic-colleen' ||
          r.id === 'psychic-naomi' ||
          r.specialities?.some(s => s.toLowerCase().includes('love') || s.toLowerCase().includes('relationship') || s.toLowerCase().includes('soul')) ||
          r.specialties?.some(s => s.toLowerCase().includes('love') || s.toLowerCase().includes('relationship')) ||
          r.bio.toLowerCase().includes('love') ||
          r.category === 'Tarot';
        if (!isLove) return false;
      } else if (activeFilter === 'accurate') {
        const isAccurate = r.rating >= 4.95 || r.experienceYears >= 12;
        if (!isAccurate) return false;
      } else if (activeFilter === 'vedic') {
        if (r.category !== 'Vedic Astrology' && !r.specialties?.some(s => s.toLowerCase().includes('vedic'))) return false;
      } else if (activeFilter === 'western') {
        if (r.category !== 'Western Astrology' && !r.specialties?.some(s => s.toLowerCase().includes('western'))) return false;
      } else if (activeFilter === 'psychic') {
        if (r.category !== 'Psychic & Intuitive' && !r.specialties?.some(s => s.toLowerCase().includes('psychic'))) return false;
      } else if (activeFilter === 'tarot') {
        if (r.category !== 'Tarot' && !r.specialties?.some(s => s.toLowerCase().includes('tarot'))) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchLang = r.languages?.some(l => l.toLowerCase().includes(q));
        const matchSpec = r.specialities?.some(s => s.toLowerCase().includes(q)) || r.specialties?.some(s => s.toLowerCase().includes(q));
        const matchCat = r.category?.toLowerCase().includes(q);
        const matchId = (r.astroId || '').toLowerCase().includes(q);
        if (!matchName && !matchLang && !matchSpec && !matchCat && !matchId) return false;
      }

      return true;
    });
  }, [readers, activeFilter, searchQuery]);

  const visibleReaders = filteredReaders.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-4 sm:pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-amber-50 text-gray-800 hover:text-amber-900 border border-gray-200 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Home</span>
          </button>

          <div className="text-xs sm:text-sm font-semibold text-gray-500">
            Showing <span className="font-bold text-gray-900">{visibleReaders.length}</span> of <span className="font-bold text-gray-900">{filteredReaders.length}</span> Available Astrologers &amp; Readers
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>100+ VERIFIED ASTROLOGERS &amp; READERS AVAILABLE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F1929] tracking-tight">
              All Astrologers &amp; Readers Directory
            </h1>
            <p className="text-sm sm:text-base text-[#574B38] mt-1 max-w-2xl font-normal">
              Browse our complete collective of verified astrologers, psychic readers, tarot masters, and Vedic scholars. Connect instantly for live chat or video guidance.
            </p>
          </div>

          {/* Search bar inside section */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID (e.g. LYS-10020), skill..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(24);
                }}
                className="w-full pl-9.5 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-amber-400 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          {[
            { id: 'all', label: `All Readers (${readers.filter(r => r.isActive !== false).length})`, icon: Sparkles },
            { id: 'love', label: '💖 Best In Love Readings', icon: Heart },
            { id: 'accurate', label: '✨ Most Accurate', icon: Sparkles },
            { id: 'vedic', label: '🕉️ Vedic Astrology', icon: Compass },
            { id: 'western', label: '🪐 Western Charts', icon: Moon },
            { id: 'psychic', label: '🔮 Psychic & Intuitive', icon: Moon },
            { id: 'tarot', label: '🃏 Tarot', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id);
                  setDisplayCount(24);
                }}
                className={`group relative flex items-center gap-2 px-4.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-bold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-gray-950 font-extrabold shadow-md shadow-amber-400/30 border border-amber-300 ring-2 ring-amber-400/40 -translate-y-0.5'
                    : 'bg-white hover:bg-amber-50/70 text-gray-700 hover:text-gray-950 border border-gray-200/90 hover:border-amber-300 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-gray-950 stroke-[2.5]' : 'text-amber-500/80 group-hover:text-amber-600'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4-COLUMN READER CARDS GRID - EXACT SAME DESIGN AS HOMEPAGE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {visibleReaders.map((reader) => {
            const imageUrl = reader.image_url || reader.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80';
            const expYears = reader.experience_years ?? reader.experienceYears ?? 8;

            return (
              <div
                key={reader.id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* TOP: Full-width Photo with Top-Left Rating Pill and Bottom-Left Online Pill */}
                <div 
                  onClick={() => onViewProfile(reader)}
                  className="relative w-full h-52 sm:h-56 overflow-hidden bg-gray-100 cursor-pointer"
                >
                  <img
                    src={imageUrl}
                    alt={reader.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Top-Left Rating Badge: ★ 4.98 in dark purple pill */}
                  <div className="absolute top-3 left-3 bg-[#1e1338]/85 text-[#fde047] text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-xs">
                    <span className="text-xs">★</span>
                    <span className="text-white font-semibold">{(reader.rating && reader.rating < 5.0 ? reader.rating : 4.98).toFixed(2)}</span>
                  </div>

                  {/* Astrologer ID badge top-right */}
                  {reader.astroId && (
                    <div className="absolute top-3 right-3 bg-black/60 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {reader.astroId}
                    </div>
                  )}

                  {/* Bottom-Left Online Pill: ● Online in green pill */}
                  {reader.isOnline && (
                    <div className="absolute bottom-3 left-3 bg-[#15803d]/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Online</span>
                    </div>
                  )}
                </div>

                {/* BOTTOM: Centered Info, Chat Button, and Dynamic Price */}
                <div className="p-4 sm:p-5 flex flex-col items-center text-center justify-between flex-1 bg-white">
                  <div className="w-full flex flex-col items-center">
                    {/* Reader Name */}
                    <h3
                      onClick={() => onViewProfile(reader)}
                      className="font-bold text-gray-950 text-base sm:text-lg leading-snug hover:text-amber-700 transition-colors cursor-pointer truncate max-w-full h-7 flex items-center justify-center"
                      title={reader.name}
                    >
                      {reader.name}
                    </h3>

                    {/* Row 1: Exp & Specialization */}
                    <div className="h-5 flex items-center justify-center gap-2 mt-1.5 text-xs">
                      <span className="font-semibold text-purple-900">
                        Exp: {expYears} yrs
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="font-semibold text-gray-700 truncate max-w-[140px]">
                        {reader.category || 'Expert'}
                      </span>
                    </div>

                    {/* Row 2: Skills Badges */}
                    <div className="h-6 flex items-center justify-center mt-1 text-xs truncate max-w-full px-2">
                      <span className="text-gray-700 font-medium truncate">
                        {getReaderSkillBadges(reader).map(b => b.label).join(' · ')}
                      </span>
                    </div>
                  </div>

                  <div className="w-full mt-4">
                    {/* Yellow/Gold Chat Button */}
                    <button
                      type="button"
                      onClick={() => onStartChat(reader)}
                      className="w-full py-2 px-4 rounded-xl border border-amber-300 text-gray-950 font-bold text-sm bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                      title={`Chat with ${reader.name}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat Now</span>
                    </button>

                    {/* Dynamic Price per minute */}
                    {(() => {
                      const priceInfo = formatCurrencyPrice(reader.ratePerMinute, currentCurrency);
                      return (
                        <div className="flex items-center justify-center gap-1.5 mt-2.5">
                          <span className="font-black text-gray-950 text-base sm:text-lg">
                            {priceInfo.currentPrice}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">/min</span>
                          <span className="text-rose-500 line-through text-xs font-semibold ml-1">
                            {priceInfo.originalPrice}/min
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Pagination & Load More Controls */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="text-xs font-semibold text-gray-500">
            Displaying <span className="font-bold text-gray-900">{visibleReaders.length}</span> of <span className="font-bold text-gray-900">{filteredReaders.length}</span> astrologers
          </div>

          {displayCount < filteredReaders.length ? (
            <button
              type="button"
              onClick={() => setDisplayCount(prev => prev + 24)}
              className="px-9 py-3 rounded-full bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 active:scale-98 text-gray-950 font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Load More ({filteredReaders.length - displayCount} remaining)</span>
              <span>→</span>
            </button>
          ) : (
            <div className="text-xs text-gray-400 font-medium">
              All {filteredReaders.length} astrologers &amp; readers are displayed.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
