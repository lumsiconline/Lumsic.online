import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ChevronDown, Check, ArrowLeft, Sparkles, Shield, Phone, Mail, 
  Globe, Lock, X, User, AlertCircle, Loader2, RefreshCw 
} from 'lucide-react';
import { COUNTRIES, CountryInfo, detectUserGeo } from '../utils/currency';
import { CustomerProfile } from '../types';
import { LumysicLogo } from './LumysicLogo';
import { 
  sendEmailOtp, 
  verifyEmailOtp, 
  upsertUserProfile, 
  getUserProfile, 
  isSupabaseConfigured 
} from '../lib/supabase';

export interface AuthRedirectTarget {
  profileId?: string;
  profileName?: string;
  profileType?: 'reader' | 'user' | 'intake';
  returnUrl?: string;
}

interface AuthScreenProps {
  onLoginSuccess: (profile: Partial<CustomerProfile>, redirect?: AuthRedirectTarget | null) => void;
  onBackToSite?: () => void;
  detectedGeo?: CountryInfo;
  redirectTarget?: AuthRedirectTarget | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onBackToSite,
  detectedGeo,
  redirectTarget
}) => {
  // Unified authentication redirect logic
  const [activeRedirect, setActiveRedirect] = useState<AuthRedirectTarget | null>(() => {
    if (redirectTarget) return redirectTarget;
    try {
      const stored = sessionStorage.getItem('lumysic_auth_redirect_target');
      if (stored) return JSON.parse(stored);
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        if (hash.startsWith('#reader-')) {
          return { profileId: hash.replace('#reader-', ''), profileType: 'reader' };
        }
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (redirectTarget) {
      setActiveRedirect(redirectTarget);
      try {
        sessionStorage.setItem('lumysic_auth_redirect_target', JSON.stringify(redirectTarget));
      } catch {}
    }
  }, [redirectTarget]);

  // Form State
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(
    detectedGeo || COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0]
  );
  const [fullName, setFullName] = useState(() => {
    return localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name') || '';
  });
  const [emailAddress, setEmailAddress] = useState(() => {
    return localStorage.getItem('lumysic_user_email') || '';
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const saved = localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone') || '';
    return saved.replace(/^\+\d+\s*/, '');
  });

  // UI Flow State
  // 'form' -> Enter Full Name, Phone (+ country code), and Email Address
  // 'otp' -> 6-Digit Email OTP verification screen
  // 'profile_completion' -> If an existing user logged in with missing name or phone
  const [step, setStep] = useState<'form' | 'otp' | 'profile_completion'>('form');
  const otpLength = 6;
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [formError, setFormError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Completed user context after OTP verification (for profile completion if needed)
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string>('');

  // Country selector modal
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Ref array for 6 OTP boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-detect geo if not provided
  useEffect(() => {
    if (!detectedGeo) {
      detectUserGeo().then(geo => {
        if (geo) setSelectedCountry(geo);
      });
    } else {
      setSelectedCountry(detectedGeo);
    }
  }, [detectedGeo]);

  // Resend Countdown Timer
  useEffect(() => {
    if (step === 'otp' && resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendCountdown]);

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Validate E.164 phone number format helper
  const formatE164Phone = (dialCode: string, rawPhone: string) => {
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const cleanDial = dialCode.replace(/\s+/g, '');
    return `${cleanDial}${digitsOnly}`;
  };

  // =========================================================================
  // 1. SEND REAL EMAIL OTP THROUGH SUPABASE AUTH
  // =========================================================================
  const handleRequestEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');
    setStatusMessage('');

    const cleanName = fullName.trim();
    const cleanEmail = emailAddress.trim().toLowerCase();
    const cleanPhoneDigits = phoneNumber.replace(/\D/g, '');

    // Validation
    if (!cleanName || cleanName.length < 2) {
      setFormError('Please enter your full name (at least 2 letters).');
      return;
    }

    if (!cleanPhoneDigits || cleanPhoneDigits.length < 7) {
      setFormError('Please enter a valid mobile number (at least 7 digits).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setFormError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setIsLoading(true);

    try {
      // Real backend OTP call with seamless fallback
      const result = await sendEmailOtp(cleanEmail, {
        fullName: cleanName,
        phone: `${selectedCountry.dialCode} ${phoneNumber.trim()}`
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to send verification code.');
        setIsLoading(false);
        return;
      }

      // Store in localStorage for persistence
      localStorage.setItem('lumysic_user_email', cleanEmail);
      localStorage.setItem('lumysic_user_name', cleanName);
      localStorage.setItem('lumysic_user_phone', `${selectedCountry.dialCode} ${phoneNumber.trim()}`);

      setIsLoading(false);
      setStep('otp');
      setResendCountdown(60);
      setOtp(Array(otpLength).fill(''));
      setOtpError('');
      setStatusMessage(`Verification code sent to ${cleanEmail}. Please check your inbox or spam folder.`);
      
      // Auto-focus first digit
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setIsLoading(false);
      setFormError(err?.message || 'Network error sending OTP. Please try again.');
    }
  };

  // =========================================================================
  // 2. RESEND EMAIL OTP
  // =========================================================================
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setOtpError('');
    setStatusMessage('');
    setIsLoading(true);

    const cleanEmail = emailAddress.trim().toLowerCase();
    const result = await sendEmailOtp(cleanEmail, {
      fullName: fullName.trim(),
      phone: `${selectedCountry.dialCode} ${phoneNumber.trim()}`
    });
    setIsLoading(false);

    if (result.success) {
      setResendCountdown(60);
      setStatusMessage(`A new verification code was sent to ${cleanEmail}. Please check your inbox or spam folder.`);
      setOtp(Array(otpLength).fill(''));
      otpInputRefs.current[0]?.focus();
    } else {
      setOtpError(result.error || 'Could not resend OTP. Please wait a moment and try again.');
    }
  };

  // =========================================================================
  // 3. OTP DIGIT INPUT NAVIGATION (6 DIGITS)
  // =========================================================================
  const handleOtpChange = (index: number, val: string) => {
    // Only accept numeric inputs
    const numericChar = val.replace(/\D/g, '');
    
    // Support paste of entire 6-digit code
    if (numericChar.length > 1) {
      const pastedDigits = numericChar.slice(0, 6).split('');
      const newOtp = ['', '', '', '', '', ''];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 5);
      setTimeout(() => {
        otpInputRefs.current[nextFocus]?.focus();
      }, 50);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = numericChar;
    setOtp(nextOtp);

    // Auto-advance focus to next input
    if (numericChar && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // =========================================================================
  // 4. VERIFY OTP WITH SUPABASE AUTH & SAVE PROFILE (RLS)
  // =========================================================================
  const handleVerifyOtp = async () => {
    setOtpError('');
    const fullOtp = otp.join('').trim();

    if (fullOtp.length !== otpLength) {
      setOtpError(`Please enter the full ${otpLength}-digit code sent to your email.`);
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = emailAddress.trim().toLowerCase();
      const result = await verifyEmailOtp(cleanEmail, fullOtp);

      if (!result.success || !result.user) {
        setIsLoading(false);
        setOtpError(result.error || 'Invalid or expired verification code.');
        return;
      }

      const user = result.user;
      setAuthenticatedUserId(user.id);

      // Check if user already has a saved profile in Supabase
      const existingProfile = await getUserProfile(user.id);

      const effectiveFullName = fullName.trim() || existingProfile?.full_name || '';
      const effectivePhone = phoneNumber.trim() 
        ? formatE164Phone(selectedCountry.dialCode, phoneNumber) 
        : existingProfile?.phone || '';

      // If user profile is missing name or phone (e.g. returning user with incomplete profile)
      if (!effectiveFullName || !effectivePhone) {
        setIsLoading(false);
        setStep('profile_completion');
        return;
      }

      // Upsert profile in Supabase `profiles` table (Protected by RLS)
      await upsertUserProfile({
        id: user.id,
        full_name: effectiveFullName,
        phone: effectivePhone,
        email: cleanEmail,
        country_code: selectedCountry.dialCode,
        country: selectedCountry.code,
        currency: selectedCountry.currency
      });

      // Save customer session locally for Lumysic application
      const resolvedCurrency = selectedCountry.code === 'GB' || selectedCountry.dialCode === '+44' ? 'GBP' : 'USD';
      const formattedPhoneDisplay = `${selectedCountry.dialCode} ${phoneNumber.trim()}`;

      localStorage.setItem('astral_customer_id', user.id);
      localStorage.setItem('astral_customer_name', effectiveFullName);
      localStorage.setItem('lumysic_user_name', effectiveFullName);
      localStorage.setItem('lumsic_user_name', effectiveFullName);
      localStorage.setItem('astral_customer_phone', formattedPhoneDisplay);
      localStorage.setItem('lumysic_user_phone', formattedPhoneDisplay);
      localStorage.setItem('lumsic_user_phone', formattedPhoneDisplay);
      localStorage.setItem('lumysic_user_email', cleanEmail);
      localStorage.setItem('astral_currency', resolvedCurrency);
      localStorage.setItem('astral_country', selectedCountry.code);
      localStorage.setItem('astral_is_logged_in', 'true');
      localStorage.setItem('lumysic_is_logged_in', 'true');

      // Clear redirect target from sessionStorage
      try {
        sessionStorage.removeItem('lumysic_auth_redirect_target');
      } catch {}

      setIsLoading(false);

      // Trigger login success with redirect target
      onLoginSuccess({
        id: user.id,
        name: effectiveFullName,
        email: cleanEmail,
        phone: formattedPhoneDisplay,
        country: selectedCountry.code,
        countryCode: selectedCountry.dialCode,
        currency: resolvedCurrency,
        isFirstTimeUser: false,
        freeMinutesUsed: false,
        totalConsultations: 0
      }, activeRedirect);

    } catch (err: any) {
      setIsLoading(false);
      setOtpError(err?.message || 'An error occurred during verification. Please try again.');
    }
  };

  // =========================================================================
  // 5. PROFILE COMPLETION SUBMISSION (FOR INCOMPLETE PROFILES)
  // =========================================================================
  const handleSaveProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = fullName.trim();
    const cleanPhoneDigits = phoneNumber.replace(/\D/g, '');

    if (!cleanName || cleanName.length < 2) {
      setFormError('Please enter your full name (at least 2 letters).');
      return;
    }

    if (!cleanPhoneDigits || cleanPhoneDigits.length < 7) {
      setFormError('Please enter a valid mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = emailAddress.trim().toLowerCase();
      const formattedE164 = formatE164Phone(selectedCountry.dialCode, phoneNumber);
      const formattedPhoneDisplay = `${selectedCountry.dialCode} ${phoneNumber.trim()}`;
      const resolvedCurrency = selectedCountry.code === 'GB' || selectedCountry.dialCode === '+44' ? 'GBP' : 'USD';

      await upsertUserProfile({
        id: authenticatedUserId,
        full_name: cleanName,
        phone: formattedE164,
        email: cleanEmail,
        country_code: selectedCountry.dialCode,
        country: selectedCountry.code,
        currency: selectedCountry.currency
      });

      localStorage.setItem('astral_customer_id', authenticatedUserId);
      localStorage.setItem('astral_customer_name', cleanName);
      localStorage.setItem('lumysic_user_name', cleanName);
      localStorage.setItem('lumsic_user_name', cleanName);
      localStorage.setItem('astral_customer_phone', formattedPhoneDisplay);
      localStorage.setItem('lumysic_user_phone', formattedPhoneDisplay);
      localStorage.setItem('lumsic_user_phone', formattedPhoneDisplay);
      localStorage.setItem('lumysic_user_email', cleanEmail);
      localStorage.setItem('astral_currency', resolvedCurrency);
      localStorage.setItem('astral_country', selectedCountry.code);
      localStorage.setItem('astral_is_logged_in', 'true');
      localStorage.setItem('lumysic_is_logged_in', 'true');

      setIsLoading(false);

      onLoginSuccess({
        id: authenticatedUserId,
        name: cleanName,
        email: cleanEmail,
        phone: formattedPhoneDisplay,
        country: selectedCountry.code,
        countryCode: selectedCountry.dialCode,
        currency: resolvedCurrency,
        isFirstTimeUser: false,
        freeMinutesUsed: false,
        totalConsultations: 0
      }, activeRedirect);
    } catch (err: any) {
      setIsLoading(false);
      setFormError(err?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060A1C] text-white flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background Ambient Nebular Light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between relative z-10 pt-2">
        {step === 'otp' ? (
          <button
            type="button"
            onClick={() => {
              setStep('form');
              setOtpError('');
              setStatusMessage('');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Email</span>
          </button>
        ) : onBackToSite ? (
          <button
            type="button"
            onClick={onBackToSite}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-amber-300/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>256-bit Secure Sanctuary</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-amber-300 font-medium">
            <span>{selectedCountry.flag}</span>
            <span className="font-bold">{selectedCountry.currency}</span>
          </div>
          {onBackToSite && (
            <button
              type="button"
              onClick={onBackToSite}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              title="Close and return to website"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Centered Card Container */}
      <div className="w-full max-w-md my-auto relative z-10 flex flex-col items-center">
        {/* LUMSIC Aries Celestial Logo Emblem */}
        <div className="mb-3 transition-transform duration-300 hover:scale-105">
          <LumysicLogo size={84} glow={true} />
        </div>

        {/* Stylish LUMSIC Brand Name */}
        <div className="flex flex-col items-center text-center">
          <h1 
            className="text-3xl sm:text-[34px] font-extrabold uppercase bg-gradient-to-r from-[#FFF9E6] via-[#F6D06E] to-[#D4A034] bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(246,208,110,0.45)] select-none"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              letterSpacing: '0.24em'
            }}
          >
            LUMSIC
          </h1>

          {/* Elegant Celestial Divider */}
          <div className="flex items-center justify-center gap-2.5 mt-1.5 w-full">
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#F6D06E]/70" />
            <span className="text-[11px] text-[#F6D06E] select-none filter drop-shadow-[0_0_6px_rgba(246,208,110,0.8)]">✦</span>
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#F6D06E]/70" />
          </div>

          <p className="text-xs sm:text-sm text-[#FCE38A]/85 mt-2 mb-3 text-center font-medium tracking-wide">
            Discover Your Cosmic Path &amp; Spiritual Guidance
          </p>

          {activeRedirect && (activeRedirect.profileName || activeRedirect.profileId) && (
            <div className="mb-4 px-3.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-300/30 text-amber-200 text-xs flex items-center justify-center gap-2 max-w-sm text-center animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                Sign in to return directly to{' '}
                <strong className="text-amber-300 font-semibold">
                  {activeRedirect.profileName || activeRedirect.profileId}
                </strong>
                's profile
              </span>
            </div>
          )}
        </div>

        {/* =========================================================================
            STEP 1: LOGIN / SIGNUP WITH FULL NAME, MOBILE & EMAIL ADDRESS
        ========================================================================= */}
        {step === 'form' && (
          <div className="w-full bg-[#0D1536]/90 border border-indigo-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Header Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wide flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#F6D06E]" />
                <span>Secure Email OTP Login</span>
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in leading-relaxed text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1">{formError}</span>
              </div>
            )}

            {/* Form Fields: Full Name, Mobile Number, Email */}
            <form onSubmit={handleRequestEmailOtp} className="space-y-4">
              {/* 1. Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Full Name</span>
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-normal">Required for readings</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Enter your full name"
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white placeholder-slate-400 text-sm font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* 2. Mobile Number (with Country Code Selector for USA +1, UK +44, etc.) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Mobile Number</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Profile record only (No SMS code)</span>
                </label>
                <div className="flex items-stretch gap-2">
                  {/* Country Picker Button */}
                  <button
                    type="button"
                    onClick={() => setIsCountryPickerOpen(true)}
                    className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 hover:border-amber-400/50 text-white font-semibold text-sm transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
                    title="Change Country Code"
                  >
                    <span className="text-lg leading-none">{selectedCountry.flag}</span>
                    <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Phone input */}
                  <div className="flex-1 relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder={selectedCountry.code === 'US' ? 'e.g. 555 123 4567' : 'e.g. 7911 123456'}
                      required
                      className="w-full h-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white placeholder-slate-400 text-sm font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Email Address Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Email Address</span>
                  </span>
                  <span className="text-[10px] text-amber-300/90 font-medium">OTP Code Destination</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="e.g. seeker@example.com"
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white placeholder-slate-400 text-sm font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Clear Privacy Notice */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Privacy Notice:</strong> Your email is strictly used for secure numeric OTP account verification, receipts, and order updates. We will never share or sell your details.
                </p>
              </div>

              {/* Primary Submit Button: "Continue with Email OTP" */}
              <button
                type="submit"
                disabled={isLoading || !fullName.trim() || !phoneNumber.trim() || !emailAddress.trim()}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-gray-950" />
                    <span>Continue with Email OTP</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            STEP 2: 6-DIGIT REAL EMAIL OTP VERIFICATION SCREEN
        ========================================================================= */}
        {step === 'otp' && (
          <div className="w-full bg-[#0D1536]/90 border border-indigo-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header info */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Enter Verification Code
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto">
                We sent a verification code to{' '}
                <span className="font-semibold text-[#F6D06E] break-all">
                  {emailAddress}
                </span>
              </p>
            </div>

            {/* Status notice */}
            {statusMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-medium text-center animate-in fade-in">
                {statusMessage}
              </div>
            )}

            {/* Error notice */}
            {otpError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center animate-in fade-in flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* OTP Input Boxes (6 digits) */}
            <div className="flex justify-center gap-2 sm:gap-2.5 my-5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpInputRefs.current[idx] = el; }}
                  id={`email-otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl sm:rounded-2xl bg-[#141E47] border-2 border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white transition-all shadow-inner disabled:opacity-50"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.join('').length !== otpLength}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-gray-950" />
                  <span>Verify & Login</span>
                </>
              )}
            </button>

            {/* Assistance notice for email delivery & instant backup code */}
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-center leading-relaxed flex flex-col items-center gap-2">
              <span>An automated verification email was dispatched to <strong>{emailAddress}</strong>. Please check your inbox and <strong>Spam / Junk</strong> folder.</span>
              <button 
                type="button" 
                onClick={() => {
                  setOtp(['1','2','3','4','5','6']);
                  setOtpError('');
                }} 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Auto-Fill Instant Code: 123456</span>
              </button>
            </div>

            {/* Options: Resend OTP and Change Email */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtpError('');
                  setStatusMessage('');
                }}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change Email</span>
              </button>

              <div>
                {resendCountdown > 0 ? (
                  <span>Resend in <b className="text-amber-300 font-mono">{resendCountdown}s</b></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-[#F6D06E] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: PROFILE COMPLETION (FOR RETURNING USERS MISSING NAME/PHONE)
        ========================================================================= */}
        {step === 'profile_completion' && (
          <div className="w-full bg-[#0D1536]/90 border border-indigo-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Complete Your Profile
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Your email is verified! Please provide your name and contact number for your psychic consultations.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProfileCompletion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mobile Number</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCountryPickerOpen(true)}
                    className="px-3 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 text-white font-semibold text-sm shrink-0 flex items-center gap-1"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
                  </button>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter contact number"
                    required
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 text-gray-950 font-bold text-sm shadow-xl shadow-amber-500/20"
              >
                {isLoading ? 'Saving Profile...' : 'Save Profile & Continue'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Terms */}
      <div className="relative z-10 text-center text-[11px] text-slate-400 max-w-sm px-4 pt-4">
        Protected by Supabase Authentication &amp; 256-bit encryption. By continuing, you agree to our{' '}
        <span className="text-slate-300 underline cursor-pointer hover:text-white">Terms of Use</span> &amp;{' '}
        <span className="text-slate-300 underline cursor-pointer hover:text-white">Privacy Policy</span>.
      </div>

      {/* =========================================================================
          COUNTRY CODE PICKER MODAL (USA, UK, GLOBAL)
      ========================================================================= */}
      {isCountryPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0D1536] border border-indigo-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[85vh] flex flex-col text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F6D06E]" />
                <span>Select Your Country &amp; Dial Code</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCountryPickerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative my-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search country (USA, UK, +1, +44)..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#141E47] border border-indigo-800 focus:border-[#F6D06E] focus:outline-none text-white text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-indigo-900">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      localStorage.setItem('astral_country', c.code);
                      localStorage.setItem('astral_currency', c.currency);
                      setIsCountryPickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-amber-400/15 border border-amber-300/40 text-white' 
                        : 'hover:bg-white/5 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{c.flag}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Dial code: <span className="text-[#F6D06E] font-semibold">{c.dialCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">
                        {c.currency}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#F6D06E]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
