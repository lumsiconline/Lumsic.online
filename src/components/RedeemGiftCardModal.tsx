import React, { useState } from 'react';
import { X, Gift, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface RedeemGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeemSuccess: (amount: number) => void;
  currentCurrency?: string;
}

export const RedeemGiftCardModal: React.FC<RedeemGiftCardModalProps> = ({
  isOpen,
  onClose,
  onRedeemSuccess,
  currentCurrency = 'USD'
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(10);

  if (!isOpen) return null;

  const symbol = currentCurrency === 'GBP' ? '£' : currentCurrency === 'EUR' ? '€' : currentCurrency === 'CAD' ? 'CA$' : currentCurrency === 'AUD' ? 'A$' : '$';

  const handleRedeem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;

    // Gift card codes must be validated by a real backend. No client-side codes are accepted.
    setError('Invalid or expired gift voucher code.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0D1536] border border-amber-400/30 rounded-3xl p-5 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-bold text-white flex items-center gap-2 text-base">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Redeem Gift Card</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-lg text-white">Gift Card Redeemed!</h4>
            <p className="text-xs text-slate-300">
              <span className="font-mono font-bold text-emerald-400 text-sm">+{symbol}{rewardAmount}</span> added directly to your available balance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="space-y-4 pt-4">
            <p className="text-xs text-slate-300">
              Enter your gift card voucher or promo code to claim bonus balance.
            </p>
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter Code"
                autoFocus
                className="w-full uppercase font-mono tracking-wider px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
              {error && <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 disabled:opacity-40 text-gray-950 font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              Apply Gift Card
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
