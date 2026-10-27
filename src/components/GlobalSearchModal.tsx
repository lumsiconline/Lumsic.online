import React, { useState } from 'react';
import { Search, X, ArrowRight, Compass, Moon, Sparkles, BookOpen, User, Hash } from 'lucide-react';

interface SearchItem {
  title: string;
  category: string;
  description: string;
  sectionId: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Tools
  { title: 'Birth Chart Calculator', category: 'Tool', description: 'Compute natal wheel, degrees and aspects', sectionId: 'birth-chart' },
  { title: 'Today’s Horoscope', category: 'Horoscope', description: 'Daily astrological forecasts for all 12 signs', sectionId: 'horoscope' },
  { title: 'Psychic Sensitivity Test', category: 'Tool', description: 'Evaluate clairsentience and sensory resonance', sectionId: 'psychic' },
  { title: 'Intuition ESP Test', category: 'Tool', description: 'Interactive real-time symbol resonance test', sectionId: 'psychic' },
  { title: 'Daily Tarot Reading', category: 'Tarot', description: 'Draw one card or three card reflection spread', sectionId: 'tarot' },
  { title: 'Zodiac Love Compatibility', category: 'Tool', description: 'Elemental synastry and relationship harmony score', sectionId: 'compatibility' },
  { title: 'Life Path Number Calculator', category: 'Numerology', description: 'Calculate your core destiny number from birthdate', sectionId: 'numerology' },
  { title: 'Vedic Janam Kundli', category: 'Birth Charts', description: 'Sidereal chart with 12 Bhavas and Nakshatras', sectionId: 'vedic' },
  // Topics & Zodiac
  { title: 'Aries Zodiac Archetype', category: 'Zodiac', description: 'Cardinal Fire · Ruled by Mars', sectionId: 'horoscope' },
  { title: 'Scorpio Zodiac Archetype', category: 'Zodiac', description: 'Fixed Water · Ruled by Pluto', sectionId: 'horoscope' },
  { title: 'Saturn Return Guide', category: 'Article', description: 'Understanding structural maturity at age 29.5', sectionId: 'learn' },
  { title: 'Mercury Retrograde Ephemeris', category: 'Article', description: 'Astronomical phenomenon and reflective practice', sectionId: 'learn' },
  { title: 'Carl Jung and Tarot Archetypes', category: 'Article', description: 'Major Arcana as psychological mirror', sectionId: 'learn' },
  // Experts
  { title: 'Dr. Alistair Thorne', category: 'Expert', description: 'Western Chart Reader · London, UK', sectionId: 'experts' },
  { title: 'Pandit Rameshwar Joshi', category: 'Expert', description: 'Vedic Jyotish Reader · London, UK', sectionId: 'experts' },
  { title: 'Genevieve Laurent', category: 'Expert', description: 'Tarot Reader · Paris, France', sectionId: 'experts' },
];

export const GlobalSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionId: string) => void;
}> = ({ isOpen, onClose, onSelectSection }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim() === ''
    ? SEARCH_DATABASE.slice(0, 6)
    : SEARCH_DATABASE.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 sm:px-6">
      <div className="cosmic-card rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-[#070A18] border-b border-[#252A42] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#7C5CFF]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, zodiac signs, tarot cards, articles, experts..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#A8ADC2] focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A8ADC2] hover:text-white hover:bg-[#11162B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suggestions & Results List */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#A8ADC2] tracking-wider">
            {query.trim() === '' ? 'Popular Cosmic Resources' : `${results.length} Results Found`}
          </div>

          {results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectSection(item.sectionId);
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-[#1A2038] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-[#E7C878] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-medium text-[#7C5CFF] bg-[#7C5CFF]/15 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#A8ADC2] mt-0.5">{item.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A8ADC2] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[#A8ADC2]">
              No cosmic topics found matching "{query}". Try "birth chart", "tarot", or "Aries".
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
