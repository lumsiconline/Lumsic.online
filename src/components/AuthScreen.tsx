import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ChevronDown, Check, ArrowLeft, Sparkles, Shield, Phone, Mail, 
  Globe, Lock, X, User, AlertCircle, Loader2, RefreshCw, Eye, EyeOff, KeyRound 
} from 'lucide-react';
import { COUNTRIES, CountryInfo, detectUserGeo } from '../utils/currency';
import { CustomerProfile } from '../types';
import { LumysicLogo } from './LumysicLogo';
import { 
  signupWithPassword, 
  loginWithPassword, 
  requestForgotPasswordOtp, 
  resetPasswordWithOtp 
} from '../lib/supabase';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

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
  redirectTarget = null
}) => {
  // Session storage redirect recovery
  const [activeRedirect, setActiveRedirect] = useState<AuthRedirectTarget | null>(() => {
    if (redirectTarget) return redirectTarget;
    try {
      const stored = sessionStorage.getItem('lumysic_auth_redirect_target');
      if (stored) {
        return JSON.parse(stored);
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

  // Auth Mode: 'login' | 'signup' | 'forgot_request' | 'forgot_reset'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_request' | 'forgot_reset'>('login');

  // Country selector
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(
    detectedGeo || COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0]
  );
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Form Fields
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

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password fields
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string>('');

  // Status & Feedback
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect geo
  useEffect(() => {
    if (!detectedGeo) {
      detectUserGeo().then(geo => {
        if (geo) setSelectedCountry(geo);
      });
    } else {
      setSelectedCountry(detectedGeo);
    }
  }, [detectedGeo]);

  // Filter countries for modal
  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase().trim()) ||
    c.dialCode.includes(countrySearch.trim()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase().trim())
  );

  // Helper to persist session & notify parent
  const handleAuthSuccess = (user: any) => {
    const cleanEmail = (user.email || emailAddress).trim().toLowerCase();
    const effectiveName = user.name || fullName || cleanEmail.split('@')[0] || 'Seeker';
    const effectivePhone = user.phone || `${selectedCountry.dialCode} ${phoneNumber.trim()}`;
    const resolvedCurrency = selectedCountry.code === 'GB' || selectedCountry.dialCode === '+44' ? 'GBP' : 'USD';

    localStorage.setItem('lumysic_is_logged_in', 'true');
    localStorage.setItem('astral_is_logged_in', 'true');
    localStorage.setItem('lumysic_user_email', cleanEmail);
    localStorage.setItem('astral_customer_email', cleanEmail);
    localStorage.setItem('lumysic_user_name', effectiveName);
    localStorage.setItem('astral_customer_name', effectiveName);
    localStorage.setItem('lumysic_user_phone', effectivePhone);
    localStorage.setItem('astral_customer_phone', effectivePhone);
    localStorage.setItem('astral_currency', resolvedCurrency);
    localStorage.setItem('astral_country', selectedCountry.code);

    try {
      sessionStorage.removeItem('lumysic_auth_redirect_target');
    } catch {}

    onLoginSuccess({
      id: user.id || 'usr_' + Date.now(),
      name: effectiveName,
      email: cleanEmail,
      phone: effectivePhone,
      country: selectedCountry.code,
      countryCode: selectedCountry.dialCode,
      currency: resolvedCurrency,
      isFirstTimeUser: Boolean(user.isFirstTimeUser),
      freeMinutesUsed: false,
      totalConsultations: user.totalConsultations || 0
    }, activeRedirect);
  };

  // =========================================================================
  // 1. LOGIN WITH EMAIL & PASSWORD ONLY (NO OTP)
  // =========================================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setStatusMessage('');

    const cleanEmail = emailAddress.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!cleanPass) {
      setFormError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (!result.success || !result.user) {
        setIsLoading(false);
        setFormError(result.error || 'Invalid email or password.');
        return;
      }

      setIsLoading(false);
      handleAuthSuccess(result.user);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || '';
      setFormError(msg.toLowerCase().includes('failed to fetch') ? 'Unable to connect to service. Please check your connection and try again.' : (msg || 'Login failed. Please check your credentials and try again.'));
    }
  };

  // =========================================================================
  // 2. SIGNUP WITH NAME, EMAIL, PHONE, PASSWORD & CONFIRM PASSWORD
  // =========================================================================
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setStatusMessage('');

    const cleanName = fullName.trim();
    const cleanEmail = emailAddress.trim().toLowerCase();
    const cleanPhoneDigits = phoneNumber.replace(/\D/g, '');
    const cleanPass = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanName || cleanName.length < 2) {
      setFormError('Please enter your full name (at least 2 letters).');
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!cleanPhoneDigits || cleanPhoneDigits.length < 7) {
      setFormError('Please enter a valid contact number (at least 7 digits).');
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signupWithPassword({
        name: cleanName,
        email: cleanEmail,
        phone: `${selectedCountry.dialCode} ${phoneNumber.trim()}`,
        password: cleanPass,
        confirmPassword: cleanConfirm,
        country: selectedCountry.code,
        countryCode: selectedCountry.dialCode,
        currency: selectedCountry.currency
      });

      if (!result.success || !result.user) {
        setIsLoading(false);
        setFormError(result.error || 'Signup failed. Please try again.');
        return;
      }

      setIsLoading(false);
      handleAuthSuccess(result.user);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || '';
      setFormError(msg.toLowerCase().includes('failed to fetch') ? 'Unable to connect. Please try again.' : (msg || 'Signup failed. Please try again.'));
    }
  };

  // =========================================================================
  // 3. FORGOT PASSWORD: STEP 1 - REQUEST OTP VIA EMAIL
  // =========================================================================
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setStatusMessage('');

    const cleanEmail = emailAddress.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestForgotPasswordOtp(cleanEmail);
      setIsLoading(false);

      if (!result.success) {
        setFormError(result.error || 'No account found with this email address.');
        return;
      }

      if (result.otpCode) {
        setActiveOtpCode(result.otpCode);
      }
      setMode('forgot_reset');
      setStatusMessage(`A 6-digit verification code has been dispatched to ${cleanEmail}.`);
    } catch (err: any) {
      setIsLoading(false);
      setFormError(err?.message || 'Failed to send password reset code.');
    }
  };

  // =========================================================================
  // 4. FORGOT PASSWORD: STEP 2 - VERIFY OTP & RESET PASSWORD
  // =========================================================================
  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setStatusMessage('');

    const cleanEmail = emailAddress.trim().toLowerCase();
    const cleanOtp = resetOtp.trim();
    const cleanNewPass = newPassword.trim();
    const cleanConfirmNewPass = confirmNewPassword.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setFormError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!cleanNewPass || cleanNewPass.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    if (cleanNewPass !== cleanConfirmNewPass) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPasswordWithOtp({
        email: cleanEmail,
        otp: cleanOtp,
        newPassword: cleanNewPass,
        confirmPassword: cleanConfirmNewPass
      });

      setIsLoading(false);

      if (!result.success) {
        setFormError(result.error || 'Invalid or expired verification code.');
        return;
      }

      setPassword('');
      setConfirmPassword('');
      setResetOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setMode('login');
      setStatusMessage('Password reset successfully! Please log in with your new password.');
    } catch (err: any) {
      setIsLoading(false);
      setFormError(err?.message || 'Failed to reset password. Please try again.');
    }
  };

  // =========================================================================
  // 5. GOOGLE 1-CLICK AUTHENTICATION
  // =========================================================================
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setFormError('');
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const cleanEmail = (user.email || '').toLowerCase().trim();
      const cleanName = user.displayName || cleanEmail.split('@')[0] || 'Valued Seeker';
      const cleanPhone = user.phoneNumber || '';

      handleAuthSuccess({
        id: user.uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || `${selectedCountry.dialCode} 0000000`
      });
    } catch (err: any) {
      console.warn('Google sign-in notice:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setFormError('Google Sign-In was cancelled or unavailable.');
      }
    } finally {
      setIsLoading(false);
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
        {mode !== 'login' && mode !== 'signup' ? (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError('');
              setStatusMessage('');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
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

          <p className="text-xs sm:text-sm text-[#FCE38A]/85 mt-2 mb-4 text-center font-medium tracking-wide">
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

        {/* MAIN CARD */}
        <div className="w-full bg-[#0D1536]/90 border border-indigo-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
          
          {/* Status Message (e.g. password reset success) */}
          {statusMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Notice */}
          {formError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in leading-relaxed text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="flex-1">{formError}</span>
            </div>
          )}

          {/* =========================================================================
              VIEW A: LOGIN FORM (EMAIL & PASSWORD ONLY)
          ========================================================================= */}
          {mode === 'login' && (
            <div>
              {/* Login / Signup Tabs */}
              <div className="flex rounded-2xl bg-[#141E47] p-1 mb-5 border border-indigo-800/80">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setFormError(''); }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl transition-all bg-gradient-to-r from-[#F6D06E] to-[#E5B744] text-slate-950 shadow-md"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setFormError(''); }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl transition-all text-slate-300 hover:text-white"
                >
                  Sign Up
                </button>
              </div>

              {/* Google 1-Click Login */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full mb-4 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.99] border border-slate-200"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-slate-400 font-medium">Or enter credentials</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Login Form: Email and Password Only */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#F6D06E]" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot_request'); setFormError(''); setStatusMessage(''); }}
                      className="text-[11px] text-[#F6D06E] hover:underline cursor-pointer font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-gray-950" />
                      <span>Log In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom toggle link */}
              <div className="text-center mt-5 pt-4 border-t border-white/10 text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setFormError(''); }}
                  className="text-[#F6D06E] font-bold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW B: SIGNUP FORM (NAME, EMAIL, CONTACT NUMBER, PASSWORD, CONFIRM PASS)
          ========================================================================= */}
          {mode === 'signup' && (
            <div>
              {/* Login / Signup Tabs */}
              <div className="flex rounded-2xl bg-[#141E47] p-1 mb-5 border border-indigo-800/80">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setFormError(''); }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl transition-all text-slate-300 hover:text-white"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setFormError(''); }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl transition-all bg-gradient-to-r from-[#F6D06E] to-[#E5B744] text-slate-950 shadow-md"
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                {/* 1. Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#F6D06E]" />
                      <span>Full Name</span>
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-normal">For consultations</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    autoComplete="name"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                  />
                </div>

                {/* 2. Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                  />
                </div>

                {/* 3. Contact Number with Country Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#F6D06E]" />
                      <span>Contact Number</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">With country code</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCountryPickerOpen(true)}
                      disabled={isLoading}
                      className="px-3 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 hover:border-[#F6D06E] text-white font-semibold text-xs sm:text-sm shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-inner disabled:opacity-50"
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 7123456789"
                      autoComplete="tel"
                      required
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* 4. Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 5. Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Confirm Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-gray-950" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom toggle link */}
              <div className="text-center mt-5 pt-4 border-t border-white/10 text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setFormError(''); }}
                  className="text-[#F6D06E] font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW C: FORGOT PASSWORD - STEP 1 (REQUEST OTP)
          ========================================================================= */}
          {mode === 'forgot_request' && (
            <div>
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Forgot Password?
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Enter your registered email address and we'll send you a 6-digit verification code to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Registered Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                      <span>Sending Reset Code...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Reset Code</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-5 pt-4 border-t border-white/10 text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setFormError(''); }}
                  className="text-[#F6D06E] font-bold hover:underline cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW D: FORGOT PASSWORD - STEP 2 (ENTER OTP & SET NEW PASSWORD)
          ========================================================================= */}
          {mode === 'forgot_reset' && (
            <div>
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Reset Password
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-semibold text-[#F6D06E] break-all">{emailAddress}</span> and set your new password.
                </p>
              </div>

              {/* Instant Verification Code Card (if email delayed by filters) */}
              {activeOtpCode && (
                <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-400/40 text-center shadow-lg">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-amber-300 font-bold mb-1">
                    <Sparkles className="w-3 h-3 fill-amber-300" />
                    <span>Reset Verification Code</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 my-1">
                    <span className="font-mono text-2xl font-extrabold tracking-widest text-[#F6D06E]">
                      {activeOtpCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetOtp(activeOtpCode)}
                      className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      Auto-Fill
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Also sent to your email (check inbox and spam folder)
                  </p>
                </div>
              )}

              <form onSubmit={handleForgotPasswordReset} className="space-y-3.5">
                {/* 6-Digit OTP */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>6-Digit Verification Code</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 text-center font-mono tracking-widest text-lg font-bold rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm transition-all shadow-inner disabled:opacity-50"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Confirm New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                      className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white text-sm placeholder:text-slate-500 transition-all shadow-inner disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-gray-950" />
                      <span>Reset Password &amp; Log In</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-5 pt-4 border-t border-white/10 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setFormError(''); }}
                  className="text-[#F6D06E] font-bold hover:underline cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Terms */}
      <div className="relative z-10 text-center text-[11px] text-slate-400 max-w-sm px-4 pt-4">
        Protected by 256-bit encryption. By continuing, you agree to our{' '}
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
