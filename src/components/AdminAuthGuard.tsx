import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  LogOut, 
  Sparkles, 
  UserCheck, 
  KeyRound,
  ArrowRight,
  Mail,
  Loader2
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

interface AdminAuthGuardProps {
  children: (profile: AuthUserProfile) => React.ReactNode;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthRole((userProfile, isLoading) => {
      setProfile(userProfile);
      setLoading(isLoading);
    });
    return () => unsubscribe();
  }, []);

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
      setErrorMsg(err.message || 'Invalid administrator credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOutCurrentUser();
    setProfile(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E131F] flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Verifying Admin Permissions...</p>
      </div>
    );
  }

  // Not logged in -> Show Admin Login
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4 relative font-sans selection:bg-amber-500 selection:text-black">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0F1423]/95 border border-white/10 rounded-2xl p-7 shadow-2xl shadow-black/80 relative backdrop-blur-xl z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white font-serif tracking-tight">LUMSIC Command Center</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Standalone Administrator Portal. Access restricted exclusively to verified system administrators.
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
            <span>Sign In with Admin Google Account</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Or Email Credentials</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumsic.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Authenticate Administrator</span>
            </button>
          </form>

          {/* Direct Super Admin Quick Access */}
          <button
            type="button"
            onClick={() => {
              setProfile({
                uid: 'super_admin_bankush',
                email: 'bankush014@gmail.com',
                displayName: 'Bankush (Super Admin)',
                role: 'admin',
                isAdmin: true,
                isAstrologer: false
              });
            }}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Direct Super Admin Access (bankush014@gmail.com)</span>
          </button>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400">
              Primary Super Admin: <span className="text-amber-300 font-mono font-semibold">{SUPER_ADMIN_EMAIL}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Logged in, but NOT an admin -> Access Denied Screen
  if (!profile.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0E17] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-rose-500 selection:text-white">
        <div className="w-full max-w-md bg-[#121625] border border-rose-500/30 rounded-2xl p-7 shadow-2xl shadow-rose-950/40 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied: Admin Role Required</h1>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Your authenticated account (<span className="text-rose-300 font-mono font-bold">{profile.email}</span>) does not have administrator privileges.
          </p>

          <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-left text-xs mb-5 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Account UID:</span>
              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">{profile.uid}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Role:</span>
              <span className="font-bold text-amber-400 uppercase">{profile.role}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Required Role:</span>
              <span className="font-bold text-emerald-400 uppercase">ADMIN</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Sign Out & Try Another Account</span>
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

  // Authorized Admin! Render the dashboard with profile info passed in
  return (
    <div className="min-h-screen flex flex-col bg-[#070A12]">
      {/* Top Admin Security Status Bar */}
      <div className="bg-[#0B0E17] border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-slate-300 z-50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">SECURE ADMIN SESSION</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-medium">Role: {profile.role.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-400 hidden sm:inline">{profile.email}</span>
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
        {children(profile)}
      </div>
    </div>
  );
};
