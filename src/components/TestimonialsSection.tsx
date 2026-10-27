import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Sarah',
      location: 'New York, USA',
      stars: 5,
      date: 'Yesterday',
      reader: 'Sophia Moon',
      text: 'Really insightful reading. The guidance helped me look at my situation from a completely different perspective.'
    },
    {
      name: 'Emily',
      location: 'London, UK',
      stars: 5,
      date: '3 days ago',
      reader: 'Oliver Hart',
      text: 'I was impressed by how detailed and personal the reading felt. It gave me a lot of clarity about my next steps.'
    },
    {
      name: 'Jessica',
      location: 'Los Angeles, USA',
      stars: 5,
      date: 'This week',
      reader: 'Eleanor Vance',
      text: "One of the most thoughtful tarot readings I've had. The reader was warm, professional and easy to talk to."
    },
    {
      name: 'Olivia',
      location: 'Manchester, UK',
      stars: 5,
      date: 'Last week',
      reader: 'Marcus Sterling',
      text: 'Such a positive experience. The reading gave me clarity around my career and relationships.'
    }
  ];

  return (
    <section id="testimonials" className="py-7 sm:py-9 bg-white border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Compact */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="text-[11px] uppercase font-extrabold tracking-widest text-[#B45309] block mb-1">
            4.98 / 5.0 Rating Across 2,896+ Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight mb-1.5">
            What Our Seekers Say
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Real feedback from seekers across the USA &amp; UK who found clarity, peace, and direction.
          </p>
        </div>

        {/* Reviews Grid - Compact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F5] p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-4 h-4 text-amber-400/50" />
                </div>

                <p className="text-xs text-gray-700 leading-relaxed font-normal mb-3 italic line-clamp-3">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-2.5 border-t border-gray-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-950">{rev.name}</span>
                  <div className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500">{rev.location}</div>
                <div className="text-[10px] text-[#B45309] font-medium mt-0.5">
                  Consulted: {rev.reader}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
