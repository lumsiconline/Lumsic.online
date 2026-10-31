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
  CheckCircle2,
  Copy,
  Check,
  Link as LinkIcon,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AuthUserProfile } from '../lib/firebase';
import { Reader } from '../types';

interface AstrologerAuthGuardProps {
  children: (profile: AuthUserProfile, astrologerReader: Reader | null) => React.ReactNode;
  onBackToSite?: () => void;
}

export const AstrologerAuthGuard: React.FC<AstrologerAuthGuardProps> = ({ children, onBackToSite }) => {
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [matchedReader, setMatchedReader] = useState<Reader | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [availableReaders, setAvailableReaders] = useState<Reader[]>([]);

  useEffect(() => {
    let alive = true;
    const loadProfile = async (user: any) => {
      if (!user) { if (alive) { setProfile(null); setMatchedReader(null); setLoading(false); } return; }
      const { data: roleRow, error } = await supabase
        .from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
      if (!alive) return;
      if (error || !roleRow || !['astrologer','admin','super_admin'].includes(roleRow.role)) {
        setProfile(null);
        setErrorMsg('This Supabase account is not assigned an astrologer/admin role. Ask the administrator to assign access.');
        setLoading(false);
        return;
      }
      const p: AuthUserProfile = {
        uid: user.id, email: user.email || '', displayName: user.user_metadata?.full_name || user.email || 'Astrologer',
        role: roleRow.role, isAdmin: ['admin','super_admin'].includes(roleRow.role),
        isAstrologer: roleRow.role === 'astrologer' || ['admin','super_admin'].includes(roleRow.role)
      };
      setProfile(p);
      setLoading(false);
    };
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void loadProfile(session?.user || null); });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  // Fetch readers and match authenticated astrologer
  useEffect(() => {
    fetch('/api/readers')
      .then(res => res.json())
      .then(data => {
        if (data.readers && Array.isArray(data.readers)) {
          setAvailableReaders(data.readers);
          if (profile) {
            const userEmail = profile.email?.toLowerCase().trim();
            const matched = data.readers.find((r: Reader) => 
              (r as any).email?.toLowerCase() === userEmail ||
              r.name.toLowerCase().includes(profile.displayName?.toLowerCase() || '___')
            ) || data.readers[0];
            setMatchedReader(matched || null);
          }
        }
      })
      .catch(() => {});
  }, [profile]);

  // Copy Direct Astrologer Link
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lumsic.online';
    const link = `${origin}/astrologer/lumsic.online`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('Use your approved Supabase staff email and password to sign in.');
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg('Enter your Supabase staff email and password.'); return; }
    try {
      setErrorMsg(null); setSubmitting(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      const user = data.user;
      if (!user) throw new Error('Supabase did not return a user.');
      const { data: roleRow, error: roleError } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
      if (roleError || !roleRow || !['astrologer','admin','super_admin'].includes(roleRow.role)) {
        await supabase.auth.signOut();
        throw new Error('This account has no approved astrologer/admin role in Supabase.');
      }
      const readersResult = await supabase.from('readers').select('id,name,email,astro_id,public_data').ilike('email', user.email || '');
      const row = readersResult.data?.[0];
      if (row) {
        const publicData = row.public_data || {};
        setMatchedReader({ ...publicData, id: row.id, name: row.name, email: row.email, astroId: row.astro_id } as Reader);
      } else if (roleRow.role === 'astrologer') {
        await supabase.auth.signOut();
        throw new Error('No reader profile is linked to this email in Supabase.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Supabase sign-in failed.');
    } finally { setSubmitting(false); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null); setMatchedReader(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B19] flex flex-col items-center justify-center p-6 text-amber-100 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
          <Compass className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-amber-200/70">Connecting to Reader Workstation...</p>
        <span className="text-[11px] text-amber-400/60 mt-2 font-mono">astrologer/lumsic.online</span>
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

        <div className="w-full max-w-md bg-[#0C1226]/95 border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative backdrop-blur-2xl z-10">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-indigo-600/20 border border-amber-400/30 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase">Astroboard Portal</span>
            <h1 className="text-2xl font-black text-white font-serif tracking-tight mt-0.5">Astrologer Sanctuary</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Dedicated workstation for verified Vedic astrologers, tarot readers, and intuitive counselors.
            </p>
          </div>

          {/* Direct Link Badge */}
          <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-600/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <LinkIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Astrologer Workstation Direct Link</div>
                <div className="text-xs font-mono text-white font-semibold truncate">astrologer/lumsic.online</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy direct astrologer link to clipboard"
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}


          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or Astrologer ID</span>
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
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="astro.vera@astrodashboard.com or LYS-10001"
                  className="w-full pl-9 pr-3 py-2 bg-black/40 border border-amber-500/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-200/90 uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-black/40 border border-amber-500/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <ArrowRight className="w-4 h-4 text-black" />}
              <span>Enter Astrologer Workstation</span>
            </button>
          </form>


          {/* Footer Back to Site */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Direct Link: <strong className="text-amber-300 font-mono">astrologer/lumsic.online</strong></span>
            <button
              type="button"
              onClick={onBackToSite || (() => { window.location.href = '/'; })}
              className="text-amber-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </button>
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
              <span>Account Email:</span>
              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">{profile.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Role:</span>
              <span className="font-bold text-slate-300 uppercase">{profile.role}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Required:</span>
              <span className="font-bold text-amber-400 uppercase">ASTROLOGER WORKSTATION</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Sign Out &amp; Switch Account</span>
            </button>
            <button
              type="button"
              onClick={onBackToSite || (() => { window.location.href = '/'; })}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
            >
              <span>← Return to LUMSIC Sanctuary</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Astrologer! Render dashboard
  return (
    <div className="min-h-screen flex flex-col bg-[#070B19]">
      {/* Top Astrologer Status Bar */}
      <div className="bg-[#0A0F21] border-b border-amber-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100 z-50">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide text-amber-200">ASTROBOARD SECURE WORKSTATION</span>
            <span className="text-amber-500/50">|</span>
            <span className="text-slate-300 font-medium">Reader: {matchedReader?.name || profile.displayName}</span>
          </div>

          {/* Link Badge with 1-click copy */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <LinkIcon className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-amber-300 text-[11px]">astrologer/lumsic.online</span>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy direct astrologer link"
              className="text-amber-400 hover:text-white transition cursor-pointer ml-1"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-amber-300/80 hidden sm:inline">{profile.email}</span>

          {onBackToSite && (
            <button
              type="button"
              onClick={onBackToSite}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 font-semibold cursor-pointer transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Main Website</span>
            </button>
          )}

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
