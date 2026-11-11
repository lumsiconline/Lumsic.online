import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Search, ShoppingBag, X, Check, 
  MessageCircle, ShieldCheck, Sparkles, Flame,
  Zap, Heart, Trash2, ArrowRight, Star, Clock, 
  Calendar, CheckCircle2, User, Phone, MapPin, 
  Filter, HelpCircle, Gift, Layers, ChevronDown, Globe
} from 'lucide-react';
import { SACRED_RITUALS_AND_SPELLS } from '../data/spells';
import { RitualSpell } from '../types';
import { 
  CountryInfo, 
  detectUserGeo, 
  COUNTRIES, 
  SUPPORTED_CURRENCIES, 
  convertInrToCurrency, 
  convertUsdToCurrency 
} from '../utils/currency';

interface AstralStoreWhiteViewProps {
  onGoBack?: () => void;
  currentCurrency?: string;
  initialMainTab?: 'rituals' | 'shop';
  onCurrencyChange?: (currency: string) => void;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: 'Zodiac' | 'Ring' | 'Bracelet' | 'Vastu & Home' | 'Karungali' | 'Rudraksha' | 'Gemstones';
  rashi?: string;
  mulank?: number;
  priceINR: number;
  originalPriceINR: number;
  discountPercent: number;
  image: string;
  badge?: string;
  freebie?: string;
  rating: number;
  reviewCount: number;
  description: string;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

// Certified Consecrated Products List (Vedic & Astrological)
export const FESTIVE_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'prod-leo-zodiac-metal',
    name: 'Leo Zodiac Metal Bracelet with FREE Raw Selenite Plate',
    category: 'Zodiac',
    rashi: 'Leo / सिंह (23 Jul - 22 Aug)',
    priceINR: 999,
    originalPriceINR: 1700,
    discountPercent: 41,
    image: 'https://images.unsplash.com/photo-1611591475870-87779d724976?auto=format&fit=crop&w=800&q=80',
    badge: 'FREE Raw Selenite Plate',
    freebie: 'Tiger Eye & Citrine Stone Beads included',
    rating: 4.98,
    reviewCount: 2420,
    description: 'Authentic Leo constellation brass-metal bar with Tiger Eye & Citrine beads. Consecrated with Sun Gayatri mantra for leadership, charisma, and financial victory.'
  },
  {
    id: 'prod-pyrite-stud-ring',
    name: 'Pyrite Stud Ring for Wealth & Abundance',
    category: 'Ring',
    priceINR: 799,
    originalPriceINR: 1400,
    discountPercent: 43,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    badge: 'Bestseller',
    rating: 4.96,
    reviewCount: 1890,
    description: 'Natural Peruvian golden pyrite gemstone hand-studded in pure 925 sterling silver plated adjustable band. Attracts uninterrupted cash flow and shielding.'
  },
  {
    id: 'prod-mulank-4-rahu',
    name: 'Mulank 4 Rahu Crystal Bracelet with FREE Raw Selenite Plate',
    category: 'Bracelet',
    mulank: 4,
    priceINR: 999,
    originalPriceINR: 2700,
    discountPercent: 63,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    badge: 'FREE Raw Selenite Plate',
    freebie: 'Consecrated for Rahu Dosh Nivaran',
    rating: 4.99,
    reviewCount: 3120,
    description: 'Crafted for birth dates 4, 13, 22, 31 (Ruling Planet Rahu). Features natural Labradorite, Black Tourmaline, and Rahu talisman charm for mental clarity.'
  },
  {
    id: 'prod-super-dhan-yog-band',
    name: 'Super Dhan Yog Abundance Band',
    category: 'Bracelet',
    priceINR: 999,
    originalPriceINR: 1700,
    discountPercent: 41,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    badge: 'Super Abundance',
    freebie: 'Consecrated by Vedic Priests',
    rating: 4.97,
    reviewCount: 4580,
    description: 'The viral Kubera Dhan Yog magnet band. Triple-weave metallic hematite and shimmering green aventurine creating a continuous wealth frequency aura.'
  },
  {
    id: 'prod-kuber-yantra-gold',
    name: 'Shree Sampurna Dhan Laxmi Kuber Yantra (Gold Plated)',
    category: 'Vastu & Home',
    priceINR: 699,
    originalPriceINR: 1599,
    discountPercent: 56,
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    badge: 'Vastu Energized',
    rating: 4.95,
    reviewCount: 1240,
    description: 'Authentic 24k gold-plated brass Yantra embossed with complete 13 Vedic wealth yantras for home, office, and cash locker protection.'
  },
  {
    id: 'prod-karungali-silver-bracelet',
    name: 'Original Black Karungali Bracelet (Silver Plated)',
    category: 'Karungali',
    priceINR: 799,
    originalPriceINR: 1499,
    discountPercent: 47,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    badge: 'Ebony Wood',
    rating: 4.98,
    reviewCount: 2890,
    description: 'Sacred Ebony Karungali wood beads capped with pure silver plating. Known in Tamil tradition to absorb electromagnetic negativity and boost Mars vitality.'
  },
  {
    id: 'prod-5-mukhi-rudraksha-mala',
    name: 'Original 5 Mukhi Nepali Rudraksha Mala (108+1 Beads)',
    category: 'Rudraksha',
    priceINR: 899,
    originalPriceINR: 1999,
    discountPercent: 55,
    image: 'https://images.unsplash.com/photo-1609177659837-14e366050b18?auto=format&fit=crop&w=800&q=80',
    badge: 'Certified Genuine',
    rating: 5.0,
    reviewCount: 3950,
    description: 'Lab-certified authentic Nepali 5-Mukhi Rudraksha beads hand-knotted with silk tassel. Blessed by temple pujaris for peace of mind and Shiva grace.'
  },
  {
    id: 'prod-7-chakra-tree',
    name: '7 Chakra Natural Healing Crystal Energy Tree',
    category: 'Vastu & Home',
    priceINR: 1199,
    originalPriceINR: 2499,
    discountPercent: 52,
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    badge: '300 Gemstone Leaves',
    rating: 4.97,
    reviewCount: 1670,
    description: 'Handcrafted with genuine Amethyst, Lapis Lazuli, Clear Quartz, Green Aventurine, Yellow Citrine, Carnelian, and Red Jasper on natural wooden base.'
  }
];

/**
 * Resilient Image Component with Graceful Sacred Fallback
 * Never displays broken browser image icons or unformatted text!
 */
const ResilientImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  icon?: React.ReactNode;
  category?: string;
}> = ({ src, alt, className = '', icon, category }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-tr from-[#2E1065] via-[#4C1D95] to-[#1E1B4B] text-white select-none ${className}`}>
        <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 mb-1.5 shadow-inner">
          {icon || <Sparkles className="w-5 h-5" />}
        </div>
        <span className="text-[11px] font-bold tracking-tight text-amber-200 line-clamp-2 px-1 leading-tight font-serif">
          {alt}
        </span>
        {category && (
          <span className="text-[8.5px] uppercase tracking-wider text-purple-200 mt-1 font-semibold">
            ✦ {category} ✦
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export const AstralStoreWhiteView: React.FC<AstralStoreWhiteViewProps> = ({ 
  onGoBack,
  currentCurrency = 'INR',
  initialMainTab = 'rituals',
  onCurrencyChange
}) => {
  // Active currency with dynamic IP Auto-detection
  const [activeCurrency, setActiveCurrency] = useState<string>(() => {
    return localStorage.getItem('astral_currency') || currentCurrency || 'INR';
  });
  const [detectedCountry, setDetectedCountry] = useState<CountryInfo | null>(() => {
    const savedCode = localStorage.getItem('astral_country');
    return COUNTRIES.find(c => c.code.toUpperCase() === (savedCode || '').toUpperCase()) || null;
  });
  const [isDetectingIp, setIsDetectingIp] = useState<boolean>(true);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState<boolean>(false);

  // Auto-detect visitor's real IP and country on mount
  useEffect(() => {
    let isMounted = true;
    setIsDetectingIp(true);

    detectUserGeo(true).then(geo => {
      if (!isMounted) return;
      setIsDetectingIp(false);
      if (geo) {
        setDetectedCountry(geo);
        const hasManualOverride = localStorage.getItem('astral_currency_manual_override') === 'true';
        if (!hasManualOverride) {
          setActiveCurrency(geo.currency);
          onCurrencyChange?.(geo.currency);
        }
      }
    }).catch(() => {
      if (isMounted) setIsDetectingIp(false);
    });

    return () => { isMounted = false; };
  }, [onCurrencyChange]);

  // Sync if parent updates currentCurrency and no manual override
  useEffect(() => {
    if (currentCurrency && !localStorage.getItem('astral_currency_manual_override')) {
      setActiveCurrency(currentCurrency);
    }
  }, [currentCurrency]);

  const handleSelectCurrency = (currCode: string) => {
    setActiveCurrency(currCode);
    localStorage.setItem('astral_currency', currCode);
    localStorage.setItem('astral_currency_manual_override', 'true');
    const match = COUNTRIES.find(c => c.currency === currCode);
    if (match) {
      localStorage.setItem('astral_country', match.code);
      setDetectedCountry(match);
    }
    setIsCurrencyDropdownOpen(false);
    onCurrencyChange?.(currCode);
    showToast(`Currency updated to ${currCode}`);
  };

  // 1. PRIMARY DUAL TAB: 'rituals' (Healings & Pujas) vs 'shop' (Consecrated Products)
  const [mainTab, setMainTab] = useState<'rituals' | 'shop'>(initialMainTab);

  // Sub-category filters
  const [selectedRitualCategory, setSelectedRitualCategory] = useState<string>('All Healings');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('All Products');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  
  // Cart state for Shop Products
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [orderTrackingId, setOrderTrackingId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Express Delivery form state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Ritual Booking Drawer State
  const [selectedRitualForBooking, setSelectedRitualForBooking] = useState<RitualSpell | null>(null);
  const [ritualSeekerName, setRitualSeekerName] = useState<string>('');
  const [ritualSeekerDob, setRitualSeekerDob] = useState<string>('');
  const [ritualPartnerName, setRitualPartnerName] = useState<string>('');
  const [ritualPrayerIntent, setRitualPrayerIntent] = useState<string>('');
  const [ritualWhatsapp, setRitualWhatsapp] = useState<string>('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);
  const [ritualBookingSuccess, setRitualBookingSuccess] = useState<boolean>(false);
  const [ritualBookingId, setRitualBookingId] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Currency Converter & Price Formatter for Consecrated Physical Products
  const formatPrice = (p: StoreProduct) => {
    const current = convertInrToCurrency(p.priceINR, activeCurrency);
    const original = convertInrToCurrency(p.originalPriceINR, activeCurrency);
    return {
      current: current.formatted,
      original: original.formatted,
      rawCurrent: current.value,
      symbol: current.symbol,
      discountText: `${p.discountPercent}% off`
    };
  };

  // Currency Formatter for Sacred Rituals & Spells
  const formatRitualPrice = (spell: RitualSpell) => {
    const rawDisc = spell.discountPrice || 45;
    const rawOrig = spell.originalPrice || 85;
    const current = convertUsdToCurrency(rawDisc, activeCurrency);
    const original = convertUsdToCurrency(rawOrig, activeCurrency);
    const discPercent = Math.round(((rawOrig - rawDisc) / rawOrig) * 100);

    return {
      current: current.formatted,
      original: original.formatted,
      rawCurrent: current.value,
      symbol: current.symbol,
      discountText: `${discPercent}% off`
    };
  };

  // Cart total calculations
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotalAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = formatPrice(item.product);
      return sum + (p.rawCurrent * item.quantity);
    }, 0);
  }, [cart, activeCurrency]);

  const cartCurrencySymbol = useMemo(() => {
    return convertInrToCurrency(100, activeCurrency).symbol;
  }, [activeCurrency]);

  const handleAddToCart = (product: StoreProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name.slice(0, 24)}... to Bag`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      showToast('Please fill in your name, phone and delivery address.');
      return;
    }
    setIsSubmittingOrder(true);
    setTimeout(() => {
      const newOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setOrderTrackingId(newOrderId);
      setCheckoutSuccess(true);
      setIsSubmittingOrder(false);
      setCart([]);
      showToast('✦ Order confirmed! Consecration certificate will be dispatched.');
    }, 1200);
  };

  const handleBookRitualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ritualSeekerName || !ritualWhatsapp) {
      showToast('Please provide your name and WhatsApp number.');
      return;
    }
    setIsBookingSubmitting(true);
    setTimeout(() => {
      const bookingId = 'RITUAL-' + Math.floor(100000 + Math.random() * 900000);
      setRitualBookingId(bookingId);
      setRitualBookingSuccess(true);
      setIsBookingSubmitting(false);
      showToast('✦ Sacred Ritual scheduled! Priest will initiate altar vigil.');
    }, 1200);
  };

  // Sub-categories for Rituals
  const RITUAL_CATEGORIES = [
    'All Healings',
    'Love & Relationships',
    'Wealth & Abundance',
    'Protection & Nazar',
    'Health & Vitality',
    'Vedic Pujas'
  ];

  // Sub-categories for Shop
  const SHOP_CATEGORIES = [
    'All Products',
    'Zodiac',
    'Bracelets',
    'Rings',
    'Vastu & Home',
    'Karungali',
    'Rudraksha'
  ];

  // Filtered Rituals
  const filteredRituals = useMemo(() => {
    return SACRED_RITUALS_AND_SPELLS.filter(spell => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = spell.name.toLowerCase().includes(q);
        const matchesDesc = spell.description.toLowerCase().includes(q);
        const matchesPractitioner = spell.practitionerName.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesPractitioner) return false;
      }

      // Category filter
      if (selectedRitualCategory === 'All Healings') return true;
      if (selectedRitualCategory === 'Love & Relationships') return spell.category === 'love';
      if (selectedRitualCategory === 'Wealth & Abundance') return spell.category === 'prosperity';
      if (selectedRitualCategory === 'Protection & Nazar') return spell.category === 'protection';
      if (selectedRitualCategory === 'Health & Vitality') return spell.category === 'healing';
      if (selectedRitualCategory === 'Vedic Pujas') return spell.type === 'healing' || spell.practitionerRole.toLowerCase().includes('vedic');
      return true;
    });
  }, [searchQuery, selectedRitualCategory]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return FESTIVE_STORE_PRODUCTS.filter(product => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      // Category filter
      if (selectedProductCategory === 'All Products') return true;
      if (selectedProductCategory === 'Zodiac') return product.category === 'Zodiac';
      if (selectedProductCategory === 'Bracelets') return product.category === 'Bracelet';
      if (selectedProductCategory === 'Rings') return product.category === 'Ring';
      if (selectedProductCategory === 'Vastu & Home') return product.category === 'Vastu & Home';
      if (selectedProductCategory === 'Karungali') return product.category === 'Karungali';
      if (selectedProductCategory === 'Rudraksha') return product.category === 'Rudraksha';
      return true;
    });
  }, [searchQuery, selectedProductCategory]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-[#3B0764] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-purple-400/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. TOP UTILITY STRIP & BACK NAVIGATION + IP CURRENCY SELECTOR (MOBILE FIRST)
      ========================================================================= */}
      <div className="bg-[#3B0764] text-white text-xs px-3.5 py-2 flex items-center justify-between z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Sanctuary</span>
            </button>
          )}
        </div>

        {/* Auto-detected IP Location & Currency Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold transition cursor-pointer border border-white/20"
            title="Auto-detected currency based on your IP (tap to switch)"
          >
            <span className="text-sm leading-none">{detectedCountry?.flag || (activeCurrency === 'INR' ? '🇮🇳' : '🌐')}</span>
            <span className="text-amber-300 font-black">{activeCurrency}</span>
            <span className="text-purple-200">({cartCurrencySymbol.trim()})</span>
            <ChevronDown className={`w-3 h-3 text-purple-200 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCurrencyDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsCurrencyDropdownOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-purple-100 py-2 z-50 text-gray-800 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 flex items-center justify-between">
                  <span>Detected by IP</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] font-bold">
                    {detectedCountry ? `${detectedCountry.flag} ${detectedCountry.name}` : 'Auto IP'}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 py-1">
                  {SUPPORTED_CURRENCIES.map(curr => {
                    const isSelected = activeCurrency === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => handleSelectCurrency(curr.code)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-purple-50 transition cursor-pointer text-xs ${
                          isSelected ? 'bg-purple-50 font-bold text-[#581C87]' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{curr.flag || '🌐'}</span>
                          <div className="flex flex-col">
                            <span className="leading-tight font-semibold text-gray-900">{curr.label}</span>
                            <span className="text-[10px] text-gray-400 leading-tight">{curr.name}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#581C87]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic IP Price Location Indicator Strip */}
      <div className="bg-gradient-to-r from-amber-50/90 via-purple-50/70 to-amber-50/90 border-b border-purple-100/80 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-gray-700">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#581C87] shrink-0" />
          <span className="truncate">
            Prices adjusted by IP: <strong className="text-[#3B0764]">{detectedCountry?.name || (activeCurrency === 'INR' ? 'India' : 'Local Region')}</strong> ({activeCurrency} {cartCurrencySymbol.trim()})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCurrencyDropdownOpen(true)}
          className="text-[10.5px] font-bold text-[#581C87] underline hover:text-purple-950 shrink-0 ml-2 cursor-pointer"
        >
          Change Currency
        </button>
      </div>

      {/* =========================================================================
          2. STORE HEADER: BRAND IDENTITY + SEARCH + CART (MOBILE ALIGNED)
      ========================================================================= */}
      <header className="border-b border-gray-100 bg-white sticky top-[60px] z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center text-[#3B0764] font-black text-sm shadow-xs border border-amber-300">
              ✦
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900 font-sans leading-none">
                lumsic<span className="text-[#6B21A8]">.store</span>
              </span>
              <span className="text-[8.5px] uppercase tracking-widest text-amber-800 font-bold mt-0.5 leading-none">
                Sacred Cosmic Shop &amp; Healings
              </span>
            </div>
          </div>

          {/* Right Controls: Search + Cart Icon */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
              title="Search"
              aria-label="Search items"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-xl bg-[#581C87] hover:bg-[#4C1D95] active:scale-95 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold">{totalCartCount}</span>
            </button>
          </div>

        </div>

        {/* Collapsible Mobile Search Bar */}
        {isSearchOpen && (
          <div className="bg-purple-50/60 border-t border-purple-100 px-3.5 py-2.5 animate-in slide-in-from-top-1 duration-150">
            <div className="max-w-md mx-auto relative flex items-center">
              <Search className="w-3.5 h-3.5 text-purple-700 absolute left-3" />
              <input 
                type="text"
                autoFocus
                placeholder="Search 'Love Spell', 'Dhan Yog', 'Pyrite Ring'..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-xl pl-8.5 pr-8 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#581C87] shadow-xs"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          3. FIRST PRIMARY SECTION: TWO PROMINENT OPTIONS (RITUALS & SHOP)
          Specifically requested: "first show two options rituals and shop in rituals
          have all the healings and shop have products so do this"
      ========================================================================= */}
      <section className="bg-gradient-to-b from-white via-purple-50/30 to-[#FDFCFB] border-b border-purple-100/80 px-3.5 py-4">
        <div className="max-w-md mx-auto">
          
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-inner">
            
            {/* OPTION 1: RITUALS (HEALINGS & PUJAS) */}
            <button
              type="button"
              onClick={() => {
                setMainTab('rituals');
                setSearchQuery('');
              }}
              className={`relative flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-98 ${
                mainTab === 'rituals'
                  ? 'bg-gradient-to-r from-[#4A0E2E] via-[#5B1038] to-[#4A0E2E] text-white shadow-md shadow-purple-950/20 font-bold'
                  : 'text-gray-700 hover:text-gray-950 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${mainTab === 'rituals' ? 'text-amber-300' : 'text-amber-600'}`} />
                <span className="text-sm font-extrabold tracking-tight font-serif">
                  Rituals
                </span>
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${
                mainTab === 'rituals' ? 'text-amber-200' : 'text-gray-500'
              }`}>
                All Sacred Healings
              </span>

              {/* Active Golden Accent Line */}
              {mainTab === 'rituals' && (
                <span className="absolute -bottom-1 w-8 h-[2px] rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.8)]" />
              )}
            </button>

            {/* OPTION 2: SHOP (CONSECRATED PRODUCTS) */}
            <button
              type="button"
              onClick={() => {
                setMainTab('shop');
                setSearchQuery('');
              }}
              className={`relative flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-98 ${
                mainTab === 'shop'
                  ? 'bg-gradient-to-r from-[#581C87] via-[#6B21A8] to-[#581C87] text-white shadow-md shadow-purple-950/20 font-bold'
                  : 'text-gray-700 hover:text-gray-950 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShoppingBag className={`w-4 h-4 ${mainTab === 'shop' ? 'text-amber-300' : 'text-purple-700'}`} />
                <span className="text-sm font-extrabold tracking-tight font-serif">
                  Shop
                </span>
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${
                mainTab === 'shop' ? 'text-purple-200' : 'text-gray-500'
              }`}>
                Consecrated Products
              </span>

              {/* Active Golden Accent Line */}
              {mainTab === 'shop' && (
                <span className="absolute -bottom-1 w-8 h-[2px] rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.8)]" />
              )}
            </button>

          </div>

          {/* Quick Notice Banner below tabs */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10.5px] text-purple-900/80 font-medium text-center">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span>
              {mainTab === 'rituals' 
                ? 'Performed by Certified Vedic Priests & Solitary High Priestesses'
                : '100% Certified Consecrated Talismans, Pyrite Rings & Energy Bracelets'
              }
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. MAIN VIEWPORT CONTENT (MOBILE FOCUSED, CLEAN TYPOGRAPHY & ALIGNMENT)
      ========================================================================= */}
      <main className="max-w-md mx-auto w-full px-3.5 py-4 space-y-4">

        {/* =====================================================================
            A. RITUALS VIEW (ALL SACRED HEALINGS, PUJAS & SPELLS)
        ===================================================================== */}
        {mainTab === 'rituals' && (
          <div className="space-y-4">
            
            {/* Section Header */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span>CONSECRATED HEALINGS &amp; PUJAS</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {filteredRituals.length} Available
                </span>
              </div>
              <h1 className="font-serif text-xl font-black text-[#4A0E2E] tracking-tight leading-tight">
                Sacred Rituals &amp; Astrological Healings
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed">
                Choose your healing intention. Each sacred ceremony includes personalized altar vigils, mantra invocations, and photographic/video proof.
              </p>
            </div>

            {/* Horizontal Filter Scroll Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-3.5 px-3.5">
              {RITUAL_CATEGORIES.map(category => {
                const isActive = selectedRitualCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedRitualCategory(category);
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#4A0E2E] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Rituals Card List on Mobile */}
            {filteredRituals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
                <p className="text-xs text-gray-500">No healings found matching &quot;{searchQuery}&quot;.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRitualCategory('All Healings');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-bold text-[#4A0E2E] underline cursor-pointer"
                >
                  Show all healings
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredRituals.map(ritual => {
                  const price = formatRitualPrice(ritual);

                  return (
                    <div
                      key={ritual.id}
                      className="bg-white rounded-2xl border border-purple-100/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top Banner Image with Resilient Fallback */}
                      <div className="relative w-full h-44 overflow-hidden bg-purple-950">
                        <ResilientImage
                          src={ritual.imageUrl}
                          alt={ritual.name}
                          category={ritual.category.toUpperCase() + ' HEALING'}
                          icon={<Flame className="w-6 h-6 text-amber-300" />}
                          className="w-full h-full object-cover"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                          <span className="bg-[#4A0E2E]/90 backdrop-blur-xs text-amber-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-amber-300/30 shadow-xs">
                            {ritual.badge || 'Consecrated Altar Vigil'}
                          </span>

                          <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{ritual.rating || 4.98}</span>
                          </span>
                        </div>

                        {/* Duration Pill at bottom-right */}
                        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
                          <span className="bg-black/75 backdrop-blur-xs text-purple-200 text-[9.5px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-300" />
                            <span>{ritual.castDuration || '24-48 Hours'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-3.5 space-y-2.5">
                        
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                            {ritual.category.toUpperCase()} • SACRED ENERGY CEREMONY
                          </div>

                          <h3 className="font-serif font-extrabold text-gray-900 text-sm leading-snug mt-0.5">
                            {ritual.name}
                          </h3>

                          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                            {ritual.description}
                          </p>
                        </div>

                        {/* Practitioner Info */}
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-950">
                          <div className="w-6 h-6 rounded-full bg-purple-200/80 text-purple-900 font-bold flex items-center justify-center shrink-0 text-xs">
                            ✦
                          </div>
                          <div className="min-w-0 flex-1 truncate">
                            <span className="font-bold text-purple-950 block truncate">{ritual.practitionerName}</span>
                            <span className="text-[9.5px] text-purple-700 block truncate">{ritual.practitionerRole}</span>
                          </div>
                        </div>

                        {/* What is Included (2 bullets) */}
                        {ritual.includes && ritual.includes.length > 0 && (
                          <div className="space-y-1 text-[11px] text-gray-600 pt-0.5">
                            {ritual.includes.slice(0, 2).map((inc, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{inc}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Price & Action Row */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-black text-gray-950 font-sans">
                                {price.current}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                {price.original}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              {price.discountText} • Proof Included
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRitualForBooking(ritual);
                              setRitualBookingSuccess(false);
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A0E2E] to-[#6B21A8] hover:brightness-110 active:scale-95 text-white font-extrabold text-xs tracking-tight shadow-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Flame className="w-3.5 h-3.5 text-amber-300" />
                            <span>Book Ritual</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* =====================================================================
            B. SHOP VIEW (CONSECRATED TALISMANS, BRACELETS, YANTRAS & RINGS)
        ===================================================================== */}
        {mainTab === 'shop' && (
          <div className="space-y-4">
            
            {/* Section Header */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>SACRED PHYSICAL CREATIONS</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {filteredProducts.length} Items
                </span>
              </div>
              <h1 className="font-serif text-xl font-black text-[#3B0764] tracking-tight leading-tight">
                Consecrated Cosmic Store
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed">
                Handcrafted astrological metal bracelets, Peruvian pyrite wealth rings, and consecrated Vedic yantras with Free Raw Selenite Charging Plate included.
              </p>
            </div>

            {/* Horizontal Filter Scroll Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-3.5 px-3.5">
              {SHOP_CATEGORIES.map(category => {
                const isActive = selectedProductCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedProductCategory(category);
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#581C87] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Products Mobile List (Clean 1-column mobile cards preventing text overlap) */}
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
                <p className="text-xs text-gray-500">No products found matching &quot;{searchQuery}&quot;.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductCategory('All Products');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-bold text-[#581C87] underline cursor-pointer"
                >
                  Show all products
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredProducts.map(product => {
                  const price = formatPrice(product);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Product Image Frame with Resilient Fallback */}
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 p-2.5 flex items-center justify-center">
                        <ResilientImage
                          src={product.image}
                          alt={product.name}
                          category={product.category}
                          icon={<ShoppingBag className="w-6 h-6 text-amber-300" />}
                          className="w-full h-full object-cover rounded-xl"
                        />

                        {/* Free Raw Selenite Plate Badge (Matching Screenshot) */}
                        {product.badge && (
                          <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span className="bg-[#E11D48] text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md font-sans">
                              {product.badge}
                            </span>
                          </div>
                        )}

                        {/* Freebies Indicator */}
                        {product.freebie && (
                          <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                            <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded-sm block text-center truncate">
                              ✦ {product.freebie}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            {product.category}
                          </span>
                          <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{product.rating} ({product.reviewCount})</span>
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-gray-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>

                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Pricing Row: ₹999 ₹1,700 41% off */}
                        <div className="flex items-baseline gap-2 pt-1 font-sans">
                          <span className="text-lg font-black text-gray-950">
                            {price.current}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {price.original}
                          </span>
                          <span className="text-xs font-bold text-[#DC2626]">
                            {price.discountText}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 py-2.5 rounded-xl bg-[#581C87] hover:bg-[#4C1D95] active:scale-98 text-white text-xs font-extrabold uppercase tracking-wider shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>ADD TO CART</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* =========================================================================
          5. FLOATING WHATSAPP BUTTON (MATCHING SCREENSHOT)
      ========================================================================= */}
      <div className="fixed right-4 bottom-5 z-40">
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40 transition-transform active:scale-95 cursor-pointer"
          title="Chat with Specialist on WhatsApp"
          aria-label="WhatsApp Support"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#E11D48] text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white shadow-sm">
            1
          </span>
        </a>
      </div>

      {/* =========================================================================
          6. SACRED RITUAL BOOKING MODAL (DRAWER ON MOBILE)
      ========================================================================= */}
      {selectedRitualForBooking && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div 
            onClick={() => setSelectedRitualForBooking(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity cursor-pointer" 
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col justify-between z-10 animate-in slide-in-from-bottom duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-[#4A0E2E] to-[#6B21A8] text-white">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-300" />
                <h3 className="font-serif font-extrabold text-sm truncate">
                  Book Sacred Healing Ceremony
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedRitualForBooking(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-4 overflow-y-auto space-y-3.5">
              
              {/* Selected Ritual Preview */}
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-900 text-amber-300 flex items-center justify-center font-bold shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-xs text-gray-900 truncate">
                    {selectedRitualForBooking.name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-purple-900 mt-0.5">
                    <span>{selectedRitualForBooking.practitionerName}</span>
                    <strong className="text-gray-950 font-black">{formatRitualPrice(selectedRitualForBooking).current}</strong>
                  </div>
                </div>
              </div>

              {ritualBookingSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-black text-emerald-950 text-base">
                    Ceremony Scheduled Successfully!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Sacred Booking ID: <strong>{ritualBookingId}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Our consecrated priest will initiate your altar vigil. You will receive high-resolution photographic proof and invocation recording via WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedRitualForBooking(null)}
                    className="mt-3 px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookRitualSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Seeker Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full legal or birth name"
                      value={ritualSeekerName}
                      onChange={e => setRitualSeekerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#4A0E2E]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Date of Birth (Optional)
                      </label>
                      <input
                        type="date"
                        value={ritualSeekerDob}
                        onChange={e => setRitualSeekerDob(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#4A0E2E]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Partner&apos;s Name (if love ritual)
                      </label>
                      <input
                        type="text"
                        placeholder="Target person / partner"
                        value={ritualPartnerName}
                        onChange={e => setRitualPartnerName(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#4A0E2E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Your Sacred Prayer Intention / Focus
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Reconciliation with partner, removal of financial blockages, health recovery..."
                      value={ritualPrayerIntent}
                      onChange={e => setRitualPrayerIntent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#4A0E2E]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      WhatsApp / Mobile Number (For ceremony proof &amp; photos) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 / +1 / +44 phone number"
                      value={ritualWhatsapp}
                      onChange={e => setRitualWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#4A0E2E]"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[10.5px] text-amber-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>100% Confidential • Live Altar Vigil • Photographic Proof Provided</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isBookingSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4A0E2E] to-[#6B21A8] hover:brightness-110 active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                  >
                    {isBookingSubmitting ? 'Initiating Altar Booking...' : `Confirm Sacred Booking • ${formatRitualPrice(selectedRitualForBooking).current}`}
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          7. SHOPPING CART & EXPRESS CHECKOUT DRAWER (MOBILE SHEET)
      ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end animate-in fade-in duration-200">
          <div 
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" 
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/70">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#581C87]" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Your Sacred Bag ({totalCartCount})
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">Your bag is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Explore our consecrated festive creations</p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-5 py-2 rounded-full bg-[#581C87] text-white text-xs font-bold hover:bg-[#4C1D95]"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => {
                  const price = formatPrice(item.product);
                  return (
                    <div key={item.product.id} className="pt-3 flex gap-3 items-center justify-between">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                        <ResilientImage 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-baseline gap-1.5 text-xs mt-0.5">
                          <span className="font-bold text-gray-900">{price.current}</span>
                          <span className="text-gray-400 line-through text-[10px]">{price.original}</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-0.5">
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="text-gray-500 hover:text-black font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-gray-900 px-1">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="text-gray-500 hover:text-black font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product.id, -item.quantity)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer: Express Delivery Form & Subtotal */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/80 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="font-black text-gray-950 text-base">
                    {cartCurrencySymbol}{cartTotalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10.5px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Free Consecrated Cleansing &amp; Lab Certificate Included</span>
                </div>

                {checkoutSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
                    <Check className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-emerald-900">Order Placed Successfully!</p>
                    <p className="text-[11px] text-emerald-700">Tracking ID: <strong>{orderTrackingId}</strong></p>
                  </div>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-2 pt-1">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#581C87]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp Number"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#581C87]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Delivery Address & City"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#581C87]"
                    />

                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full py-3 rounded-xl bg-[#581C87] hover:bg-[#4C1D95] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      {isSubmittingOrder ? 'Processing Order...' : `Proceed to Place Order • ${cartCurrencySymbol}${cartTotalAmount.toLocaleString()}`}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
