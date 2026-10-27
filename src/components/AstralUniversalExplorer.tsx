import React, { useState, useMemo } from 'react';
import { 
  Search, X, Sparkles, ChevronRight, ChevronDown, Globe, Check, ArrowLeft,
  Compass, Star, Heart, Moon, Sun, Shield, Flame, BookOpen, User, 
  HelpCircle, Settings, Award, Layers, ListTree, LayoutGrid, ExternalLink
} from 'lucide-react';
import { ASTRAL_TAXONOMY, TaxonomyCategory, TaxonomyLeaf } from '../data/astralTaxonomy';
import { StarryBackground } from './StarryBackground';

interface AstralUniversalExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  onNavigateSection: (sectionId: string) => void;
  onStartReading: () => void;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  currentCurrency: string;
  onSelectCurrency: (cur: string) => void;
}

export const AstralUniversalExplorer: React.FC<AstralUniversalExplorerProps> = ({
  isOpen,
  onClose,
  initialCategoryId = 'astrology',
  onNavigateSection,
  onStartReading,
  currentLanguage,
  onSelectLanguage,
  currentCurrency,
  onSelectCurrency
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategoryId || 'astrology');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeafItem, setSelectedLeafItem] = useState<TaxonomyLeaf | null>(null);
  const [viewFormat, setViewFormat] = useState<'tree' | 'grid'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'western-astrology': true,
    'zodiac-signs': true,
    'vedic-astrology': true,
    'psychic-skills': true,
    'minor-arcana': true,
    'global-languages': true
  });

  // Interactive Mini-Tool States inside Explorer
  // 1. Life Path Calculator
  const [birthDateInput, setBirthDateInput] = useState('1994-08-23');
  const [calculatedLifePath, setCalculatedLifePath] = useState<number | null>(null);

  // 2. Interactive Tarot Draw
  const [drawnTarot, setDrawnTarot] = useState<{ name: string; answer: 'YES' | 'NO' | 'MAYBE'; meaning: string } | null>(null);

  // 3. Zodiac Compatibility
  const [compSign1, setCompSign1] = useState('Aries');
  const [compSign2, setCompSign2] = useState('Leo');

  // 4. Ask LUMSIC Oracle
  const [askQuery, setAskQuery] = useState('');
  const [askOracleReply, setAskOracleReply] = useState<string | null>(null);

  // Reset or initialize active category when opening
  React.useEffect(() => {
    if (initialCategoryId) {
      setActiveCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  const activeCategory = useMemo(() => {
    return ASTRAL_TAXONOMY.find(c => c.id === activeCategoryId) || ASTRAL_TAXONOMY[0];
  }, [activeCategoryId]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Global search filtering across entire taxonomy
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { category: TaxonomyCategory; leaf: TaxonomyLeaf; parentName?: string }[] = [];

    ASTRAL_TAXONOMY.forEach(category => {
      category.subCategories.forEach(sub => {
        if (sub.items) {
          sub.items.forEach(item => {
            const leaf: TaxonomyLeaf = typeof item === 'string' 
              ? { id: item.toLowerCase().replace(/\s+/g, '-'), name: item, description: '' }
              : item;
            if (leaf.name.toLowerCase().includes(q) || (leaf.description && leaf.description.toLowerCase().includes(q)) || category.name.toLowerCase().includes(q)) {
              results.push({ category, leaf, parentName: sub.name });
            }
          });
        }
        if (sub.subGroups) {
          sub.subGroups.forEach(grp => {
            grp.items.forEach(item => {
              const leaf: TaxonomyLeaf = typeof item === 'string' 
                ? { id: item.toLowerCase().replace(/\s+/g, '-'), name: item, description: '' }
                : item;
              if (leaf.name.toLowerCase().includes(q) || (leaf.description && leaf.description.toLowerCase().includes(q)) || category.name.toLowerCase().includes(q) || grp.name.toLowerCase().includes(q)) {
                results.push({ category, leaf, parentName: `${sub.name} > ${grp.name}` });
              }
            });
          });
        }
      });
    });

    return results.slice(0, 35);
  }, [searchQuery]);

  // Compute Life Path
  const handleCalculateLifePath = () => {
    if (!birthDateInput) return;
    const digits = birthDateInput.replace(/\D/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    setCalculatedLifePath(sum);
  };

  // Draw Yes/No Tarot Card
  const handleDrawTarotCard = () => {
    const cards: { name: string; answer: 'YES' | 'NO' | 'MAYBE'; meaning: string }[] = [
      { name: 'The Sun (XIX)', answer: 'YES', meaning: 'Total vitality, triumph, authentic truth, and joyful expansion. The cosmos strongly aligns in your favor.' },
      { name: 'The Star (XVII)', answer: 'YES', meaning: 'Divine hope, peaceful restoration, and inspired healing. Follow your quiet inner compass.' },
      { name: 'The Magician (I)', answer: 'YES', meaning: 'You possess all spiritual, mental, and material resources needed to manifest this intention.' },
      { name: 'The Tower (XVI)', answer: 'NO', meaning: 'Sudden upheaval or necessary breakdown. An illusion must fall before divine clarity can blossom.' },
      { name: 'The Moon (XVIII)', answer: 'MAYBE', meaning: 'Hidden motives, emotional haze, and illusions. Wait until the next lunar culmination before deciding.' },
      { name: 'The High Priestess (II)', answer: 'MAYBE', meaning: 'The answer already whispers in your silent intuition. Trust what is not yet spoken aloud.' },
      { name: 'The Empress (III)', answer: 'YES', meaning: 'Abundant fertility, sensuality, mothering energy, and effortless blossoming.' }
    ];
    const picked = cards[Math.floor(Math.random() * cards.length)];
    setDrawnTarot(picked);
  };

  // Compatibility Score Calculator
  const compScore = useMemo(() => {
    const pairs: Record<string, number> = {
      'Fire-Fire': 92, 'Fire-Air': 95, 'Fire-Water': 68, 'Fire-Earth': 62,
      'Earth-Earth': 94, 'Earth-Water': 96, 'Earth-Air': 65,
      'Air-Air': 91, 'Air-Water': 72, 'Water-Water': 95
    };
    const elementMap: Record<string, string> = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
    };
    const el1 = elementMap[compSign1] || 'Fire';
    const el2 = elementMap[compSign2] || 'Air';
    const key = `${el1}-${el2}`;
    const reverseKey = `${el2}-${el1}`;
    return pairs[key] || pairs[reverseKey] || 85;
  }, [compSign1, compSign2]);

  // Ask Astral Oracle Generator
  const handleAskOracle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    const answers = [
      `The celestial currents reveal that your question touches a pivotal transit. Saturn’s current discipline invites you to release impatience, while Jupiter assures you that unseen karmic seeds are already taking root. Ground your intention today.`,
      `The cards and stars whisper synchronicity. Trust what your heart recognized before logic could intervene. The planetary alignment encourages honest dialogue and sovereign boundaries.`,
      `In this cycle, quiet observation is more potent than forced action. Protect your aura from external noise and allow the upcoming lunar illumination to reveal the next step naturally.`
    ];
    setAskOracleReply(answers[Math.floor(Math.random() * answers.length)]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="relative w-full max-w-6xl h-[94vh] max-h-[920px] bg-[#0c0517] border border-[#d4af37]/45 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#faf7f2]">
        
        <StarryBackground density="dense" className="opacity-35" />

        {/* Top Header Bar */}
        <div className="relative z-10 px-3 sm:px-6 py-3 border-b border-[#2c184d] bg-[#120724]/95 flex items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-[#1f0b3b] hover:bg-[#2e1254] border border-[#d4af37]/50 text-[#f5e7a9] transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold shadow-sm active:scale-95"
              title="Close and Return to Main Screen"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base sm:text-xl font-bold tracking-wider text-[#faf7f2] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37] animate-spin-slow" />
                  ASTRAL
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#271047] text-[#d4af37] border border-[#d4af37]/30">
                  Global Structure
                </span>
              </div>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative flex-1 max-w-xs sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#bda5db]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 18 pillars, Kundli, Tarot, Life Path..."
              className="w-full pl-8 pr-8 py-1.5 bg-[#1a0a33] border border-[#3b1c6b] rounded-full text-xs text-[#faf7f2] placeholder-[#bda5db]/50 focus:outline-none focus:border-[#d4af37]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#bda5db] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Format Toggle + Close Icon */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-[#190933] border border-[#36185c] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setViewFormat('tree')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewFormat === 'tree' ? 'bg-[#d4af37] text-[#0b0514] font-bold shadow' : 'text-[#bda5db] hover:text-white'
                }`}
                title="Strict Hierarchy Tree View"
              >
                <ListTree className="w-3.5 h-3.5" />
                <span className="text-[11px]">Hierarchy Tree</span>
              </button>
              <button
                onClick={() => setViewFormat('grid')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewFormat === 'grid' ? 'bg-[#d4af37] text-[#0b0514] font-bold shadow' : 'text-[#bda5db] hover:text-white'
                }`}
                title="Category Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Cards</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-[#bda5db] hover:text-[#faf7f2] hover:bg-[#200c3b] transition-colors cursor-pointer"
              title="Exit Directory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Results Dropdown Overlay if searching */}
        {searchQuery.trim() && (
          <div className="relative z-30 p-4 bg-[#110722] border-b border-[#2c184d] max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider font-mono">
                Found {searchResults.length} Matches in ASTRAL Structure
              </span>
              <button onClick={() => setSearchQuery('')} className="text-xs text-[#bda5db] hover:underline">
                Clear Search
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {searchResults.map(({ category, leaf, parentName }) => (
                <button
                  key={`${category.id}-${leaf.id}`}
                  onClick={() => {
                    setActiveCategoryId(category.id);
                    setSelectedLeafItem(leaf);
                    setSearchQuery('');
                  }}
                  className="p-2.5 rounded-xl bg-[#1b0d36] hover:bg-[#2a1352] border border-[#36195c] hover:border-[#d4af37]/60 text-left transition-all flex flex-col gap-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{category.icon}</span>
                    <span className="text-xs font-bold text-[#faf7f2] truncate">{leaf.name}</span>
                  </div>
                  <span className="text-[10px] text-[#d4af37]/80 truncate font-mono">
                    {category.name} {parentName ? `> ${parentName}` : ''}
                  </span>
                  {leaf.description && (
                    <span className="text-[10px] text-[#bda5db]/70 truncate">{leaf.description}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Body: Two-Column Layout (Left Navigation Sidebar + Right Workspace) */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: All 18 Pillars Exactly Mirroring Global Structure */}
          <div className="w-full md:w-64 bg-[#0e051c] border-b md:border-b-0 md:border-r border-[#261245] overflow-x-auto md:overflow-y-auto p-2 sm:p-3 flex md:flex-col gap-1 shrink-0 no-scrollbar">
            <div className="hidden md:flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#d4af37]/80 font-mono">
              <span>The 18 Global Pillars</span>
              <span className="text-[9px] bg-[#271047] px-1.5 py-0.2 rounded text-[#f5e7a9]">18/18</span>
            </div>

            {ASTRAL_TAXONOMY.map((cat, idx) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setSelectedLeafItem(null);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-[#0b0416] font-bold shadow-md shadow-black/40 scale-[1.01]' 
                      : 'text-[#d8c7ed] hover:bg-[#1f0d3b] hover:text-[#faf7f2]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="truncate tracking-wide">{cat.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-[#0b0416]/20 text-[#0b0416]' : 'text-[#bda5db]/50'}`}>
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Workspace: Selected Pillar & Sub-Hierarchy */}
          <div className="flex-1 bg-[#0b0416] overflow-y-auto p-3 sm:p-6 space-y-5">
            
            {/* Breadcrumb Bar */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-[#bda5db]/70 bg-[#140828] px-3.5 py-2 rounded-xl border border-[#2d1450]">
              <span className="text-[#d4af37] font-bold">ASTRAL</span>
              <span>&gt;</span>
              <span className="text-[#faf7f2] font-semibold">{activeCategory.icon} {activeCategory.name}</span>
              {selectedLeafItem && (
                <>
                  <span>&gt;</span>
                  <span className="text-[#f5e7a9] font-bold">{selectedLeafItem.name}</span>
                </>
              )}
            </div>

            {/* Category Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1b0a33] via-[#240e44] to-[#1b0a33] border border-[#d4af37]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0e041d] border border-[#d4af37]/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {activeCategory.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#faf7f2] tracking-wider">
                      {activeCategory.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#bda5db] mt-0.5">
                    {activeCategory.summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {activeCategoryId === 'horoscope' && (
                  <button
                    onClick={() => { onClose(); onNavigateSection('horoscope'); }}
                    className="px-3 py-1.5 rounded-full bg-[#1e0d38] border border-[#d4af37]/50 text-xs text-[#f5e7a9] font-semibold hover:bg-[#2c1352] transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Go to Horoscope Section</span>
                  </button>
                )}
                {activeCategoryId === 'experts' && (
                  <button
                    onClick={() => { onClose(); onNavigateSection('readers'); }}
                    className="px-3 py-1.5 rounded-full bg-[#1e0d38] border border-[#d4af37]/50 text-xs text-[#f5e7a9] font-semibold hover:bg-[#2c1352] transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>View All 20 Readers</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    onStartReading();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#e6ca65] hover:opacity-95 text-[#0b0514] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Free First Consultation</span>
                </button>
              </div>
            </div>

            {/* Interactive Tool Engines directly inside the active category */}
            {/* 1. Life Path Calculator (Numerology / Free Tools) */}
            {(activeCategoryId === 'numerology' || activeCategoryId === 'free-tools') && (
              <div className="p-4 rounded-xl bg-[#140828] border border-[#d4af37]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider font-mono">
                  <Star className="w-4 h-4" />
                  <span>Interactive Life Path Calculator</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="date"
                    value={birthDateInput}
                    onChange={(e) => setBirthDateInput(e.target.value)}
                    className="px-3 py-1.5 bg-[#1f0d3b] border border-[#401a75] rounded-xl text-xs text-[#faf7f2] focus:outline-none focus:border-[#d4af37]"
                  />
                  <button
                    onClick={handleCalculateLifePath}
                    className="px-4 py-1.5 bg-[#d4af37] hover:bg-[#f5e7a9] text-[#0b0514] font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Calculate Life Path
                  </button>
                  {calculatedLifePath && (
                    <div className="px-3 py-1 bg-[#28104a] border border-[#d4af37]/60 rounded-xl text-xs text-[#f5e7a9] font-bold animate-in fade-in">
                      Your Life Path Number is: <span className="text-base text-[#d4af37] font-serif ml-1">{calculatedLifePath}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Tarot Yes/No Draw (Tarot / Free Tools) */}
            {(activeCategoryId === 'tarot' || activeCategoryId === 'free-tools') && (
              <div className="p-4 rounded-xl bg-[#140828] border border-[#d4af37]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider font-mono">
                    <Moon className="w-4 h-4" />
                    <span>Instant Sacred Yes / No Tarot Card Draw</span>
                  </div>
                  <button
                    onClick={handleDrawTarotCard}
                    className="px-4 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#e6ca65] hover:opacity-95 text-[#0b0514] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Draw Card
                  </button>
                </div>
                {drawnTarot ? (
                  <div className="p-3 rounded-lg bg-[#200c3b] border border-[#d4af37]/50 flex items-start gap-3 animate-in fade-in">
                    <div className="w-10 h-10 rounded-lg bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center font-bold text-xs text-[#d4af37] shrink-0">
                      {drawnTarot.answer}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#faf7f2]">{drawnTarot.name} — Answer: {drawnTarot.answer}</h4>
                      <p className="text-xs text-[#bda5db] mt-1">{drawnTarot.meaning}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#bda5db]/70 italic">
                    Focus on a single question and press &quot;Draw Card&quot; to receive instantaneous consecrated guidance.
                  </p>
                )}
              </div>
            )}

            {/* 3. Zodiac Compatibility (Compatibility / Free Tools) */}
            {(activeCategoryId === 'compatibility' || activeCategoryId === 'free-tools') && (
              <div className="p-4 rounded-xl bg-[#140828] border border-[#d4af37]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider font-mono">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>Instant Zodiac Love Match Calculator</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={compSign1}
                    onChange={(e) => setCompSign1(e.target.value)}
                    className="px-3 py-1.5 bg-[#1f0d3b] border border-[#401a75] rounded-xl text-xs text-[#faf7f2] focus:outline-none"
                  >
                    {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="text-xs text-[#d4af37] font-bold">&amp;</span>
                  <select
                    value={compSign2}
                    onChange={(e) => setCompSign2(e.target.value)}
                    className="px-3 py-1.5 bg-[#1f0d3b] border border-[#401a75] rounded-xl text-xs text-[#faf7f2] focus:outline-none"
                  >
                    {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="px-3 py-1.5 bg-[#2b104d] border border-pink-500/50 rounded-xl text-xs text-pink-200 font-bold flex items-center gap-1.5">
                    <span>Harmonic Match:</span>
                    <span className="text-[#d4af37] font-serif text-sm font-bold">{compScore}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Ask Astral Oracle (Ask Astral) */}
            {activeCategoryId === 'ask-astral' && (
              <form onSubmit={handleAskOracle} className="p-4 rounded-xl bg-[#140828] border border-[#d4af37]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Oracle Portal: Ask Any Astrological or Spiritual Question</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={askQuery}
                    onChange={(e) => setAskQuery(e.target.value)}
                    placeholder="e.g. What does Saturn in 7th house mean for love?"
                    className="flex-1 px-3 py-1.5 bg-[#1f0d3b] border border-[#401a75] rounded-xl text-xs text-[#faf7f2] focus:outline-none focus:border-[#d4af37]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#d4af37] hover:bg-[#f5e7a9] text-[#0b0514] font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    Seek Oracle
                  </button>
                </div>
                {askOracleReply && (
                  <div className="p-3 rounded-lg bg-[#200c3b] border border-[#d4af37]/50 text-xs text-[#e6dbf5] leading-relaxed animate-in fade-in">
                    <span className="text-[#d4af37] font-bold block mb-1">Celestial Oracle Insight:</span>
                    {askOracleReply}
                  </div>
                )}
              </form>
            )}

            {/* 5. Global Languages and Currency (Global) */}
            {activeCategoryId === 'global' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#140828] border border-[#d4af37]/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider font-mono">
                    <Globe className="w-4 h-4" />
                    <span>Select Language (11 Languages Supported)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'es', label: 'Spanish (Español)' },
                      { code: 'fr', label: 'French (Français)' },
                      { code: 'de', label: 'German (Deutsch)' },
                      { code: 'pt', label: 'Portuguese (Português)' },
                      { code: 'it', label: 'Italian (Italiano)' },
                      { code: 'hi', label: 'Hindi (हिन्दी)' },
                      { code: 'ar', label: 'Arabic (العربية)' },
                      { code: 'ja', label: 'Japanese (日本語)' },
                      { code: 'ko', label: 'Korean (한국어)' },
                      { code: 'id', label: 'Indonesian (Bahasa)' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => onSelectLanguage(lang.code)}
                        className={`p-2 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                          currentLanguage === lang.code
                            ? 'bg-[#d4af37] text-[#0b0416] font-bold'
                            : 'bg-[#1b0d36] hover:bg-[#28124d] text-[#e0d3f2]'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {currentLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#140828] border border-[#d4af37]/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider font-mono">
                    <Star className="w-4 h-4" />
                    <span>Select Local Currency</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'USD', symbol: '$', label: 'USD ($ US Dollar)' },
                      { code: 'GBP', symbol: '£', label: 'GBP (£ British Pound)' },
                      { code: 'EUR', symbol: '€', label: 'EUR (€ Euro)' },
                      { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$ Canadian)' },
                      { code: 'AUD', symbol: 'A$', label: 'AUD (A$ Australian)' }
                    ].map(cur => (
                      <button
                        key={cur.code}
                        onClick={() => onSelectCurrency(cur.code)}
                        className={`p-2 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                          currentCurrency === cur.code
                            ? 'bg-[#d4af37] text-[#0b0416] font-bold'
                            : 'bg-[#1b0d36] hover:bg-[#28124d] text-[#e0d3f2]'
                        }`}
                      >
                        <span>{cur.label}</span>
                        {currentCurrency === cur.code && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW FORMAT 1: STRICT HIERARCHY TREE VIEW (COLLAPSIBLE EXACT MIRROR) */}
            {viewFormat === 'tree' ? (
              <div className="space-y-4 font-mono text-xs bg-[#100622] p-4 sm:p-5 rounded-2xl border border-[#2c144d]">
                
                {/* Root Node */}
                <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm border-b border-[#2d1450] pb-2">
                  <Compass className="w-4 h-4" />
                  <span>ASTRAL &gt; {activeCategory.icon} {activeCategory.name}</span>
                </div>

                {/* Subcategories & Tree Nodes */}
                <div className="space-y-3 pl-2 sm:pl-4">
                  {activeCategory.subCategories.map((sub, sIdx) => {
                    const isSubExpanded = expandedNodes[sub.id] ?? true;
                    return (
                      <div key={sub.id} className="space-y-2">
                        {/* SubCategory Branch Header */}
                        <div 
                          onClick={() => toggleNode(sub.id)}
                          className="flex items-center gap-2 text-[#f5e7a9] font-bold hover:text-[#d4af37] cursor-pointer transition-colors"
                        >
                          <span className="text-[#d4af37]">├──</span>
                          {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]" />}
                          <span>{sub.name}</span>
                          {sub.description && (
                            <span className="text-[10px] text-[#bda5db]/60 font-sans hidden sm:inline">— {sub.description}</span>
                          )}
                        </div>

                        {/* Collapsible Content */}
                        {isSubExpanded && (
                          <div className="pl-6 space-y-2 border-l border-[#2e1554] ml-3">
                            
                            {/* If SubGroups (e.g. Zodiac Signs in Western Astrology or Minor Arcana in Tarot) */}
                            {sub.subGroups && sub.subGroups.map((grp) => {
                              const grpId = `${sub.id}-${grp.name.toLowerCase().replace(/\s+/g, '-')}`;
                              const isGrpExpanded = expandedNodes[grpId] ?? true;
                              return (
                                <div key={grp.name} className="space-y-1.5">
                                  <div 
                                    onClick={() => toggleNode(grpId)}
                                    className="flex items-center gap-2 text-[#e2cfff] font-semibold hover:text-[#d4af37] cursor-pointer"
                                  >
                                    <span className="text-[#9d4edd]">│   ├──</span>
                                    {isGrpExpanded ? <ChevronDown className="w-3 h-3 text-[#d4af37]" /> : <ChevronRight className="w-3 h-3 text-[#d4af37]" />}
                                    <span>{grp.name}</span>
                                    <span className="text-[9px] bg-[#271047] px-1.5 py-0.2 rounded text-[#d4af37] font-sans">
                                      {grp.items.length} items
                                    </span>
                                  </div>

                                  {isGrpExpanded && (
                                    <div className="pl-6 space-y-1 border-l border-[#371963] ml-4">
                                      {grp.items.map((item) => {
                                        const leaf: TaxonomyLeaf = typeof item === 'string'
                                          ? { id: item.toLowerCase().replace(/\s+/g, '-'), name: item, description: '' }
                                          : item;
                                        return (
                                          <button
                                            key={leaf.id}
                                            onClick={() => setSelectedLeafItem(leaf)}
                                            className="w-full text-left py-1 px-2 rounded-lg hover:bg-[#1f0d3b] text-[#d8c7ed] hover:text-[#faf7f2] flex items-center justify-between group transition-colors cursor-pointer"
                                          >
                                            <div className="flex items-center gap-2 truncate">
                                              <span className="text-[#6c757d]">│   │   ├──</span>
                                              <span className="group-hover:text-[#d4af37] group-hover:underline font-medium truncate">{leaf.name}</span>
                                            </div>
                                            {leaf.description && (
                                              <span className="text-[10px] text-[#bda5db]/50 font-sans truncate max-w-xs hidden md:inline">
                                                {leaf.description}
                                              </span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Direct Items under SubCategory */}
                            {sub.items && (
                              <div className="space-y-1">
                                {sub.items.map((item) => {
                                  const leaf: TaxonomyLeaf = typeof item === 'string'
                                    ? { id: item.toLowerCase().replace(/\s+/g, '-'), name: item, description: '' }
                                    : item;
                                  return (
                                    <button
                                      key={leaf.id}
                                      onClick={() => setSelectedLeafItem(leaf)}
                                      className="w-full text-left py-1 px-2 rounded-lg hover:bg-[#1f0d3b] text-[#d8c7ed] hover:text-[#faf7f2] flex items-center justify-between group transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <span className="text-[#6c757d]">├──</span>
                                        <span className="group-hover:text-[#d4af37] group-hover:underline font-medium truncate">{leaf.name}</span>
                                        {leaf.badge && (
                                          <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-full bg-[#d4af37] text-[#0b0514]">
                                            {leaf.badge}
                                          </span>
                                        )}
                                      </div>
                                      {leaf.description && (
                                        <span className="text-[10px] text-[#bda5db]/50 font-sans truncate max-w-xs hidden md:inline">
                                          {leaf.description}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VIEW FORMAT 2: CATEGORY CARDS GRID */
              <div className="space-y-6">
                {activeCategory.subCategories.map(sub => (
                  <div key={sub.id} className="space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-[#261343]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] font-mono">
                        {sub.name}
                      </span>
                      {sub.description && (
                        <span className="text-[11px] text-[#bda5db]/70">
                          — {sub.description}
                        </span>
                      )}
                    </div>

                    {/* SubGroups if present */}
                    {sub.subGroups && (
                      <div className="space-y-4">
                        {sub.subGroups.map(grp => (
                          <div key={grp.name} className="space-y-2">
                            <span className="text-[11px] font-semibold text-[#f5e7a9] uppercase tracking-wider block">
                              {grp.name}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {grp.items.map(item => {
                                const leaf: TaxonomyLeaf = typeof item === 'string'
                                  ? { id: item.toLowerCase().replace(/\s+/g, '-'), name: item, description: '' }
                                  : item;
                                return (
                                  <button
                                    key={leaf.id}
                                    onClick={() => setSelectedLeafItem(leaf)}
                                    className="p-3 rounded-xl bg-[#140828] hover:bg-[#1f0d3b] border border-[#2a134d] hover:border-[#d4af37]/60 text-left transition-all flex flex-col justify-between gap-1 group cursor-pointer"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="text-xs font-bold text-[#faf7f2] group-hover:text-[#d4af37] transition-colors">
                                        {leaf.name}
                                      </span>
                                    </div>
                                    {leaf.description && (
                                      <span className="text-[11px] text-[#bda5db]/70 line-clamp-2">
                                        {leaf.description}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Flat Items */}
                    {sub.items && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {sub.items.map(item => {
                          const leaf: TaxonomyLeaf = typeof item === 'string'
                            ? { id: item.toLowerCase().replace(/\s+/g, '-'), name: item, description: '' }
                            : item;
                          return (
                            <button
                              key={leaf.id}
                              onClick={() => setSelectedLeafItem(leaf)}
                              className="p-3 rounded-xl bg-[#140828] hover:bg-[#1f0d3b] border border-[#2a134d] hover:border-[#d4af37]/60 text-left transition-all flex flex-col justify-between gap-1 group cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-[#faf7f2] group-hover:text-[#d4af37] transition-colors">
                                  {leaf.name}
                                </span>
                                {leaf.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#d4af37] text-[#0b0514]">
                                    {leaf.badge}
                                  </span>
                                )}
                              </div>
                              {leaf.description && (
                                <span className="text-[11px] text-[#bda5db]/70 line-clamp-2">
                                  {leaf.description}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Selected Leaf Detail Modal / Card if clicked */}
            {selectedLeafItem && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#1a0a33] border-2 border-[#d4af37] shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping" />
                    <h4 className="font-serif text-base sm:text-lg font-bold text-[#faf7f2]">
                      {selectedLeafItem.name}
                    </h4>
                  </div>
                  <button 
                    onClick={() => setSelectedLeafItem(null)}
                    className="text-xs text-[#bda5db] hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-[#d8c7ed] leading-relaxed">
                  {selectedLeafItem.description || 'Deep celestial guidance and lore curated by our verified sanctuary practitioners.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#341759]">
                  <button
                    onClick={() => {
                      onClose();
                      onStartReading();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#d4af37] hover:bg-[#f5e7a9] text-[#0b0514] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask an Elder About &quot;{selectedLeafItem.name}&quot;</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateSection('readers');
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#200c3b] hover:bg-[#32135c] border border-[#d4af37]/40 text-[#f5e7a9] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>View Specialist Readers</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="relative z-10 px-4 sm:px-6 py-2.5 bg-[#0a0314] border-t border-[#261245] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#bda5db]/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ASTRAL Structure: 18 Global Pillars • Complete Hierarchical Mapping</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Language: <strong className="text-[#f5e7a9] uppercase">{currentLanguage}</strong></span>
            <span>Currency: <strong className="text-[#f5e7a9]">{currentCurrency}</strong></span>
            <button
              onClick={onClose}
              className="text-[#d4af37] hover:underline font-bold cursor-pointer"
            >
              Exit Explorer ✕
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
