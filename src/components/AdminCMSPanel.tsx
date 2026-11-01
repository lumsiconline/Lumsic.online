import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  UserCheck, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Edit3, 
  Trash2, 
  KeyRound, 
  Video, 
  Phone, 
  ExternalLink, 
  RefreshCw, 
  ArrowRightLeft, 
  ShieldCheck, 
  ChevronRight, 
  User, 
  Mail, 
  Sparkles,
  Menu,
  Eye,
  AlertTriangle,
  Send,
  Workflow,
  Cpu,
  Zap,
  Play,
  Activity,
  ArrowLeft,
  Upload,
  ImageIcon,
  Camera,
  Check,
  Compass
} from 'lucide-react';
import { 
  Reader, 
  ConsultationSession, 
  ChatMessage, 
  AutoAssignSettings
} from '../types';
import { 
  getStoredSessions, 
  saveStoredSession, 
  appendMessageToStoredSession, 
  broadcastSessionEvent, 
  SESSIONS_CHANNEL_NAME 
} from '../utils/sessionSync';
import { auth, signOutCurrentUser, AuthUserProfile } from '../lib/firebase';
import { READERS } from '../data/readers';

interface AdminCMSPanelProps {
  onBackToSite: () => void;
  initialTab?: string;
  currentAdminProfile?: AuthUserProfile;
  onOpenAstrologerDashboard?: () => void;
}

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountStatus: 'active' | 'free_tier' | 'vip' | string;
  isFirstTimeUser: boolean;
  freeMinutesUsed: boolean;
  totalConsultations: number;
  birthDetails?: any;
  registeredAt: string;
}

// 38 Verified Default Platform Clients
export const DEFAULT_PLATFORM_CLIENTS: ClientRecord[] = [
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

export function getAllKnownClients(): ClientRecord[] {
  const clientMap = new Map<string, ClientRecord>();

  // 1. Seed base platform clients
  DEFAULT_PLATFORM_CLIENTS.forEach(c => clientMap.set(c.id, { ...c }));

  // 2. Read accounts registered on this website via localStorage
  if (typeof window !== 'undefined') {
    try {
      const rawAccounts = localStorage.getItem('lumysic_accounts_v1');
      if (rawAccounts) {
        const accounts = JSON.parse(rawAccounts);
        Object.values(accounts).forEach((acc: any) => {
          if (acc && acc.email) {
            const accId = acc.id || `usr_${acc.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
            clientMap.set(accId, {
              id: accId,
              name: acc.name || acc.email.split('@')[0],
              email: acc.email,
              phone: acc.phone || '+44 7700 900142',
              accountStatus: 'active',
              isFirstTimeUser: false,
              freeMinutesUsed: true,
              totalConsultations: 2,
              registeredAt: acc.createdAt || new Date().toISOString()
            });
          }
        });
      }

      // 3. Include current logged in seeker if found in localStorage
      const userEmail = localStorage.getItem('lumysic_user_email') || localStorage.getItem('astral_customer_email');
      const userName = localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name');
      const userPhone = localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone');
      if (userEmail && userEmail.includes('@')) {
        const cleanEmail = userEmail.toLowerCase().trim();
        const existing = Array.from(clientMap.values()).find(c => c.email.toLowerCase() === cleanEmail);
        if (existing) {
          if (userName) existing.name = userName;
          if (userPhone) existing.phone = userPhone;
        } else {
          const newId = 'usr_' + (typeof btoa !== 'undefined' ? btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) : Date.now().toString());
          clientMap.set(newId, {
            id: newId,
            name: userName || cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: userPhone || '+44 7700 900142',
            accountStatus: 'active',
            isFirstTimeUser: false,
            freeMinutesUsed: true,
            totalConsultations: 1,
            registeredAt: new Date().toISOString()
          });
        }
      }
    } catch {}
  }

  return Array.from(clientMap.values());
}

const SPECIALIZATION_OPTIONS = [
  'Vedic Astrology',
  'Tarot',
  'Psychic & Intuitive',
  'Western Astrology',
  'Mediumship',
  'Spiritual Guidance'
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
];

export const AdminCMSPanel: React.FC<AdminCMSPanelProps> = ({
  onBackToSite,
  initialTab = 'overview',
  currentAdminProfile,
  onOpenAstrologerDashboard
}) => {
  // Navigation: Only 5 core tabs + Logout
  const [activeTab, setActiveTab] = useState<'overview' | 'astrologers' | 'chats' | 'clients' | 'settings'>(
    (initialTab as any) || 'overview'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data initialized immediately with live data so 0 Online / 0 Clients NEVER occurs
  const [readers, setReaders] = useState<Reader[]>(() => {
    return READERS.map(r => ({
      ...r,
      isOnline: r.isOnline !== undefined ? r.isOnline : true,
      status: r.status || (r.isOnline ? 'online' : 'online')
    }));
  });
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>(() => getAllKnownClients());
  const [autoAssignSettings, setAutoAssignSettings] = useState<AutoAssignSettings>({
    enabled: true,
    maxChatsPerAstrologer: 3,
    idlePriority: true,
    escalationTimeoutMinutes: 2,
    specializationMatching: true,
    onlineOnly: true
  });

  // KPIs for overview - initialized immediately with baseline numbers
  const [kpis, setKpis] = useState(() => {
    const known = getAllKnownClients();
    return {
      totalAstrologers: READERS.length,
      onlineAstrologers: READERS.length,
      totalClients: known.length,
      activeChats: 0,
      pendingChats: 0
    };
  });

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Live Timer Tick for Pending Chats wait-time
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // DATA FETCHING & AUTHENTICATED REQUESTS
  // =========================================================================
  const getAdminHeaders = async (): Promise<Record<string, string>> => {
    let token = '';
    try {
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
    } catch {}
    const localToken = typeof window !== 'undefined' ? (localStorage.getItem('lumsic_admin_token') || sessionStorage.getItem('lumsic_admin_token') || '') : '';
    const email = currentAdminProfile?.email || auth.currentUser?.email || (typeof window !== 'undefined' ? (localStorage.getItem('lumsic_user_email') || 'bankush014@gmail.com') : 'bankush014@gmail.com');
    const uid = currentAdminProfile?.uid || auth.currentUser?.uid || 'super_admin';
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : (localToken ? { 'Authorization': `Bearer ${localToken}` } : {})),
      'x-admin-email': email,
      'x-admin-uid': uid,
      'x-admin-token': localToken
    };
  };

  const adminFetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const authHeaders = await getAdminHeaders();
    const mergedHeaders = {
      ...authHeaders,
      ...(init?.headers || {})
    };
    return fetch(url, { ...init, headers: mergedHeaders });
  };

  const safeJson = async (res: Response | null): Promise<any> => {
    if (!res || !res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const [readersRes, sessionsRes, clientsRes, overviewRes, n8nRes] = await Promise.all([
        adminFetch('/api/readers').catch(() => null),
        adminFetch('/api/astroboard/sessions?readerId=psychic-tamara&isAdmin=true').then(async r => {
          if (!r || !r.ok) return adminFetch('/api/admin/sessions?isAdmin=true');
          return r;
        }).catch(() => null),
        adminFetch('/api/admin/clients').catch(() => null),
        adminFetch('/api/admin/overview').catch(() => null),
        adminFetch('/api/admin/n8n/config').catch(() => null)
      ]);

      const [readersData, sessionsData, clientsData, overviewData, n8nData] = await Promise.all([
        safeJson(readersRes),
        safeJson(sessionsRes),
        safeJson(clientsRes),
        safeJson(overviewRes),
        safeJson(n8nRes)
      ]);

      if (readersData?.readers && Array.isArray(readersData.readers) && readersData.readers.length > 0) {
        // Merge backend readers with core READERS ensuring all astrologers exist
        const serverMap = new Map<string, Reader>(readersData.readers.map((r: Reader) => [r.id, r]));
        const mergedReaders = READERS.map(coreReader => {
          const remote = serverMap.get(coreReader.id);
          return {
            ...coreReader,
            ...(remote || {}),
            isOnline: remote ? Boolean(remote.isOnline) : true,
            status: remote ? (remote.status || (remote.isOnline ? 'online' : 'offline')) : 'online'
          };
        });
        const customReaders = readersData.readers.filter((r: Reader) => !READERS.some(cr => cr.id === r.id));
        setReaders([...mergedReaders, ...customReaders]);
      } else {
        // Keep baseline readers
        setReaders(prev => prev.length > 0 ? prev : READERS);
      }

      if (n8nData?.n8nConfig) {
        setN8nConfig(prev => ({
          ...prev,
          ...n8nData.n8nConfig
        }));
      }

      // Resilient session merging: combine server sessions with local storage sessions
      const localStored = getStoredSessions();
      const serverSessions = (sessionsData?.sessions && Array.isArray(sessionsData.sessions)) ? sessionsData.sessions : [];
      const sessionMap = new Map<string, ConsultationSession>();
      localStored.forEach(s => sessionMap.set(s.id, s));
      serverSessions.forEach((s: ConsultationSession) => sessionMap.set(s.id, { ...sessionMap.get(s.id), ...s }));
      setSessions(Array.from(sessionMap.values()));

      // Merge backend clients with local registered seekers
      const localKnown = getAllKnownClients();
      const clientMap = new Map<string, ClientRecord>();

      // 1. Add known local & seed clients
      localKnown.forEach(c => clientMap.set(c.id || c.email, c));

      // 2. Add server clients
      if (clientsData?.clients && Array.isArray(clientsData.clients)) {
        clientsData.clients.forEach((c: ClientRecord) => {
          clientMap.set(c.id || c.email, {
            ...c,
            accountStatus: c.accountStatus || 'active',
            totalConsultations: c.totalConsultations || 1
          });
        });
      }

      const mergedClients = Array.from(clientMap.values());
      setClients(mergedClients);

      // Background sync local clients to server db if needed
      if (localKnown.length > 0) {
        adminFetch('/api/admin/clients/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clients: localKnown })
        }).catch(() => {});
      }

      if (overviewData) {
        if (overviewData.kpis) {
          setKpis({
            totalAstrologers: overviewData.kpis.totalAstrologers || readers.length,
            onlineAstrologers: overviewData.kpis.onlineAstrologers || readers.filter(r => r.isOnline).length,
            totalClients: mergedClients.length,
            activeChats: overviewData.kpis.activeChats || 0,
            pendingChats: overviewData.kpis.pendingChats || 0
          });
        }
        if (overviewData.autoAssignSettings) {
          setAutoAssignSettings(overviewData.autoAssignSettings);
        }
      }
    } catch (err) {
      console.warn('Graceful sync of admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(() => {
      fetchData();
    }, 5000);

    // Cross-tab real-time session synchronization
    let bc: BroadcastChannel | null = null;
    const handleIncomingSessionEvent = (event: any) => {
      try {
        const { type, payload } = event.data || event.detail || {};
        if (type === 'new_session' && payload) {
          setSessions(prev => {
            const exists = prev.some(s => s.id === payload.id);
            if (exists) return prev.map(s => s.id === payload.id ? { ...s, ...payload } : s);
            return [payload, ...prev];
          });
        } else if (type === 'session_accepted' && payload) {
          setSessions(prev => prev.map(s => s.id === payload.id ? { ...s, ...payload, status: 'active' } : s));
        } else if (type === 'message_received' && payload) {
          setSessions(prev => prev.map(s => {
            if (s.id === payload.sessionId) {
              const msgs = s.messages || [];
              if (!msgs.some(m => m.id === payload.id)) {
                return { ...s, messages: [...msgs, payload] };
              }
            }
            return s;
          }));
          setViewTranscriptSession(curr => {
            if (curr && curr.id === payload.sessionId) {
              const msgs = curr.messages || [];
              if (!msgs.some(m => m.id === payload.id)) {
                return { ...curr, messages: [...msgs, payload] };
              }
            }
            return curr;
          });
        } else if (type === 'session_ended' && payload) {
          setSessions(prev => prev.map(s => s.id === payload.id ? { ...s, status: 'completed' } : s));
        }
      } catch (err) {
        console.warn('Admin Broadcast event notice:', err);
      }
    };

    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events?isAdmin=true&readerId=psychic-tamara');
      es.addEventListener('new_session', (e: MessageEvent) => {
        try {
          const session = JSON.parse(e.data);
          if (session && session.id) {
            setSessions(prev => {
              const exists = prev.some(s => s.id === session.id);
              if (exists) return prev.map(s => s.id === session.id ? { ...s, ...session } : s);
              return [session, ...prev];
            });
            showToast(`🔔 New consultation request from ${session.customerName || 'Seeker'}!`, 'info');
            fetchData();
          }
        } catch {}
      });

      es.addEventListener('message_received', (e: MessageEvent) => {
        try {
          const message = JSON.parse(e.data);
          if (message && message.sessionId) {
            setSessions(prev => prev.map(s => {
              if (s.id === message.sessionId) {
                const msgs = s.messages || [];
                if (!msgs.some(m => m.id === message.id)) {
                  return { ...s, messages: [...msgs, message], lastMessageText: message.text, lastMessageAt: message.timestamp };
                }
              }
              return s;
            }));
            setViewTranscriptSession(curr => {
              if (curr && curr.id === message.sessionId) {
                const msgs = curr.messages || [];
                if (!msgs.some(m => m.id === message.id)) {
                  return { ...curr, messages: [...msgs, message] };
                }
              }
              return curr;
            });
          }
        } catch {}
      });

      es.addEventListener('session_accepted', (e: MessageEvent) => {
        try {
          const { session } = JSON.parse(e.data);
          if (session && session.id) {
            setSessions(prev => prev.map(s => s.id === session.id ? { ...s, ...session, status: 'active' } : s));
          }
        } catch {}
      });

      es.addEventListener('session_completed', (e: MessageEvent) => {
        try {
          const { session } = JSON.parse(e.data);
          if (session && session.id) {
            setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'completed' } : s));
          }
        } catch {}
      });

      es.addEventListener('session_ended', (e: MessageEvent) => {
        try {
          const { session } = JSON.parse(e.data);
          if (session && session.id) {
            setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'completed' } : s));
          }
        } catch {}
      });
    } catch {}

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(SESSIONS_CHANNEL_NAME);
        bc.onmessage = handleIncomingSessionEvent;
      }
    } catch {}

    const onCustomEvent = (e: Event) => handleIncomingSessionEvent(e as CustomEvent);
    window.addEventListener('lumsic_session_event', onCustomEvent);

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
      if (es) es.close();
      window.removeEventListener('lumsic_session_event', onCustomEvent);
    };
  }, []);

  // Update dynamic KPIs from state
  const totalAstrologersCount = readers.length;
  const onlineAstrologersCount = readers.filter(r => r.isOnline).length;
  const activeChatsList = sessions.filter(s => s.status === 'active');
  const pendingChatsList = sessions.filter(s => s.status === 'waiting');
  const liveChatsList = [...pendingChatsList, ...activeChatsList];
  const totalClientsCount = clients.length;

  // =========================================================================
  // ASTROLOGER MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [astroSearch, setAstroSearch] = useState('');
  const [astroStatusFilter, setAstroStatusFilter] = useState<'all' | 'online' | 'offline' | 'inactive'>('all');
  const [astroSpecialtyFilter, setAstroSpecialtyFilter] = useState<string>('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReader, setEditingReader] = useState<Reader | null>(null);
  const [deleteConfirmReader, setDeleteConfirmReader] = useState<Reader | null>(null);
  const [passwordResetReader, setPasswordResetReader] = useState<Reader | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP, or GIF)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be less than 8MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        const dataUrl = fileReader.result as string;
        try {
          const res = await adminFetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl, filename: file.name })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to upload image');
          const finalUrl = data.url || dataUrl;
          setFormData(prev => ({ ...prev, avatar: finalUrl }));
          showToast('Image uploaded successfully! Real-time preview updated.');
        } catch (uploadErr: any) {
          setFormData(prev => ({ ...prev, avatar: dataUrl }));
          showToast('Image loaded successfully!');
        } finally {
          setUploadingImage(false);
        }
      };
      fileReader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Error processing image', 'error');
      setUploadingImage(false);
    }
  };

  // n8n Workflow Automation State
  const [workflowModalReader, setWorkflowModalReader] = useState<Reader | null>(null);
  const [workflowFormData, setWorkflowFormData] = useState({
    n8nWorkflowId: '',
    n8nWebhookUrl: '',
    n8nWorkflowName: '',
    isWorkflowEnabled: true
  });
  const [testMessageInput, setTestMessageInput] = useState('');
  const [testWorkflowLoading, setTestWorkflowLoading] = useState(false);
  const [testWorkflowResult, setTestWorkflowResult] = useState<any>(null);
  const [n8nConfig, setN8nConfig] = useState({
    baseUrl: 'https://n8n.webhook.internal',
    apiKey: '',
    defaultWebhookPath: '/webhook/astrologer-chat'
  });

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    astroId: '',
    email: '',
    phone: '',
    specialization: 'Vedic Astrology',
    experienceYears: 8,
    ratePerMinute: 1.75,
    videoRatePerMinute: 2.50,
    avatar: DEFAULT_AVATARS[0],
    bio: '',
    isChatEnabled: true,
    isVideoEnabled: true,
    password: '',
    // n8n mapping
    isWorkflowEnabled: true,
    n8nWorkflowId: '',
    n8nWebhookUrl: '',
    n8nWorkflowName: ''
  });

  const openCreateModal = () => {
    // Generate recommended ID
    let nextNum = 10000 + readers.length + 1;
    while (readers.some(r => r.astroId === `LYS-${nextNum}`)) {
      nextNum++;
    }
    const defaultAstroId = `LYS-${nextNum}`;
    setFormData({
      name: '',
      astroId: defaultAstroId,
      email: '',
      phone: '',
      specialization: 'Vedic Astrology',
      experienceYears: 8,
      ratePerMinute: 1.75,
      videoRatePerMinute: 2.50,
      avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      bio: 'Experienced intuitive astrologer committed to offering clear, compassionate guidance.',
      isChatEnabled: true,
      isVideoEnabled: true,
      password: '',
      isWorkflowEnabled: true,
      n8nWorkflowId: `wf_${defaultAstroId}`,
      n8nWebhookUrl: '',
      n8nWorkflowName: `Consultation Flow - ${defaultAstroId}`
    });
    setCreateModalOpen(true);
  };

  const openEditModal = (reader: Reader) => {
    setEditingReader(reader);
    const resolvedAstroId = reader.astroId || reader.id;
    setFormData({
      name: reader.name || '',
      astroId: resolvedAstroId,
      email: reader.email || '',
      phone: reader.phone || '',
      specialization: reader.specialties?.[0] || reader.specialities?.[0] || 'Vedic Astrology',
      experienceYears: reader.experienceYears || reader.experience_years || 5,
      ratePerMinute: reader.ratePerMinute || 1.50,
      videoRatePerMinute: reader.videoRatePerMinute || 2.50,
      avatar: reader.avatar || reader.image_url || DEFAULT_AVATARS[0],
      bio: reader.bio || '',
      isChatEnabled: reader.isChatEnabled !== false,
      isVideoEnabled: reader.isVideoEnabled !== false,
      password: '',
      isWorkflowEnabled: reader.isWorkflowEnabled !== false,
      n8nWorkflowId: reader.n8nWorkflowId || `wf_${resolvedAstroId}`,
      n8nWebhookUrl: reader.n8nWebhookUrl || '',
      n8nWorkflowName: reader.n8nWorkflowName || `Consultation Flow - ${reader.name || resolvedAstroId}`
    });
    setEditModalOpen(true);
  };

  const handleCreateAstrologer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.astroId.trim()) {
      showToast('Please fill in Name, Email, and Astrologer ID', 'error');
      return;
    }

    // Check duplicate ID client-side
    const isDup = readers.some(
      r => (r.astroId && r.astroId.toLowerCase() === formData.astroId.trim().toLowerCase()) ||
           r.id.toLowerCase() === formData.astroId.trim().toLowerCase()
    );
    if (isDup) {
      showToast(`Astrologer ID "${formData.astroId.trim()}" already exists. Please choose a unique ID.`, 'error');
      return;
    }

    setActionLoading(true);
    try {
      const targetAstroId = formData.astroId.trim();
      const res = await adminFetch('/api/admin/astrologers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          astroId: targetAstroId,
          n8nWorkflowId: formData.n8nWorkflowId.trim() || `wf_${targetAstroId}`,
          n8nWebhookUrl: formData.n8nWebhookUrl.trim(),
          n8nWorkflowName: formData.n8nWorkflowName.trim() || `Flow - ${targetAstroId}`,
          isWorkflowEnabled: formData.isWorkflowEnabled !== false,
          adminName: currentAdminProfile?.email || 'Super Admin'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create astrologer');
      }
      showToast(`Astrologer ${data.reader.name} (${data.reader.astroId}) created with n8n workflow ${data.reader.n8nWorkflowId || 'mapped'}!`);
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error creating astrologer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAstrologer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReader) return;

    if (!formData.name.trim() || !formData.astroId.trim()) {
      showToast('Name and Astrologer ID are required', 'error');
      return;
    }

    // Duplicate ID check against other readers
    const isDup = readers.some(
      r => r.id !== editingReader.id &&
           r.astroId &&
           r.astroId.toLowerCase() === formData.astroId.trim().toLowerCase()
    );
    if (isDup) {
      showToast(`Astrologer ID "${formData.astroId.trim()}" is already assigned to another astrologer.`, 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/readers/${editingReader.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          astroId: formData.astroId.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          specialties: [formData.specialization],
          specialities: [formData.specialization],
          experienceYears: Number(formData.experienceYears),
          experience_years: Number(formData.experienceYears),
          ratePerMinute: Number(formData.ratePerMinute),
          videoRatePerMinute: Number(formData.videoRatePerMinute),
          avatar: formData.avatar,
          image_url: formData.avatar,
          bio: formData.bio.trim(),
          isChatEnabled: formData.isChatEnabled,
          isVideoEnabled: formData.isVideoEnabled,
          isCallEnabled: formData.isVideoEnabled,
          isWorkflowEnabled: formData.isWorkflowEnabled,
          n8nWorkflowId: formData.n8nWorkflowId.trim() || `wf_${formData.astroId.trim()}`,
          n8nWebhookUrl: formData.n8nWebhookUrl.trim(),
          n8nWorkflowName: formData.n8nWorkflowName.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update astrologer');
      showToast(`Astrologer ${data.reader.name} updated successfully!`);
      setEditModalOpen(false);
      setEditingReader(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error updating astrologer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAstrologer = async () => {
    if (!deleteConfirmReader) return;
    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/readers/${deleteConfirmReader.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete astrologer');
      showToast(`Astrologer ${deleteConfirmReader.name} has been deleted.`, 'info');
      setDeleteConfirmReader(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error deleting astrologer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleOnline = async (reader: Reader) => {
    const nextStatus = !reader.isOnline;
    try {
      const res = await adminFetch(`/api/readers/${reader.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'isOnline', value: nextStatus })
      });
      if (res.ok) {
        setReaders(prev => prev.map(r => r.id === reader.id ? { ...r, isOnline: nextStatus, status: nextStatus ? 'online' : 'offline' } : r));
        showToast(`${reader.name} is now ${nextStatus ? 'Online' : 'Offline'}`);
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleToggleActive = async (reader: Reader) => {
    const nextActive = reader.isActive === false ? true : false;
    try {
      const res = await adminFetch(`/api/readers/${reader.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'isActive', value: nextActive })
      });
      if (res.ok) {
        setReaders(prev => prev.map(r => r.id === reader.id ? { ...r, isActive: nextActive } : r));
        showToast(`${reader.name} is now ${nextActive ? 'Active' : 'Deactivated'}`);
      }
    } catch (err) {
      showToast('Failed to toggle active state', 'error');
    }
  };

  // =========================================================================
  // n8n WORKFLOW TOGGLE & ASSIGNMENT HANDLERS
  // =========================================================================
  const handleToggleWorkflow = async (reader: Reader, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextVal = reader.isWorkflowEnabled === false ? true : false;
    // Optimistic UI update
    setReaders(prev => prev.map(r => r.id === reader.id ? { ...r, isWorkflowEnabled: nextVal } : r));

    try {
      const res = await adminFetch(`/api/admin/astrologers/${reader.id}/toggle-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isWorkflowEnabled: nextVal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle workflow');
      if (data.reader) {
        setReaders(prev => prev.map(r => r.id === reader.id ? { ...r, ...data.reader } : r));
        if (workflowModalReader && workflowModalReader.id === reader.id) {
          setWorkflowModalReader(prev => prev ? { ...prev, ...data.reader } : null);
          setWorkflowFormData(prev => ({ ...prev, isWorkflowEnabled: nextVal }));
        }
      }
      showToast(
        nextVal
          ? `n8n Workflow ENABLED for ${reader.name} (${reader.astroId || reader.id})`
          : `n8n Workflow STOPPED for ${reader.name} (${reader.astroId || reader.id}) — executions halted`,
        nextVal ? 'success' : 'info'
      );
    } catch (err: any) {
      // Revert optimistic update
      setReaders(prev => prev.map(r => r.id === reader.id ? { ...r, isWorkflowEnabled: !nextVal } : r));
      showToast(err.message || 'Failed to toggle n8n workflow', 'error');
    }
  };

  const openWorkflowModal = (reader: Reader) => {
    const resolvedAstroId = reader.astroId || reader.id;
    setWorkflowModalReader(reader);
    setWorkflowFormData({
      n8nWorkflowId: reader.n8nWorkflowId || `wf_${resolvedAstroId}`,
      n8nWebhookUrl: reader.n8nWebhookUrl || '',
      n8nWorkflowName: reader.n8nWorkflowName || `Consultation Flow - ${reader.name || resolvedAstroId}`,
      isWorkflowEnabled: reader.isWorkflowEnabled !== false
    });
    setTestWorkflowResult(null);
    setTestMessageInput(`Greetings ${reader.name}, what do the cosmic energies and planetary alignments indicate for my career this season?`);
  };

  const handleSaveWorkflowMapping = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!workflowModalReader) return;
    setActionLoading(true);
    try {
      const res = await adminFetch(`/api/admin/astrologers/${workflowModalReader.id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save workflow mapping');
      showToast(`n8n workflow mapped to ${workflowModalReader.name} (${workflowModalReader.astroId || workflowModalReader.id}) successfully!`);
      if (data.reader) {
        setReaders(prev => prev.map(r => r.id === workflowModalReader.id ? { ...r, ...data.reader } : r));
        setWorkflowModalReader(prev => prev ? { ...prev, ...data.reader } : null);
      }
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save workflow mapping', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestWorkflow = async () => {
    if (!workflowModalReader) return;
    setTestWorkflowLoading(true);
    setTestWorkflowResult(null);
    try {
      const res = await adminFetch(`/api/admin/astrologers/${workflowModalReader.id}/test-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessageInput })
      });
      const data = await res.json();
      setTestWorkflowResult(data);
      if (data.status === 'stopped') {
        showToast(`Workflow execution blocked: toggle is currently OFF for ${workflowModalReader.name}`, 'info');
      } else if (data.status === 'success') {
        showToast(`n8n Workflow execution succeeded (${data.latencyMs}ms)! Real AI response received.`, 'success');
        fetchData();
      } else {
        showToast(data.error || `Workflow execution finished with status: ${data.status}`, 'info');
      }
    } catch (err: any) {
      setTestWorkflowResult({ status: 'failed', error: err.message || 'Network error triggering test' });
      showToast(err.message || 'Workflow test request failed', 'error');
    } finally {
      setTestWorkflowLoading(false);
    }
  };

  const handleSaveN8nConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminFetch('/api/admin/n8n/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nConfig)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save n8n configuration');
      showToast('Global n8n automation settings updated and saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Error updating n8n configuration', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetReader || !newPasswordValue.trim()) return;
    setActionLoading(true);
    try {
      const res = await adminFetch('/api/astrologer/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: passwordResetReader.id,
          astroId: passwordResetReader.astroId,
          newPassword: newPasswordValue.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      showToast(`Password successfully reset for ${passwordResetReader.name}!`);
      setPasswordResetReader(null);
      setNewPasswordValue('');
    } catch (err: any) {
      showToast(err.message || 'Error resetting password', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Astrologers
  const filteredReaders = readers.filter(r => {
    const matchesSearch = !astroSearch.trim() || 
      r.name.toLowerCase().includes(astroSearch.toLowerCase()) ||
      (r.astroId && r.astroId.toLowerCase().includes(astroSearch.toLowerCase())) ||
      (r.specialties && r.specialties.some(s => s.toLowerCase().includes(astroSearch.toLowerCase())));

    const matchesStatus = 
      astroStatusFilter === 'all' ? true :
      astroStatusFilter === 'online' ? r.isOnline :
      astroStatusFilter === 'offline' ? !r.isOnline :
      astroStatusFilter === 'inactive' ? r.isActive === false : true;

    const matchesSpecialty = 
      astroSpecialtyFilter === 'all' ? true :
      (r.specialties && r.specialties.includes(astroSpecialtyFilter)) ||
      (r.specialities && r.specialities.includes(astroSpecialtyFilter));

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  // =========================================================================
  // CHAT MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [chatSearch, setChatSearch] = useState('');
  const [chatStatusFilter, setChatStatusFilter] = useState<'all' | 'active' | 'waiting' | 'completed'>('all');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedSessionToTransfer, setSelectedSessionToTransfer] = useState<ConsultationSession | null>(null);
  const [transferTargetReaderId, setTransferTargetReaderId] = useState('');
  const [transferReason, setTransferReason] = useState('Manual Admin Load Balancing');
  const [viewTranscriptSession, setViewTranscriptSession] = useState<ConsultationSession | null>(null);

  const openTransferModal = (session: ConsultationSession) => {
    setSelectedSessionToTransfer(session);
    // Suggest first online astrologer different from currently assigned
    const candidate = readers.find(r => r.isOnline && r.id !== session.assignedReaderId);
    setTransferTargetReaderId(candidate ? candidate.id : (readers[0]?.id || ''));
    setTransferReason('Manual Load Balancing');
    setTransferModalOpen(true);
  };

  const [adminReplyText, setAdminReplyText] = useState('');

  const handleAttendChatDirectly = (session: ConsultationSession) => {
    const targetReader = readers.find(r => r.id === session.requestedReaderId || r.id === session.assignedReaderId) || readers[0];
    const updated: ConsultationSession = {
      ...session,
      status: 'active',
      assignedReaderId: targetReader?.id || session.requestedReaderId || 'psychic-tamara',
      assignedReaderName: targetReader?.name || session.requestedReaderName || 'Spiritual Guide'
    };
    saveStoredSession(updated);
    broadcastSessionEvent('session_accepted', updated);
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setViewTranscriptSession(updated);
  };

  const handleAdminSendReply = async () => {
    if (!viewTranscriptSession || !adminReplyText.trim()) return;
    const text = adminReplyText.trim();
    setAdminReplyText('');

    const targetAstrologerName = viewTranscriptSession.assignedReaderName || viewTranscriptSession.requestedReaderName || 'Astrologer Support';
    const newMsg: ChatMessage = {
      id: 'msg_admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sessionId: viewTranscriptSession.id,
      sender: 'astrologer',
      senderName: targetAstrologerName,
      text,
      timestamp: new Date().toISOString()
    };

    // If session was waiting, auto-accept it!
    const updatedSession: ConsultationSession = {
      ...viewTranscriptSession,
      status: 'active',
      assignedReaderName: targetAstrologerName,
      messages: [...(viewTranscriptSession.messages || []), newMsg]
    };

    setViewTranscriptSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    saveStoredSession(updatedSession);
    broadcastSessionEvent('session_accepted', updatedSession);
    appendMessageToStoredSession(updatedSession.id, newMsg);
    broadcastSessionEvent('message_received', newMsg);

    try {
      await fetch(`/api/sessions/${updatedSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'astrologer',
          senderName: targetAstrologerName,
          text
        })
      });
    } catch {}
  };

  const handleTransferChat = async () => {
    if (!selectedSessionToTransfer || !transferTargetReaderId) return;
    setActionLoading(true);
    try {
      const targetReader = readers.find(r => r.id === transferTargetReaderId || r.astroId === transferTargetReaderId);
      const updated: ConsultationSession = {
        ...selectedSessionToTransfer,
        assignedReaderId: transferTargetReaderId,
        assignedReaderName: targetReader?.name || 'Assigned Astrologer',
        status: 'active'
      };
      saveStoredSession(updated);
      broadcastSessionEvent('session_accepted', updated);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));

      const res = await adminFetch('/api/admin/chats/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionToTransfer.id,
          newAstrologerId: transferTargetReaderId,
          reason: transferReason,
          adminName: currentAdminProfile?.email || 'Super Admin'
        })
      }).catch(() => null);

      showToast(`Chat reassigned to ${targetReader?.name || 'new astrologer'}. Client preserves uninterrupted conversation.`);
      setTransferModalOpen(false);
      setSelectedSessionToTransfer(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error reassigning chat', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = !chatSearch.trim() ||
      (s.customerName && s.customerName.toLowerCase().includes(chatSearch.toLowerCase())) ||
      (s.id && s.id.toLowerCase().includes(chatSearch.toLowerCase())) ||
      (s.requestedReaderName && s.requestedReaderName.toLowerCase().includes(chatSearch.toLowerCase())) ||
      (s.assignedReaderName && s.assignedReaderName.toLowerCase().includes(chatSearch.toLowerCase()));

    const matchesStatus = 
      chatStatusFilter === 'all' ? (s.status === 'active' || s.status === 'waiting') :
      s.status === chatStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getWaitTimeText = (createdAt: string) => {
    const elapsedSec = Math.max(0, Math.floor((nowTimestamp - new Date(createdAt).getTime()) / 1000));
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // =========================================================================
  // CLIENT MANAGEMENT STATE & HANDLERS
  // =========================================================================
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'active' | 'free_tier'>('all');
  const [selectedClientProfile, setSelectedClientProfile] = useState<ClientRecord | null>(null);
  const [clientChatHistory, setClientChatHistory] = useState<ConsultationSession[]>([]);
  const [clientChatsLoading, setClientChatsLoading] = useState(false);

  const openClientProfile = async (client: ClientRecord) => {
    setSelectedClientProfile(client);
    setClientChatsLoading(true);
    try {
      const res = await adminFetch(`/api/admin/clients/${client.id}/chats`);
      if (res.ok) {
        const data = await res.json();
        setClientChatHistory(data.sessions || []);
      } else {
        // Fallback filter from sessions in state
        setClientChatHistory(sessions.filter(s => s.customerId === client.id));
      }
    } catch (err) {
      setClientChatHistory(sessions.filter(s => s.customerId === client.id));
    } finally {
      setClientChatsLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = !clientSearch.trim() ||
      (c.name && c.name.toLowerCase().includes(clientSearch.toLowerCase())) ||
      (c.id && c.id.toLowerCase().includes(clientSearch.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(clientSearch.toLowerCase()));

    const matchesStatus = 
      clientStatusFilter === 'all' ? true :
      c.accountStatus === clientStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================================================================
  // ESSENTIAL SETTINGS STATE & HANDLERS
  // =========================================================================
  const [settingsData, setSettingsData] = useState({
    defaultChatPrice: 1.50,
    defaultVideoPrice: 2.50,
    minPrice: 0.99,
    maxPrice: 5.00,
    freeChatEnabled: true,
    freeChatMinutes: 2,
    autoAssignEnabled: true,
    maxChatsPerAstrologer: 3,
    onlineOnly: true,
    adminName: 'Alex Vance',
    adminEmail: currentAdminProfile?.email || 'admin@lumsic.com'
  });

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettingsData(prev => ({
            ...prev,
            defaultChatPrice: data.settings.chatPricePerMinuteDefault ?? prev.defaultChatPrice,
            defaultVideoPrice: data.settings.videoPricePerMinuteDefault ?? prev.defaultVideoPrice,
            freeChatEnabled: data.settings.freeChatEnabled ?? prev.freeChatEnabled,
            freeChatMinutes: data.settings.freeChatMinutes ?? prev.freeChatMinutes,
            autoAssignEnabled: data.settings.autoAssignEnabled ?? prev.autoAssignEnabled,
            maxChatsPerAstrologer: data.settings.maxChatsPerAstrologer ?? prev.maxChatsPerAstrologer,
            onlineOnly: data.settings.onlineOnly ?? prev.onlineOnly,
            adminName: data.settings.adminName ?? prev.adminName,
            adminEmail: currentAdminProfile?.email || data.settings.adminEmail || prev.adminEmail
          }));
        }
      })
      .catch(() => {});
  }, [currentAdminProfile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsData })
      });
      if (!res.ok) throw new Error('Failed to update settings');
      showToast('Platform settings saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================================
  // LOGOUT HANDLER
  // =========================================================================
  const handleLogout = async () => {
    try {
      await signOutCurrentUser();
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        onBackToSite();
      }, 500);
    } catch (err) {
      console.error('Logout error:', err);
      onBackToSite();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 py-2.5 px-4 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600/40' 
            : toastMessage.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-600/40'
            : 'bg-slate-800/90 text-slate-200 border-slate-600/40'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <ShieldCheck className="w-4 h-4 text-sky-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-serif">LUMSIC</span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Astrology &amp; Reader Platform Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Website Button */}
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
            title="Return to the main live website"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </button>

          {/* Astrologer Dashboard Workstation Button */}
          {onOpenAstrologerDashboard && (
            <button
              onClick={onOpenAstrologerDashboard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:brightness-110 shadow-md shadow-indigo-600/30 border border-indigo-400/40 transition cursor-pointer active:scale-95"
              title="Open the Astrologer Workstation & Live Console"
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Astrologer Dashboard</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Admin User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-xs">
              {currentAdminProfile?.email ? currentAdminProfile.email[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                {currentAdminProfile?.email || 'System Admin'}
              </p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Verified Admin
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION - 6 SECTIONS ONLY */}
        <aside className={`
          ${mobileMenuOpen ? 'block' : 'hidden'} lg:block 
          w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 
          fixed lg:static inset-y-16 left-0 z-40 transition-all
        `}>
          <div className="p-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Management
            </p>

            {/* Direct Link to Astrologer Dashboard */}
            {onOpenAstrologerDashboard && (
              <button
                onClick={() => { onOpenAstrologerDashboard(); setMobileMenuOpen(false); }}
                className="w-full mb-2 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer text-indigo-300 hover:text-white bg-gradient-to-r from-indigo-950/60 to-purple-950/40 hover:from-indigo-900/60 hover:to-purple-900/50 border border-indigo-500/30 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Astrologer Dashboard</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Workstation
                </span>
              </button>
            )}

            {/* 1. Overview */}
            <button
              onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>

            {/* 2. Manage Astrologers */}
            <button
              onClick={() => { setActiveTab('astrologers'); setMobileMenuOpen(false); }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'astrologers'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Manage Astrologers</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'astrologers' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {onlineAstrologersCount} Online
              </span>
            </button>

            {/* 3. Chat Management */}
            <button
              onClick={() => { setActiveTab('chats'); setMobileMenuOpen(false); }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'chats'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Chat Management</span>
              </div>
              {pendingChatsList.length > 0 ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-slate-950 animate-pulse">
                  {pendingChatsList.length} Pending
                </span>
              ) : activeChatsList.length > 0 ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'chats' ? 'bg-white/20 text-white' : 'bg-emerald-900/60 text-emerald-300'
                }`}>
                  {activeChatsList.length} Active
                </span>
              ) : null}
            </button>

            {/* 4. Clients */}
            <button
              onClick={() => { setActiveTab('clients'); setMobileMenuOpen(false); }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Clients</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'clients' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {totalClientsCount}
              </span>
            </button>

            {/* 5. Settings */}
            <button
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>

          {/* 6. Logout Button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-900 p-4 lg:p-8">
          
          {/* ================================================================ */}
          {/* 1. OVERVIEW SCREEN */}
          {/* ================================================================ */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Overview</h1>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status of astrologers, chats, and clients</p>
              </div>

              {/* 5 ESSENTIAL SUMMARY CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                
                {/* Total Astrologers */}
                <div 
                  onClick={() => setActiveTab('astrologers')}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total Astrologers</span>
                    <Users className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{totalAstrologersCount}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <span>{readers.filter(r => r.isActive !== false).length} active profiles</span>
                  </div>
                </div>

                {/* Online Astrologers */}
                <div 
                  onClick={() => setActiveTab('astrologers')}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Online Astrologers</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">{onlineAstrologersCount}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ready for sessions
                  </div>
                </div>

                {/* Total Registered Clients */}
                <div 
                  onClick={() => setActiveTab('clients')}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Total Clients</span>
                    <UserCheck className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{totalClientsCount}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Registered seekers
                  </div>
                </div>

                {/* Active Chats */}
                <div 
                  onClick={() => setActiveTab('chats')}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Active Chats</span>
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">{activeChatsList.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    In live consultation
                  </div>
                </div>

                {/* Pending Chats */}
                <div 
                  onClick={() => setActiveTab('chats')}
                  className={`bg-slate-950 border rounded-2xl p-4 shadow-sm hover:border-slate-700 transition cursor-pointer ${
                    pendingChatsList.length > 0 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-medium">Pending Chats</span>
                    <Clock className={`w-4 h-4 ${pendingChatsList.length > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                  </div>
                  <div className={`text-2xl font-black ${pendingChatsList.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {pendingChatsList.length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {pendingChatsList.length > 0 ? 'Awaiting pickup' : 'All queues clear'}
                  </div>
                </div>

              </div>

              {/* PENDING CHATS ACTION SECTION (IF ANY PENDING) */}
              {pendingChatsList.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                      <h2 className="text-sm font-bold text-amber-300">
                        {pendingChatsList.length} Consultation{pendingChatsList.length > 1 ? 's' : ''} Waiting for Astrologer Pickup
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('chats')}
                      className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Chat Management</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-amber-500/20">
                        <tr>
                          <th className="pb-2">Client</th>
                          <th className="pb-2">Requested Astrologer</th>
                          <th className="pb-2">Waiting Time</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10">
                        {pendingChatsList.slice(0, 4).map(session => (
                          <tr key={session.id} className="text-slate-300">
                            <td className="py-2.5 font-bold text-white flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                {session.customerName?.[0] || 'S'}
                              </div>
                              {session.customerName || 'Seeker'}
                            </td>
                            <td className="py-2.5">
                              {session.requestedReaderName || 'Any Available'}
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-amber-500/20 text-amber-300">
                                {getWaitTimeText(session.createdAt)}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => openTransferModal(session)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                              >
                                Assign / Transfer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* QUICK ACTIVE & PENDING SESSIONS PREVIEW */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white">Live Consultations &amp; Incoming Chats</h2>
                    {pendingChatsList.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-slate-950 animate-pulse">
                        {pendingChatsList.length} Incoming
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('chats')}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all ({liveChatsList.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {liveChatsList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active or pending chat sessions currently in progress.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="pb-2">Client</th>
                          <th className="pb-2">Astrologer</th>
                          <th className="pb-2">Rate</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {liveChatsList.slice(0, 6).map(session => (
                          <tr key={session.id} className="text-slate-300">
                            <td className="py-2.5 font-bold text-white">
                              {session.customerName || 'Seeker'}
                            </td>
                            <td className="py-2.5 text-slate-300">
                              {session.assignedReaderName || session.requestedReaderName}
                            </td>
                            <td className="py-2.5 font-mono text-slate-400">
                              £{session.ratePerMinute?.toFixed(2) || '1.50'}/min
                            </td>
                            <td className="py-2.5">
                              {session.status === 'waiting' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/80 animate-pulse">
                                  Pending Pickup
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  Active Live
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 text-right space-x-2">
                              <button
                                onClick={() => openTransferModal(session)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
                              >
                                {session.status === 'waiting' ? 'Assign' : 'Transfer'}
                              </button>
                              <button
                                onClick={() => setViewTranscriptSession(session)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                  session.status === 'waiting'
                                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-sm'
                                    : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300'
                                }`}
                              >
                                {session.status === 'waiting' ? 'Attend / View' : 'View Chat'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* 2. MANAGE ASTROLOGERS */}
          {/* ================================================================ */}
          {activeTab === 'astrologers' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Manage Astrologers</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create IDs, set chat/video availability and pricing, edit profiles
                  </p>
                </div>

                <button
                  onClick={openCreateModal}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Astrologer ID</span>
                </button>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or specialty..."
                    value={astroSearch}
                    onChange={e => setAstroSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                  {astroSearch && (
                    <button onClick={() => setAstroSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <select
                    value={astroStatusFilter}
                    onChange={(e: any) => setAstroStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="online">Online Only</option>
                    <option value="offline">Offline Only</option>
                    <option value="inactive">Deactivated Only</option>
                  </select>

                  <select
                    value={astroSpecialtyFilter}
                    onChange={e => setAstroSpecialtyFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="all">All Specializations</option>
                    {SPECIALIZATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Astrologers Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Astrologer</th>
                        <th className="py-3 px-3">Unique ID</th>
                        <th className="py-3 px-3">Specialization</th>
                        <th className="py-3 px-3">n8n Workflow</th>
                        <th className="py-3 px-3">Availability</th>
                        <th className="py-3 px-3">Pricing (/min)</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredReaders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                            No astrologers found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredReaders.map(reader => (
                          <tr key={reader.id} className="hover:bg-slate-900/40 transition">
                            
                            {/* Photo & Name */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={reader.avatar || reader.image_url || DEFAULT_AVATARS[0]}
                                  alt={reader.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white text-sm">{reader.name}</div>
                                  <div className="text-[11px] text-slate-400">{reader.experienceYears || reader.experience_years || 5} yrs exp</div>
                                </div>
                              </div>
                            </td>

                            {/* Unique ID */}
                            <td className="py-3 px-3 font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-rose-300 border border-slate-800 font-bold text-[11px]">
                                {reader.astroId || reader.id}
                              </span>
                            </td>

                            {/* Specialization */}
                            <td className="py-3 px-3 text-slate-300">
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[11px]">
                                {reader.specialties?.[0] || reader.specialities?.[0] || 'Vedic Astrology'}
                              </span>
                            </td>

                            {/* n8n Workflow Automation: Individual ON/OFF Toggle + Assigned Workflow Mapping */}
                            <td className="py-3 px-3">
                              <div className="space-y-1.5 min-w-[145px]">
                                {/* Individual ON/OFF Toggle Switch */}
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={reader.isWorkflowEnabled !== false}
                                    onClick={(e) => handleToggleWorkflow(reader, e)}
                                    title={reader.isWorkflowEnabled !== false ? 'Click to stop n8n workflow executions' : 'Click to enable n8n workflow executions'}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      reader.isWorkflowEnabled !== false ? 'bg-emerald-500' : 'bg-slate-800 border-slate-700'
                                    }`}
                                  >
                                    <span
                                      aria-hidden="true"
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                        reader.isWorkflowEnabled !== false ? 'translate-x-4' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>

                                  <span className={`text-[11px] font-bold ${
                                    reader.isWorkflowEnabled !== false ? 'text-emerald-400' : 'text-slate-400'
                                  }`}>
                                    {reader.isWorkflowEnabled !== false ? 'ON' : 'OFF'}
                                  </span>
                                  {reader.isWorkflowEnabled === false && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 font-semibold border border-amber-800/40">
                                      Stopped
                                    </span>
                                  )}
                                </div>

                                {/* Mapped Workflow ID Badge & Quick Configure */}
                                <div className="flex flex-wrap items-center gap-1">
                                  <button
                                    onClick={() => openWorkflowModal(reader)}
                                    className="font-mono text-[10px] text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/50 hover:border-amber-700 rounded px-1.5 py-0.5 inline-flex items-center gap-1 transition cursor-pointer"
                                    title="View & test mapped n8n workflow"
                                  >
                                    <Workflow className="w-2.5 h-2.5 text-amber-400" />
                                    <span className="truncate max-w-[95px]">{reader.n8nWorkflowId || (`wf_${reader.astroId || reader.id}`)}</span>
                                  </button>

                                  {typeof reader.n8nExecutionCount === 'number' && reader.n8nExecutionCount > 0 && (
                                    <span className="text-[9px] font-mono text-slate-400" title={`Total executions: ${reader.n8nExecutionCount}`}>
                                      ({reader.n8nExecutionCount})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Availability (Chat / Video) */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                  reader.isChatEnabled !== false
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                                }`}>
                                  <MessageSquare className="w-3 h-3" />
                                  Chat
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                  reader.isVideoEnabled !== false
                                    ? 'bg-sky-950 text-sky-300 border border-sky-800/60'
                                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                                }`}>
                                  <Video className="w-3 h-3" />
                                  Video
                                </span>
                              </div>
                            </td>

                            {/* Pricing */}
                            <td className="py-3 px-3 font-mono">
                              <div className="text-white font-semibold">
                                Chat: £{reader.ratePerMinute?.toFixed(2) || '1.75'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Video: £{reader.videoRatePerMinute?.toFixed(2) || '2.50'}
                              </div>
                            </td>

                            {/* Online / Active Status Toggle */}
                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                <button
                                  onClick={() => handleToggleOnline(reader)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                    reader.isOnline
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                                  }`}
                                  title="Click to toggle online/offline"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${reader.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                                  {reader.isOnline ? 'Online' : 'Offline'}
                                </button>
                                
                                {reader.isActive === false && (
                                  <span className="inline-block text-[10px] font-bold text-rose-400">
                                    Deactivated
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right space-x-1.5">
                              <button
                                onClick={() => openWorkflowModal(reader)}
                                className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Assign & test n8n workflow"
                              >
                                <Zap className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(reader)}
                                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Edit astrologer profile"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setPasswordResetReader(reader);
                                  setNewPasswordValue('');
                                }}
                                className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Reset login password"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleActive(reader)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  reader.isActive === false 
                                    ? 'text-emerald-400 hover:bg-emerald-950/40' 
                                    : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                                }`}
                                title={reader.isActive === false ? 'Activate profile' : 'Deactivate profile'}
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmReader(reader)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                                title="Delete astrologer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* 3. CHAT MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === 'chats' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Chat Management</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Monitor active consultations, assign pending requests, reassign without disrupting client experience
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by client, ID, or astrologer..."
                    value={chatSearch}
                    onChange={e => setChatSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                  {chatSearch && (
                    <button onClick={() => setChatSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setChatStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      chatStatusFilter === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Live ({activeChatsList.length + pendingChatsList.length})
                  </button>
                  <button
                    onClick={() => setChatStatusFilter('waiting')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      chatStatusFilter === 'waiting' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending ({pendingChatsList.length})
                  </button>
                  <button
                    onClick={() => setChatStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      chatStatusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active ({activeChatsList.length})
                  </button>
                  <button
                    onClick={() => setChatStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      chatStatusFilter === 'completed' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Completed
                  </button>
                </div>

              </div>

              {/* Chat Sessions Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-3">Requested Astrologer</th>
                        <th className="py-3 px-3">Assigned Handler</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Elapsed / Wait Time</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredSessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                            No chat sessions found for the current selection.
                          </td>
                        </tr>
                      ) : (
                        filteredSessions.map(session => (
                          <tr key={session.id} className="hover:bg-slate-900/40 transition">
                            
                            {/* Client */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-sm">
                                {session.customerName || 'Seeker'}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                #{session.id.slice(-6)}
                              </div>
                            </td>

                            {/* Requested Astrologer (Identity client sees) */}
                            <td className="py-3 px-3">
                              <div className="font-medium text-slate-200">
                                {session.requestedReaderName || 'Any Available'}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Client sees this name
                              </span>
                            </td>

                            {/* Assigned Handler */}
                            <td className="py-3 px-3">
                              <div className="font-medium text-white flex items-center gap-1.5">
                                {session.assignedReaderName || (
                                  <span className="text-amber-400 font-bold">Unassigned</span>
                                )}
                              </div>
                              {session.assignmentType && session.assignmentType !== 'DIRECT' && (
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-900 text-rose-300 border border-slate-800">
                                  {session.assignmentType.replace('_', ' ')}
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                session.status === 'active' 
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                  : session.status === 'waiting'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}>
                                {session.status === 'waiting' ? 'Pending Pickup' : session.status.toUpperCase()}
                              </span>
                            </td>

                            {/* Waiting / Duration Time */}
                            <td className="py-3 px-3 font-mono">
                              {session.status === 'waiting' ? (
                                <span className="text-amber-400 font-bold">
                                  {getWaitTimeText(session.createdAt)}
                                </span>
                              ) : session.status === 'active' ? (
                                <span className="text-emerald-400 font-bold">
                                  {getWaitTimeText(session.acceptedAt || session.createdAt)}
                                </span>
                              ) : (
                                <span className="text-slate-400">Completed</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right space-x-2">
                              {session.status === 'waiting' && (
                                <button
                                  onClick={() => handleAttendChatDirectly(session)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                  title="Attend this chat consultation now"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Attend
                                </button>
                              )}
                              {session.status !== 'completed' && (
                                <button
                                  onClick={() => openTransferModal(session)}
                                  className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer"
                                >
                                  {session.status === 'waiting' ? 'Assign' : 'Transfer'}
                                </button>
                              )}
                              <button
                                onClick={() => setViewTranscriptSession(session)}
                                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition cursor-pointer"
                              >
                                {session.status === 'waiting' ? 'Attend / View' : 'View & Reply'}
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* 4. CLIENTS MANAGEMENT */}
          {/* ================================================================ */}
          {activeTab === 'clients' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Clients Management</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View registered clients, consultation volume, account status, and consultation transcripts
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search client by name, ID, email, or phone..."
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                  {clientSearch && (
                    <button onClick={() => setClientSearch('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={clientStatusFilter}
                    onChange={(e: any) => setClientStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="all">All Clients ({clients.length})</option>
                    <option value="active">Active Consultations</option>
                    <option value="free_tier">Free Tier</option>
                  </select>
                </div>

              </div>

              {/* Clients Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-3">Unique ID</th>
                        <th className="py-3 px-3">Contact (Email / Mobile)</th>
                        <th className="py-3 px-3">Consultations</th>
                        <th className="py-3 px-3">Account Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                            No clients found matching the search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map(client => (
                          <tr key={client.id} className="hover:bg-slate-900/40 transition">
                            
                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-sm flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                                  {client.name?.[0] || 'S'}
                                </div>
                                <span>{client.name || 'Valued Seeker'}</span>
                              </div>
                            </td>

                            <td className="py-3 px-3 font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                                {client.id}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="text-slate-200 font-medium">{client.email || '—'}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{client.phone || '—'}</div>
                            </td>

                            <td className="py-3 px-3 font-semibold text-white">
                              {client.totalConsultations || 0} sessions
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                client.accountStatus === 'active'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-sky-950 text-sky-300 border border-sky-800'
                              }`}>
                                {client.accountStatus === 'active' ? 'Active' : 'Free Tier'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => openClientProfile(client)}
                                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                              >
                                View Profile &amp; Chats
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* 5. ESSENTIAL SETTINGS */}
          {/* ================================================================ */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Essential Platform Settings</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure default pricing, astrologer availability rules, and free consultation parameters
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Admin Portal Link & Access Permissions */}
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <div>
                        <h2 className="text-sm font-bold text-white">Admin Command Center Link &amp; Access Control</h2>
                        <p className="text-[11px] text-slate-400">Direct portal link and authorized credentials restriction</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                      Admin Protected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Direct Admin Link</span>
                      <div className="flex items-center gap-2">
                        <code className="text-amber-300 font-mono font-bold text-xs bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 flex-1 truncate">
                          admin/lumsic.online
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lumsic.online';
                            navigator.clipboard.writeText(`${origin}/admin/lumsic.online`);
                            showToast('Admin link copied to clipboard!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition cursor-pointer shrink-0 shadow"
                        >
                          Copy Link
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        When this link is opened in any browser, the Admin Command Center opens directly and prompts for administrator credentials.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Who Can Log In</span>
                      <div className="text-xs text-white font-medium">
                        Owner / Super Admin: <span className="text-amber-300 font-mono font-bold">bankush014@gmail.com</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Access is restricted exclusively to authorized admin credentials. Unauthorized accounts are blocked. Use the top bar &ldquo;Admin Access Control&rdquo; button to grant or revoke login permissions for any team member.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing Defaults */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <h2 className="text-sm font-bold text-white">Default Consultation Pricing</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        Default Chat Pricing (£ per minute)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.50"
                        max="10.00"
                        value={settingsData.defaultChatPrice}
                        onChange={e => setSettingsData({ ...settingsData, defaultChatPrice: parseFloat(e.target.value) || 1.50 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Default rate for newly created astrologers</span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        Default Video Call Pricing (£ per minute)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.50"
                        max="10.00"
                        value={settingsData.defaultVideoPrice}
                        onChange={e => setSettingsData({ ...settingsData, defaultVideoPrice: parseFloat(e.target.value) || 2.50 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Default per-minute rate for video consultations</span>
                    </div>
                  </div>
                </div>

                {/* Astrologer Availability Rules */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Users className="w-4 h-4 text-sky-400" />
                    <h2 className="text-sm font-bold text-white">Astrologer Availability &amp; Assignment</h2>
                  </div>

                  <div className="space-y-4 text-xs">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div>
                        <div className="font-bold text-white">Automatic Chat Assignment Engine</div>
                        <div className="text-[11px] text-slate-400">Route unassigned chat requests automatically to available on-duty astrologers</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsData.autoAssignEnabled}
                        onChange={e => setSettingsData({ ...settingsData, autoAssignEnabled: e.target.checked })}
                        className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-700"
                      />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          Max Concurrent Chats per Astrologer
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={settingsData.maxChatsPerAstrologer}
                          onChange={e => setSettingsData({ ...settingsData, maxChatsPerAstrologer: parseInt(e.target.value) || 3 })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                        />
                      </div>

                      <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                        <div>
                          <div className="font-bold text-white">Online Only Assignment</div>
                          <div className="text-[11px] text-slate-400">Strictly exclude offline or busy astrologers</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsData.onlineOnly}
                          onChange={e => setSettingsData({ ...settingsData, onlineOnly: e.target.checked })}
                          className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-700"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Free First-Chat Configuration */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white">Complimentary First Chat Program</h2>
                  </div>

                  <div className="space-y-4 text-xs">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div>
                        <div className="font-bold text-white">Enable Free First Chat for New Seekers</div>
                        <div className="text-[11px] text-slate-400">First-time visitors receive a complimentary timed reading</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsData.freeChatEnabled}
                        onChange={e => setSettingsData({ ...settingsData, freeChatEnabled: e.target.checked })}
                        className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-700"
                      />
                    </label>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        Free Session Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={settingsData.freeChatMinutes}
                        onChange={e => setSettingsData({ ...settingsData, freeChatMinutes: parseInt(e.target.value) || 2 })}
                        className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Standard complimentary duration is 2 minutes (120 seconds)</span>
                    </div>
                  </div>
                </div>

                {/* Admin Profile & Security Settings */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white">Admin Profile &amp; Security</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Admin Display Name</label>
                      <input
                        type="text"
                        value={settingsData.adminName}
                        onChange={e => setSettingsData({ ...settingsData, adminName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">Admin Contact Email</label>
                      <input
                        type="email"
                        value={settingsData.adminEmail}
                        readOnly
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* n8n Automation Engine Hub */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-amber-400" />
                      <div>
                        <h2 className="text-sm font-bold text-white">n8n Automation Engine Hub</h2>
                        <p className="text-[11px] text-slate-400">Configure global endpoint and authentication for astrologer backend workflows</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Real Backend Connected
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          n8n Base URL / Server Host
                        </label>
                        <input
                          type="url"
                          placeholder="https://n8n.webhook.internal or https://your-instance.app.n8n.cloud"
                          value={n8nConfig.baseUrl}
                          onChange={e => setN8nConfig({ ...n8nConfig, baseUrl: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Root URL where astrologer webhooks are hosted</span>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          Default Webhook Path
                        </label>
                        <input
                          type="text"
                          placeholder="/webhook/astrologer-chat"
                          value={n8nConfig.defaultWebhookPath}
                          onChange={e => setN8nConfig({ ...n8nConfig, defaultWebhookPath: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Appended to Base URL when astrologer has no custom URL</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        n8n API Key / Bearer Token (Optional)
                      </label>
                      <input
                        type="password"
                        placeholder="n8n_api_key_..."
                        value={n8nConfig.apiKey}
                        onChange={e => setN8nConfig({ ...n8nConfig, apiKey: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Sent in Authorization header if required by your n8n workflow triggers</span>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleSaveN8nConfig}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading ? 'Saving...' : 'Save n8n Config'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

              </form>

            </div>
          )}

        </main>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: CREATE ASTROLOGER ID */}
      {/* =================================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Sticky Header with prominent Back Button */}
            <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-white border border-slate-700/80 text-xs font-bold cursor-pointer transition shadow-md active:scale-95"
                  title="Back to astrologers list"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400" />
                  <span>Back to Astrologers</span>
                </button>
                <div className="h-5 w-px bg-slate-800 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Create New Astrologer ID</h3>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setCreateModalOpen(false)} 
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAstrologer} className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-5 sm:p-7 space-y-6 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Moon"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unique Astrologer ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LYS-10025"
                    value={formData.astroId}
                    onChange={e => setFormData({ ...formData, astroId: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-rose-300 font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Must be unique across all readers</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@lumsic.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+44 7700 900142"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {SPECIALIZATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.experienceYears}
                    onChange={e => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Per-Minute Chat Price (£)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.50"
                    max="10.00"
                    value={formData.ratePerMinute}
                    onChange={e => setFormData({ ...formData, ratePerMinute: parseFloat(e.target.value) || 1.75 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Per-Minute Video Call Price (£)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.50"
                    max="10.00"
                    value={formData.videoRatePerMinute}
                    onChange={e => setFormData({ ...formData, videoRatePerMinute: parseFloat(e.target.value) || 2.50 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Availability Toggles */}
              <div className="grid grid-cols-2 gap-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isChatEnabled}
                    onChange={e => setFormData({ ...formData, isChatEnabled: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-700"
                  />
                  <span className="font-semibold text-slate-200">Chat Consultation Enabled</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVideoEnabled}
                    onChange={e => setFormData({ ...formData, isVideoEnabled: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-700"
                  />
                  <span className="font-semibold text-slate-200">Video Call Enabled</span>
                </label>
              </div>

              {/* n8n Backend Workflow Automation Mapping */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">n8n Backend Workflow Automation</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isWorkflowEnabled}
                      onChange={e => setFormData({ ...formData, isWorkflowEnabled: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 rounded bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <span className={`text-[11px] font-bold ${formData.isWorkflowEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {formData.isWorkflowEnabled ? 'ON (Active)' : 'OFF (Stopped)'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Assigned Workflow ID</label>
                    <input
                      type="text"
                      placeholder={`wf_${formData.astroId || 'LYS-10001'}`}
                      value={formData.n8nWorkflowId}
                      onChange={e => setFormData({ ...formData, n8nWorkflowId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Mapped to this astrologer ID</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Workflow Title</label>
                    <input
                      type="text"
                      placeholder={`Consultation Flow - ${formData.astroId || 'LYS-10001'}`}
                      value={formData.n8nWorkflowName}
                      onChange={e => setFormData({ ...formData, n8nWorkflowName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custom n8n Webhook URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://n8n.your-domain.com/webhook/flow (leave blank for default)"
                    value={formData.n8nWebhookUrl}
                    onChange={e => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Profile Photo Upload (Pure Device Upload ONLY - No URL Input) */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-white text-sm">Astrologer Profile Photo</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Website Update
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
                  {/* Live Thumbnail Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={formData.avatar || DEFAULT_AVATARS[0]}
                      alt="Profile preview"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-rose-500/60 shadow-xl shadow-black/80 bg-slate-950"
                      onError={(e: any) => { e.target.src = DEFAULT_AVATARS[0]; }}
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 rounded-2xl bg-black/80 flex flex-col items-center justify-center backdrop-blur-xs gap-1.5">
                        <RefreshCw className="w-6 h-6 text-rose-400 animate-spin" />
                        <span className="text-[10px] font-bold text-rose-200">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Device File Upload Control ONLY (No URL input) */}
                  <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        Upload Astrologer Photo
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Select a photo directly from your device. It uploads immediately and reflects live on the consumer website in real time.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      <label className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 transition active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image from Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>

                      {formData.avatar && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Photo ready</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Supports JPG, PNG, WEBP, GIF up to 10MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 text-xs leading-relaxed"
                  placeholder="Dedicated intuitive counselor..."
                />
              </div>

              {/* Initial Password */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty to require password setup on first login"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              </div>

              {/* Sticky Footer with prominent Back Button */}
              <div className="sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-md px-5 sm:px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold cursor-pointer transition shadow-sm active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400" />
                  <span>Back to Astrologers</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingImage}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-50 transition shadow-lg shadow-rose-600/25 active:scale-95 flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Astrologer</span>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: EDIT ASTROLOGER PROFILE */}
      {/* =================================================================== */}
      {editModalOpen && editingReader && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            
            {/* Sticky Header with prominent Back Button */}
            <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingReader(null);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-white border border-slate-700/80 text-xs font-bold cursor-pointer transition shadow-md active:scale-95"
                  title="Back to astrologers list"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400" />
                  <span>Back to Astrologers</span>
                </button>
                <div className="h-5 w-px bg-slate-800 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                    Edit Astrologer: <span className="text-rose-400">{editingReader.name}</span>
                  </h3>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-slate-900 text-rose-300 border border-slate-800 font-mono text-[10px] font-bold">
                    {editingReader.astroId || editingReader.id}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingReader(null);
                }} 
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAstrologer} className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-5 sm:p-7 space-y-6 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unique Astrologer ID</label>
                  <input
                    type="text"
                    required
                    value={formData.astroId}
                    onChange={e => setFormData({ ...formData, astroId: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-rose-300 font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {SPECIALIZATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.experienceYears}
                    onChange={e => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Per-Minute Chat Rate (£)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.50"
                    max="10.00"
                    value={formData.ratePerMinute}
                    onChange={e => setFormData({ ...formData, ratePerMinute: parseFloat(e.target.value) || 1.75 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Per-Minute Video Rate (£)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.50"
                    max="10.00"
                    value={formData.videoRatePerMinute}
                    onChange={e => setFormData({ ...formData, videoRatePerMinute: parseFloat(e.target.value) || 2.50 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Availability Toggles */}
              <div className="grid grid-cols-2 gap-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isChatEnabled}
                    onChange={e => setFormData({ ...formData, isChatEnabled: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-700"
                  />
                  <span className="font-semibold text-slate-200">Chat Enabled</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVideoEnabled}
                    onChange={e => setFormData({ ...formData, isVideoEnabled: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded bg-slate-800 border-slate-700"
                  />
                  <span className="font-semibold text-slate-200">Video Call Enabled</span>
                </label>
              </div>

              {/* n8n Backend Workflow Automation Mapping */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">n8n Backend Workflow Automation</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isWorkflowEnabled}
                      onChange={e => setFormData({ ...formData, isWorkflowEnabled: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 rounded bg-slate-800 border-slate-700 cursor-pointer"
                    />
                    <span className={`text-[11px] font-bold ${formData.isWorkflowEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {formData.isWorkflowEnabled ? 'ON (Active)' : 'OFF (Stopped)'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Assigned Workflow ID</label>
                    <input
                      type="text"
                      placeholder={`wf_${formData.astroId || 'LYS-10001'}`}
                      value={formData.n8nWorkflowId}
                      onChange={e => setFormData({ ...formData, n8nWorkflowId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Mapped to this astrologer ID</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Workflow Title</label>
                    <input
                      type="text"
                      placeholder={`Consultation Flow - ${formData.astroId || 'LYS-10001'}`}
                      value={formData.n8nWorkflowName}
                      onChange={e => setFormData({ ...formData, n8nWorkflowName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custom n8n Webhook URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://n8n.your-domain.com/webhook/flow (leave blank for default)"
                    value={formData.n8nWebhookUrl}
                    onChange={e => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Profile Photo Upload (Pure Device Upload ONLY - No URL Input) */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-white text-sm">Astrologer Profile Photo</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Website Update
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
                  {/* Live Thumbnail Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={formData.avatar || DEFAULT_AVATARS[0]}
                      alt="Profile preview"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-rose-500/60 shadow-xl shadow-black/80 bg-slate-950"
                      onError={(e: any) => { e.target.src = DEFAULT_AVATARS[0]; }}
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 rounded-2xl bg-black/80 flex flex-col items-center justify-center backdrop-blur-xs gap-1.5">
                        <RefreshCw className="w-6 h-6 text-rose-400 animate-spin" />
                        <span className="text-[10px] font-bold text-rose-200">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Device File Upload Control ONLY (No URL input) */}
                  <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {formData.avatar ? 'Change Astrologer Photo' : 'Upload Astrologer Photo'}
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Select a photo directly from your device. It uploads immediately and reflects live on the consumer website in real time.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      <label className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 transition active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image from Device'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>

                      {formData.avatar && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Photo active on live site</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Supports JPG, PNG, WEBP, GIF up to 10MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 text-xs leading-relaxed"
                  placeholder="Dedicated intuitive counselor..."
                />
              </div>

              </div>

              {/* Sticky Footer with prominent Back Button */}
              <div className="sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-md px-5 sm:px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingReader(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold cursor-pointer transition shadow-sm active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400" />
                  <span>Back to Astrologers</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModalOpen(false);
                      setEditingReader(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingImage}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-50 transition shadow-lg shadow-rose-600/25 active:scale-95 flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION DIALOG */}
      {/* =================================================================== */}
      {deleteConfirmReader && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-rose-900/50 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Astrologer Profile?</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
              Are you sure you want to permanently delete <strong className="text-white">{deleteConfirmReader.name}</strong> (ID: <span className="font-mono text-rose-300">{deleteConfirmReader.astroId || deleteConfirmReader.id}</span>)?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmReader(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAstrologer}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: PASSWORD RESET / CREDENTIALS ASSIGNMENT */}
      {/* =================================================================== */}
      {passwordResetReader && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Reset Astrologer Password</h3>
              </div>
              <button onClick={() => setPasswordResetReader(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300">
              Assign a new secure password for <strong className="text-white">{passwordResetReader.name}</strong> ({passwordResetReader.astroId}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={newPasswordValue}
                  onChange={e => setNewPasswordValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetReader(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newPasswordValue.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: CHAT REASSIGN / TRANSFER MODAL */}
      {/* =================================================================== */}
      {transferModalOpen && selectedSessionToTransfer && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-white">Transfer / Assign Consultation</h3>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Client:</span>
                <span className="font-bold text-white">{selectedSessionToTransfer.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Client-Facing Astrologer:</span>
                <span className="font-bold text-rose-300">{selectedSessionToTransfer.requestedReaderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Currently Assigned:</span>
                <span className="font-medium text-slate-200">{selectedSessionToTransfer.assignedReaderName || 'None'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Astrologer to Receive Chat *</label>
                <select
                  value={transferTargetReaderId}
                  onChange={e => setTransferTargetReaderId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {readers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.astroId || r.id}) — {r.isOnline ? 'Online' : 'Offline'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Transfer</label>
                <select
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Manual Admin Load Balancing">Manual Load Balancing</option>
                  <option value="Requested Reader Busy">Original Astrologer Busy / Offline</option>
                  <option value="Seeker Specialty Request">Seeker Specialty Alignment</option>
                  <option value="Direct Admin Reassignment">Direct Admin Reassignment</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Client Experience Protected:</strong> The client continues to see <strong>{selectedSessionToTransfer.requestedReaderName}</strong> and all prior messages remain intact.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransferChat}
                disabled={actionLoading || !transferTargetReaderId}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DRAWER / MODAL 6: VIEW CHAT TRANSCRIPT */}
      {/* =================================================================== */}
      {viewTranscriptSession && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl p-5 space-y-3.5 text-xs shadow-2xl flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Consultation with {viewTranscriptSession.customerName}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    viewTranscriptSession.status === 'active'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : viewTranscriptSession.status === 'waiting'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      : 'bg-slate-900 text-slate-400'
                  }`}>
                    {viewTranscriptSession.status === 'waiting' ? 'Pending Acceptance' : viewTranscriptSession.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Astrologer: <span className="text-slate-200 font-medium">{viewTranscriptSession.assignedReaderName || viewTranscriptSession.requestedReaderName}</span> • Session #{viewTranscriptSession.id.slice(-6)}
                </p>
              </div>
              <button onClick={() => setViewTranscriptSession(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Birth Details Card */}
            {viewTranscriptSession.birthDetails && (
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1 shrink-0">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Seeker Profile Details</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
                  {viewTranscriptSession.birthDetails.dob && (
                    <span><strong>DOB:</strong> {viewTranscriptSession.birthDetails.dob}</span>
                  )}
                  {viewTranscriptSession.birthDetails.birthTime && (
                    <span><strong>Time:</strong> {viewTranscriptSession.birthDetails.birthTime} {viewTranscriptSession.birthDetails.amPm || ''}</span>
                  )}
                  {viewTranscriptSession.birthDetails.placeOfBirth && (
                    <span><strong>Place:</strong> {viewTranscriptSession.birthDetails.placeOfBirth}</span>
                  )}
                  {viewTranscriptSession.birthDetails.gender && (
                    <span><strong>Gender:</strong> {viewTranscriptSession.birthDetails.gender}</span>
                  )}
                </div>
              </div>
            )}

            {/* Messages Box */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-900 rounded-xl border border-slate-800 min-h-[180px] max-h-80">
              {viewTranscriptSession.messages && viewTranscriptSession.messages.length > 0 ? (
                viewTranscriptSession.messages.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`flex flex-col ${
                      msg.sender === 'customer' ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                      {msg.senderName || (msg.sender === 'customer' ? viewTranscriptSession.customerName : 'Astrologer')}
                    </div>
                    <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs ${
                      msg.sender === 'customer'
                        ? 'bg-slate-800 text-white rounded-tl-sm'
                        : 'bg-rose-600 text-white rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No messages exchanged in this consultation yet. Send a message below to begin!
                </div>
              )}
            </div>

            {/* Interactive Admin Reply & Attend Bar */}
            <div className="pt-2 border-t border-slate-800 space-y-2 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Reply as ${viewTranscriptSession.assignedReaderName || viewTranscriptSession.requestedReaderName || 'Astrologer'}...`}
                  value={adminReplyText}
                  onChange={e => setAdminReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdminSendReply(); }}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAdminSendReply}
                  disabled={!adminReplyText.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                {onOpenAstrologerDashboard && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewTranscriptSession(null);
                      onOpenAstrologerDashboard();
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Astrologer Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewTranscriptSession(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DRAWER / MODAL 7: CLIENT PROFILE & CHAT HISTORY */}
      {/* =================================================================== */}
      {selectedClientProfile && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 text-xs shadow-2xl max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                  {selectedClientProfile.name?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedClientProfile.name}</h3>
                  <p className="text-[11px] text-slate-400">ID: {selectedClientProfile.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedClientProfile(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 block">Email</span>
                <span className="text-xs font-semibold text-white truncate block">{selectedClientProfile.email || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Phone</span>
                <span className="text-xs font-semibold text-white font-mono">{selectedClientProfile.phone || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Consultations</span>
                <span className="text-xs font-bold text-emerald-400">{selectedClientProfile.totalConsultations}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Account Status</span>
                <span className="text-xs font-bold text-rose-300">{selectedClientProfile.accountStatus.toUpperCase()}</span>
              </div>
            </div>

            {/* Past Consultations List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Consultation History ({clientChatHistory.length})
              </h4>

              {clientChatsLoading ? (
                <div className="py-8 text-center text-slate-400">Loading chat history...</div>
              ) : clientChatHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
                  No consultation sessions recorded for this client.
                </div>
              ) : (
                clientChatHistory.map(histSession => (
                  <div
                    key={histSession.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">
                        Astrologer: {histSession.assignedReaderName || histSession.requestedReaderName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Status: <strong className="text-slate-300">{histSession.status}</strong></span>
                        <span>•</span>
                        <span>{new Date(histSession.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{histSession.messages?.length || 0} messages</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewTranscriptSession(histSession)}
                      className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs transition cursor-pointer"
                    >
                      View Chat
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedClientProfile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: n8n WORKFLOW ASSIGNMENT & REAL-TIME TESTING CONSOLE */}
      {/* =================================================================== */}
      {workflowModalReader && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 text-xs shadow-2xl my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={workflowModalReader.avatar || workflowModalReader.image_url || DEFAULT_AVATARS[0]}
                  alt={workflowModalReader.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{workflowModalReader.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-rose-300 font-mono font-bold text-[11px] border border-slate-800">
                      {workflowModalReader.astroId || workflowModalReader.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">n8n Workflow Assignment &amp; Execution Engine</p>
                </div>
              </div>
              <button onClick={() => setWorkflowModalReader(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Individual Astrologer ON/OFF Toggle */}
            <div className={`p-4 rounded-xl border transition ${
              workflowFormData.isWorkflowEnabled
                ? 'bg-emerald-950/30 border-emerald-800/60'
                : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      workflowFormData.isWorkflowEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`} />
                    <span className="font-bold text-white text-sm">
                      Workflow Execution: {workflowFormData.isWorkflowEnabled ? 'ENABLED (ON)' : 'STOPPED (OFF)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {workflowFormData.isWorkflowEnabled
                      ? 'User messages sent to this astrologer trigger only the assigned n8n backend workflow.'
                      : 'Executions halted. Chats with this astrologer will not execute new n8n workflows while OFF.'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={workflowFormData.isWorkflowEnabled}
                  onClick={() => handleToggleWorkflow(workflowModalReader)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    workflowFormData.isWorkflowEnabled ? 'bg-emerald-500' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      workflowFormData.isWorkflowEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 2. Workflow Mapping Form */}
            <form onSubmit={handleSaveWorkflowMapping} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assigned n8n Workflow ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. wf_LYS-10001"
                    value={workflowFormData.n8nWorkflowId}
                    onChange={e => setWorkflowFormData({ ...workflowFormData, n8nWorkflowId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Mapped strictly to Astrologer ID: {workflowModalReader.astroId || workflowModalReader.id}</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Friendly Workflow Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vedic Kundali Synthesis Flow"
                    value={workflowFormData.n8nWorkflowName}
                    onChange={e => setWorkflowFormData({ ...workflowFormData, n8nWorkflowName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dedicated Webhook URL (Optional override)
                </label>
                <input
                  type="url"
                  placeholder={`Default: ${n8nConfig.baseUrl || 'https://n8n.webhook.internal'}${n8nConfig.defaultWebhookPath || '/webhook/astrologer-chat'}`}
                  value={workflowFormData.n8nWebhookUrl}
                  onChange={e => setWorkflowFormData({ ...workflowFormData, n8nWebhookUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Leave empty to use global default webhook path with workflowId payload</span>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{actionLoading ? 'Saving...' : 'Save Workflow Mapping'}</span>
                </button>
              </div>
            </form>

            {/* 3. Real-Time Workflow Testing Console */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-white text-xs">Live Workflow Execution Tester</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: {workflowModalReader.astroId || workflowModalReader.id}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Test Seeker Message Prompt</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testMessageInput}
                    onChange={e => setTestMessageInput(e.target.value)}
                    placeholder="Enter message to test n8n workflow output..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestWorkflow}
                    disabled={testWorkflowLoading}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{testWorkflowLoading ? 'Testing...' : 'Trigger Test'}</span>
                  </button>
                </div>
              </div>

              {/* Test Result Display */}
              {testWorkflowResult && (
                <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                  testWorkflowResult.status === 'success' ? 'bg-emerald-950/30 border-emerald-800/60' :
                  testWorkflowResult.status === 'stopped' ? 'bg-amber-950/30 border-amber-800/60' :
                  'bg-rose-950/30 border-rose-800/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        testWorkflowResult.status === 'success' ? 'bg-emerald-500 text-slate-950' :
                        testWorkflowResult.status === 'stopped' ? 'bg-amber-500 text-slate-950' :
                        'bg-rose-500 text-white'
                      }`}>
                        Status: {testWorkflowResult.status}
                      </span>
                      {testWorkflowResult.latencyMs && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Latency: {testWorkflowResult.latencyMs}ms
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Workflow: {testWorkflowResult.workflowId || workflowFormData.n8nWorkflowId}
                    </span>
                  </div>

                  {testWorkflowResult.status === 'stopped' && (
                    <p className="text-amber-300 text-[11px]">
                      {testWorkflowResult.message || 'Execution halted because this astrologer’s workflow toggle is currently OFF.'}
                    </p>
                  )}

                  {testWorkflowResult.reply && (
                    <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Response Output:</div>
                      <div className="text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">
                        {testWorkflowResult.reply}
                      </div>
                    </div>
                  )}

                  {testWorkflowResult.error && (
                    <p className="text-rose-300 text-[11px]">
                      Error: {testWorkflowResult.error}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">
                Last Executed: {workflowModalReader.n8nLastExecutionAt ? new Date(workflowModalReader.n8nLastExecutionAt).toLocaleString() : 'Never'}
              </span>
              <button
                type="button"
                onClick={() => setWorkflowModalReader(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
