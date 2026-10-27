import React, { useState } from 'react';
import { Calculator, Sparkles, Hash } from 'lucide-react';

export const NumerologySection: React.FC = () => {
  const [birthdate, setBirthdate] = useState<string>('1994-08-18');
  const [fullName, setFullName] = useState<string>('Elena Vance');
  const [activeTab, setActiveTab] = useState<'lifepath' | 'destiny' | 'angels'>('lifepath');

  // Real Life Path Calculation (reduce digits to 1-9 or Master Numbers 11, 22, 33)
  const calculateLifePath = (dateStr: string) => {
    const digits = dateStr.replace(/\D/g, '').split('').map(Number);
    let sum = digits.reduce((acc, d) => acc + d, 0);

    const reduceNum = (num: number): number => {
      if (num === 11 || num === 22 || num === 33 || num < 10) return num;
      const nextSum = num.toString().split('').reduce((a, b) => a + Number(b), 0);
      return reduceNum(nextSum);
    };

    return reduceNum(sum);
  };

  // Pythagorean Letter to Number map
  const letterMap: Record<string, number> = {
    a: 1, j: 1, s: 1,
    b: 2, k: 2, t: 2,
    c: 3, l: 3, u: 3,
    d: 4, m: 4, v: 4,
    e: 5, n: 5, w: 5,
    f: 6, o: 6, x: 6,
    g: 7, p: 7, y: 7,
    h: 8, q: 8, z: 8,
    i: 9, r: 9
  };

  const calculateDestiny = (name: string) => {
    const cleaned = name.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;
    for (let char of cleaned) {
      sum += letterMap[char] || 0;
    }
    const reduceNum = (num: number): number => {
      if (num === 11 || num === 22 || num === 33 || num < 10) return num;
      const nextSum = num.toString().split('').reduce((a, b) => a + Number(b), 0);
      return reduceNum(nextSum);
    };
    return reduceNum(sum);
  };

  const lifePath = calculateLifePath(birthdate);
  const destiny = calculateDestiny(fullName);

  const lifePathMeanings: Record<number, { title: string; desc: string }> = {
    1: { title: 'The Pioneer', desc: 'Sovereign leadership, original initiative, and courageous independence.' },
    2: { title: 'The Diplomat', desc: 'Empathy, partnership grace, gentle balance, and harmonious mediation.' },
    3: { title: 'The Creative Communicator', desc: 'Artistic vitality, radiant self-expression, and optimistic joy.' },
    4: { title: 'The Architect', desc: 'Structural discipline, steadfast integrity, and enduring foundations.' },
    5: { title: 'The Catalyst', desc: 'Adaptability, visionary freedom, curiosity, and dynamic exploration.' },
    6: { title: 'The Guardian', desc: 'Compassionate service, domestic nurturance, and ethical responsibility.' },
    7: { title: 'The Seeker', desc: 'Deep philosophical inquiry, spiritual analysis, and quiet wisdom.' },
    8: { title: 'The Sovereign', desc: 'Material stewardship, executive mastery, and balanced abundance.' },
    9: { title: 'The Humanitarian', desc: 'Universal empathy, philanthropic wisdom, and global idealism.' },
    11: { title: 'Master 11 · The Illuminator', desc: 'High spiritual intuition, catalytic inspiration, and visionary illumination.' },
    22: { title: 'Master 22 · The Master Builder', desc: 'Manifesting grand humanitarian ideals into concrete structural reality.' },
    33: { title: 'Master 33 · The Master Teacher', desc: 'Universal compassion, profound healing presence, and selfless devotion.' }
  };

  const currentLP = lifePathMeanings[lifePath] || lifePathMeanings[7];

  return (
    <section id="numerology" className="py-20 bg-[#070A18] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Specification 15) */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#E7C878] block mb-2">
            Vibrational Mathematics
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Discover the Power of Numbers
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            Calculate your Life Path, Destiny, Expression and Angel Number synchronicity using authentic Pythagorean mathematics.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'lifepath', label: 'Life Path Number' },
            { id: 'destiny', label: 'Destiny & Expression' },
            { id: 'angels', label: 'Angel Numbers Directory' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id ? 'bg-[#7C5CFF] text-white shadow-md' : 'bg-[#11162B] border border-[#252A42] text-[#A8ADC2] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Life Path Number Calculator */}
        {activeTab === 'lifepath' && (
          <div className="max-w-3xl mx-auto cosmic-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#252A42] mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#070A18] border-2 border-[#7C5CFF] flex items-center justify-center text-4xl font-bold text-[#E7C878] shadow-inner shrink-0">
                {lifePath}
              </div>
              <div className="text-center sm:text-left flex-1">
                <span className="text-xs uppercase font-semibold text-[#7C5CFF]">Calculated Life Path</span>
                <h3 className="text-xl font-bold text-white mb-1">{currentLP.title}</h3>
                <p className="text-xs sm:text-sm text-[#A8ADC2] leading-relaxed">
                  {currentLP.desc}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs text-[#A8ADC2] font-semibold whitespace-nowrap">Enter Birth Date:</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="bg-[#070A18] border border-[#252A42] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                />
              </div>

              <span className="text-[11px] text-[#A8ADC2] font-mono">
                Method: Cross-sum reduction to single digit or Master Number
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Destiny & Expression Number */}
        {activeTab === 'destiny' && (
          <div className="max-w-3xl mx-auto cosmic-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#252A42]">
              <div className="w-20 h-20 rounded-2xl bg-[#070A18] border-2 border-[#E7C878] flex items-center justify-center text-4xl font-bold text-white shadow-inner shrink-0">
                {destiny}
              </div>
              <div className="text-center sm:text-left flex-1">
                <span className="text-xs uppercase font-semibold text-[#E7C878]">Destiny / Expression Number</span>
                <h3 className="text-xl font-bold text-white mb-1">Vibrational Blueprint of Your Name</h3>
                <p className="text-xs sm:text-sm text-[#A8ADC2] leading-relaxed">
                  Derived from the Pythagorean alphanumeric values of each letter in your full legal name, revealing lifelong inherent capabilities.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-[#A8ADC2] font-semibold whitespace-nowrap">Full Birth Name:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name..."
                className="w-full bg-[#070A18] border border-[#252A42] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Angel Numbers */}
        {activeTab === 'angels' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { num: '111', title: 'Intuitive Alignment', desc: 'Your conscious thoughts are manifesting rapidly. Direct focus toward authentic desires.' },
              { num: '222', title: 'Balance & Trust', desc: 'You are precisely where you need to be. Patient perseverance yields peaceful equilibrium.' },
              { num: '333', title: 'Creative Support', desc: 'Ascended masters and spiritual guides encourage sharing your unique creative voice.' },
              { num: '444', title: 'Grounded Protection', desc: 'Angelic protection surrounds your path. Foundations built now have profound structural longevity.' },
              { num: '555', title: 'Evolutionary Shift', desc: 'A major life change is unfolding. Embrace the transition with courageous curiosity.' },
              { num: '777', title: 'Spiritual Grace', desc: 'Luck, spiritual wisdom and deep alignment are active in your energetic sphere.' },
            ].map(angel => (
              <div key={angel.num} className="cosmic-card p-5 rounded-2xl space-y-2">
                <div className="text-2xl font-bold font-mono text-[#E7C878]">{angel.num}</div>
                <h4 className="text-sm font-bold text-white">{angel.title}</h4>
                <p className="text-xs text-[#A8ADC2] leading-relaxed">{angel.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
