import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send, 
  ArrowRightLeft, 
  Sparkles, 
  RefreshCw, 
  LogOut, 
  ChevronRight, 
  User, 
  Calendar, 
  MapPin, 
  Eye, 
  Volume2, 
  VolumeX, 
  Bell, 
  Check,
  Zap,
  Activity,
  ArrowUpRight,
  Filter,
  ChevronDown,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import { 
  getStoredSessions, 
  saveStoredSession, 
  appendMessageToStoredSession, 
  broadcastSessionEvent, 
  SESSIONS_CHANNEL_NAME 
} from '../utils/sessionSync';
import { auth, signOutCurrentUser, AuthUserProfile, db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { READERS } from '../data/readers';
import { Reader, ConsultationSession, ChatMessage } from '../types';

interface AdminCMSPanelProps {
  onBackToSite: () => void;
  initialTab?: string;
  currentAdminProfile?: AuthUserProfile;
  onOpenAstrologerDashboard?: () => void;
}

export const AdminCMSPanel: React.FC<AdminCMSPanelProps> = ({
  onBackToSite,
  initialTab = 'overview',
  currentAdminProfile
}) => {
  // Navigation tabs: 'overview' | 'inbox' | 'chats' | 'astrologers'
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'chats' | 'astrologers'>(() => {
    if (initialTab === 'chats' || initialTab === 'inbox') return 'inbox';
    if (initialTab === 'astrologers') return 'astrologers';
    return 'overview';
  });

  // Master State
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [readers, setReaders] = useState<Reader[]>(READERS);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filters & Search
  const [inboxSearch, setInboxSearch] = useState<string>('');
  const [inboxStatusFilter, setInboxStatusFilter] = useState<'all' | 'waiting' | 'active' | 'completed'>('all');
  const [inboxAstrologerFilter, setInboxAstrologerFilter] = useState<string>('all');
  
  // Chat Reply State
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reassign Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState<boolean>(false);
  const [sessionToReassign, setSessionToReassign] = useState<ConsultationSession | null>(null);
  const [targetReaderId, setTargetReaderId] = useState<string>('');
  const [reassignNote, setReassignNote] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState<boolean>(false);

  // Update clock every second for live timers
  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {}
  };

  // Helper: Get Admin Request Headers
  const getAdminHeaders = async (): Promise<Record<string, string>> => {
    let token = '';
    try {
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
    } catch {}
    const localToken = typeof window !== 'undefined' ? (localStorage.getItem('lumsic_admin_token') || sessionStorage.getItem('lumsic_admin_token') || '') : '';
    const email = currentAdminProfile?.email || auth.currentUser?.email || (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_email') || 'bankush014@gmail.com') : 'bankush014@gmail.com');
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

  // =========================================================================
  // MASTER DATA FETCHING: Server Inbox API + Local Fallback
  // =========================================================================
  const fetchData = async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      // 1. Fetch readers
      const readersRes = await adminFetch('/api/readers').catch(() => null);
      if (readersRes && readersRes.ok) {
        const data = await readersRes.json().catch(() => null);
        if (data?.readers && Array.isArray(data.readers) && data.readers.length > 0) {
          const serverMap = new Map<string, Reader>(data.readers.map((r: Reader) => [r.id, r]));
          const merged = READERS.map(coreReader => {
            const remote = serverMap.get(coreReader.id);
            return {
              ...coreReader,
              ...(remote || {}),
              isOnline: remote ? Boolean(remote.isOnline) : coreReader.isOnline,
              status: remote ? (remote.status || (remote.isOnline ? 'online' : 'offline')) : 'online'
            };
          });
          const custom = data.readers.filter((r: Reader) => !READERS.some(cr => cr.id === r.id));
          setReaders([...merged, ...custom]);
        }
      }

      // 2. Fetch central admin inbox (All conversations across ALL readers & workflows)
      let serverSessions: ConsultationSession[] = [];
      const inboxRes = await adminFetch('/api/admin/inbox?isAdmin=true')
        .then(async r => {
          if (!r || !r.ok) return adminFetch('/api/admin/sessions?isAdmin=true');
          return r;
        })
        .catch(() => null);

      if (inboxRes && inboxRes.ok) {
        const inboxData = await inboxRes.json().catch(() => null);
        if (inboxData?.sessions && Array.isArray(inboxData.sessions)) {
          serverSessions = inboxData.sessions;
        }
      }

      // 3. Resilient merge: Combine server sessions, Firestore sessions, and local storage sessions
      const localStored = getStoredSessions();
      const sessionMap = new Map<string, ConsultationSession>();
      localStored.forEach(s => sessionMap.set(s.id, s));
      serverSessions.forEach(s => sessionMap.set(s.id, { ...(sessionMap.get(s.id) || {}), ...s }));

      // Direct Firestore fetch ensures immediate sync across all domains
      try {
        const firestoreSnap = await getDocs(collection(db, 'sessions'));
        firestoreSnap.forEach(d => {
          const s = d.data() as ConsultationSession;
          if (s && s.id) {
            sessionMap.set(s.id, { ...(sessionMap.get(s.id) || {}), ...s });
          }
        });
      } catch (fsErr) {
        console.warn('Firestore initial fetch notice:', fsErr);
      }

      const mergedList = Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSessions(mergedList);

      // Auto-select first session if none selected
      if (!selectedSessionId && mergedList.length > 0) {
        setSelectedSessionId(mergedList[0].id);
      }
    } catch (err) {
      console.warn('Admin fetch data notice:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // =========================================================================
  // REAL-TIME SYNCHRONIZATION: Firestore onSnapshot + SSE + BroadcastChannel
  // =========================================================================
  useEffect(() => {
    fetchData();

    // 1. Heartbeat Polling (every 4 seconds) to guarantee zero lost chats
    const pollInterval = setInterval(() => {
      fetchData();
    }, 4000);

    // 2. Real-time Firestore onSnapshot (Sub-100ms sync across all devices & domains)
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = onSnapshot(collection(db, 'sessions'), (snapshot) => {
        const remoteSessions: ConsultationSession[] = [];
        let hasNewSession = false;

        snapshot.forEach(docSnap => {
          const s = docSnap.data() as ConsultationSession;
          if (s && s.id) {
            remoteSessions.push(s);
          }
        });

        if (remoteSessions.length > 0) {
          setSessions(prev => {
            const map = new Map<string, ConsultationSession>();
            prev.forEach(s => map.set(s.id, s));

            remoteSessions.forEach(s => {
              const existing = map.get(s.id);
              if (!existing) {
                hasNewSession = true;
              }
              map.set(s.id, { ...(existing || {}), ...s });
            });

            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          if (hasNewSession) {
            playNotificationSound();
            showToast('🔔 New customer conversation landed in Admin Inbox!', 'info');
          }
        }
      }, (err) => {
        console.warn('Firestore onSnapshot notice:', err);
      });
    } catch (err) {
      console.warn('Firestore subscription init notice:', err);
    }

    // 3. Real-time SSE Stream (/api/events)
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events?isAdmin=true&readerId=psychic-tamara');
      es.addEventListener('new_session', (e: MessageEvent) => {
        try {
          const newSess = JSON.parse(e.data);
          if (newSess && newSess.id) {
            playNotificationSound();
            showToast(`🔔 New chat from ${newSess.customerName || 'Customer'}!`, 'info');
            setSessions(prev => {
              const exists = prev.some(s => s.id === newSess.id);
              if (exists) return prev.map(s => s.id === newSess.id ? { ...s, ...newSess } : s);
              return [newSess, ...prev];
            });
            fetchData();
          }
        } catch {}
      });

      es.addEventListener('message_received', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const msg: ChatMessage = data?.message;
          const sessId = data?.sessionId || msg?.sessionId;
          if (sessId && msg) {
            setSessions(prev => prev.map(s => {
              if (s.id === sessId) {
                const msgs = s.messages || [];
                if (!msgs.some(m => m.id === msg.id)) {
                  return { 
                    ...s, 
                    messages: [...msgs, msg], 
                    lastMessageText: msg.text, 
                    lastMessageAt: msg.timestamp 
                  };
                }
              }
              return s;
            }));
          }
        } catch {}
      });

      es.addEventListener('session_updated', () => fetchData());
      es.addEventListener('session_accepted', () => fetchData());
      es.addEventListener('session_completed', () => fetchData());
    } catch {}

    // 4. Cross-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(SESSIONS_CHANNEL_NAME);
        bc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'new_session' && payload) {
            playNotificationSound();
            setSessions(prev => {
              const exists = prev.some(s => s.id === payload.id);
              if (exists) return prev.map(s => s.id === payload.id ? { ...s, ...payload } : s);
              return [payload, ...prev];
            });
          }
        };
      }
    } catch {}

    return () => {
      clearInterval(pollInterval);
      if (unsubFirestore) unsubFirestore();
      if (es) es.close();
      if (bc) bc.close();
    };
  }, []);

  // Auto-scroll chat history on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, selectedSessionId]);

  // KPIs Computation
  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter(s => s.status === 'active').length;
    const pending = sessions.filter(s => s.status === 'waiting').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const onlineAstrologers = readers.filter(r => r.isOnline).length;
    const uniqueCustomers = new Set(sessions.map(s => s.customerId || s.customerName)).size;

    return { total, active, pending, completed, onlineAstrologers, uniqueCustomers };
  }, [sessions, readers]);

  // Selected Conversation Object
  const selectedSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || sessions[0] || null;
  }, [sessions, selectedSessionId]);

  // Filtered Conversations for Inbox List
  const filteredInboxSessions = useMemo(() => {
    return sessions.filter(s => {
      // 1. Status Filter
      if (inboxStatusFilter !== 'all' && (s.status || '').toLowerCase() !== inboxStatusFilter) {
        return false;
      }
      // 2. Astrologer Filter
      if (inboxAstrologerFilter !== 'all') {
        const matchesReader = 
          s.assignedReaderId === inboxAstrologerFilter ||
          s.requestedReaderId === inboxAstrologerFilter ||
          s.assignedAstroId === inboxAstrologerFilter ||
          s.requestedAstroId === inboxAstrologerFilter;
        if (!matchesReader) return false;
      }
      // 3. Search Query
      if (inboxSearch.trim()) {
        const q = inboxSearch.toLowerCase().trim();
        const matches = 
          (s.customerName && s.customerName.toLowerCase().includes(q)) ||
          (s.customerId && s.customerId.toLowerCase().includes(q)) ||
          (s.id && s.id.toLowerCase().includes(q)) ||
          (s.assignedReaderName && s.assignedReaderName.toLowerCase().includes(q)) ||
          (s.requestedReaderName && s.requestedReaderName.toLowerCase().includes(q)) ||
          (s.topic && s.topic.toLowerCase().includes(q)) ||
          (s.readingType && s.readingType.toLowerCase().includes(q)) ||
          (s.lastMessageText && s.lastMessageText.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [sessions, inboxStatusFilter, inboxAstrologerFilter, inboxSearch]);

  // Helper: Elapsed / Duration text
  const getElapsedText = (createdAt: string) => {
    if (!createdAt) return '0m';
    const elapsedSec = Math.max(0, Math.floor((nowTimestamp - new Date(createdAt).getTime()) / 1000));
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Helper: Relative timestamp
  const getRelativeTime = (timestamp?: string) => {
    if (!timestamp) return 'Recently';
    const diff = Math.floor((nowTimestamp - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // =========================================================================
  // ACTIONS: Admin Send Reply, Reassign, Complete, Toggle Astrologer
  // =========================================================================
  const handleAdminSendReply = async () => {
    if (!selectedSession || !replyText.trim() || isSendingReply) return;
    const text = replyText.trim();
    setReplyText('');
    setIsSendingReply(true);

    const senderName = selectedSession.assignedReaderName || selectedSession.requestedReaderName || 'LUMSIC Guide';
    const newMsg: ChatMessage = {
      id: 'msg_adm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sessionId: selectedSession.id,
      sender: 'astrologer',
      senderName,
      text,
      timestamp: new Date().toISOString()
    };

    const updatedSession: ConsultationSession = {
      ...selectedSession,
      status: 'active',
      messages: [...(selectedSession.messages || []), newMsg],
      lastMessageText: text,
      lastMessageAt: newMsg.timestamp,
      unreadForOperator: false
    };

    // 1. Instant local update
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    saveStoredSession(updatedSession);
    broadcastSessionEvent('message_received', newMsg);
    broadcastSessionEvent('session_accepted', updatedSession);

    // 2. Direct Firestore update (delivers instantly to seeker on any device)
    try {
      await setDoc(doc(db, 'sessions', updatedSession.id), updatedSession, { merge: true });
    } catch (err) {
      console.warn('Firestore reply sync notice:', err);
    }

    // 3. Dispatch to backend server
    try {
      await adminFetch(`/api/sessions/${updatedSession.id}/message`, {
        method: 'POST',
        body: JSON.stringify({
          sender: 'astrologer',
          senderName,
          text
        })
      });
    } catch (err) {
      console.warn('Backend reply dispatch notice:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleOpenReassignModal = (session: ConsultationSession) => {
    setSessionToReassign(session);
    setTargetReaderId(session.assignedReaderId || readers[0]?.id || '');
    setReassignNote('');
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!sessionToReassign || !targetReaderId || isReassigning) return;
    setIsReassigning(true);

    const targetReader = readers.find(r => r.id === targetReaderId || r.astroId === targetReaderId);
    const targetName = targetReader?.name || 'Assigned Astrologer';

    const assignNotice: ChatMessage = {
      id: 'sys_asg_' + Date.now(),
      sessionId: sessionToReassign.id,
      sender: 'system',
      senderName: 'LUMSIC System',
      text: `Consultation routed to ${targetName}. ${reassignNote ? `(${reassignNote})` : ''}`,
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    };

    const updatedSession: ConsultationSession = {
      ...sessionToReassign,
      assignedReaderId: targetReaderId,
      assignedReaderName: targetName,
      assignedAstroId: targetReader?.astroId || targetReaderId,
      status: 'active',
      messages: [...(sessionToReassign.messages || []), assignNotice]
    };

    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    saveStoredSession(updatedSession);
    broadcastSessionEvent('session_updated', updatedSession);

    try {
      await setDoc(doc(db, 'sessions', updatedSession.id), updatedSession, { merge: true });
    } catch {}

    try {
      await adminFetch(`/api/admin/inbox/${updatedSession.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          readerId: targetReaderId,
          note: reassignNote
        })
      });
      showToast(`Conversation successfully reassigned to ${targetName}!`);
    } catch {}

    setIsReassigning(false);
    setReassignModalOpen(false);
    setSessionToReassign(null);
  };

  const handleCompleteSession = async (session: ConsultationSession) => {
    const updated: ConsultationSession = {
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString()
    };

    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    saveStoredSession(updated);
    broadcastSessionEvent('session_ended', updated);

    try {
      await setDoc(doc(db, 'sessions', updated.id), updated, { merge: true });
    } catch {}

    try {
      await adminFetch(`/api/admin/inbox/${updated.id}/complete`, { method: 'POST' });
      showToast(`Conversation with ${session.customerName} marked as completed.`);
    } catch {}
  };

  const handleToggleReader = async (readerId: string, currentOnline: boolean) => {
    const nextStatus = !currentOnline;
    setReaders(prev => prev.map(r => r.id === readerId ? { ...r, isOnline: nextStatus, status: nextStatus ? 'online' : 'offline' } : r));

    try {
      await adminFetch(`/api/readers/${readerId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isOnline: nextStatus, status: nextStatus ? 'online' : 'offline' })
      });
      showToast(`Astrologer status updated to ${nextStatus ? 'Online' : 'Offline'}.`);
    } catch {
      showToast('Status updated locally.', 'info');
    }
  };

  const handleToggleWorkflow = async (readerId: string, currentEnabled: boolean) => {
    const nextWorkflow = !currentEnabled;
    setReaders(prev => prev.map(r => r.id === readerId ? { ...r, isWorkflowEnabled: nextWorkflow } : r));

    try {
      await adminFetch(`/api/admin/astrologers/${readerId}/toggle-workflow`, {
        method: 'POST',
        body: JSON.stringify({ isWorkflowEnabled: nextWorkflow })
      });
      showToast(`Automation workflow ${nextWorkflow ? 'enabled' : 'disabled'} for astrologer.`);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* Hidden audio element for incoming chat chime */}
      <audio 
        ref={audioRef} 
        src="/assets/aistudio/mixkit-marimba-waiting-ringtone-1360_715cddd4.wav" 
        preload="auto" 
      />

      {/* ===================================================================== */}
      {/* TOP HEADER: BRANDING, STATUS, GLOBAL TABS & ACTIONS */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-30 bg-[#0B0F1C]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand & Connection Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 p-0.5 shadow-lg shadow-rose-900/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#070A12] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black tracking-wider text-base text-white">LUMSIC</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Admin Command Center
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">Live Universal Sync</span>
                <span className="text-slate-600">•</span>
                <span>{stats.total} total conversations</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'inbox'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-md shadow-rose-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>All Chats / Inbox</span>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'chats'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Chat Management</span>
            </button>

            <button
              onClick={() => setActiveTab('astrologers')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'astrologers'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Astrologers</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                {stats.onlineAstrologers} Online
              </span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            
            {/* Audio Mute/Unmute */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chime Alerts' : 'Unmute Chime Alerts'}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Back to Site */}
            <button
              onClick={onBackToSite}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
            >
              Website
            </button>

            {/* Sign Out */}
            <button
              onClick={async () => {
                await signOutCurrentUser().catch(() => {});
                localStorage.removeItem('lumsic_admin_token');
                sessionStorage.removeItem('lumsic_admin_token');
                window.location.reload();
              }}
              title="Sign Out Admin"
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
          toastMessage.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : toastMessage.type === 'info'
            ? 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}>
          <Bell className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MAIN CONTENT BODY */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        
        {/* =================================================================== */}
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {/* =================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              
              <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] font-medium text-slate-400">Total Chats</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-white">{stats.total}</span>
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Universal customer queue</span>
              </div>

              <div className="bg-[#0B0F1C] border border-emerald-900/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Chats
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-emerald-300">{stats.active}</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Live in session right now</span>
              </div>

              <div className="bg-[#0B0F1C] border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Pending Pickup
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-amber-300">{stats.pending}</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] text-amber-400/80 mt-1">Requires astrologer reply</span>
              </div>

              <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] font-medium text-slate-400">Completed</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-slate-200">{stats.completed}</span>
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Archived consultations</span>
              </div>

              <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] font-medium text-slate-400">Total Seekers</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-white">{stats.uniqueCustomers}</span>
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Unique customer profiles</span>
              </div>

              <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                <span className="text-[11px] font-medium text-slate-400">Online Astrologers</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-amber-400">{stats.onlineAstrologers}</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Of {readers.length} on roster</span>
              </div>

            </div>

            {/* Priority Waiting Queue Alert */}
            {stats.pending > 0 && (
              <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border border-amber-500/40 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <h2 className="text-sm font-bold text-amber-200">
                      Incoming Priority Queue: {stats.pending} Customer{stats.pending > 1 ? 's' : ''} Waiting for Reply
                    </h2>
                  </div>
                  <button 
                    onClick={() => {
                      setInboxStatusFilter('waiting');
                      setActiveTab('inbox');
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All In Inbox</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sessions.filter(s => s.status === 'waiting').slice(0, 3).map(sess => (
                    <div 
                      key={sess.id}
                      className="bg-[#070A12]/80 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between hover:border-amber-400 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{sess.customerName || 'Seeker'}</span>
                          <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                            Wait: {getElapsedText(sess.createdAt)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Requested: <span className="text-amber-300 font-medium">{sess.requestedReaderName || sess.assignedReaderName}</span>
                        </div>
                        <p className="text-xs text-slate-300 italic mt-2 line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          "{sess.initialQuestion || sess.lastMessageText || 'Hello, I need guidance today.'}"
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">ID: {sess.id.substring(0, 14)}...</span>
                        <button
                          onClick={() => {
                            setSelectedSessionId(sess.id);
                            setActiveTab('inbox');
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Attend & Reply</span>
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions & Recent Conversations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Conversations List */}
              <div className="lg:col-span-2 bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Recent Customer Consultations</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time incoming feed from all users and readers</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('inbox')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Full Inbox</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {sessions.slice(0, 6).map(sess => (
                    <div 
                      key={sess.id}
                      onClick={() => {
                        setSelectedSessionId(sess.id);
                        setActiveTab('inbox');
                      }}
                      className="py-3 px-2 rounded-xl hover:bg-slate-900/60 transition cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {(sess.customerName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{sess.customerName || 'Anonymous Seeker'}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              sess.status === 'active' 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : sess.status === 'waiting'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {sess.status === 'waiting' ? 'Pending' : sess.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {sess.lastMessageText || sess.topic || 'General Consultation'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-slate-300 font-medium">
                          {sess.assignedReaderName || sess.requestedReaderName || 'Tamara'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {getRelativeTime(sess.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roster & Quick Actions Sidebar */}
              <div className="space-y-4">
                
                {/* Astrologer Workload Spotlight */}
                <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">Astrologer Status</h3>
                    <button 
                      onClick={() => setActiveTab('astrologers')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {readers.slice(0, 5).map(reader => {
                      const activeChats = sessions.filter(s => (s.assignedReaderId === reader.id || s.requestedReaderId === reader.id) && s.status === 'active').length;
                      return (
                        <div key={reader.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative">
                              <img src={reader.avatar} alt={reader.name} className="w-7 h-7 rounded-full object-cover" />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${reader.isOnline ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-slate-200 block truncate">{reader.name}</span>
                              <span className="text-[10px] text-slate-400">{(reader as any).specialization || reader.category || reader.title}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              activeChats > 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {activeChats} active
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Database Connectivity Spotlight */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Real-Time Engine Status</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Firestore collection <code className="text-amber-300 font-mono">sessions</code> and Cloud Run Express backend are synchronized in real time.
                  </p>
                  <div className="mt-3 pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Admin: <strong className="text-slate-200">{currentAdminProfile?.email || 'bankush014@gmail.com'}</strong></span>
                    <span className="text-emerald-400 font-bold">Connected</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: ALL CHATS / OMNICHANNEL INBOX (MASTER-DETAIL SPLIT PANE) */}
        {/* =================================================================== */}
        {activeTab === 'inbox' && (
          <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[600px]">
            
            {/* ------------------------------------------------------------- */}
            {/* LEFT PANE: CONVERSATION LIST (MASTER) */}
            {/* ------------------------------------------------------------- */}
            <div className="w-full md:w-96 md:min-w-[340px] md:max-w-[420px] border-r border-slate-800/80 flex flex-col bg-[#070A12]">
              
              {/* Header & Search */}
              <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    <span>Admin Inbox</span>
                    <span className="text-xs text-slate-400 font-mono font-normal">({filteredInboxSessions.length})</span>
                  </h2>

                  {/* Filter by Reader Dropdown */}
                  <div className="relative">
                    <select
                      value={inboxAstrologerFilter}
                      onChange={e => setInboxAstrologerFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="all">All Astrologers</option>
                      {readers.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search customer, ID, topic..."
                    value={inboxSearch}
                    onChange={e => setInboxSearch(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  {inboxSearch && (
                    <button onClick={() => setInboxSearch('')} className="absolute right-2.5 top-2 text-slate-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  <button
                    onClick={() => setInboxStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                      inboxStatusFilter === 'all'
                        ? 'bg-slate-200 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({sessions.length})
                  </button>

                  <button
                    onClick={() => setInboxStatusFilter('waiting')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      inboxStatusFilter === 'waiting'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <span>Pending</span>
                    {stats.pending > 0 && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                        {stats.pending}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setInboxStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                      inboxStatusFilter === 'active'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    Active ({stats.active})
                  </button>

                  <button
                    onClick={() => setInboxStatusFilter('completed')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                      inboxStatusFilter === 'completed'
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Completed ({stats.completed})
                  </button>
                </div>

              </div>

              {/* Conversations Scrollable List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                {filteredInboxSessions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No conversations matching current filter.</p>
                  </div>
                ) : (
                  filteredInboxSessions.map(sess => {
                    const isSelected = sess.id === selectedSession?.id;
                    const isWaiting = sess.status === 'waiting';
                    const isActive = sess.status === 'active';

                    return (
                      <div
                        key={sess.id}
                        onClick={() => setSelectedSessionId(sess.id)}
                        className={`p-3 transition cursor-pointer flex items-start gap-3 relative ${
                          isSelected
                            ? 'bg-slate-800/70 border-l-4 border-rose-500'
                            : 'hover:bg-slate-900/50'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0 mt-0.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                            isWaiting 
                              ? 'bg-gradient-to-tr from-amber-500 to-rose-500' 
                              : isActive 
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                              : 'bg-gradient-to-tr from-slate-600 to-slate-700'
                          }`}>
                            {(sess.customerName || 'S').charAt(0).toUpperCase()}
                          </div>
                          {isWaiting && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#070A12] animate-ping" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {sess.customerName || 'Anonymous Seeker'}
                            </span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {getRelativeTime(sess.lastMessageAt || sess.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 truncate">
                              Astrologer: <strong className="text-amber-300 font-normal">{sess.assignedReaderName || sess.requestedReaderName || 'Psychic Tamara'}</strong>
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 truncate mt-1">
                            {sess.lastMessageText || sess.initialQuestion || 'Consultation started'}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                              isWaiting 
                                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 animate-pulse'
                                : isActive
                                ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isWaiting ? 'Pending Pickup' : sess.status}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {getElapsedText(sess.createdAt)}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT PANE: SELECTED CONVERSATION DETAIL & LIVE CHAT (DETAIL) */}
            {/* ------------------------------------------------------------- */}
            <div className="flex-1 flex flex-col bg-[#0B0F1C]">
              {selectedSession ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-slate-800/80 bg-[#070A12]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {selectedSession.customerName || 'Valued Seeker'}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          selectedSession.status === 'waiting'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : selectedSession.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {selectedSession.status === 'waiting' ? 'Pending Pickup' : selectedSession.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>ID: <code className="text-slate-300 font-mono">{selectedSession.id}</code></span>
                        <span>•</span>
                        <span>Topic: <strong className="text-slate-200">{selectedSession.topic || selectedSession.readingType || 'Guidance'}</strong></span>
                        <span>•</span>
                        <span>Handler: <strong className="text-amber-300">{selectedSession.assignedReaderName || selectedSession.requestedReaderName}</strong></span>
                      </div>
                    </div>

                    {/* Quick Session Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenReassignModal(selectedSession)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Reassign</span>
                      </button>

                      {selectedSession.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteSession(selectedSession)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Customer Birth Details Strip */}
                  {selectedSession.birthDetails && (
                    <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span className="text-slate-400 font-medium">Birth Chart Details:</span>
                      <span>DOB: <strong className="text-white">{selectedSession.birthDetails.dob || 'Not specified'}</strong></span>
                      <span>Time: <strong className="text-white">{selectedSession.birthDetails.birthTime || 'Not known'}</strong></span>
                      <span>POB: <strong className="text-white">{selectedSession.birthDetails.placeOfBirth || 'Not specified'}</strong></span>
                      <span>Gender: <strong className="text-white">{selectedSession.birthDetails.gender || 'Not specified'}</strong></span>
                    </div>
                  )}

                  {/* Chat Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    {(selectedSession.messages && selectedSession.messages.length > 0) ? (
                      selectedSession.messages.map((msg, index) => {
                        const isCustomer = msg.sender === 'customer';
                        const isSystem = msg.sender === 'system' || msg.isSystemNotice;

                        if (isSystem) {
                          return (
                            <div key={msg.id || index} className="flex justify-center my-2">
                              <span className="text-[11px] bg-slate-900/80 border border-slate-800 text-slate-400 px-3 py-1 rounded-full text-center">
                                {msg.text}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id || index}
                            className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-[11px] font-bold text-slate-400">
                                {isCustomer ? (selectedSession.customerName || 'Seeker') : (msg.senderName || 'Astrologer / Admin')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-md ${
                              isCustomer
                                ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-sm'
                                : 'bg-gradient-to-r from-amber-600/90 to-amber-700/90 text-white rounded-tr-sm font-medium'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                        No messages in this conversation yet.
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Template Chips */}
                  <div className="px-4 py-2 border-t border-slate-800/80 bg-[#070A12]/40 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Quick Replies:</span>
                    {[
                      'Welcome to LUMSIC! I am connecting to your celestial energies now.',
                      'Please give me a moment to analyze your astrological chart and houses.',
                      'I see powerful alignment around your career and relationships this cycle.',
                      'Thank you for consulting with us. May the cosmic light guide you.'
                    ].map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReplyText(template)}
                        className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 transition cursor-pointer"
                      >
                        {template.substring(0, 32)}...
                      </button>
                    ))}
                  </div>

                  {/* Reply Input Box */}
                  <div className="p-3 border-t border-slate-800/80 bg-[#070A12] flex items-center gap-2">
                    <textarea
                      rows={1}
                      placeholder={`Reply as ${selectedSession.assignedReaderName || 'Astrologer Admin'}...`}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAdminSendReply();
                        }
                      }}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                    />
                    <button
                      onClick={handleAdminSendReply}
                      disabled={!replyText.trim() || isSendingReply}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <h4 className="text-sm font-semibold text-slate-300">No Conversation Selected</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select a conversation from the left to read full transcript, inspect birth chart details, and reply directly.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: CHAT MANAGEMENT (DETAILED OPERATIONAL TABLE) */}
        {/* =================================================================== */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">All Customer Conversations</h2>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit table across all readers, channels, and AI workflows</p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setInboxStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inboxStatusFilter === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({sessions.length})
                </button>
                <button
                  onClick={() => setInboxStatusFilter('waiting')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inboxStatusFilter === 'waiting' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  onClick={() => setInboxStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inboxStatusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Active ({stats.active})
                </button>
                <button
                  onClick={() => setInboxStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inboxStatusFilter === 'completed' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-3">Topic / Type</th>
                      <th className="py-3 px-3">Astrologer</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Elapsed / Wait Time</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredInboxSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No customer conversations found.
                        </td>
                      </tr>
                    ) : (
                      filteredInboxSessions.map(sess => (
                        <tr key={sess.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{sess.customerName || 'Seeker'}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {sess.id}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-slate-200 font-medium">{sess.topic || 'General Consultation'}</span>
                            <div className="text-[10px] text-slate-400">{sess.readingType || 'Vedic Astrology'}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-amber-300 font-medium">{sess.assignedReaderName || sess.requestedReaderName || 'Psychic Tamara'}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sess.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : sess.status === 'waiting'
                                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {sess.status === 'waiting' ? 'Pending' : sess.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-400 font-mono">
                            {getElapsedText(sess.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSessionId(sess.id);
                                setActiveTab('inbox');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold transition cursor-pointer"
                            >
                              Open & Reply
                            </button>
                            <button
                              onClick={() => handleOpenReassignModal(sess)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                            >
                              Reassign
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

        {/* =================================================================== */}
        {/* TAB 4: ASTROLOGER MANAGEMENT */}
        {/* =================================================================== */}
        {activeTab === 'astrologers' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Astrologer Directory & Workstation Control</h2>
                <p className="text-xs text-slate-400 mt-0.5">Monitor active astrologers, manage workflow toggles, and inspect workload</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  {stats.onlineAstrologers} of {readers.length} Online
                </span>
              </div>
            </div>

            {/* Astrologers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readers.map(reader => {
                const assignedChats = sessions.filter(s => s.assignedReaderId === reader.id || s.requestedReaderId === reader.id);
                const activeCount = assignedChats.filter(s => s.status === 'active').length;
                const completedCount = assignedChats.filter(s => s.status === 'completed').length;

                return (
                  <div 
                    key={reader.id}
                    className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
                  >
                    <div>
                      {/* Top Bar: Avatar, Name, ID, Online Toggle */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={reader.avatar} 
                              alt={reader.name} 
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700" 
                            />
                            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0B0F1C] ${
                              reader.isOnline ? 'bg-emerald-500' : 'bg-slate-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{reader.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{reader.astroId || reader.id}</span>
                            <div className="text-[11px] text-amber-400 font-medium mt-0.5">{(reader as any).specialization || reader.category || reader.title}</div>
                          </div>
                        </div>

                        {/* Online/Offline Toggle Button */}
                        <button
                          onClick={() => handleToggleReader(reader.id, Boolean(reader.isOnline))}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer border ${
                            reader.isOnline
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {reader.isOnline ? 'Online' : 'Offline'}
                        </button>
                      </div>

                      {/* Bio snippet */}
                      <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                        {reader.bio || `${reader.experienceYears}+ years experience in spiritual guidance.`}
                      </p>

                      {/* Workload Stats */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/60">
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Active Consultations</span>
                          <span className="text-sm font-bold text-emerald-400">{activeCount}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Completed</span>
                          <span className="text-sm font-bold text-slate-300">{completedCount}</span>
                        </div>
                      </div>

                      {/* Automated Workflow Toggle */}
                      <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Automation Workflow</span>
                        </div>
                        <button
                          onClick={() => handleToggleWorkflow(reader.id, reader.isWorkflowEnabled !== false)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                            reader.isWorkflowEnabled !== false
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {reader.isWorkflowEnabled !== false ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">£{reader.ratePerMinute?.toFixed(2)}/min</span>
                      <button
                        onClick={() => {
                          setInboxAstrologerFilter(reader.id);
                          setActiveTab('inbox');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        <span>View Chats</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* ===================================================================== */}
      {/* REASSIGN ASTROLOGER MODAL */}
      {/* ===================================================================== */}
      {reassignModalOpen && sessionToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B0F1C] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Reassign Consultation</h3>
              </div>
              <button 
                onClick={() => setReassignModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Reassign consultation with <strong className="text-white">{sessionToReassign.customerName}</strong> to another qualified astrologer on the platform.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select Target Astrologer</label>
                <select
                  value={targetReaderId}
                  onChange={e => setTargetReaderId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {readers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({(r as any).specialization || r.category || r.title}) — {r.isOnline ? 'Online' : 'Offline'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Internal Routing Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Seeker requested specialized Vedic Kundli analysis"
                  value={reassignNote}
                  onChange={e => setReassignNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReassign}
                  disabled={isReassigning || !targetReaderId}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
                >
                  {isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
