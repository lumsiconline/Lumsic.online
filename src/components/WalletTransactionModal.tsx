import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, Menu, Search, Wallet, Sparkles, Plus, 
  ChevronDown, ChevronUp, Clock, Gift, CheckCircle2, RefreshCw, Copy, Check, MessageSquare,
  Share2, Users, AlertCircle, ShieldCheck
} from 'lucide-react';
import { formatCurrencyAmount, getCurrencySymbol, MINIMUM_RECHARGE_AMOUNT, getMinRechargeAmount } from '../utils/currency';
import { Reader, WalletTransaction, ReferralData } from '../types';
import { initiatePayUPayment, redirectToPayUHostedCheckout, verifyPayUPayment, openPayUTestModal } from '../lib/payu';
import { RazorpayCheckoutButton } from './RazorpayCheckoutButton';

interface ExpiringItem {
  id: string;
  title: string;
  amount: number;
  expiryDate: string;
  daysRemaining: number;
}

interface WalletTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  currentCurrency?: string;
  availableBalance: number;
  rechargeBalance: number;
  cashbackBalance: number;
  onRechargeSuccess: (addedRecharge: number, addedCashback: number) => void;
  initialTab?: 'wallet' | 'referral' | 'order' | 'remedies';
  readers?: Reader[];
  onStartChatWithReader?: (reader: Reader) => void;
  onOpenRemediesModal?: () => void;
  onOpenDrawer?: () => void;
}

export const WalletTransactionModal: React.FC<WalletTransactionModalProps> = ({
  isOpen,
  onClose,
  customerId,
  currentCurrency = 'USD',
  availableBalance = 0,
  rechargeBalance = 0,
  cashbackBalance = 0,
  onRechargeSuccess,
  initialTab = 'wallet',
  readers = [],
  onStartChatWithReader,
  onOpenRemediesModal,
  onOpenDrawer
}) => {
  // Top 4 Tabs: 'wallet' | 'referral' | 'order' | 'remedies'
  const [topTab, setTopTab] = useState<'wallet' | 'referral' | 'order' | 'remedies'>(initialTab);

  // Sync with initialTab prop when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setTopTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Balance breakdown expandable state
  const [showBreakdown, setShowBreakdown] = useState(false);

  // 3 Sub-filters under Wallet: 'transaction' | 'payment_logs' | 'expiring'
  const [walletSubFilter, setWalletSubFilter] = useState<'transaction' | 'payment_logs' | 'expiring'>('transaction');

  // Sub-filters under Remedies: 'all' | 'suggested' | 'purchased'
  const [remediesFilter, setRemediesFilter] = useState<'all' | 'suggested' | 'purchased'>('all');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Recharge Modal state
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number>(10);
  const [customAmountInput, setCustomAmountInput] = useState<string>('10');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [rechargeSuccessNotice, setRechargeSuccessNotice] = useState<string | null>(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'razorpay' | 'payu'>('razorpay');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedRefLink, setCopiedRefLink] = useState(false);
  const [claimRewardLoading, setClaimRewardLoading] = useState(false);
  const [claimRewardNotice, setClaimRewardNotice] = useState<string | null>(null);

  // Account bonus status from backend
  const [isFirstRechargeEligible, setIsFirstRechargeEligible] = useState<boolean>(true);

  // Backend transactions list
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Referral system state
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: 'LUM-SEEKER',
    referralLink: typeof window !== 'undefined' ? `${window.location.origin}/?ref=LUM-SEEKER` : '',
    totalReferrals: 0,
    successfulRecharges: 0,
    freeChatRewardsAvailable: 0,
    friends: []
  });

  // Effective Customer ID
  const effectiveCustomerId = customerId || (typeof window !== 'undefined' ? (localStorage.getItem('astral_customer_id') || 'cust_guest') : 'cust_guest');
  const currencySymbol = getCurrencySymbol(currentCurrency);

  // Fetch real verified wallet and referral data from backend
  const fetchWalletAndReferralData = async () => {
    try {
      // 1. Fetch wallet info
      const res = await fetch(`/api/wallet/info/${effectiveCustomerId}?currency=${currentCurrency}`);
      if (res.ok) {
        const data = await res.json();
        if (data.wallet) {
          setIsFirstRechargeEligible(!data.wallet.firstRechargeCompleted && !data.wallet.hasClaimedFirstRechargeBonus);
          if (Array.isArray(data.wallet.transactions)) {
            setTransactions(data.wallet.transactions);
          }
        }
      }

      // 2. Fetch referral info
      const refRes = await fetch(`/api/referral/${effectiveCustomerId}`);
      if (refRes.ok) {
        const refData = await refRes.json();
        if (refData.success) {
          setReferralData({
            referralCode: refData.referralCode,
            referralLink: refData.referralLink || `${window.location.origin}/?ref=${refData.referralCode}`,
            totalReferrals: refData.totalReferrals || 0,
            successfulRecharges: refData.successfulRecharges || 0,
            freeChatRewardsAvailable: refData.freeChatRewardsAvailable || 0,
            friends: refData.friends || []
          });
        }
      }
    } catch (err) {
      console.warn('Could not sync wallet/referral from backend:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWalletAndReferralData();
    }
  }, [isOpen, effectiveCustomerId, currentCurrency]);

  // Auto-align default selected pack if currency changes or pack is below minimum
  useEffect(() => {
    if (currentCurrency === 'INR' && selectedPack < 50) {
      setSelectedPack(100);
      setCustomAmountInput('100');
    }
  }, [currentCurrency, selectedPack]);

  // Check URL parameters on mount for PayU return redirect (e.g. ?payment=success&txnid=... or ?payment=failed)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const txnid = urlParams.get('txnid');
      const creditedAmt = parseFloat(urlParams.get('amount') || '0');
      const bonusAmt = parseFloat(urlParams.get('bonus') || '0');

      if (paymentStatus === 'success' && txnid) {
        onRechargeSuccess(creditedAmt, bonusAmt);
        fetchWalletAndReferralData();
        setRechargeSuccessNotice(
          `PayU payment verified! Successfully added ${currencySymbol}${creditedAmt.toFixed(2)}${bonusAmt > 0 ? ` + ${currencySymbol}${bonusAmt.toFixed(2)} Bonus` : ''} to your balance.`
        );
        setTimeout(() => setRechargeSuccessNotice(null), 7000);
      } else if (paymentStatus === 'failed') {
        const errorReason = urlParams.get('error') || urlParams.get('reason') || 'PayU transaction was not completed.';
        setRechargeError(decodeURIComponent(errorReason));
      }

      if (paymentStatus || txnid) {
        urlParams.delete('payment');
        urlParams.delete('txnid');
        urlParams.delete('amount');
        urlParams.delete('bonus');
        urlParams.delete('reason');
        urlParams.delete('error');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    } catch (err) {
      console.warn('PayU URL redirect check error:', err);
    }
  }, [effectiveCustomerId, currentCurrency, currencySymbol, onRechargeSuccess]);

  // Dynamic minimum recharge amount based on currency
  const effectiveMinRecharge = getMinRechargeAmount(currentCurrency);

  // Recharge Pack options in user's local currency (INR vs international currencies)
  const rechargePacks = currentCurrency === 'INR' ? [
    { amt: 50, tag: 'Minimum' },
    { amt: 100, tag: 'Popular' },
    { amt: 250, tag: 'Best Value' },
    { amt: 500, tag: 'Spiritual Guide' },
    { amt: 1000, tag: 'Maximum Match' },
  ] : [
    { amt: 5, tag: 'Minimum' },
    { amt: 10, tag: 'Popular' },
    { amt: 25, tag: 'Best Value' },
    { amt: 50, tag: 'Spiritual Guide' },
    { amt: 100, tag: 'Maximum Match' },
  ];

  // Expiring credits list
  const expiringList: ExpiringItem[] = isFirstRechargeEligible ? [
    {
      id: 'exp_1',
      title: '100% First Recharge Extra Cash Bonus (Pending First Recharge)',
      amount: selectedPack,
      expiryDate: 'Available for first recharge',
      daysRemaining: 14
    }
  ] : [];

  if (!isOpen) return null;

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard?.writeText(referralData.referralLink);
    setCopiedRefLink(true);
    setTimeout(() => setCopiedRefLink(false), 2500);
  };

  const currentRechargeAmount = isCustomMode ? (parseFloat(customAmountInput) || 0) : selectedPack;
  const isBelowMinimum = currentRechargeAmount < effectiveMinRecharge;

  // Execute Real Verified Recharge through PayU Hosted Checkout (Test/Production)
  const handleExecuteRecharge = async () => {
    setRechargeError(null);

    // Frontend validation: minimum requirement enforced
    if (currentRechargeAmount < effectiveMinRecharge) {
      setRechargeError(`Minimum recharge requirement is ${currencySymbol}${effectiveMinRecharge}.00 ${currentCurrency}. Amounts below this are not accepted.`);
      return;
    }

    setIsRecharging(true);
    try {
      // 1. Initiate PayU session on server (where SHA-512 hash is generated using PAYU_SALT)
      const payuSession = await initiatePayUPayment({
        customerId: effectiveCustomerId,
        customerName: 'LUMSIC Valued Seeker',
        customerEmail: 'seeker@lumsic.com',
        amount: currentRechargeAmount,
        currency: currentCurrency,
        isFirstRecharge: isFirstRechargeEligible
      });

      if (!payuSession || !payuSession.success) {
        throw new Error(payuSession?.error || 'Failed to initialize PayU payment session.');
      }

      // Check if running inside iframe (e.g. AI Studio preview environment)
      const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

      if (isInsideIframe && payuSession.mode === 'test') {
        // Render PayU interactive test dialog (allows direct POST redirect or test hash verification simulation)
        openPayUTestModal({
          actionUrl: payuSession.actionUrl,
          params: payuSession.params as any,
          currencySymbol,
          onSuccess: async (txnid) => {
            try {
              const verifyData = await verifyPayUPayment({
                txnid,
                customerId: effectiveCustomerId
              });

              if (verifyData && verifyData.success) {
                onRechargeSuccess(verifyData.creditedAmount || currentRechargeAmount, verifyData.bonusAmount || 0);
                await fetchWalletAndReferralData();
                setIsRechargeModalOpen(false);
                setRechargeSuccessNotice(
                  verifyData.message || `PayU payment verified! Added ${currencySymbol}${currentRechargeAmount.toFixed(2)} to your balance.`
                );
                setTimeout(() => setRechargeSuccessNotice(null), 6000);
              } else {
                setRechargeError(verifyData.error || 'Payment verification failed with PayU.');
              }
            } catch (vErr: any) {
              setRechargeError(vErr.message || 'Error confirming PayU transaction.');
            } finally {
              setIsRecharging(false);
            }
          },
          onCancel: () => {
            setIsRecharging(false);
            setRechargeError('PayU payment cancelled.');
          }
        });
      } else {
        // Standard top-level redirect to PayU Hosted Checkout (test.payu.in / secure.payu.in)
        redirectToPayUHostedCheckout(payuSession.actionUrl, payuSession.params as any);
      }
    } catch (err: any) {
      const rawMsg = String(err?.message || '');
      if (rawMsg.toLowerCase().includes('cancel') || rawMsg.toLowerCase().includes('abort')) {
        setRechargeError('Payment window closed. You can complete your recharge whenever you are ready.');
      } else {
        setRechargeError(rawMsg || 'Payment processing error with PayU. Please try again.');
      }
      setIsRecharging(false);
    }
  };

  // Claim Referral Free Chat Reward
  const handleClaimFreeChat = async () => {
    if (referralData.freeChatRewardsAvailable <= 0) return;
    setClaimRewardLoading(true);
    try {
      const res = await fetch('/api/referral/claim-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: effectiveCustomerId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimRewardNotice(data.message);
        await fetchWalletAndReferralData();
        setTimeout(() => setClaimRewardNotice(null), 4000);
      } else {
        alert(data.error || 'Unable to claim reward.');
      }
    } catch (e: any) {
      alert(e.message || 'Error claiming reward.');
    } finally {
      setClaimRewardLoading(false);
    }
  };

  // Featured Master Psychic for immediate connect
  const featuredPsychic = readers.find(r => r.name.toLowerCase().includes('master')) || readers[0] || {
    id: 'reader-featured',
    name: 'Master Psychic',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    status: 'online',
    skills: ['Psychic', 'Tarot', 'Love Reading'],
    rating: 4.98,
    reviewsCount: 3840,
    ratePerMinute: 1.00,
    bio: 'I never charge for the first reading. If you feel connected, we continue together.',
    tagline: 'Deep clairvoyant channeled insight'
  };

  const filteredOrders = readers.filter(r => 
    !searchQuery || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.specialties || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Main Container */}
      <div className="w-full max-w-lg bg-[#F8FAFC] sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[700px] max-h-screen text-gray-900 overflow-hidden border border-purple-900/30">
        
        {/* ================= 1. ROYAL PURPLE HEADER ================= */}
        <header className="bg-gradient-to-r from-[#240C48] via-[#3B0764] to-[#240C48] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            {onOpenDrawer ? (
              <button
                type="button"
                onClick={onOpenDrawer}
                className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-bold text-white tracking-wide font-sans">
              Wallet &amp; Orders
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Search orders"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Optional Search Bar Input */}
        {isSearchVisible && (
          <div className="px-4 py-2 bg-[#2D0D55] text-white border-b border-purple-900 flex items-center gap-2 animate-in slide-in-from-top-1">
            <Search className="w-3.5 h-3.5 text-purple-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history, psychics or remedies..."
              className="w-full bg-transparent text-xs text-white placeholder-purple-300/60 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-purple-300 text-xs">✕</button>
            )}
          </div>
        )}

        {/* ================= 2. TOP TABS: WALLET | REFERRAL | ORDER | REMEDIES ================= */}
        <div className="grid grid-cols-4 bg-white border-b border-gray-200 shrink-0 text-xs sm:text-sm font-bold shadow-xs">
          {[
            { id: 'wallet', label: 'Wallet' },
            { id: 'referral', label: 'Referral' },
            { id: 'order', label: 'Orders' },
            { id: 'remedies', label: 'Remedies' }
          ].map((tab) => {
            const isActive = topTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTopTab(tab.id as any)}
                className={`py-3 text-center font-bold transition-all cursor-pointer border-b-2 truncate px-1 ${
                  isActive
                    ? 'border-[#581C87] text-[#581C87] font-extrabold bg-purple-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Recharge Success Toast */}
        {rechargeSuccessNotice && (
          <div className="bg-[#0B1030] text-amber-300 border-b border-amber-400/40 px-4 py-2.5 text-xs flex items-center justify-between font-semibold animate-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F5C542] shrink-0" />
              <span className="text-white">{rechargeSuccessNotice}</span>
            </span>
            <button onClick={() => setRechargeSuccessNotice(null)} className="ml-2 font-bold text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* ================= 3. TAB 1: WALLET ================= */}
        {topTab === 'wallet' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
            {/* AVAILABLE BALANCE & RECHARGE ROW */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">
                    Available Balance ({currentCurrency})
                  </span>
                  <div className="text-3xl font-extrabold text-gray-900 font-mono tracking-tight mt-1">
                    {formatCurrencyAmount(availableBalance, currentCurrency)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRechargeModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#581C87] hover:bg-[#4C1D95] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Recharge</span>
                </button>
              </div>

              {/* View Balance Breakdown Expandable Pill */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between text-xs text-gray-600 font-medium hover:text-gray-900 transition-colors cursor-pointer py-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border border-gray-400 rounded-sm flex items-center justify-center text-[9px] font-bold">
                      ℹ
                    </span>
                    <span>View Balance Breakdown</span>
                  </span>
                  {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expandable Breakdown Details */}
                {showBreakdown && (
                  <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Purchased Funds:</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrencyAmount(rechargeBalance, currentCurrency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Promotional Bonus Funds:</span>
                      <span className="font-mono font-bold text-emerald-600">{formatCurrencyAmount(cashbackBalance, currentCurrency)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-bold text-gray-900">
                      <span>Total Usable Credit:</span>
                      <span className="font-mono">{formatCurrencyAmount(availableBalance, currentCurrency)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PROMINENT 100% FIRST RECHARGE OFFER BANNER (Requirement 3) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isFirstRechargeEligible 
                ? 'bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-amber-400/40 shadow-xs' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-gray-950 tracking-tight">
                      {isFirstRechargeEligible 
                        ? 'Get 100% Extra Cash on Your First Recharge!' 
                        : '100% First Recharge Bonus Claimed!'}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pl-8">
                    {isFirstRechargeEligible
                      ? `Recharge your wallet today and receive an immediate 100% bonus matching credit in ${currentCurrency}. E.g. recharge ${currencySymbol}10 and receive ${currencySymbol}10 in bonus credit, giving you ${currencySymbol}20 in total credit!`
                      : `You have successfully unlocked your 100% bonus matching cash. Promotional credits are active in your usable wallet balance.`}
                  </p>
                </div>
                {isFirstRechargeEligible && (
                  <button
                    type="button"
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-black text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Claim 100%
                  </button>
                )}
              </div>
            </div>

            {/* REFERRAL REWARD TEASER CARD (Requirement 4) */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Gift className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>Refer a friend! Receive a free chat reward</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">
                  When your friend signs up using your link and completes their first recharge, you get 1 free chat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTopTab('referral')}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-[#581C87] text-white text-xs font-bold hover:bg-[#4C1D95] transition-all cursor-pointer"
              >
                View
              </button>
            </div>

            {/* THREE SUB-FILTER PILLS: [ Transactions ] [ Payment Logs ] [ Expiring ] */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {[
                  { id: 'transaction', label: 'Transactions' },
                  { id: 'payment_logs', label: 'Payment Logs' },
                  { id: 'expiring', label: 'Expiring' }
                ].map((item) => {
                  const isActive = walletSubFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWalletSubFilter(item.id as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#581C87] text-white shadow-xs font-bold'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* 1. Transactions List - Colors strictly implemented (Requirement 1) */}
              {walletSubFilter === 'transaction' && (
                <div className="space-y-2.5">
                  {transactions.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl bg-white border border-gray-200/80">
                      <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <h4 className="font-bold text-gray-900 text-sm mb-1">No Transactions Recorded</h4>
                      <p className="text-xs text-gray-400">Your verified recharges and consultation deductions will appear here.</p>
                    </div>
                  ) : (
                    transactions.map((tx) => {
                      const isCredit = tx.type === 'credit';
                      return (
                        <div
                          key={tx.id}
                          className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-xs sm:text-sm">
                                {tx.title}
                              </p>
                              {/* Status Badge */}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCredit 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {tx.status || (isCredit ? 'Completed' : 'Debited')}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500">
                              {tx.subtitle || (isCredit ? 'Credit Transaction' : 'Usage Debit')}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(tx.date).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                              <span>{tx.orderId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyOrderId(tx.orderId)}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                title="Copy Order ID"
                              >
                                {copiedId === tx.orderId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Transaction Amount Color: Green for Credits, Red for Debits (Requirement 1) */}
                          <div className="text-right shrink-0">
                            <span className={`font-mono font-extrabold text-sm sm:text-base ${
                              isCredit ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {isCredit ? '+' : '-'}{formatCurrencyAmount(tx.amount, tx.currency || currentCurrency)}
                            </span>
                            {(tx.rechargePart !== undefined || tx.bonusPart !== undefined) && (
                              <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1 font-mono">
                                <span>P: {formatCurrencyAmount(tx.rechargePart || 0, tx.currency || currentCurrency)}</span>
                                <span>•</span>
                                <span>B: {formatCurrencyAmount(tx.bonusPart || 0, tx.currency || currentCurrency)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 2. Payment Logs List */}
              {walletSubFilter === 'payment_logs' && (
                <div className="space-y-2.5">
                  {transactions.filter(t => t.type === 'credit').length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl bg-white border border-gray-200/80">
                      <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <h4 className="font-bold text-gray-900 text-sm mb-1">No Payment Logs</h4>
                      <p className="text-xs text-gray-400">Verified recharge logs will appear here upon completion.</p>
                    </div>
                  ) : (
                    transactions.filter(t => t.type === 'credit').map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-white border border-gray-200/90 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900">{log.orderId}</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              {log.status || 'Verified'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {log.paymentMethod || 'Instant Card'} • {new Date(log.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right font-mono font-bold text-sm text-emerald-600">
                          +{formatCurrencyAmount(log.amount, log.currency || currentCurrency)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 3. Expiring List */}
              {walletSubFilter === 'expiring' && (
                <div className="space-y-2.5">
                  {expiringList.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl bg-white border border-gray-200/80">
                      <Gift className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <h4 className="font-bold text-gray-900 text-sm mb-1">No Expiring Credits</h4>
                      <p className="text-xs text-gray-400">All your active purchased wallet funds have lifetime validity.</p>
                    </div>
                  ) : (
                    expiringList.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white border border-amber-200/70 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Gift className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.title}</p>
                            <p className="text-[11px] text-amber-700 font-medium">
                              Expires in {item.daysRemaining} days ({item.expiryDate})
                            </p>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-amber-700 text-sm">
                          {formatCurrencyAmount(item.amount, currentCurrency)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 4. TAB 2: REFERRAL (Requirement 4) ================= */}
        {topTab === 'referral' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
            {/* Main Referral Banner */}
            <div className="bg-gradient-to-r from-[#240C48] via-[#3B0764] to-[#240C48] text-white p-5 rounded-2xl shadow-md space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Gift className="w-4 h-4" />
                <span>Referral Reward Program</span>
              </div>
              <h3 className="text-base font-extrabold text-white leading-snug">
                Refer a friend! When your friend signs up using your referral link and completes their first successful wallet recharge, you'll receive a free chat reward.
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed pt-1">
                Share the cosmic wisdom of LUMSIC with friends and loved ones. Both you and your friend unlock divine guidance!
              </p>
            </div>

            {/* Unique Referral Code & Share Link Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Your Unique Referral Code &amp; Link
              </span>

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200 font-mono text-sm font-extrabold text-[#581C87]">
                <span>{referralData.referralCode}</span>
                <span className="text-[10px] text-purple-700 uppercase font-sans font-bold bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  Active
                </span>
              </div>

              {/* Shareable Link Input with Copy Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralData.referralLink}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-600 outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyReferralLink}
                  className="px-4 py-2 rounded-xl bg-[#581C87] hover:bg-[#4C1D95] text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedRefLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Progress and Reward Availability Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Referral Progress &amp; Reward Availability
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <span className="block text-xl font-mono font-extrabold text-gray-900">
                    {referralData.totalReferrals}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">Friends Joined</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <span className="block text-xl font-mono font-extrabold text-gray-900">
                    {referralData.successfulRecharges}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">First Recharges</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="block text-xl font-mono font-extrabold text-purple-700">
                    {referralData.freeChatRewardsAvailable}
                  </span>
                  <span className="text-[11px] text-purple-700 font-bold">Free Chats</span>
                </div>
              </div>

              {/* Claim Reward Button */}
              {claimRewardNotice && (
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{claimRewardNotice}</span>
                </div>
              )}

              {referralData.freeChatRewardsAvailable > 0 ? (
                <button
                  type="button"
                  onClick={handleClaimFreeChat}
                  disabled={claimRewardLoading}
                  className="w-full py-2.5 rounded-xl bg-[#8DB8A3] hover:bg-[#8DB8A3]/90 text-[#3F7A63] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-[#3F7A63]/30"
                >
                  <MessageSquare className="w-4 h-4 text-[#3F7A63]" />
                  <span className="text-[#3F7A63]">
                    {claimRewardLoading ? 'Unlocking...' : `Use 1 Free Chat Reward (${referralData.freeChatRewardsAvailable} Available)`}
                  </span>
                </button>
              ) : (
                <p className="text-[11px] text-gray-500 text-center italic py-1">
                  Once your referred friend completes their first verified recharge of {currencySymbol}{MINIMUM_RECHARGE_AMOUNT}+, 1 free chat is instantly credited here.
                </p>
              )}
            </div>

            {/* Referred Friends History */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block px-1">
                Referred Friends Ledger
              </span>

              {referralData.friends.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-2xl bg-white border border-gray-200/80">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">No friends referred yet.</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Share your link to start unlocking free consultation chats!</p>
                </div>
              ) : (
                referralData.friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{friend.name}</p>
                      <p className="text-[11px] text-gray-400">{new Date(friend.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {friend.hasRecharged ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Recharge Verified • Reward Earned</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Pending First Recharge
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= 5. TAB 3: ORDER ================= */}
        {topTab === 'order' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {/* Primary Consultation Order */}
            <div 
              onClick={() => {
                if (onStartChatWithReader) onStartChatWithReader(featuredPsychic as any);
              }}
              className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#2E1065] via-[#4C1D95] to-[#7C3AED] p-0.5 flex items-center justify-center shadow-sm">
                    <div className="w-full h-full rounded-full bg-[#180A38] flex items-center justify-center overflow-hidden">
                      <span className="text-xl text-purple-200 select-none">🔮</span>
                    </div>
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-gray-950 text-sm tracking-tight group-hover:text-[#581C87] transition-colors">
                    {featuredPsychic.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5 max-w-[230px] sm:max-w-xs font-normal">
                    {featuredPsychic.bio || 'I never charge for the first reading. If you feel connected, we continue.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-gray-400 font-medium">Live</span>
                <div className="mt-1 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#581C87] bg-purple-50 px-2 py-0.5 rounded-full">
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </span>
                </div>
              </div>
            </div>

            {/* List other psychics */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Available Psychics to Connect
                </span>
                <span className="text-xs text-[#581C87] font-semibold">Live Online</span>
              </div>
              <div className="space-y-2">
                {filteredOrders.slice(0, 4).map((reader) => (
                  <div
                    key={reader.id}
                    onClick={() => {
                      if (onStartChatWithReader) onStartChatWithReader(reader);
                    }}
                    className="bg-white rounded-xl p-3 border border-gray-200/70 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={reader.avatar} 
                          alt={reader.name} 
                          className="w-10 h-10 rounded-full object-cover border border-purple-200"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-950 truncate">{reader.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{(reader.specialties || reader.methods || []).slice(0, 2).join(' • ')}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full bg-[#581C87] hover:bg-[#4C1D95] text-white text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Consult Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. TAB 4: REMEDIES ================= */}
        {topTab === 'remedies' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between bg-[#F8FAFC]">
            <div>
              <div className="flex items-center gap-2 mb-6">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'suggested', label: 'Suggested' },
                  { id: 'purchased', label: 'Purchased' }
                ].map((item) => {
                  const isActive = remediesFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRemediesFilter(item.id as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#581C87] text-white shadow-xs font-bold'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Center Empty State */}
              <div className="py-12 sm:py-16 text-center max-w-sm mx-auto">
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                  <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <circle cx="9" cy="9.5" r="0.8" fill="currentColor" />
                    <circle cx="13" cy="9.5" r="0.8" fill="currentColor" />
                    <path d="M9 13.5c.8-.7 2.2-.7 3 0" />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Uh-oh!
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
                  You have not booked any consecrated remedy in Astromall yet!
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRemediesModal) onOpenRemediesModal();
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#581C87] hover:bg-[#4C1D95] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Explore Astromall &amp; Sacred Remedies
                </button>
              </div>
            </div>

            <div className="text-center pb-2 text-[11px] text-gray-400">
              Prescribed gemstone talismans &amp; celestial spells will appear here.
            </div>
          </div>
        )}

        {/* ================= 7. RECHARGE MODAL DIALOG (Requirements 2, 3, 5) ================= */}
        {isRechargeModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xl max-w-sm mx-auto w-full animate-in zoom-in-95 duration-150 my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#581C87]" />
                  <span>Instant Wallet Recharge</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRechargeModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 100% First Recharge Bonus Callout in Recharge Window */}
              {isFirstRechargeEligible && (
                <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-amber-500/15 border border-amber-400/50">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Get 100% Extra Cash on Your First Recharge!</span>
                  </div>
                  <p className="text-[11px] text-gray-700 mt-1 leading-snug">
                    Recharge {currencySymbol}{currentRechargeAmount.toFixed(2)} and receive an extra 100% match credit of {currencySymbol}{currentRechargeAmount.toFixed(2)} — total wallet balance: <span className="font-extrabold text-purple-900">{currencySymbol}{(currentRechargeAmount * 2).toFixed(2)}</span>!
                  </p>
                </div>
              )}

              {/* Minimum Requirement Notice */}
              <div className="text-xs text-gray-500 my-2 flex items-center justify-between">
                <span>Select recharge pack or enter amount:</span>
                <span className="font-bold text-[#581C87] text-[11px]">
                  Min: {currencySymbol}{effectiveMinRecharge}.00 {currentCurrency}
                </span>
              </div>

              {/* Recharge Packs */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {rechargePacks.map((pack) => {
                  const isSelected = !isCustomMode && selectedPack === pack.amt;
                  return (
                    <button
                      key={pack.amt}
                      type="button"
                      onClick={() => {
                        setIsCustomMode(false);
                        setSelectedPack(pack.amt);
                        setCustomAmountInput(pack.amt.toString());
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'bg-purple-50 border-[#581C87] text-[#581C87] font-black shadow-xs ring-1 ring-[#581C87]' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-extrabold text-sm font-mono">
                        {currencySymbol}{pack.amt}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">{pack.tag}</div>
                    </button>
                  );
                })}

                {/* Custom Amount Button */}
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isCustomMode 
                      ? 'bg-purple-50 border-[#581C87] text-[#581C87] font-black shadow-xs ring-1 ring-[#581C87]' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="font-extrabold text-xs">Custom</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Other amt</div>
                </button>
              </div>

              {/* Custom Amount Input Field */}
              {isCustomMode && (
                <div className="mb-3 space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Enter custom amount ({currentCurrency}):</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm font-mono font-bold text-gray-500">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min={effectiveMinRecharge}
                      step="1"
                      value={customAmountInput}
                      onChange={(e) => setCustomAmountInput(e.target.value)}
                      placeholder={`Min ${effectiveMinRecharge}`}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 font-mono text-sm font-bold text-gray-900 outline-none focus:border-[#581C87] focus:ring-1 focus:ring-[#581C87]"
                    />
                  </div>
                </div>
              )}

              {/* Validation Warning if below minimum units */}
              {isBelowMinimum && (
                <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Minimum recharge is {currencySymbol}{effectiveMinRecharge}.00 in {currentCurrency}.</span>
                </div>
              )}

              {/* Error Notice */}
              {rechargeError && (
                <div className="p-2.5 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{rechargeError}</span>
                </div>
              )}

              {/* Order Summary & Terms */}
              <div className="p-3 mb-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Recharge Amount:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {currencySymbol}{currentRechargeAmount.toFixed(2)}
                  </span>
                </div>
                {isFirstRechargeEligible && (
                  <div className="flex items-center justify-between text-amber-700 font-semibold">
                    <span>100% First Recharge Bonus:</span>
                    <span className="font-mono font-extrabold text-emerald-600">
                      +{currencySymbol}{currentRechargeAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between font-extrabold text-gray-950">
                  <span>Total Wallet Credit:</span>
                  <span className="font-mono text-sm text-[#581C87]">
                    {currencySymbol}{(isFirstRechargeEligible ? currentRechargeAmount * 2 : currentRechargeAmount).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 text-[10px] text-gray-500 leading-tight">
                  <p className="flex items-center gap-1 text-emerald-700 font-medium mb-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>256-Bit Encrypted Standard Checkout (Razorpay / PayU)</span>
                  </p>
                  Terms: 100% bonus awarded on first successful verified recharge. Non-withdrawable and applied instantly upon payment confirmation.
                </div>
              </div>

              {/* Payment Gateway Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                  Select Payment Gateway:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('razorpay')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPaymentGateway === 'razorpay'
                        ? 'border-[#0C2340] bg-[#0C2340] text-white shadow-sm ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>Razorpay</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 font-semibold uppercase">
                      Cards/UPI
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('payu')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPaymentGateway === 'payu'
                        ? 'border-[#581C87] bg-[#581C87] text-white shadow-sm ring-2 ring-purple-500/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>PayU Hosted</span>
                  </button>
                </div>
              </div>

              {/* Confirm & Recharge Button */}
              {selectedPaymentGateway === 'razorpay' ? (
                <RazorpayCheckoutButton
                  amount={currentRechargeAmount}
                  currency={currentCurrency}
                  customerId={effectiveCustomerId}
                  customerName="LUMSIC Seeker"
                  disabled={isBelowMinimum}
                  onSuccess={async (result) => {
                    const credited = result.creditedAmount || currentRechargeAmount;
                    const bonus = isFirstRechargeEligible ? credited : 0;
                    onRechargeSuccess(credited, bonus);
                    await fetchWalletAndReferralData();
                    setIsRechargeModalOpen(false);
                    setRechargeSuccessNotice(
                      `Razorpay payment verified! Added ${currencySymbol}${currentRechargeAmount.toFixed(2)} to your balance.`
                    );
                    setTimeout(() => setRechargeSuccessNotice(null), 6000);
                  }}
                  onError={(err) => {
                    setRechargeError(typeof err === 'string' ? err : err.message || 'Razorpay checkout error.');
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteRecharge}
                  disabled={isRecharging || isBelowMinimum}
                  className={`w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isBelowMinimum 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-[#581C87] hover:bg-[#4C1D95] active:scale-95'
                  }`}
                >
                  {isRecharging ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting to PayU Checkout...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pay with PayU &amp; Add {currencySymbol}{currentRechargeAmount.toFixed(2)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
