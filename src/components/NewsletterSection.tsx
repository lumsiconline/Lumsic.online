import React, { useState } from 'react';
import { Mail, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <section className="py-20 bg-[#070A18] border-b border-[#252A42] text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="cosmic-card rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          
          <div className="w-12 h-12 rounded-2xl bg-[#0D1026] border border-[#7C5CFF]/30 flex items-center justify-center text-[#E7C878] mx-auto mb-5">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Weekly Cosmic Ephemeris
          </h2>

          <p className="text-sm text-[#A8ADC2] max-w-xl mx-auto leading-relaxed mb-8">
            Receive key planetary transits, lunar phase dates, and reflective self-discovery guidance delivered to your inbox every Sunday morning.
          </p>

          {subscribed ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-center gap-2 max-w-md mx-auto">
              <Check className="w-4 h-4" />
              <span>You are subscribed. Welcome to the LUMSIC sanctuary.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 bg-[#070A18] border border-[#252A42] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C5CFF] transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#7C5CFF] hover:bg-[#6A47FF] text-white text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#A8ADC2]/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C5CFF]" />
            <span>Privacy guaranteed. Unsubscribe anytime with one tap. Zero spam.</span>
          </div>

        </div>

      </div>
    </section>
  );
};
