import React from 'react';
import { BookOpen, Sparkles, ArrowRight, Compass, Star } from 'lucide-react';

interface LatestGuidesSectionProps {
  onOpenExplorer: (catId?: string) => void;
}

export const LatestGuidesSection: React.FC<LatestGuidesSectionProps> = ({ onOpenExplorer }) => {
  const guides = [
    {
      title: 'How to Read a Natal Chart Wheel: Step-by-Step for Beginners',
      category: 'Birth Charts',
      readTime: '6 min read',
      summary: 'Learn to decipher the Ascendant, Midheaven, 12 houses, and planetary aspects without feeling overwhelmed by glyphs.'
    },
    {
      title: 'Understanding Vedic Dashas: The 120-Year Vimshottari Roadmap',
      category: 'Vedic Jyotish',
      readTime: '8 min read',
      summary: 'Discover how Mahadashas and Antardashas trigger life-changing career breakthroughs, soulmate marriages, and spiritual awakenings.'
    },
    {
      title: 'The Seven Sacred Chakras: Clearing Blockages & Auric Protection',
      category: 'Spirituality',
      readTime: '5 min read',
      summary: 'Practical daily somatic exercises, visualization techniques, and crystal pairings to maintain vibrant energetic hygiene.'
    },
    {
      title: 'The Fool’s Journey: What the 22 Major Arcana Teach Us About Soul Evolution',
      category: 'Tarot',
      readTime: '7 min read',
      summary: 'Follow the universal mythic journey from innocence in The Fool to cosmic integration in The World.'
    }
  ];

  return (
    <section id="learn" className="py-12 sm:py-16 md:py-20 bg-[#0b0416] relative border-b border-[#2c184d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
              <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Sanctuary Academy &amp; Masterclasses</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
              Latest Guides &amp; Lore
            </h2>
            <p className="text-sm md:text-base text-[#bda5db] mt-2 max-w-2xl font-light">
              Deepen your understanding with grounded, research-backed guides written by our verified elders and scholars.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenExplorer('learn')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#1b0a33] hover:bg-[#2c1352] border border-[#d4af37]/40 text-xs font-semibold text-[#f5e7a9] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>Explore All Academy Guides</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
          </button>
        </div>

        {/* 4 Guides Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {guides.map((g, idx) => (
            <div
              key={idx}
              onClick={() => onOpenExplorer('learn')}
              className="p-5 rounded-2xl bg-[#140628] border border-[#2e1554] hover:border-[#d4af37]/60 shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-[#200c3b] text-[#d4af37] border border-[#d4af37]/30">
                    {g.category}
                  </span>
                  <span className="text-[#bda5db]/60">{g.readTime}</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-medium text-[#faf7f2] group-hover:text-[#f5e7a9] transition-colors leading-snug">
                  {g.title}
                </h3>
                <p className="text-xs text-[#bda5db] leading-relaxed line-clamp-3 font-light">
                  {g.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2f1454] flex items-center justify-between text-xs font-semibold text-[#f5e7a9]">
                <span>Read Masterclass</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
