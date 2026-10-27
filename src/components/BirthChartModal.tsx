import React, { useState } from 'react';
import { 
  X, Sparkles, Sun, Moon, ArrowUp, Compass, Layers, ShieldCheck, 
  Download, MessageSquare, Check, RefreshCw, Star, Info, Zap, Calendar, Clock, MapPin, Edit3
} from 'lucide-react';
import { 
  FullNatalChart, PlanetaryPosition, calculateNatalChart, GLOBAL_CITIES, GlobalCity 
} from '../utils/astronomicalCalculations';

interface BirthChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart?: FullNatalChart;
  initialChart?: FullNatalChart;
  birthDate?: string;
  birthTime?: string;
  cityName?: string;
  isVedic?: boolean;
  onToggleVedic?: (isVedic: boolean) => void;
  initialBirthDate?: string;
  initialBirthTime?: string;
  initialCityName?: string;
  initialIsVedic?: boolean;
  onConsultAstrologer?: () => void;
}

const ELEMENT_COLORS = {
  Fire: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500', bar: 'from-amber-500 to-rose-500' },
  Earth: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'bg-emerald-500', bar: 'from-emerald-500 to-teal-500' },
  Air: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/40', badge: 'bg-cyan-500', bar: 'from-cyan-400 to-blue-500' },
  Water: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/40', badge: 'bg-violet-500', bar: 'from-violet-500 to-indigo-500' }
};

export const BirthChartModal: React.FC<BirthChartModalProps> = ({
  isOpen,
  onClose,
  chart: propChart,
  initialChart,
  birthDate: propBirthDate,
  birthTime: propBirthTime,
  cityName: propCityName,
  isVedic: propIsVedic,
  onToggleVedic,
  initialBirthDate = '1998-07-15',
  initialBirthTime = '14:30',
  initialCityName = 'London, United Kingdom',
  initialIsVedic = false,
  onConsultAstrologer
}) => {
  const [activeTab, setActiveTab] = useState<'trinity' | 'wheel' | 'planets' | 'houses' | 'aspects'>('trinity');
  const [birthDate, setBirthDate] = useState(propBirthDate || initialBirthDate);
  const [birthTime, setBirthTime] = useState(propBirthTime || initialBirthTime);
  const [cityName, setCityName] = useState(propCityName || initialCityName);
  const [isVedic, setIsVedic] = useState(propIsVedic !== undefined ? propIsVedic : initialIsVedic);
  const [showEditBar, setShowEditBar] = useState(false);

  // Compute chart based on current state
  const computeChart = (dateStr: string, timeStr: string, cityStr: string, vedic: boolean): FullNatalChart => {
    try {
      const parts = dateStr.split('-');
      const y = parseInt(parts[0], 10) || 1998;
      const m = parseInt(parts[1], 10) || 7;
      const d = parseInt(parts[2], 10) || 15;
      const tParts = timeStr.split(':');
      const hr = parseInt(tParts[0], 10) || 12;
      const min = parseInt(tParts[1], 10) || 0;

      const city = GLOBAL_CITIES.find(c => cityStr.toLowerCase().includes(c.name.toLowerCase())) || GLOBAL_CITIES[1];
      return calculateNatalChart(y, m, d, hr, min, city, vedic);
    } catch {
      return calculateNatalChart(1998, 7, 15, 14, 30, GLOBAL_CITIES[1], vedic);
    }
  };

  const [currentChart, setCurrentChart] = useState<FullNatalChart>(() => {
    return propChart || initialChart || computeChart(birthDate, birthTime, cityName, isVedic);
  });

  if (!isOpen) return null;

  const handleRecalculate = (newVedic = isVedic) => {
    const updated = computeChart(birthDate, birthTime, cityName, newVedic);
    setCurrentChart(updated);
  };

  const handleApplyPreset = (preset: { date: string; time: string; city: string; vedic: boolean }) => {
    setBirthDate(preset.date);
    setBirthTime(preset.time);
    setCityName(preset.city);
    setIsVedic(preset.vedic);
    const updated = computeChart(preset.date, preset.time, preset.city, preset.vedic);
    setCurrentChart(updated);
  };

  const chart = currentChart;

  // Calculate element totals
  const totalElements = (chart.elements.fire + chart.elements.earth + chart.elements.air + chart.elements.water) || 10;
  const firePct = Math.round((chart.elements.fire / totalElements) * 100);
  const earthPct = Math.round((chart.elements.earth / totalElements) * 100);
  const airPct = Math.round((chart.elements.air / totalElements) * 100);
  const waterPct = Math.round((chart.elements.water / totalElements) * 100);

  // SVG Chart Wheel Geometry
  const wheelSize = 340;
  const center = wheelSize / 2;
  const outerR = 150;
  const innerR = 115;
  const hubR = 45;

  const zodiacSignsList = [
    { name: 'Aries', symbol: '♈', element: 'Fire' },
    { name: 'Taurus', symbol: '♉', element: 'Earth' },
    { name: 'Gemini', symbol: '♊', element: 'Air' },
    { name: 'Cancer', symbol: '♋', element: 'Water' },
    { name: 'Leo', symbol: '♌', element: 'Fire' },
    { name: 'Virgo', symbol: '♍', element: 'Earth' },
    { name: 'Libra', symbol: '♎', element: 'Air' },
    { name: 'Scorpio', symbol: '♏', element: 'Water' },
    { name: 'Sagittarius', symbol: '♐', element: 'Fire' },
    { name: 'Capricorn', symbol: '♑', element: 'Earth' },
    { name: 'Aquarius', symbol: '♒', element: 'Air' },
    { name: 'Pisces', symbol: '♓', element: 'Water' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Modal Dialog Container */}
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#070A18] border-2 border-amber-400/40 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#252A42] bg-[#0D1026]/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#070A18] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
                  Your Complete Natal Birth Chart
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Accurate Ephemeris
                </span>
              </div>
              <p className="text-xs text-[#A8ADC2] mt-0.5 flex items-center gap-2">
                <span>{cityName} · {birthDate} at {birthTime} · {isVedic ? 'Vedic (Lahiri)' : 'Western (Tropical)'}</span>
                <button
                  type="button"
                  onClick={() => setShowEditBar(!showEditBar)}
                  className="text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer text-[11px] flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{showEditBar ? 'Hide Inputs' : 'Edit Birth Details'}</span>
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* System Switcher */}
            <div className="hidden sm:flex items-center bg-[#11162B] p-1 rounded-xl border border-[#252A42]">
              <button
                type="button"
                onClick={() => {
                  setIsVedic(false);
                  handleRecalculate(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !isVedic ? 'bg-amber-400 text-gray-950 font-bold shadow-sm' : 'text-[#A8ADC2] hover:text-white'
                }`}
              >
                Western
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsVedic(true);
                  handleRecalculate(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isVedic ? 'bg-[#E7C878] text-[#070A18] font-bold shadow-sm' : 'text-[#A8ADC2] hover:text-white'
                }`}
              >
                Vedic (Lahiri)
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#A8ADC2] hover:text-white hover:bg-[#11162B] border border-transparent hover:border-[#252A42] transition-colors cursor-pointer"
              aria-label="Close birth chart modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Edit Birth Details Toolbar inside Modal */}
        {showEditBar && (
          <div className="px-6 py-3.5 bg-[#0A0E24] border-b border-[#252A42] flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-1.5 bg-[#11162B] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#11162B] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#11162B] px-3 py-1.5 rounded-xl border border-white/10 text-xs flex-1 min-w-[160px]">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full cursor-pointer"
              >
                {GLOBAL_CITIES.map((c, i) => (
                  <option key={i} value={`${c.name}, ${c.country}`} className="bg-[#0B1026] text-white">
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleRecalculate()}
              className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Chart</span>
            </button>

            {/* Quick Presets */}
            <div className="w-full flex items-center gap-1.5 pt-1 text-[11px] text-slate-400 overflow-x-auto">
              <span>Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset({ date: '1998-07-15', time: '14:30', city: 'London, United Kingdom', vedic: false })}
                className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-amber-200 cursor-pointer"
              >
                🇬🇧 London 1998
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset({ date: '1995-11-04', time: '09:15', city: 'New York, United States', vedic: false })}
                className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-amber-200 cursor-pointer"
              >
                🇺🇸 New York 1995
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset({ date: '1992-04-18', time: '06:45', city: 'London, United Kingdom', vedic: true })}
                className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-amber-200 cursor-pointer"
              >
                🇬🇧 London 1992 (Vedic)
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
          
          {/* 1. BIG 3 HERO TRINITY: SUN, MOON, RISING CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Sun Card */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#1c140a] via-[#11162B] to-[#11162B] border-2 border-amber-400/60 shadow-lg shadow-amber-500/5 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sun Sign · Core Identity</span>
                </span>
                <span className="text-2xl text-amber-300 font-serif">{chart.sun.signSymbol}</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight mb-1">
                {chart.sun.sign}
              </div>
              <div className="text-xs font-mono text-amber-300 mb-2.5">
                {chart.sun.degree}° {chart.sun.minute}' in House {chart.sun.house} ({chart.sun.element})
              </div>
              <p className="text-xs text-[#A8ADC2] leading-relaxed line-clamp-3">
                {chart.sun.interpretation}
              </p>
            </div>

            {/* Moon Card */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#170e2f] via-[#11162B] to-[#11162B] border-2 border-indigo-400/60 shadow-lg shadow-indigo-500/5 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Moon Sign · Emotional Soul</span>
                </span>
                <span className="text-2xl text-indigo-300 font-serif">{chart.moon.signSymbol}</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight mb-1">
                {chart.moon.sign}
              </div>
              <div className="text-xs font-mono text-indigo-300 mb-2.5">
                {chart.moon.degree}° {chart.moon.minute}' in House {chart.moon.house} ({chart.moon.element})
              </div>
              <p className="text-xs text-[#A8ADC2] leading-relaxed line-clamp-3">
                {chart.moon.interpretation}
              </p>
            </div>

            {/* Rising Card */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#0c2420] via-[#11162B] to-[#11162B] border-2 border-emerald-400/60 shadow-lg shadow-emerald-500/5 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rising (Ascendant) · Life Mask</span>
                </span>
                <span className="text-2xl text-emerald-400 font-serif">{chart.rising.signSymbol}</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight mb-1">
                {chart.rising.sign}
              </div>
              <div className="text-xs font-mono text-emerald-400 mb-2.5">
                {chart.rising.degree}° {chart.rising.minute}' on Cusp 1 ({chart.rising.element})
              </div>
              <p className="text-xs text-[#A8ADC2] leading-relaxed line-clamp-3">
                {chart.rising.interpretation}
              </p>
            </div>

          </div>

          {/* 2. ELEMENTAL & MODALITY BALANCE BAR */}
          <div className="p-4 rounded-2xl bg-[#0D1026] border border-[#252A42]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#A8ADC2] mb-2.5">
              <span className="flex items-center gap-1.5 text-white">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Cosmic Elemental Energy Balance</span>
              </span>
              <span className="text-[11px] text-[#A8ADC2]">
                Fire {firePct}% · Earth {earthPct}% · Air {airPct}% · Water {waterPct}%
              </span>
            </div>
            
            <div className="h-2.5 w-full bg-[#11162B] rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${firePct}%` }} className="bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500" title={`Fire: ${firePct}%`} />
              <div style={{ width: `${earthPct}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" title={`Earth: ${earthPct}%`} />
              <div style={{ width: `${airPct}%` }} className="bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" title={`Air: ${airPct}%`} />
              <div style={{ width: `${waterPct}%` }} className="bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500" title={`Water: ${waterPct}%`} />
            </div>
          </div>

          {/* 3. NAVIGATION TABS */}
          <div className="flex items-center gap-2 border-b border-[#252A42] pb-2 overflow-x-auto">
            {[
              { id: 'trinity', label: 'Big 3 Insights', icon: Sparkles },
              { id: 'wheel', label: '360° Natal Wheel', icon: Compass },
              { id: 'planets', label: 'Planetary Positions', icon: Sun },
              { id: 'houses', label: '12 Houses', icon: Layers },
              { id: 'aspects', label: 'Geometric Aspects', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-gray-950 font-bold shadow-md'
                      : 'text-[#A8ADC2] hover:text-white hover:bg-[#11162B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: TRINITY INSIGHTS */}
          {activeTab === 'trinity' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#0D1026] border border-[#252A42]">
                <h4 className="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Core Astrological Summary</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {chart.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[11px] font-bold uppercase text-amber-400 mb-1">Soul Drive (Sun)</div>
                  <div className="text-sm font-bold text-white mb-1">{chart.sun.sign} {chart.sun.degree}°</div>
                  <p className="text-xs text-slate-300">{chart.sun.interpretation}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[11px] font-bold uppercase text-indigo-400 mb-1">Instinctive Heart (Moon)</div>
                  <div className="text-sm font-bold text-white mb-1">{chart.moon.sign} {chart.moon.degree}°</div>
                  <p className="text-xs text-slate-300">{chart.moon.interpretation}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[11px] font-bold uppercase text-emerald-400 mb-1">Life Direction (Ascendant)</div>
                  <div className="text-sm font-bold text-white mb-1">{chart.rising.sign} {chart.rising.degree}°</div>
                  <p className="text-xs text-slate-300">{chart.rising.interpretation}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SVG 360° WHEEL */}
          {activeTab === 'wheel' && (
            <div className="flex flex-col items-center justify-center p-6 bg-[#0D1026] rounded-2xl border border-[#252A42] animate-in fade-in duration-150">
              <svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`} className="drop-shadow-2xl">
                {/* Outer Ring */}
                <circle cx={center} cy={center} r={outerR} fill="none" stroke="#252A42" strokeWidth="2" />
                <circle cx={center} cy={center} r={innerR} fill="none" stroke="#252A42" strokeWidth="1" />
                <circle cx={center} cy={center} r={hubR} fill="#070A18" stroke="#E7C878" strokeWidth="2" />

                {/* 12 Zodiac Sign Segments */}
                {zodiacSignsList.map((z, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
                  const midAngle = (i * 30 + 15 - 90) * (Math.PI / 180);
                  const x1 = center + innerR * Math.cos(angle);
                  const y1 = center + innerR * Math.sin(angle);
                  const x2 = center + outerR * Math.cos(angle);
                  const y2 = center + outerR * Math.sin(angle);
                  const glyphX = center + ((outerR + innerR) / 2) * Math.cos(midAngle);
                  const glyphY = center + ((outerR + innerR) / 2) * Math.sin(midAngle) + 4;

                  return (
                    <g key={z.name}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#252A42" strokeWidth="1" />
                      <text
                        x={glyphX}
                        y={glyphY}
                        fill="#E7C878"
                        fontSize="14"
                        textAnchor="middle"
                        fontFamily="serif"
                      >
                        {z.symbol}
                      </text>
                    </g>
                  );
                })}

                {/* 12 House Dividing Lines */}
                {chart.houses.map((h, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x1 = center + hubR * Math.cos(angle);
                  const y1 = center + hubR * Math.sin(angle);
                  const x2 = center + innerR * Math.cos(angle);
                  const y2 = center + innerR * Math.sin(angle);
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#252A42" strokeDasharray="3 3" />
                  );
                })}

                {/* Planets on Wheel */}
                {chart.planets.map((p, i) => {
                  const angle = (p.degree * 12 - 90) * (Math.PI / 180);
                  const r = hubR + 25 + (i % 3) * 16;
                  const px = center + r * Math.cos(angle);
                  const py = center + r * Math.sin(angle);
                  return (
                    <g key={p.name}>
                      <circle cx={px} cy={py} r="10" fill="#11162B" stroke="#7C5CFF" strokeWidth="1.5" />
                      <text x={px} y={py + 3.5} fill="#FFF" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
                        {p.symbol}
                      </text>
                    </g>
                  );
                })}

                {/* Center Hub Logo */}
                <text x={center} y={center - 2} fill="#E7C878" fontSize="12" fontWeight="bold" textAnchor="middle">
                  LUMSIC
                </text>
                <text x={center} y={center + 12} fill="#A8ADC2" fontSize="8" textAnchor="middle">
                  NATAL
                </text>
              </svg>
            </div>
          )}

          {/* TAB 3: PLANETARY POSITIONS TABLE */}
          {activeTab === 'planets' && (
            <div className="overflow-x-auto rounded-2xl border border-[#252A42] bg-[#0D1026] animate-in fade-in duration-150">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#252A42] text-[#A8ADC2] font-semibold bg-[#11162B]">
                    <th className="py-3 px-4">Planet</th>
                    <th className="py-3 px-4">Sign</th>
                    <th className="py-3 px-4">Degree</th>
                    <th className="py-3 px-4">House</th>
                    <th className="py-3 px-4">Element</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A42]">
                  {chart.planets.map((planet) => {
                    const elColor = ELEMENT_COLORS[planet.element] || ELEMENT_COLORS.Fire;
                    return (
                      <tr key={planet.name} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <span className="text-amber-400 font-serif text-sm">{planet.symbol}</span>
                          <span>{planet.name}</span>
                        </td>
                        <td className="py-3 px-4 text-[#A8ADC2]">
                          <span className="text-white font-medium">{planet.sign}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-white">
                          {planet.degree}° {planet.minute}'
                        </td>
                        <td className="py-3 px-4 text-[#A8ADC2]">
                          House {planet.house}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${elColor.bg} ${elColor.text}`}>
                            {planet.element}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: 12 HOUSES */}
          {activeTab === 'houses' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-150">
              {chart.houses.map((house) => (
                <div
                  key={house.houseNumber}
                  className="p-4 rounded-xl bg-[#0D1026] border border-[#252A42] hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300">
                      House {house.houseNumber}
                    </span>
                    <span className="text-xs font-mono text-white">
                      {house.sign} {house.degree}°
                    </span>
                  </div>
                  <p className="text-xs text-[#A8ADC2] leading-relaxed">
                    {house.meaning}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: PLANETARY ASPECTS */}
          {activeTab === 'aspects' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {chart.aspects.map((aspect, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#11162B] border border-amber-400/40 text-amber-300 font-bold text-sm flex items-center justify-center shrink-0">
                      {aspect.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">
                          {aspect.planet1} {aspect.type} {aspect.planet2}
                        </span>
                        <span className="text-[10px] text-[#A8ADC2] font-mono">
                          orb {aspect.orb}°
                        </span>
                      </div>
                      <p className="text-xs text-[#A8ADC2] leading-relaxed">
                        {aspect.interpretation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#252A42] bg-[#0D1026]/95">
          <div className="flex items-center gap-2 text-xs text-[#A8ADC2]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Exact calculations grounded in NASA JPL orbital ephemeris.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-[#11162B] hover:bg-[#1A2038] text-white border border-[#252A42] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4 text-[#A8ADC2]" />
              <span>Print / Save</span>
            </button>

            {onConsultAstrologer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConsultAstrologer();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 flex-1 sm:flex-initial"
              >
                <MessageSquare className="w-4 h-4 text-gray-950" />
                <span>Consult Advisor on This Chart</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
