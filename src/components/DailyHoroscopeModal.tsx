import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, Sparkles, Calendar, Volume2, VolumeX, 
  Heart, Briefcase, Activity, Shield, ArrowRight, Compass 
} from 'lucide-react';
import { ZODIAC_SIGNS } from '../data/horoscope';
import { DETAILED_AUDIO_HOROSCOPES } from '../data/horoscopeAudioData';
import { celestialAudio } from '../utils/celestialAudio';
import { ZodiacVectorArt } from './ZodiacVectorArt';

interface DailyHoroscopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSignId?: string;
  onStartReading?: () => void;
}

export const DailyHoroscopeModal: React.FC<DailyHoroscopeModalProps> = ({
  isOpen,
  onClose,
  initialSignId = 'aries',
  onStartReading
}) => {
  const [selectedSignId, setSelectedSignId] = useState<string>(initialSignId);
  const [dayOffset, setDayOffset] = useState<'yesterday' | 'today' | 'tomorrow'>('today');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (initialSignId) {
      setSelectedSignId(initialSignId);
    }
  }, [initialSignId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        celestialAudio.stop();
        setIsPlayingAudio(false);
        onClose();
      }
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

  if (!isOpen) return null;

  const selectedSign = ZODIAC_SIGNS.find(s => s.id === selectedSignId) || ZODIAC_SIGNS[0];
  const audioData = DETAILED_AUDIO_HOROSCOPES[selectedSignId] || DETAILED_AUDIO_HOROSCOPES.aries;

  // Real-time dynamic date calculation
  const getDisplayDate = () => {
    const d = new Date();
    if (dayOffset === 'yesterday') d.setDate(d.getDate() - 1);
    if (dayOffset === 'tomorrow') d.setDate(d.getDate() + 1);

    const day = d.getDate();
    const daySuffix = (num: number) => {
      if (num > 3 && num < 21) return 'th';
      switch (num % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
    const month = d.toLocaleDateString('en-GB', { month: 'long' });
    const year = d.getFullYear();
    return `${weekday}, ${day}${daySuffix(day)} ${month} ${year}`;
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      celestialAudio.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      celestialAudio.speakHoroscope(
        audioData.fullAudioScript,
        undefined,
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleCloseModal = () => {
    if (isPlayingAudio) {
      celestialAudio.stop();
      setIsPlayingAudio(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-3xl sm:rounded-[32px] shadow-2xl flex flex-col h-[94vh] max-h-[900px] text-gray-900 overflow-hidden border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="horoscope-modal-title"
      >
        {/* ================= 1. HEADER (Royal Theme Accent) ================= */}
        <header className="bg-gradient-to-r from-[#180A33] via-[#2D0D55] to-[#180A33] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 id="horoscope-modal-title" className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Daily Celestial Horoscopes</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase font-bold">
                  UPDATED DAILY
                </span>
              </h2>
              <p className="text-[11px] text-purple-200/80 font-normal">
                Choose your sign below to read today's live ephemeris transits &amp; cosmic scores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ================= 2. SCROLLABLE CONTENT BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Day Horizon Navigation & Date Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
            {/* Horizon Tabs: Yesterday | Today | Tomorrow */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200">
              {(['yesterday', 'today', 'tomorrow'] as const).map((tab) => {
                const isActive = dayOffset === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDayOffset(tab)}
                    className={`px-4 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#581C87] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Date Tag */}
            <div className="flex items-center gap-1.5 text-xs text-purple-900 font-bold">
              <Calendar className="w-3.5 h-3.5 text-purple-700" />
              <span>{getDisplayDate()}</span>
            </div>
          </div>

          {/* ================= 3. 12 ZODIAC CARDS GRID (Exact Mysticsense 2x6 Pattern) ================= */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-500">
                Choose Your Zodiac Sign
              </h3>
              <span className="text-xs text-purple-800 font-semibold">
                Tap any sign to view forecast
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {ZODIAC_SIGNS.map((sign) => {
                const isSelected = selectedSignId === sign.id;
                return (
                  <div
                    key={sign.id}
                    onClick={() => {
                      setSelectedSignId(sign.id);
                      if (isPlayingAudio) {
                        celestialAudio.stop();
                        setIsPlayingAudio(false);
                      }
                    }}
                    className={`bg-white rounded-3xl p-3.5 sm:p-4.5 border transition-all duration-200 cursor-pointer flex flex-col items-center text-center group relative ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-600/30 shadow-lg -translate-y-1 bg-purple-50/20'
                        : 'border-gray-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 hover:-translate-y-1'
                    }`}
                  >
                    {/* Active Selection Indicator Dot */}
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-purple-200" />
                    )}

                    {/* Circular Illustrated Zodiac Emblem (Matching Screenshot) */}
                    <div className="mb-2.5 transition-transform duration-200 group-hover:scale-105">
                      <ZodiacVectorArt signId={sign.id} size={64} />
                    </div>

                    {/* Zodiac Sign Name */}
                    <h4 className={`text-sm sm:text-base font-extrabold tracking-tight transition-colors ${
                      isSelected ? 'text-purple-900' : 'text-gray-950 group-hover:text-purple-700'
                    }`}>
                      {sign.name}
                    </h4>

                    {/* Date Range underneath */}
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 whitespace-nowrap">
                      {sign.dates}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= 4. SELECTED SIGN EXPANDED FORECAST DETAILS ================= */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-7 shadow-xs space-y-6">
            
            {/* Sign Header & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <ZodiacVectorArt signId={selectedSign.id} size={64} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                      {selectedSign.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[11px] font-bold uppercase">
                      {selectedSign.element}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ruling Planet: <strong className="text-gray-800">{selectedSign.rulingPlanet}</strong> • Tarot Key: <strong className="text-gray-800">{selectedSign.tarotCard}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Audio Narration & First Chat Free */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50'
                  }`}
                  title="Listen to daily audio reading"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-purple-600" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Audio'}</span>
                </button>

                {onStartReading && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      onStartReading();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F6D06E] to-[#E5B744] hover:brightness-105 active:scale-95 text-gray-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 border border-amber-300 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-gray-950" />
                    <span>Chat With Reader (First Chat Free)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Daily Transit Forecast */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-purple-800">
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                <span>Planetary Transit &amp; Alignment</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                {selectedSign.transitHeadline}
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                {selectedSign.transitText}
              </p>
            </div>

            {/* 4 Energy Metrics: Love, Career, Health, Family (Love in blush rose #EBC8CC) */}
            <div className="pt-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                Cosmic Vitality Scores
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#EBC8CC] border border-[#EBC8CC] text-center shadow-xs">
                  <Heart className="w-4 h-4 text-[#7A5C9E] mx-auto mb-1 fill-[#7A5C9E]" />
                  <span className="font-mono text-xl font-black text-[#7A5C9E]">{selectedSign.scores.love}%</span>
                  <span className="text-[11px] text-[#7A5C9E] font-bold block mt-0.5">Love</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F0F9FF] border border-sky-100 text-center">
                  <Briefcase className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <span className="font-mono text-xl font-black text-sky-800">{selectedSign.scores.career}%</span>
                  <span className="text-[11px] text-sky-900 font-semibold block mt-0.5">Career</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-emerald-100 text-center">
                  <Activity className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="font-mono text-xl font-black text-emerald-800">{selectedSign.scores.health}%</span>
                  <span className="text-[11px] text-emerald-900 font-semibold block mt-0.5">Vitality</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-purple-100 text-center">
                  <Shield className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <span className="font-mono text-xl font-black text-purple-800">{selectedSign.scores.family}%</span>
                  <span className="text-[11px] text-purple-900 font-semibold block mt-0.5">Family</span>
                </div>
              </div>
            </div>

            {/* Specific Love and Career Guidance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Love Guidance</span>
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {selectedSign.loveGuidance}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Career Guidance</span>
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {selectedSign.careerGuidance}
                </p>
              </div>
            </div>

            {/* Affirmation & Lucky Indicators */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 block">
                  Daily Power Affirmation
                </span>
                <p className="text-xs sm:text-sm font-serif italic text-purple-950 font-medium mt-0.5">
                  "{selectedSign.affirmation}"
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-gray-700 font-medium">
                  Lucky No: <strong className="text-purple-900 font-mono">{selectedSign.luckyNumber}</strong>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-gray-700 font-medium">
                  Color: <strong className="text-purple-900">{selectedSign.luckyColor}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
