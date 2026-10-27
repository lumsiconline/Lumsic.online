import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the first chat free offer work?',
      a: 'Every new user gets their first chat complimentary with any verified psychic, tarot reader, or spiritual advisor. Your free chat starts when your advisor joins the chat and greets you. No credit card is required, and there is zero obligation.'
    },
    {
      q: 'How accurate is the birth chart calculation?',
      a: 'LUMSIC uses high-precision astronomical algorithms based on NASA JPL ephemeris tables and Lahiri Ayanamsha for planetary calculations. Planetary degrees, Lagna cusps, and transits are calculated to the exact second.'
    },
    {
      q: 'Can I choose between Psychic and Tarot readings?',
      a: 'Yes! LUMSIC features certified clairvoyants, psychic advisors, tarot readers, and spiritual guides. You can select your preferred discipline anytime.'
    },
    {
      q: 'Are the readers real humans or AI bots?',
      a: '100% real verified human advisors. LUMSIC strictly forbids AI bot consultations. Every practitioner on our platform is a seasoned expert with verified background and credentials.'
    },
    {
      q: 'Is my consultation private and confidential?',
      a: 'Yes, completely. Your chats, call logs, birth details, and questions are protected with 256-bit bank-level encryption. Your data is never sold or shared with any third party.'
    },
    {
      q: 'What if I don’t know my exact birth time?',
      a: 'You can still get an accurate reading! Our expert readers can use intuitive clairvoyance, energy sensing, or Tarot to answer your questions accurately without an exact birth time.'
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
