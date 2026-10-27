import React from 'react';
import { ShieldCheck, Lock, Award, HeartHandshake } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-[#0b0514] border-t border-[#2c184d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#170a29] via-[#220f3d] to-[#170a29] border border-[#d4af37]/30 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                <ShieldCheck className="w-4 h-4" />
                <span>UK Consumer Standards &amp; Ethical Guarantee</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-[#faf7f2]">
                Our Reader Ethical Charter
              </h2>

              <p className="text-sm text-[#faf7f2]/80 font-light leading-relaxed max-w-2xl">
                Every reader on LUMSIC is bound by our strict British Code of Conduct. We guarantee authentic empathy, complete confidentiality, and zero reliance on synthetic automated software.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs text-[#faf7f2] block">Bank-Grade Privacy</span>
                    <span className="text-[11px] text-[#bda5db]">Transcripts and birth details are encrypted and never stored in third-party databases.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-xs text-[#faf7f2] block">Vetted Lineage</span>
                    <span className="text-[11px] text-[#bda5db]">Every reader has undergone identity verification and peer review before joining.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-center p-6 rounded-2xl bg-[#110720] border border-[#2c184d] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#241142] border border-[#d4af37] mx-auto flex items-center justify-center text-[#d4af37]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#faf7f2]">
                First Chat Free Guarantee
              </h3>
              <p className="text-xs text-[#bda5db]">
                Try any of our 20 specialists with your first chat with zero charge. If the connection does not resonate, you can conclude the consultation without paying a single penny.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
