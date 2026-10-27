import React, { useState, useEffect, useMemo } from 'react';
import { X, Flame, Sparkles, Star, ShieldCheck, Heart, ShoppingBag, Check, PackageCheck, Clock, ArrowRight } from 'lucide-react';
import { SACRED_RITUALS_AND_SPELLS } from '../data/spells';
import { SHOP_PRODUCTS } from '../data/shop';
import { RitualSpell, ShopProduct } from '../types';
import { RitualBookingModal } from './RitualBookingModal';

interface SacredRitualsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'spell' | 'healing' | 'shop';
  currentCurrency?: string;
}

export const SacredRitualsModal: React.FC<SacredRitualsModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'spell',
  currentCurrency = 'USD'
}) => {
  const [activeTab, setActiveTab] = useState<'spell' | 'healing' | 'shop'>(initialTab);
  const [spells, setSpells] = useState<RitualSpell[]>(SACRED_RITUALS_AND_SPELLS);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>(SHOP_PRODUCTS);
  const [selectedSpell, setSelectedSpell] = useState<RitualSpell | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  
  // Quick order state
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    
    // Fetch spells
    fetch('/api/spells')
      .then(res => res.json())
      .then(data => {
        if (data.spells && Array.isArray(data.spells)) {
          setSpells(data.spells);
        }
      })
      .catch(err => console.error('Failed to load spells:', err));

    // Fetch shop
    fetch('/api/shop-products')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setShopProducts(data.products);
        }
      })
      .catch(err => console.error('Failed to load shop products:', err));
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Spells filter
  const spellsList = useMemo(() => {
    return spells.filter(s => s.type !== 'healing' && s.category !== 'healing' && s.category !== 'reiki');
  }, [spells]);

  // Healings filter
  const healingsList = useMemo(() => {
    return spells.filter(s => s.type === 'healing' || s.category === 'healing' || s.category === 'reiki');
  }, [spells]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const genId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(genId);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedProduct(null);
      setBuyerName('');
      setBuyerPhone('');
      setBuyerAddress('');
      setOrderQuantity(1);
    }, 2800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-[#07020d]/85 backdrop-blur-md cursor-pointer transition-opacity"
        onClick={onClose}
      />

      <div 
        className="relative w-full max-w-5xl bg-gradient-to-b from-[#18082c] via-[#100420] to-[#0a0216] border border-[#d4af37]/40 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#d4af37] via-amber-300 to-[#d4af37]" />

        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#2c184d] flex items-center justify-between bg-[#160729]/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-[#faf7f2]">
                Sacred Rituals, Healing &amp; LUMSIC Shop
              </h2>
              <p className="text-[11px] text-[#bda5db] font-mono">
                Authentic Ceremonies · Verified Distance Healers · Consecrated Artifacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#bda5db] hover:text-[#faf7f2] hover:bg-[#2c184d]/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 PRIMARY TABS REQUESTED BY USER */}
        <div className="px-5 py-3 bg-[#0d041c] border-b border-[#2c184d] flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('spell')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'spell'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f5e7a9] to-[#d4af37] text-[#0c0517] shadow-lg shadow-[#d4af37]/20'
                : 'bg-[#180931] text-[#bda5db] hover:text-[#faf7f2]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>1. SPELL ({spellsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('healing')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'healing'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f5e7a9] to-[#d4af37] text-[#0c0517] shadow-lg shadow-[#d4af37]/20'
                : 'bg-[#180931] text-[#bda5db] hover:text-[#faf7f2]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. HEALING ({healingsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f5e7a9] to-[#d4af37] text-[#0c0517] shadow-lg shadow-[#d4af37]/20'
                : 'bg-[#180931] text-[#bda5db] hover:text-[#faf7f2]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>3. SHOP ({shopProducts.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: SPELL */}
          {activeTab === 'spell' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {spellsList.map((spell) => (
                <div
                  key={spell.id}
                  className="bg-white text-gray-900 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-md flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-amber-50/40">
                      <img src={spell.imageUrl} alt={spell.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {spell.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-xs bg-[#FFDD40] text-gray-950 text-[9px] font-bold uppercase tracking-wider">
                          {spell.badge}
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 px-1.5 py-0.5 rounded-md text-[10px] text-gray-900 font-bold shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{spell.rating}</span>
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      <div className="text-[10px] text-amber-700 font-bold tracking-wider uppercase">{spell.castDuration}</div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-amber-800 line-clamp-1">
                        {spell.name}
                      </h4>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {spell.description}
                      </p>
                      <div className="text-[10px] text-gray-400 italic pt-0.5">
                        By {spell.practitionerName}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 pt-0 border-t border-gray-100 flex items-center justify-between mt-1">
                    <div className="font-mono">
                      <span className="text-[11px] line-through text-gray-400 mr-1">£{spell.originalPrice}</span>
                      <span className="text-sm sm:text-base font-extrabold text-gray-950">£{spell.discountPrice}</span>
                    </div>

                    <button
                      onClick={() => setSelectedSpell(spell)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-950 font-extrabold text-xs shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Flame className="w-3 h-3 text-amber-900" />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: HEALING */}
          {activeTab === 'healing' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {healingsList.map((healing) => (
                <div
                  key={healing.id}
                  className="bg-white text-gray-900 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-md flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-amber-50/40">
                      <img src={healing.imageUrl} alt={healing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {healing.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-xs bg-[#FFDD40] text-gray-950 text-[9px] font-bold uppercase tracking-wider">
                          {healing.badge}
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 px-1.5 py-0.5 rounded-md text-[10px] text-gray-900 font-bold shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{healing.rating}</span>
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      <div className="text-[10px] text-amber-700 font-bold tracking-wider uppercase flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{healing.castDuration}</span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug group-hover:text-amber-800 line-clamp-1">
                        {healing.name}
                      </h4>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {healing.description}
                      </p>
                      <div className="text-[10px] text-gray-400 italic pt-0.5">
                        By {healing.practitionerName}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 pt-0 border-t border-gray-100 flex items-center justify-between mt-1">
                    <div className="font-mono">
                      <span className="text-[11px] line-through text-gray-400 mr-1">£{healing.originalPrice}</span>
                      <span className="text-sm sm:text-base font-extrabold text-amber-900">£{healing.discountPrice}</span>
                    </div>

                    <button
                      onClick={() => setSelectedSpell(healing)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#F5C542] text-gray-950 font-extrabold text-xs shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-950" />
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SHOP (CLEAN WHITE FORMAT AS REQUESTED BY USER) */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              {/* Clean White Top Subtitle / Trust Banner */}
              <div className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-900 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Sacred Consecrated Artifacts</span>
                  <span className="text-gray-400 font-normal">· Energized under Vedic &amp; Occult Masters</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  100% Cashback on Prepaid
                </span>
              </div>

              {/* Grid of White Cards matching exact reference format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {shopProducts.map((product) => {
                  const sym = currentCurrency === 'GBP' ? '£' : currentCurrency === 'EUR' ? '€' : currentCurrency === 'CAD' ? 'CA$' : currentCurrency === 'AUD' ? 'A$' : '$';
                  const priceNum = currentCurrency === 'GBP' ? product.priceGBP : Math.round(product.priceGBP * (currentCurrency === 'EUR' ? 1.18 : currentCurrency === 'CAD' ? 1.75 : currentCurrency === 'AUD' ? 1.95 : 1.3));
                  const origNum = Math.round(priceNum * 1.8);

                  return (
                    <div
                      key={product.id}
                      className="bg-white text-gray-900 rounded-3xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Square Image container with yellow ribbon */}
                        <div className="relative aspect-square w-full overflow-hidden bg-[#FBF9F5]">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          
                          {/* Ribbon badge matching screenshot */}
                          <div className="absolute top-2.5 left-2.5">
                            <div className="bg-[#FFDD40] text-gray-950 font-bold text-[9px] uppercase px-2 py-0.5 rounded-xs shadow-md">
                              Energized Talisman
                            </div>
                          </div>

                          {product.inStock && (
                            <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] text-amber-700 font-semibold border border-amber-200">
                              ✓ Consecrated
                            </div>
                          )}
                        </div>

                        {/* Title and Rating */}
                        <div className="p-4 space-y-1.5">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                          
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="flex items-center text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </div>
                            <span className="text-gray-500 text-[10px]">
                              {product.reviewCount || 1658} reviews
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed pt-0.5">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Price & Black Button */}
                      <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-gray-950">
                            {sym}{priceNum}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {sym}{origNum}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-gray-800 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Order</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2c184d] bg-[#110521] flex items-center justify-between text-xs text-[#bda5db] shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>All ritual ceremonies include photographic proof upon completion.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Ritual Booking Modal for Spells and Healings */}
      <RitualBookingModal
        spell={selectedSpell}
        onClose={() => setSelectedSpell(null)}
        onSuccess={() => setSelectedSpell(null)}
      />

      {/* Quick Order Modal for Shop Products */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#15072b] border border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#200f38] text-[#bda5db] hover:text-[#faf7f2]"
            >
              <X className="w-5 h-5" />
            </button>

            {orderSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-300">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#faf7f2]">Order Placed!</h3>
                <p className="text-xs text-[#bda5db]">
                  Tracking ID: <strong className="text-white font-mono">{orderId}</strong> for {selectedProduct.name}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#2c184d]">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-14 h-14 rounded-xl object-cover border border-[#d4af37]/40" />
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#faf7f2]">{selectedProduct.name}</h3>
                    <div className="text-[#d4af37] font-bold text-sm">£{selectedProduct.priceGBP * orderQuantity}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="w-7 h-7 rounded-lg bg-[#200f38] text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm px-2 text-[#faf7f2]">{orderQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="w-7 h-7 rounded-lg bg-[#200f38] text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-xl bg-[#0f041d] border border-[#2c184d] text-sm text-[#faf7f2] focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Phone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={buyerPhone}
                      onChange={e => setBuyerPhone(e.target.value)}
                      placeholder="+44..."
                      className="w-full px-3 py-2 rounded-xl bg-[#0f041d] border border-[#2c184d] text-sm text-[#faf7f2] focus:border-[#d4af37] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#faf7f2] block mb-1">Shipping Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={buyerAddress}
                      onChange={e => setBuyerAddress(e.target.value)}
                      placeholder="Delivery address, City, Country"
                      className="w-full px-3 py-2 rounded-xl bg-[#0f041d] border border-[#2c184d] text-sm text-[#faf7f2] focus:border-[#d4af37] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5e7a9] text-[#0b0514] font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Confirm Order (£{selectedProduct.priceGBP * orderQuantity})</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
