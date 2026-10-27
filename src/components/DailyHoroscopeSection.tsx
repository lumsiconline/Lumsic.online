import React, { useState } from 'react';
import { ZODIAC_SIGNS } from '../data/horoscope';
import { DETAILED_AUDIO_HOROSCOPES } from '../data/horoscopeAudioData';
import { celestialAudio } from '../utils/celestialAudio';
import { ZodiacVectorArt } from './ZodiacVectorArt';
import { Reader } from '../types';
import { 
  Sparkles, Heart, Briefcase, Activity, Shield, Calendar, 
  Volume2, VolumeX, ArrowRight, Check, ChevronDown, Compass
} from 'lucide-react';

interface DailyHoroscopeSectionProps {
  onSelectReader?: (reader: Reader) => void;
  onGoBack?: () => void;
}

export const DailyHoroscopeSection: React.FC<DailyHoroscopeSectionProps> = ({ 
  onSelectReader 
}) => {
  // Selected sign (defaults to Aries or user choice)
  const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  
  // Day filter: 'yesterday' | 'today' | 'tomorrow'
  const [dayOffset, setDayOffset] = useState<'yesterday' | 'today' | 'tomorrow'>('today');

  // Audio broadcast player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const selectedSign = ZODIAC_SIGNS.find(s => s.id === selectedSignId) || ZODIAC_SIGNS[0];
  const audioData = DETAILED_AUDIO_HOROSCOPES[selectedSignId] || DETAILED_AUDIO_HOROSCOPES.aries;

  // Real-time dynamic dates calculation
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

  // Toggle audio reading
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

  return (
    <section id="horoscope" className="py-16 sm:py-22 bg-[#FAF8F5] border-b border-gray-200/90 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= 1. SECTION HEADER (Matching Clean Mysticsense Aesthetics) ================= */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>DAILY CELESTIAL HOROSCOPES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-950 tracking-tight font-sans">
            Choose Your Zodiac Sign
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 font-normal">
            Select your sign below to read your accurate daily horoscope, planetary transits, and cosmic vitality scores. Updated daily for your journey.
          </p>

          {/* Day Horizon Toggle Tabs: [ Yesterday ] [ Today ] [ Tomorrow ] */}
          <div className="flex items-center justify-center gap-1.5 mt-5 p-1 bg-white rounded-full border border-gray-200/90 shadow-2xs w-fit mx-auto">
            {(['yesterday', 'today', 'tomorrow'] as const).map((tab) => {
              const isActive = dayOffset === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDayOffset(tab)}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#581C87] text-white shadow-xs font-extrabold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Current Dynamic Date Tag */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-purple-900 font-semibold mt-3">
            <Calendar className="w-3.5 h-3.5 text-purple-700" />
            <span>{getDisplayDate()}</span>
            <span className="text-gray-400">•</span>
            <span className="text-emerald-700 font-bold">● Live Transit Active</span>
          </div>
        </div>

        {/* ================= 2. 12 ZODIAC CARDS GRID (Exact 2x6 Mysticsense Pattern) ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4.5">
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
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col items-center text-center group relative ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-600/30 shadow-lg -translate-y-1 bg-purple-50/20'
                    : 'border-gray-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 hover:-translate-y-1'
                }`}
              >
                {/* Active Selection Indicator Pill */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-purple-200" />
                )}

                {/* Circular Illustrated Zodiac Emblem (Matching Screenshot) */}
                <div className="mb-3.5 transition-transform duration-200 group-hover:scale-105">
                  <ZodiacVectorArt signId={sign.id} size={76} />
                </div>

                {/* Zodiac Sign Name */}
                <h3 className={`text-base sm:text-lg font-extrabold tracking-tight transition-colors ${
                  isSelected ? 'text-purple-900' : 'text-gray-950 group-hover:text-purple-700'
                }`}>
                  {sign.name}
                </h3>

                {/* Date Range underneath */}
                <p className="text-[11px] text-gray-500 font-medium mt-0.5 whitespace-nowrap">
                  {sign.dates}
                </p>
              </div>
            );
          })}
        </div>

        {/* ================= 3. SELECTED SIGN DAILY FORECAST PANEL ================= */}
        <div className="mt-10 bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-sm">
          {/* Header Row for Selected Sign */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <ZodiacVectorArt signId={selectedSign.id} size={72} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                    {selectedSign.name} Daily Horoscope
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wide">
                    {selectedSign.element} Sign
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Ruling Planet: <strong className="text-gray-800">{selectedSign.rulingPlanet}</strong> • Tarot Card: <strong className="text-gray-800">{selectedSign.tarotCard}</strong>
                </p>
              </div>
            </div>

            {/* Audio Reading Broadcast & Chat CTA */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                    : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50'
                }`}
                title="Listen to 2-3 minute celestial audio narration in UK English"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-600" />}
                <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Daily Audio'}</span>
              </button>

              <a
                href="#readers"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F6D06E] to-[#E5B744] hover:brightness-105 active:scale-95 text-gray-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 border border-amber-300"
              >
                <span>Chat With Reader</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Today's Planetary Transit Headline & Body */}
          <div className="py-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-800">
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Cosmic Transit Ephemeris ({getDisplayDate()})</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {selectedSign.transitHeadline}
            </h4>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              {selectedSign.transitText}
            </p>
          </div>

          {/* 4 Vitality Metrics (Love, Career, Health, Family - Love in blush rose #EBC8CC) */}
          <div className="pt-2 pb-6 border-y border-gray-100">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
              Today's Cosmic Energy Breakdown
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#EBC8CC] border border-[#EBC8CC] text-center shadow-xs">
                <Heart className="w-5 h-5 text-[#7A5C9E] mx-auto mb-1 fill-[#7A5C9E]" />
                <span className="font-mono text-2xl font-black text-[#7A5C9E]">{selectedSign.scores.love}%</span>
                <span className="text-xs text-[#7A5C9E] font-bold block mt-0.5">Love &amp; Romance</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F0F9FF] border border-sky-100 text-center">
                <Briefcase className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <span className="font-mono text-2xl font-black text-sky-800">{selectedSign.scores.career}%</span>
                <span className="text-xs text-sky-900 font-semibold block mt-0.5">Career &amp; Growth</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-emerald-100 text-center">
                <Activity className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="font-mono text-2xl font-black text-emerald-800">{selectedSign.scores.health}%</span>
                <span className="text-xs text-emerald-900 font-semibold block mt-0.5">Vitality &amp; Focus</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-purple-100 text-center">
                <Shield className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="font-mono text-2xl font-black text-purple-800">{selectedSign.scores.family}%</span>
                <span className="text-xs text-purple-900 font-semibold block mt-0.5">Harmony &amp; Peace</span>
              </div>
            </div>
          </div>

          {/* Love & Career Dedicated Guidance Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                <span>Romantic Outlook</span>
              </span>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {selectedSign.loveGuidance}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Career &amp; Purpose</span>
              </span>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {selectedSign.careerGuidance}
              </p>
            </div>
          </div>

          {/* Bottom Bar: Affirmation & Auspicious Signs */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 block">
                Today's Power Affirmation
              </span>
              <p className="text-sm font-serif italic text-purple-950 font-medium mt-0.5">
                "{selectedSign.affirmation}"
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-gray-700 font-medium">
                Lucky Number: <strong className="text-purple-900 font-mono">{selectedSign.luckyNumber}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-gray-700 font-medium">
                Lucky Color: <strong className="text-purple-900">{selectedSign.luckyColor}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
