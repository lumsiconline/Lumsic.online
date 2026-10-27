import React, { useState } from 'react';
import { RitualSpell } from '../types';
import { X, Sparkles, CheckCircle2, Clock, ShieldCheck, Heart, ArrowLeft } from 'lucide-react';

interface RitualBookingModalProps {
  spell: RitualSpell | null;
  onClose: () => void;
  onSuccess: (bookingDetails: any) => void;
}

export const RitualBookingModal: React.FC<RitualBookingModalProps> = ({
  spell,
  onClose,
  onSuccess
}) => {
  const [clientName, setClientName] = useState('');
  const [targetName, setTargetName] = useState('');
  const [intention, setIntention] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!spell) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess({
          spellId: spell.id,
          spellName: spell.name,
          clientName,
          targetName,
          intention,
          price: spell.discountPrice
        });
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#140726] border border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50 max-h-[90vh] overflow-y-auto">
        
        {/* Top-Left Back Arrow button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 px-2.5 py-1.5 rounded-full bg-[#200f38] text-[#f5e7a9] hover:text-[#faf7f2] hover:bg-[#2e154f] border border-[#d4af37]/35 transition-all text-xs font-semibold flex items-center gap-1 active:scale-95 cursor-pointer shadow-md"
          title="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Back</span>
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#200f38] text-[#bda5db] hover:text-[#faf7f2] hover:bg-[#2e154f] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#faf7f2]">
              Ritual Commission Confirmed
            </h3>
            <p className="text-sm text-[#bda5db] max-w-md mx-auto leading-relaxed">
              Your intention for <strong className="text-[#d4af37]">{spell.name}</strong> has been received by <strong className="text-[#faf7f2]">{spell.practitionerName}</strong>. Planetary timing preparations have begun.
            </p>
            <div className="p-4 rounded-2xl bg-[#1e0d38] border border-[#2c184d] text-xs text-[#bda5db] space-y-1">
              <div>Estimated Altar Casting: <span className="text-[#faf7f2] font-semibold">{spell.castDuration}</span></div>
              <div>Photographic altar proof &amp; audio seal will be delivered to your account dashboard.</div>
            </div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2c184d]">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#d4af37]/40 shrink-0">
                <img src={spell.imageUrl} alt={spell.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d4af37]">Sacred Custom Ceremony</span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#faf7f2]">
                  {spell.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm line-through text-[#bda5db]/60">£{spell.originalPrice}</span>
                  <span className="text-lg font-bold text-[#d4af37]">£{spell.discountPrice}</span>
                  <span className="text-[11px] text-[#bda5db]">· Practitioner: {spell.practitionerName}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#bda5db] uppercase tracking-wider mb-1.5">
                  Your Full Name &amp; Date of Birth *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g., Sarah Jenkins (14 May 1992)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1d0b36] border border-[#2c184d] text-sm text-[#faf7f2] placeholder-[#bda5db]/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              {spell.category === 'love' && (
                <div>
                  <label className="block text-xs font-semibold text-[#bda5db] uppercase tracking-wider mb-1.5">
                    Target Lover’s Name &amp; Birth Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetName}
                    onChange={e => setTargetName(e.target.value)}
                    placeholder="e.g., James Miller (Optional: leave blank for general attraction)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1d0b36] border border-[#2c184d] text-sm text-[#faf7f2] placeholder-[#bda5db]/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#bda5db] uppercase tracking-wider mb-1.5">
                  Your Specific Intention or Prayer *
                </label>
                <textarea
                  required
                  rows={3}
                  value={intention}
                  onChange={e => setIntention(e.target.value)}
                  placeholder="Describe what you wish to manifest, resolve, or heal through this ceremony..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1d0b36] border border-[#2c184d] text-sm text-[#faf7f2] placeholder-[#bda5db]/40 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
                />
              </div>

              {/* Inclusions summary */}
              <div className="p-3.5 rounded-2xl bg-[#1b0a33] border border-[#2c184d] space-y-1.5">
                <div className="text-xs font-semibold text-[#f5e7a9] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Guaranteed Ceremony Deliverables:</span>
                </div>
                {spell.includes.map((item, i) => (
                  <div key={i} className="text-xs text-[#bda5db] flex items-center gap-1.5">
                    <span className="text-[#d4af37]">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[11px] text-[#bda5db] pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>100% Confidential</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Casting within {spell.castDuration}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5e7a9] to-[#d4af37] text-[#0b0514] font-bold text-sm shadow-xl shadow-[#d4af37]/25 hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Consecrating Altar Intent...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm &amp; Commission Ritual (£{spell.discountPrice})</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
