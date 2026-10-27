import React, { useState } from 'react';
import { Eye, Sparkles, Check, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: {
    label: string;
    clair: 'Clairvoyance' | 'Clairaudience' | 'Clairsentience' | 'Claircognizance';
  }[];
}

const PSYCHIC_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'When entering an unfamiliar room or home, what do you notice first?',
    options: [
      { label: 'The visual lighting, symbols, or subtle flashes of movement in my periphery', clair: 'Clairvoyance' },
      { label: 'The emotional atmosphere, heaviness, or welcoming warmth in my body', clair: 'Clairsentience' },
      { label: 'A sudden unexplainable certainty about what has occurred there', clair: 'Claircognizance' },
      { label: 'Specific humming frequencies, tones, or ringing in my ears', clair: 'Clairaudience' }
    ]
  },
  {
    id: 2,
    question: 'How do intuitive insights most frequently arrive for you?',
    options: [
      { label: 'As spontaneous mental movies, dreams, or vivid symbolic imagery', clair: 'Clairvoyance' },
      { label: 'As physical gut reactions, goosebumps, or sudden chills', clair: 'Clairsentience' },
      { label: 'As instant knowledge drops where I "just know" without knowing how', clair: 'Claircognizance' },
      { label: 'As an inner whisper, melodic phrase, or internal advice spoken aloud', clair: 'Clairaudience' }
    ]
  },
  {
    id: 3,
    question: 'When meeting someone new, what validates your impression of their character?',
    options: [
      { label: 'Feeling their emotional state directly in my solar plexus or heart center', clair: 'Clairsentience' },
      { label: 'Seeing the quality of their aura, glow, or facial micro-expressions', clair: 'Clairvoyance' },
      { label: 'An instant download about their hidden motives or soul contract', clair: 'Claircognizance' },
      { label: 'The subtle resonance and truthfulness in their vocal tone', clair: 'Clairaudience' }
    ]
  }
];

export const PsychicTestSection: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ dominantClair: string; description: string; auraColor: string } | null>(null);

  const handleSelectOption = (clair: string) => {
    const nextAnswers = [...answers, clair];
    setAnswers(nextAnswers);

    if (currentStep + 1 < PSYCHIC_QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate dominant clair
      const counts: Record<string, number> = {};
      nextAnswers.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
      let topClair = 'Clairsentience';
      let maxCount = 0;
      Object.entries(counts).forEach(([k, v]) => {
        if (v > maxCount) {
          maxCount = v;
          topClair = k;
        }
      });

      const details: Record<string, { description: string; auraColor: string }> = {
        Clairvoyance: {
          description: 'Your third eye is naturally receptive. You perceive subtle astral lights, visionary dreams, and symbolic pictures before events materialize.',
          auraColor: 'Indigo / Violet'
        },
        Clairsentience: {
          description: 'You are a somatic empath. You feel energetic fields, emotional frequencies, and spiritual presence directly through visceral physical sensations.',
          auraColor: 'Emerald Green / Rose'
        },
        Claircognizance: {
          description: 'Your crown portal channels pure Akasha. Intuitive truth arrives as unlearned certainty and instantaneous conceptual downloads.',
          auraColor: 'Opalescent Gold / Crystal White'
        },
        Clairaudience: {
          description: 'Your spiritual hearing is fine-tuned. You perceive telepathic whispers, frequencies, and auditory divine guidance.',
          auraColor: 'Sapphire Blue / Silver'
        }
      };

      setResult({
        dominantClair: topClair,
        description: details[topClair]?.description || details.Clairsentience.description,
        auraColor: details[topClair]?.auraColor || 'Violet'
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <section id="psychic" className="py-12 sm:py-16 md:py-20 bg-[#0c0418] relative border-b border-[#2c184d]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2 font-mono">
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Extrasensory Perception &amp; Intuitive Resonance</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
            Psychic &amp; Intuition Test
          </h2>
          <p className="text-sm md:text-base text-[#bda5db] mt-2 max-w-xl mx-auto font-light">
            Discover which of the Six Clairs (Vision, Hearing, Feeling, or Knowing) is your soul’s primary extrasensory channel.
          </p>
        </div>

        {/* Interactive Quiz Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#140728] border border-[#2e1554] shadow-2xl relative overflow-hidden">
          
          {result ? (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#28104d] border border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.25)]">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] block mb-1">
                  Your Dominant Psychic Sense
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#faf7f2] font-semibold">
                  {result.dominantClair}
                </h3>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#270e47] border border-[#d4af37]/40 text-xs text-[#f5e7a9] font-mono">
                  Associated Auric Frequency: {result.auraColor}
                </span>
              </div>

              <p className="text-sm text-[#d8c7ed] max-w-lg mx-auto leading-relaxed">
                {result.description}
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-[#1b0a33] hover:bg-[#27104a] border border-[#3b1d6b] text-xs font-semibold text-[#bda5db] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Test</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-[#bda5db]/70 border-b border-[#2d144f] pb-3">
                <span>Question {currentStep + 1} of {PSYCHIC_QUESTIONS.length}</span>
                <span className="text-[#d4af37]">Intuition Calibration</span>
              </div>

              {/* Question Text */}
              <h3 className="font-serif text-xl sm:text-2xl text-[#faf7f2] font-medium leading-snug">
                {PSYCHIC_QUESTIONS[currentStep].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {PSYCHIC_QUESTIONS[currentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt.clair)}
                    className="w-full text-left p-4 rounded-2xl bg-[#1a0a33] hover:bg-[#28114d] border border-[#321756] hover:border-[#d4af37]/60 transition-all text-xs sm:text-sm text-[#e0d3f2] hover:text-[#faf7f2] flex items-center justify-between group cursor-pointer shadow-sm active:scale-98"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-4 h-4 text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
