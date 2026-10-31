import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, ChevronDown, Check, Sparkles, MessageSquare, 
  Wallet, Flame, Compass, Layers, ShoppingBag, ArrowRight, User, Heart, Star, ShieldCheck
} from 'lucide-react';
import { LumysicLogo } from './LumysicLogo';
import { getCurrencySymbol } from '../utils/currency';

export interface HeaderProps {
  onStartReading: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenExplorer?: (categoryId?: string) => void;
  onOpenBirthChartModal?: () => void;
  onOpenProfile?: () => void;
  onOpenLogin?: () => void;
  isAuthenticated?: boolean;
  onOpenSearch?: () => void;
  onOpenAudio?: () => void;
  onOpenDrawer?: () => void;
  currentLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
  currentCurrency?: string;
  onSelectCurrency?: (cur: string) => void;
  walletBalance?: number;
  onOpenWallet?: () => void;
  isOwnerAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenAstrologerDashboard?: () => void;
}

// Quick suggestions for the search bar
const TRENDING_SEARCHES = [
  { label: 'Best In Love Readings', icon: Heart, sectionId: 'readers' },
  { label: 'Love Compatibility', icon: Heart, sectionId: 'compatibility' },
  { label: "Today's Horoscope", icon: Compass, sectionId: 'horoscope' },
  { label: 'Daily Tarot Oracle', icon: Layers, sectionId: 'tarot' },
  { label: 'Consecrated Rituals & Spells', icon: Flame, sectionId: 'rituals' },
  { label: 'LUMSIC Sacred Store', icon: ShoppingBag, sectionId: 'shop' },
];

const POPULAR_ASTROLOGERS = [
  { name: 'Dr. Alistair Thorne', specialty: 'Vedic & Karmic Astrology', rating: '4.98' },
  { name: 'Genevieve Laurent', specialty: 'Tarot & Twin Flame Clarity', rating: '4.99' },
  { name: 'Pandit Rameshwar', specialty: 'Kundli & Dosha Remedies', rating: '4.97' },
];

export const Header: React.FC<HeaderProps> = ({
  onStartReading,
  onNavigateSection,
  onOpenExplorer,
  onOpenBirthChartModal,
  onOpenProfile,
  onOpenLogin,
  isAuthenticated = false,
  onOpenSearch,
  onOpenAudio,
  onOpenDrawer,
  currentLanguage = 'en',
  onSelectLanguage,
  currentCurrency = 'USD',
  onSelectCurrency,
  walletBalance = 0,
  onOpenWallet,
  isOwnerAdmin = false,
  onOpenAdmin,
  onOpenAstrologerDashboard
}) => {
  // Navigation & Menu States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [showWalletTooltip, setShowWalletTooltip] = useState(false);

  // Scroll states for shrinking & auto-hide behavior
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Sync wallet balance from localStorage fallback if not passed directly
  const [effectiveBalance, setEffectiveBalance] = useState<number>(walletBalance);

  useEffect(() => {
    const updateBal = () => {
      const savedRecharge = parseFloat(localStorage.getItem('astral_recharge_bal') || '0');
      const savedWallet = parseFloat(localStorage.getItem('astral_wallet_bal') || '0');
      const total = savedRecharge + savedWallet;
      setEffectiveBalance(walletBalance > 0 ? walletBalance : total);
    };
    updateBal();
    window.addEventListener('storage', updateBal);
    return () => window.removeEventListener('storage', updateBal);
  }, [walletBalance]);

  // Scroll listener for sticky shrink and hide/show on mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Shrunk state past 20px
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide on scroll down, show on scroll up (with a 8px buffer)
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current + 8) {
          setShowHeader(false);
        } else if (currentScrollY < lastScrollY.current - 8) {
          setShowHeader(true);
        }
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to toggle Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 1024) {
          setMobileSearchOpen(prev => !prev);
        } else {
          setDesktopSearchOpen(prev => !prev);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }
      }
      if (e.key === 'Escape') {
        setDesktopSearchOpen(false);
        setMobileSearchOpen(false);
        setLangDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus mobile input when overlay opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [mobileSearchOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-search-box]')) {
        setDesktopSearchOpen(false);
      }
      if (!target.closest('[data-lang-box]')) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handler
  const handleNav = (sectionId: string) => {
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  // Wallet trigger
  const handleWalletClick = () => {
    if (onOpenWallet) {
      onOpenWallet();
    } else if (onOpenProfile) {
      onOpenProfile();
    } else {
      handleNav('wallet');
    }
  };

  // Search submit
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const q = searchQuery.toLowerCase();
    if (q.includes('horoscope') || q.includes('rashi') || q.includes('sign')) {
      handleNav('horoscope');
    } else if (q.includes('tarot') || q.includes('card')) {
      handleNav('tarot');
    } else if (q.includes('kundli') || q.includes('chart') || q.includes('birth')) {
      handleNav('birth-chart');
    } else if (q.includes('spell') || q.includes('ritual') || q.includes('healing')) {
      handleNav('rituals');
    } else if (q.includes('shop') || q.includes('ring') || q.includes('magnet') || q.includes('gem')) {
      handleNav('shop');
    } else {
      if (onOpenSearch) onOpenSearch();
      else handleNav('readers');
    }
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const navLinks = [
    { id: 'horoscope', label: 'Horoscope' },
    { id: 'tarot', label: 'Tarot' },
    { id: 'birth-chart', label: 'Kundli' },
    { id: 'rituals', label: 'Rituals' },
    { id: 'shop', label: 'Shop', badge: 'New' },
    { id: 'learn', label: 'Learn' },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full select-none transition-all duration-300 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled 
            ? 'bg-[#070B1F]/95 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] border-b border-[#F5C542]/20' 
            : 'bg-[#070B1F]/90 backdrop-blur-xl border-b border-[#F5C542]/15 shadow-lg'
        }`}
      >
        {/* Subtle top star glow accent */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5C542]/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div 
            className={`flex items-center justify-between gap-2.5 sm:gap-4 transition-all duration-300 ${
              isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
            }`}
          >
            {/* =========================================================================
                1. LEFT: HAMBURGER (SMOOTH MORPH) + BRAND LOGO (LUMSIC)
            ========================================================================= */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Animated Hamburger Icon */}
              <button
                type="button"
                onClick={onOpenDrawer ? onOpenDrawer : () => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-[#F6D06E]/40 hover:border-[#F6D06E] flex items-center justify-center text-[#F6D06E] shadow-[0_0_10px_rgba(246,208,110,0.12)] transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#F5C542]/50"
                aria-label="Toggle navigation drawer"
                title="Open Navigation Menu"
              >
                <div className="w-4.5 h-3.5 flex flex-col justify-between items-center">
                  <span 
                    className={`h-0.5 w-full bg-[#F6D06E] rounded-full transition-all duration-300 origin-left ${
                      mobileMenuOpen ? 'rotate-45 translate-x-0.5 -translate-y-0.5' : ''
                    }`} 
                  />
                  <span 
                    className={`h-0.5 w-full bg-[#F6D06E] rounded-full transition-all duration-200 ${
                      mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`} 
                  />
                  <span 
                    className={`h-0.5 w-full bg-[#F6D06E] rounded-full transition-all duration-300 origin-left ${
                      mobileMenuOpen ? '-rotate-45 translate-x-0.5 translate-y-0.5' : ''
                    }`} 
                  />
                </div>
              </button>

              {/* BRAND / LOGO: LUMSIC */}
              <a
                href="#home"
                onClick={(e) => { e.preventDefault(); handleNav('home'); }}
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
                title="LUMSIC - Light • Mystic • Guidance"
                aria-label="LUMSIC Home"
              >
                {/* Round logo emblem with gold orbit rings and soft glow */}
                <div className="relative group-hover:scale-105 transition-transform duration-300">
                  <LumysicLogo size={38} glow={false} />
                  <span className="absolute inset-0 rounded-full bg-[#F6D06E]/20 blur-md pointer-events-none group-hover:bg-[#F6D06E]/40 transition-colors" />
                </div>

                {/* LUMSIC Typography + Tagline (Warm consistent yellowish gold) */}
                <div className="flex flex-col">
                  <span 
                    className="font-serif font-black tracking-[0.24em] text-lg sm:text-xl lg:text-[22px] bg-gradient-to-r from-[#FFF5C8] via-[#F6D06E] to-[#D4A034] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(246,208,110,0.35)] group-hover:brightness-110 transition-all leading-tight"
                    style={{
                      fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif"
                    }}
                  >
                    LUMSIC
                  </span>
                  <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.18em] text-[#FCE38A]/80 uppercase font-semibold hidden sm:block leading-none mt-0.5">
                    Light • Mystic • Guidance
                  </span>
                </div>
              </a>
            </div>

            {/* =========================================================================
                2. DESKTOP SEARCH BAR (PILL-SHAPED GLASS IN CENTRE + ⌘K SHORTCUT)
            ========================================================================= */}
            <div className="hidden lg:block relative" data-search-box>
              <div 
                onClick={() => setDesktopSearchOpen(true)}
                className={`relative flex items-center gap-2.5 rounded-full bg-white/[0.05] border transition-all duration-200 cursor-pointer ${
                  desktopSearchOpen 
                    ? 'w-72 xl:w-88 border-[#F5C542] ring-2 ring-[#F5C542]/40 bg-[#0B1030] shadow-[0_0_20px_rgba(245,197,66,0.25)]' 
                    : 'w-56 xl:w-72 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                } px-3.5 py-2`}
              >
                <Search className={`w-4 h-4 shrink-0 transition-colors ${desktopSearchOpen ? 'text-[#F5C542]' : 'text-[#A8B0D0]'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setDesktopSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                  }}
                  placeholder="Search astrologers, horoscope, tarot…"
                  className="bg-transparent text-xs text-white placeholder-[#A8B0D0]/70 w-full focus:outline-hidden font-normal"
                />
                
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="p-0.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9.5px] font-mono text-[#A8B0D0] bg-white/[0.08] border border-white/10 rounded-md shrink-0 select-none">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Desktop Search Dropdown */}
              <AnimatePresence>
                {desktopSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 w-[380px] bg-[#070B1F]/98 backdrop-blur-2xl border border-[#F5C542]/30 rounded-2xl shadow-2xl p-4 z-50 text-xs"
                  >
                    {/* Header indicator */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] font-semibold text-[#A8B0D0]">
                      <span className="flex items-center gap-1.5 text-[#F5C542]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Quick Discover</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Esc to close</span>
                    </div>

                    {/* Trending Searches */}
                    <div className="mb-3">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#A8B0D0] mb-2 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Trending Searches</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {TRENDING_SEARCHES.map((t, idx) => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleNav(t.sectionId)}
                              className="w-full text-left p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#F5C542]/40 border border-transparent transition-all flex items-center gap-2 group cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 text-[#F5C542] shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="text-slate-200 group-hover:text-white truncate font-medium text-[11px]">
                                {t.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Astrologers */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#A8B0D0] mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#F5C542]" />
                        <span>Popular Astrologers</span>
                      </div>
                      <div className="space-y-1">
                        {POPULAR_ASTROLOGERS.map((a, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleNav('readers')}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] flex items-center justify-between text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="font-semibold text-white text-[11px]">{a.name}</div>
                              <div className="text-[10px] text-[#A8B0D0]">{a.specialty}</div>
                            </div>
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded-sm">
                              ★ {a.rating}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* View all search button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenSearch) onOpenSearch();
                        else handleNav('readers');
                        setDesktopSearchOpen(false);
                      }}
                      className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-[#F5C542]/20 to-[#FFD86B]/20 hover:from-[#F5C542]/30 hover:to-[#FFD86B]/30 border border-[#F5C542]/40 text-[#F5C542] hover:text-white font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Explore Global Search Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* =========================================================================
                3. DESKTOP NAVIGATION LINKS WITH ANIMATED GOLD UNDERLINE
            ========================================================================= */}
            <nav className="hidden lg:flex items-center h-full gap-5 xl:gap-6 text-[13.5px] font-medium text-slate-200">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className="relative py-2 text-slate-200 hover:text-[#F5C542] transition-colors cursor-pointer whitespace-nowrap group flex items-center gap-1 font-medium"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-gradient-to-r from-[#F5C542] to-[#FFB703] text-gray-950 px-1.5 py-0.2 rounded-full font-black uppercase tracking-tight shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  {/* Animated Gold Underline on hover */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#F5C542] to-[#FFD86B] group-hover:w-full transition-all duration-300 rounded-full" />
                </button>
              ))}
            </nav>

            {/* =========================================================================
                4. RIGHT CONTROLS: WALLET PILL + NOTIFICATIONS + CHAT CTA + AVATAR
            ========================================================================= */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* OWNER ADMIN BUTTON (Strictly for owner bankush014@gmail.com) */}
              {isOwnerAdmin && onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 h-9 sm:h-9.5 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-600/25 hover:from-amber-500/35 hover:to-amber-600/35 border border-amber-400/80 text-amber-300 hover:text-amber-100 text-xs font-bold transition-all shadow-[0_0_14px_rgba(245,197,66,0.35)] hover:shadow-[0_0_22px_rgba(245,197,66,0.6)] active:scale-95 cursor-pointer shrink-0"
                  title="Open Admin Command Center"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline font-semibold tracking-wide">Admin Panel</span>
                </button>
              )}

              {/* ASTROLOGER DASHBOARD BUTTON */}
              {isOwnerAdmin && onOpenAstrologerDashboard && (
                <button
                  type="button"
                  onClick={onOpenAstrologerDashboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 h-9 sm:h-9.5 rounded-full bg-gradient-to-r from-indigo-600/30 via-indigo-500/30 to-purple-600/30 hover:from-indigo-600/40 hover:to-purple-600/40 border border-indigo-400/80 text-indigo-200 hover:text-white text-xs font-bold transition-all shadow-[0_0_14px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] active:scale-95 cursor-pointer shrink-0"
                  title="Open Astrologer Workstation & Live Console"
                >
                  <Compass className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="hidden sm:inline font-semibold tracking-wide">Astrologer Dashboard</span>
                </button>
              )}

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-[#F6D06E]/40 hover:border-[#F6D06E] text-[#F6D06E] hover:bg-white/[0.08] active:scale-95 shadow-[0_0_10px_rgba(246,208,110,0.12)] transition-all cursor-pointer"
                aria-label="Open search"
                title="Search Lumysic"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* PREMIUM WALLET PILL */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={handleWalletClick}
                  onMouseEnter={() => setShowWalletTooltip(true)}
                  onMouseLeave={() => setShowWalletTooltip(false)}
                  className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-[#0B1030]/90 to-[#070B1F]/90 border border-[#F5C542]/50 hover:border-[#F5C542] shadow-[0_0_12px_rgba(245,197,66,0.18)] hover:shadow-[0_0_20px_rgba(245,197,66,0.4)] active:scale-95 transition-all cursor-pointer group backdrop-blur-md shrink-0 h-9 sm:h-9.5"
                  title="Recharge Wallet"
                  aria-label="Recharge Wallet"
                >
                  {/* Glowing gold wallet icon */}
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C542] shrink-0 group-hover:scale-110 transition-transform" />
                  
                  {/* Accurate formatted currency balance */}
                  <div className="flex items-baseline gap-0.5 font-mono">
                    <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-[#F5C542] transition-colors whitespace-nowrap">
                      {getCurrencySymbol(currentCurrency)}{Number(effectiveBalance || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Round Gold Plus Button */}
                  <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-gradient-to-tr from-[#F5C542] to-[#FFD86B] text-[#070B1F] font-black text-[10px] sm:text-xs flex items-center justify-center shadow-xs group-hover:rotate-90 transition-transform shrink-0">
                    +
                  </div>
                </button>

                {/* Floating Tooltip */}
                <AnimatePresence>
                  {showWalletTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#0B1030] border border-[#F5C542]/40 text-slate-200 text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none"
                    >
                      <span>Add funds to recharge wallet</span>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0B1030] border-t border-l border-[#F5C542]/40 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Automatic Country-Based Currency Display */}
<div className="hidden xl:flex items-center shrink-0 px-2.5 py-1.5 h-9 rounded-xl text-xs font-bold text-slate-200 bg-white/[0.04] border border-white/10">
  <span className="text-[#F5C542]">{currentCurrency}</span>
  <span className="ml-1 text-slate-400">Auto</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. MOBILE FULL-WIDTH ANIMATED SEARCH OVERLAY (SLIDE DOWN)
        ========================================================================= */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-[#070B1F]/98 backdrop-blur-2xl border-b border-[#F5C542]/30 p-4 shadow-2xl z-50"
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 mb-3">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-[#F5C542] absolute left-3.5 pointer-events-none" />
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search astrologers, horoscope, tarot…"
                    className="w-full pl-9 pr-9 py-2.5 rounded-full bg-white/[0.08] border border-[#F5C542]/40 text-white placeholder-[#A8B0D0]/70 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#F5C542]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>

              {/* Mobile Quick Suggestions */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#A8B0D0] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Trending Topics</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TRENDING_SEARCHES.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleNav(t.sectionId)}
                      className="text-left p-2 rounded-xl bg-white/[0.04] text-[11px] text-slate-200 hover:text-white border border-white/5 active:scale-95 transition-all truncate"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            6. MOBILE SLIDE-OUT MENU OVERLAY
        ========================================================================= */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-[#070B1F]/98 border-t border-white/10 px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl text-white"
            >
              {/* Primary Call to Action */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartReading();
                }}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#F5C542] via-[#FFD86B] to-[#FFB703] text-[#070B1F] font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-[#070B1F]" />
                <span>Start Free Chat with Psychics</span>
              </button>

              {/* Menu Links */}
              <div className="space-y-1 divide-y divide-white/5 text-sm font-medium text-slate-200">
                {[
                  { label: 'Chat With Psychic (Live)', id: 'readers' },
                  { label: '💖 Best In Love Readings', id: 'readers' },
                  { label: "Today's Horoscope", id: 'horoscope' },
                  { label: 'Daily Tarot Oracle', id: 'tarot' },
                  { label: 'Love Compatibility Score', id: 'compatibility' },
                  { label: 'Consecrated Rituals & Spells', id: 'rituals' },
                  { label: 'LUMSIC Sacred Store (New)', id: 'shop' },
                  { label: 'Articles, Vlogs & Guides', id: 'learn' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className="w-full text-left py-2.5 px-2 hover:bg-white/10 rounded-lg transition-colors block text-slate-200 hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Bottom Quick Row */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="text-[#F5C542] hover:text-white font-bold py-1 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile &amp; Orders</span>
                </button>
                <span className="text-[11px] text-slate-400">LUMSIC Sanctuary</span>
              </div>
          </motion.div>
          )}
                </AnimatePresence>
        </div>
      </header>
    </>
  );
};