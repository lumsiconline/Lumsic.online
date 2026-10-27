import React, { useState } from 'react';
import { Star, Globe, Clock, MessageSquare, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  photoUrl: string;
  category: 'Western Readers' | 'Vedic Masters' | 'Psychics' | 'Tarot Readers' | 'Numerologists' | 'Spiritual Coaches';
  country: string;
  countryCode: string;
  languages: string[];
  specialization: string;
  rating: number;
  reviewsCount: number;
  pricePerMinute: string;
  availability: 'Online Now' | 'Next Available: 2h' | 'By Appointment';
  timezone: string;
}

const EXPERTS_DATA: Expert[] = [
  {
    id: '1',
    name: 'Dr. Alistair Thorne',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    category: 'Western Readers',
    country: 'United Kingdom',
    countryCode: 'GB',
    languages: ['English', 'French'],
    specialization: 'Psychological Insights & Solar Returns',
    rating: 4.98,
    reviewsCount: 420,
    pricePerMinute: '$3.50/min',
    availability: 'Online Now',
    timezone: 'GMT (UTC+0)'
  },
  {
    id: '2',
    name: 'Pandit Rameshwar Joshi',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    category: 'Vedic Masters',
    country: 'United Kingdom',
    countryCode: 'GB',
    languages: ['English', 'Hindi', 'Sanskrit'],
    specialization: 'Janam Kundli & Dasha Remedials',
    rating: 4.96,
    reviewsCount: 680,
    pricePerMinute: '$2.80/min',
    availability: 'Online Now',
    timezone: 'GMT (UTC+0)'
  },
  {
    id: '3',
    name: 'Genevieve Laurent',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    category: 'Tarot Readers',
    country: 'France',
    countryCode: 'FR',
    languages: ['French', 'English'],
    specialization: 'Tarot de Marseille & Celtic Cross Spreads',
    rating: 4.99,
    reviewsCount: 310,
    pricePerMinute: '$3.20/min',
    availability: 'Online Now',
    timezone: 'CET (UTC+1)'
  },
  {
    id: '4',
    name: 'Evelyn St. Claire',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    category: 'Psychics',
    country: 'United States',
    countryCode: 'US',
    languages: ['English'],
    specialization: 'Clairsentience & Aura Frequency Scanning',
    rating: 4.95,
    reviewsCount: 540,
    pricePerMinute: '$4.00/min',
    availability: 'Next Available: 2h',
    timezone: 'EST (UTC-5)'
  },
  {
    id: '5',
    name: 'Marcus Sterling',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    category: 'Numerologists',
    country: 'Australia',
    countryCode: 'AU',
    languages: ['English'],
    specialization: 'Pythagorean Life Path & Angel Number Sequences',
    rating: 4.94,
    reviewsCount: 220,
    pricePerMinute: '$2.90/min',
    availability: 'Online Now',
    timezone: 'AEST (UTC+10)'
  },
  {
    id: '6',
    name: 'Dr. Selene Rivera',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    category: 'Spiritual Coaches',
    country: 'Canada',
    countryCode: 'CA',
    languages: ['English', 'Spanish'],
    specialization: 'Chakra Alignment & Meditation Mindfulness',
    rating: 4.97,
    reviewsCount: 190,
    pricePerMinute: '$3.10/min',
    availability: 'By Appointment',
    timezone: 'PST (UTC-8)'
  }
];

export const ExpertsSection: React.FC<{ onBookExpert: () => void }> = ({ onBookExpert }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookedExpert, setBookedExpert] = useState<Expert | null>(null);

  const categories = [
    'All',
    'Western Readers',
    'Vedic Masters',
    'Psychics',
    'Tarot Readers',
    'Numerologists',
    'Spiritual Coaches'
  ];

  const filteredExperts = selectedCategory === 'All' 
    ? EXPERTS_DATA 
    : EXPERTS_DATA.filter(e => e.category === selectedCategory);

  return (
    <section id="experts" className="py-20 bg-[#070A18] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Specification 19) */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#E7C878] block mb-2">
            Vetted Global Practitioners
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Connect With an Expert
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            Book 1-on-1 private consultations with verified international readers, psychic intuitives, and spiritual coaches worldwide.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-10 justify-start lg:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-[#7C5CFF] text-white shadow-sm' 
                  : 'bg-[#11162B] border border-[#252A42] text-[#A8ADC2] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredExperts.map((expert) => (
            <div
              key={expert.id}
              className="cosmic-card p-6 rounded-2xl flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={expert.photoUrl}
                    alt={expert.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#252A42] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-base font-bold text-white truncate">{expert.name}</h4>
                    </div>
                    <span className="text-[11px] text-[#7C5CFF] font-medium block">
                      {expert.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#A8ADC2] mt-1">
                      <Globe className="w-3 h-3" />
                      <span>{expert.country}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{expert.timezone}</span>
                    </div>
                  </div>
                </div>

                {/* Specialization & Languages */}
                <div className="space-y-1.5 text-xs pb-4 border-b border-[#252A42]/60">
                  <div className="text-white font-medium">
                    {expert.specialization}
                  </div>
                  <div className="text-[#A8ADC2] text-[11px]">
                    Languages: {expert.languages.join(', ')}
                  </div>
                </div>
              </div>

              <div>
                {/* Rating & Availability */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-1 text-[#E7C878] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#E7C878]" />
                    <span>{expert.rating}</span>
                    <span className="text-[10px] text-[#A8ADC2] font-normal">({expert.reviewsCount})</span>
                  </div>

                  <div className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                    expert.availability === 'Online Now' ? 'text-emerald-400' : 'text-[#A8ADC2]'
                  }`}>
                    {expert.availability === 'Online Now' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <span>{expert.availability}</span>
                  </div>
                </div>

                {/* Price and Book Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-white">{expert.pricePerMinute}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBookedExpert(expert);
                      onBookExpert();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#7C5CFF] hover:bg-[#6A47FF] text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    Book Consultation
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Global Marketplace Notice */}
        <div className="p-4 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-between text-xs text-[#A8ADC2]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7C5CFF]" />
            <span>All global practitioners undergo credential validation and follow LUMSIC's strict ethical code of conduct.</span>
          </div>
          <span className="font-mono text-[11px] text-[#E7C878] hidden sm:inline">Worldwide Standard Timezones</span>
        </div>

      </div>
    </section>
  );
};
