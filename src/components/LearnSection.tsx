import React, { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, ChevronRight } from 'lucide-react';

interface Article {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  updatedDate: string;
  readTime: string;
  contentHeadings: {
    h2: string;
    h3: string;
    body: string;
  }[];
  relatedTool: { name: string; sectionId: string };
  relatedArticleId: string;
}

const ARTICLES_DATA: Article[] = [
  {
    id: 'understanding-natal-chart',
    category: 'Birth Charts',
    title: 'The Architecture of Self: How to Read a Natal Birth Chart',
    subtitle: 'A foundational guide to decoding the Sun, Moon, Rising sign and 12 cosmic houses.',
    author: 'Elena Vance',
    authorRole: 'Master Ephemeris Researcher',
    publishedDate: 'January 12, 2026',
    updatedDate: 'October 3, 2026',
    readTime: '6 min read',
    contentHeadings: [
      {
        h2: '1. The Celestial Trinity: Sun, Moon, and Ascendant',
        h3: 'The Primal Building Blocks of Personality',
        body: 'Your natal chart is an astronomical snapshot of the solar system viewed from your exact geographic coordinates at the moment of birth. While pop culture focuses exclusively on the Sun sign, the Moon reveals your subconscious emotional processing, and the Rising sign (Ascendant) dictates the external lens through which you meet the world.'
      },
      {
        h2: '2. The 12 Cosmic Houses as Life Domains',
        h3: 'Spatial Quadrants from Identity to Legacy',
        body: 'The 360-degree zodiac wheel is divided into 12 houses starting at the eastern horizon (1st House cusp). Angular houses (1st, 4th, 7th, 10th) mark the cornerstones of selfhood, home sanctuary, interpersonal partnerships, and public vocation.'
      },
      {
        h2: '3. Angular Aspects and Geometric Energy Flows',
        h3: 'Trines, Squares, and Conjunctions in Dynamic Dialogue',
        body: 'Planets converse through geometric angles. Trines (120°) and Sextiles (60°) indicate effortless natural talent and ease, while Squares (90°) and Oppositions (180°) supply the developmental friction that prompts lifelong character building and resilience.'
      }
    ],
    relatedTool: { name: 'Calculate Your Natal Chart', sectionId: 'birth-chart' },
    relatedArticleId: 'vedic-vs-western-traditions'
  },
  {
    id: 'vedic-vs-western-traditions',
    category: 'Cosmic Wisdom',
    title: 'Vedic vs. Western Traditions: The Complete Technical Comparison',
    subtitle: 'Understanding the astronomical distinction between the Tropical and Sidereal zodiac systems.',
    author: 'Dr. Alistair Thorne',
    authorRole: 'Senior Esoteric Historian',
    publishedDate: 'February 18, 2026',
    updatedDate: 'September 28, 2026',
    readTime: '8 min read',
    contentHeadings: [
      {
        h2: '1. The Axial Precession and the Lahiri Ayanamsha',
        h3: 'Why Signs Differ by Approximately 24 Degrees',
        body: 'Earth wobbles on its axis over a 25,772-year cycle known as the precession of the equinoxes. Western traditions fix 0° Aries to the vernal equinox (Tropical system). Vedic traditions anchor their zodiac to the fixed visible constellations using the Lahiri Ayanamsha (Sidereal system).'
      },
      {
        h2: '2. The 27 Lunar Mansions (Nakshatras)',
        h3: 'Micro-Cosmic Constellations in Vedic Tradition',
        body: 'Where Western systems focus primarily on solar archetypes and planetary houses, Vedic Jyotish relies deeply on the 27 Nakshatras—each ruled by a deity and planetary lord—to govern the exact timing of life periods through Vimshottari Dashas.'
      }
    ],
    relatedTool: { name: 'Explore Western & Vedic Systems', sectionId: 'readers' },
    relatedArticleId: 'understanding-natal-chart'
  },
  {
    id: 'tarot-archetypes-psychology',
    category: 'Tarot',
    title: 'Tarot as a Psychological Mirror: Carl Jung and the Major Arcana',
    subtitle: 'How 78 archetypal cards illuminate the unconscious patterns of the human journey.',
    author: 'Genevieve Laurent',
    authorRole: 'Divinatory Philosophy Fellow',
    publishedDate: 'March 5, 2026',
    updatedDate: 'September 15, 2026',
    readTime: '5 min read',
    contentHeadings: [
      {
        h2: "1. The Fool's Journey: From Zero to Completion",
        h3: 'The Universal Monomyth in 22 Cards',
        body: 'The Major Arcana charts the universal psychological journey described by Carl Jung. The Fool represents unconditioned potential setting out across developmental stages of authority (Emperor), wisdom (Hermit), crisis (Tower), and illumination (The Star).'
      },
      {
        h2: '2. Synchronicities in Card Selection',
        h3: 'Reflective Inquiries Beyond Fortune-Telling',
        body: 'Rather than predicting an unalterable future, tarot functions as an active contemplation tool. The symbols selected reflect current subconscious states and prompt conscious inquiry into personal decisions.'
      }
    ],
    relatedTool: { name: 'Draw Your Daily Card', sectionId: 'tarot' },
    relatedArticleId: 'understanding-natal-chart'
  }
];

export const LearnSection: React.FC<{ onNavigateSection: (sectionId: string) => void }> = ({ onNavigateSection }) => {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Birth Charts',
    'Cosmic Wisdom',
    'Tarot',
    'Psychic',
    'Numerology',
    'Spirituality',
    'Vedic Wisdom'
  ];

  const filteredArticles = selectedCategory === 'All'
    ? ARTICLES_DATA
    : ARTICLES_DATA.filter(a => a.category === selectedCategory);

  return (
    <section id="learn" className="py-16 sm:py-20 bg-gradient-to-b from-[#FFF8DF] via-[#FAF8F5] to-[#FAF6EB] border-b border-[#EAD8A4]/80 scroll-mt-20 relative text-[#2B2418]">
      <div id="vlogs" className="absolute -top-20" />
      <div id="blogs" className="absolute -top-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#B45309] block mb-2">
            Sanctuary Vlogs &amp; Editorial Knowledge Base
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2B2418] tracking-tight mb-3 font-serif">
            Spiritual Vlogs &amp; Guides
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6654] leading-relaxed">
            Watch and read expert video breakdowns, astronomical ephemeris guides, and ancestral traditions authored by our master researchers.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-10 justify-start lg:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-gradient-to-r from-[#D6A83F] to-[#B45309] text-white shadow-sm' 
                  : 'bg-[#FFFDF9] border border-[#EAD8A4] text-[#6F6654] hover:text-[#2B2418] hover:border-[#D6A83F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-[#FFFDF9] border border-[#EAD8A4] hover:border-[#D6A83F] p-6 rounded-3xl flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#6F6654]">
                  <span className="font-bold text-[#B45309]">{article.category}</span>
                  <span className="font-medium text-[#8C6D23]">{article.readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-[#2B2418] group-hover:text-[#B45309] transition-colors leading-snug font-serif">
                  {article.title}
                </h3>

                <p className="text-xs text-[#6F6654] leading-relaxed line-clamp-2">
                  {article.subtitle}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-[#EAD8A4]/70 flex items-center justify-between text-xs text-[#6F6654]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FAF6EB] border border-[#EAD8A4] flex items-center justify-center text-[10px] text-[#B45309] font-bold">
                    {article.author[0]}
                  </div>
                  <span className="font-semibold text-[#2B2418]">{article.author}</span>
                </div>

                <span className="text-[#B45309] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Read</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-6 pt-16 sm:pt-20">
          <div className="bg-[#FFFDF9] border border-[#EAD8A4] rounded-3xl p-6 sm:p-10 max-w-3xl w-full my-auto space-y-6 relative text-[#2B2418] shadow-2xl">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#6F6654] hover:text-[#2B2418] bg-[#FAF6EB] border border-[#EAD8A4] cursor-pointer"
            >
              ✕
            </button>

            {/* Breadcrumbs */}
            <nav className="text-xs text-[#6F6654] flex items-center gap-1.5" aria-label="Breadcrumb">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span>Learn</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#B45309] font-bold">{activeArticle.category}</span>
            </nav>

            {/* Article H1 */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2418] leading-tight font-serif">
              {activeArticle.title}
            </h1>

            <p className="text-sm text-[#6F6654] font-normal leading-relaxed">
              {activeArticle.subtitle}
            </p>

            {/* Author, Publication & Updated Date */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6F6654] py-3 border-y border-[#EAD8A4]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#B45309]" />
                <span className="text-[#2B2418] font-bold">{activeArticle.author}</span>
                <span className="text-[#8C6D23]">({activeArticle.authorRole})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Published: {activeArticle.publishedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Updated: {activeArticle.updatedDate}</span>
              </div>
            </div>

            {/* Body Content with H2 and H3 Headings */}
            <div className="space-y-6 text-sm text-[#4A4233] leading-relaxed">
              {activeArticle.contentHeadings.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h2 className="text-lg font-bold text-[#2B2418] font-serif">{section.h2}</h2>
                  <h3 className="text-sm font-bold text-[#B45309]">{section.h3}</h3>
                  <p>{section.body}</p>
                </div>
              ))}
            </div>

            {/* Related Tools Card */}
            <div className="p-5 rounded-2xl bg-[#FAF6EB] border border-[#EAD8A4] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#2B2418] block">Companion Interactive Tool:</span>
                <span className="text-xs text-[#6F6654]">{activeArticle.relatedTool.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveArticle(null);
                  onNavigateSection(activeArticle.relatedTool.sectionId);
                }}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D6A83F] to-[#B45309] text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Launch Tool
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
