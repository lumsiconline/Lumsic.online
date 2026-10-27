import React, { useState } from 'react';
import { Sparkles, Eye, Waves, Heart, Moon, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const PsychicIntuitionSection: React.FC = () => {
  // Modal / interactive state for tests
  const [activeModal, setActiveModal] = useState<'psychicTest' | 'intuitionTest' | 'auraQuiz' | 'dream' | null>(null);

  // Psychic Test State
  const [psychicStep, setPsychicStep] = useState(0);
  const [psychicScore, setPsychicScore] = useState(0);
  const psychicQuestions = [
    { q: 'Have you ever had a strong gut feeling about someone that proved immediately accurate?', options: ['Frequently', 'Sometimes', 'Rarely'] },
    { q: 'Do you experience vivid dreams that seem to offer guidance or forewarning?', options: ['Regularly', 'Occasionally', 'Never'] },
    { q: 'Can you sense the energetic mood of a room immediately upon walking in?', options: ['Instantly', 'Somewhat', 'Not really'] },
    { q: 'Do you ever think of an acquaintance just moments before they call or message you?', options: ['All the time', 'Now and then', 'Coincidence'] },
  ];

  // Intuition ESP Card Guess Test
  const [espTarget, setEspTarget] = useState<string>('★');
  const [espScore, setEspScore] = useState({ correct: 0, total: 0 });
  const [espFeedback, setEspFeedback] = useState<string | null>(null);
  const espSymbols = ['★', '●', '▲', '◆', '✚'];

  const handleEspGuess = (guess: string) => {
    const randomSymbol = espSymbols[Math.floor(Math.random() * espSymbols.length)];
    const isCorrect = guess === randomSymbol;
    setEspTarget(randomSymbol);
    setEspScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    setEspFeedback(isCorrect ? `Insight hit! The symbol was ${randomSymbol}` : `Drawn symbol was ${randomSymbol}`);
  };

  // Aura Quiz State
  const [auraChoice, setAuraChoice] = useState<string | null>(null);

  return (
    <section id="psychic" className="py-20 bg-[#070A18] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Specification 12) */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#7C5CFF] block mb-2">
            Spiritual Perception & Inner Sensing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Discover Your Intuition
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            Explore the subtle sensory faculties of the human psyche through interactive quizzes, dream archetypes, and traditional energy awareness.
          </p>
        </div>

        {/* Five Interactive Cards (Specification 12) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Psychic Test */}
          <div 
            onClick={() => { setActiveModal('psychicTest'); setPsychicStep(0); setPsychicScore(0); }}
            className="cosmic-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-center mb-4 text-[#7C5CFF] group-hover:scale-105 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E7C878] transition-colors">
                Psychic Sensitivity Test
              </h3>
              <p className="text-sm text-[#A8ADC2] leading-relaxed mb-4">
                Evaluate your intuitive sensory processing, clairsentience, and inner perception across daily scenarios.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C5CFF]">
              <span>Take 4-Question Test →</span>
            </div>
          </div>

          {/* Card 2: Intuition Test (Real ESP symbol guessing) */}
          <div 
            onClick={() => setActiveModal('intuitionTest')}
            className="cosmic-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-center mb-4 text-[#E7C878] group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E7C878] transition-colors">
                Intuition & ESP Test
              </h3>
              <p className="text-sm text-[#A8ADC2] leading-relaxed mb-4">
                Test your second-sight resonance in real time by projecting and sensing hidden geometric Zener archetypes.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E7C878]">
              <span>Launch ESP Chamber →</span>
            </div>
          </div>

          {/* Card 3: Aura Quiz */}
          <div 
            onClick={() => setActiveModal('auraQuiz')}
            className="cosmic-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-105 transition-transform">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E7C878] transition-colors">
                Aura Resonance Quiz
              </h3>
              <p className="text-sm text-[#A8ADC2] leading-relaxed mb-4">
                Discover whether your subtle electromagnetic spectrum vibrates in Violet, Indigo, Gold, or Emerald frequencies.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span>Decode Aura Color →</span>
            </div>
          </div>

          {/* Card 4: Psychic Skills (The 6 Clairs) */}
          <div className="cosmic-card p-6 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-center mb-4 text-sky-400">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              The 6 Psychic Clairs
            </h3>
            <p className="text-sm text-[#A8ADC2] leading-relaxed mb-3">
              Explore the classical sensory channels: Clairvoyance (Sight), Clairaudience (Hearing), and Clairsentience (Feeling).
            </p>
            <div className="text-xs text-[#A8ADC2] space-y-1">
              <div>• <span className="text-white font-medium">Claircognizance</span>: Instant spontaneous inner knowing</div>
              <div>• <span className="text-white font-medium">Clairalience</span>: Scent impressions beyond physical origin</div>
            </div>
          </div>

          {/* Card 5: Dream Interpretation */}
          <div 
            onClick={() => setActiveModal('dream')}
            className="cosmic-card p-6 rounded-2xl flex flex-col justify-between group cursor-pointer md:col-span-2 lg:col-span-2"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center justify-center mb-4 text-[#7C5CFF] group-hover:scale-105 transition-transform">
                <Moon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E7C878] transition-colors">
                Dream Interpretation & Symbol Lexicon
              </h3>
              <p className="text-sm text-[#A8ADC2] leading-relaxed mb-4">
                Decode the archetypal language of your unconscious. Explore meanings behind universal motifs: water, flying, falling, celestial temples, and unknown doorways.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C5CFF]">
              <span>Look up Dream Symbols →</span>
            </div>
          </div>

        </div>

        {/* Ethical Disclaimer (Specification 12, 33) */}
        <div className="p-4 rounded-xl bg-[#0D1026] border border-[#252A42] flex items-center gap-3 text-xs text-[#A8ADC2]">
          <ShieldCheck className="w-5 h-5 text-[#7C5CFF] shrink-0" />
          <span>
            Intuitive and psychic traditions are presented as reflective spiritual, cultural, and meditative practices. They are not scientifically proven abilities and do not guarantee future predictions.
          </span>
        </div>

      </div>

      {/* Interactive Modals */}
      {activeModal === 'psychicTest' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cosmic-card rounded-2xl p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Psychic Sensitivity Evaluation</h3>
            {psychicStep < psychicQuestions.length ? (
              <div className="space-y-4">
                <p className="text-sm text-[#A8ADC2]">{psychicQuestions[psychicStep].q}</p>
                <div className="space-y-2">
                  {psychicQuestions[psychicStep].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setPsychicScore(prev => prev + (2 - i));
                        setPsychicStep(prev => prev + 1);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-[#070A18] hover:bg-[#1A2038] border border-[#252A42] text-xs text-white transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#E7C878] mx-auto" />
                <div className="text-lg font-bold text-white">Intuitive Resonance: {Math.round((psychicScore / 8) * 100)}%</div>
                <p className="text-xs text-[#A8ADC2]">
                  Your responses reflect strong empathetic awareness and natural clairsentient instincts. Cultivate daily quiet stillness to deepen your discernment.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intuition Test Modal */}
      {activeModal === 'intuitionTest' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cosmic-card rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4">
            <h3 className="text-xl font-bold text-white">ESP Symbol Projection</h3>
            <p className="text-xs text-[#A8ADC2]">Tune into the hidden card below and click which sacred symbol you sense:</p>
            
            <div className="w-24 h-32 rounded-xl bg-[#070A18] border-2 border-[#7C5CFF] mx-auto flex items-center justify-center text-4xl text-[#E7C878] shadow-inner">
              ?
            </div>

            <div className="flex justify-center gap-2 pt-2">
              {espSymbols.map((sym, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleEspGuess(sym)}
                  className="w-10 h-10 rounded-xl bg-[#11162B] border border-[#252A42] hover:border-[#E7C878] text-white text-lg font-bold transition-all"
                >
                  {sym}
                </button>
              ))}
            </div>

            {espFeedback && (
              <div className="text-xs text-[#E7C878] font-medium pt-2">
                {espFeedback}
              </div>
            )}

            <div className="text-xs text-[#A8ADC2]">
              Score: <span className="text-white font-bold">{espScore.correct}</span> / {espScore.total} attempts
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-6 py-2 rounded-xl bg-[#1A2038] text-white text-xs font-semibold"
            >
              Done Testing
            </button>
          </div>
        </div>
      )}

      {/* Aura Quiz Modal */}
      {activeModal === 'auraQuiz' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cosmic-card rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold text-white">Your Dominant Aura Field</h3>
            <p className="text-xs text-[#A8ADC2]">Select the state that best describes your natural resting sanctuary:</p>
            <div className="space-y-2">
              {[
                { color: 'Violet Spectrum', desc: 'Mystical vision, spiritual devotion and higher transcendence.' },
                { color: 'Indigo Spectrum', desc: 'Deep intuition, psychological clarity and truth-seeking.' },
                { color: 'Emerald Spectrum', desc: 'Holistic healing, heart-centered empathy and natural balance.' },
                { color: 'Golden Spectrum', desc: 'Creative vitality, radiant sovereignty and enlightened optimism.' },
              ].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAuraChoice(item.color)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${
                    auraChoice === item.color 
                      ? 'bg-[#7C5CFF]/20 border-[#7C5CFF] text-white' 
                      : 'bg-[#070A18] border-[#252A42] text-[#A8ADC2]'
                  }`}
                >
                  <div className="font-bold text-white mb-0.5">{item.color}</div>
                  <div>{item.desc}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold"
            >
              Confirm Aura Profile
            </button>
          </div>
        </div>
      )}

      {/* Dream Lookup Modal */}
      {activeModal === 'dream' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cosmic-card rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold text-white">Dream Symbol Archetypes</h3>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-[#070A18] border border-[#252A42] text-xs">
                <span className="font-bold text-[#E7C878] block">Water & Tides:</span>
                <span className="text-[#A8ADC2]">Represents the emotional subconscious. Calm ocean denotes inner peace; surging waves prompt processing repressed feelings.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070A18] border border-[#252A42] text-xs">
                <span className="font-bold text-[#7C5CFF] block">Flight & Soaring:</span>
                <span className="text-[#A8ADC2]">Liberation from limitation and gaining an expansive bird’s-eye perspective on personal hurdles.</span>
              </div>
              <div className="p-3 rounded-xl bg-[#070A18] border border-[#252A42] text-xs">
                <span className="font-bold text-emerald-400 block">Houses & Rooms:</span>
                <span className="text-[#A8ADC2]">The house represents the self. Discovering unknown secret rooms reveals dormant talents awaiting awakening.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#1A2038] text-white text-xs font-semibold"
            >
              Close Lexicon
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
