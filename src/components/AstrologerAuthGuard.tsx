import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Lock, 
  AlertTriangle, 
  LogOut, 
  Compass, 
  ArrowRight,
  Mail,
  KeyRound,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  auth, 
  subscribeToAuthRole, 
  signInWithGoogle, 
  signInEmailPassword, 
  signOutCurrentUser,
  AuthUserProfile,
  SUPER_ADMIN_EMAIL 
} from '../lib/firebase';
import { Reader } from '../types';

interface AstrologerAuthGuardProps {
  children: (profile: AuthUserProfile, astrologerReader: Reader | null) => React.ReactNode;
}

export const AstrologerAuthGuard: React.FC<AstrologerAuthGuardProps> = ({ children }) => {
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [matchedReader, setMatchedReader] = useState<Reader | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthRole((userProfile, isLoading) => {
      setProfile(userProfile);
      setLoading(isLoading);
    });
    return () => unsubscribe();
  }, []);

  // Try to match authenticated astrologer with a Reader record
  useEffect(() => {
    if (!profile) {
      setMatchedReader(null);
      return;
    }

    fetch('/api/readers')
      .then(res => res.json())
      .then(data => {
        if (data.readers && Array.isArray(data.readers)) {
          const userEmail = profile.email?.toLowerCase().trim();
          // Find reader by email or default first reader
          const matched = data.readers.find((r: Reader) => 
            (r as any).email?.toLowerCase() === userEmail ||
            r.name.toLowerCase().includes(profile.displayName?.toLowerCase() || '___')
          ) || data.readers[0];
          setMatchedReader(matched || null);
        }
      })
      .catch(() => {
        // ignore
      });
  }, [profile]);

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg(null);
      setSubmitting(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    try {
      setErrorMsg(null);
      setSubmitting(true);
      await signInEmailPassword(email, password);
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setErrorMsg(err.message || 'Invalid astrologer credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOutCurrentUser();
    setProfile(null);
    setMatchedReader(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B19] flex flex-col items-center justify-center p-6 text-amber-100 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
          <Compass className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-amber-200/70">Verifying Astrologer Credentials...</p>
      </div>
    );
  }

  // Not logged in -> Show Astrologer Login
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060A17] text-slate-100 flex items-center justify-center p-4 relative font-sans selection:bg-amber-400 selection:text-black">
        {/* Mystic Celestial Nebula */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0C1226]/95 border border-amber-500/20 rounded-3xl p-8 shadow-2xl shadow-black/80 relative backdrop-blur-2xl z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-indigo-600/20 border border-amber-400/30 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase">Astroboard Portal</span>
            <h1 className="text-2xl font-black text-white font-serif tracking-tight mt-0.5">Astrologer Sanctuary</h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
              Dedicated workstation for verified Vedic astrologers, tarot masters, and psychic readers.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Sign In with Astrologer Google Account</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Or Astrologer ID</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Email / Astrologer ID Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-amber-200/90 uppercase tracking-wider mb-1">
                Astrologer Email or ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="astro.vikram@astrodashboard.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-amber-500/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-200/90 uppercase tracking-wider mb-1">
                Consultant Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-amber-500/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Open Astrologer Workstation</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400">
              New Astrologer? Contact Administrator to register your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Logged in, but NOT an astrologer (and not admin inspecting) -> Access Denied Screen
  const isAuthorized = profile.isAstrologer || profile.isAdmin;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#070B19] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-md bg-[#0F1426] border border-amber-500/30 rounded-2xl p-7 shadow-2xl shadow-black/60 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied: Astrologer Role Required</h1>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Your account (<span className="text-amber-300 font-mono font-bold">{profile.email}</span>) is not assigned the <strong className="text-amber-400">astrologer</strong> role.
          </p>

          <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-left text-xs mb-5 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Account UID:</span>
              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">{profile.uid}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Role:</span>
              <span className="font-bold text-slate-300 uppercase">{profile.role}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Required Role:</span>
              <span className="font-bold text-amber-400 uppercase">ASTROLOGER</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mb-4">
            To register as a reader on LUMSIC, please submit your credentials to the platform administrator.
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Sign Out & Switch Account</span>
            </button>
            <a
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
            >
              <span>← Return to LUMSIC Sanctuary</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Astrologer! Render dashboard
  return (
    <div className="min-h-screen flex flex-col bg-[#070B19]">
      {/* Top Astrologer Status Bar */}
      <div className="bg-[#0A0F21] border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-100 z-50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold tracking-wide text-amber-200">ASTROBOARD SECURE WORKSTATION</span>
          <span className="text-amber-500/50">|</span>
          <span className="text-slate-300 font-medium">Reader: {matchedReader?.name || profile.displayName}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-amber-300/80 hidden sm:inline">{profile.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold cursor-pointer transition-all active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1">
        {children(profile, matchedReader)}
      </div>
    </div>
  );
};
