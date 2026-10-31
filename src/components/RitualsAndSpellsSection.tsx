import React, { useState, useEffect, useMemo } from 'react';
import { SACRED_RITUALS_AND_SPELLS } from '../data/spells';
import { SHOP_PRODUCTS } from '../data/shop';
import { RitualSpell, ShopProduct } from '../types';
import { 
  Search, Sparkles, Star, ShieldCheck, Heart, Flame, ArrowLeft, 
  ShoppingBag, Check, PackageCheck, X, Clock, Plus, Tag
} from 'lucide-react';
import { RitualBookingModal } from './RitualBookingModal';
import { AstralStoreWhiteView } from './AstralStoreWhiteView';

interface RitualsAndSpellsSectionProps {
  onGoBack?: () => void;
  initialTab?: 'spell' | 'healing' | 'shop';
  currentCurrency?: string;
}

export const RitualsAndSpellsSection: React.FC<RitualsAndSpellsSectionProps> = ({ 
  onGoBack,
  initialTab = 'spell',
  currentCurrency = 'USD'
}) => {
  // Main 3 primary tabs requested by user: SPELL, HEALING, SHOP
  const [activeMainTab, setActiveMainTab] = useState<'spell' | 'healing' | 'shop'>(initialTab);
  
  // Secondary sub-filters
  const [spellFilter, setSpellFilter] = useState<string>('all');
  const [healingFilter, setHealingFilter] = useState<string>('all');
  const [shopFilter, setShopFilter] = useState<string>('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedSpell, setSelectedSpell] = useState<RitualSpell | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  
  // Shop order flow
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Live state fetched from server
  const [liveSpells, setLiveSpells] = useState<RitualSpell[]>(SACRED_RITUALS_AND_SPELLS);
  const [liveProducts, setLiveProducts] = useState<ShopProduct[]>(SHOP_PRODUCTS);

  // Fetch and sync with Server-Sent Events
  useEffect(() => {
    // 1. Fetch Spells & Healings
    fetch('/api/spells')
      .then(res => res.json())
      .then(data => {
        if (data.spells && Array.isArray(data.spells)) {
          setLiveSpells(data.spells);
        }
      })
      .catch(err => console.warn('Spells fetch notice (operating with local fallback):', err));

    // 2. Fetch Shop Products
    fetch('/api/shop-products')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setLiveProducts(data.products);
        }
      })
      .catch(err => console.warn('Shop products fetch notice (operating with local fallback):', err));

    // 3. Real-time updates via SSE
    const es = new EventSource('/api/events');
    
    // Spell events
    es.addEventListener('spell_created', (e) => {
      const created = JSON.parse(e.data);
      setLiveSpells(prev => [created, ...prev.filter(s => s.id !== created.id)]);
    });
    es.addEventListener('spell_updated', (e) => {
      const updated = JSON.parse(e.data);
      if (updated.status === 'paused' || updated.status === 'inactive' || updated.isActive === false) {
        setLiveSpells(prev => prev.filter(s => s.id !== updated.id));
      } else {
        setLiveSpells(prev => prev.map(s => s.id === updated.id ? updated : s));
      }
    });
    es.addEventListener('spell_deleted', (e) => {
      const { id } = JSON.parse(e.data);
      setLiveSpells(prev => prev.filter(s => s.id !== id));
    });

    // Shop events
    es.addEventListener('shop_product_created', (e) => {
      const created = JSON.parse(e.data);
      setLiveProducts(prev => [created, ...prev.filter(p => p.id !== created.id)]);
    });
    es.addEventListener('shop_product_updated', (e) => {
      const updated = JSON.parse(e.data);
      if (updated.status === 'paused' || updated.status === 'inactive' || updated.isActive === false) {
        setLiveProducts(prev => prev.filter(p => p.id !== updated.id));
      } else {
        setLiveProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
    });
    es.addEventListener('shop_product_deleted', (e) => {
      const { id } = JSON.parse(e.data);
      setLiveProducts(prev => prev.filter(p => p.id !== id));
    });

    // Listen for tab switch requests (e.g. from header/navigation)
    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveMainTab(e.detail.tab);
      }
    };
    window.addEventListener('switch_rituals_tab', handleSwitchTab);

    return () => {
      es.close();
      window.removeEventListener('switch_rituals_tab', handleSwitchTab);
    };
  }, []);

  // Filtered Spells
  const filteredSpells = useMemo(() => {
    return liveSpells
      .filter(s => {
        // Exclude healings in spell tab
        const isHealing = s.type === 'healing' || s.category === 'healing' || s.category === 'reiki';
        return !isHealing;
      })
      .filter(spell => {
        if (spellFilter === 'love' && spell.category !== 'love') return false;
        if (spellFilter === 'prosperity' && spell.category !== 'prosperity') return false;
        if (spellFilter === 'protection' && spell.category !== 'protection') return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            spell.name.toLowerCase().includes(q) ||
            spell.description.toLowerCase().includes(q) ||
            spell.practitionerName.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [liveSpells, spellFilter, searchQuery]);

  // Filtered Healings
  const filteredHealings = useMemo(() => {
    return liveSpells
      .filter(s => {
        // Include only healings
        return s.type === 'healing' || s.category === 'healing' || s.category === 'reiki';
      })
      .filter(healing => {
        if (healingFilter === 'chakra' && !healing.name.toLowerCase().includes('chakra')) return false;
        if (healingFilter === 'trauma' && !healing.name.toLowerCase().includes('trauma') && !healing.name.toLowerCase().includes('heart')) return false;
        if (healingFilter === 'aura' && !healing.name.toLowerCase().includes('aura') && !healing.name.toLowerCase().includes('light')) return false;
        if (healingFilter === 'karma' && !healing.name.toLowerCase().includes('karma') && !healing.name.toLowerCase().includes('ancestral')) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            healing.name.toLowerCase().includes(q) ||
            healing.description.toLowerCase().includes(q) ||
            healing.practitionerName.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [liveSpells, healingFilter, searchQuery]);

  // Filtered Shop Products
  const filteredShop = useMemo(() => {
    return liveProducts.filter(product => {
      if (shopFilter === 'magnets' && product.category !== 'magnets') return false;
      if (shopFilter === 'rings' && product.category !== 'rings') return false;
      if (shopFilter === 'jewelry' && product.category !== 'jewelry') return false;
      if (shopFilter === 'altar' && product.category !== 'altar') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.consecratedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [liveProducts, shopFilter, searchQuery]);

  const handleBookingSuccess = (bookingDetails: any) => {
    setSelectedSpell(null);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    setPlacedOrderId(orderId);
    setOrderPlacedSuccess(true);
    setTimeout(() => {
      setOrderPlacedSuccess(false);
      setSelectedProduct(null);
      setBuyerName('');
      setBuyerPhone('');
      setBuyerAddress('');
      setOrderQuantity(1);
    }, 2800);
  };

  return (
    <section id="rituals" className="scroll-mt-20 sm:scroll-mt-24 py-12 sm:py-16 bg-[#FAF8F5] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        

        {/* Section Header - Fixed, clean, and balanced */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-[#B45309] block mb-1">
            CONSECRATED SANCTUARY OFFERINGS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight mb-2 font-serif">
            Sacred Rituals, Healing &amp; Shop
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto mb-3.5">
            Explore authentic spellcraft ceremonies, distance energy healing transmissions, and consecrated astral amulets &amp; rings.
          </p>
        </div>

        {/* =========================================================================
            PRIMARY 3 OPTIONS REQUESTED BY USER: 1. SPELL, 2. HEALING, 3. SHOP
        ========================================================================= */}
        <div className="p-1 sm:p-1.5 rounded-2xl bg-[#FEF3C7]/80 border-2 border-amber-300/80 shadow-xs mb-6 flex items-center justify-center gap-1.5 sm:gap-2 max-w-xl mx-auto">
          <button
            onClick={() => { setActiveMainTab('spell'); setSearchQuery(''); }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'spell'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-gray-950 shadow-sm scale-102 font-black'
                : 'text-gray-700 hover:text-gray-950 hover:bg-white/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-700" />
            <span>1. SPELL</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeMainTab === 'spell' ? 'bg-black/15 text-gray-950' : 'bg-black/5 text-gray-600'}`}>
              {liveSpells.filter(s => s.type !== 'healing' && s.category !== 'healing' && s.category !== 'reiki').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveMainTab('healing'); setSearchQuery(''); }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'healing'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-gray-950 shadow-sm scale-102 font-black'
                : 'text-gray-700 hover:text-gray-950 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>2. HEALING</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeMainTab === 'healing' ? 'bg-black/15 text-gray-950' : 'bg-black/5 text-gray-600'}`}>
              {liveSpells.filter(s => s.type === 'healing' || s.category === 'healing' || s.category === 'reiki').length}
            </span>
          </button>

          <button
            onClick={() => { setActiveMainTab('shop'); setSearchQuery(''); }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'shop'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-gray-950 shadow-sm scale-102 font-black'
                : 'text-gray-700 hover:text-gray-950 hover:bg-white/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
            <span>3. SHOP</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeMainTab === 'shop' ? 'bg-black/15 text-gray-950' : 'bg-black/5 text-gray-600'}`}>
              {liveProducts.length}
            </span>
          </button>
        </div>

        {/* Search Bar & Subcategory Pills (Spell & Healing only) */}
        {activeMainTab !== 'shop' && (
          <>
            <div className="relative mb-5 max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  activeMainTab === 'spell'
                    ? "Search for 'Bring Back Love', 'Love Binding', 'Road Opener'..."
                    : "Search for '7-Chakra Cleansing', 'Heart Trauma', 'Reiki Master'..."
                }
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 shadow-xs transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-500 flex items-center justify-center text-gray-950 shadow-xs cursor-pointer">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subcategory Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
              {activeMainTab === 'spell' && (
                <>
                  <button
                    onClick={() => setSpellFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      spellFilter === 'all'
                        ? 'bg-amber-400 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    All Spells
                  </button>
                  <button
                    onClick={() => setSpellFilter('love')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      spellFilter === 'love'
                        ? 'bg-amber-400 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>Love &amp; Binding</span>
                  </button>
                  <button
                    onClick={() => setSpellFilter('prosperity')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      spellFilter === 'prosperity'
                        ? 'bg-amber-400 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    Wealth &amp; Road Opener
                  </button>
                  <button
                    onClick={() => setSpellFilter('protection')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      spellFilter === 'protection'
                        ? 'bg-amber-400 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    Protection &amp; Banishing
                  </button>
                </>
              )}

              {activeMainTab === 'healing' && (
                <>
                  <button
                    onClick={() => setHealingFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      healingFilter === 'all'
                        ? 'bg-amber-500 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    All Healings
                  </button>
                  <button
                    onClick={() => setHealingFilter('chakra')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      healingFilter === 'chakra'
                        ? 'bg-amber-500 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    7-Chakra Cleansing
                  </button>
                  <button
                    onClick={() => setHealingFilter('trauma')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      healingFilter === 'trauma'
                        ? 'bg-amber-500 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    Emotional Trauma &amp; Heart
                  </button>
                  <button
                    onClick={() => setHealingFilter('aura')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      healingFilter === 'aura'
                        ? 'bg-amber-500 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    Aura &amp; High-Frequency
                  </button>
                  <button
                    onClick={() => setHealingFilter('karma')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      healingFilter === 'karma'
                        ? 'bg-amber-500 text-gray-950 shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:text-gray-950'
                    }`}
                  >
                    Ancestral Karma Clearing
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* =========================================================================
            TAB 1: SPELLS LISTING - SMALL COMPACT CARDS
        ========================================================================= */}
        {activeMainTab === 'spell' && (
          <div>
            {filteredSpells.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                <p>No spells found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredSpells.map(spell => (
                  <article
                    key={spell.id}
                    className="bg-white border border-gray-200/90 hover:border-amber-400 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200 group"
                  >
                    <div>
                      {/* Compact thumbnail image */}
                      <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full overflow-hidden bg-amber-50/40">
                        <img
                          src={spell.imageUrl}
                          alt={spell.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        
                        {spell.badge && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-xs bg-[#FFDD40] text-gray-950 text-[8.5px] font-extrabold uppercase tracking-wider shadow-xs">
                            {spell.badge}
                          </span>
                        )}

                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[9.5px] text-gray-900 font-bold shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{spell.rating}</span>
                          <span className="text-gray-400 text-[8.5px]">({spell.reviewsCount})</span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 space-y-1">
                        <div className="text-[9.5px] uppercase font-bold text-amber-700 tracking-wider">
                          {spell.castDuration || '24-48 Hours'}
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1 leading-snug">
                          {spell.name}
                        </h3>
                        
                        <p className="text-[10px] sm:text-[11px] text-gray-600 line-clamp-2 leading-relaxed font-normal">
                          {spell.description}
                        </p>

                        <div className="text-[9.5px] text-gray-400 italic pt-0.5">
                          By {spell.practitionerName}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-3 pt-0">
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
                        <div className="font-mono">
                          <span className="text-[10px] line-through text-gray-400 mr-1">£{spell.originalPrice}</span>
                          <span className="text-xs sm:text-sm font-extrabold text-gray-950">£{spell.discountPrice}</span>
                        </div>

                        <button
                          onClick={() => setSelectedSpell(spell)}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-105 active:scale-95 text-gray-950 font-extrabold text-[10.5px] sm:text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Flame className="w-3 h-3 text-amber-900" />
                          <span>Book</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: HEALING LISTING - SMALL COMPACT CARDS
        ========================================================================= */}
        {activeMainTab === 'healing' && (
          <div>
            {filteredHealings.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                <p>No healing sessions found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredHealings.map(healing => (
                  <article
                    key={healing.id}
                    className="bg-white border border-gray-200/90 hover:border-amber-400 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200 group"
                  >
                    <div>
                      {/* Compact thumbnail image */}
                      <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full overflow-hidden bg-amber-50/40">
                        <img
                          src={healing.imageUrl}
                          alt={healing.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        
                        {healing.badge && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-xs bg-[#FFDD40] text-gray-950 text-[8.5px] font-extrabold uppercase tracking-wider shadow-xs">
                            {healing.badge}
                          </span>
                        )}

                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[9.5px] text-gray-900 font-bold shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{healing.rating}</span>
                          <span className="text-gray-400 text-[8.5px]">({healing.reviewsCount})</span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 space-y-1">
                        <div className="text-[9.5px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{healing.castDuration || 'Same Day Session'}</span>
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1 leading-snug">
                          {healing.name}
                        </h3>
                        
                        <p className="text-[10px] sm:text-[11px] text-gray-600 line-clamp-2 leading-relaxed font-normal">
                          {healing.description}
                        </p>

                        <div className="text-[9.5px] text-gray-400 italic pt-0.5">
                          By {healing.practitionerName}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-3 pt-0">
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
                        <div className="font-mono">
                          <span className="text-[10px] line-through text-gray-400 mr-1">£{healing.originalPrice}</span>
                          <span className="text-xs sm:text-sm font-extrabold text-amber-900">£{healing.discountPrice}</span>
                        </div>

                        <button
                          onClick={() => setSelectedSpell(healing)}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 to-[#F5C542] hover:brightness-105 active:scale-95 text-gray-950 font-extrabold text-[10.5px] sm:text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Sparkles className="w-3 h-3 text-amber-950" />
                          <span>Book</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: SHOP LISTING (NEAT & CLEAN WHITE FORMAT AS REQUESTED BY USER)
        ========================================================================= */}
        {activeMainTab === 'shop' && (
          <div className="rounded-3xl overflow-hidden shadow-xs border border-gray-200 bg-white -mx-4 sm:mx-0">
            <AstralStoreWhiteView 
              onGoBack={() => setActiveMainTab('spell')}
              currentCurrency={currentCurrency}
            />
          </div>
        )}

      </div>

      {/* Ritual Booking Modal for Spells & Healings */}
      <RitualBookingModal
        spell={selectedSpell}
        onClose={() => setSelectedSpell(null)}
        onSuccess={handleBookingSuccess}
      />

      {/* Dedicated Sacred Product Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#15072b] border border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#200f38] text-[#bda5db] hover:text-[#faf7f2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {orderPlacedSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#faf7f2]">
                  Order Placed Successfully!
                </h3>
                <p className="text-sm text-[#bda5db] max-w-md mx-auto">
                  Your order for <strong className="text-[#d4af37]">{selectedProduct.name}</strong> (Qty: {orderQuantity}) has been secured under tracking ID <strong className="text-white font-mono">{placedOrderId}</strong>.
                </p>
                <div className="p-4 rounded-2xl bg-[#1e0d38] border border-[#2c184d] text-xs text-[#bda5db] space-y-1">
                  <div>Consecration &amp; Packing: <span className="text-[#faf7f2] font-semibold">1-2 Business Days</span></div>
                  <div>Delivery Address: <span className="text-[#faf7f2]">{buyerAddress || 'On file'}</span></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-[#2c184d]">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-16 rounded-2xl object-cover border border-[#d4af37]/40" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#d4af37]">Consecrated Artifact</span>
                    <h3 className="font-serif text-lg font-bold text-[#faf7f2] leading-tight">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedProduct.originalPriceGBP && (
                        <span className="text-xs line-through text-[#bda5db]/60">£{selectedProduct.originalPriceGBP}</span>
                      )}
                      <span className="text-lg font-bold text-[#d4af37]">£{selectedProduct.priceGBP * orderQuantity}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="w-8 h-8 rounded-xl bg-[#200f38] text-white flex items-center justify-center font-bold border border-white/10"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm text-[#faf7f2]">{orderQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="w-8 h-8 rounded-xl bg-[#200f38] text-white flex items-center justify-center font-bold border border-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0f041d] border border-[#2c184d] text-sm text-[#faf7f2] focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Contact Phone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={buyerPhone}
                      onChange={e => setBuyerPhone(e.target.value)}
                      placeholder="e.g. +44 7700 900077"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0f041d] border border-[#2c184d] text-sm text-[#faf7f2] focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Shipping Postal Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={buyerAddress}
                      onChange={e => setBuyerAddress(e.target.value)}
                      placeholder="Street address, City, Postcode, Country..."
                      className="w-full px-4 py-2 rounded-xl bg-[#0f041d] border border-[#2c184d] text-sm text-[#faf7f2] focus:border-[#d4af37] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f5e7a9] to-[#d4af37] text-[#0b0514] font-bold text-sm shadow-xl hover:shadow-[#d4af37]/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Confirm Order (£{selectedProduct.priceGBP * orderQuantity})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
