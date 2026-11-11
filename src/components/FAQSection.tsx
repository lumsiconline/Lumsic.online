import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What are LUMSIC Sacred Remedies & Distance Healings?',
      a: 'LUMSIC sacred remedies encompass authentic Vedic pujas, distance energy transmissions, 7-chakra pranic cleansing, and road-opening ceremonies conducted by seasoned practitioners with genuine completion reports.'
    },
    {
      q: 'Are the physical store products consecrated before shipping?',
      a: 'Yes, 100%. Every sacred talisman, pyrite wealth ring, gemstone bracelet, and yantra undergoes authentic Vedic cleansing with holy water, chanting of Vedic mantras, and energisation before insured global dispatch.'
    },
    {
      q: 'How does distance energy healing work?',
      a: 'Spiritual energy transcends physical geography. Our masters focus upon your name, birth details, and energetic imprint during the sacred muhurta (auspicious hour) to unblock subtle channels and restore harmony.'
    },
    {
      q: 'What is included with my sacred store delivery?',
      a: 'Every package contains your consecrated artifact, an energized selenite cleansing plate (on eligible items), sacred vibhuti, a certificate of blessing, and an activation mantra guide.'
    },
    {
      q: 'How long does dispatch and delivery take?',
      a: 'Consecration and packaging take 1 to 2 business days. Tracked global shipping takes 3 to 7 business days worldwide with secure shock-proof packaging.'
    },
    {
      q: 'Can I book custom remedies for love, reunion, or prosperity?',
      a: 'Yes! Our practitioners perform custom ceremonies tailored to your exact situation, including Love & Soulmate Binding, Heartbreak Recovery, and Road Opener prosperity pujas.'
    }
  ];

  // Schema.org FAQPage JSON-LD structured data for search engine visibility
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  return (
    <section id="faq" className="py-14 sm:py-18 bg-white border-b border-gray-200/80">
      {/* FAQPage Structured Data (JSON-LD) for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#B45309] block mb-1.5">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-2">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Learn more about consultations, birth chart calculations, and our 100% satisfaction guarantee.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#FAF8F5] rounded-2xl border border-gray-200/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:text-[#B45309] transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-gray-950 leading-snug">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600 border-amber-300' : 'text-gray-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-gray-600 leading-relaxed font-normal border-t border-gray-200/60 pt-4 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
