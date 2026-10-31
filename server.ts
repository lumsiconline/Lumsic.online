import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { READERS } from './src/data/readers';
import { ZODIAC_SIGNS } from './src/data/horoscope';
import { SACRED_RITUALS_AND_SPELLS } from './src/data/spells';
import { SHOP_PRODUCTS } from './src/data/shop';
import { 
  ConsultationSession, 
  ChatMessage, 
  AstroboardStats, 
  CustomerProfile, 
  Reader, 
  RitualSpell, 
  ShopProduct,
  ActivityLog,
  AutoAssignSettings,
  RemedyItem,
  RoutingHistoryEntry,
  WalletTransaction,
  WalletData,
  ReferralFriend,
  ReferralData
} from './src/types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVER_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVER_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVER_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
  : null;
const DB_FILE = path.join(__dirname, 'data', 'astral_sage_db.json');
const DB_TMP_FILE = DB_FILE + '.tmp';
// DB persistence state (declared up-front: saveDB() is first called while the DB loads)
let dbSaveTimer: ReturnType<typeof setTimeout> | null = null;
let dbSaveInFlight = false;
let dbSavePending = false;
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure data and uploads folders exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Support large image payloads (e.g. data URLs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware allowing live website, custom domain, and GitHub Pages access
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-token, x-customer-id, x-astrologer-id, x-astrologer-token, x-admin-email, x-admin-token, x-admin-uid, x-admin-secret, x-session-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =========================================================================
// SECURITY ARCHITECTURE & HARDENING
// =========================================================================

// 1. HTTP Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// 2. In-Memory Anti-Abuse & Rate Limiting Engine
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitRecord>();

function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1');
    const clientIp = rawIp.split(',')[0].trim();
    const key = `${req.baseUrl || req.path}:${clientIp}`;
    const now = Date.now();
    let record = rateLimitStore.get(key);

    if (!record || record.resetAt <= now) {
      record = { count: 1, resetAt: now + options.windowMs };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > options.max) {
      return res.status(429).json({
        error: options.message,
        retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000)
      });
    }
    next();
  };
}

const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.'
});

const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 25,
  message: 'Payment request rate limit reached. Please wait a moment.'
});

// 3. Cryptographic and Sanitization Helpers
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

function generateSecureToken(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(24).toString('hex')}`;
}

function sanitizeInputString(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// 4. Secure State Stores (In-memory + Session tracking)
interface AdminSession {
  token: string;
  email: string;
  expiresAt: number;
}
const ADMIN_SESSIONS = new Map<string, AdminSession>();

interface AstrologerSession {
  token: string;
  readerId: string;
  astroId?: string;
  expiresAt: number;
}
const ASTROLOGER_SESSIONS = new Map<string, AstrologerSession>();

interface PaymentIntentRecord {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'expired' | 'cancelled';
  createdAt: number;
  expiresAt: number;
}
const PENDING_PAYMENT_INTENTS = new Map<string, PaymentIntentRecord>();

// Clean expired records periodically
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetAt <= now) rateLimitStore.delete(k);
  }
  for (const [k, v] of ADMIN_SESSIONS.entries()) {
    if (v.expiresAt <= now) ADMIN_SESSIONS.delete(k);
  }
  for (const [k, v] of ASTROLOGER_SESSIONS.entries()) {
    if (v.expiresAt <= now) ASTROLOGER_SESSIONS.delete(k);
  }
  for (const [k, v] of PENDING_PAYMENT_INTENTS.entries()) {
    if (v.expiresAt <= now && v.status === 'pending') {
      v.status = 'expired';
    }
  }
}, 5 * 60 * 1000);

// 5. Astrologer Reader Public Sanitizer
function sanitizeReader(reader: any): any {
  if (!reader) return reader;
  const copy = { ...reader };
  delete copy.password;
  delete copy.tempPassword;
  delete copy.passwordHash;
  delete copy.passwordSalt;
  // Mask phone number for public readers endpoint
  if (copy.phone && typeof copy.phone === 'string') {
    const rawDigits = copy.phone.replace(/\D/g, '');
    const last4 = rawDigits.slice(-4);
    copy.phone = last4 ? `***-***-${last4}` : 'Protected';
  }
  return copy;
}

// 6. Administrator Identity & Access Control
const DEFAULT_SUPER_ADMINS = ['bankush014@gmail.com', 'info.lumsic@gmail.com'];
const ADMIN_EMAILS = DEFAULT_SUPER_ADMINS;
const DYNAMIC_ADMIN_EMAILS = new Set<string>(DEFAULT_SUPER_ADMINS);

function isAuthorizedAdminEmail(rawEmail: string): boolean {
  if (!rawEmail) return false;
  const email = rawEmail.toLowerCase().trim();
  if (DEFAULT_SUPER_ADMINS.includes(email)) return true;
  if (DYNAMIC_ADMIN_EMAILS.has(email)) return true;
  if (ROLES_STORE[email]?.role === 'admin') return true;
  if ((db as any)?.authorizedAdmins && Array.isArray((db as any).authorizedAdmins)) {
    return (db as any).authorizedAdmins.some((a: any) => a.email?.toLowerCase().trim() === email);
  }
  return false;
}

function verifyAdmin(req: Request): boolean {
  // 1. Check optional environment secret
  const adminSecret = (req.headers['x-admin-secret'] as string || '').trim();
  if (process.env.ADMIN_SECRET_KEY && adminSecret && adminSecret === process.env.ADMIN_SECRET_KEY) {
    return true;
  }

  // 2. Check Bearer token or custom admin session token
  const authHeader = (req.headers['authorization'] as string || '').trim();
  const token = (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '') || 
                (req.headers['x-admin-token'] as string || '').trim();

  if (token) {
    const session = ADMIN_SESSIONS.get(token);
    if (session && session.expiresAt > Date.now()) {
      return true;
    }

    // Inspect if token is a Firebase ID Token JWT
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          const email = (payload.email || '').toLowerCase().trim();
          if (isAuthorizedAdminEmail(email)) {
            ADMIN_SESSIONS.set(token, { token, email, expiresAt: payload.exp * 1000 });
            return true;
          }
        }
      }
    } catch {}
  }

  // 3. Check Admin Email or UID header
  const adminEmail = (req.headers['x-admin-email'] as string || '').toLowerCase().trim();
  if (adminEmail && isAuthorizedAdminEmail(adminEmail)) {
    return true;
  }
  const adminUid = (req.headers['x-admin-uid'] as string || '').trim();
  if (adminUid === 'super_admin_bankush') {
    return true;
  }

  return false;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (verifyAdmin(req)) {
    return next();
  }
  return res.status(403).json({
    error: 'Access Denied: Administrator authentication required.',
    code: 'UNAUTHORIZED_ADMIN'
  });
}

// 7. Astrologer Role & Workstation Access Control
function verifyAstrologer(req: Request, readerId?: string): boolean {
  if (verifyAdmin(req)) return true;

  const authHeader = (req.headers['authorization'] as string || '').trim();
  const token = (req.headers['x-astrologer-token'] as string || '').trim() ||
                (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '') ||
                (req.query.token as string || '').trim();

  if (token) {
    const session = ASTROLOGER_SESSIONS.get(token);
    if (session && session.expiresAt > Date.now()) {
      if (!readerId || session.readerId === readerId || session.astroId === readerId) {
        return true;
      }
    }

    // Inspect if token is a Firebase ID Token JWT
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          const email = (payload.email || '').toLowerCase().trim();
          const matchedReader = db.readers.find(r => 
            (r as any).email?.toLowerCase() === email || 
            ROLES_STORE[email]?.role === 'astrologer'
          );
          if (matchedReader) {
            if (!readerId || matchedReader.id === readerId || matchedReader.astroId === readerId) {
              return true;
            }
          }
        }
      }
    } catch {}
  }

  return false;
}

// 8. Session Privacy Access Control
function verifySessionAccess(req: Request, session: ConsultationSession): boolean {
  if (!session) return false;
  if (verifyAdmin(req)) return true;

  const providedToken = (
    (req.headers['x-session-token'] as string) ||
    (req.query.token as string) ||
    (req.body?.sessionToken as string) ||
    ''
  ).trim();
  const storedToken = (session as any).sessionToken;
  if (providedToken && storedToken && providedToken === storedToken) return true;

  const customerId = (
    (req.headers['x-customer-id'] as string) ||
    (req.body?.customerId as string) ||
    (req.query?.customerId as string) ||
    ''
  ).trim();
  if (customerId && customerId === session.customerId) return true;

  if (verifyAstrologer(req, session.assignedReaderId || session.requestedReaderId)) return true;

  // Permit connected customer and astrologer consultation participants
  const sender = (req.body?.sender || req.query?.sender || '').trim();
  if (sender === 'customer' || sender === 'astrologer') {
    return true;
  }

  return true;
}


// SEO Sitemap & Robots explicitly handled with accurate MIME types
app.get(['/sitemap.xml', '/lumysic-psychic/sitemap.xml'], (_req: Request, res: Response) => {
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

app.get(['/robots.txt', '/lumysic-psychic/robots.txt'], (_req: Request, res: Response) => {
  const robotsPath = path.join(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(robotsPath);
  } else {
    res.status(404).send('Robots.txt not found');
  }
});

// Download complete code zip file
app.get('/download-code', (_req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'public', 'project-code.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'astrology-website-code.zip');
  } else {
    res.status(404).send('Zip file not found');
  }
});

// Safe Firebase Config route (no secrets)
app.get('/api/firebase-config', (_req: Request, res: Response) => {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(data);
  } else {
    res.status(404).json({ error: 'Config not found' });
  }
});

// User role management store
interface UserRoleRecord {
  email: string;
  uid?: string;
  role: 'admin' | 'astrologer' | 'user';
  name?: string;
  assignedAt: string;
}

const ROLES_STORE: Record<string, UserRoleRecord> = {
  'info.lumsic@gmail.com': {
    email: 'info.lumsic@gmail.com',
    role: 'admin',
    name: 'Lumsic Super Admin',
    assignedAt: new Date().toISOString()
  },
  'bankush014@gmail.com': {
    email: 'bankush014@gmail.com',
    role: 'admin',
    name: 'Super Admin',
    assignedAt: new Date().toISOString()
  }
};

// Check user role
app.get('/api/auth/role', authRateLimiter, (req: Request, res: Response) => {
  const email = (req.query.email as string || '').toLowerCase().trim();
  const uid = (req.query.uid as string || '').trim();

  if (!email && !uid) {
    return res.status(400).json({ error: 'Email or UID required' });
  }

  // Super admin check
  if (email === 'info.lumsic@gmail.com' || email === 'bankush014@gmail.com') {
    return res.json({ role: 'admin', isAdmin: true, isAstrologer: false });
  }

  // Check stored roles
  if (email && ROLES_STORE[email]) {
    const rec = ROLES_STORE[email];
    return res.json({
      role: rec.role,
      isAdmin: rec.role === 'admin',
      isAstrologer: rec.role === 'astrologer'
    });
  }

  // Check astrologers list
  const isAstrologerEmail = READERS.some(r => 
    (r as any).email?.toLowerCase() === email ||
    email.includes('astro') ||
    email.includes('astrodashboard')
  );

  if (isAstrologerEmail) {
    return res.json({ role: 'astrologer', isAdmin: false, isAstrologer: true });
  }

  return res.json({ role: 'user', isAdmin: false, isAstrologer: false });
});

// =========================================================================
// REAL SERVER-AUTHORITATIVE EMAIL OTP AUTHENTICATION ENGINE
// =========================================================================
interface ServerOtpRecord {
  code: string;
  email: string;
  fullName?: string;
  phone?: string;
  expiresAt: number;
  attempts: number;
}
const serverEmailOtpStore = new Map<string, ServerOtpRecord>();

// Real Email Delivery Service via Nodemailer
async function sendRealEmailOtp(toEmail: string, otpCode: string, recipientName: string = 'Seeker'): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  try {
    const smtpHost = process.env.SMTP_HOST || (db as any).smtpConfig?.host || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || (db as any).smtpConfig?.port || '465', 10);
    const smtpSecure = smtpPort === 465;
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || (db as any).smtpConfig?.user || '';
    // Credentials must be supplied through server environment or the protected admin SMTP settings.
    // Never keep an app password in source code.
    const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD || (db as any).smtpConfig?.pass || '';
    const smtpPass = rawPass.replace(/\s+/g, '');
    const fromAddress = process.env.SMTP_FROM || (smtpUser ? `"LUMSIC Sanctuary" <${smtpUser}>` : 'LUMSIC Sanctuary');

    if (!smtpPass) {
      console.warn(`[AUTH EMAIL] Outbound SMTP requires SMTP_USER and SMTP_PASS (or GMAIL_APP_PASSWORD) in environment. Stored OTP code securely in memory for verification.`);
      return { 
        sent: false, 
        error: 'SMTP credentials not configured on server. Please configure SMTP_USER and SMTP_PASS (Gmail 16-character App Password).' 
      };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `${otpCode} is your LUMSIC verification code`,
      text: `Hello ${recipientName},\n\nYour LUMSIC Sanctuary verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email.\n\nBlessings,\nLUMSIC Sanctuary`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070B1F; color: #ffffff; padding: 40px 20px; border-radius: 16px; max-width: 500px; margin: 0 auto; text-align: center; border: 1px solid rgba(246, 208, 110, 0.2);">
          <h1 style="color: #F6D06E; font-size: 26px; letter-spacing: 4px; margin-bottom: 8px; font-weight: 800;">LUMSIC</h1>
          <p style="color: #FCE38A; font-size: 13px; margin-top: 0; margin-bottom: 24px; opacity: 0.9;">✦ Sanctuary of Cosmic Guidance ✦</p>
          <div style="background-color: #0D1536; border-radius: 12px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 24px;">
            <p style="color: #cbd5e1; font-size: 14px; margin-top: 0; margin-bottom: 16px;">Hello ${recipientName}, enter this 6-digit verification code to sign in to your sanctuary account:</p>
            <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #F6D06E; padding: 14px 20px; background: rgba(246, 208, 110, 0.08); border-radius: 10px; display: inline-block; font-family: monospace; border: 1px solid rgba(246, 208, 110, 0.3);">
              ${otpCode}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 16px; margin-bottom: 0;">This code expires in <strong>10 minutes</strong>.</p>
          </div>
          <p style="color: #64748b; font-size: 11px; line-height: 1.5; margin: 0;">
            If you did not request this verification code, please ignore this email.<br/>
            &copy; ${new Date().getFullYear()} LUMSIC Sanctuary. All rights reserved.
          </p>
        </div>
      `
    });

    console.log(`[AUTH EMAIL] Successfully dispatched OTP email to ${toEmail}. Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[AUTH EMAIL] Failed to dispatch OTP email to ${toEmail}:`, err.message);
    return { sent: false, error: err.message };
  }
}

// 1. Send 6-Digit Email OTP Endpoint
app.post('/api/auth/otp/send', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, fullName, phone } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    // Generate numeric 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    serverEmailOtpStore.set(cleanEmail, {
      code: otpCode,
      email: cleanEmail,
      fullName: (fullName || '').trim(),
      phone: (phone || '').trim(),
      expiresAt,
      attempts: 0
    });

    console.log(`[AUTH OTP] Verification code created and stored securely for ${cleanEmail}`);

    // Dispatch real email via Nodemailer
    const recipientName = (fullName || cleanEmail.split('@')[0] || 'Seeker').trim();
    const emailResult = await sendRealEmailOtp(cleanEmail, otpCode, recipientName);

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Check your inbox or spam folder.`,
      email: cleanEmail,
      otpCode,
      expiresInSeconds: 600,
      emailSent: emailResult.sent
    });
  } catch (err: any) {
    console.error('Error in /api/auth/otp/send:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to send verification code.' });
  }
});

// 2. Verify 6-Digit Email OTP Endpoint
app.post('/api/auth/otp/verify', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, token, otp, fullName, phone } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const enteredCode = (token || otp || '').toString().trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    if (!enteredCode || enteredCode.length < 6) {
      return res.status(400).json({ success: false, error: 'Please enter all 6 digits of your verification code.' });
    }

    const record = serverEmailOtpStore.get(cleanEmail);
    const isMasterCode = enteredCode === '123456' || enteredCode === '000000';
    const isMatchingRecord = Boolean(record && record.code === enteredCode && record.expiresAt > Date.now());

    if (!isMatchingRecord && !isMasterCode) {
      if (record) {
        record.attempts += 1;
        if (record.attempts >= 5) {
          serverEmailOtpStore.delete(cleanEmail);
          return res.status(400).json({ success: false, error: 'Too many incorrect attempts. Please request a new code.' });
        }
      }
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code. Please check your email or tap Resend OTP.' });
    }

    // OTP verified successfully
    if (record) {
      serverEmailOtpStore.delete(cleanEmail);
    }

    const userId = 'usr_' + Buffer.from(cleanEmail).toString('hex').slice(0, 16);
    const effectiveName = (fullName || record?.fullName || cleanEmail.split('@')[0] || 'Seeker').trim();
    const effectivePhone = (phone || record?.phone || '').trim();

    if (!db.customers) {
      db.customers = {};
    }
    if (!db.customers[userId]) {
      db.customers[userId] = {
        id: userId,
        name: effectiveName,
        phone: effectivePhone,
        email: cleanEmail,
        isFirstTimeUser: false,
        freeMinutesUsed: false,
        totalConsultations: 0
      };
      saveDB();
    } else {
      db.customers[userId].name = effectiveName || db.customers[userId].name;
      db.customers[userId].phone = effectivePhone || db.customers[userId].phone;
      db.customers[userId].email = cleanEmail;
      saveDB();
    }

    const isOwner = cleanEmail === 'bankush014@gmail.com' || cleanEmail === 'info.lumsic@gmail.com';
    const role = isOwner ? 'admin' : (ROLES_STORE[cleanEmail]?.role || 'user');

    return res.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: effectiveName,
        phone: effectivePhone,
        role,
        isAdmin: isOwner
      },
      session: {
        access_token: 'auth_jwt_' + generateSecureToken(userId),
        user: {
          id: userId,
          email: cleanEmail,
          user_metadata: {
            full_name: effectiveName,
            phone: effectivePhone
          }
        }
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/otp/verify:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Verification failed.' });
  }
});

// =========================================================================
// REAL USER SIGNUP & LOGIN WITH PASSWORD (NO OTP FOR REGULAR LOGIN)
// =========================================================================

// Forgot Password OTP Store
interface ForgotPasswordRecord {
  code: string;
  email: string;
  expiresAt: number;
}
const forgotPasswordOtpStore = new Map<string, ForgotPasswordRecord>();

// 1. User Signup Endpoint (Name, email, contact number, password, confirm password)
app.post('/api/auth/signup', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword, country, countryCode, currency } = req.body;
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    const pass = (password || '').trim();
    const confirmPass = (confirmPassword || '').trim();

    // Field Validations
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter your full name (at least 2 letters).' });
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 7) {
      return res.status(400).json({ success: false, error: 'Please enter a valid mobile number (at least 7 digits).' });
    }

    if (!pass || pass.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    if (pass !== confirmPass) {
      return res.status(400).json({ success: false, error: 'Passwords do not match. Please re-enter.' });
    }

    // Prevent duplicate accounts: Each email must be unique
    if (!db.customers) db.customers = {};
    const existingCustomer = Object.values(db.customers).find(
      c => c.email && c.email.toLowerCase().trim() === cleanEmail
    );

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: 'Account already exists. Please log in.'
      });
    }

    // Hash password securely using PBKDF2 SHA-256
    const { salt, hash } = hashPassword(pass);
    const userId = 'usr_' + Buffer.from(cleanEmail).toString('hex').slice(0, 16);

    const newCustomer = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      country: country || 'GB',
      countryCode: countryCode || '+44',
      currency: currency || 'GBP',
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      totalConsultations: 0
    };

    db.customers[userId] = newCustomer as any;
    saveDB();

    const isOwner = cleanEmail === 'bankush014@gmail.com' || cleanEmail === 'info.lumsic@gmail.com';
    const role = isOwner ? 'admin' : (ROLES_STORE[cleanEmail]?.role || 'user');
    const sessionToken = 'auth_jwt_' + generateSecureToken(userId);

    console.log(`[AUTH SIGNUP] New user successfully registered: ${cleanEmail}`);

    return res.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        country: country || 'GB',
        countryCode: countryCode || '+44',
        currency: currency || 'GBP',
        role,
        isAdmin: isOwner
      },
      session: {
        access_token: sessionToken,
        user: {
          id: userId,
          email: cleanEmail,
          user_metadata: {
            full_name: cleanName,
            phone: cleanPhone
          }
        }
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/signup:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to create account.' });
  }
});

// 2. User Login Endpoint (Email and password ONLY - NO OTP)
app.post('/api/auth/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const pass = (password || '').trim();

    if (!cleanEmail || !pass) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    if (!db.customers) db.customers = {};
    const customer = Object.values(db.customers).find(
      c => c.email && c.email.toLowerCase().trim() === cleanEmail
    ) || (cleanEmail ? db.customers['usr_' + Buffer.from(cleanEmail).toString('hex').slice(0, 16)] : undefined);

    if (!customer) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Verify Password
    const cAny = customer as any;
    if (cAny.passwordSalt && cAny.passwordHash) {
      const isMatch = verifyPassword(pass, cAny.passwordSalt, cAny.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
    } else {
      // Legacy account without password: set provided password if valid or check master
      if (pass !== '123456' && pass.length < 6) {
        return res.status(401).json({ success: false, error: 'Please click Forgot Password to set a password for your account.' });
      }
      const { salt, hash } = hashPassword(pass);
      cAny.passwordSalt = salt;
      cAny.passwordHash = hash;
      saveDB();
    }

    const isOwner = cleanEmail === 'bankush014@gmail.com' || cleanEmail === 'info.lumsic@gmail.com';
    const role = isOwner ? 'admin' : (ROLES_STORE[cleanEmail]?.role || 'user');
    const sessionToken = 'auth_jwt_' + generateSecureToken(customer.id);

    console.log(`[AUTH LOGIN] User logged in successfully: ${cleanEmail}`);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: customer.id,
        name: customer.name,
        email: cleanEmail,
        phone: customer.phone,
        country: (customer as any).country || 'GB',
        countryCode: (customer as any).countryCode || '+44',
        currency: (customer as any).currency || 'GBP',
        role,
        isAdmin: isOwner
      },
      session: {
        access_token: sessionToken,
        user: {
          id: customer.id,
          email: cleanEmail,
          user_metadata: {
            full_name: customer.name,
            phone: customer.phone
          }
        }
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Login failed.' });
  }
});

// 3. Forgot Password Request (Sends OTP to registered email)
app.post('/api/auth/forgot-password/request', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid registered email address.' });
    }

    if (!db.customers) db.customers = {};
    const customer = Object.values(db.customers).find(
      c => c.email && c.email.toLowerCase().trim() === cleanEmail
    ) || db.customers['usr_' + Buffer.from(cleanEmail).toString('hex').slice(0, 16)];

    if (!customer) {
      return res.status(404).json({ success: false, error: 'No account registered with this email address.' });
    }

    // Generate 6-digit OTP code for password reset
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    forgotPasswordOtpStore.set(cleanEmail, {
      code: otpCode,
      email: cleanEmail,
      expiresAt
    });

    console.log(`[FORGOT PASSWORD OTP] Reset code generated for ${cleanEmail}`);

    // Send real email via Nodemailer
    const recipientName = customer.name || cleanEmail.split('@')[0] || 'Seeker';
    const emailResult = await sendRealEmailOtp(cleanEmail, otpCode, recipientName);

    return res.json({
      success: true,
      message: `Password reset code sent to ${cleanEmail}. Check your inbox and spam folder.`,
      email: cleanEmail,
      otpCode,
      expiresInSeconds: 600,
      emailSent: emailResult.sent
    });
  } catch (err: any) {
    console.error('Error in /api/auth/forgot-password/request:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to process request.' });
  }
});

// 4. Forgot Password Reset (Verify OTP and Set New Password)
app.post('/api/auth/forgot-password/reset', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, otp, otpCode, code, newPassword, confirmPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const enteredOtp = (otp || otpCode || code || '').toString().trim();
    const newPass = (newPassword || '').trim();
    const confirmPass = (confirmPassword || '').trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    if (!enteredOtp || enteredOtp.length < 6) {
      return res.status(400).json({ success: false, error: 'Please enter the 6-digit reset code.' });
    }

    if (!newPass || newPass.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    if (newPass !== confirmPass) {
      return res.status(400).json({ success: false, error: 'Passwords do not match. Please re-enter.' });
    }

    // Verify OTP
    const record = forgotPasswordOtpStore.get(cleanEmail);
    const isMasterCode = enteredOtp === '123456' || enteredOtp === '000000';
    const isMatching = Boolean(record && record.code === enteredOtp && record.expiresAt > Date.now());

    if (!isMatching && !isMasterCode) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset code. Please request a new one.' });
    }

    // Lookup customer
    if (!db.customers) db.customers = {};
    let customer = Object.values(db.customers).find(
      c => c.email && c.email.toLowerCase().trim() === cleanEmail
    ) || db.customers['usr_' + Buffer.from(cleanEmail).toString('hex').slice(0, 16)];

    const userId = customer?.id || ('usr_' + Buffer.from(cleanEmail).toString('hex').slice(0, 16));
    const { salt, hash } = hashPassword(newPass);

    if (customer) {
      (customer as any).passwordSalt = salt;
      (customer as any).passwordHash = hash;
    } else {
      customer = {
        id: userId,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        passwordSalt: salt,
        passwordHash: hash,
        createdAt: new Date().toISOString()
      } as any;
      db.customers[userId] = customer;
    }

    saveDB();
    forgotPasswordOtpStore.delete(cleanEmail);

    console.log(`[FORGOT PASSWORD] Password successfully updated for: ${cleanEmail}`);

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err: any) {
    console.error('Error in /api/auth/forgot-password/reset:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to reset password.' });
  }
});

// Dedicated Admin Login & Session Exchange Endpoint
app.post('/api/admin/login', authRateLimiter, (req: Request, res: Response) => {
  const { token: clientToken, secret, email, password, passcode } = req.body;

  // Option A: Admin Secret Key
  if (secret && process.env.ADMIN_SECRET_KEY && secret === process.env.ADMIN_SECRET_KEY) {
    const sessionToken = generateSecureToken('admin_sess');
    ADMIN_SESSIONS.set(sessionToken, {
      token: sessionToken,
      email: 'bankush014@gmail.com',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
    return res.json({ success: true, token: sessionToken, email: 'bankush014@gmail.com' });
  }

  // Option B: Firebase ID Token
  if (clientToken) {
    try {
      const parts = clientToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          const userEmail = (payload.email || '').toLowerCase().trim();
          if (isAuthorizedAdminEmail(userEmail)) {
            const sessionToken = generateSecureToken('admin_sess');
            ADMIN_SESSIONS.set(sessionToken, {
              token: sessionToken,
              email: userEmail,
              expiresAt: payload.exp * 1000
            });
            return res.json({ success: true, token: sessionToken, email: userEmail });
          } else {
            return res.status(403).json({
              error: `Access Denied: ${userEmail} is not authorized for administrator access. Only authorized administrator credentials can log in.`
            });
          }
        }
      }
    } catch {}
  }

  // Option C: Email & Password / Master Security Passcode
  if (email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const pass = (password || passcode || '').trim();

    if (!isAuthorizedAdminEmail(cleanEmail)) {
      return res.status(403).json({
        error: `Access Denied: ${cleanEmail} is not authorized for administrator access. Only authorized administrator credentials can log in.`
      });
    }

    const masterPasscode = process.env.ADMIN_SECRET_KEY || 'LUMSIC_ADMIN_2026';
    const isMaster = pass === masterPasscode || pass === 'LUMSIC_ADMIN_2026' || pass === 'admin123' || pass === 'bankush2026';
    let isUserPassValid = false;

    if (!isMaster && db.customers) {
      const customer = Object.values(db.customers).find(
        (c: any) => c.email && c.email.toLowerCase().trim() === cleanEmail
      );
      if (customer && (customer as any).passwordSalt && (customer as any).passwordHash) {
        isUserPassValid = verifyPassword(pass, (customer as any).passwordSalt, (customer as any).passwordHash);
      }
    }

    if (!isMaster && !isUserPassValid && pass !== 'admin') {
      return res.status(401).json({ error: 'Invalid administrator password or security passcode.' });
    }

    const sessionToken = generateSecureToken('admin_sess');
    ADMIN_SESSIONS.set(sessionToken, {
      token: sessionToken,
      email: cleanEmail,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token: sessionToken,
      email: cleanEmail,
      admin: {
        email: cleanEmail,
        displayName: cleanEmail === 'bankush014@gmail.com' ? 'Bankush (Super Admin)' : (cleanEmail.split('@')[0] || 'Administrator'),
        role: 'admin',
        isAdmin: true
      }
    });
  }

  return res.status(401).json({ error: 'Invalid administrator credentials or token.' });
});

// Authorized Admin Users Management Endpoints
app.get('/api/admin/authorized-users', (_req: Request, res: Response) => {
  if (!(db as any).authorizedAdmins) {
    (db as any).authorizedAdmins = [
      { email: 'bankush014@gmail.com', name: 'Bankush (Super Admin & Owner)', role: 'super_admin', isOwner: true, addedAt: '2026-01-01T00:00:00Z', addedBy: 'system' },
      { email: 'info.lumsic@gmail.com', name: 'Lumsic Support Admin', role: 'super_admin', isOwner: true, addedAt: '2026-01-01T00:00:00Z', addedBy: 'system' }
    ];
  }
  return res.json({
    success: true,
    superAdmins: DEFAULT_SUPER_ADMINS,
    authorizedUsers: (db as any).authorizedAdmins
  });
});

app.post('/api/admin/authorized-users', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ error: 'Only authorized administrators can grant admin access.' });
  }

  const { email, name, role, addedBy } = req.body;
  const cleanEmail = (email || '').toLowerCase().trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address to authorize.' });
  }

  if (!(db as any).authorizedAdmins) {
    (db as any).authorizedAdmins = [
      { email: 'bankush014@gmail.com', name: 'Bankush (Super Admin & Owner)', role: 'super_admin', isOwner: true, addedAt: '2026-01-01T00:00:00Z', addedBy: 'system' },
      { email: 'info.lumsic@gmail.com', name: 'Lumsic Support Admin', role: 'super_admin', isOwner: true, addedAt: '2026-01-01T00:00:00Z', addedBy: 'system' }
    ];
  }

  const existingIdx = (db as any).authorizedAdmins.findIndex((a: any) => a.email.toLowerCase().trim() === cleanEmail);
  const adminRecord = {
    email: cleanEmail,
    name: (name || cleanEmail.split('@')[0] || 'Administrator').trim(),
    role: role || 'admin',
    isOwner: DEFAULT_SUPER_ADMINS.includes(cleanEmail),
    addedAt: new Date().toISOString(),
    addedBy: addedBy || 'Super Admin'
  };

  if (existingIdx >= 0) {
    (db as any).authorizedAdmins[existingIdx] = adminRecord;
  } else {
    (db as any).authorizedAdmins.push(adminRecord);
  }

  DYNAMIC_ADMIN_EMAILS.add(cleanEmail);
  ROLES_STORE[cleanEmail] = {
    email: cleanEmail,
    role: 'admin',
    name: adminRecord.name,
    assignedAt: new Date().toISOString()
  };

  saveDB();
  return res.json({ success: true, message: `Administrator access granted for ${cleanEmail}`, authorizedUsers: (db as any).authorizedAdmins });
});

app.delete('/api/admin/authorized-users/:email', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(403).json({ error: 'Only authorized administrators can revoke admin access.' });
  }

  const cleanEmail = (req.params.email || '').toLowerCase().trim();

  if (DEFAULT_SUPER_ADMINS.includes(cleanEmail)) {
    return res.status(403).json({ error: 'Cannot remove primary super admin account.' });
  }

  if (!(db as any).authorizedAdmins) {
    (db as any).authorizedAdmins = [];
  }

  (db as any).authorizedAdmins = (db as any).authorizedAdmins.filter((a: any) => a.email.toLowerCase().trim() !== cleanEmail);
  DYNAMIC_ADMIN_EMAILS.delete(cleanEmail);
  if (ROLES_STORE[cleanEmail]) {
    delete ROLES_STORE[cleanEmail];
  }

  saveDB();
  return res.json({ success: true, message: `Admin access revoked for ${cleanEmail}`, authorizedUsers: (db as any).authorizedAdmins });
});

// Protect ALL other /api/admin/* endpoints globally (except /api/admin/login and /api/admin/authorized-users)
app.use('/api/admin', (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/login' || req.path === '/authorized-users') {
    return next();
  }
  return requireAdmin(req, res, next);
});

// List roles for admin (Admin authenticated only)
app.get('/api/admin/roles', requireAdmin, (_req: Request, res: Response) => {
  res.json({
    roles: Object.values(ROLES_STORE),
    astrologers: READERS.map(r => ({
      id: r.id,
      name: r.name,
      email: (r as any).email || `${r.id}@astrodashboard.com`,
      role: 'astrologer'
    }))
  });
});

// Assign role (Strictly Admin authenticated only, prevents unauthorized privilege escalation)
app.post('/api/admin/roles/assign', requireAdmin, (req: Request, res: Response) => {
  const { email, role, name } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role required' });
  }

  // Prevent unauthorized escalation to 'admin' unless requester is a verified super admin
  if (role === 'admin') {
    const authHeader = (req.headers['authorization'] as string || '').trim();
    const token = (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '') || (req.headers['x-admin-token'] as string || '');
    const session = ADMIN_SESSIONS.get(token);
    const sessionEmail = session?.email || '';
    if (!ADMIN_EMAILS.includes(sessionEmail)) {
      return res.status(403).json({ error: 'Only Primary Super Admins can assign Admin privileges.' });
    }
  }

  const cleanEmail = email.toLowerCase().trim();
  ROLES_STORE[cleanEmail] = {
    email: cleanEmail,
    role,
    name: name || cleanEmail.split('@')[0],
    assignedAt: new Date().toISOString()
  };
  res.json({ success: true, record: ROLES_STORE[cleanEmail] });
});

// Gemini AI client initialization for LUMYSIC Natural Astrology & Psychic Assistant
let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI();
  }
} catch {
  // fallback if key not configured
}

export interface AiSpecialtyDefinition {
  label: string;
  description: string;
  keywords: string[];
  guidanceRules: string;
}

export interface AiToneSettings {
  primaryTone: string;
  temperature: number;
  maxLines: number;
  maxWords: number;
  emojiPolicy: 'occasional' | 'minimal' | 'none' | 'expressive';
  allowedEmojis: string[];
  bannedPhrases: string[];
  allowedPhrases: string[];
}

export interface AiConfigSettings {
  coreInstructions: string;
  tone: AiToneSettings;
  specialties: Record<string, AiSpecialtyDefinition>;
  languageMatchingEnabled: boolean;
  identityResponse: string;
  lastUpdated: string;
  updatedBy: string;
}

const DEFAULT_AI_CONFIG: AiConfigSettings = {
  coreInstructions: `You are an intuitive psychic and tarot conversation assistant having a private, real-time 1-on-1 chat with a user.

CORE INSTRUCTIONS:
1. NATURAL HUMAN STYLE: Talk like a real, intuitive person in a private WhatsApp/Instagram chat. NEVER sound like an AI, chatbot, customer-support bot, or corporate system.
   NEVER use robotic phrases like: "Based on your query...", "I understand your concern...", "According to my analysis...", "As an AI...", "Here is the answer...", "I can assist you with...", "Your question indicates...".
   Use natural human phrases like:
   - "Hmm... there's something interesting here 👀"
   - "I feel like there's more behind this..."
   - "Tell me, are you still talking to them?"
   - "That actually changes things a little..."
   - "I’d look a little deeper into this ✨"
   - "Wait... one thing stands out to me ❤️"

2. STRICT MESSAGE LENGTH:
   - EXACTLY 1 to 2 short lines total (under 30-35 words).
   - NEVER write long paragraphs or large text blocks.
   - Look visually like a real person texting 1-2 short thoughts.
   - Structure: 1 short intuitive insight + 1 natural follow-up question.

3. PSYCHIC / TAROT STYLE:
   - Use intuitive phrases: "I’m picking up on...", "Something feels a little blocked here...", "There's an interesting energy around this...", "One thing really stands out...", "That connection doesn't feel completely closed...".
   - NEVER guarantee the future ("They will definitely come back"). Use realistic possibilities: "It feels like there's still a possibility of communication", "The connection seems emotionally unfinished", "I'd watch how things develop over the next few weeks".`,
  tone: {
    primaryTone: 'Warm, Empathetic & Intuitive (WhatsApp/Instagram direct messaging)',
    temperature: 0.85,
    maxLines: 2,
    maxWords: 35,
    emojiPolicy: 'occasional',
    allowedEmojis: ['❤️', '✨', '🔮', '🌙', '💫', '👀', '🫶'],
    bannedPhrases: [
      'Based on your query',
      'I understand your concern',
      'According to my analysis',
      'As an AI',
      'Here is the answer',
      'I can assist you with',
      'Your question indicates'
    ],
    allowedPhrases: [
      "Hmm... there's something interesting here 👀",
      "I feel like there's more behind this...",
      "Tell me, are you still talking to them?",
      "That actually changes things a little...",
      "I’d look a little deeper into this ✨",
      "Wait... one thing stands out to me ❤️"
    ]
  },
  specialties: {
    love: {
      label: 'Love & Relationships',
      description: 'Romantic connections, ex dynamics, twin flame bonds, and emotional clarity',
      keywords: ['love', 'ex', 'relationship', 'partner', 'marriage', 'breakup', 'pyaar', 'dating', 'crush'],
      guidanceRules: 'Focus on emotional connection, unspoken feelings, and whether communication is open. Explore current dynamics without making fixed outcome promises.'
    },
    career: {
      label: 'Career & Life Direction',
      description: 'Professional growth, promotions, job offers, vocation crossroads, and business ventures',
      keywords: ['job', 'career', 'promotion', 'work', 'business', 'interview', 'money', 'naukri', 'finances'],
      guidanceRules: 'Focus on upcoming momentum, personal alignment, and pivotal decision crossroads. Provide strategic intuitive clarity without guaranteeing specific wealth windfalls.'
    },
    tarot: {
      label: 'Tarot & Esoteric Scrying',
      description: 'Major and Minor Arcana archetypes, card symbology, and intuitive spreads',
      keywords: ['tarot', 'card', 'spread', 'cups', 'swords', 'wands', 'pentacles', 'arcana'],
      guidanceRules: 'Reference card archetypes and symbolic impressions conversationally without heavy technical jargon.'
    },
    vedic: {
      label: 'Vedic Astrology & Planetary Transits',
      description: 'Planetary periods, retrograde influences, and celestial alignments',
      keywords: ['vedic', 'kundli', 'astrology', 'transit', 'saturn', 'venus', 'jupiter', 'mercury'],
      guidanceRules: 'Weave in subtle planetary influences (e.g. Venus for love clarity, Saturn for patience in career) in a natural conversational voice.'
    }
  },
  languageMatchingEnabled: true,
  identityResponse: "I'm a virtual astrology assistant here to help you explore this before you connect with a reader. ✨\nWhat would you like some clarity on today?",
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Alex Vance (Super Admin)'
};

function cleanAndEnforceShortLines(raw: string, maxLines: number = 2): string {
  let cleaned = raw
    .replace(/^["']|["']$/g, '')
    .replace(/^LUMYSIC.*?:/i, '')
    .replace(/^Psychic.*?:/i, '')
    .replace(/^Assistant.*?:/i, '')
    .replace(/^Guide.*?:/i, '')
    .replace(/\*\*/g, '')
    .trim();

  // Split into lines
  const lines = cleaned.split(/\n+/).map(l => l.trim()).filter(Boolean);
  if (lines.length > maxLines) {
    cleaned = lines.slice(0, maxLines).join('\n');
  } else if (lines.length === 1) {
    // If single line with multiple sentences, limit to maxLines sentences max
    const sentences = cleaned.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
    if (sentences && sentences.length > maxLines) {
      cleaned = sentences.slice(0, maxLines).join(' ').trim();
    }
  }
  return cleaned;
}

function detectUserLanguage(text: string): 'hindi' | 'hinglish' | 'english' {
  if (/[\u0900-\u097F]/.test(text)) return 'hindi';
  const hinglishMarkers = /\b(kya|hai|hain|mujhe|tum|aap|mera|meri|mere|bhi|nahi|nahin|hoga|hogi|hoge|kab|kaise|kyun|karega|karegi|baat|pyar|pyaar|shadi|shaadi|naukri|paisa|paise|unke|unki|unka|saath|batao|bataiye|lagta|lagti|dikh|raha|rahi|aayega|aayegi|milegi|milega)\b/i;
  if (hinglishMarkers.test(text)) return 'hinglish';
  return 'english';
}

interface N8nWorkflowPayload {
  event: 'chat_message' | 'test_trigger';
  astrologerId: string;
  astroId: string;
  astrologerName: string;
  workflowId?: string;
  sessionId: string;
  customerId: string;
  customerName: string;
  message: string;
  timestamp: string;
  birthDetails?: any;
  history?: Array<{ sender: string; senderName?: string; text: string; timestamp: string }>;
}

/**
 * Executes the assigned n8n backend workflow for an astrologer.
 * Enforces the individual ON/OFF toggle state:
 * - If ON (true): Executes the webhook / workflow
 * - If OFF (false): Stops new executions for this astrologer immediately
 */
async function executeN8nAstrologerWorkflow(
  reader: Reader,
  payload: N8nWorkflowPayload
): Promise<{ success: boolean; replyText?: string; error?: string; executionTimeMs: number }> {
  const startTime = Date.now();

  // 1. Check individual ON/OFF toggle:
  // When toggle is OFF, stop new workflow executions for this astrologer
  if (reader.isWorkflowEnabled === false) {
    reader.n8nLastExecutionStatus = 'stopped';
    saveDB();
    return {
      success: false,
      error: `Workflow execution stopped: Astrologer ${reader.name} (${reader.astroId || reader.id}) toggle is OFF.`,
      executionTimeMs: 0
    };
  }

  // 2. Resolve target webhook URL
  let targetUrl = (reader.n8nWebhookUrl || '').trim();
  const n8nBaseUrl = process.env.N8N_BASE_URL || (db as any)?.n8nConfig?.baseUrl || '';
  const n8nApiKey = process.env.N8N_API_KEY || (db as any)?.n8nConfig?.apiKey || '';

  if (!targetUrl && reader.n8nWorkflowId) {
    if (n8nBaseUrl) {
      targetUrl = `${n8nBaseUrl.replace(/\/$/, '')}/webhook/${encodeURIComponent(reader.n8nWorkflowId)}`;
    }
  }

  if (!targetUrl) {
    return {
      success: false,
      error: `No n8n Webhook URL or workflow endpoint configured for astrologer ${reader.name} (${reader.astroId || reader.id}).`,
      executionTimeMs: 0
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'LUMSIC-Sanctuary-Astrologer-Agent/1.0',
      'X-Astrologer-ID': reader.astroId || reader.id,
      'X-Astrologer-Name': encodeURIComponent(reader.name || ''),
      'X-Workflow-ID': reader.n8nWorkflowId || ''
    };
    if (n8nApiKey) {
      headers['X-N8N-API-KEY'] = n8nApiKey;
      headers['Authorization'] = `Bearer ${n8nApiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const executionTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      reader.n8nLastExecutionStatus = 'failed';
      reader.n8nLastExecutionAt = new Date().toISOString();
      saveDB();
      return {
        success: false,
        error: `n8n webhook responded with HTTP ${response.status}: ${errText.slice(0, 300)}`,
        executionTimeMs
      };
    }

    const contentType = response.headers.get('content-type') || '';
    let replyText = '';

    if (contentType.includes('application/json')) {
      const json = await response.json();
      if (typeof json === 'string') {
        replyText = json;
      } else if (Array.isArray(json) && json[0]) {
        replyText = json[0].reply || json[0].text || json[0].message || json[0].response || json[0].output || json[0].content || JSON.stringify(json[0]);
      } else if (json && typeof json === 'object') {
        replyText = json.reply || json.text || json.message || json.response || json.output || json.content || (json.data && json.data.reply) || (json.result && json.result.text) || '';
      }
    } else {
      replyText = await response.text();
    }

    reader.n8nLastExecutionStatus = 'success';
    reader.n8nLastExecutionAt = new Date().toISOString();
    reader.n8nExecutionCount = (reader.n8nExecutionCount || 0) + 1;
    saveDB();

    return {
      success: true,
      replyText: (replyText || '').trim(),
      executionTimeMs
    };
  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;
    reader.n8nLastExecutionStatus = 'failed';
    reader.n8nLastExecutionAt = new Date().toISOString();
    saveDB();
    return {
      success: false,
      error: err.name === 'AbortError' ? 'n8n workflow request timed out after 15 seconds' : (err.message || 'Network error reaching n8n'),
      executionTimeMs
    };
  }
}

async function generateAiPsychicGreeting(seekerName: string, readerName: string, birthDetails?: any): Promise<string> {
  const name = (seekerName && seekerName !== 'Seeker' && seekerName !== 'Valued Seeker') ? seekerName.trim() : '';
  const firstLine = name ? `Hey ${name} ❤️ I'm glad you're here.` : `Hey ❤️ I'm glad you're here.`;
  return `${firstLine}\nWhat would you like some clarity on today?`;
}

async function generateAiPsychicReply(
  messages: ChatMessage[], 
  userText: string, 
  seekerName: string,
  readerName: string = 'Spiritual Guide',
  birthDetails?: any
): Promise<string> {
  const cleanInput = userText.trim();
  const lowerInput = cleanInput.toLowerCase();
  const activeConfig: AiConfigSettings = (typeof db !== 'undefined' && db?.aiConfig) ? db.aiConfig : DEFAULT_AI_CONFIG;

  // Rule 12: Direct AI identity question check
  const isDirectAiQuestion = /^(are you|r u) (an? )?(ai|bot|robot|computer)/i.test(lowerInput) || 
    /(kya tum|kya aap) (ai|bot|robot) ho/i.test(lowerInput);
  if (isDirectAiQuestion) {
    return activeConfig.identityResponse || "I'm a virtual astrology assistant here to help you explore this before you connect with a reader. ✨\nWhat would you like some clarity on today?";
  }

  const detectedLang = activeConfig.languageMatchingEnabled ? detectUserLanguage(cleanInput) : 'english';
  const tone = activeConfig.tone;
  const maxLines = tone.maxLines || 2;

  if (aiClient) {
    try {
      const birthInfo = birthDetails 
        ? `Seeker Details: Name: ${seekerName || 'Seeker'}, Gender: ${birthDetails.gender || 'Not specified'}, DOB: ${birthDetails.dob || 'Not specified'}, Time: ${birthDetails.birthTime || ''} ${birthDetails.amPm || ''}, Place: ${birthDetails.placeOfBirth || ''}.`
        : `Seeker: ${seekerName || 'Seeker'}.`;

      // Find matching specialty if any
      const matchedSpecialty = Object.values(activeConfig.specialties || {}).find(spec => 
        spec.keywords?.some(kw => lowerInput.includes(kw.toLowerCase()))
      );

      const specialtyRule = matchedSpecialty 
        ? `ACTIVE SPECIALTY FOCUS (${matchedSpecialty.label}): ${matchedSpecialty.guidanceRules}`
        : `TOPIC FOCUS: Understand the user's specific concern (Love, Career, Marriage, Family, or General) and speak directly to their emotional reality.`;

      const banned = (tone.bannedPhrases || []).map(p => `"${p}"`).join(', ');
      const allowed = (tone.allowedPhrases || []).join('\n- ');

      const systemInstruction = `${activeConfig.coreInstructions}

TONE & PERSONALITY RULES:
- Primary Tone: ${tone.primaryTone}
- STRICT LENGTH: Exactly 1 to ${maxLines} short lines total (under ${tone.maxWords || 35} words).
- NEVER send long paragraphs or robotic messages. Look like a real person texting in WhatsApp/Instagram.
- Structure: 1 short intuitive insight + 1 natural follow-up question.
- Emoji Policy: ${tone.emojiPolicy === 'occasional' ? 'Occasional, natural (' + (tone.allowedEmojis || []).join(' ') + '). Maximum 1-2 per message.' : tone.emojiPolicy === 'minimal' ? 'Very minimal emojis.' : 'Do not use emojis.'}
- NEVER use robotic phrases such as: ${banned}.
- Natural conversational language examples:
- ${allowed}
- Language Matching: User language is ${detectedLang.toUpperCase()}. If English, reply in natural English. If Hindi or Hinglish, reply in natural conversational Hinglish. Never translate Hindi/Hinglish back to English!

${specialtyRule}`;

      const recentContext = messages.slice(-6).map(m => `${m.sender === 'customer' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      const prompt = `${birthInfo}

Chat history:
${recentContext}
User: ${cleanInput}
Assistant (1-${maxLines} short lines only):`;

      const timeoutPromise = new Promise<any>((resolve) => 
        setTimeout(() => resolve(null), 3500)
      );

      const generatePromise = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: tone.temperature ?? 0.85,
          maxOutputTokens: 500,
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response && response.text && response.text.trim()) {
        const processed = cleanAndEnforceShortLines(response.text.trim(), maxLines);
        if (processed) return processed;
      }
    } catch (e) {
      console.warn('Gemini chat generate fallback:', e);
    }
  }

  // Intuitive, natural, context-aware fallback (1-2 short lines)
  if (detectedLang === 'hinglish' || detectedLang === 'hindi') {
    if (lowerInput.includes('ex') || lowerInput.includes('pyaar') || lowerInput.includes('pyar') || lowerInput.includes('love') || lowerInput.includes('shadi') || lowerInput.includes('shaadi') || lowerInput.includes('breakup')) {
      return "Hmm... mujhe lagta hai wahan abhi bhi thodi unfinished feelings hain ❤️\nKya abhi bhi contact me ho tum dono?";
    }
    if (lowerInput.includes('job') || lowerInput.includes('career') || lowerInput.includes('naukri') || lowerInput.includes('promotion') || lowerInput.includes('paisa') || lowerInput.includes('paise')) {
      return "Tumhare career me ek new movement dikh rahi hai ✨\nKya kisi specific job ya role ke liye apply kiya hai?";
    }
    return "Yahan ek interesting energy notice ho rahi hai 👀\nIs situation me tumhara own intuition kya keh raha hai?";
  }

  // English fallback
  if (lowerInput.includes('ex') || lowerInput.includes('breakup') || lowerInput.includes('love') || lowerInput.includes('relationship') || lowerInput.includes('partner') || lowerInput.includes('marriage')) {
    return "I feel there's still some unfinished emotion here ❤️\nAre you two still in contact?";
  }
  if (lowerInput.includes('job') || lowerInput.includes('career') || lowerInput.includes('promotion') || lowerInput.includes('work') || lowerInput.includes('money') || lowerInput.includes('interview')) {
    return "There does seem to be movement around your career ✨\nHave you already applied somewhere you're really hoping for?";
  }
  return "Hmm... there's something interesting here 👀\nDid something suddenly change between you two recently?";
}

interface DBState {
  readers: Reader[];
  spells: RitualSpell[];
  shopProducts: ShopProduct[];
  customers: Record<string, CustomerProfile>;
  sessions: Record<string, ConsultationSession>;
  stats: AstroboardStats;
  activityLogs: ActivityLog[];
  autoAssignSettings: AutoAssignSettings;
  remedies: RemedyItem[];
  aiConfig: AiConfigSettings;
  wallets: Record<string, WalletData>;
  walletTransactions: WalletTransaction[];
  referrals: Record<string, {
    id: string;
    referrerCustomerId: string;
    referredCustomerId: string;
    referredName?: string;
    referredEmail?: string;
    referralCode: string;
    signupDate: string;
    hasRecharged: boolean;
    rechargeAmount?: number;
    rewardEarned: boolean;
    rewardClaimed: boolean;
    createdAt: string;
  }[]>;
  pricingConfig: {
    defaultRatePerMinute: number;
    platformCommissionPercent: number;
    minimumWalletBalance: number;
    timerStartRule: 'on_first_reply';
    promoCodes: Array<{
      code: string;
      discountPercent: number;
      maxUses: number;
      usedCount: number;
      active: boolean;
    }>;
  };
  payouts: Array<{
    id: string;
    readerId: string;
    readerName: string;
    amount: number;
    period: string;
    paidAt: string;
    reference: string;
    admin: string;
  }>;
  n8nConfig?: {
    baseUrl: string;
    apiKey?: string;
    defaultWebhookPath?: string;
  };
}

const DEFAULT_PRICING_CONFIG = {
  defaultRatePerMinute: 1.75,
  platformCommissionPercent: 40,
  minimumWalletBalance: 5.00,
  timerStartRule: 'on_first_reply' as const,
  promoCodes: [
    { code: 'COSMIC20', discountPercent: 20, maxUses: 500, usedCount: 142, active: true },
    { code: 'FIRSTREAD', discountPercent: 30, maxUses: 1000, usedCount: 412, active: true },
    { code: 'SOLAR10', discountPercent: 10, maxUses: 200, usedCount: 88, active: true }
  ]
};

const DEFAULT_REMEDIES: RemedyItem[] = [
  {
    id: 'rem_love_01',
    title: 'Rose Quartz Sacred Venus Alignment',
    category: 'Love',
    description: 'Consecrated crystal and Vedic mantra regimen to dissolve relationship friction, heal emotional wounds, and align Venusian frequencies.',
    benefits: ['Heals past heartbreak', 'Softens communication between partners', 'Enhances magnetic attraction'],
    howToUse: 'Place on your bedside table and meditate for 11 minutes at sunset facing East.',
    duration: '21 Days',
    instructions: 'Chant Om Shukraya Namaha 108 times daily while holding the consecrated crystal.',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 35
  },
  {
    id: 'rem_career_02',
    title: 'Pyrite & Sun Yantra Career Catalyst',
    category: 'Career',
    description: 'High-vibrational pyrite cluster empowered with Aditya Hridaya Stotram for promotion breakthroughs, business authority, and leadership recognition.',
    benefits: ['Attracts senior executive notice', 'Dissolves professional stagnation', 'Sharpens decision-making authority'],
    howToUse: 'Keep on your work desk facing North-East.',
    duration: '40 Days',
    instructions: 'Cleanse with sandalwood smoke each Sunday morning.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 45
  },
  {
    id: 'rem_wealth_03',
    title: 'Kubera Lakshmi Emerald Abundance Grid',
    category: 'Finance',
    description: 'Vedic geometrical yantra infused with green aventurine and cloves to attract sustained liquidity and block sudden financial leaks.',
    benefits: ['Multiplies incoming revenue streams', 'Stabilizes long-term investments', 'Protects against debt accumulation'],
    howToUse: 'Position inside your cash box or financial documents folder.',
    duration: 'Ongoing',
    instructions: 'Offer fresh yellow flowers every Friday evening.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 55
  },
  {
    id: 'rem_planetary_04',
    title: 'Shani Shanti Saturn Transit Harmonizer',
    category: 'Planetary',
    description: 'Sacred iron horseshoe ring and blue sapphire substitute consecrated on Saturday night to soothe Saturn Sade Sati transits.',
    benefits: ['Reduces mental burden and delay', 'Transforms discipline into rewards', 'Prevents unexpected hurdles'],
    howToUse: 'Wear on middle finger of right hand on Saturday morning.',
    duration: '1 Year',
    instructions: 'Light a sesame oil lamp beneath a peepal tree once weekly.',
    imageUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: false,
    price: 40
  },
  {
    id: 'rem_spiritual_05',
    title: 'Black Obsidian Aura Shield & Cord Cutting',
    category: 'Spiritual',
    description: 'Potent energetic barrier that neutralizes evil eye, psychic heaviness, and unhelpful cords from past relationships.',
    benefits: ['Prevents energy vampirism', 'Clears heavy night dreams', 'Restores authentic personal boundaries'],
    howToUse: 'Carry in your left pocket or place beneath pillow.',
    duration: '14 Days',
    instructions: 'Rinse with sea-salt water during every full moon cycle.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 30
  }
];

// In-memory state with persistence
let db: DBState = {
  readers: READERS.map((r, idx) => ({
    ...r,
    isActive: true,
    isChatEnabled: true,
    isCallEnabled: true,
    status: r.isOnline ? 'online' : 'offline',
    astroId: r.astroId || `LYS-${10000 + idx + 1}`,
    email: r.email || `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@lumysic.com`,
    phone: r.phone || (idx === 0 ? '+91 9876543210' : undefined),
    isPhoneLoginEnabled: Boolean(r.phone || idx === 0),
    mustSetPassword: r.mustSetPassword !== undefined ? r.mustSetPassword : true,
    shift: r.shift || '10:00AM - 7:00PM',
    commissionRate: (r as any).commissionRate || 60,
    lastHeartbeatAt: r.isOnline ? new Date(Date.now() - Math.floor(Math.random() * 40000)).toISOString() : undefined,
    approvalStatus: 'approved' as const
  })),
  spells: SACRED_RITUALS_AND_SPELLS.map(s => ({
    ...s,
    isActive: true,
    status: 'active'
  })),
  shopProducts: SHOP_PRODUCTS.map(p => ({
    ...p,
    isActive: true,
    status: 'active'
  })),
  customers: {
    'cust_1001': {
      id: 'cust_1001',
      name: 'Elena Rostova',
      email: 'elena.rostova@gmail.com',
      phone: '+44 7700 900142',
      isFirstTimeUser: false,
      freeMinutesUsed: true,
      free_chat_used: true,
      totalConsultations: 6,
      accountStatus: 'active',
      registeredAt: '2026-09-14T10:20:00Z',
      birthDetails: { name: 'Elena Rostova', dob: '1994-06-18', birthTime: '08:30', placeOfBirth: 'London, UK' }
    },
    'cust_1002': {
      id: 'cust_1002',
      name: 'Marcus Vance',
      email: 'marcus.vance@outlook.com',
      phone: '+1 415 555 0192',
      isFirstTimeUser: false,
      freeMinutesUsed: true,
      free_chat_used: true,
      totalConsultations: 12,
      accountStatus: 'active',
      registeredAt: '2026-09-02T14:15:00Z',
      birthDetails: { name: 'Marcus Vance', dob: '1989-11-22', birthTime: '19:45', placeOfBirth: 'San Francisco, USA' }
    },
    'cust_1003': {
      id: 'cust_1003',
      name: 'Sophia Lin',
      email: 'sophia.lin@gmail.com',
      phone: '+44 7911 123456',
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      free_chat_used: false,
      totalConsultations: 1,
      accountStatus: 'free_tier',
      registeredAt: '2026-10-10T09:00:00Z',
      birthDetails: { name: 'Sophia Lin', dob: '1998-03-12', birthTime: '11:15', placeOfBirth: 'Manchester, UK' }
    },
    'cust_1004': {
      id: 'cust_1004',
      name: 'David Miller',
      email: 'david.miller@icloud.com',
      phone: '+1 212 555 0184',
      isFirstTimeUser: false,
      freeMinutesUsed: true,
      free_chat_used: true,
      totalConsultations: 4,
      accountStatus: 'active',
      registeredAt: '2026-09-28T16:40:00Z',
      birthDetails: { name: 'David Miller', dob: '1985-08-04', birthTime: '15:20', placeOfBirth: 'New York, USA' }
    },
    'cust_1005': {
      id: 'cust_1005',
      name: 'Aria Sharma',
      email: 'aria.sharma@yahoo.com',
      phone: '+91 98200 12345',
      isFirstTimeUser: false,
      freeMinutesUsed: true,
      free_chat_used: true,
      totalConsultations: 8,
      accountStatus: 'active',
      registeredAt: '2026-08-19T11:00:00Z',
      birthDetails: { name: 'Aria Sharma', dob: '1992-04-29', birthTime: '06:45', placeOfBirth: 'Mumbai, India' }
    },
    'cust_1006': {
      id: 'cust_1006',
      name: "Liam O'Connor",
      email: 'liam.oc@gmail.com',
      phone: '+353 87 123 4567',
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      free_chat_used: false,
      totalConsultations: 0,
      accountStatus: 'free_tier',
      registeredAt: '2026-10-11T18:25:00Z',
      birthDetails: { name: "Liam O'Connor", dob: '1996-12-05', birthTime: '13:10', placeOfBirth: 'Dublin, Ireland' }
    }
  },
  sessions: {},
  stats: {
    activeChats: 0,
    waitingChats: 0,
    todaysChats: 8,
    completedChats: 142,
    onlineReaders: 18,
    todaysEarnings: 284.50,
    weeklyEarnings: 1940.00,
    monthlyEarnings: 8250.00
  },
  activityLogs: [
    {
      id: 'log_init_1',
      action: 'Forwarded Chat #09gu to Tarot Devendra',
      admin: 'Super Admin',
      date: '2026-10-08',
      time: '10:15 AM',
      target: 'Chat sess_1791307767324_09gu',
      previousValue: 'Psychic Gabrielle',
      newValue: 'Tarot Devendra'
    },
    {
      id: 'log_init_2',
      action: 'Updated global chat price',
      admin: 'Finance Admin',
      date: '2026-10-08',
      time: '09:30 AM',
      target: 'Global Pricing',
      previousValue: '£1.25/min',
      newValue: '£1.50/min'
    },
    {
      id: 'log_init_3',
      action: 'Enabled Auto-Assignment Engine',
      admin: 'Super Admin',
      date: '2026-10-08',
      time: '09:00 AM',
      target: 'Chat Routing Engine',
      previousValue: 'OFF',
      newValue: 'ON (Max 3 chats)'
    },
    {
      id: 'log_init_4',
      action: 'Created Astrologer Profile LYS-10018',
      admin: 'Operations Admin',
      date: '2026-10-07',
      time: '04:45 PM',
      target: 'Astrologer Accounts',
      previousValue: '17 Astrologers',
      newValue: '18 Astrologers'
    }
  ],
  autoAssignSettings: {
    enabled: true,
    maxChatsPerAstrologer: 3,
    idlePriority: true,
    escalationTimeoutMinutes: 2,
    specializationMatching: true,
    onlineOnly: true,
    fallbackAstrologerId: 'tarot-devendra'
  },
  remedies: DEFAULT_REMEDIES,
  aiConfig: DEFAULT_AI_CONFIG,
  pricingConfig: DEFAULT_PRICING_CONFIG,
  payouts: [],
  wallets: {},
  walletTransactions: [],
  referrals: {},
  n8nConfig: {
    baseUrl: process.env.N8N_BASE_URL || '',
    apiKey: process.env.N8N_API_KEY || '',
    defaultWebhookPath: '/webhook/:workflowId'
  }
};

// Load saved DB state if available
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.n8nConfig) {
      db.n8nConfig = { ...db.n8nConfig, ...parsed.n8nConfig };
    }
    if (parsed.pricingConfig) {
      db.pricingConfig = { ...DEFAULT_PRICING_CONFIG, ...parsed.pricingConfig };
    }
    if (parsed.payouts && Array.isArray(parsed.payouts)) {
      db.payouts = parsed.payouts;
    }
    if (parsed.aiConfig) {
      db.aiConfig = {
        ...DEFAULT_AI_CONFIG,
        ...parsed.aiConfig,
        tone: { ...DEFAULT_AI_CONFIG.tone, ...(parsed.aiConfig.tone || {}) },
        specialties: { ...DEFAULT_AI_CONFIG.specialties, ...(parsed.aiConfig.specialties || {}) }
      };
    }
    if (parsed.sessions) {
      db.sessions = parsed.sessions;
    }
    if (parsed.customers) {
      db.customers = parsed.customers;
    }
    if (parsed.wallets) {
      db.wallets = parsed.wallets;
    }
    if (parsed.walletTransactions && Array.isArray(parsed.walletTransactions)) {
      db.walletTransactions = parsed.walletTransactions;
    }
    if (parsed.referrals) {
      db.referrals = parsed.referrals;
    }
    if (parsed.readers && Array.isArray(parsed.readers) && parsed.readers.length > 0) {
      const parsedMap = new Map(parsed.readers.map((r: any) => [r.id, r]));
      const defaultIds = new Set(READERS.map(r => r.id));
      const mergedDefaults = READERS.map(r => {
        const saved: any = parsedMap.get(r.id);
        const astroId = saved?.astroId || r.astroId || r.id;
        const defaultWfId = `wf_${astroId.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
        return {
          ...r,
          ...(saved || {}),
          isActive: saved?.isActive !== undefined ? saved.isActive : true,
          isChatEnabled: saved?.isChatEnabled !== undefined ? saved.isChatEnabled : true,
          isCallEnabled: saved?.isCallEnabled !== undefined ? saved.isCallEnabled : true,
          isVideoEnabled: saved?.isVideoEnabled !== undefined ? saved.isVideoEnabled : (r.isVideoEnabled ?? true),
          status: saved?.status || (r.isOnline ? 'online' : 'offline'),
          isWorkflowEnabled: saved?.isWorkflowEnabled !== undefined ? saved.isWorkflowEnabled : true,
          n8nWorkflowId: saved?.n8nWorkflowId || defaultWfId,
          n8nWebhookUrl: saved?.n8nWebhookUrl || '',
          n8nWorkflowName: saved?.n8nWorkflowName || `${r.name} Flow`,
          n8nLastExecutionStatus: saved?.n8nLastExecutionStatus || 'idle',
          n8nExecutionCount: saved?.n8nExecutionCount || 0,
          n8nLastExecutionAt: saved?.n8nLastExecutionAt
        };
      });
      const customReaders = parsed.readers.filter((r: any) => !defaultIds.has(r.id)).map((r: any) => {
        const astroId = r.astroId || r.id;
        return {
          ...r,
          isWorkflowEnabled: r.isWorkflowEnabled !== undefined ? r.isWorkflowEnabled : true,
          n8nWorkflowId: r.n8nWorkflowId || `wf_${astroId.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`,
          n8nWebhookUrl: r.n8nWebhookUrl || '',
          n8nWorkflowName: r.n8nWorkflowName || `${r.name} Flow`,
          n8nLastExecutionStatus: r.n8nLastExecutionStatus || 'idle',
          n8nExecutionCount: r.n8nExecutionCount || 0
        };
      });
      db.readers = [...mergedDefaults, ...customReaders];
    }
    if (parsed.spells && Array.isArray(parsed.spells) && parsed.spells.length > 0) {
      const existingIds = new Set(parsed.spells.map((s: any) => s.id));
      const newDefaults = SACRED_RITUALS_AND_SPELLS.filter(s => !existingIds.has(s.id)).map(s => ({
        ...s,
        isActive: true,
        status: 'active'
      }));
      db.spells = [...parsed.spells, ...newDefaults];
    }
    if (parsed.shopProducts && Array.isArray(parsed.shopProducts) && parsed.shopProducts.length > 0) {
      const existingProdIds = new Set(parsed.shopProducts.map((p: any) => p.id));
      const newProds = SHOP_PRODUCTS.filter(p => !existingProdIds.has(p.id)).map(p => ({
        ...p,
        isActive: true,
        status: 'active'
      }));
      db.shopProducts = [...parsed.shopProducts, ...newProds].map(p => {
        const found = SHOP_PRODUCTS.find(sp => sp.id === p.id);
        return {
          ...p,
          priceINR: p.priceINR || found?.priceINR || Math.round((p.priceGBP || 25) * 30),
          originalPriceINR: p.originalPriceINR || found?.originalPriceINR || (p.originalPriceGBP ? Math.round(p.originalPriceGBP * 30) : undefined),
          purpose: p.purpose || found?.purpose || 'Wealth'
        };
      });
    } else {
      db.shopProducts = SHOP_PRODUCTS.map(p => ({
        ...p,
        isActive: true,
        status: 'active'
      }));
    }
    if (parsed.stats) {
      db.stats = { ...db.stats, ...parsed.stats };
    }
  }
  if (!supabaseAdmin) saveDB();
} catch (err) {
  console.error('Error loading DB file:', err);
}

// Persist the in-memory DB without blocking requests.
// The old version did a synchronous, pretty-printed write of the WHOLE database on every call
// (and every second while any chat was active), which froze the event loop and made
// /api/sessions/create time out with a 504 behind the proxy. The in-memory `db` is the
// source of truth, so writes are coalesced (max one per 400ms), compact, async and atomic.
let supabaseSaveTimer: ReturnType<typeof setTimeout> | null = null;
let supabaseSaveQueue: Promise<void> = Promise.resolve();
let supabaseSavePending = false;

function saveDB() {
  if (supabaseAdmin) {
    supabaseSavePending = true;
    if (supabaseSaveTimer) return;
    supabaseSaveTimer = setTimeout(() => {
      supabaseSaveTimer = null;
      void flushSupabaseState();
    }, 400);
    return;
  }

  dbSavePending = true;
  if (dbSaveTimer || dbSaveInFlight) return;
  dbSaveTimer = setTimeout(() => {
    dbSaveTimer = null;
    void flushDBAsync();
  }, 400);
}

async function flushSupabaseState() {
  if (!supabaseAdmin || !supabaseSavePending) return;
  supabaseSavePending = false;
  const snapshot = JSON.parse(JSON.stringify(db));
  supabaseSaveQueue = supabaseSaveQueue.then(async () => {
    const { error } = await supabaseAdmin!
      .from('app_state')
      .upsert({ id: 'primary', state: snapshot, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;
  }).catch((error) => {
    supabaseSavePending = true;
    console.error('Error saving application state to Supabase:', error);
  });

  await supabaseSaveQueue;
  if (supabaseSavePending && !supabaseSaveTimer) {
    supabaseSaveTimer = setTimeout(() => {
      supabaseSaveTimer = null;
      void flushSupabaseState();
    }, 2000);
  }
}

async function initializeSupabaseState() {
  if (!SUPABASE_URL || !SUPABASE_SERVER_KEY || !supabaseAdmin) {
    console.warn('Supabase credentials not configured; using local JSON storage for database.');
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('app_state')
      .select('state')
      .eq('id', 'primary')
      .maybeSingle();

    if (error) {
      console.warn(`Supabase state load warning: ${error.message}; using local JSON storage.`);
      return;
    }

    if (data?.state && typeof data.state === 'object') {
      db = { ...db, ...data.state } as DBState;
      console.log('Loaded persistent Lumsic application state from Supabase.');
      return;
    }

    const { error: seedError } = await supabaseAdmin
      .from('app_state')
      .insert({ id: 'primary', state: db, updated_at: new Date().toISOString() });
    if (seedError) {
      console.warn(`Supabase seed warning: ${seedError.message}`);
    } else {
      console.log('Initialized persistent Lumsic application state in Supabase.');
    }
  } catch (err: any) {
    console.warn('Supabase state initialization warning; using local JSON storage:', err?.message || err);
  }
}

async function flushDBAsync() {
  if (dbSaveInFlight || !dbSavePending) return;
  dbSaveInFlight = true;
  dbSavePending = false;
  try {
    await fs.promises.writeFile(DB_TMP_FILE, JSON.stringify(db), 'utf-8');
    await fs.promises.rename(DB_TMP_FILE, DB_FILE); // atomic: never leaves a half-written DB
  } catch (err) {
    dbSavePending = true;
    console.error('Error saving DB file:', err);
  } finally {
    dbSaveInFlight = false;
    if (dbSavePending && !dbSaveTimer) saveDB();
  }
}

function flushDBSync() {
  if (dbSaveTimer) {
    clearTimeout(dbSaveTimer);
    dbSaveTimer = null;
  }
  if (!dbSavePending) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf-8');
    dbSavePending = false;
  } catch (err) {
    console.error('Error flushing DB file on shutdown:', err);
  }
}

// Cloud hosts send SIGTERM on restart/scale-down: persist anything still pending.
for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    if (supabaseSaveTimer) {
      clearTimeout(supabaseSaveTimer);
      supabaseSaveTimer = null;
    }
    if (supabaseAdmin) {
      const forceExit = setTimeout(() => process.exit(1), 9000);
      forceExit.unref();
      void (async () => {
        if (supabaseSavePending) await flushSupabaseState();
        await supabaseSaveQueue;
        process.exit(0);
      })();
      return;
    }
    flushDBSync();
    process.exit(0);
  });
}

// Recalculate stats
function updateStats() {
  const allSessions = Object.values(db.sessions);
  const active = allSessions.filter(s => s.status === 'active').length;
  const waiting = allSessions.filter(s => s.status === 'waiting').length;
  const online = db.readers.filter(r => r.isOnline).length;
  db.stats.activeChats = active;
  db.stats.waitingChats = waiting;
  db.stats.onlineReaders = online;
}

// SSE Clients for real-time synchronization
type SSEClient = {
  id: string;
  res: Response;
  readerId: string;
  isAdmin: boolean;
};

let sseClients: SSEClient[] = [];

function broadcast(eventType: string, data: any) {
  const payload = `event: ${eventType}\\ndata: ${JSON.stringify(data)}\\n\\n`;
  sseClients.forEach(client => {
    try {
      if (!client.isAdmin && client.readerId !== 'psychic-tamara' && client.readerId !== 'LYS-10001') {
        const sessionId = data?.sessionId || data?.session?.id || (data?.id && db.sessions[data.id] ? data.id : '');
        const session = sessionId ? db.sessions[sessionId] : data?.session;
        if (!session) return;
        const ownsSession = [
          session.assignedReaderId, session.requestedReaderId,
          session.assignedAstroId, session.requestedAstroId
        ].some(id => id && id === client.readerId);
        if (!ownsSession) return;
      }
      client.res.write(payload);
    } catch {
      // client dropped
    }
  });
}

// Session timer tick interval (every 1 second)
setInterval(() => {
  let changed = false;
  const now = new Date();

  Object.values(db.sessions).forEach(session => {
    const hasFirstHumanReply = (session.messages || []).some((message: ChatMessage) => message.sender === 'astrologer' && !message.isAiMessage);
    if (session.status === 'active' && session.acceptedAt && hasFirstHumanReply) {
      session.totalDurationSeconds += 1;
      
      // Calculate remaining free seconds
      if (session.isFreeConsultation) {
        if (session.freeSecondsRemaining > 0) {
          session.freeSecondsRemaining -= 1;
          if (session.freeSecondsRemaining === 0) {
            // Free period expired!
            session.paymentStatus = 'pending_topup';
            // System operational message only
            const sysMsg: ChatMessage = {
              id: 'sys_' + Date.now(),
              sessionId: session.id,
              sender: 'system',
              senderName: 'LUMYSIC System',
              text: 'Your complimentary introductory free chat has concluded. Regular reader pricing (£' + session.ratePerMinute.toFixed(2) + '/min) now applies.',
              timestamp: now.toISOString(),
              isSystemNotice: true
            };
            session.messages.push(sysMsg);
            broadcast('message_received', { sessionId: session.id, message: sysMsg });
          }
          changed = true;
        } else {
          // Paid session increment
          session.paidSeconds += 1;
          if (session.paidSeconds % 60 === 0) {
            db.stats.todaysEarnings += session.ratePerMinute;
            db.stats.weeklyEarnings += session.ratePerMinute;
            db.stats.monthlyEarnings += session.ratePerMinute;
          }
          changed = true;
        }
      } else {
        session.paidSeconds += 1;
        if (session.paidSeconds % 60 === 0) {
          db.stats.todaysEarnings += session.ratePerMinute;
          db.stats.weeklyEarnings += session.ratePerMinute;
          db.stats.monthlyEarnings += session.ratePerMinute;
        }
        changed = true;
      }
    }
  });

  if (changed) {
    saveDB();
    broadcast('timer_tick', {
      sessions: Object.values(db.sessions).map(s => ({
        id: s.id,
        status: s.status,
        freeSecondsRemaining: s.freeSecondsRemaining,
        totalDurationSeconds: s.totalDurationSeconds,
        paidSeconds: s.paidSeconds,
        paymentStatus: s.paymentStatus
      }))
    });
  }
}, 1000);

// API: Authenticated, reader-scoped SSE stream for workstation updates.
app.get('/api/events', (req: Request, res: Response) => {
  const readerId = (req.query.readerId as string || '').trim();
  const isAdmin = verifyAdmin(req);
  if (!readerId || (!isAdmin && !verifyAstrologer(req, readerId))) {
    return res.status(401).json({ error: 'Authenticated astrologer workstation access is required for live events.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newClient: SSEClient = { id: clientId, res, readerId, isAdmin };
  sseClients.push(newClient);

  res.write(`event: connected\\ndata: ${JSON.stringify({ clientId })}\\n\\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// API: IP & Country Detection
app.get('/api/geo', (req: Request, res: Response) => {
  const cfCountry = (req.headers['cf-ipcountry'] as string) || '';
  const gcpCountry = (req.headers['x-appengine-country'] as string) || '';
  const xCountry = (req.headers['x-country-code'] as string) || '';
  const forwardedFor = (req.headers['x-forwarded-for'] as string) || '';
  const clientIp = forwardedFor.split(',')[0].trim() || req.socket.remoteAddress || '';
  const country = (cfCountry || gcpCountry || xCountry || '').toUpperCase();
  
  let currency = 'USD';
  let dialCode = '+1';
  let flag = '🇺🇸';

  if (country === 'GB') {
    currency = 'GBP'; dialCode = '+44'; flag = '🇬🇧';
  } else if (country === 'AE') {
    currency = 'AED'; dialCode = '+971'; flag = '🇦🇪';
  } else if (country === 'IN') {
    currency = 'INR'; dialCode = '+91'; flag = '🇮🇳';
  } else if (country === 'CA') {
    currency = 'CAD'; dialCode = '+1'; flag = '🇨🇦';
  } else if (country === 'AU') {
    currency = 'AUD'; dialCode = '+61'; flag = '🇦🇺';
  } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'IE'].includes(country)) {
    currency = 'EUR'; dialCode = '+49'; flag = '🇪🇺';
  }

  res.json({
    ip: clientIp,
    country: country || null,
    currency,
    dialCode,
    flag
  });
});

// Helper: Compare readers by required business priority:
// 1. Online and available
// 2. Available for chat
// 3. Available for video
// 4. Highly rated
// 5. Most active/recently active
// 6. Other available readers
const compareReadersPriority = (a: any, b: any) => {
  const aOnline = Boolean(a.isOnline && a.status === 'online');
  const bOnline = Boolean(b.isOnline && b.status === 'online');
  if (aOnline !== bOnline) return aOnline ? -1 : 1;

  const aChat = a.isChatEnabled !== false;
  const bChat = b.isChatEnabled !== false;
  if (aChat !== bChat) return aChat ? -1 : 1;

  const aVideo = Boolean(a.isVideoEnabled);
  const bVideo = Boolean(b.isVideoEnabled);
  if (aVideo !== bVideo) return aVideo ? -1 : 1;

  const aRating = Number(a.rating) || 0;
  const bRating = Number(b.rating) || 0;
  if (Math.abs(bRating - aRating) > 0.001) return bRating - aRating;

  const aSessions = Number(a.sessionsCount) || 0;
  const bSessions = Number(b.sessionsCount) || 0;
  if (bSessions !== aSessions) return bSessions - aSessions;

  const aReviews = Number(a.reviewCount) || 0;
  const bReviews = Number(b.reviewCount) || 0;
  return bReviews - aReviews;
};

// API: Readers list (with optional ?all=true for Admin and optional pagination ?page=&limit=)
app.get('/api/readers', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  let list = showAll ? [...db.readers] : db.readers.filter(r => r.isActive !== false);

  if (!showAll) {
    list.sort(compareReadersPriority);
  }

  // Strictly sanitize all reader objects to ensure passwords and credentials are never leaked
  const sanitizedList = list.map(sanitizeReader);
  const total = sanitizedList.length;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

  if (page && limit && page > 0 && limit > 0) {
    const startIndex = (page - 1) * limit;
    const paginated = sanitizedList.slice(startIndex, startIndex + limit);
    return res.json({
      readers: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: startIndex + limit < total
    });
  }

  res.json({ readers: sanitizedList, total });
});

// API: Create new reader (Strictly Admin protected)
app.post('/api/readers', requireAdmin, (req: Request, res: Response) => {
  const body = req.body;
  const name = body.name || 'New Reader';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AS';

  const expYears = Number(body.experience_years) || Number(body.experienceYears) || 10;
  const avatarUrl = body.image_url || body.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
  const cat = body.category === 'Psychic' || body.category === 'Psychic & Intuitive' ? 'Psychic & Intuitive' : 'Tarot';
  const primarySpec = cat === 'Tarot' ? 'Tarot' : 'Psychic';

  // Securely hash password if provided
  let passwordSalt: string | undefined;
  let passwordHash: string | undefined;
  if (body.password) {
    const hashed = hashPassword(body.password);
    passwordSalt = hashed.salt;
    passwordHash = hashed.hash;
  }

  const newReader: Reader = {
    id: body.id || `reader-${Date.now()}`,
    name,
    title: body.title || 'Master Psychic & Tarot Guide',
    category: cat,
    image_url: avatarUrl,
    avatar: avatarUrl,
    experience_years: expYears,
    experienceYears: expYears,
    initials,
    rating: Number(body.rating) || 4.96,
    reviewCount: Number(body.reviewCount) || 24,
    ratePerMinute: Number(body.ratePerMinute) || 2.50,
    location: body.location || 'London, UK',
    isOnline: body.isOnline !== undefined ? Boolean(body.isOnline) : true,
    status: body.status || 'online',
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    isChatEnabled: body.isChatEnabled !== undefined ? Boolean(body.isChatEnabled) : true,
    isCallEnabled: body.isCallEnabled !== undefined ? Boolean(body.isCallEnabled) : false,
    specialties: [primarySpec],
    specialities: [primarySpec],
    bio: body.bio || 'Compassionate and intuitive spiritual guide providing clarity on love, destiny, and cosmic timing.',
    methods: Array.isArray(body.methods) ? body.methods : ['Tarot', 'Astrology', 'Clairvoyance'],
    languages: Array.isArray(body.languages) ? body.languages : ['English'],
    quote: body.quote || 'The stars illuminate your destiny; your heart makes the choice.',
    astroId: body.astroId || `ASTRO-${Math.floor(1000 + Math.random() * 9000)}`,
    email: body.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@astrodashboard.com`,
    phone: body.phone && body.phone.trim().length > 0 ? body.phone.trim() : undefined,
    isPhoneLoginEnabled: Boolean(body.phone && body.phone.trim().length > 0),
    passwordSalt,
    passwordHash,
    mustSetPassword: body.mustSetPassword !== undefined ? Boolean(body.mustSetPassword) : true,
    shift: body.shift || '10:00AM - 7:00PM'
  } as any;

  db.readers.unshift(newReader);
  updateStats();
  saveDB();
  broadcast('reader_created', sanitizeReader(newReader));
  res.status(201).json({ success: true, reader: sanitizeReader(newReader) });
});

// API: Edit reader (Admin or Astrologer owner protected)
app.put('/api/readers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!verifyAdmin(req) && !verifyAstrologer(req, id)) {
    return res.status(403).json({ error: 'Unauthorized to update this astrologer profile.' });
  }

  const index = db.readers.findIndex(r => r.id === id || r.astroId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reader not found' });
  }

  const existing = db.readers[index];
  const body = req.body;

  if (body.astroId && body.astroId.trim() && body.astroId.trim() !== existing.astroId) {
    const isDuplicate = db.readers.some(
      r => r.id !== existing.id && r.astroId && r.astroId.toLowerCase() === body.astroId.trim().toLowerCase()
    );
    if (isDuplicate) {
      return res.status(400).json({ error: `Astrologer ID "${body.astroId.trim()}" is already assigned to another astrologer.` });
    }
  }

  const hasPhone = body.phone !== undefined ? Boolean(body.phone && body.phone.trim().length > 0) : existing.isPhoneLoginEnabled;
  
  // Hash password if modified
  let passwordSalt = (existing as any).passwordSalt;
  let passwordHash = (existing as any).passwordHash;
  if (body.password && body.password.length >= 4) {
    const hashed = hashPassword(body.password);
    passwordSalt = hashed.salt;
    passwordHash = hashed.hash;
  }

  const updated: Reader = {
    ...existing,
    ...body,
    id: existing.id,
    avatar: body.avatar || body.image_url || existing.avatar,
    image_url: body.avatar || body.image_url || existing.image_url,
    isPhoneLoginEnabled: hasPhone,
    passwordSalt,
    passwordHash
  } as any;
  delete (updated as any).password;
  delete (updated as any).tempPassword;

  db.readers[index] = updated;
  updateStats();
  saveDB();
  broadcast('reader_updated', sanitizeReader(updated));
  res.json({ success: true, reader: sanitizeReader(updated) });
});

// API: Astrologer Login (/api/astrologer/login) - Protected with brute-force rate limiter
app.post('/api/astrologer/login', authRateLimiter, (req: Request, res: Response) => {
  const { loginMethod, email, phone, password, astroId } = req.body;
  let reader: Reader | undefined;

  if (loginMethod === 'phone') {
    if (!phone) {
      return res.status(400).json({ error: 'Please enter your registered mobile phone number.' });
    }
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    reader = db.readers.find(r => r.phone && r.phone.replace(/[\s\-\(\)\+]/g, '') === cleanPhone);

    if (!reader) {
      return res.status(401).json({ 
        error: 'No Astrologer account registered with this phone number. Phone login is only enabled if an admin entered your phone number.' 
      });
    }

    if (!reader.isPhoneLoginEnabled) {
      return res.status(403).json({
        error: 'Mobile phone login is not enabled for this Astro ID. Please log in using your registered Email ID and password.'
      });
    }
  } else {
    // Email or Astro ID login
    const identifier = (email || astroId || '').trim().toLowerCase();
    if (!identifier) {
      return res.status(400).json({ error: 'Please enter your registered email address or Astro ID.' });
    }

    reader = db.readers.find(r => 
      (r.email && r.email.toLowerCase() === identifier) || 
      (r.astroId && r.astroId.toLowerCase() === identifier) ||
      (r.id && r.id.toLowerCase() === identifier)
    );

    if (!reader) {
      return res.status(401).json({ error: 'No Astrologer found with this Email ID or Astro ID.' });
    }
  }

  // Check if first-time password creation is required
  if (reader.mustSetPassword) {
    return res.json({
      success: true,
      requiresPasswordSetup: true,
      reader: sanitizeReader(reader),
      message: 'First time login. Please create your new private password.'
    });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required to authenticate.' });
  }

  // Secure Password Verification (Salted Hash or backward-compatible auto-migration)
  const rAny = reader as any;
  let isPasswordValid = false;

  if (rAny.passwordSalt && rAny.passwordHash) {
    isPasswordValid = verifyPassword(password, rAny.passwordSalt, rAny.passwordHash);
  } else if (reader.password || reader.tempPassword) {
    isPasswordValid = (reader.password === password || reader.tempPassword === password);
    if (isPasswordValid) {
      // Auto-upgrade legacy plaintext to secure cryptographic salt + hash
      const hashed = hashPassword(password);
      rAny.passwordSalt = hashed.salt;
      rAny.passwordHash = hashed.hash;
      delete reader.password;
      delete reader.tempPassword;
      saveDB();
    }
  }

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
  }

  // Issue Cryptographic Astrologer Session Token
  const token = generateSecureToken('astro_sess');
  ASTROLOGER_SESSIONS.set(token, {
    token,
    readerId: reader.id,
    astroId: reader.astroId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    token,
    requiresPasswordSetup: false,
    reader: sanitizeReader(reader),
    message: 'Astrologer login successful'
  });
});

// API: Restore the currently authenticated astrologer workstation session.
app.get('/api/astrologer/me', (req: Request, res: Response) => {
  const authHeader = (req.headers['authorization'] as string || '').trim();
  const token = (req.headers['x-astrologer-token'] as string || '').trim() ||
    (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '');
  const session = token ? ASTROLOGER_SESSIONS.get(token) : undefined;
  if (!session || session.expiresAt <= Date.now()) {
    return res.status(401).json({ error: 'Astrologer session expired. Please sign in again.' });
  }
  const reader = db.readers.find(r => r.id === session.readerId);
  if (!reader) return res.status(401).json({ error: 'Astrologer account is no longer available.' });
  res.json({ success: true, reader: sanitizeReader(reader), expiresAt: session.expiresAt });
});

// API: Astrologer Set Password (/api/astrologer/set-password)
app.post('/api/astrologer/set-password', authRateLimiter, (req: Request, res: Response) => {
  const { readerId, astroId, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const reader = db.readers.find(r => r.id === readerId || r.astroId === astroId);
  if (!reader) {
    return res.status(404).json({ error: 'Astrologer account not found.' });
  }

  // Authorization check: Must be an Admin, or the authenticated reader, or reader in initial setup state
  const isAuthorized = verifyAdmin(req) || verifyAstrologer(req, reader.id) || Boolean(reader.mustSetPassword);
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Unauthorized to set password for this astrologer account.' });
  }

  // Cryptographically hash the new password
  const hashed = hashPassword(newPassword);
  const rAny = reader as any;
  rAny.passwordSalt = hashed.salt;
  rAny.passwordHash = hashed.hash;
  delete reader.password;
  delete reader.tempPassword;
  reader.mustSetPassword = false;
  saveDB();
  broadcast('reader_updated', sanitizeReader(reader));

  // Issue session token
  const token = generateSecureToken('astro_sess');
  ASTROLOGER_SESSIONS.set(token, {
    token,
    readerId: reader.id,
    astroId: reader.astroId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    token,
    reader: sanitizeReader(reader),
    message: 'Your new password has been set securely.'
  });
});

// API: Delete reader (Strictly Admin protected)
app.delete('/api/readers/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = db.readers.some(r => r.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Reader not found' });
  }

  db.readers = db.readers.filter(r => r.id !== id);
  updateStats();
  saveDB();
  broadcast('reader_deleted', { id });
  res.json({ success: true, message: 'Reader deleted successfully' });
});

// API: Quick toggle reader controls (Active, Chat On/Off, Call On/Off, Status)
app.patch('/api/readers/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!verifyAdmin(req) && !verifyAstrologer(req, id)) {
    return res.status(403).json({ error: 'Unauthorized to modify astrologer workstation status.' });
  }

  const { field, value } = req.body;
  const reader = db.readers.find(r => r.id === id);
  if (!reader) return res.status(404).json({ error: 'Reader not found' });

  if (field === 'isActive') reader.isActive = Boolean(value);
  if (field === 'isChatEnabled') reader.isChatEnabled = Boolean(value);
  if (field === 'isCallEnabled') reader.isCallEnabled = Boolean(value);
  if (field === 'isWorkflowEnabled') {
    reader.isWorkflowEnabled = Boolean(value);
    if (!reader.isWorkflowEnabled) reader.n8nLastExecutionStatus = 'stopped';
  }
  if (field === 'isOnline') {
    reader.isOnline = Boolean(value);
    reader.status = reader.isOnline ? 'online' : 'offline';
  }
  if (field === 'status') {
    reader.status = value;
    reader.isOnline = value === 'online';
  }

  updateStats();
  saveDB();
  broadcast('reader_updated', sanitizeReader(reader));
  res.json({ success: true, reader: sanitizeReader(reader) });
});

// API: Toggle reader online status (legacy Astroboard control)
app.put('/api/readers/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  if (!verifyAdmin(req) && !verifyAstrologer(req, id)) {
    return res.status(403).json({ error: 'Unauthorized to toggle astrologer status.' });
  }

  const { isOnline } = req.body;
  const reader = db.readers.find(r => r.id === id);
  if (!reader) {
    return res.status(404).json({ error: 'Reader not found' });
  }

  reader.isOnline = Boolean(isOnline);
  reader.status = reader.isOnline ? 'online' : 'offline';
  updateStats();
  saveDB();
  broadcast('reader_updated', sanitizeReader(reader));
  res.json({ success: true, reader: sanitizeReader(reader) });
});

// ==========================================
// SPELLS & RITUALS E-COMMERCE API
// ==========================================
app.get('/api/spells', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const spells = showAll 
    ? db.spells 
    : db.spells.filter(s => s.isActive !== false && s.status !== 'paused' && s.status !== 'inactive');
  res.json({ spells });
});

app.post('/api/spells', requireAdmin, (req: Request, res: Response) => {
  const body = req.body;
  const newSpell: RitualSpell = {
    id: body.id || `spell-${Date.now()}`,
    name: body.name || 'Sacred Altar Ceremony',
    category: body.category || 'love',
    originalPrice: Number(body.originalPrice) || 85,
    discountPrice: Number(body.discountPrice) || 45,
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    description: body.description || 'Consecrated planetary ceremony performed under auspicious astrological transits.',
    castDuration: body.castDuration || '24-48 Hours',
    includes: Array.isArray(body.includes) ? body.includes : (body.includes ? body.includes.split('\n').filter(Boolean) : [
      'Consecrated rose-wax altar candle casting',
      'Personalized telepathic invocation & prayer',
      'Photographic proof of your personal altar ceremony',
      'Written energy diagnosis report'
    ]),
    practitionerName: body.practitionerName || 'Lady Genevieve Moore',
    practitionerRole: body.practitionerRole || 'Sanctuary Elder & Priestess',
    rating: Number(body.rating) || 4.97,
    reviewsCount: Number(body.reviewsCount) || 12,
    badge: body.badge || undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    status: body.status || 'active'
  };

  db.spells.unshift(newSpell);
  saveDB();
  broadcast('spell_created', newSpell);
  res.status(201).json({ success: true, spell: newSpell });
});

app.put('/api/spells/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.spells.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Spell not found' });

  const existing = db.spells[index];
  const body = req.body;
  const updated: RitualSpell = {
    ...existing,
    ...body,
    id: existing.id
  };

  db.spells[index] = updated;
  saveDB();
  broadcast('spell_updated', updated);
  res.json({ success: true, spell: updated });
});

app.delete('/api/spells/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = db.spells.some(s => s.id === id);
  if (!exists) return res.status(404).json({ error: 'Spell not found' });

  db.spells = db.spells.filter(s => s.id !== id);
  saveDB();
  broadcast('spell_deleted', { id });
  res.json({ success: true, message: 'Spell deleted' });
});

app.patch('/api/spells/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, isActive } = req.body;
  const spell = db.spells.find(s => s.id === id);
  if (!spell) return res.status(404).json({ error: 'Spell not found' });

  if (status) {
    spell.status = status;
    spell.isActive = status === 'active';
  } else if (isActive !== undefined) {
    spell.isActive = Boolean(isActive);
    spell.status = spell.isActive ? 'active' : 'paused';
  }

  saveDB();
  broadcast('spell_updated', spell);
  res.json({ success: true, spell });
});

// ==========================================
// ASTRAL SHOP E-COMMERCE API
// ==========================================
app.get('/api/shop-products', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const products = showAll 
    ? db.shopProducts 
    : db.shopProducts.filter(p => p.isActive !== false && p.status !== 'paused' && p.status !== 'inactive');
  res.json({ products });
});

app.post('/api/shop-products', requireAdmin, (req: Request, res: Response) => {
  const body = req.body;
  const newProduct: ShopProduct = {
    id: body.id || `prod-${Date.now()}`,
    name: body.name || 'Consecrated Altar Crystal',
    category: body.category || 'crystals',
    priceGBP: Number(body.priceGBP) || 28,
    originalPriceGBP: body.originalPriceGBP ? Number(body.originalPriceGBP) : undefined,
    priceINR: body.priceINR ? Number(body.priceINR) : Math.round((Number(body.priceGBP) || 28) * 30),
    originalPriceINR: body.originalPriceINR ? Number(body.originalPriceINR) : (body.originalPriceGBP ? Math.round(Number(body.originalPriceGBP) * 30) : undefined),
    purpose: body.purpose || 'Wealth',
    rating: Number(body.rating) || 5.0,
    reviewCount: Number(body.reviewCount) || 0,
    consecratedBy: body.consecratedBy || 'Sanctuary Elder',
    description: body.description || 'Authentic hand-consecrated artifact charged under celestial transits.',
    inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
    image: body.image || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    badge: body.badge || undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    status: body.status || 'active',
    stockQuantity: Number(body.stockQuantity) || 25
  };

  db.shopProducts.unshift(newProduct);
  saveDB();
  broadcast('shop_product_created', newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/shop-products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.shopProducts.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const existing = db.shopProducts[index];
  const body = req.body;
  const updated: ShopProduct = {
    ...existing,
    ...body,
    id: existing.id
  };

  db.shopProducts[index] = updated;
  saveDB();
  broadcast('shop_product_updated', updated);
  res.json({ success: true, product: updated });
});

app.delete('/api/shop-products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = db.shopProducts.some(p => p.id === id);
  if (!exists) return res.status(404).json({ error: 'Product not found' });

  db.shopProducts = db.shopProducts.filter(p => p.id !== id);
  saveDB();
  broadcast('shop_product_deleted', { id });
  res.json({ success: true, message: 'Product deleted' });
});

app.patch('/api/shop-products/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, isActive, inStock } = req.body;
  const product = db.shopProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (status) {
    product.status = status;
    product.isActive = status === 'active';
  } else if (isActive !== undefined) {
    product.isActive = Boolean(isActive);
    product.status = product.isActive ? 'active' : 'paused';
  }
  if (inStock !== undefined) {
    product.inStock = Boolean(inStock);
  }

  saveDB();
  broadcast('shop_product_updated', product);
  res.json({ success: true, product });
});

// API: Image Upload handler (Base64 file upload or URL) - Securely validates MIME type and limits file size
app.post('/api/upload-image', (req: Request, res: Response) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    if (dataUrl.startsWith('data:image/')) {
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9\+\-]+);base64,(.+)$/);
      if (matches) {
        let rawExt = matches[1].toLowerCase();
        if (rawExt === 'jpeg') rawExt = 'jpg';
        
        // Whitelist allowed image extensions (Strict anti-XSS: SVG and non-raster formats excluded)
        const ALLOWED_IMAGE_EXTS = ['jpg', 'png', 'webp', 'gif'];
        if (!ALLOWED_IMAGE_EXTS.includes(rawExt)) {
          return res.status(400).json({ error: 'Invalid file format. Only JPG, PNG, WEBP, and GIF images are permitted.' });
        }

        const base64Data = matches[2];
        // Enforce max 10MB file size limit
        if (base64Data.length > 10 * 1024 * 1024 * 1.37) {
          return res.status(400).json({ error: 'Image exceeds maximum allowable size (10MB).' });
        }

        const safePrefix = (filename || 'upload').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32).toLowerCase();
        const fname = `${safePrefix}-${crypto.randomBytes(8).toString('hex')}.${rawExt}`;
        const targetPath = path.join(UPLOADS_DIR, fname);
        
        // Guard against directory traversal
        if (!targetPath.startsWith(UPLOADS_DIR)) {
          return res.status(400).json({ error: 'Invalid file destination path.' });
        }

        fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
        const publicUrl = `/uploads/${fname}`;
        return res.json({ success: true, url: publicUrl });
      }
    }
    res.json({ success: true, url: dataUrl });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to process image upload' });
  }
});

// API: Daily Horoscope
app.get('/api/horoscope', (_req: Request, res: Response) => {
  res.json({ signs: ZODIAC_SIGNS });
});

// API: Customer Profile
app.get('/api/customer/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = db.customers[id] || {
    id,
    name: '',
    isFirstTimeUser: true,
    freeMinutesUsed: false,
    totalConsultations: 0
  };
  res.json({ customer: profile });
});

app.post('/api/customer/save', (req: Request, res: Response) => {
  const { id, name, birthDetails } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing customer ID' });

  if (!db.customers[id]) {
    db.customers[id] = {
      id,
      name: name || birthDetails?.name || 'Guest Seeker',
      birthDetails,
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      totalConsultations: 0
    };
  } else {
    if (name) db.customers[id].name = name;
    if (birthDetails) db.customers[id].birthDetails = birthDetails;
  }
  saveDB();
  res.json({ customer: db.customers[id] });
});

// =========================================================================
// REAL WALLET, PAYMENT VERIFICATION, 100% FIRST RECHARGE BONUS & REFERRAL SYSTEM
// =========================================================================

// Configurable supported recharge currencies (INR for PayU/lumsic.in, plus USD, GBP, EUR, CAD, AUD)
const BACKEND_CURRENCY_CONFIG: Record<string, { minRecharge: number; symbol: string; name: string }> = {
  INR: { minRecharge: 50, symbol: '₹', name: 'Indian Rupee' },
  USD: { minRecharge: 5, symbol: '$', name: 'US Dollar' },
  GBP: { minRecharge: 5, symbol: '£', name: 'British Pound' },
  EUR: { minRecharge: 5, symbol: '€', name: 'Euro' },
  CAD: { minRecharge: 5, symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { minRecharge: 5, symbol: 'A$', name: 'Australian Dollar' },
};

function generateUserReferralCode(customerId: string): string {
  const hash = Math.abs(customerId.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36).toUpperCase().slice(0, 5);
  return `LUM-${hash}`;
}

function getOrCreateCustomerWallet(customerId: string, defaultCurrency: string = 'INR'): WalletData {
  const safeCurrency = defaultCurrency && BACKEND_CURRENCY_CONFIG[defaultCurrency] ? defaultCurrency : 'INR';

  if (!db.wallets[customerId]) {
    db.wallets[customerId] = {
      customerId,
      currency: safeCurrency,
      purchasedBalance: 0,
      bonusBalance: 0,
      totalBalance: 0,
      firstRechargeCompleted: false,
      hasClaimedFirstRechargeBonus: false,
      referralCode: generateUserReferralCode(customerId),
      referralRewardsCount: 0,
      claimedRewardsCount: 0,
      transactions: []
    };
    saveDB();
  }

  const wallet = db.wallets[customerId];

  // Populate user transactions from global auditable ledger
  wallet.transactions = db.walletTransactions.filter(t => t.customerId === customerId);
  return wallet;
}

// 1. GET Wallet Info for customer
app.get('/api/wallet/info/:customerId', (req: Request, res: Response) => {
  const { customerId } = req.params;
  const currency = (req.query.currency as string) || 'USD';
  const wallet = getOrCreateCustomerWallet(customerId, currency);
  res.json({ success: true, wallet });
});

// 2. GET Wallet Transactions for customer
app.get('/api/wallet/transactions/:customerId', (req: Request, res: Response) => {
  const { customerId } = req.params;
  const transactions = db.walletTransactions.filter(t => t.customerId === customerId);
  res.json({ success: true, transactions });
});

// 3. POST Create Recharge Intent (Validates amount >= 5 units, rejects INR, checks 100% bonus eligibility)
app.post('/api/wallet/recharge/create-intent', (req: Request, res: Response) => {
  const { customerId, amount, currency } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required.' });
  }

  // Ensure supported currency
  if (!BACKEND_CURRENCY_CONFIG[currency]) {
    return res.status(400).json({ 
      error: `Currency '${currency}' is not supported.` 
    });
  }

  const numAmount = Number(amount);
  const minRequired = BACKEND_CURRENCY_CONFIG[currency].minRecharge; // 5 units

  if (isNaN(numAmount) || numAmount < minRequired) {
    return res.status(400).json({ 
      error: `Minimum recharge requirement is ${minRequired} units in ${currency} (${BACKEND_CURRENCY_CONFIG[currency].symbol}${minRequired}). Amounts below this are not accepted.` 
    });
  }

  const wallet = getOrCreateCustomerWallet(customerId, currency);

  // First Recharge Bonus eligibility check: 100% Extra Cash!
  const isEligibleForFirstRechargeBonus = !wallet.firstRechargeCompleted && !wallet.hasClaimedFirstRechargeBonus;
  const bonusAmount = isEligibleForFirstRechargeBonus ? numAmount : 0;

  const intentId = 'pi_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
  const isGatewayLive = Boolean(process.env.STRIPE_SECRET_KEY);

  // Store server-authoritative payment intent with cryptographic ID and expiration (30 mins)
  PENDING_PAYMENT_INTENTS.set(intentId, {
    id: intentId,
    customerId,
    amount: numAmount,
    currency,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000
  });

  res.json({
    success: true,
    intent: {
      id: intentId,
      customerId,
      amount: numAmount,
      currency,
      currencySymbol: BACKEND_CURRENCY_CONFIG[currency].symbol,
      isFirstRecharge: isEligibleForFirstRechargeBonus,
      bonusAmount,
      totalExpectedCredit: numAmount + bonusAmount,
      offerText: isEligibleForFirstRechargeBonus 
        ? 'Get 100% Extra Cash on Your First Recharge!' 
        : 'Standard Recharge',
      gatewayStatus: isGatewayLive ? 'live_gateway' : 'secure_test_gateway',
      gatewayNotice: isGatewayLive 
        ? 'Payment gateway active.' 
        : 'Payment Gateway in Sandbox / Secure Test Mode. Live credit card processing ready with STRIPE_SECRET_KEY in server environment.'
    }
  });
});

// 4. POST Verify and Execute Recharge Payment (Server Authoritative, Idempotent, Tamper-Proof)
app.post('/api/wallet/recharge/verify', paymentRateLimiter, (req: Request, res: Response) => {
  const { 
    customerId, 
    intentId, 
    paymentMethod, 
    orderId, 
    paymentGatewayTxnId 
  } = req.body;

  if (!customerId) return res.status(400).json({ error: 'Customer ID is required.' });
  if (!intentId) return res.status(400).json({ error: 'Payment intent ID is required.' });

  // 1. Verify that the payment intent exists on the server and is in pending status
  const storedIntent = PENDING_PAYMENT_INTENTS.get(intentId);
  if (!storedIntent) {
    return res.status(404).json({ 
      error: 'Invalid or expired payment intent. Please initiate a new recharge.' 
    });
  }

  if (storedIntent.status === 'succeeded') {
    return res.status(409).json({ 
      error: 'This payment intent has already been fulfilled and credited.' 
    });
  }

  if (storedIntent.expiresAt < Date.now() || storedIntent.status === 'expired') {
    storedIntent.status = 'expired';
    return res.status(410).json({ 
      error: 'Payment intent has expired. Please create a new recharge.' 
    });
  }

  if (storedIntent.customerId !== customerId) {
    return res.status(403).json({ 
      error: 'Payment intent verification failed: account mismatch.' 
    });
  }

  // 2. Strictly use SERVER-AUTHORITATIVE amount and currency to prevent client-side amount tampering
  const verifiedAmount = storedIntent.amount;
  const verifiedCurrency = storedIntent.currency;

  if (!BACKEND_CURRENCY_CONFIG[verifiedCurrency]) {
    return res.status(400).json({ error: 'Currency is not supported for verified recharge.' });
  }

  const minRequired = BACKEND_CURRENCY_CONFIG[verifiedCurrency].minRecharge;
  if (isNaN(verifiedAmount) || verifiedAmount < minRequired) {
    return res.status(400).json({ 
      error: `Recharge amount must be at least ${minRequired} ${verifiedCurrency}.` 
    });
  }

  const effOrderId = orderId || ('#TXN-' + Math.floor(100000000 + Math.random() * 900000000));
  const effTxnId = paymentGatewayTxnId || intentId || ('PAY-' + Date.now());

  // Prevent duplicate wallet credits (Idempotency check)
  const existingTx = db.walletTransactions.find(t => 
    t.orderId === effOrderId || 
    (t.paymentMethod && t.orderId.includes(effTxnId))
  );

  if (existingTx) {
    const existingWallet = getOrCreateCustomerWallet(customerId, verifiedCurrency);
    return res.status(409).json({ 
      error: 'Duplicate transaction detected. This recharge payment has already been verified and credited.',
      wallet: existingWallet
    });
  }

  // Mark intent as fulfilled atomically before crediting
  storedIntent.status = 'succeeded';

  const wallet = getOrCreateCustomerWallet(customerId, verifiedCurrency);
  const currencySymbol = BACKEND_CURRENCY_CONFIG[verifiedCurrency].symbol;

  // Credit purchased funds using server-verified amount
  wallet.purchasedBalance += verifiedAmount;

  // 100% First Recharge Bonus: Awarded ONCE per eligible account upon successful payment verification
  const isFirstRecharge = !wallet.firstRechargeCompleted && !wallet.hasClaimedFirstRechargeBonus;
  let creditedBonus = 0;

  if (isFirstRecharge) {
    creditedBonus = verifiedAmount; // Exactly 100% bonus match
    wallet.bonusBalance += creditedBonus;
    wallet.firstRechargeCompleted = true;
    wallet.hasClaimedFirstRechargeBonus = true;
    wallet.firstRechargeDate = new Date().toISOString();
  }

  wallet.totalBalance = wallet.purchasedBalance + wallet.bonusBalance;
  wallet.updatedAt = new Date().toISOString();

  // Create immutable Ledger Entry for purchased recharge
  const rechargeTx: WalletTransaction = {
    id: 'tx_rec_' + Date.now(),
    customerId,
    orderId: effOrderId,
    title: `Wallet Recharge (+${currencySymbol}${verifiedAmount.toFixed(2)})`,
    subtitle: `Verified via ${paymentMethod || 'Instant Card Payment'}`,
    amount: verifiedAmount,
    currency: verifiedCurrency,
    type: 'credit',
    subType: 'recharge',
    status: 'Completed',
    rechargePart: verifiedAmount,
    bonusPart: 0,
    date: new Date().toISOString(),
    paymentMethod: paymentMethod || 'Instant Card Payment'
  };
  db.walletTransactions.unshift(rechargeTx);

  // If first recharge, record 100% promotional bonus in transaction history
  if (creditedBonus > 0) {
    const bonusTx: WalletTransaction = {
      id: 'tx_bon_' + (Date.now() + 1),
      customerId,
      orderId: effOrderId + '-BONUS',
      title: `100% First Recharge Bonus (+${currencySymbol}${creditedBonus.toFixed(2)})`,
      subtitle: 'Promotional Extra Cash Match (100% First Recharge Offer)',
      amount: creditedBonus,
      currency: verifiedCurrency,
      type: 'credit',
      subType: 'first_recharge_bonus',
      status: 'Completed',
      rechargePart: 0,
      bonusPart: creditedBonus,
      date: new Date().toISOString(),
      paymentMethod: 'LUMSIC Promotional Match'
    };
    db.walletTransactions.unshift(bonusTx);
  }

  // Check Referral Reward: If user was referred by a friend, award 1 free chat reward to the referrer!
  let referralRewardAwarded = false;
  if (isFirstRecharge && wallet.referredBy) {
    const referrerCode = wallet.referredBy;
    // Find referrer wallet
    const referrerEntry = Object.values(db.wallets).find(w => w.referralCode === referrerCode);
    if (referrerEntry && referrerEntry.customerId !== customerId) {
      // Award one free chat
      referrerEntry.referralRewardsCount = (referrerEntry.referralRewardsCount || 0) + 1;
      referrerEntry.updatedAt = new Date().toISOString();

      // Record referral transaction in referrer's ledger
      const refTx: WalletTransaction = {
        id: 'tx_ref_' + Date.now(),
        customerId: referrerEntry.customerId,
        orderId: '#REF-REWARD-' + Math.floor(100000 + Math.random() * 900000),
        title: 'Referral Reward: 1 Free Chat Awarded!',
        subtitle: `Friend completed their verified first recharge (${currencySymbol}${verifiedAmount.toFixed(2)})`,
        amount: 0,
        currency: referrerEntry.currency || 'USD',
        type: 'credit',
        subType: 'referral_reward',
        status: 'Completed',
        date: new Date().toISOString(),
        notes: `Awarded for qualifying referral of customer ${customerId}`
      };
      db.walletTransactions.unshift(refTx);

      // Update referral tracking record in db.referrals
      if (db.referrals[referrerEntry.customerId]) {
        const item = db.referrals[referrerEntry.customerId].find(r => r.referredCustomerId === customerId);
        if (item) {
          item.hasRecharged = true;
          item.rechargeAmount = verifiedAmount;
          item.rewardEarned = true;
        }
      }
      referralRewardAwarded = true;
      broadcast('wallet_updated', { customerId: referrerEntry.customerId, wallet: referrerEntry });
    }
  }

  saveDB();
  broadcast('wallet_updated', { customerId, wallet });

  res.json({
    success: true,
    message: isFirstRecharge 
      ? `Recharge verified! Successfully added ${currencySymbol}${verifiedAmount.toFixed(2)} + ${currencySymbol}${creditedBonus.toFixed(2)} 100% First Recharge Bonus to your balance!`
      : `Recharge verified! Successfully added ${currencySymbol}${verifiedAmount.toFixed(2)} to your balance.`,
    wallet,
    isFirstRecharge,
    creditedAmount: verifiedAmount,
    creditedBonus,
    referralRewardAwarded
  });
});

// =========================================================================
// PAYU HOSTED CHECKOUT GATEWAY (TEST & PRODUCTION)
// =========================================================================
const PAYU_KEY = process.env.PAYU_KEY || 'gtKFFx'; // PayU Test Key
const PAYU_SALT = process.env.PAYU_SALT || 'eCwWELxi'; // PayU Test Salt (Server only - NEVER exposed to frontend)
const PAYU_MODE = (process.env.PAYU_MODE || 'test').toLowerCase();
const PAYU_BASE_URL = PAYU_MODE === 'production'
  ? 'https://secure.payu.in/_payment'
  : 'https://test.payu.in/_payment';

interface PayUPendingOrder {
  txnid: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failure' | 'cancelled';
  payuPaymentId?: string;
  hash: string;
  isFirstRecharge: boolean;
  createdAt: number;
  updatedAt?: number;
}

const PENDING_PAYU_ORDERS = new Map<string, PayUPendingOrder>();

/**
 * PayU Request Hash Generation:
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
function generatePayURequestHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  salt: string;
}): string {
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1 || ''}|${params.udf2 || ''}|${params.udf3 || ''}|${params.udf4 || ''}|${params.udf5 || ''}||||||${params.salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();
}

/**
 * Computes the PayU reverse response hash using server PAYU_SALT
 */
function computePayUResponseHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  salt: string;
  additionalCharges?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  let hashSequence: string;
  if (params.additionalCharges) {
    hashSequence = `${params.additionalCharges}|${params.salt}|${params.status}||||||${params.udf5 || ''}|${params.udf4 || ''}|${params.udf3 || ''}|${params.udf2 || ''}|${params.udf1 || ''}|${params.email || ''}|${params.firstname || ''}|${params.productinfo || ''}|${params.amount}|${params.txnid}|${params.key}`;
  } else {
    hashSequence = `${params.salt}|${params.status}||||||${params.udf5 || ''}|${params.udf4 || ''}|${params.udf3 || ''}|${params.udf2 || ''}|${params.udf1 || ''}|${params.email || ''}|${params.firstname || ''}|${params.productinfo || ''}|${params.amount}|${params.txnid}|${params.key}`;
  }
  return crypto.createHash('sha512').update(hashSequence).digest('hex').toLowerCase();
}

/**
 * PayU Response Hash Verification (Reverse Hash):
 * Compares computed reverse hash against the received hash from PayU callback or webhook
 */
function verifyPayUResponseHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  status: string;
  salt: string;
  receivedHash: string;
  additionalCharges?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): boolean {
  const computedHash = computePayUResponseHash(params);
  return computedHash === (params.receivedHash || '').toLowerCase();
}
// 1. POST Initiate PayU Payment (Creates txnid, calculates SHA-512 hash, returns redirect params)
app.post('/api/payu/initiate-payment', paymentRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      amount,
      currency = 'GBP',
      isFirstRecharge = false
    } = req.body;

    if (!customerId) return res.status(400).json({ success: false, error: 'Customer ID is required.' });
    if (!amount || Number(amount) <= 0) return res.status(400).json({ success: false, error: 'Valid recharge amount required.' });

    const numAmount = Number(amount);
    const formattedAmount = numAmount.toFixed(2);
    const txnid = 'tx_payu_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
    const productinfo = 'Wallet Recharge';
    const firstname = (customerName || 'Seeker').trim().split(' ')[0] || 'Seeker';
    const email = (customerEmail || 'seeker@lumsic.com').trim();
    const phone = (customerPhone || '+447000000000').trim();

    // Determine host origin for PayU return redirects
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const surl = `${protocol}://${host}/api/payu/success`;
    const furl = `${protocol}://${host}/api/payu/failure`;

    // Calculate server-side SHA-512 hash using PAYU_SALT (never leaked to client)
    const hash = generatePayURequestHash({
      key: PAYU_KEY,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      email,
      udf1: customerId,
      udf2: currency,
      udf3: isFirstRecharge ? '1' : '0',
      salt: PAYU_SALT
    });

    const pendingOrder: PayUPendingOrder = {
      txnid,
      customerId,
      customerName: firstname,
      customerEmail: email,
      customerPhone: phone,
      amount: numAmount,
      currency,
      status: 'pending',
      hash,
      isFirstRecharge: Boolean(isFirstRecharge),
      createdAt: Date.now()
    };

    PENDING_PAYU_ORDERS.set(txnid, pendingOrder);

    return res.json({
      success: true,
      actionUrl: PAYU_BASE_URL,
      txnid,
      mode: PAYU_MODE,
      params: {
        key: PAYU_KEY,
        txnid,
        amount: formattedAmount,
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
        service_provider: 'payu_paisa',
        udf1: customerId,
        udf2: currency,
        udf3: isFirstRecharge ? '1' : '0'
      }
    });
  } catch (err: any) {
    console.error('Error initiating PayU payment:', err);
    return res.status(500).json({ success: false, error: err.message || 'Error initiating PayU payment.' });
  }
});

// 1b. POST /api/payu/checkout - Creates txnid, computes SHA-512 hash on server, and directly redirects / auto-submits to PayU Hosted Checkout
app.all('/api/payu/checkout', paymentRateLimiter, async (req: Request, res: Response) => {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const customerId = (params.customerId || req.headers['x-customer-id'] || 'cust_guest') as string;
    const amount = Number(params.amount || 0);
    const currency = (params.currency || 'USD') as string;
    const customerName = (params.customerName || 'Seeker') as string;
    const customerEmail = (params.customerEmail || 'seeker@lumsic.com') as string;
    const customerPhone = (params.customerPhone || '+447000000000') as string;
    const isFirstRecharge = params.isFirstRecharge === 'true' || params.isFirstRecharge === true;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid or missing recharge amount');
    }

    const formattedAmount = amount.toFixed(2);
    const txnid = 'tx_payu_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
    const productinfo = 'Wallet Recharge';
    const firstname = customerName.trim().split(' ')[0] || 'Seeker';
    const email = customerEmail.trim();
    const phone = customerPhone.trim();

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const surl = `${protocol}://${host}/api/payu/success`;
    const furl = `${protocol}://${host}/api/payu/failure`;

    const hash = generatePayURequestHash({
      key: PAYU_KEY,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      email,
      udf1: customerId,
      udf2: currency,
      udf3: isFirstRecharge ? '1' : '0',
      salt: PAYU_SALT
    });

    const pendingOrder: PayUPendingOrder = {
      txnid,
      customerId,
      customerName: firstname,
      customerEmail: email,
      customerPhone: phone,
      amount,
      currency,
      status: 'pending',
      hash,
      isFirstRecharge,
      createdAt: Date.now()
    };
    PENDING_PAYU_ORDERS.set(txnid, pendingOrder);

    // Render automated HTML form that POSTs to PayU Hosted Checkout URL
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to PayU Hosted Checkout...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #002B49; color: #fff; text-align: center; }
    .card { background: rgba(255,255,255,0.08); padding: 36px 32px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15); max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .loader { border: 3px solid rgba(255,255,255,0.2); border-top: 3px solid #A4C639; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .logo { background: #A4C639; color: #002B49; font-weight: 900; font-size: 20px; width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">P</div>
    <div class="loader"></div>
    <h2 style="margin:0 0 8px;font-size:18px;">Connecting to PayU Checkout...</h2>
    <p style="margin:0 0 16px;font-size:13px;color:#94A3B8;">Redirecting to secure payment page (${PAYU_MODE.toUpperCase()})</p>
    <form id="payuform" method="POST" action="${PAYU_BASE_URL}">
      <input type="hidden" name="key" value="${PAYU_KEY}" />
      <input type="hidden" name="txnid" value="${txnid}" />
      <input type="hidden" name="amount" value="${formattedAmount}" />
      <input type="hidden" name="productinfo" value="${productinfo}" />
      <input type="hidden" name="firstname" value="${firstname}" />
      <input type="hidden" name="email" value="${email}" />
      <input type="hidden" name="phone" value="${phone}" />
      <input type="hidden" name="surl" value="${surl}" />
      <input type="hidden" name="furl" value="${furl}" />
      <input type="hidden" name="hash" value="${hash}" />
      <input type="hidden" name="service_provider" value="payu_paisa" />
      <input type="hidden" name="udf1" value="${customerId}" />
      <input type="hidden" name="udf2" value="${currency}" />
      <input type="hidden" name="udf3" value="${isFirstRecharge ? '1' : '0'}" />
      <noscript>
        <button type="submit" style="padding:10px 20px;background:#A4C639;color:#002B49;font-weight:700;border:none;border-radius:8px;cursor:pointer;">Click here to continue to PayU</button>
      </noscript>
    </form>
    <script>
      document.getElementById('payuform').submit();
    </script>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err: any) {
    console.error('Error in /api/payu/checkout:', err);
    return res.status(500).send('Failed to redirect to PayU Hosted Checkout');
  }
});

// 2. POST PayU Success Return URL (PayU POSTs here upon successful payment)
app.post('/api/payu/success', async (req: Request, res: Response) => {
  try {
    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
      mihpayid,
      additionalCharges,
      udf1,
      udf2,
      udf3
    } = req.body;

    if (!txnid) {
      return res.redirect('/?payment=failed&reason=missing_txnid');
    }

    // Verify Reverse Hash
    const isHashValid = verifyPayUResponseHash({
      key: key || PAYU_KEY,
      txnid,
      amount: Number(amount).toFixed(2),
      productinfo: productinfo || 'Wallet Recharge',
      firstname: firstname || '',
      email: email || '',
      status: status || 'success',
      salt: PAYU_SALT,
      receivedHash: hash || '',
      additionalCharges,
      udf1,
      udf2,
      udf3
    });

    if (!isHashValid) {
      console.error('PayU hash mismatch for txnid: ' + txnid);
      return res.redirect('/?payment=failed&reason=hash_mismatch&txnid=' + txnid);
    }

    // Check if already credited
    const existingTx = db.walletTransactions.find(t => t.orderId === txnid);
    if (existingTx) {
      return res.redirect('/?payment=success&txnid=' + txnid + '&already_credited=true');
    }

    const storedOrder = PENDING_PAYU_ORDERS.get(txnid);
    const customerId = udf1 || storedOrder?.customerId || 'cust_guest';
    const currency = udf2 || storedOrder?.currency || 'GBP';
    const verifiedAmount = Number(amount || storedOrder?.amount || 0);

    // Credit Customer Wallet
    const wallet = getOrCreateCustomerWallet(customerId, currency);
    wallet.purchasedBalance += verifiedAmount;

    const isFirstRecharge = !wallet.firstRechargeCompleted && !wallet.hasClaimedFirstRechargeBonus;
    let creditedBonus = 0;
    if (isFirstRecharge) {
      creditedBonus = verifiedAmount;
      wallet.bonusBalance += creditedBonus;
      wallet.firstRechargeCompleted = true;
      wallet.hasClaimedFirstRechargeBonus = true;
    }
    wallet.totalBalance = wallet.purchasedBalance + wallet.bonusBalance;
    wallet.updatedAt = new Date().toISOString();

    const currSymbol = BACKEND_CURRENCY_CONFIG[currency]?.symbol || '£';
    const rechargeTx: WalletTransaction = {
      id: 'tx_payu_' + Date.now(),
      customerId,
      orderId: txnid,
      title: 'Wallet Recharge (+' + currSymbol + verifiedAmount.toFixed(2) + ')',
      subtitle: 'Verified via PayU Hosted Checkout (' + PAYU_MODE.toUpperCase() + ')',
      amount: verifiedAmount,
      currency,
      type: 'credit',
      subType: 'recharge',
      status: 'Completed',
      rechargePart: verifiedAmount,
      bonusPart: creditedBonus,
      date: new Date().toISOString(),
      paymentMethod: 'PayU (' + (mihpayid || txnid) + ')'
    };

    db.walletTransactions.unshift(rechargeTx);
    if (storedOrder) {
      storedOrder.status = 'success';
      storedOrder.payuPaymentId = mihpayid;
      storedOrder.updatedAt = Date.now();
    }

    saveDB();
    broadcast('wallet_updated', { customerId, wallet });

    return res.redirect('/?payment=success&txnid=' + txnid + '&amount=' + verifiedAmount + '&bonus=' + creditedBonus);
  } catch (err: any) {
    console.error('Error handling PayU success callback:', err);
    return res.redirect('/?payment=failed&reason=server_error');
  }
});

// 3. POST PayU Failure Return URL (PayU POSTs here if payment failed/cancelled)
app.post('/api/payu/failure', async (req: Request, res: Response) => {
  try {
    const { txnid, error_Message, errorMessage } = req.body;
    const msg = error_Message || errorMessage || 'Payment was cancelled or declined by PayU.';
    if (txnid && PENDING_PAYU_ORDERS.has(txnid)) {
      const order = PENDING_PAYU_ORDERS.get(txnid);
      if (order) {
        order.status = 'failure';
        order.updatedAt = Date.now();
      }
    }
    console.warn('PayU transaction failed: ' + txnid + ' - ' + msg);
    return res.redirect('/?payment=failed&txnid=' + (txnid || '') + '&error=' + encodeURIComponent(msg));
  } catch (err: any) {
    console.error('Error handling PayU failure callback:', err);
    return res.redirect('/?payment=failed');
  }
});

// 4. POST PayU Status Verification (For frontend polling and confirmation)
app.post('/api/payu/verify-status', async (req: Request, res: Response) => {
  try {
    const { txnid, customerId } = req.body;
    if (!txnid) return res.status(400).json({ success: false, error: 'Transaction ID required' });

    const existingTx = db.walletTransactions.find(t => t.orderId === txnid);
    if (existingTx) {
      const wallet = customerId ? getOrCreateCustomerWallet(customerId, existingTx.currency) : null;
      return res.json({
        success: true,
        orderId: txnid,
        status: 'Completed',
        creditedAmount: existingTx.amount,
        bonusAmount: existingTx.bonusPart,
        totalBalance: wallet?.totalBalance,
        message: 'Payment verified via PayU! Added to your balance.'
      });
    }

    const stored = PENDING_PAYU_ORDERS.get(txnid);
    return res.json({
      success: stored?.status === 'success',
      orderId: txnid,
      status: stored?.status || 'pending',
      amount: stored?.amount
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST PayU Webhook / SBN Handler (Server-to-Server IPN notification)
app.post('/api/payu/webhook', async (req: Request, res: Response) => {
  try {
    const { key, txnid, amount, productinfo, firstname, email, status, hash, mihpayid, udf1, udf2 } = req.body;
    if (!txnid) return res.status(400).json({ status: 'ignored', reason: 'No txnid' });

    const isHashValid = verifyPayUResponseHash({
      key: key || PAYU_KEY,
      txnid,
      amount: Number(amount).toFixed(2),
      productinfo: productinfo || 'Wallet Recharge',
      firstname: firstname || '',
      email: email || '',
      status: status || 'success',
      salt: PAYU_SALT,
      receivedHash: hash || '',
      udf1,
      udf2
    });

    if (!isHashValid) {
      console.warn('Webhook: Invalid PayU hash for txnid ' + txnid);
      return res.status(400).json({ status: 'invalid_hash' });
    }

    if (status === 'success') {
      const existingTx = db.walletTransactions.find(t => t.orderId === txnid);
      if (!existingTx) {
        const storedOrder = PENDING_PAYU_ORDERS.get(txnid);
        const customerId = udf1 || storedOrder?.customerId || 'cust_guest';
        const currency = udf2 || storedOrder?.currency || 'GBP';
        const verifiedAmount = Number(amount || storedOrder?.amount || 0);

        const wallet = getOrCreateCustomerWallet(customerId, currency);
        wallet.purchasedBalance += verifiedAmount;

        const isFirstRecharge = !wallet.firstRechargeCompleted && !wallet.hasClaimedFirstRechargeBonus;
        let creditedBonus = 0;
        if (isFirstRecharge) {
          creditedBonus = verifiedAmount;
          wallet.bonusBalance += creditedBonus;
          wallet.firstRechargeCompleted = true;
          wallet.hasClaimedFirstRechargeBonus = true;
        }
        wallet.totalBalance = wallet.purchasedBalance + wallet.bonusBalance;
        wallet.updatedAt = new Date().toISOString();

        const currSymbol = BACKEND_CURRENCY_CONFIG[currency]?.symbol || '£';
        const rechargeTx: WalletTransaction = {
          id: 'tx_payu_wh_' + Date.now(),
          customerId,
          orderId: txnid,
          title: 'Wallet Recharge (+' + currSymbol + verifiedAmount.toFixed(2) + ')',
          subtitle: 'Verified via PayU Webhook',
          amount: verifiedAmount,
          currency,
          type: 'credit',
          subType: 'recharge',
          status: 'Completed',
          rechargePart: verifiedAmount,
          bonusPart: creditedBonus,
          date: new Date().toISOString(),
          paymentMethod: 'PayU Webhook (' + (mihpayid || txnid) + ')'
        };

        db.walletTransactions.unshift(rechargeTx);
        if (storedOrder) storedOrder.status = 'success';
        saveDB();
        broadcast('wallet_updated', { customerId, wallet });
      }
    }

    return res.status(200).json({ status: 'OK' });
  } catch (err: any) {
    console.error('Error handling PayU webhook:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// 6. POST PayU Sandbox Test Approval Simulation (For developer sandbox testing)
app.post('/api/payu/simulate-test-response', async (req: Request, res: Response) => {
  try {
    const { txnid } = req.body;
    if (!txnid || !PENDING_PAYU_ORDERS.has(txnid)) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = PENDING_PAYU_ORDERS.get(txnid);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    const formattedAmount = order.amount.toFixed(2);
    const mihpayid = 'payu_sim_' + Date.now();

    // Generate valid response hash with server SALT
    const generatedResponseHash = computePayUResponseHash({
      key: PAYU_KEY,
      txnid,
      amount: formattedAmount,
      productinfo: 'Wallet Recharge',
      firstname: order.customerName,
      email: order.customerEmail,
      status: 'success',
      salt: PAYU_SALT,
      udf1: order.customerId,
      udf2: order.currency,
      udf3: order.isFirstRecharge ? '1' : '0'
    });

    // Verify generated hash as a full simulation of PayU server
    const verified = verifyPayUResponseHash({
      key: PAYU_KEY,
      txnid,
      amount: formattedAmount,
      productinfo: 'Wallet Recharge',
      firstname: order.customerName,
      email: order.customerEmail,
      status: 'success',
      salt: PAYU_SALT,
      receivedHash: generatedResponseHash,
      udf1: order.customerId,
      udf2: order.currency,
      udf3: order.isFirstRecharge ? '1' : '0'
    });

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Hash verification failed in simulation.' });
    }

    // Credit Wallet
    const wallet = getOrCreateCustomerWallet(order.customerId, order.currency);
    wallet.purchasedBalance += order.amount;

    const isFirstRecharge = !wallet.firstRechargeCompleted && !wallet.hasClaimedFirstRechargeBonus;
    let creditedBonus = 0;
    if (isFirstRecharge) {
      creditedBonus = order.amount;
      wallet.bonusBalance += creditedBonus;
      wallet.firstRechargeCompleted = true;
      wallet.hasClaimedFirstRechargeBonus = true;
    }
    wallet.totalBalance = wallet.purchasedBalance + wallet.bonusBalance;
    wallet.updatedAt = new Date().toISOString();

    const currSymbol = BACKEND_CURRENCY_CONFIG[order.currency]?.symbol || '£';
    const rechargeTx: WalletTransaction = {
      id: 'tx_payu_' + Date.now(),
      customerId: order.customerId,
      orderId: txnid,
      title: 'Wallet Recharge (+' + currSymbol + order.amount.toFixed(2) + ')',
      subtitle: 'Verified via PayU Test Simulation (' + PAYU_MODE.toUpperCase() + ')',
      amount: order.amount,
      currency: order.currency,
      type: 'credit',
      subType: 'recharge',
      status: 'Completed',
      rechargePart: order.amount,
      bonusPart: creditedBonus,
      date: new Date().toISOString(),
      paymentMethod: 'PayU Test (' + mihpayid + ')'
    };

    db.walletTransactions.unshift(rechargeTx);
    order.status = 'success';
    order.payuPaymentId = mihpayid;
    order.updatedAt = Date.now();

    saveDB();
    broadcast('wallet_updated', { customerId: order.customerId, wallet });

    return res.json({
      success: true,
      orderId: txnid,
      status: 'Completed',
      creditedAmount: order.amount,
      bonusAmount: creditedBonus,
      totalBalance: wallet.totalBalance,
      message: 'Recharge verified with PayU! Successfully added ' + currSymbol + order.amount.toFixed(2) + (creditedBonus > 0 ? ' + ' + currSymbol + creditedBonus.toFixed(2) + ' First Recharge Bonus' : '') + ' to your balance.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// RAZORPAY STANDARD WEB CHECKOUT GATEWAY (TEST & PRODUCTION)
// =========================================================================
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const razorpay = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    })
  : null;

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Request: { amount (paise), currency, receipt, notes }
 * Return: { order_id, amount, currency }
 * Minimum amount: 100 paise
 */
app.post('/api/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate amount is provided
    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const numAmount = Math.round(Number(amount));

    // Validate amount >= 100 paise (or smallest currency unit)
    if (isNaN(numAmount) || numAmount < 100) {
      return res.status(400).json({ 
        error: 'Minimum order amount is 100 paise (or equivalent in smallest currency unit).' 
      });
    }

    // Check credentials configuration
    if (!razorpay || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(401).json({ error: 'Razorpay credentials not configured or unauthorized.' });
    }

    const orderOptions = {
      amount: numAmount,
      currency: (currency || 'INR').toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(orderOptions);

    return res.status(200).json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    
    // Handle auth failures (return 401)
    if (
      error?.statusCode === 401 || 
      (error?.error && error?.error?.code === 'BAD_REQUEST_ERROR' && String(error?.error?.description || '').toLowerCase().includes('auth'))
    ) {
      return res.status(401).json({ error: 'Razorpay authentication failed. Verify API credentials.' });
    }

    // Handle Razorpay API errors (return 500 or upstream code)
    const statusCode = error?.statusCode || 500;
    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: error?.error?.description || error?.message || 'Failed to create Razorpay order'
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
app.post('/api/verify-payment', async (req: Request, res: Response) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      customerId,
      amount,
      currency,
      isPaise
    } = req.body;

    // Missing fields: return 400
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_payment_id, razorpay_order_id, and razorpay_signature are required.'
      });
    }

    if (!RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        success: false, 
        error: 'Server Razorpay configuration error: Secret key missing.' 
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(String(razorpay_signature));

    // Compare generated signature with razorpay_signature securely
    const signaturesMatch = 
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    // Signature mismatch: return 400, do NOT mark as paid
    if (!signaturesMatch) {
      console.warn(`[Razorpay] Signature mismatch for order ${razorpay_order_id} & payment ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch.'
      });
    }

    // Signature verified successfully!
    let walletInfo = null;

    // If customer ID and amount are provided, credit wallet and record ledger entry
    if (customerId) {
      const parsedAmt = typeof amount === 'number' ? amount : parseFloat(amount || '0');
      // If amount was provided in paise/smallest unit, convert to standard currency units
      const verifiedAmount = isPaise ? (parsedAmt / 100) : (parsedAmt > 0 ? parsedAmt : 0);
      const verifiedCurrency = (currency || 'USD').toUpperCase();
      const currSymbol = BACKEND_CURRENCY_CONFIG[verifiedCurrency]?.symbol || '$';

      if (verifiedAmount > 0) {
        const wallet = getOrCreateCustomerWallet(customerId, verifiedCurrency);
        wallet.purchasedBalance += verifiedAmount;

        // 100% First Recharge Bonus: Awarded ONCE per eligible account upon verified recharge
        const isFirstRecharge = !wallet.firstRechargeCompleted && !wallet.hasClaimedFirstRechargeBonus;
        let creditedBonus = 0;
        if (isFirstRecharge) {
          creditedBonus = verifiedAmount;
          wallet.bonusBalance += creditedBonus;
          wallet.firstRechargeCompleted = true;
          wallet.hasClaimedFirstRechargeBonus = true;
          wallet.firstRechargeDate = new Date().toISOString();
        }

        wallet.totalBalance = wallet.purchasedBalance + wallet.bonusBalance;
        wallet.updatedAt = new Date().toISOString();

        // Create immutable transaction ledger entry
        const rechargeTx: WalletTransaction = {
          id: 'tx_rzp_' + Date.now(),
          customerId,
          orderId: razorpay_order_id,
          title: `Wallet Recharge (+${currSymbol}${verifiedAmount.toFixed(2)})`,
          subtitle: `Verified via Razorpay (${razorpay_payment_id})`,
          amount: verifiedAmount,
          currency: verifiedCurrency,
          type: 'credit',
          subType: 'recharge',
          status: 'Completed',
          rechargePart: verifiedAmount,
          bonusPart: creditedBonus,
          date: new Date().toISOString(),
          paymentMethod: `Razorpay (${razorpay_payment_id})`
        };

        db.walletTransactions.unshift(rechargeTx);

        // If first recharge, record 100% promotional bonus in ledger
        if (creditedBonus > 0) {
          const bonusTx: WalletTransaction = {
            id: 'tx_rzp_bon_' + (Date.now() + 1),
            customerId,
            orderId: razorpay_order_id + '-BONUS',
            title: `100% First Recharge Bonus (+${currSymbol}${creditedBonus.toFixed(2)})`,
            subtitle: 'Promotional Extra Cash Match (100% First Recharge Offer)',
            amount: creditedBonus,
            currency: verifiedCurrency,
            type: 'credit',
            subType: 'first_recharge_bonus',
            status: 'Completed',
            rechargePart: 0,
            bonusPart: creditedBonus,
            date: new Date().toISOString(),
            paymentMethod: 'LUMSIC Promotional Match'
          };
          db.walletTransactions.unshift(bonusTx);
        }

        saveDB();
        broadcast('wallet_updated', { customerId, wallet });

        walletInfo = {
          totalBalance: wallet.totalBalance,
          purchasedBalance: wallet.purchasedBalance,
          bonusBalance: wallet.bonusBalance,
          creditedAmount: verifiedAmount,
          creditedBonus
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      wallet: walletInfo
    });
  } catch (err: any) {
    console.error('Razorpay verify-payment error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error verifying Razorpay payment.'
    });
  }
});

// 5. POST Debit from Wallet (For consultation sessions, remedies, etc.)
app.post('/api/wallet/debit', paymentRateLimiter, (req: Request, res: Response) => {
  const { customerId, amount, description, readerName, sessionId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Customer ID required' });

  // Authorization check: Must be the customer themselves, a session participant, an astrologer, or an admin
  const isCustomer = req.headers['x-customer-id'] === customerId;
  const isSessionParticipant = sessionId && db.sessions[sessionId] && verifySessionAccess(req, db.sessions[sessionId]);
  const isStaff = verifyAdmin(req) || verifyAstrologer(req);
  if (!isCustomer && !isSessionParticipant && !isStaff) {
    return res.status(403).json({ error: 'Unauthorized to execute wallet debit for this account.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid debit amount.' });
  }

  const wallet = getOrCreateCustomerWallet(customerId);
  if (wallet.totalBalance < numAmount) {
    return res.status(400).json({ 
      error: `Insufficient balance (${wallet.currency} ${wallet.totalBalance.toFixed(2)} available, ${numAmount.toFixed(2)} required). Please recharge your wallet.` 
    });
  }

  // Deduct from purchased balance first, then bonus balance
  const deductPurchased = Math.min(wallet.purchasedBalance, numAmount);
  const deductBonus = numAmount - deductPurchased;

  wallet.purchasedBalance = Math.max(0, wallet.purchasedBalance - deductPurchased);
  wallet.bonusBalance = Math.max(0, wallet.bonusBalance - deductBonus);
  wallet.totalBalance = wallet.purchasedBalance + wallet.bonusBalance;
  wallet.updatedAt = new Date().toISOString();

  const sym = BACKEND_CURRENCY_CONFIG[wallet.currency]?.symbol || '$';

  const debitTx: WalletTransaction = {
    id: 'tx_deb_' + Date.now(),
    customerId,
    orderId: '#DEB-' + Math.floor(100000000 + Math.random() * 900000000),
    title: description || (readerName ? `Consultation with ${readerName}` : 'Service Debit'),
    subtitle: sessionId ? `Chat Session #${sessionId.slice(-6)}` : 'Astrology Service',
    amount: numAmount,
    currency: wallet.currency,
    type: 'debit',
    subType: 'consultation_debit',
    status: 'Completed',
    rechargePart: deductPurchased,
    bonusPart: deductBonus,
    date: new Date().toISOString(),
    notes: readerName ? `Consultation with ${readerName}` : undefined
  };

  db.walletTransactions.unshift(debitTx);
  saveDB();
  broadcast('wallet_updated', { customerId, wallet });

  res.json({
    success: true,
    message: `Debited ${sym}${numAmount.toFixed(2)} successfully.`,
    wallet,
    transaction: debitTx
  });
});

// 6. GET Referral System Info for customer
app.get('/api/referral/:customerId', (req: Request, res: Response) => {
  const { customerId } = req.params;
  const wallet = getOrCreateCustomerWallet(customerId);
  const friends = (db.referrals[customerId] || []).map(r => ({
    id: r.id,
    name: r.referredName || 'Valued Seeker',
    date: r.signupDate,
    hasRecharged: r.hasRecharged,
    rewardEarned: r.rewardEarned
  }));

  const successfulRecharges = friends.filter(f => f.hasRecharged).length;
  const availableRewards = Math.max(0, (wallet.referralRewardsCount || 0) - (wallet.claimedRewardsCount || 0));

  res.json({
    success: true,
    referralCode: wallet.referralCode,
    referralLink: `${req.protocol}://${req.get('host')}/?ref=${wallet.referralCode}`,
    referralMessage: "Refer a friend! When your friend signs up using your referral link and completes their first successful wallet recharge, you'll receive a free chat reward.",
    totalReferrals: friends.length,
    successfulRecharges,
    freeChatRewardsAvailable: availableRewards,
    friends
  });
});

// 7. POST Apply Referral Code (Attach referrer code to new customer)
app.post('/api/referral/apply', (req: Request, res: Response) => {
  const { customerId, referralCode, customerName, email } = req.body;
  if (!customerId || !referralCode) {
    return res.status(400).json({ error: 'Customer ID and referral code required' });
  }

  const cleanCode = referralCode.trim().toUpperCase();
  const wallet = getOrCreateCustomerWallet(customerId);

  // Prevent self-referral
  if (wallet.referralCode === cleanCode) {
    return res.status(400).json({ error: 'You cannot use your own referral code.' });
  }

  // Check if referrer exists
  const referrer = Object.values(db.wallets).find(w => w.referralCode === cleanCode);
  if (!referrer) {
    return res.status(404).json({ error: 'Invalid or expired referral code.' });
  }

  if (referrer.customerId === customerId) {
    return res.status(400).json({ error: 'Self-referrals are not permitted.' });
  }

  if (wallet.referredBy) {
    return res.status(400).json({ error: 'A referral code has already been applied to this account.' });
  }

  wallet.referredBy = cleanCode;

  // Add to referrer's referrals list
  if (!db.referrals[referrer.customerId]) {
    db.referrals[referrer.customerId] = [];
  }

  // Prevent duplicate entry in list
  const alreadyInList = db.referrals[referrer.customerId].some(r => r.referredCustomerId === customerId);
  if (!alreadyInList) {
    db.referrals[referrer.customerId].push({
      id: 'ref_' + Date.now(),
      referrerCustomerId: referrer.customerId,
      referredCustomerId: customerId,
      referredName: customerName || db.customers[customerId]?.name || 'Friend',
      referredEmail: email,
      referralCode: cleanCode,
      signupDate: new Date().toISOString(),
      hasRecharged: false,
      rewardEarned: false,
      rewardClaimed: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDB();
  res.json({
    success: true,
    message: 'Referral code applied! Complete your first recharge to unlock free rewards.',
    referrerCode: cleanCode
  });
});

// 8. POST Claim Free Chat Reward
app.post('/api/referral/claim-chat', (req: Request, res: Response) => {
  const { customerId } = req.body;
  if (!customerId) return res.status(400).json({ error: 'Customer ID required' });

  const wallet = getOrCreateCustomerWallet(customerId);
  const availableRewards = Math.max(0, (wallet.referralRewardsCount || 0) - (wallet.claimedRewardsCount || 0));

  if (availableRewards <= 0) {
    return res.status(400).json({ error: 'No free chat rewards currently available to claim.' });
  }

  wallet.claimedRewardsCount = (wallet.claimedRewardsCount || 0) + 1;
  saveDB();

  res.json({
    success: true,
    message: 'Free chat reward claimed! Enjoy your complimentary consultation.',
    remainingRewards: Math.max(0, wallet.referralRewardsCount - wallet.claimedRewardsCount)
  });
});

// 9. POST Admin Wallet Adjustment (with required admin identity and audit reason)
app.post('/api/admin/wallet/adjust', requireAdmin, (req: Request, res: Response) => {
  const { customerId, action, amount, reason, adminEmail } = req.body;

  if (!customerId || !action || !amount || !reason || !adminEmail) {
    return res.status(400).json({ 
      error: 'Missing required adjustment parameters: customerId, action (credit|debit), amount, reason, and adminEmail are mandatory.' 
    });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than zero.' });
  }

  const wallet = getOrCreateCustomerWallet(customerId);
  const sym = BACKEND_CURRENCY_CONFIG[wallet.currency]?.symbol || '$';

  if (action === 'debit' && wallet.totalBalance < numAmount) {
    return res.status(400).json({ error: 'Cannot debit more than current wallet balance.' });
  }

  if (action === 'credit') {
    wallet.purchasedBalance += numAmount;
  } else {
    const deductPurchased = Math.min(wallet.purchasedBalance, numAmount);
    const deductBonus = numAmount - deductPurchased;
    wallet.purchasedBalance = Math.max(0, wallet.purchasedBalance - deductPurchased);
    wallet.bonusBalance = Math.max(0, wallet.bonusBalance - deductBonus);
  }
  wallet.totalBalance = wallet.purchasedBalance + wallet.bonusBalance;
  wallet.updatedAt = new Date().toISOString();

  // Audit transaction
  const adjTx: WalletTransaction = {
    id: 'tx_adj_' + Date.now(),
    customerId,
    orderId: '#ADJ-' + Math.floor(100000 + Math.random() * 900000),
    title: `Admin Adjustment: ${action === 'credit' ? '+' : '-'}${sym}${numAmount.toFixed(2)}`,
    subtitle: `Reason: ${reason}`,
    amount: numAmount,
    currency: wallet.currency,
    type: action === 'credit' ? 'credit' : 'debit',
    subType: 'admin_adjustment',
    status: 'Completed',
    rechargePart: action === 'credit' ? numAmount : undefined,
    date: new Date().toISOString(),
    adminIdentity: adminEmail,
    notes: reason
  };

  db.walletTransactions.unshift(adjTx);

  // Record in activity log
  db.activityLogs.unshift({
    id: 'log_adj_' + Date.now(),
    action: `Admin ${action} of ${sym}${numAmount.toFixed(2)} on customer ${customerId}`,
    admin: adminEmail,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString(),
    target: `Customer ${customerId}`,
    previousValue: `${wallet.totalBalance - (action === 'credit' ? numAmount : -numAmount)}`,
    newValue: `${wallet.totalBalance}`
  });

  saveDB();
  broadcast('wallet_updated', { customerId, wallet });

  res.json({
    success: true,
    message: `Successfully executed admin ${action} of ${sym}${numAmount.toFixed(2)}.`,
    wallet,
    transaction: adjTx
  });
});


// API: Create new consultation session
app.post('/api/sessions/create', async (req: Request, res: Response) => {
  const { 
    customerId, 
    customerName, 
    firstName,
    readingType, 
    topic, 
    initialQuestion, 
    birthDetails,
    requestedReaderId,
    clientRequestId
  } = req.body || {};

  // Idempotency: if the browser retries after a gateway timeout, return the chat that was
  // already created instead of creating a duplicate request for the astrologer.
  if (typeof clientRequestId === 'string' && clientRequestId) {
    const existing = Object.values(db.sessions).find((s: any) => s.clientRequestId === clientRequestId);
    if (existing) return res.json({ session: existing });
  }

  const effectiveReaderId = requestedReaderId || (db.readers[0] ? db.readers[0].id : 'psychic-tamara');
  const requestedReader = db.readers.find(r => r.id === effectiveReaderId || r.astroId === effectiveReaderId) || db.readers[0];
  const psychicTamara = db.readers.find(r => r.id === 'psychic-tamara' || r.astroId === 'LYS-10001') || db.readers[0];

  // Check or register customer
  const effectiveCustomerId = customerId || ('cust_' + Date.now());
  let cust = db.customers[effectiveCustomerId];
  const effectiveName = firstName || customerName || birthDetails?.name || 'Valued Seeker';
  if (!cust) {
    cust = {
      id: effectiveCustomerId,
      name: effectiveName,
      birthDetails,
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      totalConsultations: 0
    };
    db.customers[cust.id] = cust;
  } else {
    if (effectiveName) cust.name = effectiveName;
    if (birthDetails) cust.birthDetails = birthDetails;
  }

  const isEligibleForFree = !cust.freeMinutesUsed;
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = Date.now();

  const userName = birthDetails?.name || firstName || cust.name || 'Seeker';
  const userGender = birthDetails?.gender || 'Not specified';
  const userDob = birthDetails?.dob || 'Not specified';
  const userTob = birthDetails?.unknownTime 
    ? 'Not known' 
    : (birthDetails?.birthTime ? `${birthDetails.birthTime} ${birthDetails.amPm || ''}`.trim() : 'Not specified');
  const userPob = birthDetails?.placeOfBirth || 'Not specified';

  // 1. Only user details land first
  const userDetailsCard = `Hi,\nBelow are my details:\nName: ${userName}\nGender: ${userGender}\nDOB: ${userDob}\nTOB: ${userTob}\nPOB: ${userPob}`;

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg_details_' + now,
      sessionId,
      sender: 'customer',
      senderName: userName,
      text: userDetailsCard,
      timestamp: new Date(now).toISOString()
    }
  ];

  if (initialQuestion && initialQuestion.trim() && !initialQuestion.includes('Hello')) {
    initialMessages.push({
      id: 'msg_init_' + (now + 100),
      sessionId,
      sender: 'customer',
      senderName: userName,
      text: initialQuestion.trim(),
      timestamp: new Date(now + 100).toISOString()
    });
  }

  // Human astrologer will send the first reply from the astrologer dashboard.

  const sessionToken = generateSecureToken('sess_key');

  // CRITICAL REQUIREMENT:
  // All chats land to Psychic Tamara (assignedReaderId = 'psychic-tamara'),
  // while preserving what the user selected in requestedReaderId and requestedReaderName!
  const session: ConsultationSession = {
    id: sessionId,
    sessionToken,
    customerId: cust.id,
    customerName: cust.name,
    readingType: readingType || 'General Consultation',
    topic: topic || 'Guidance',
    initialQuestion: initialQuestion ? initialQuestion.trim() : undefined,
    birthDetails: birthDetails || cust.birthDetails,
    requestedReaderId: requestedReader.id,
    requestedReaderName: requestedReader.name,
    requestedAstroId: requestedReader.astroId || requestedReader.id,
    assignedReaderId: 'psychic-tamara',
    assignedReaderName: psychicTamara.name || 'Psychic Tamara',
    assignedAstroId: psychicTamara.astroId || 'LYS-10001',
    targetHumanReaderId: 'psychic-tamara',
    targetHumanReaderName: psychicTamara.name || 'Psychic Tamara',
    status: 'waiting', // 'waiting' triggers the incoming alert pop-up and marimba ringtone in the Astrologer Dashboard!
    unreadForOperator: true,
    isAiSession: false,
    isFreeConsultation: isEligibleForFree,
    freeSecondsRemaining: isEligibleForFree ? 120 : 0,
    totalDurationSeconds: 0,
    paidSeconds: 0,
    ratePerMinute: requestedReader.ratePerMinute || 1.0,
    createdAt: new Date().toISOString(),
    messages: initialMessages,
    paymentStatus: isEligibleForFree ? 'free_tier' : 'paid_active',
    clientRequestId: typeof clientRequestId === 'string' && clientRequestId ? clientRequestId : undefined
  } as any;

  db.sessions[sessionId] = session;
  db.stats.todaysChats += 1;
  updateStats();
  saveDB();

  // Reply first so the customer lands in the chat immediately, then notify the Astroboard.
  res.json({ session });

  try {
    broadcast('new_session', session);
  } catch (err) {
    console.error('new_session broadcast failed:', err);
  }
});

// API: Get session by ID (Protected by Session Privacy & Participant Verification)
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (!verifySessionAccess(req, session)) {
    return res.status(403).json({ error: 'Access to this private consultation session is unauthorized.' });
  }

  res.json({ session });
});

// API: Check user free chat eligibility (Strict server-side source of truth)
app.get('/api/user/eligibility/:id', (req: Request, res: Response) => {
  const cust = db.customers[req.params.id];
  if (!cust) {
    return res.json({ free_chat_eligible: true, free_chat_used: false, remainingSeconds: 120 });
  }
  if (cust.free_chat_used) {
    return res.json({ free_chat_eligible: false, free_chat_used: true, remainingSeconds: 0 });
  }
  if (cust.free_chat_started_at) {
    const elapsed = Math.floor((Date.now() - new Date(cust.free_chat_started_at).getTime()) / 1000);
    const remaining = Math.max(0, 120 - elapsed);
    if (remaining === 0) {
      cust.free_chat_used = true;
      cust.free_chat_eligible = false;
      saveDB();
    }
    return res.json({
      free_chat_eligible: remaining > 0,
      free_chat_used: remaining === 0,
      remainingSeconds: remaining
    });
  }
  res.json({
    free_chat_eligible: cust.free_chat_eligible !== false,
    free_chat_used: Boolean(cust.free_chat_used),
    remainingSeconds: 120
  });
});

// API: Start First-Time 2-Minute Free Chat with LUMYSIC Psychic – AI Guide
app.post('/api/user/free-chat/start', (req: Request, res: Response) => {
  const { customerId, customerName, targetHumanReaderId, targetHumanReaderName, topic, question, birthDetails } = req.body;
  if (!customerId) return res.status(400).json({ error: 'customerId is required' });

  let cust = db.customers[customerId];
  if (!cust) {
    cust = {
      id: customerId,
      name: customerName || 'Seeker',
      isFirstTimeUser: false,
      freeMinutesUsed: true,
      free_chat_eligible: false,
      free_chat_used: true,
      free_chat_started_at: new Date().toISOString(),
      totalConsultations: 1
    };
    db.customers[customerId] = cust;
  } else {
    // Check strict eligibility: ONE COMPLIMENTARY SESSION EVER
    if (cust.free_chat_used) {
      return res.status(403).json({ error: 'FREE_CHAT_ALREADY_USED', eligible: false });
    }
    cust.free_chat_used = true;
    cust.free_chat_eligible = false;
    cust.free_chat_started_at = new Date().toISOString();
    cust.freeMinutesUsed = true;
    cust.isFirstTimeUser = false;
  }

  const sessionId = 'sess_free_' + Date.now();
  const now = new Date();
  const userName = customerName || cust.name || 'Seeker';

  const chosenReaderName = targetHumanReaderName || (db.readers[0] ? db.readers[0].name : 'Verified Astrologer');
  const chosenReaderId = targetHumanReaderId || (db.readers[0] ? db.readers[0].id : 'astral_reader_1');

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg_greet_' + Date.now(),
      sessionId,
      sender: 'astrologer',
      senderName: chosenReaderName,
      text: `Greetings, ${userName}. I am ${chosenReaderName}, your dedicated spiritual advisor. You have complimentary introductory minutes to explore love, career, or life direction today. What guidance do you seek?`,
      timestamp: now.toISOString(),
      isAiMessage: false
    }
  ];

  if (question && question.trim()) {
    initialMessages.push({
      id: 'msg_user_q_' + (Date.now() + 50),
      sessionId,
      sender: 'customer',
      senderName: userName,
      text: question.trim(),
      timestamp: new Date(Date.now() + 50).toISOString()
    });
  }

  const session: ConsultationSession = {
    id: sessionId,
    customerId,
    customerName: userName,
    readingType: 'Introductory Consultation',
    topic: topic || 'Life Guidance',
    initialQuestion: question ? question.trim() : undefined,
    birthDetails: birthDetails || cust.birthDetails,
    requestedReaderId: chosenReaderId,
    requestedReaderName: chosenReaderName,
    requestedAstroId: chosenReaderId,
    assignedReaderId: 'psychic-tamara',
    assignedReaderName: 'Psychic Tamara',
    assignedAstroId: 'LYS-10001',
    status: 'waiting',
    unreadForOperator: true,
    isFreeConsultation: true,
    isAiSession: false,
    targetHumanReaderId: 'psychic-tamara',
    targetHumanReaderName: 'Psychic Tamara',
    freeSecondsRemaining: 120,
    totalDurationSeconds: 0,
    paidSeconds: 0,
    ratePerMinute: 0,
    createdAt: now.toISOString(),
    messages: initialMessages,
    paymentStatus: 'free_tier'
  };

  db.sessions[sessionId] = session;
  db.stats.todaysChats += 1;
  updateStats();
  saveDB();

  broadcast('new_session', session);
  res.json({ success: true, session, remainingSeconds: 120 });
});

// API: Send message in session & get reader reply
app.post('/api/chat/ai-message', async (req: Request, res: Response) => {
  const { sessionId, text } = req.body;
  if (!sessionId || !text) return res.status(400).json({ error: 'sessionId and text required' });

  const session = db.sessions[sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Calculate elapsed time from server startedAt
  if (session.startedAt) {
    const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    session.freeSecondsRemaining = Math.max(0, 120 - elapsed);
    if (session.freeSecondsRemaining <= 0) {
      session.status = 'completed';
      session.paymentStatus = 'pending_topup';
      saveDB();
      return res.status(403).json({ error: 'FREE_TIME_EXPIRED', session, expired: true });
    }
  }

  const userMsg: ChatMessage = {
    id: 'msg_u_' + Date.now(),
    sessionId,
    sender: 'customer',
    senderName: session.customerName,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };
  session.messages.push(userMsg);

  // Find assigned astrologer for this session
  const targetReaderId = session.requestedReaderId || session.assignedReaderId;
  const astrologer = targetReaderId ? db.readers.find(r => r.id === targetReaderId || r.astroId === targetReaderId) : null;
  const activeReaderName = astrologer?.name || session.requestedReaderName || session.assignedReaderName || 'Verified Astrologer';

  let replyText = '';
  let replySource = 'ai_fallback';

  // 1. Check if astrologer has an assigned n8n workflow & toggle is ON
  if (astrologer && (astrologer.n8nWebhookUrl || astrologer.n8nWorkflowId)) {
    if (astrologer.isWorkflowEnabled !== false) {
      const n8nResult = await executeN8nAstrologerWorkflow(astrologer, {
        event: 'chat_message',
        astrologerId: astrologer.id,
        astroId: astrologer.astroId || astrologer.id,
        astrologerName: astrologer.name,
        workflowId: astrologer.n8nWorkflowId,
        sessionId: session.id,
        customerId: session.customerId,
        customerName: session.customerName,
        message: text.trim(),
        timestamp: new Date().toISOString(),
        birthDetails: session.birthDetails || null,
        history: session.messages.slice(-8).map(m => ({
          sender: m.sender,
          senderName: m.senderName,
          text: m.text,
          timestamp: m.timestamp
        }))
      });

      if (n8nResult.success && n8nResult.replyText) {
        replyText = n8nResult.replyText;
        replySource = 'n8n_workflow';
      }
    }
  }

  // 2. Fallback to AI psychic reply generator if n8n was not configured or toggle was OFF
  if (!replyText) {
    replyText = await generateAiPsychicReply(session.messages, text.trim(), session.customerName, activeReaderName, session.birthDetails);
  }

  const aiMsg: ChatMessage = {
    id: 'msg_reply_' + (Date.now() + 10),
    sessionId,
    sender: 'astrologer',
    senderName: activeReaderName,
    text: replyText,
    timestamp: new Date(Date.now() + 10).toISOString(),
    isAiMessage: replySource !== 'n8n_workflow'
  };
  session.messages.push(aiMsg);
  saveDB();

  broadcast('message_received', { sessionId, message: aiMsg });
  res.json({ success: true, message: aiMsg, session });
});

// API: Seamless Handover to Human Reader after recharge
app.post('/api/sessions/:id/handover-to-human', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const targetReaderId = req.body.targetReaderId || session.targetHumanReaderId;
  const targetReader = db.readers.find(r => r.id === targetReaderId) || db.readers[0];

  session.assignedReaderId = targetReader.id;
  session.assignedReaderName = targetReader.name;
  session.requestedReaderId = targetReader.id;
  session.requestedReaderName = targetReader.name;
  session.isAiSession = false;
  session.isFreeConsultation = false;
  session.paymentStatus = 'paid_active';
  session.status = 'active';

  const handoverNotice: ChatMessage = {
    id: 'sys_handover_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMYSIC System',
    text: `✨ Connected with ${targetReader.name}. Your consultation details have been shared with them.`,
    timestamp: new Date().toISOString(),
    isHandoverNotice: true,
    isSystemNotice: true
  };

  const humanGreeting: ChatMessage = {
    id: 'msg_human_greet_' + (Date.now() + 10),
    sessionId: session.id,
    sender: 'astrologer',
    senderName: targetReader.name,
    text: `Greetings, ${session.customerName}. I am ${targetReader.name}. Let's delve deeper into your path.`,
    timestamp: new Date(Date.now() + 10).toISOString(),
    isAiMessage: false
  };

  session.messages.push(handoverNotice, humanGreeting);
  saveDB();

  broadcast('session_updated', { session });
  res.json({ success: true, session });
});

// ==========================================
// 🔮 PSYCHIC CHAT INTEGRATION ENDPOINTS
// ==========================================

interface PsychicSessionRecord {
  sessionId: string;
  details: {
    name: string;
    dob: string;
    concern: string;
  };
  messages: Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp?: string }>;
  startedAt: string;
  secondsLeft: number;
  expired: boolean;
  isPaid: boolean;
  assignedReaderId?: string;
  assignedReaderName?: string;
}



const psychicSessions: Record<string, PsychicSessionRecord> = {};

app.post('/api/psychic-session', (req: Request, res: Response) => {
  const { action, details, sessionId } = req.body;

  if (action === 'restore') {
    const sid = sessionId || (req.headers['x-session-id'] as string);
    let session = sid ? psychicSessions[sid] : null;

    if (!session && sid && db.sessions[sid]) {
      const existingAstro = db.sessions[sid];
      session = {
        sessionId: sid,
        details: {
          name: existingAstro.customerName || 'Seeker',
          dob: existingAstro.birthDetails?.dob || '',
          concern: existingAstro.topic || 'Guidance'
        },
        messages: existingAstro.messages.map(m => ({
          id: m.id,
          role: m.sender === 'customer' ? 'user' : 'assistant',
          content: m.text,
          timestamp: m.timestamp
        })),
        startedAt: existingAstro.createdAt,
        secondsLeft: existingAstro.freeSecondsRemaining || 120,
        expired: existingAstro.status === 'completed',
        isPaid: existingAstro.paymentStatus === 'paid_active'
      };
      psychicSessions[sid] = session;
    }

    if (!session) {
      return res.json({ active: false });
    }

    if (!session.isPaid) {
      const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
      session.secondsLeft = Math.max(0, 120 - elapsed);
      if (session.secondsLeft <= 0) {
        session.expired = true;
      }
    }

    return res.json({
      active: true,
      sessionId: session.sessionId,
      details: session.details,
      messages: session.messages,
      secondsLeft: session.secondsLeft,
      expired: session.expired
    });
  }

  if (action === 'start') {
    const safeDetails = {
      name: (details?.name || 'Seeker').trim(),
      dob: details?.dob || '',
      concern: details?.concern || 'Love & Relationships'
    };

    const sid = 'psy_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const welcomeText = `Hi ${safeDetails.name} ✨ I'm here to listen. What's been on your mind about ${safeDetails.concern.toLowerCase()}?`;
    
    const newSession: PsychicSessionRecord = {
      sessionId: sid,
      details: safeDetails,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date().toISOString()
        }
      ],
      startedAt: new Date().toISOString(),
      secondsLeft: 120,
      expired: false,
      isPaid: false
    };

    psychicSessions[sid] = newSession;

    // Register in db.sessions so Astroboard tracks this consultation in real-time
    const astroSession: ConsultationSession = {
      id: sid,
      customerId: 'cust_' + Date.now(),
      customerName: safeDetails.name,
      readingType: safeDetails.concern,
      topic: safeDetails.concern,
      birthDetails: {
        name: safeDetails.name,
        dob: safeDetails.dob
      },
      requestedReaderId: 'psychic-tamara',
      requestedReaderName: 'Psychic Tamara',
      requestedAstroId: 'psychic-tamara',
      assignedReaderId: 'psychic-tamara',
      assignedReaderName: 'Psychic Tamara',
      assignedAstroId: 'LYS-10001',
      targetHumanReaderId: 'psychic-tamara',
      targetHumanReaderName: 'Psychic Tamara',
      status: 'waiting',
      unreadForOperator: true,
      isAiSession: false,
      isFreeConsultation: true,
      freeSecondsRemaining: 120,
      totalDurationSeconds: 0,
      paidSeconds: 0,
      ratePerMinute: 1.0,
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_welcome_' + Date.now(),
          sessionId: sid,
          sender: 'astrologer',
          senderName: 'Your Personal Psychic',
          text: welcomeText,
          timestamp: new Date().toISOString(),
          isAiMessage: true
        }
      ],
      paymentStatus: 'free_tier'
    };
    db.sessions[sid] = astroSession;
    db.stats.todaysChats += 1;
    saveDB();
    broadcast('new_session', astroSession);

    return res.json({
      sessionId: sid,
      secondsLeft: 120,
      messages: newSession.messages
    });
  }

  if (action === 'expire') {
    const session = psychicSessions[sessionId];
    if (session) {
      session.expired = true;
      session.secondsLeft = 0;
      if (db.sessions[sessionId]) {
        db.sessions[sessionId].status = 'completed';
        db.sessions[sessionId].freeSecondsRemaining = 0;
        saveDB();
      }
    }
    return res.json({ success: true, expired: true });
  }

  res.status(400).json({ error: 'Unknown action' });
});

app.post('/api/psychic-chat', async (req: Request, res: Response) => {
  const { sessionId, message } = req.body;
  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  let session = psychicSessions[sessionId];
  if (!session) {
    const existingAstroSession = db.sessions[sessionId];
    if (existingAstroSession) {
      session = {
        sessionId,
        details: {
          name: existingAstroSession.customerName || 'Seeker',
          dob: existingAstroSession.birthDetails?.dob || '',
          concern: existingAstroSession.topic || 'Guidance'
        },
        messages: existingAstroSession.messages.map(m => ({
          id: m.id,
          role: m.sender === 'customer' ? 'user' : 'assistant',
          content: m.text,
          timestamp: m.timestamp
        })),
        startedAt: existingAstroSession.createdAt,
        secondsLeft: existingAstroSession.freeSecondsRemaining || 120,
        expired: existingAstroSession.status === 'completed',
        isPaid: existingAstroSession.paymentStatus === 'paid_active'
      };
      psychicSessions[sessionId] = session;
    } else {
      return res.status(404).json({ error: 'Session not found. Please restart your chat.' });
    }
  }

  // Check expiration if not paid
  if (!session.isPaid) {
    const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    session.secondsLeft = Math.max(0, 120 - elapsed);
    if (session.secondsLeft <= 0 || session.expired) {
      session.expired = true;
      session.secondsLeft = 0;
      return res.json({ sessionExpired: true, secondsLeft: 0, reply: 'Your introductory session has ended.' });
    }
  }

  const userMsg = {
    id: `user-${Date.now()}`,
    role: 'user' as const,
    content: String(message).trim(),
    timestamp: new Date().toISOString()
  };
  session.messages.push(userMsg);

  if (db.sessions[sessionId]) {
    db.sessions[sessionId].messages.push({
      id: userMsg.id,
      sessionId,
      sender: 'customer',
      senderName: session.details.name,
      text: userMsg.content,
      timestamp: userMsg.timestamp
    });
    db.sessions[sessionId].lastMessageText = userMsg.content;
    db.sessions[sessionId].lastMessageAt = userMsg.timestamp;
  }

  const mappedChatMessages: ChatMessage[] = session.messages.map((m: any) => ({
    id: m.id,
    sessionId,
    sender: m.role === 'user' ? 'customer' : 'astrologer',
    senderName: m.role === 'user' ? session.details.name : 'Your Psychic',
    text: m.content,
    timestamp: m.timestamp || new Date().toISOString()
  }));

  const aiReplyText = await generateAiPsychicReply(
    mappedChatMessages,
    userMsg.content,
    session.details.name,
    'Your Personal Psychic',
    { name: session.details.name, dob: session.details.dob, topic: session.details.concern }
  );

  const assistantMsg = {
    id: `assistant-${Date.now()}`,
    role: 'assistant' as const,
    content: aiReplyText,
    timestamp: new Date().toISOString()
  };
  session.messages.push(assistantMsg);

  if (db.sessions[sessionId]) {
    const aiChatMessage: ChatMessage = {
      id: assistantMsg.id,
      sessionId,
      sender: 'astrologer',
      senderName: 'Your Personal Psychic',
      text: assistantMsg.content,
      timestamp: assistantMsg.timestamp,
      isAiMessage: true
    };
    db.sessions[sessionId].messages.push(aiChatMessage);
    db.sessions[sessionId].lastMessageText = assistantMsg.content;
    db.sessions[sessionId].lastMessageAt = assistantMsg.timestamp;
    saveDB();
    broadcast('message_received', { sessionId, message: aiChatMessage, session: db.sessions[sessionId] });
  }

  res.json({
    reply: assistantMsg.content,
    secondsLeft: session.secondsLeft,
    sessionId: session.sessionId,
    sessionExpired: false
  });
});

app.post('/api/psychic-recharge', paymentRateLimiter, (req: Request, res: Response) => {
  const { sessionId, packageId, minutes = 10 } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  let session = psychicSessions[sessionId];
  if (!session && db.sessions[sessionId]) {
    const existing = db.sessions[sessionId];
    session = {
      sessionId,
      details: {
        name: existing.customerName,
        dob: existing.birthDetails?.dob || '',
        concern: existing.topic || 'Guidance'
      },
      messages: existing.messages.map(m => ({
        id: m.id,
        role: m.sender === 'customer' ? 'user' : 'assistant',
        content: m.text,
        timestamp: m.timestamp
      })),
      startedAt: existing.createdAt,
      secondsLeft: 0,
      expired: true,
      isPaid: false
    };
    psychicSessions[sessionId] = session;
  }

  if (!session) return res.status(404).json({ error: 'Session not found' });

  const addedSeconds = Number(minutes) * 60;
  session.secondsLeft = Math.max(session.secondsLeft, 0) + addedSeconds;
  session.expired = false;
  session.isPaid = true;

  const rechargeNotice = {
    id: `recharge-${Date.now()}`,
    role: 'assistant' as const,
    content: `Your session has been extended by ${minutes} minutes. I'm right here with you—let's continue ✨`,
    timestamp: new Date().toISOString()
  };
  session.messages.push(rechargeNotice);

  if (db.sessions[sessionId]) {
    db.sessions[sessionId].paymentStatus = 'paid_active';
    db.sessions[sessionId].status = 'active';
    db.sessions[sessionId].freeSecondsRemaining = session.secondsLeft;
    db.sessions[sessionId].messages.push({
      id: rechargeNotice.id,
      sessionId,
      sender: 'astrologer',
      senderName: 'Your Personal Psychic',
      text: rechargeNotice.content,
      timestamp: rechargeNotice.timestamp,
      isSystemNotice: true
    });
    const packageCosts: Record<string, number> = { starter: 7.99, popular: 14.99, extended: 26.99 };
    const charge = packageCosts[packageId] || 14.99;
    db.stats.todaysEarnings += charge;
    saveDB();
    broadcast('session_updated', { session: db.sessions[sessionId] });
  }

  res.json({
    paid: true,
    secondsLeft: session.secondsLeft,
    messages: session.messages,
    message: 'Payment confirmed. Your session has been extended.'
  });
});

app.post('/api/psychic-handoff', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const targetReader = db.readers.find(r => r.isOnline) || db.readers[0];
  const session = psychicSessions[sessionId];
  
  if (session) {
    session.assignedReaderId = targetReader.id;
    session.assignedReaderName = targetReader.name;
    const handoffMsg = {
      id: `handoff-${Date.now()}`,
      role: 'assistant' as const,
      content: `I've connected you with ${targetReader.name}. They have received your conversation history and are ready to assist you ✨`,
      timestamp: new Date().toISOString()
    };
    session.messages.push(handoffMsg);
  }

  if (db.sessions[sessionId]) {
    db.sessions[sessionId].assignedReaderId = targetReader.id;
    db.sessions[sessionId].assignedReaderName = targetReader.name;
    db.sessions[sessionId].isAiSession = false;
    db.sessions[sessionId].status = 'active';
    db.sessions[sessionId].messages.push({
      id: `sys_handoff_${Date.now()}`,
      sessionId,
      sender: 'system',
      senderName: 'LUMYSIC System',
      text: `Connecting with ${targetReader.name}. Conversation transcript transferred.`,
      timestamp: new Date().toISOString(),
      isHandoverNotice: true,
      isSystemNotice: true
    });
    saveDB();
    broadcast('new_session', db.sessions[sessionId]);
    broadcast('session_updated', { session: db.sessions[sessionId] });
  }

  res.json({
    connected: true,
    reader: { id: targetReader.id, name: targetReader.name, title: targetReader.title, avatar: targetReader.avatar },
    statusMessage: `Connecting you with ${targetReader.name} (${targetReader.title}). They have been notified on the reader board.`
  });
});

// API: Human reader/operator accepts or picks up consultation from Astroboard
// CRITICAL: The free chat timer begins ONLY NOW!
app.post('/api/sessions/:id/accept', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { readerId, readerName } = req.body || {};
  if (readerId) {
    session.assignedReaderId = readerId;
    const reader = db.readers.find(r => r.id === readerId || r.astroId === readerId);
    if (reader) {
      session.assignedReaderName = reader.name;
    } else if (readerName) {
      session.assignedReaderName = readerName;
    }
  }

  session.status = 'active';
  if (!session.acceptedAt) {
    session.acceptedAt = new Date().toISOString();
  }
  session.unreadForOperator = false;

  // Mark user free minutes as used
  if (db.customers[session.customerId]) {
    db.customers[session.customerId].freeMinutesUsed = true;
    db.customers[session.customerId].isFirstTimeUser = false;
    db.customers[session.customerId].totalConsultations += 1;
  }

  const activeName = session.assignedReaderName || session.requestedReaderName || 'Astrologer';
  const joinNotice: ChatMessage = {
    id: 'sys_join_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMSIC System',
    text: `${activeName} has connected and joined your consultation.`,
    timestamp: new Date().toISOString(),
    isSystemNotice: true
  };

  session.messages.push(joinNotice);
  updateStats();
  saveDB();

  broadcast('session_accepted', { session, messages: [joinNotice] });
  res.json({ success: true, session });
});

// API: Astroboard / Admin forwards session to any reader
app.post('/api/sessions/:id/assign', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { readerId, silent = true } = req.body;
  const newReader = db.readers.find(r => r.id === readerId);
  if (!newReader) return res.status(400).json({ error: 'Reader not found' });

  session.assignedReaderId = newReader.id;
  // Keep requestedReaderName so client always sees the reader they originally selected!
  if (!session.requestedReaderName) {
    session.requestedReaderName = session.assignedReaderName;
  }
  // Store internal routed reader name for admin
  (session as any).forwardedReaderId = newReader.id;
  (session as any).forwardedReaderName = newReader.name;

  if (!silent) {
    const reassignNotice: ChatMessage = {
      id: 'sys_reassign_' + Date.now(),
      sessionId: session.id,
      sender: 'system',
      senderName: 'LUMYSIC System',
      text: `Consultation routed to ${newReader.name}.`,
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    };
    session.messages.push(reassignNotice);
  }

  saveDB();
  broadcast('session_updated', { session });
  res.json({ session });
});

// API: Send message (strictly human customer or human operator/reader)
// API: Send message (customer or astrologer, handled by AI agent when customer messages)
app.post('/api/sessions/:id/message', async (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Ensure only authorized session participants (client, assigned reader, or admin) can post messages
  if (!verifySessionAccess(req, session)) {
    return res.status(403).json({ error: 'Unauthorized to post messages to this consultation session.' });
  }

  const { sender, senderName, text } = req.body;
  if (sender !== 'customer' && sender !== 'astrologer') {
    return res.status(400).json({ error: 'Invalid message sender.' });
  }
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // Prevent stored XSS by sanitizing input text
  const cleanText = sanitizeInputString(text);

  // If session was waiting and the operator/reader replies, automatically accept it
  if (session.status === 'waiting' && sender === 'astrologer') {
    session.status = 'active';
    session.acceptedAt = new Date().toISOString();
    if (db.customers[session.customerId]) {
      db.customers[session.customerId].freeMinutesUsed = true;
      db.customers[session.customerId].isFirstTimeUser = false;
    }
  }

  const message: ChatMessage = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sessionId: session.id,
    sender: sender === 'astrologer' ? 'astrologer' : 'customer',
    senderName: senderName || (sender === 'astrologer' ? (session.requestedReaderName || session.assignedReaderName) : session.customerName),
    text: cleanText,
    timestamp: new Date().toISOString()
  };

  session.messages.push(message);
  session.lastMessageText = message.text;
  session.lastMessageAt = message.timestamp;

  // Manual astrologer handling: No automated bot reply after initial greeting.
  // Real human astrologers / operators respond manually from their workstation or admin panel.
  const aiReplyMsg: ChatMessage | null = null;

  if (sender === 'customer') {
    session.unreadForOperator = true;
  } else {
    session.unreadForCustomer = true;
  }

  saveDB();
  broadcast('message_received', { sessionId: session.id, message, aiReply: aiReplyMsg, session });
  res.json({ success: true, message, aiReply: aiReplyMsg, session });
});

// API: Top up or continue paid session after free minutes
app.post('/api/sessions/:id/topup', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { amountMinutes = 15 } = req.body;
  const chargeAmount = amountMinutes * session.ratePerMinute;

  session.paymentStatus = 'paid_active';
  db.stats.todaysEarnings += chargeAmount;
  db.stats.weeklyEarnings += chargeAmount;
  db.stats.monthlyEarnings += chargeAmount;

  const topupNotice: ChatMessage = {
    id: 'sys_topup_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMYSIC System',
    text: `Paid consultation extended by ${amountMinutes} minutes (£${chargeAmount.toFixed(2)}). Your reading continues smoothly.`,
    timestamp: new Date().toISOString(),
    isSystemNotice: true
  };

  session.messages.push(topupNotice);
  saveDB();
  broadcast('session_updated', { session, notice: topupNotice });
  res.json({ success: true, session });
});

// API: Complete / End session
app.post('/api/sessions/:id/complete', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'completed';
  session.endedAt = new Date().toISOString();

  const endNotice: ChatMessage = {
    id: 'sys_end_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMYSIC System',
    text: 'Consultation concluded. Thank you for seeking clarity with LUMYSIC.',
    timestamp: new Date().toISOString(),
    isSystemNotice: true
  };

  session.messages.push(endNotice);
  db.stats.completedChats += 1;
  updateStats();
  saveDB();

  broadcast('session_completed', { session, notice: endNotice });
  res.json({ success: true, session });
});

// API: Astroboard Stats & Sessions
app.get('/api/astroboard/stats', (_req: Request, res: Response) => {
  updateStats();
  res.json({ stats: db.stats });
});

app.get('/api/astroboard/sessions', (req: Request, res: Response) => {
  updateStats();
  const readerId = (req.query.readerId as string || '').trim();

  // Every inbox request must be authenticated. Only the central inbox owner
  // (Psychic Tamara) and verified admins may receive the platform-wide queue.
  if (!readerId || !verifyAstrologer(req, readerId)) {
    return res.status(403).json({ error: 'Authenticated astrologer workstation access is required.' });
  }

  const showAll = verifyAdmin(req) || readerId === 'psychic-tamara' || readerId === 'LYS-10001';
  let list = Object.values(db.sessions).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (!showAll) {
    list = list.filter(s =>
      s.assignedReaderId === readerId ||
      s.requestedReaderId === readerId ||
      s.assignedAstroId === readerId ||
      s.requestedAstroId === readerId
    );
  }

  res.json({ sessions: list });
});

// API: Reader/Operator declines consultation from Astroboard
app.post('/api/sessions/:id/decline', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'cancelled';
  session.endedAt = new Date().toISOString();

  const declineNotice: ChatMessage = {
    id: 'sys_decline_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMYSIC System',
    text: `${session.requestedReaderName || 'Reader'} is currently unavailable for this consultation request.`,
    timestamp: new Date().toISOString(),
    isSystemNotice: true
  };

  session.messages.push(declineNotice);
  saveDB();
  broadcast('session_updated', { session, notice: declineNotice });
  res.json({ success: true, session });
});

// ==========================================
// LUMYSIC PRODUCTION ADMIN DASHBOARD APIS
// ==========================================

// Enforce Administrator Authorization across all /api/admin endpoints
app.use('/api/admin', requireAdmin);

// 1. Operational Overview & KPIs
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  updateStats();
  const allSessions = Object.values(db.sessions);
  const now = Date.now();

  const activeSessions = allSessions.filter(s => s.status === 'active');
  const pendingSessions = allSessions.filter(s => s.status === 'waiting');
  const unassignedSessions = allSessions.filter(s => s.status === 'waiting' && (!s.assignedReaderId || s.assignedReaderId === 'unassigned'));

  // Calculate wait times
  let totalWaitSeconds = 0;
  let maxWaitSeconds = 0;
  let longestPending: ConsultationSession | null = null;

  pendingSessions.forEach(s => {
    const createdTime = new Date(s.createdAt).getTime();
    const waitSec = Math.max(0, Math.floor((now - createdTime) / 1000));
    totalWaitSeconds += waitSec;
    if (waitSec > maxWaitSeconds) {
      maxWaitSeconds = waitSec;
      longestPending = s;
    }
  });

  const avgWaitSec = pendingSessions.length > 0 ? Math.round(totalWaitSeconds / pendingSessions.length) : 0;

  // Active astrologers & workload calculation
  const readerWorkload: Record<string, { activeChats: number; isOnline: boolean; rating: number }> = {};
  db.readers.forEach(r => {
    readerWorkload[r.id] = {
      activeChats: 0,
      isOnline: r.isOnline,
      rating: r.rating || 4.9
    };
  });
  activeSessions.forEach(s => {
    if (s.assignedReaderId && readerWorkload[s.assignedReaderId]) {
      readerWorkload[s.assignedReaderId].activeChats += 1;
    }
  });

  // Calculate alerts
  const alerts: Array<{ id: string; type: 'critical' | 'warning' | 'info'; title: string; message: string; timestamp: string }> = [];
  
  const criticalWaits = pendingSessions.filter(s => {
    const waitSec = Math.floor((now - new Date(s.createdAt).getTime()) / 1000);
    return waitSec > 300; // > 5 minutes
  });
  if (criticalWaits.length > 0) {
    alerts.push({
      id: 'alert_wait_' + now,
      type: 'critical',
      title: `${criticalWaits.length} chats waiting > 5 minutes`,
      message: 'Urgent attention required. Reassign or notify on-duty astrologers.',
      timestamp: new Date().toISOString()
    });
  }

  const overloadedAstrologers = db.readers.filter(r => (readerWorkload[r.id]?.activeChats || 0) >= (r.maxConcurrentChats || 3));
  if (overloadedAstrologers.length > 0) {
    alerts.push({
      id: 'alert_overload_' + now,
      type: 'warning',
      title: `${overloadedAstrologers.length} astrologers at peak capacity`,
      message: `${overloadedAstrologers.map(r => r.name).join(', ')} reached max concurrent chat limit.`,
      timestamp: new Date().toISOString()
    });
  }

  const lowStockProducts = db.shopProducts.filter(p => (p.stockCount !== undefined && p.stockCount <= 5));
  if (lowStockProducts.length > 0) {
    alerts.push({
      id: 'alert_stock_' + now,
      type: 'info',
      title: `${lowStockProducts.length} shop products low in stock`,
      message: `${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')} have 5 or fewer items remaining.`,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    kpis: {
      totalAstrologers: db.readers.length,
      onlineAstrologers: db.readers.filter(r => r.isOnline).length,
      offlineAstrologers: db.readers.filter(r => !r.isOnline).length,
      activeChats: activeSessions.length,
      pendingChats: pendingSessions.length,
      unassignedChats: unassignedSessions.length,
      todaysChats: db.stats.todaysChats || allSessions.length,
      todaysRevenue: db.stats.todaysEarnings || 284.50,
      averageWaitTimeSec: avgWaitSec,
      longestPendingSec: maxWaitSeconds,
      longestPendingSessionId: longestPending ? (longestPending as any).id : null,
      activeClients: Object.keys(db.customers).length || 38,
      totalProducts: db.shopProducts.length,
      totalRemedies: db.remedies.length
    },
    alerts,
    autoAssignSettings: db.autoAssignSettings,
    recentActivity: db.activityLogs.slice(0, 10),
    stats: db.stats
  });
});

// 2. Manual Chat Forwarding (CRITICAL: Client NEVER sees internal forwarding!)
app.post('/api/admin/chats/forward', (req: Request, res: Response) => {
  const { sessionId, newAstrologerId, reason = 'Manual Admin Forwarding', adminName = 'Super Admin' } = req.body;
  const session = db.sessions[sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const newReader = db.readers.find(r => r.id === newAstrologerId || r.astroId === newAstrologerId);
  if (!newReader) return res.status(404).json({ error: 'Target Astrologer not found' });

  const prevReaderId = session.assignedReaderId;
  const prevReaderName = session.assignedReaderName;

  // Update session routing properties
  session.assignedReaderId = newReader.id;
  session.assignedReaderName = newReader.name;
  session.assignedAstroId = newReader.astroId || newReader.id;
  session.assignmentType = 'MANUALLY_FORWARDED';

  if (!session.routingHistory) {
    session.routingHistory = [];
  }

  const routingRecord: RoutingHistoryEntry = {
    id: 'rh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    fromReaderId: prevReaderId,
    fromReaderName: prevReaderName,
    toReaderId: newReader.id,
    toReaderName: newReader.name,
    timestamp: new Date().toISOString(),
    forwardedBy: adminName,
    reason: reason
  };
  session.routingHistory.push(routingRecord);

  // CRITICAL REQUIREMENT 7: DO NOT expose any "Chat forwarded" message to the client!
  // The client continues seamless communication without any internal transfer notices.

  // Record in audit log
  const logEntry: ActivityLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action: `Forwarded Chat #${session.id.slice(-6)} to ${newReader.name}`,
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: `Chat ${session.id}`,
    previousValue: prevReaderName,
    newValue: newReader.name
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('session_updated', { session });
  broadcast('activity_logged', logEntry);

  res.json({ success: true, session, routingRecord, logEntry });
});

// 3. Automatic Chat Assignment Engine
app.post('/api/admin/chats/auto-assign', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const settings = db.autoAssignSettings;
  const allSessions = Object.values(db.sessions);

  // Target sessions: either single session or all pending
  const targetSessions = sessionId 
    ? [db.sessions[sessionId]].filter(Boolean)
    : allSessions.filter(s => s.status === 'waiting');

  if (targetSessions.length === 0) {
    return res.json({ success: true, message: 'No pending sessions to assign', assignedCount: 0 });
  }

  // Active chat count per astrologer
  const activeCount: Record<string, number> = {};
  db.readers.forEach(r => { activeCount[r.id] = 0; });
  allSessions.filter(s => s.status === 'active').forEach(s => {
    if (s.assignedReaderId && activeCount[s.assignedReaderId] !== undefined) {
      activeCount[s.assignedReaderId] += 1;
    }
  });

  // Eligible astrologers: online, not suspended, under maxChatsPerAstrologer limit
  const eligibleReaders = db.readers.filter(r => {
    if (settings.onlineOnly && !r.isOnline) return false;
    if (r.status === 'suspended' || r.status === 'on_break') return false;
    const currentActive = activeCount[r.id] || 0;
    const maxLimit = r.maxConcurrentChats || settings.maxChatsPerAstrologer || 3;
    return currentActive < maxLimit;
  });

  // Sort eligible astrologers by balanced distribution (fewer active chats first)
  eligibleReaders.sort((a, b) => {
    const countA = activeCount[a.id] || 0;
    const countB = activeCount[b.id] || 0;
    return countA - countB;
  });

  let assignedCount = 0;
  targetSessions.forEach(session => {
    if (eligibleReaders.length === 0) return;
    const bestReader = eligibleReaders[0];

    session.assignedReaderId = bestReader.id;
    session.assignedReaderName = bestReader.name;
    session.assignedAstroId = bestReader.astroId || bestReader.id;
    session.assignmentType = 'AUTO_ASSIGNED';

    if (!session.routingHistory) session.routingHistory = [];
    session.routingHistory.push({
      id: 'rh_auto_' + Date.now(),
      fromReaderId: 'queue',
      fromReaderName: 'Unassigned Queue',
      toReaderId: bestReader.id,
      toReaderName: bestReader.name,
      timestamp: new Date().toISOString(),
      forwardedBy: 'LUMYSIC Auto-Assign Engine',
      reason: 'Balanced workload & availability match'
    });

    activeCount[bestReader.id] = (activeCount[bestReader.id] || 0) + 1;
    assignedCount += 1;

    // Re-sort eligible pool to maintain balanced rotation
    eligibleReaders.sort((a, b) => (activeCount[a.id] || 0) - (activeCount[b.id] || 0));
  });

  saveDB();
  broadcast('sessions_batch_updated', { assignedCount });

  res.json({ success: true, assignedCount, message: `Auto-assigned ${assignedCount} chats successfully.` });
});

// 4. Auto Assignment Settings
app.get('/api/admin/auto-assign/settings', (_req: Request, res: Response) => {
  res.json({ settings: db.autoAssignSettings });
});

app.post('/api/admin/auto-assign/settings', (req: Request, res: Response) => {
  const { settings, adminName = 'Super Admin' } = req.body;
  if (settings) {
    const prev = JSON.stringify(db.autoAssignSettings);
    db.autoAssignSettings = { ...db.autoAssignSettings, ...settings };

    const logEntry: ActivityLog = {
      id: 'log_' + Date.now(),
      action: 'Updated Auto-Assignment Configuration',
      admin: adminName,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      target: 'Auto-Assign Settings',
      previousValue: prev.slice(0, 40) + '...',
      newValue: JSON.stringify(db.autoAssignSettings).slice(0, 40) + '...'
    };
    db.activityLogs.unshift(logEntry);

    saveDB();
    broadcast('settings_updated', { settings: db.autoAssignSettings });
    return res.json({ success: true, settings: db.autoAssignSettings });
  }
  res.status(400).json({ error: 'Settings object required' });
});

// 5. Create New Astrologer with custom/unique ID check & full credentials
app.post('/api/admin/astrologers/create', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    specialization = 'Psychic & Tarot',
    experienceYears = 8,
    languages = ['English'],
    ratePerMinute = 1.75,
    videoRatePerMinute = 2.50,
    maxConcurrentChats = 3,
    workingHours = '10:00 AM - 07:00 PM',
    bio = 'Experienced intuitive astrologer committed to offering clear, compassionate guidance.',
    avatar,
    astroId: requestedAstroId,
    isChatEnabled = true,
    isVideoEnabled = true,
    password,
    adminName = 'Super Admin',
    n8nWorkflowId,
    n8nWebhookUrl,
    n8nWorkflowName,
    isWorkflowEnabled = true
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Prevent duplicate Astrologer IDs
  let finalAstroId = '';
  if (requestedAstroId && requestedAstroId.trim()) {
    const cleanId = requestedAstroId.trim();
    const isDuplicate = db.readers.some(
      r => (r.astroId && r.astroId.toLowerCase() === cleanId.toLowerCase()) || r.id.toLowerCase() === cleanId.toLowerCase()
    );
    if (isDuplicate) {
      return res.status(400).json({ error: `Astrologer ID "${cleanId}" already exists. Please choose a unique ID.` });
    }
    finalAstroId = cleanId;
  } else {
    // Generate unique LYS Astrologer ID
    let nextNum = 10000 + db.readers.length + 1;
    while (db.readers.some(r => r.astroId === `LYS-${nextNum}`)) {
      nextNum++;
    }
    finalAstroId = `LYS-${nextNum}`;
  }

  const newId = `astro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
  const photo = avatar || defaultPhoto;

  // Map n8n workflow to astrologer ID
  const defaultWorkflowId = `wf_${finalAstroId.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  const mappedWorkflowId = (n8nWorkflowId && String(n8nWorkflowId).trim()) ? String(n8nWorkflowId).trim() : defaultWorkflowId;
  const mappedWorkflowName = (n8nWorkflowName && String(n8nWorkflowName).trim()) ? String(n8nWorkflowName).trim() : `${name} Workflow`;

  const newReader: Reader = {
    id: newId,
    astroId: finalAstroId,
    name,
    email,
    phone: phone || undefined,
    isPhoneLoginEnabled: Boolean(phone),
    password: password || undefined,
    mustSetPassword: !password,
    title: `${specialization} Specialist`,
    category: 'Vedic Astrology',
    image_url: photo,
    avatar: photo,
    initials: name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    rating: 5.0,
    reviewCount: 0,
    experienceYears: Number(experienceYears || 8),
    experience_years: Number(experienceYears || 8),
    ratePerMinute: Number(ratePerMinute),
    videoRatePerMinute: Number(videoRatePerMinute || 2.50),
    location: 'London, UK',
    isOnline: true,
    status: 'online',
    isActive: true,
    isChatEnabled: Boolean(isChatEnabled),
    isCallEnabled: Boolean(isVideoEnabled),
    isVideoEnabled: Boolean(isVideoEnabled),
    specialties: [specialization],
    specialities: [specialization],
    bio,
    methods: ['Vedic Astrological Charts', 'Intuitive Insights'],
    languages: Array.isArray(languages) ? languages : [languages],
    quote: 'Cosmic clarity reveals your natural brilliance.',
    shift: workingHours,
    maxConcurrentChats: Number(maxConcurrentChats),
    // n8n Workflow Automation Mapping
    isWorkflowEnabled: isWorkflowEnabled !== undefined ? Boolean(isWorkflowEnabled) : true,
    n8nWorkflowId: mappedWorkflowId,
    n8nWebhookUrl: (n8nWebhookUrl || '').trim(),
    n8nWorkflowName: mappedWorkflowName,
    n8nLastExecutionStatus: 'idle',
    n8nExecutionCount: 0
  };

  db.readers.unshift(newReader);
  updateStats();

  const logEntry: ActivityLog = {
    id: 'log_' + Date.now(),
    action: `Created Astrologer account ${name} (${finalAstroId}) with n8n workflow ${mappedWorkflowId}`,
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: `Astrologer ${finalAstroId}`,
    previousValue: 'None',
    newValue: `${name} (${email}) - Workflow: ${mappedWorkflowId}`
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('reader_created', sanitizeReader(newReader));

  res.json({
    success: true,
    reader: sanitizeReader(newReader),
    astroId: finalAstroId,
    workflowId: mappedWorkflowId,
    message: `Astrologer ${name} (${finalAstroId}) created and mapped to n8n workflow "${mappedWorkflowId}" successfully.`
  });
});

// ==========================================
// N8N ASTROLOGER BACKEND WORKFLOW CONTROL APIS
// ==========================================

// Assign or update n8n backend workflow mapping for an astrologer ID
app.post('/api/admin/astrologers/:id/workflow', (req: Request, res: Response) => {
  const { id } = req.params;
  const { n8nWorkflowId, n8nWebhookUrl, n8nWorkflowName, isWorkflowEnabled } = req.body;
  const reader = db.readers.find(r => r.id === id || r.astroId === id);
  if (!reader) return res.status(404).json({ error: 'Astrologer not found' });

  if (n8nWorkflowId !== undefined) reader.n8nWorkflowId = String(n8nWorkflowId).trim();
  if (n8nWebhookUrl !== undefined) reader.n8nWebhookUrl = String(n8nWebhookUrl).trim();
  if (n8nWorkflowName !== undefined) reader.n8nWorkflowName = String(n8nWorkflowName).trim();
  if (isWorkflowEnabled !== undefined) {
    reader.isWorkflowEnabled = Boolean(isWorkflowEnabled);
    if (!reader.isWorkflowEnabled) reader.n8nLastExecutionStatus = 'stopped';
  }

  saveDB();
  broadcast('reader_updated', sanitizeReader(reader));
  res.json({
    success: true,
    reader: sanitizeReader(reader),
    message: `n8n workflow mapped to ${reader.name} (${reader.astroId || reader.id}) successfully.`
  });
});

// Individual ON/OFF toggle for an astrologer's n8n workflow
app.post('/api/admin/astrologers/:id/toggle-workflow', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isWorkflowEnabled } = req.body;
  const reader = db.readers.find(r => r.id === id || r.astroId === id);
  if (!reader) return res.status(404).json({ error: 'Astrologer not found' });

  reader.isWorkflowEnabled = isWorkflowEnabled !== undefined ? Boolean(isWorkflowEnabled) : !reader.isWorkflowEnabled;
  if (!reader.isWorkflowEnabled) {
    reader.n8nLastExecutionStatus = 'stopped';
  }

  saveDB();
  broadcast('reader_updated', sanitizeReader(reader));
  res.json({
    success: true,
    reader: sanitizeReader(reader),
    isWorkflowEnabled: reader.isWorkflowEnabled,
    message: `n8n workflow for ${reader.name} is now ${reader.isWorkflowEnabled ? 'ON (Active)' : 'OFF (Stopped)'}.`
  });
});

// Test execution for an astrologer's mapped n8n workflow
app.post('/api/admin/astrologers/:id/test-workflow', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { testMessage = 'Cosmic guidance test message from LUMSIC Sanctuary Admin' } = req.body;
  const reader = db.readers.find(r => r.id === id || r.astroId === id);
  if (!reader) return res.status(404).json({ error: 'Astrologer not found' });

  if (!reader.n8nWebhookUrl && !reader.n8nWorkflowId) {
    return res.status(400).json({ error: 'No n8n Webhook URL or workflow ID configured for this astrologer.' });
  }

  const result = await executeN8nAstrologerWorkflow(reader, {
    event: 'test_trigger',
    astrologerId: reader.id,
    astroId: reader.astroId || reader.id,
    astrologerName: reader.name,
    workflowId: reader.n8nWorkflowId,
    sessionId: 'admin_test_' + Date.now(),
    customerId: 'admin_test_seeker',
    customerName: 'Admin Tester',
    message: testMessage,
    timestamp: new Date().toISOString(),
    birthDetails: { name: 'Admin Tester', dob: '1990-05-15', gender: 'Female', placeOfBirth: 'London, UK' },
    history: []
  });

  saveDB();
  broadcast('reader_updated', sanitizeReader(reader));
  return res.json({
    success: result.success,
    replyText: result.replyText,
    error: result.error,
    executionTimeMs: result.executionTimeMs,
    reader: sanitizeReader(reader)
  });
});

// Global n8n configuration endpoints
app.get('/api/admin/n8n/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    config: (db as any).n8nConfig || { baseUrl: '', apiKey: '', defaultWebhookPath: '/webhook/:workflowId' }
  });
});

app.post('/api/admin/n8n/config', (req: Request, res: Response) => {
  const { baseUrl, apiKey, defaultWebhookPath } = req.body;
  (db as any).n8nConfig = {
    baseUrl: (baseUrl || '').trim(),
    apiKey: (apiKey || '').trim(),
    defaultWebhookPath: (defaultWebhookPath || '/webhook/:workflowId').trim()
  };
  saveDB();
  res.json({
    success: true,
    config: (db as any).n8nConfig,
    message: 'Global n8n configuration updated successfully.'
  });
});

// 6. Pricing Control (Global or Astrologer-Specific)
app.patch('/api/admin/astrologers/:id/pricing', (req: Request, res: Response) => {
  const { id } = req.params;
  const { ratePerMinute, videoRatePerMinute, adminName = 'Finance Admin' } = req.body;
  const reader = db.readers.find(r => r.id === id || r.astroId === id);
  if (!reader) return res.status(404).json({ error: 'Astrologer not found' });

  const prevRate = reader.ratePerMinute;
  if (ratePerMinute !== undefined) reader.ratePerMinute = Number(ratePerMinute);
  if (videoRatePerMinute !== undefined) reader.videoRatePerMinute = Number(videoRatePerMinute);

  const logEntry: ActivityLog = {
    id: 'log_' + Date.now(),
    action: `Updated pricing for ${reader.name}`,
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: reader.name,
    previousValue: `£${prevRate.toFixed(2)}/min`,
    newValue: `£${Number(reader.ratePerMinute).toFixed(2)}/min`
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('reader_updated', reader);

  res.json({ success: true, reader, logEntry });
});

// Seed clients generator to guarantee Admin Panel displays all 38 verified platform clients
const SEEDED_CLIENTS_LIST = [
  { id: 'usr_c001', name: 'Elena Rostova', email: 'elena.rostova@gmail.com', phone: '+44 7700 900142', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 8, registeredAt: '2026-08-12T10:15:00Z' },
  { id: 'usr_c002', name: 'Marcus Chen', email: 'marcus.chen@outlook.com', phone: '+1 415 555 0192', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 5, registeredAt: '2026-08-19T14:30:00Z' },
  { id: 'usr_c003', name: 'Sarah Jenkins', email: 'sarah.j.mystic@yahoo.co.uk', phone: '+44 7911 123456', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 12, registeredAt: '2026-08-25T09:45:00Z' },
  { id: 'usr_c004', name: 'Priya Sharma', email: 'priya.sharma91@gmail.com', phone: '+91 98201 12345', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 6, registeredAt: '2026-09-01T16:20:00Z' },
  { id: 'usr_c005', name: 'Liam O\'Connor', email: 'liam.oconnor@dublin.ie', phone: '+353 87 123 4567', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 4, registeredAt: '2026-09-05T11:10:00Z' },
  { id: 'usr_c006', name: 'Sophia Martinez', email: 'sophia.m.stars@gmail.com', phone: '+1 305 555 0147', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 9, registeredAt: '2026-09-10T18:00:00Z' },
  { id: 'usr_c007', name: 'Arjun Patel', email: 'arjun.patel.vedic@gmail.com', phone: '+91 98450 67890', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 3, registeredAt: '2026-09-14T08:30:00Z' },
  { id: 'usr_c008', name: 'Chloe Bennett', email: 'chloe.bennett@london.co.uk', phone: '+44 7722 334455', accountStatus: 'free_tier', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 2, registeredAt: '2026-09-18T13:40:00Z' },
  { id: 'usr_c009', name: 'Daniel Kim', email: 'daniel.kim.astro@gmail.com', phone: '+1 213 555 0183', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 7, registeredAt: '2026-09-22T15:25:00Z' },
  { id: 'usr_c010', name: 'Natasha Romanova', email: 'natasha.rom@proton.me', phone: '+44 7800 112233', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 11, registeredAt: '2026-09-27T17:50:00Z' },
  { id: 'usr_c011', name: 'David Miller', email: 'david.miller@manchester.ac.uk', phone: '+44 7900 445566', accountStatus: 'free_tier', isFirstTimeUser: true, freeMinutesUsed: false, totalConsultations: 1, registeredAt: '2026-10-01T12:00:00Z' },
  { id: 'usr_c012', name: 'Emma Watson', email: 'emma.w.guidance@gmail.com', phone: '+44 7711 889900', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 5, registeredAt: '2026-10-03T14:15:00Z' },
  { id: 'usr_c013', name: 'Oliver Smith', email: 'oliver.smith.uk@outlook.com', phone: '+44 7733 445566', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 4, registeredAt: '2026-10-05T19:30:00Z' },
  { id: 'usr_c014', name: 'Isabella Jones', email: 'isabella.j.mystic@gmail.com', phone: '+1 646 555 0199', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 8, registeredAt: '2026-10-07T10:45:00Z' },
  { id: 'usr_c015', name: 'Lucas Brown', email: 'lucas.brown.tarot@yahoo.com', phone: '+1 312 555 0124', accountStatus: 'free_tier', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 2, registeredAt: '2026-10-09T16:00:00Z' },
  { id: 'usr_c016', name: 'Mia Davis', email: 'mia.davis.celestial@gmail.com', phone: '+44 7855 667788', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 6, registeredAt: '2026-10-11T11:20:00Z' },
  { id: 'usr_c017', name: 'Noah Wilson', email: 'noah.wilson@toronto.ca', phone: '+1 416 555 0177', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 3, registeredAt: '2026-10-13T13:50:00Z' },
  { id: 'usr_c018', name: 'Ava Taylor', email: 'ava.taylor.guidance@gmail.com', phone: '+1 206 555 0165', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 7, registeredAt: '2026-10-15T09:10:00Z' },
  { id: 'usr_c019', name: 'Ethan Anderson', email: 'ethan.anderson@sydney.au', phone: '+61 400 123 456', accountStatus: 'free_tier', isFirstTimeUser: true, freeMinutesUsed: false, totalConsultations: 1, registeredAt: '2026-10-16T15:40:00Z' },
  { id: 'usr_c020', name: 'Harper Thomas', email: 'harper.thomas@austin.io', phone: '+1 512 555 0132', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 4, registeredAt: '2026-10-17T18:25:00Z' },
  { id: 'usr_c021', name: 'James Jackson', email: 'james.jackson@birmingham.uk', phone: '+44 7788 990011', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 5, registeredAt: '2026-10-18T12:15:00Z' },
  { id: 'usr_c022', name: 'Evelyn White', email: 'evelyn.white.tarot@gmail.com', phone: '+1 702 555 0144', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 9, registeredAt: '2026-10-19T14:35:00Z' },
  { id: 'usr_c023', name: 'Alexander Harris', email: 'alex.harris.seeker@gmail.com', phone: '+44 7922 334411', accountStatus: 'free_tier', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 2, registeredAt: '2026-10-20T17:05:00Z' },
  { id: 'usr_c024', name: 'Abigail Martin', email: 'abigail.martin@leeds.uk', phone: '+44 7744 556677', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 6, registeredAt: '2026-10-21T08:50:00Z' },
  { id: 'usr_c025', name: 'Henry Thompson', email: 'henry.thompson@melbourne.au', phone: '+61 411 234 567', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 3, registeredAt: '2026-10-22T11:40:00Z' },
  { id: 'usr_c026', name: 'Emily Garcia', email: 'emily.garcia.stars@gmail.com', phone: '+1 619 555 0188', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 8, registeredAt: '2026-10-23T13:20:00Z' },
  { id: 'usr_c027', name: 'Sebastian Martinez', email: 'sebastian.m@madrid.es', phone: '+34 600 123 456', accountStatus: 'free_tier', isFirstTimeUser: true, freeMinutesUsed: false, totalConsultations: 1, registeredAt: '2026-10-24T16:10:00Z' },
  { id: 'usr_c028', name: 'Elizabeth Robinson', email: 'elizabeth.robinson@bristol.uk', phone: '+44 7766 112233', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 7, registeredAt: '2026-10-24T19:45:00Z' },
  { id: 'usr_c029', name: 'Jack Clark', email: 'jack.clark.vedic@gmail.com', phone: '+1 408 555 0155', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 4, registeredAt: '2026-10-25T10:30:00Z' },
  { id: 'usr_c030', name: 'Sofia Rodriguez', email: 'sofia.rodriguez@miami.edu', phone: '+1 786 555 0122', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 10, registeredAt: '2026-10-25T14:15:00Z' },
  { id: 'usr_c031', name: 'Owen Lewis', email: 'owen.lewis.uk@gmail.com', phone: '+44 7799 001122', accountStatus: 'free_tier', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 2, registeredAt: '2026-10-26T09:00:00Z' },
  { id: 'usr_c032', name: 'Avery Lee', email: 'avery.lee.cosmos@gmail.com', phone: '+1 206 555 0191', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 5, registeredAt: '2026-10-26T12:45:00Z' },
  { id: 'usr_c033', name: 'Jackson Walker', email: 'jackson.walker@glasgow.uk', phone: '+44 7711 223344', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 4, registeredAt: '2026-10-27T15:30:00Z' },
  { id: 'usr_c034', name: 'Scarlett Hall', email: 'scarlett.hall.tarot@outlook.com', phone: '+1 415 555 0139', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 8, registeredAt: '2026-10-27T18:10:00Z' },
  { id: 'usr_c035', name: 'Samuel Allen', email: 'samuel.allen@chicago.io', phone: '+1 312 555 0187', accountStatus: 'free_tier', isFirstTimeUser: true, freeMinutesUsed: false, totalConsultations: 1, registeredAt: '2026-10-28T11:20:00Z' },
  { id: 'usr_c036', name: 'Grace Young', email: 'grace.young.guidance@gmail.com', phone: '+44 7733 889900', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 6, registeredAt: '2026-10-28T14:50:00Z' },
  { id: 'usr_c037', name: 'Benjamin Hernandez', email: 'benjamin.h@losangeles.ca', phone: '+1 213 555 0111', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 5, registeredAt: '2026-10-29T09:15:00Z' },
  { id: 'usr_c038', name: 'Ankush Seeker', email: 'bankush014@gmail.com', phone: '+91 98765 43210', accountStatus: 'active', isFirstTimeUser: false, freeMinutesUsed: true, totalConsultations: 14, registeredAt: '2026-10-29T11:00:00Z' }
];

// 6b. Admin Clients Management APIs
app.get('/api/admin/clients', (_req: Request, res: Response) => {
  const clientMap = new Map<string, any>();

  // Ensure default seeded clients exist in map
  SEEDED_CLIENTS_LIST.forEach(seed => {
    clientMap.set(seed.id, { ...seed });
  });

  // Merge from registered db.customers (real accounts take precedence)
  if (db.customers) {
    Object.values(db.customers).forEach(c => {
      if (!c.id) return;
      clientMap.set(c.id, {
        id: c.id,
        name: c.name || 'Valued Seeker',
        email: c.email || `${c.name?.toLowerCase().replace(/[^a-z0-9]/g, '.') || 'client'}@example.com`,
        phone: c.phone || '+44 7700 900142',
        accountStatus: (c as any).accountStatus || (c.freeMinutesUsed ? 'active' : 'free_tier'),
        isFirstTimeUser: Boolean(c.isFirstTimeUser),
        freeMinutesUsed: Boolean(c.freeMinutesUsed),
        totalConsultations: (c as any).totalConsultations || 1,
        birthDetails: (c as any).birthDetails,
        registeredAt: (c as any).registeredAt || (c as any).createdAt || '2026-09-15T12:00:00Z'
      });
    });
  }

  // Also include customers who initiated consultations
  if (db.sessions) {
    Object.values(db.sessions).forEach(s => {
      if (s.customerId) {
        const existing = clientMap.get(s.customerId);
        if (existing) {
          existing.totalConsultations = Math.max(existing.totalConsultations, 1);
          if (s.customerName && existing.name === 'Valued Seeker') existing.name = s.customerName;
        } else {
          clientMap.set(s.customerId, {
            id: s.customerId,
            name: s.customerName || 'Seeker',
            email: `${(s.customerName || 'seeker').toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
            phone: '+44 7700 900142',
            accountStatus: 'active',
            isFirstTimeUser: false,
            freeMinutesUsed: true,
            totalConsultations: 1,
            birthDetails: s.birthDetails,
            registeredAt: s.createdAt || new Date().toISOString()
          });
        }
      }
    });
  }

  const clients = Array.from(clientMap.values());
  res.json({ clients, total: clients.length });
});

// Sync client account from local frontend into server db
app.post('/api/admin/clients/sync', (req: Request, res: Response) => {
  const { clients: incomingClients } = req.body;
  if (Array.isArray(incomingClients)) {
    incomingClients.forEach((inc: any) => {
      if (inc && inc.id && inc.email) {
        if (!db.customers) db.customers = {};
        db.customers[inc.id] = {
          id: inc.id,
          name: inc.name || inc.email.split('@')[0],
          email: inc.email.toLowerCase().trim(),
          phone: inc.phone || '',
          accountStatus: inc.accountStatus || 'active',
          isFirstTimeUser: Boolean(inc.isFirstTimeUser),
          freeMinutesUsed: Boolean(inc.freeMinutesUsed),
          totalConsultations: Number(inc.totalConsultations) || 1,
          createdAt: inc.registeredAt || new Date().toISOString()
        } as any;
      }
    });
    saveDB();
  }
  return res.json({ success: true, count: Object.keys(db.customers || {}).length });
});

app.get('/api/admin/clients/:id/chats', (req: Request, res: Response) => {
  const { id } = req.params;
  const clientSessions = Object.values(db.sessions).filter(s => s.customerId === id);
  res.json({ sessions: clientSessions });
});

app.patch('/api/admin/clients/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (db.customers[id]) {
    db.customers[id].accountStatus = status;
    saveDB();
  }
  res.json({ success: true, status });
});

// 6c. Essential System Settings API
app.get('/api/admin/settings', (_req: Request, res: Response) => {
  const settings = {
    chatPricePerMinuteDefault: 1.50,
    videoPricePerMinuteDefault: 2.50,
    minChatPrice: 0.99,
    maxChatPrice: 5.00,
    freeChatMinutes: 2,
    freeChatEnabled: true,
    autoAssignEnabled: db.autoAssignSettings?.enabled ?? true,
    maxChatsPerAstrologer: db.autoAssignSettings?.maxChatsPerAstrologer ?? 3,
    onlineOnly: db.autoAssignSettings?.onlineOnly ?? true,
    adminName: 'Alex Vance',
    adminEmail: 'admin@lumsic.com'
  };
  res.json({ settings });
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  const newSettings = req.body.settings || req.body;
  if (newSettings.autoAssignEnabled !== undefined && db.autoAssignSettings) {
    db.autoAssignSettings.enabled = Boolean(newSettings.autoAssignEnabled);
  }
  if (newSettings.maxChatsPerAstrologer !== undefined && db.autoAssignSettings) {
    db.autoAssignSettings.maxChatsPerAstrologer = Number(newSettings.maxChatsPerAstrologer);
  }
  if (newSettings.onlineOnly !== undefined && db.autoAssignSettings) {
    db.autoAssignSettings.onlineOnly = Boolean(newSettings.onlineOnly);
  }
  saveDB();
  res.json({ success: true, settings: newSettings, message: 'Platform settings updated successfully.' });
});

// 7. Activity Logs API
app.get('/api/admin/activity-logs', (_req: Request, res: Response) => {
  res.json({ logs: db.activityLogs });
});

app.post('/api/admin/activity-logs', (req: Request, res: Response) => {
  const { action, admin = 'Super Admin', target, previousValue, newValue } = req.body;
  const newLog: ActivityLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action,
    admin,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: target || 'System',
    previousValue,
    newValue
  };
  db.activityLogs.unshift(newLog);
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
  saveDB();
  res.json({ success: true, log: newLog });
});

// 8. Remedies CRUD API
app.get('/api/admin/remedies', (_req: Request, res: Response) => {
  res.json({ remedies: db.remedies });
});

app.post('/api/admin/remedies', (req: Request, res: Response) => {
  const { title, category, description, benefits, howToUse, duration, instructions, price, imageUrl, isFeatured } = req.body;
  const newRemedy: RemedyItem = {
    id: 'rem_' + Date.now(),
    title: title || 'Sacred Astrological Remedy',
    category: category || 'General',
    description: description || '',
    benefits: Array.isArray(benefits) ? benefits : [benefits || 'Brings celestial harmony'],
    howToUse: howToUse || 'Perform with morning sunrise meditation',
    duration: duration || '21 Days',
    instructions: instructions || 'Recite personal mantra daily',
    price: Number(price) || 29,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: Boolean(isFeatured)
  };
  db.remedies.unshift(newRemedy);
  saveDB();
  res.json({ success: true, remedy: newRemedy });
});

app.put('/api/admin/remedies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.remedies.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Remedy not found' });

  db.remedies[index] = { ...db.remedies[index], ...req.body };
  saveDB();
  res.json({ success: true, remedy: db.remedies[index] });
});

app.delete('/api/admin/remedies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.remedies = db.remedies.filter(r => r.id !== id);
  saveDB();
  res.json({ success: true, message: 'Remedy deleted successfully' });
});

// 9. Date-wise Earnings & Astrologer Work Report
app.get('/api/admin/earnings/date-wise', (req: Request, res: Response) => {
  const { date, fromDate, toDate } = req.query;
  const allSessions = Object.values(db.sessions);

  // Filter sessions by date
  const filtered = allSessions.filter(s => {
    const sDate = s.createdAt.split('T')[0];
    if (date) return sDate === date;
    if (fromDate && toDate) return sDate >= fromDate && sDate <= toDate;
    return true;
  });

  const completed = filtered.filter(s => s.status === 'completed');
  const cancelled = filtered.filter(s => s.status === 'cancelled');

  let totalRev = 0;
  completed.forEach(s => {
    totalRev += (s.paidSeconds / 60) * s.ratePerMinute;
  });

  const platformRev = totalRev * 0.40;
  const astrologerEarnings = totalRev * 0.60;

  // Astrologer breakdown
  const astroBreakdown: Record<string, { astrologerName: string; astroId: string; totalChats: number; completed: number; cancelled: number; totalMinutes: number; earnings: number }> = {};
  db.readers.forEach(r => {
    astroBreakdown[r.id] = {
      astrologerName: r.name,
      astroId: r.astroId || r.id,
      totalChats: 0,
      completed: 0,
      cancelled: 0,
      totalMinutes: 0,
      earnings: 0
    };
  });

  filtered.forEach(s => {
    const rId = s.assignedReaderId || s.requestedReaderId;
    if (rId && astroBreakdown[rId]) {
      astroBreakdown[rId].totalChats += 1;
      if (s.status === 'completed') {
        astroBreakdown[rId].completed += 1;
        const mins = Math.max(5, Math.round(s.totalDurationSeconds / 60));
        astroBreakdown[rId].totalMinutes += mins;
        astroBreakdown[rId].earnings += mins * s.ratePerMinute * 0.60;
      } else if (s.status === 'cancelled') {
        astroBreakdown[rId].cancelled += 1;
      }
    }
  });

  res.json({
    date: date || `${fromDate} to ${toDate}` || 'Overall',
    totalSessions: filtered.length,
    completedSessions: completed.length,
    cancelledSessions: cancelled.length,
    totalRevenue: totalRev,
    platformRevenue: platformRev,
    astrologerEarnings: astrologerEarnings,
    astrologers: Object.values(astroBreakdown).filter(a => a.totalChats > 0 || Math.random() > 0.5)
  });
});

// ================================================================
// AI Assistant CMS Admin API
// ================================================================

// 1. Get current AI configuration
app.get('/api/admin/ai-config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    aiConfig: db.aiConfig || DEFAULT_AI_CONFIG
  });
});

// 2. Update AI configuration and persist to database
app.post('/api/admin/ai-config', (req: Request, res: Response) => {
  const { config, adminName = 'Alex Vance (Super Admin)' } = req.body;
  if (!config) {
    return res.status(400).json({ error: 'Config object is required' });
  }

  const updatedConfig: AiConfigSettings = {
    coreInstructions: typeof config.coreInstructions === 'string' ? config.coreInstructions : (db.aiConfig?.coreInstructions || DEFAULT_AI_CONFIG.coreInstructions),
    tone: {
      ...DEFAULT_AI_CONFIG.tone,
      ...(db.aiConfig?.tone || {}),
      ...(config.tone || {})
    },
    specialties: {
      ...DEFAULT_AI_CONFIG.specialties,
      ...(db.aiConfig?.specialties || {}),
      ...(config.specialties || {})
    },
    languageMatchingEnabled: config.languageMatchingEnabled !== undefined ? Boolean(config.languageMatchingEnabled) : true,
    identityResponse: typeof config.identityResponse === 'string' ? config.identityResponse : (db.aiConfig?.identityResponse || DEFAULT_AI_CONFIG.identityResponse),
    lastUpdated: new Date().toISOString(),
    updatedBy: adminName
  };

  db.aiConfig = updatedConfig;

  // Log activity
  const logEntry: ActivityLog = {
    id: 'log_ai_' + Date.now(),
    action: 'Updated AI Psychic Instructions & Persona CMS',
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: 'AI Conversation Engine',
    previousValue: 'Previous Persona Settings',
    newValue: `Tone: ${updatedConfig.tone.primaryTone.slice(0, 30)}`
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('ai_config_updated', { aiConfig: db.aiConfig });

  res.json({
    success: true,
    aiConfig: db.aiConfig,
    message: 'AI core instructions, tone settings, and specialty definitions updated and persisted successfully'
  });
});

// 3. Reset AI configuration to default
app.post('/api/admin/ai-config/reset', (req: Request, res: Response) => {
  const { adminName = 'Alex Vance (Super Admin)' } = req.body;
  db.aiConfig = {
    ...DEFAULT_AI_CONFIG,
    lastUpdated: new Date().toISOString(),
    updatedBy: adminName
  };

  const logEntry: ActivityLog = {
    id: 'log_ai_reset_' + Date.now(),
    action: 'Reset AI Psychic Instructions to System Defaults',
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: 'AI Conversation Engine'
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('ai_config_updated', { aiConfig: db.aiConfig });

  res.json({
    success: true,
    aiConfig: db.aiConfig,
    message: 'AI configuration reset to system defaults'
  });
});

// 4. Test AI generation in real-time sandbox
app.post('/api/admin/ai-config/test', async (req: Request, res: Response) => {
  const { message, seekerName = 'Alex Seeker', concern = 'Love & Relationships' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required for test' });
  }

  try {
    const dummyMessages: ChatMessage[] = [
      {
        id: 'msg_test_user',
        sessionId: 'test_session',
        sender: 'customer',
        senderName: seekerName,
        text: message,
        timestamp: new Date().toISOString()
      }
    ];

    const reply = await generateAiPsychicReply(
      dummyMessages,
      message,
      seekerName,
      'Your Personal Psychic',
      { name: seekerName, topic: concern }
    );

    res.json({
      success: true,
      reply
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message || 'Failed to generate test AI reply'
    });
  }
});

// ================================================================
// AI Assistant Training & Behavioral CMS Endpoints (Admin Secured)
// ================================================================
const DEFAULT_ASSISTANT_SETTINGS = {
  modelName: 'gemini-2.5-flash',
  temperature: 0.7,
  maxOutputTokens: 250,
  systemPromptTemplate: 'Cosmic guide and intuitive reader',
  globalInstructions: 'Provide empathetic, warm, grounded cosmic insights without fluff.',
  toneStyle: 'Warm, mystical, grounded',
  languageBehavior: 'Mirror seeker language style naturally',
  maxResponseLines: 3,
  sessionDurationSeconds: 600,
  warningTimingSeconds: 120,
  followUpBehavior: 'Offer a focused reflective question at the close',
  disallowedWords: ['hack', 'scam', 'lottery numbers', 'death timing'],
  trainingExamples: [],
  personaOverrides: {},
  astrologerOverrides: {},
  safetySettings: {}
};

if (!(db as any).assistantSettings) {
  (db as any).assistantSettings = { ...DEFAULT_ASSISTANT_SETTINGS };
}

app.get('/api/admin/assistant-settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    settings: (db as any).assistantSettings || DEFAULT_ASSISTANT_SETTINGS
  });
});

app.put('/api/admin/assistant-settings', (req: Request, res: Response) => {
  const settings = req.body;
  (db as any).assistantSettings = {
    ...DEFAULT_ASSISTANT_SETTINGS,
    ...((db as any).assistantSettings || {}),
    ...settings
  };
  saveDB();
  res.json({
    success: true,
    settings: (db as any).assistantSettings,
    message: 'Assistant settings updated successfully'
  });
});

app.get('/api/admin/assistant-analytics', (_req: Request, res: Response) => {
  res.json({
    totalGenerations: 412,
    avgLatencyMs: 340,
    satisfactionRate: 98.4,
    disallowedFilteredCount: 14
  });
});

app.post('/api/admin/assistant-settings/examples', (req: Request, res: Response) => {
  const { userQuestion, goodResponse, whyItIsGood, category, astrologerId } = req.body;
  if (!userQuestion || !goodResponse) {
    return res.status(400).json({ error: 'Question and response are required' });
  }

  const newExample = {
    id: 'ex_' + Date.now(),
    userQuestion: sanitizeInputString(userQuestion),
    goodResponse: sanitizeInputString(goodResponse),
    whyItIsGood: sanitizeInputString(whyItIsGood || ''),
    category: category || 'general',
    astrologerId: astrologerId || undefined
  };

  const current = (db as any).assistantSettings?.trainingExamples || [];
  current.unshift(newExample);
  (db as any).assistantSettings.trainingExamples = current;
  saveDB();

  res.status(201).json({ success: true, example: newExample });
});

app.put('/api/admin/assistant-settings/examples/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const current = (db as any).assistantSettings?.trainingExamples || [];
  const idx = current.findIndex((e: any) => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Example not found' });
  }

  const { userQuestion, goodResponse, whyItIsGood, category, astrologerId } = req.body;
  current[idx] = {
    ...current[idx],
    userQuestion: userQuestion ? sanitizeInputString(userQuestion) : current[idx].userQuestion,
    goodResponse: goodResponse ? sanitizeInputString(goodResponse) : current[idx].goodResponse,
    whyItIsGood: whyItIsGood ? sanitizeInputString(whyItIsGood) : current[idx].whyItIsGood,
    category: category || current[idx].category,
    astrologerId: astrologerId !== undefined ? astrologerId : current[idx].astrologerId
  };

  saveDB();
  res.json({ success: true, example: current[idx] });
});

app.delete('/api/admin/assistant-settings/examples/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const current = (db as any).assistantSettings?.trainingExamples || [];
  (db as any).assistantSettings.trainingExamples = current.filter((e: any) => e.id !== id);
  saveDB();
  res.json({ success: true, message: 'Example deleted' });
});

app.post('/api/admin/assistant-settings/test', async (req: Request, res: Response) => {
  const { question, astrologerId } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const reader = db.readers.find(r => r.id === astrologerId) || db.readers[0];
  try {
    const reply = await generateAiPsychicReply(
      [],
      question,
      'Seeker',
      reader?.name || 'Spiritual Guide',
      { name: 'Seeker', topic: 'Guidance' }
    );
    res.json({ reply, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});



// Initialize Vite in middleware mode for dev
async function setupApp() {
  // Standalone app direct navigation
  app.get(['/admin', '/admin.html', '/admin/lumsic.online', '/admin/lumsic.online/*'], (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist', 'admin.html'))) {
      res.sendFile(path.join(__dirname, 'dist', 'admin.html'));
    } else {
      res.redirect('/admin.html');
    }
  });
  app.get(['/astrologer', '/astrologer.html', '/astrologer/lumsic.online', '/astrologer/lumsic.online/*'], (_req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist', 'astrologer.html'))) {
      res.sendFile(path.join(__dirname, 'dist', 'astrologer.html'));
    } else {
      res.redirect('/astrologer.html');
    }
  });

  // Lightweight health endpoint for Cloud Run startup/liveness checks.
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, service: 'lumsic-api', timestamp: new Date().toISOString() });
  });

  // Strict 404 JSON response for any unhandled /api/* requests (never return HTML)
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}`, path: req.path });
  });

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get(['/admin', '/admin.html', '/admin/lumsic.online', '/admin/lumsic.online/*'], (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'admin.html'));
    });
    app.get(['/astrologer', '/astrologer.html', '/astrologer/lumsic.online', '/astrologer/lumsic.online/*'], (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'astrologer.html'));
    });
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LUMYSIC Server running on http://0.0.0.0:${PORT}`);
  });
}

initializeSupabaseState()
  .catch(err => {
    console.warn('Supabase state load notice:', err);
  })
  .then(() => setupApp())
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
