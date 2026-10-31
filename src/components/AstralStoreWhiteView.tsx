import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Search, User, ShoppingBag, Star, Plus, Minus, X, Check, 
  MessageCircle, ShieldCheck, Tag, Sparkles, Filter, ChevronRight, CheckCircle2
} from 'lucide-react';
import { ShopProduct } from '../types';
import { SHOP_PRODUCTS } from '../data/shop';

interface AstralStoreWhiteViewProps {
  onGoBack?: () => void;
  currentCurrency?: string;
}

interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export const AstralStoreWhiteView: React.FC<AstralStoreWhiteViewProps> = ({ 
  onGoBack,
  currentCurrency = 'USD'
}) => {
  const [products, setProducts] = useState<ShopProduct[]>(SHOP_PRODUCTS);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [orderTrackingId, setOrderTrackingId] = useState<string>('');
  
  // Delivery form state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Fetch shop products from API
  useEffect(() => {
    fetch('/api/shop-products')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(err => console.warn('Store products fetch notice (operating with local fallback):', err));

    const es = new EventSource('/api/events');
    es.addEventListener('shop_product_created', (e) => {
      const created = JSON.parse(e.data);
      setProducts(prev => [created, ...prev.filter(p => p.id !== created.id)]);
    });
    es.addEventListener('shop_product_updated', (e) => {
      const updated = JSON.parse(e.data);
      if (updated.status === 'paused' || updated.status === 'inactive' || updated.isActive === false) {
        setProducts(prev => prev.filter(p => p.id !== updated.id));
      } else {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
    });
    es.addEventListener('shop_product_deleted', (e) => {
      const { id } = JSON.parse(e.data);
      setProducts(prev => prev.filter(p => p.id !== id));
    });

    return () => es.close();
  }, []);

  // Format price helper prioritizing USD and GBP
  const formatPrice = (p: ShopProduct) => {
    if (currentCurrency === 'GBP') {
      return {
        current: `£${p.priceGBP}`,
        original: p.originalPriceGBP ? `£${p.originalPriceGBP}` : `£${Math.round(p.priceGBP * 1.8)}`,
        rawCurrent: p.priceGBP
      };
    } else if (currentCurrency === 'EUR') {
      const eurPrice = Math.round((p.priceGBP || 25) * 1.18);
      const eurOrig = Math.round(eurPrice * 1.8);
      return {
        current: `€${eurPrice}`,
        original: `€${eurOrig}`,
        rawCurrent: eurPrice
      };
    } else if (currentCurrency === 'CAD') {
      const cadPrice = Math.round((p.priceGBP || 25) * 1.75);
      const cadOrig = Math.round(cadPrice * 1.8);
      return {
        current: `CA$${cadPrice}`,
        original: `CA$${cadOrig}`,
        rawCurrent: cadPrice
      };
    } else if (currentCurrency === 'AUD') {
      const audPrice = Math.round((p.priceGBP || 25) * 1.95);
      const audOrig = Math.round(audPrice * 1.8);
      return {
        current: `A$${audPrice}`,
        original: `A$${audOrig}`,
        rawCurrent: audPrice
      };
    } else {
      // Default USD
      const usdPrice = Math.round((p.priceGBP || 25) * 1.3);
      const usdOrig = p.originalPriceGBP ? Math.round(p.originalPriceGBP * 1.3) : Math.round(usdPrice * 1.8);
      return {
        current: `$${usdPrice}`,
        original: `$${usdOrig}`,
        rawCurrent: usdPrice
      };
    }
  };

  // Filtered Best Sellers
  const bestSellers = useMemo(() => {
    return products.filter(p => {
      if (selectedPurpose !== 'All' && p.purpose !== selectedPurpose) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [products, selectedPurpose, searchQuery]);

  // Purposes metadata matching Reference Screenshot
  const PURPOSES = [
    {
      id: 'All',
      label: 'All Items',
      iconSvg: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 flex items-center justify-center shadow-inner">
          <Sparkles className="w-8 h-8 text-amber-600" />
        </div>
      )
    },
    {
      id: 'Wealth',
      label: 'Wealth',
      iconSvg: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-100 to-yellow-50 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform">
          {/* Golden Pot / Kalash with Coins representation */}
          <svg className="w-12 h-12 text-amber-500 drop-shadow-md" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="18" rx="14" ry="5" fill="#F59E0B" />
            <path d="M20 18C20 28 12 36 12 46C12 54 21 58 32 58C43 58 52 54 52 46C52 36 44 28 44 18" fill="url(#goldGrad1)" stroke="#B45309" strokeWidth="1.5" />
            <ellipse cx="32" cy="22" rx="10" ry="4" fill="#FCD34D" />
            <circle cx="28" cy="14" r="3" fill="#FDE68A" stroke="#D97706" />
            <circle cx="34" cy="12" r="3.5" fill="#FBBF24" stroke="#D97706" />
            <circle cx="38" cy="15" r="2.8" fill="#FDE68A" stroke="#D97706" />
            <defs>
              <linearGradient id="goldGrad1" x1="12" y1="18" x2="52" y2="58" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    },
    {
      id: 'Love',
      label: 'Love',
      iconSvg: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-100 to-pink-50 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform">
          {/* Interlocking Golden Dual Hearts matching reference screenshot */}
          <svg className="w-12 h-12 text-amber-500 drop-shadow-md" viewBox="0 0 64 64" fill="none">
            <path d="M24 16C18 16 14 20.5 14 26C14 36 26 44 28 46C30 44 42 36 42 26C42 20.5 38 16 32 16C28.5 16 25.5 18 24 20.5C22.5 18 19.5 16 16 16" fill="none" stroke="url(#goldGradLove)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M38 24C34 24 31 27 31 31C31 38 39 44 40.5 45.5C42 44 50 38 50 31C50 27 47 24 43 24C40.5 24 38.5 25.5 37.5 27.5C36.5 25.5 34.5 24 32 24" fill="none" stroke="url(#goldGradLove2)" strokeWidth="3" strokeLinecap="round" />
            <defs>
              <linearGradient id="goldGradLove" x1="14" y1="16" x2="42" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="goldGradLove2" x1="31" y1="24" x2="50" y2="45.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    },
    {
      id: 'Protection',
      label: 'Protection',
      iconSvg: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-sky-100 to-indigo-50 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform">
          {/* Consecrated Nazar Eye / Shield */}
          <svg className="w-12 h-12 drop-shadow-md" viewBox="0 0 64 64" fill="none">
            <path d="M32 10L16 18V32C16 44 23 52 32 56C41 52 48 44 48 32V18L32 10Z" fill="url(#goldGradShield)" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="8" fill="#1D4ED8" />
            <circle cx="32" cy="32" r="4.5" fill="#60A5FA" />
            <circle cx="32" cy="32" r="2" fill="#FFFFFF" />
            <defs>
              <linearGradient id="goldGradShield" x1="16" y1="10" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF3C7" />
                <stop offset="0.6" stopColor="#FCD34D" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    },
    {
      id: 'Career',
      label: 'Career',
      iconSvg: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform">
          {/* Victory Sun / Owl / Emblem */}
          <svg className="w-12 h-12 drop-shadow-md" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="14" fill="url(#goldGradSun)" stroke="#D97706" strokeWidth="1.5" />
            <path d="M32 8V14M32 50V56M8 32H14M50 32H56M15 15L19 19M45 45L49 49M15 49L19 45M45 19L49 15" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="32,22 35,28 42,29 37,34 38,41 32,37 26,41 27,34 22,29 29,28" fill="#FFFFFF" opacity="0.9" />
            <defs>
              <linearGradient id="goldGradSun" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    }
  ];

  // Add to cart handler
  const handleAddToCart = (product: ShopProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
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

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalCartPriceFormatted = useMemo(() => {
    let total = 0;
    cart.forEach(item => {
      const priceObj = formatPrice(item.product);
      total += priceObj.rawCurrent * item.quantity;
    });
    const sym = currentCurrency === 'GBP' ? '£' : currentCurrency === 'EUR' ? '€' : currentCurrency === 'CAD' ? 'CA$' : currentCurrency === 'AUD' ? 'A$' : '$';
    return `${sym}${total.toLocaleString()}`;
  }, [cart, currentCurrency]);

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const tid = 'AST-' + Math.floor(100000 + Math.random() * 900000);
    setOrderTrackingId(tid);
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setIsCartOpen(false);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }, 3200);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans relative selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. TOP HEADER: Back arrow + Store Title */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onGoBack && (
              <button
                type="button"
                onClick={onGoBack}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-800 cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-800" />
              </button>
            )}
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              LUMSIC Store
            </h1>
          </div>
        </div>

        {/* 2. BLACK ANNOUNCEMENT TICKER BANNER (Matching Reference Screenshot) */}
        <div className="bg-black text-white text-[11px] sm:text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
          <span>✦ LUMSIC Sacred Store: 100% Genuine Consecrated Talismans, Energy Bracelets &amp; Sacred Crystals ✦</span>
        </div>

        {/* 3. CLEAN WHITE NAVBAR WITH LOGO, SEARCH, PROFILE, CART */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-black font-serif font-black text-sm shadow-sm">
                ✦
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                LUMSIC
              </span>
            </div>

            {/* Right: Search, Account, Bag icons */}
            <div className="flex items-center gap-4 text-gray-800">
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-1 hover:text-black cursor-pointer"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="p-1 hover:text-black cursor-pointer relative"
                title="My Account"
              >
                <User className="w-5 h-5" />
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-0.5 right-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="p-1 hover:text-black cursor-pointer relative"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Bar (collapsible) */}
        {isSearchOpen && (
          <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="max-w-xl mx-auto relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search 'Metal Dhan Yog Bracelet', 'Money Magnet', 'Couple Rings'..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-amber-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-10 sm:space-y-14">

        {/* =========================================================================
            SECTION 1: BEST SELLERS (EXACT FORMAT FROM REFERENCE SCREENSHOT)
        ========================================================================= */}
        <section>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 tracking-tight">
              Best Sellers
            </h2>
          </div>

          {bestSellers.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No products found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {bestSellers.map(product => {
                const price = formatPrice(product);
                return (
                  <article
                    key={product.id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Image container with folded ribbon badge */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#FBF9F5]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />

                        {/* Top-Left Ribbon Badge matching Reference Image */}
                        <div className="absolute top-3 left-3">
                          <div className="relative bg-[#FFDD40] text-gray-950 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-md flex items-center gap-1 font-sans">
                            <span>100%</span>
                            <span className="font-medium text-[8px] sm:text-[9px]">CASHBACK on prepaid orders</span>
                            {/* Tiny ribbon notch */}
                            <div className="absolute -bottom-1 left-2 w-0 h-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-amber-600 border-r-[4px] border-r-transparent" />
                          </div>
                        </div>

                        {/* Stock indicator */}
                        {product.inStock && (
                          <div className="absolute bottom-2.5 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] text-emerald-700 font-semibold border border-emerald-200">
                            ✓ Energized
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="p-4 sm:p-5 space-y-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1 leading-snug">
                          {product.name}
                        </h3>

                        {/* Rating stars & review count */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="flex items-center text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                          <span className="text-gray-500 text-[11px] font-sans">
                            {product.reviewCount || 1658} reviews
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Price & Black "Add" Button */}
                    <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-2 border-t border-gray-50 mt-1">
                      <div className="flex items-baseline gap-1.5 font-sans">
                        <span className="text-base sm:text-lg font-bold text-gray-950">
                          {price.current}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          {price.original}
                        </span>
                      </div>

                      {/* Black rounded "Add" button with bag icon */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 2: SHOP BY PURPOSE (EXACT FORMAT FROM REFERENCE SCREENSHOT)
        ========================================================================= */}
        <section className="pt-2">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 tracking-tight">
              Shop by Purpose
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-5">
            {PURPOSES.map(purpose => {
              const isActive = selectedPurpose === purpose.id;
              return (
                <button
                  key={purpose.id}
                  type="button"
                  onClick={() => setSelectedPurpose(purpose.id)}
                  className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer border group ${
                    isActive
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-md scale-102'
                      : 'bg-[#F7F7F7] hover:bg-[#F2F2F2] border-transparent shadow-sm'
                  }`}
                >
                  {purpose.iconSvg}

                  <span className={`text-sm sm:text-base font-bold tracking-tight ${
                    isActive ? 'text-amber-950 font-extrabold' : 'text-gray-900'
                  }`}>
                    {purpose.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

      </main>

      {/* =========================================================================
          FLOATING WHATSAPP / ASTROLOGER INQUIRY BUTTON (MATCHING SCREENSHOT)
      ========================================================================= */}
      <div className="fixed bottom-6 right-5 z-40">
        <a
          href="https://wa.me/?text=Hello%20LUMSIC%20Store%2C%20I%20need%20guidance%20on%20consecrated%20talismans"
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl shadow-green-600/30 hover:scale-105 active:scale-95 transition-all relative cursor-pointer"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-white" />
          {/* Notification badge matching image */}
          <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center absolute -top-1 -right-1 border-2 border-white shadow">
            1
          </span>
        </a>
      </div>

      {/* =========================================================================
          SHOPPING BAG DRAWER & CHECKOUT SLIDE-OVER
      ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-gray-900">
                <ShoppingBag className="w-5 h-5 text-gray-900" />
                <span>My Bag ({totalCartCount})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {checkoutSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-gray-900">Order Confirmed!</h3>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto">
                    Your consecrated sacred order has been accepted. Tracking ID: <strong className="text-black font-mono">{orderTrackingId}</strong>
                  </p>
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    100% Prepaid Cashback voucher will be sent to your WhatsApp number.
                  </p>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-16 text-center text-gray-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-sm font-medium">Your shopping bag is empty</p>
                  <p className="text-xs">Select any consecrated item from the Best Sellers</p>
                </div>
              ) : (
                <>
                  {/* Items list */}
                  <div className="space-y-3 divide-y divide-gray-100">
                    {cart.map(item => {
                      const itemPrice = formatPrice(item.product);
                      return (
                        <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-gray-900 truncate">
                              {item.product.name}
                            </h4>
                            <div className="text-xs font-bold text-gray-900 mt-0.5">
                              {itemPrice.current}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold font-mono px-1">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cash back promo badge */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
                    <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>100% Cashback:</strong> Automatically applied to this order!</span>
                  </div>

                  {/* Quick delivery fields */}
                  <form onSubmit={handleCompleteOrder} id="cart-order-form" className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Delivery Address
                    </div>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Recipient Full Name *"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black"
                    />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="WhatsApp Mobile Number *"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black"
                    />
                    <textarea
                      required
                      rows={2}
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="Street address, City, Pincode/Zip *"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black resize-none"
                    />
                  </form>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && !checkoutSuccess && (
              <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Payable:</span>
                  <span className="font-bold text-lg text-gray-950 font-sans">{totalCartPriceFormatted}</span>
                </div>

                <button
                  type="submit"
                  form="cart-order-form"
                  className="w-full py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Place Prepaid Order (100% Cashback)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
