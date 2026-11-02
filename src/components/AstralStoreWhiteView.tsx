import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, ShoppingBag, X, Check, 
  MessageCircle, ShieldCheck, Sparkles, ChevronDown,
  Zap, Heart, Trash2, ArrowRight
} from 'lucide-react';
import { formatCurrencyPrice } from '../utils/currency';

interface AstralStoreWhiteViewProps {
  onGoBack?: () => void;
  currentCurrency?: string;
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
    name: 'Pyrite Stud Ring',
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
    name: 'Super Dhan Yog Band',
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
    description: 'Lab-certified authentic Nepali 5-Mukhi Rudraksha beads hand-knotted with silk tassel. Blessed by temple pujaris for peace of mind, blood pressure harmony, and Shiva grace.'
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

export const AstralStoreWhiteView: React.FC<AstralStoreWhiteViewProps> = ({ 
  onGoBack,
  currentCurrency = 'INR'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Bestsellers');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [orderTrackingId, setOrderTrackingId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Delivery form state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Currency Converter & Price Formatter
  const formatPrice = (p: StoreProduct) => {
    // If currency is INR (matching the screenshot default ₹999, ₹1,700 41% off)
    if (currentCurrency === 'INR') {
      return {
        current: `₹${p.priceINR.toLocaleString('en-IN')}`,
        original: `₹${p.originalPriceINR.toLocaleString('en-IN')}`,
        rawCurrent: p.priceINR,
        discountText: `${p.discountPercent}% off`
      };
    }

    // Convert INR to target currency
    let rate = 1;
    let symbol = '$';
    if (currentCurrency === 'GBP') { rate = 0.010; symbol = '£'; }
    else if (currentCurrency === 'USD') { rate = 0.012; symbol = '$'; }
    else if (currentCurrency === 'EUR') { rate = 0.011; symbol = '€'; }
    else if (currentCurrency === 'CAD') { rate = 0.016; symbol = 'CA$'; }
    else if (currentCurrency === 'AUD') { rate = 0.018; symbol = 'A$'; }
    else if (currentCurrency === 'AED') { rate = 0.044; symbol = 'AED '; }

    const convertedCurrent = Math.round(p.priceINR * rate) || 12;
    const convertedOriginal = Math.round(p.originalPriceINR * rate) || 20;

    return {
      current: `${symbol}${convertedCurrent}`,
      original: `${symbol}${convertedOriginal}`,
      rawCurrent: convertedCurrent,
      discountText: `${p.discountPercent}% off`
    };
  };

  // Category filter pills
  const CATEGORY_PILLS = [
    'All Bestsellers',
    'Zodiac',
    'Bracelets',
    'Vastu & Home',
    'Karungali',
    'Gemstones',
    'Rudraksha'
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return FESTIVE_STORE_PRODUCTS.filter(p => {
      // Category match
      if (selectedCategory !== 'All Bestsellers') {
        if (selectedCategory === 'Bracelets' && p.category === 'Bracelet') return true;
        if (selectedCategory === 'Gemstones' && (p.category === 'Gemstones' || p.category === 'Ring')) return true;
        if (p.category !== selectedCategory) return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.rashi && p.rashi.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Cart operations
  const handleAddToCart = (product: StoreProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart!`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotalAmount = useMemo(() => {
    let sum = 0;
    cart.forEach(item => {
      const priceObj = formatPrice(item.product);
      sum += priceObj.rawCurrent * item.quantity;
    });
    return sum;
  }, [cart, currentCurrency]);

  const cartCurrencySymbol = currentCurrency === 'INR' ? '₹' : currentCurrency === 'GBP' ? '£' : currentCurrency === 'EUR' ? '€' : '$';

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      showToast('Please fill all shipping details');
      return;
    }
    setIsSubmittingOrder(true);
    setTimeout(() => {
      const tid = 'LUM-' + Math.floor(100000 + Math.random() * 900000);
      setOrderTrackingId(tid);
      setCheckoutSuccess(true);
      setIsSubmittingOrder(false);
      setCart([]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative selection:bg-purple-100 selection:text-purple-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#4C1D95] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          1. TOP UTILITY STRIP & BACK NAVIGATION
      ========================================================================= */}
      <div className="bg-[#4C1D95] text-white text-xs px-4 py-2 flex items-center justify-between z-40 sticky top-0 shadow-md">
        <div className="flex items-center gap-3">
          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sanctuary</span>
            </button>
          )}
          <span className="hidden sm:inline text-purple-200">•</span>
          <span className="hidden sm:inline text-amber-300 font-medium">
            ✦ 100% Certified Consecrated Talismans, Energy Bracelets &amp; Sacred Crystals ✦
          </span>
        </div>

        <div className="flex items-center gap-4 text-purple-200 text-xs">
          <span className="hidden md:inline">24/7 Vedic Astrologer Support</span>
          <span className="font-semibold text-white">Free Energized Cleansing Included</span>
        </div>
      </div>

      {/* =========================================================================
          2. STORE HEADER: BRAND LOGO + HORIZONTAL MEGA MENU DROPDOWNS + CART
      ========================================================================= */}
      <header className="border-b border-gray-100 bg-white sticky top-[37px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity matching screenshot layout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center text-[#4C1D95] font-black text-lg shadow-sm border border-amber-300">
              ✦
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 font-sans leading-none">
                lumsic<span className="text-[#5B21B6]">.store</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-amber-700 font-bold mt-0.5">
                Sacred Cosmic Shop
              </span>
            </div>
          </div>

          {/* Center: Astrotalk-Store format Category Dropdown Menu */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-gray-700">
            
            <div className="relative group">
              <button 
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'products' ? null : 'products')}
                className="flex items-center gap-1 hover:text-[#5B21B6] transition py-1 cursor-pointer"
              >
                <span>Products</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            <div className="relative group">
              <button 
                type="button"
                onClick={() => {
                  setSelectedCategory('Zodiac');
                  showToast('Showing Zodiac Collections');
                }}
                className="flex items-center gap-1 hover:text-[#5B21B6] transition py-1 cursor-pointer"
              >
                <span>Shop By Rashi</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            <div className="relative group">
              <button 
                type="button"
                onClick={() => {
                  setSelectedCategory('Bracelets');
                  showToast('Showing Mulank 1 to 9 Collections');
                }}
                className="flex items-center gap-1 hover:text-[#5B21B6] transition py-1 cursor-pointer"
              >
                <span>Shop By Mulank</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
            </div>

            <button 
              type="button"
              onClick={() => {
                setSearchQuery('Dhan Yog');
                showToast('Filtering Dhan Yog items');
              }}
              className="hover:text-[#5B21B6] transition py-1 cursor-pointer"
            >
              Dhan Yog
            </button>

            <button 
              type="button"
              onClick={() => {
                setSelectedCategory('Rudraksha');
                showToast('Showing Rudraksha Collections');
              }}
              className="flex items-center gap-1 hover:text-[#5B21B6] transition py-1 cursor-pointer"
            >
              <span>Rudraksha</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <button 
              type="button"
              onClick={() => {
                setSelectedCategory('Karungali');
                showToast('Showing Karungali Collections');
              }}
              className="flex items-center gap-1 hover:text-[#5B21B6] transition py-1 cursor-pointer"
            >
              <span>Karungali</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <button 
              type="button"
              onClick={() => {
                setSelectedCategory('Gemstones');
                showToast('Showing Gemstones & Rings');
              }}
              className="hover:text-[#5B21B6] transition py-1 cursor-pointer"
            >
              Gemstones
            </button>

            <button 
              type="button"
              onClick={() => {
                setSelectedCategory('Vastu & Home');
                showToast('Showing Vastu & Home Yantras');
              }}
              className="flex items-center gap-1 hover:text-[#5B21B6] transition py-1 cursor-pointer"
            >
              <span>Vastu</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <button 
              type="button"
              onClick={() => {
                if (onGoBack) onGoBack();
                else window.dispatchEvent(new CustomEvent('open_support_chat'));
              }}
              className="hover:text-[#5B21B6] transition py-1 cursor-pointer text-gray-500"
            >
              Contact us
            </button>
          </nav>

          {/* Right: Search, Offers, Cart Button with counter */}
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition cursor-pointer"
              title="Search store"
              aria-label="Search store"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Bestsellers');
                showToast('Showing Festive Bestsellers with up to 63% off');
              }}
              className="p-1.5 rounded-full hover:bg-amber-50 text-amber-600 transition cursor-pointer hidden sm:flex"
              title="Festive Flash Offers"
              aria-label="Flash Offers"
            >
              <Zap className="w-5 h-5 fill-amber-400 text-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] text-white flex items-center gap-2 transition-all cursor-pointer relative shadow-sm"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold hidden xs:inline">Cart</span>
              {totalCartCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                  {totalCartCount}
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">
                  0
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Collapsible Search Bar */}
        {isSearchOpen && (
          <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 animate-in slide-in-from-top-1 duration-150">
            <div className="max-w-xl mx-auto relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input 
                type="text"
                autoFocus
                placeholder="Search 'Leo Zodiac Bracelet', 'Pyrite Ring', 'Dhan Yog'..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pl-9.5 pr-8 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#5B21B6] shadow-2xs"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          3. MAIN STORE SECTION: "MOST LOVED THIS FESTIVE SEASON" (EXACT SCREENSHOT)
      ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Section Header with Festive Title */}
        <div className="text-center sm:text-left mb-6">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ONLINE BESTSELLERS</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#4A0E2E] tracking-tight">
              Most Loved This Festive Season
            </h1>

            {/* Filter Category Pills (All Bestsellers, Zodiac, Bracelets, Vastu & Home, Karungali, Gemstones, Rudraksha) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {CATEGORY_PILLS.map((pill) => {
                const isActive = selectedCategory === pill;
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(pill);
                      setSearchQuery('');
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#581C87] text-white shadow-sm ring-1 ring-[#581C87]'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300/80 shadow-2xs'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. PRODUCTS 4-CARD RESPONSIVE GRID (MATCHING ATTACHED SCREENSHOT EXACTLY)
        ========================================================================= */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-gray-50 rounded-3xl border border-gray-100 my-6">
            <p className="text-gray-500 text-sm">No consecrated items found matching &quot;{searchQuery}&quot;.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Bestsellers');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-[#5B21B6] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-4">
            {filteredProducts.map((product) => {
              const price = formatPrice(product);

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Product Image Frame */}
                    <div className="relative aspect-square w-full overflow-hidden bg-[#F8F6F2] p-3 flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 shadow-2xs"
                        loading="lazy"
                      />

                      {/* FREE SELENITE PLATE or Red Ribbon Badge (matching screenshot) */}
                      {product.badge && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-[#E11D48] text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-md font-sans">
                            {product.badge}
                          </span>
                        </div>
                      )}

                      {/* Freebies indicator */}
                      {product.freebie && (
                        <div className="absolute bottom-4 left-4 right-4 z-10">
                          <span className="bg-black/65 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded-sm block text-center truncate">
                            {product.freebie}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Meta */}
                    <div className="p-4 space-y-1.5">
                      {/* Category Label */}
                      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                        {product.category}
                      </span>

                      {/* Title */}
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 leading-snug group-hover:text-[#5B21B6] transition-colors" title={product.name}>
                        {product.name}
                      </h3>

                      {/* Pricing Row: ₹999 ₹1,700 41% off */}
                      <div className="flex items-baseline gap-2 pt-1 font-sans">
                        <span className="text-base sm:text-lg font-black text-gray-950">
                          {price.current}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {price.original}
                        </span>
                        <span className="text-xs font-bold text-[#DC2626]">
                          {price.discountText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wide Full-Width ADD TO CART Button in rich dark maroon/purple (Matching Screenshot) */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 rounded-lg bg-[#581C87] hover:bg-[#4C1D95] active:scale-98 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>ADD TO CART</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* View all All Bestsellers → Link matching screenshot */}
        <div className="text-center mt-10 mb-8">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All Bestsellers');
              setSearchQuery('');
              window.scrollTo({ top: 120, behavior: 'smooth' });
              showToast('Showing all sacred festive bestsellers');
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4A0E2E] hover:text-[#5B21B6] border-b border-[#4A0E2E]/40 hover:border-[#5B21B6] pb-0.5 transition cursor-pointer"
          >
            <span>View all All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </main>

      {/* =========================================================================
          5. FLOATING WHATSAPP BUTTON (MATCHING SCREENSHOT IN BOTTOM RIGHT)
      ========================================================================= */}
      <div className="fixed right-4 sm:right-6 bottom-6 z-40">
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="Chat with Vedic Shop Specialist on WhatsApp"
          aria-label="WhatsApp Support"
        >
          <MessageCircle className="w-7 h-7 fill-current" />
          {/* Notification Badge '1' matching user screenshot */}
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E11D48] text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white shadow-sm">
            1
          </span>
        </a>
      </div>

      {/* =========================================================================
          6. SHOPPING CART DRAWER / MODAL
      ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div 
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer" 
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/60">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#5B21B6]" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Your Sacred Cart ({totalCartCount})
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
                  <p className="text-sm font-semibold text-gray-700">Your cart is empty</p>
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
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
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
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1">
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

            {/* Cart Footer: Checkout form & Total */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="font-black text-gray-950 text-base">
                    {cartCurrencySymbol}{cartTotalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Free Worldwide Shipping &amp; Consecration Certificate</span>
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
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#5B21B6]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp Number"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#5B21B6]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Delivery Address & City"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#5B21B6]"
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
