import React, { useState } from 'react';
import { initiateRazorpayCheckout, RazorpayVerificationResult } from '../lib/razorpay';
import { CreditCard, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export interface RazorpayCheckoutButtonProps {
  amount: number; // e.g., 5, 15, 30, 50, 500
  currency?: string; // 'INR', 'USD', 'GBP', 'EUR'
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  showRazorpayBadge?: boolean;
  onSuccess?: (result: RazorpayVerificationResult) => void;
  onError?: (err: Error | string) => void;
  onCancel?: () => void;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amount,
  currency = 'USD',
  customerId,
  customerName = 'LUMSIC Seeker',
  customerEmail = 'seeker@lumsic.com',
  customerPhone = '+44 7700 900142',
  buttonText,
  className = '',
  disabled = false,
  showRazorpayBadge = true,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Convert amount to smallest currency unit (paise/cents): e.g., $15 = 1500 cents; ₹500 = 50000 paise
  // Minimum amount required is 100 paise / cents
  const amountInSmallestUnit = Math.max(100, Math.round(amount * 100));

  const handleCheckout = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await initiateRazorpayCheckout({
        amount: amountInSmallestUnit,
        currency,
        customerId,
        name: 'LUMSIC Spiritual Guidance',
        description: `Wallet Recharge of ${currency} ${amount.toFixed(2)}`,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        isPaise: true,
        onSuccess: (result) => {
          setIsLoading(false);
          setSuccessMessage(result.message || 'Payment successfully verified!');
          if (onSuccess) {
            onSuccess(result);
          }
        },
        onError: (err) => {
          setIsLoading(false);
          const msg = typeof err === 'string' ? err : err.message || 'Payment failed';
          setErrorMessage(msg);
          if (onError) {
            onError(err);
          }
        },
        onCancel: () => {
          setIsLoading(false);
          setErrorMessage('Payment cancelled by user.');
          if (onCancel) {
            onCancel();
          }
        }
      });
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Unable to open Razorpay checkout modal';
      setErrorMessage(msg);
      if (onError) onError(err);
    }
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr.toUpperCase()) {
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'INR': return '₹';
      case 'USD':
      default: return '$';
    }
  };

  const symbol = getCurrencySymbol(currency);
  const defaultText = `Pay with Razorpay (${symbol}${amount.toFixed(2)})`;

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className={className || `w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#0C2340] via-[#0D3B66] to-[#002855] hover:brightness-110 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-blue-950/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-blue-300" />
            <span>Opening Razorpay Checkout...</span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center p-1 border border-white/20">
              <CreditCard className="w-3.5 h-3.5 text-blue-300" />
            </div>
            <span>{buttonText || defaultText}</span>
            {showRazorpayBadge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 ml-auto">
                Razorpay
              </span>
            )}
          </>
        )}
      </button>

      {/* Trust & Security Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>100% Secure Checkout powered by Razorpay (PCI-DSS Level 1)</span>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Checkout Notice:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Success Feedback */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Payment Confirmed:</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
