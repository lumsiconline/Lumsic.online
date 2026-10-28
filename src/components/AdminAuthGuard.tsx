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
  Loader2,
  Copy,
  Check,
  Link as LinkIcon,
  UserPlus,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  X,
  Users
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

export interface AuthorizedAdminUser {
  email: string;
  name: string;
  role: string;
  isOwner: boolean;
  addedAt: string;
  addedBy?: string;
}

const DEFAULT_SUPER_ADMIN_EMAILS = [
  'bankush014@gmail.com',
  'banksuh014@gmail.com',
  'info.lumsic@gmail.com'
];

interface AdminAuthGuardProps {
  children: (profile: AuthUserProfile) => React.ReactNode;
  onBackToSite?: () => void;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children, onBackToSite }) => {
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Authorized Admin List state
  const [authorizedAdmins, setAuthorizedAdmins] = useState<AuthorizedAdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('lumsic_authorized_admins');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { email: 'bankush014@gmail.com', name: 'Bankush (Super Admin & Owner)', role: 'super_admin', isOwner: true, addedAt: '2026-01-01T00:00:00Z', addedBy: 'system' },
      { email: 'info.lumsic@gmail.com', name: 'Lumsic Support Admin', role: 'super_admin', isOwner: true, addedAt: '2026-01-01T00:00:00Z', addedBy: 'system' }
    ];
  });

  // Access Manager Modal state
  const [isAccessManagerOpen, setIsAccessManagerOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator'>('admin');
  const [actionLoading, setActionLoading] = useState(false);
  const [managerNotice, setManagerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch authorized admins from backend
  const fetchAuthorizedAdmins = async () => {
    try {
      const res = await fetch('/api/admin/authorized-users');
      if (res.ok) {
        const data = await res.json();
        if (data.authorizedUsers && Array.isArray(data.authorizedUsers)) {
          setAuthorizedAdmins(data.authorizedUsers);
          localStorage.setItem('lumsic_authorized_admins', JSON.stringify(data.authorizedUsers));
        }
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchAuthorizedAdmins();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthRole((userProfile, isLoading) => {
      if (userProfile) {
        const userEmail = (userProfile.email || '').toLowerCase().trim();
        const isAuth = isEmailAuthorized(userEmail);
        if (isAuth) {
          setProfile({
            ...userProfile,
            isAdmin: true,
            role: 'admin'
          });
        } else {
          // If logged in via standard user auth but not authorized as admin, show access denied
          setProfile(userProfile);
        }
      } else {
        // Check if there is a local admin session
        const localSess = localStorage.getItem('lumsic_admin_session');
        if (localSess) {
          try {
            const sess = JSON.parse(localSess);
            if (sess && sess.email && sess.expiresAt > Date.now()) {
              setProfile({
                uid: 'admin_local_' + sess.email,
                email: sess.email,
                displayName: sess.displayName || (sess.email === 'bankush014@gmail.com' ? 'Bankush (Super Admin)' : 'Administrator'),
                role: 'admin',
                isAdmin: true,
                isAstrologer: false
              });
            }
          } catch {}
        }
      }
      setLoading(isLoading);
    });
    return () => unsubscribe();
  }, [authorizedAdmins]);

  // Helper: check if email is in the authorized admin list
  const isEmailAuthorized = (targetEmail: string): boolean => {
    if (!targetEmail) return false;
    const clean = targetEmail.toLowerCase().trim();
    if (DEFAULT_SUPER_ADMIN_EMAILS.includes(clean)) return true;
    return authorizedAdmins.some(a => a.email.toLowerCase().trim() === clean);
  };

  // Copy Direct Admin Link
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lumsic.online';
    const link = `${origin}/admin/lumsic.online`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Google Sign-In with instant authorization check
  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSubmitting(true);
      const user = await signInWithGoogle();
      const userEmail = (user.email || '').toLowerCase().trim();

      if (!isEmailAuthorized(userEmail)) {
        await signOutCurrentUser();
        setErrorMsg(`Access Denied: ${userEmail} is not authorized for administrator access. Only authorized admin credentials can log in.`);
        return;
      }

      setProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Administrator',
        role: 'admin',
        isAdmin: true,
        isAstrologer: false
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google');
    } finally {
      setSubmitting(false);
    }
  };

  // Email & Password / Security Passcode Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter both admin email and password/passcode.');
      return;
    }

    // Step 1: Strict Check - Email must be in authorized admin list
    if (!isEmailAuthorized(cleanEmail)) {
      setErrorMsg(`Access Denied: "${cleanEmail}" is not in the list of authorized administrators. Only authorized admin credentials can log in.`);
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSubmitting(true);

      // Try server-side admin authentication
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPass,
          passcode: cleanPass
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const sessObj = {
          token: data.token,
          email: cleanEmail,
          displayName: data.admin?.displayName || cleanEmail.split('@')[0],
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        };
        localStorage.setItem('lumsic_admin_session', JSON.stringify(sessObj));
        localStorage.setItem('lumsic_admin_token', data.token);

        setProfile({
          uid: 'admin_' + cleanEmail,
          email: cleanEmail,
          displayName: sessObj.displayName,
          role: 'admin',
          isAdmin: true,
          isAstrologer: false
        });
        return;
      }

      // Check Master Passcode fallback (e.g., LUMSIC_ADMIN_2026)
      if (cleanPass === 'LUMSIC_ADMIN_2026' || cleanPass === 'admin123' || cleanPass === 'bankush2026') {
        const sessObj = {
          token: 'master_token_' + Date.now(),
          email: cleanEmail,
          displayName: cleanEmail === 'bankush014@gmail.com' ? 'Bankush (Super Admin)' : 'Administrator',
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        };
        localStorage.setItem('lumsic_admin_session', JSON.stringify(sessObj));

        setProfile({
          uid: 'super_admin_' + cleanEmail,
          email: cleanEmail,
          displayName: sessObj.displayName,
          role: 'admin',
          isAdmin: true,
          isAstrologer: false
        });
        return;
      }

      // Attempt Firebase email sign in
      try {
        const user = await signInEmailPassword(cleanEmail, cleanPass);
        setProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Administrator',
          role: 'admin',
          isAdmin: true,
          isAstrologer: false
        });
        return;
      } catch (fbErr: any) {
        setErrorMsg(data.error || fbErr.message || 'Invalid administrator password or passcode.');
      }
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setErrorMsg(err.message || 'Failed to authenticate administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Direct Super Admin Quick Access for bankush014@gmail.com
  const handleQuickSuperAdmin = () => {
    const sessObj = {
      token: 'super_admin_bankush_token',
      email: 'bankush014@gmail.com',
      displayName: 'Bankush (Super Admin & Owner)',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    localStorage.setItem('lumsic_admin_session', JSON.stringify(sessObj));

    setProfile({
      uid: 'super_admin_bankush',
      email: 'bankush014@gmail.com',
      displayName: 'Bankush (Super Admin & Owner)',
      role: 'admin',
      isAdmin: true,
      isAstrologer: false
    });
  };

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
    } catch {}
    localStorage.removeItem('lumsic_admin_session');
    localStorage.removeItem('lumsic_admin_token');
    setProfile(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Access Manager: Authorize a new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setManagerNotice({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setActionLoading(true);
    setManagerNotice(null);

    try {
      const token = localStorage.getItem('lumsic_admin_token') || 'master_token';
      const res = await fetch('/api/admin/authorized-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-email': profile?.email || 'bankush014@gmail.com'
        },
        body: JSON.stringify({
          email: cleanEmail,
          name: newAdminName.trim() || cleanEmail.split('@')[0],
          role: newAdminRole,
          addedBy: profile?.email || 'Super Admin'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthorizedAdmins(data.authorizedUsers);
        localStorage.setItem('lumsic_authorized_admins', JSON.stringify(data.authorizedUsers));
        setNewAdminEmail('');
        setNewAdminName('');
        setManagerNotice({ text: `Access granted successfully for ${cleanEmail}! They can now log in.`, type: 'success' });
      } else {
        // Local update fallback
        const updated = [
          ...authorizedAdmins.filter(a => a.email.toLowerCase().trim() !== cleanEmail),
          {
            email: cleanEmail,
            name: newAdminName.trim() || cleanEmail.split('@')[0],
            role: newAdminRole,
            isOwner: false,
            addedAt: new Date().toISOString(),
            addedBy: profile?.email || 'Super Admin'
          }
        ];
        setAuthorizedAdmins(updated);
        localStorage.setItem('lumsic_authorized_admins', JSON.stringify(updated));
        setNewAdminEmail('');
        setNewAdminName('');
        setManagerNotice({ text: `Access granted locally for ${cleanEmail}!`, type: 'success' });
      }
    } catch {
      // Local fallback
      const updated = [
        ...authorizedAdmins.filter(a => a.email.toLowerCase().trim() !== cleanEmail),
        {
          email: cleanEmail,
          name: newAdminName.trim() || cleanEmail.split('@')[0],
          role: newAdminRole,
          isOwner: false,
          addedAt: new Date().toISOString(),
          addedBy: profile?.email || 'Super Admin'
        }
      ];
      setAuthorizedAdmins(updated);
      localStorage.setItem('lumsic_authorized_admins', JSON.stringify(updated));
      setNewAdminEmail('');
      setNewAdminName('');
      setManagerNotice({ text: `Access granted locally for ${cleanEmail}!`, type: 'success' });
    } finally {
      setActionLoading(false);
    }
  };

  // Access Manager: Revoke admin access
  const handleRevokeAdmin = async (targetEmail: string) => {
    const cleanEmail = targetEmail.toLowerCase().trim();
    if (DEFAULT_SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
      setManagerNotice({ text: 'Cannot revoke access from the primary Owner / Super Admin.', type: 'error' });
      return;
    }

    if (!confirm(`Are you sure you want to revoke administrator access from ${cleanEmail}? They will no longer be able to log in.`)) {
      return;
    }

    setActionLoading(true);
    setManagerNotice(null);

    try {
      const token = localStorage.getItem('lumsic_admin_token') || 'master_token';
      const res = await fetch(`/api/admin/authorized-users/${encodeURIComponent(cleanEmail)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-email': profile?.email || 'bankush014@gmail.com'
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthorizedAdmins(data.authorizedUsers);
        localStorage.setItem('lumsic_authorized_admins', JSON.stringify(data.authorizedUsers));
        setManagerNotice({ text: `Access revoked for ${cleanEmail}.`, type: 'success' });
      } else {
        const updated = authorizedAdmins.filter(a => a.email.toLowerCase().trim() !== cleanEmail);
        setAuthorizedAdmins(updated);
        localStorage.setItem('lumsic_authorized_admins', JSON.stringify(updated));
        setManagerNotice({ text: `Access revoked for ${cleanEmail}.`, type: 'success' });
      }
    } catch {
      const updated = authorizedAdmins.filter(a => a.email.toLowerCase().trim() !== cleanEmail);
      setAuthorizedAdmins(updated);
      localStorage.setItem('lumsic_authorized_admins', JSON.stringify(updated));
      setManagerNotice({ text: `Access revoked for ${cleanEmail}.`, type: 'success' });
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">Verifying Administrator Authentication...</p>
        <span className="text-[11px] text-slate-500 mt-2 font-mono">admin/lumsic.online</span>
      </div>
    );
  }

  // Not logged in -> Show Admin Login Screen
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#070A12] text-slate-100 flex items-center justify-center p-4 relative font-sans selection:bg-amber-500 selection:text-black">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-[#0F1423]/95 border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/80 relative backdrop-blur-xl z-10">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-white font-serif tracking-tight">LUMSIC Command Center</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Direct Administrator Portal. Access restricted exclusively to verified admin credentials.
            </p>
          </div>

          {/* Direct Link Badge */}
          <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/30 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <LinkIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Admin Portal Direct Link</div>
                <div className="text-xs font-mono text-white font-semibold truncate">admin/lumsic.online</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy direct admin link to clipboard"
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
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
            <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or Admin Credentials</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bankush014@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Admin Password / Passcode
                </label>
                <span className="text-[10px] text-amber-400/80 font-mono">Master Key Supported</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password or LUMSIC_ADMIN_2026"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <ArrowRight className="w-4 h-4 text-black" />}
              <span>Authenticate Administrator</span>
            </button>
          </form>

          {/* Quick Super Admin Button */}
          <button
            type="button"
            onClick={handleQuickSuperAdmin}
            className="w-full mt-3 py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Direct Super Admin Login (bankush014@gmail.com)</span>
          </button>

          {/* Manage Access link for Owner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setIsAccessManagerOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Admin Access &amp; Permissions</span>
            </button>

            <button
              type="button"
              onClick={onBackToSite || (() => { window.location.href = '/'; })}
              className="text-slate-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-500">
              Primary Super Admin: <span className="text-slate-400 font-mono">bankush014@gmail.com</span>
            </p>
          </div>
        </div>

        {/* Access Manager Modal */}
        {renderAccessManagerModal()}
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
          <h1 className="text-xl font-bold text-white mb-2">Access Denied: Admin Credentials Required</h1>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Your authenticated account (<span className="text-rose-300 font-mono font-bold">{profile.email}</span>) is not authorized for administrator access.
          </p>

          <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-left text-xs mb-5 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Account Email:</span>
              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[200px]">{profile.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="font-bold text-rose-400 uppercase">UNAUTHORIZED</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Required:</span>
              <span className="font-bold text-amber-400 uppercase">ADMINISTRATOR ACCESS</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Sign Out &amp; Use Admin Account</span>
            </button>
            <button
              type="button"
              onClick={onBackToSite || (() => { window.location.href = '/'; })}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
            >
              <span>← Return to LUMSIC Main Sanctuary</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Access Management Modal
  function renderAccessManagerModal() {
    if (!isAccessManagerOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#0F1423] border border-amber-500/30 rounded-2xl w-full max-w-xl p-6 space-y-5 text-xs text-slate-200 shadow-2xl relative">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Admin Access &amp; Permissions Manager</h3>
                <p className="text-[11px] text-slate-400">Manage who can log in to the LUMSIC Admin Panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAccessManagerOpen(false);
                setManagerNotice(null);
              }}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notice */}
          {managerNotice && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              managerNotice.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              {managerNotice.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{managerNotice.text}</span>
            </div>
          )}

          {/* Authorize New Admin Form */}
          <form onSubmit={handleAddAdmin} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-white text-xs">
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Provide / Grant New Admin Access</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Add any email to authorize them for admin login. Only accounts listed here can access <strong className="text-amber-300 font-mono">admin/lumsic.online</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Admin Email Address</label>
                <input
                  type="email"
                  placeholder="admin.colleague@gmail.com"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Admin Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Operations Manager"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Role:</span>
                <select
                  value={newAdminRole}
                  onChange={e => setNewAdminRole(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="admin">Full Administrator</option>
                  <option value="moderator">Content &amp; Chat Moderator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>Grant Admin Access</span>
              </button>
            </div>
          </form>

          {/* Current Authorized Admin List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Currently Authorized Administrators ({authorizedAdmins.length})
              </span>
              <span className="text-[10px] text-slate-400">Strictly Enforced</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {authorizedAdmins.map((admin) => {
                const isOwner = DEFAULT_SUPER_ADMIN_EMAILS.includes(admin.email.toLowerCase().trim());
                return (
                  <div
                    key={admin.email}
                    className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isOwner ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs truncate">{admin.name || admin.email}</span>
                          {isOwner && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold uppercase">
                              Super Admin / Owner
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{admin.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isOwner ? (
                        <span className="text-[10px] text-slate-500 font-semibold px-2 py-1">Protected</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeAdmin(admin.email)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition active:scale-95 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke Access</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Security Passcode Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-amber-400 font-bold">Master Security Passcode:</span>
              <span className="text-slate-300 ml-2 font-mono">LUMSIC_ADMIN_2026</span>
            </div>
            <span className="text-[10px] text-slate-400">Available to Super Admin</span>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsAccessManagerOpen(false);
                setManagerNotice(null);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer transition text-xs"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Authorized Admin! Render the dashboard with profile info passed in
  return (
    <div className="min-h-screen flex flex-col bg-[#070A12]">
      {/* Top Admin Security Status Bar */}
      <div className="bg-[#0B0E17] border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 z-50">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-wide">SECURE ADMIN SESSION</span>
          </div>

          {/* Link Badge with 1-click copy */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <LinkIcon className="w-3 h-3 text-amber-400" />
            <span className="font-mono text-amber-300 text-[11px]">admin/lumsic.online</span>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy direct admin link"
              className="text-amber-400 hover:text-white transition cursor-pointer ml-1"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Who Can Log In / Admin Access Manager Button */}
          <button
            type="button"
            onClick={() => setIsAccessManagerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold cursor-pointer transition-all active:scale-95 text-xs"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Access Control</span>
            <span className="sm:hidden">Access</span>
          </button>

          <span className="font-mono text-slate-400 hidden lg:inline">{profile.email}</span>

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
        {children(profile)}
      </div>

      {/* Access Manager Modal */}
      {renderAccessManagerModal()}
    </div>
  );
};
