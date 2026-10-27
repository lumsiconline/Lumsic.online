import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock, Scale, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export const TermsAndConditionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'ethics' | 'refund'>('terms');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <section id="terms" className="py-16 sm:py-20 bg-[#070B1E] border-t border-b border-[#252A42]/80 relative text-[#faf7f2] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Sanctuary Compliance & Transparency</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Terms & Conditions & Privacy
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Our platform guarantees 100% confidential sessions, verified ethical astrological practices, transparent pricing, and rigorous client data protection.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {[
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy & Data Security', icon: Lock },
            { id: 'ethics', label: 'Ethical Astrological Code', icon: ShieldCheck },
            { id: 'refund', label: 'Satisfaction & Guarantees', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-gray-950 shadow-lg shadow-amber-400/20 font-bold'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-gray-950' : 'text-amber-300'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div className="bg-[#0C122C]/90 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {activeTab === 'terms' && (
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <FileText className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-white">Platform Terms of Service</h3>
              </div>
              <p>
                Welcome to LUMSIC. By accessing our website, creating birth charts, or engaging in live consultations with readers, psychic advisors, and spiritual guides, you acknowledge and agree to comply with the following terms:
              </p>
              <ul className="space-y-3 pl-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span><strong>Eligibility:</strong> You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to initiate paid consultations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span><strong>First Chat Free:</strong> Introductory consultation promotional minutes are granted exclusively to first-time seekers upon verified profile registration.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span><strong>Advisory Disclaimer:</strong> Astrological charts, planetary ephemeris readings, tarot cards, and intuitive sessions are intended for spiritual guidance, personal reflection, and entertainment purposes. They must never replace licensed medical, mental health, legal, or financial professional advice.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span><strong>Respectful Conduct:</strong> We uphold zero tolerance for harassment, hate speech, or abuse directed toward our spiritual readers and staff.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <Lock className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-white">Privacy Policy & Confidentiality</h3>
              </div>
              <p>
                Your sacred personal inquiries, birth chart credentials, and conversation logs are protected with end-to-end encryption and strict confidentiality standards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>256-Bit SSL Encryption</span>
                  </h4>
                  <p className="text-xs text-slate-400">All chat messages, birth dates, times, and birth coordinates are encrypted during transit and storage.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Zero Data Selling</span>
                  </h4>
                  <p className="text-xs text-slate-400">We never sell, rent, or monetize your personal identity or consultation records to any third-party advertisers.</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                You may request complete account deletion and data scrubbing at any time by contacting compliance through your profile dashboard.
              </p>
            </div>
          )}

          {activeTab === 'ethics' && (
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-white">Verified Reader Ethical Code</h3>
              </div>
              <p>
                Every practitioner featured on LUMSIC undergoes multi-stage screening, identity verification, and adheres to our global Code of Ethics:
              </p>
              <ul className="space-y-3 pl-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span><strong>No Fear-Mongering:</strong> Readers are strictly prohibited from inducing fear, predicting premature death, fabricating curses, or demanding extortionate fees for remedies.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span><strong>Free Will & Empowerment:</strong> Astrological charts illuminate tendencies and energetic weather; decisions always rest in the seeker’s sovereign free will.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span><strong>Absolute Confidentiality:</strong> Whatever is shared in a consultation room remains strictly confidential between you and your reader.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <CheckCircle2 className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-white">Satisfaction Guarantee & Wallet Policy</h3>
              </div>
              <p>
                We stand behind the authenticity and quality of every session. If you experience technical dropouts or an unsatisfactory reading:
              </p>
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm">
                <strong>100% Satisfaction Credit:</strong> If your session is interrupted by connectivity issues or fails to meet our quality standards within the first 3 minutes, our support team will credit your wallet balance instantly for a fresh consultation.
              </div>
            </div>
          )}
        </div>

        {/* Quick Legal Accordion */}
        <div className="mt-8 space-y-3">
          {[
            {
              q: 'How does LUMSIC verify readers and spiritual advisors?',
              a: 'All readers complete a 4-tier assessment covering astronomical ephemeris knowledge, predictive history, communicative compassion, and identity credential verification.'
            },
            {
              q: 'Can I delete my birth chart information?',
              a: 'Yes. You have full sovereignty over your data. In your Dashboard or upon request, all stored birth coordinates, names, and saved charts are erased permanently.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-amber-300 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {expandedFaq === idx && (
                <div className="px-6 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
