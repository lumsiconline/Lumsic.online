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
  Phone, 
  PhoneOff, 
  Menu,
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

const DECLINED_STORAGE_KEY = 'lumsic_declined_sessions_v1';

export const AdminCMSPanel: React.FC<AdminCMSPanelProps> = ({
  onBackToSite,
  initialTab = 'inbox',
  currentAdminProfile
}) => {
  // Navigation tabs: 'overview' | 'inbox' | 'chats' | 'astrologers'
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'chats' | 'astrologers'>(() => {
    if (initialTab === 'overview') return 'overview';
    if (initialTab === 'astrologers') return 'astrologers';
    if (initialTab === 'chats') return 'chats';
    return 'inbox';
  });

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Master State
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [readers, setReaders] = useState<Reader[]>(READERS);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Declined Sessions tracking so declined chats NEVER popup again
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(DECLINED_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Incoming Chat Popup Queue & Active Alert
  const [incomingAlertSession, setIncomingAlertSession] = useState<ConsultationSession | null>(null);
  const isRingingRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filters & Search
  const [inboxSearch, setInboxSearch] = useState<string>('');
  const [inboxStatusFilter, setInboxStatusFilter] = useState<'all' | 'waiting' | 'active' | 'completed' | 'cancelled'>('all');
  const [inboxAstrologerFilter, setInboxAstrologerFilter] = useState<string>('all');
  
  // Chat Reply State
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Sound Controller: strictly plays loop ONLY while incoming popup is active
  const startRingtone = () => {
    if (!soundEnabled || isRingingRef.current) return;
    try {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        isRingingRef.current = true;
      }
    } catch {}
  };

  const stopRingtone = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch {}
    isRingingRef.current = false;
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
  // MASTER DATA FETCHING: Server Inbox API + Firestore + Local Storage
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

      // 2. Fetch central admin inbox from server
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
  // REAL-TIME SYNCHRONIZATION: Firestore onSnapshot + Incoming Pop-up Trigger
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
              map.set(s.id, { ...(existing || {}), ...s });
            });

            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
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
      stopRingtone();
    };
  }, []);

  // =========================================================================
  // INCOMING CHAT POPUP & RINGING TRIGGER
  // =========================================================================
  // Check for any unhandled 'waiting' sessions that are NOT in declinedIds
  useEffect(() => {
    const unhandledWaiting = sessions.find(
      s => s.status === 'waiting' && !declinedIds.has(s.id)
    );

    if (unhandledWaiting) {
      if (!incomingAlertSession || incomingAlertSession.id !== unhandledWaiting.id) {
        setIncomingAlertSession(unhandledWaiting);
        startRingtone();
      }
    } else {
      if (incomingAlertSession) {
        setIncomingAlertSession(null);
        stopRingtone();
      }
    }
  }, [sessions, declinedIds, incomingAlertSession]);

  // Auto-scroll chat history on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, selectedSessionId]);

  // KPIs Computation
  const stats = useMemo(() => {
    const total = sessions.length;
    const active = sessions.filter(s => s.status === 'active').length;
    const pending = sessions.filter(s => s.status === 'waiting' && !declinedIds.has(s.id)).length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const declined = sessions.filter(s => s.status === 'cancelled' || declinedIds.has(s.id)).length;
    const onlineAstrologers = readers.filter(r => r.isOnline).length;
    const uniqueCustomers = new Set(sessions.map(s => s.customerId || s.customerName)).size;

    return { total, active, pending, completed, declined, onlineAstrologers, uniqueCustomers };
  }, [sessions, readers, declinedIds]);

  // Selected Conversation Object
  const selectedSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || sessions[0] || null;
  }, [sessions, selectedSessionId]);

  // Filtered Conversations for Inbox List
  const filteredInboxSessions = useMemo(() => {
    return sessions.filter(s => {
      const isDeclined = s.status === 'cancelled' || declinedIds.has(s.id);
      
      // 1. Status Filter
      if (inboxStatusFilter === 'waiting') {
        if (s.status !== 'waiting' || isDeclined) return false;
      } else if (inboxStatusFilter === 'active') {
        if (s.status !== 'active') return false;
      } else if (inboxStatusFilter === 'completed') {
        if (s.status !== 'completed') return false;
      } else if (inboxStatusFilter === 'cancelled') {
        if (!isDeclined) return false;
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
  }, [sessions, inboxStatusFilter, inboxAstrologerFilter, inboxSearch, declinedIds]);

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
  // ACTIONS: ACCEPT & ATTEND INCOMING CHAT (STOPS SOUND & OPENS CHAT)
  // =========================================================================
  const handleAcceptIncomingChat = async (targetSession: ConsultationSession) => {
    // 1. Immediately stop the ringtone sound
    stopRingtone();
    setIncomingAlertSession(null);

    const activeReaderName = targetSession.requestedReaderName || targetSession.assignedReaderName || 'Astrologer';
    const acceptNotice: ChatMessage = {
      id: 'sys_accept_' + Date.now(),
      sessionId: targetSession.id,
      sender: 'system',
      senderName: 'LUMSIC System',
      text: `${activeReaderName} has attended and joined your consultation.`,
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    };

    const updatedSession: ConsultationSession = {
      ...targetSession,
      status: 'active',
      acceptedAt: new Date().toISOString(),
      unreadForOperator: false,
      messages: [...(targetSession.messages || []), acceptNotice]
    };

    // 2. Update local state & select for active chat
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setSelectedSessionId(updatedSession.id);
    setActiveTab('inbox');
    saveStoredSession(updatedSession);
    broadcastSessionEvent('session_accepted', updatedSession);

    // 3. Write directly to Firestore (User sees reader joined instantly)
    try {
      await setDoc(doc(db, 'sessions', updatedSession.id), updatedSession, { merge: true });
    } catch (err) {
      console.warn('Firestore accept notice:', err);
    }

    // 4. Update backend
    try {
      await adminFetch(`/api/sessions/${updatedSession.id}/accept`, {
        method: 'POST',
        body: JSON.stringify({
          readerId: updatedSession.assignedReaderId || updatedSession.requestedReaderId,
          readerName: activeReaderName
        })
      });
    } catch {}

    showToast(`Attended chat with ${targetSession.customerName}!`);
  };

  // =========================================================================
  // ACTIONS: DECLINE INCOMING CHAT (STOPS SOUND & NEVER SHOWS POPUP AGAIN)
  // =========================================================================
  const handleDeclineIncomingChat = async (targetSession: ConsultationSession) => {
    // 1. Immediately stop the ringtone sound
    stopRingtone();
    setIncomingAlertSession(null);

    // 2. Mark this session as declined permanently so it NEVER pops up again
    setDeclinedIds(prev => {
      const next = new Set(prev);
      next.add(targetSession.id);
      try {
        localStorage.setItem(DECLINED_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    const updatedSession: ConsultationSession = {
      ...targetSession,
      status: 'cancelled',
      endedAt: new Date().toISOString()
    };

    // 3. Update local state
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    saveStoredSession(updatedSession);
    broadcastSessionEvent('session_declined', updatedSession);

    // 4. Update Firestore & Server
    try {
      await setDoc(doc(db, 'sessions', targetSession.id), { status: 'cancelled' }, { merge: true });
    } catch {}

    try {
      await adminFetch(`/api/sessions/${targetSession.id}/decline`, { method: 'POST' });
    } catch {}

    showToast(`Consultation request from ${targetSession.customerName} declined.`, 'info');
  };

  // =========================================================================
  // ACTIONS: Admin Send Reply, Reassign, Complete
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

    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    saveStoredSession(updatedSession);
    broadcastSessionEvent('message_received', newMsg);
    broadcastSessionEvent('session_accepted', updatedSession);

    try {
      await setDoc(doc(db, 'sessions', updatedSession.id), updatedSession, { merge: true });
    } catch (err) {
      console.warn('Firestore reply sync notice:', err);
    }

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
    <div className="h-screen w-screen overflow-hidden bg-[#070A12] text-slate-100 flex font-sans selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* Audio element for continuous incoming chat ringtone */}
      <audio 
        ref={audioRef} 
        src="/assets/aistudio/mixkit-marimba-waiting-ringtone-1360_715cddd4.wav" 
        preload="auto" 
      />

      {/* ===================================================================== */}
      {/* LEFT SIDEBAR: ALL COLUMNS AND SUB-HEADERS PROPERLY ASSIGNED ON LEFT */}
      {/* ===================================================================== */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B0F1C] border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        
        {/* Top: Logo & Main Navigation Links */}
        <div className="flex flex-col">
          
          {/* Logo & Platform Status */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#070A12] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black tracking-wider text-base text-white">LUMSIC</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Admin
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="text-emerald-400 font-medium">Live Universal Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Command Menu
            </div>

            {/* 1. Overview Tab */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === 'overview' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {stats.total}
              </span>
            </button>

            {/* 2. All Chats / Inbox Tab */}
            <button
              onClick={() => {
                setActiveTab('inbox');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'inbox'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-md shadow-rose-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>All Chats / Inbox</span>
              </div>
              {stats.pending > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse shadow-sm">
                  {stats.pending}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">
                  {sessions.length}
                </span>
              )}
            </button>

            {/* 3. Chat Management Tab */}
            <button
              onClick={() => {
                setActiveTab('chats');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'chats'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4" />
                <span>Chat Management</span>
              </div>
            </button>

            {/* 4. Astrologers Management Tab */}
            <button
              onClick={() => {
                setActiveTab('astrologers');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'astrologers'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Astrologers</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                {stats.onlineAstrologers} Online
              </span>
            </button>

          </nav>

        </div>

        {/* Bottom Sidebar: Controls & Admin Identity */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          
          {/* Sound Notification Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>Ringtone Alerts</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                soundEnabled 
                  ? 'bg-amber-400 text-slate-950' 
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync Live Data</span>
          </button>

          {/* Back to Website */}
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800/60 transition cursor-pointer"
          >
            <span>Back to Public Website</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Admin Profile & Logout */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between px-1">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-slate-500 block truncate">Administrator</span>
              <span className="text-xs font-semibold text-slate-200 block truncate">
                {currentAdminProfile?.email || 'bankush014@gmail.com'}
              </span>
            </div>
            <button
              onClick={async () => {
                await signOutCurrentUser().catch(() => {});
                localStorage.removeItem('lumsic_admin_token');
                sessionStorage.removeItem('lumsic_admin_token');
                window.location.reload();
              }}
              title="Sign Out Admin"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ===================================================================== */}
      {/* MAIN CONTENT AREA: OPENS IN THE REST OF THE SCREEN */}
      {/* ===================================================================== */}
      <main className="flex-1 h-screen flex flex-col min-w-0 bg-[#070A12] overflow-hidden">
        
        {/* Mobile Header Bar (shows hamburger toggle on small screens) */}
        <div className="md:hidden flex items-center justify-between p-3 bg-[#0B0F1C] border-b border-slate-800 shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif font-black tracking-wider text-sm text-white">LUMSIC COMMAND</span>
          {stats.pending > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black animate-pulse">
              {stats.pending} New
            </span>
          )}
        </div>

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

        {/* =================================================================== */}
        {/* SECTION 1: OVERVIEW */}
        {/* =================================================================== */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Header Title */}
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Executive Dashboard Overview</h1>
              <p className="text-xs text-slate-400 mt-1">Platform analytics, active customer consultations, and live astrologer workload</p>
            </div>

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

              <div className="bg-[#0B0F1C] border border-emerald-900/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
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

              <div className="bg-[#0B0F1C] border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
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
                <span className="text-[11px] font-medium text-slate-400">Declined</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-rose-400">{stats.declined}</span>
                  <PhoneOff className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Declined requests</span>
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

            {/* Recent Consultations Feed */}
            <div className="bg-[#0B0F1C] border border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Customer Consultations</h3>
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
                {sessions.slice(0, 8).map(sess => {
                  const isDeclined = sess.status === 'cancelled' || declinedIds.has(sess.id);
                  return (
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
                              isDeclined
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : sess.status === 'active' 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : sess.status === 'waiting'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isDeclined ? 'Declined' : sess.status === 'waiting' ? 'Pending' : sess.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {sess.lastMessageText || sess.topic || 'General Consultation'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-amber-300 font-medium">
                          {sess.requestedReaderName || sess.assignedReaderName || 'Psychic Tamara'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {getRelativeTime(sess.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION 2: ALL CHATS / INBOX (SPLIT-PANE FULL HEIGHT) */}
        {/* =================================================================== */}
        {activeTab === 'inbox' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            
            {/* Left Pane: Conversations List */}
            <div className="w-full md:w-96 md:min-w-[340px] md:max-w-[400px] border-r border-slate-800 flex flex-col bg-[#070A12] h-full overflow-hidden">
              
              {/* Header & Search */}
              <div className="p-3 border-b border-slate-800 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    <span>Admin Inbox</span>
                    <span className="text-xs text-slate-400 font-mono font-normal">({filteredInboxSessions.length})</span>
                  </h2>

                  {/* Filter by Reader Dropdown */}
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
                    Completed
                  </button>

                  <button
                    onClick={() => setInboxStatusFilter('cancelled')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                      inboxStatusFilter === 'cancelled'
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    Declined ({stats.declined})
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
                    const isDeclined = sess.status === 'cancelled' || declinedIds.has(sess.id);
                    const isWaiting = sess.status === 'waiting' && !isDeclined;
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
                            isDeclined
                              ? 'bg-rose-900/80 text-rose-300'
                              : isWaiting 
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
                              Astrologer: <strong className="text-amber-300 font-normal">{sess.requestedReaderName || sess.assignedReaderName || 'Psychic Tamara'}</strong>
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 truncate mt-1">
                            {sess.lastMessageText || sess.initialQuestion || 'Consultation started'}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                              isDeclined
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : isWaiting 
                                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 animate-pulse'
                                : isActive
                                ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isDeclined ? 'Declined' : isWaiting ? 'Pending Pickup' : sess.status}
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

            {/* Right Pane: Selected Conversation Transcript & Live Reply Box */}
            <div className="flex-1 flex flex-col bg-[#0B0F1C] h-full overflow-hidden">
              {selectedSession ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-3.5 border-b border-slate-800 bg-[#070A12]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {selectedSession.customerName || 'Valued Seeker'}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          selectedSession.status === 'cancelled' || declinedIds.has(selectedSession.id)
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : selectedSession.status === 'waiting'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : selectedSession.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {selectedSession.status === 'cancelled' || declinedIds.has(selectedSession.id) 
                            ? 'Declined' 
                            : selectedSession.status === 'waiting' 
                            ? 'Pending Pickup' 
                            : selectedSession.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>ID: <code className="text-slate-300 font-mono">{selectedSession.id}</code></span>
                        <span>•</span>
                        <span>Topic: <strong className="text-slate-200">{selectedSession.topic || selectedSession.readingType || 'Guidance'}</strong></span>
                        <span>•</span>
                        <span>Astrologer: <strong className="text-amber-300">{selectedSession.requestedReaderName || selectedSession.assignedReaderName}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedSession.status === 'waiting' && !declinedIds.has(selectedSession.id) && (
                        <button
                          onClick={() => handleAcceptIncomingChat(selectedSession)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Accept & Attend</span>
                        </button>
                      )}

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
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Birth Details Strip */}
                  {selectedSession.birthDetails && (
                    <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-300 shrink-0">
                      <span className="text-slate-400 font-medium">Birth Chart:</span>
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
                  <div className="px-4 py-2 border-t border-slate-800 bg-[#070A12]/40 flex items-center gap-2 overflow-x-auto shrink-0">
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
                  <div className="p-3 border-t border-slate-800 bg-[#070A12] flex items-center gap-2 shrink-0">
                    <textarea
                      rows={1}
                      placeholder={`Reply as ${selectedSession.assignedReaderName || selectedSession.requestedReaderName || 'Astrologer'}...`}
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
        {/* SECTION 3: CHAT MANAGEMENT (DETAILED TABLE VIEW) */}
        {/* =================================================================== */}
        {activeTab === 'chats' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Chat Management & Audit</h1>
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
                <button
                  onClick={() => setInboxStatusFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inboxStatusFilter === 'cancelled' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Declined ({stats.declined})
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
                      filteredInboxSessions.map(sess => {
                        const isDeclined = sess.status === 'cancelled' || declinedIds.has(sess.id);
                        return (
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
                              <span className="text-amber-300 font-medium">{sess.requestedReaderName || sess.assignedReaderName || 'Psychic Tamara'}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isDeclined
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : sess.status === 'active'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : sess.status === 'waiting'
                                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 animate-pulse'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {isDeclined ? 'Declined' : sess.status === 'waiting' ? 'Pending' : sess.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-400 font-mono">
                              {getElapsedText(sess.createdAt)}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              {sess.status === 'waiting' && !isDeclined && (
                                <button
                                  onClick={() => handleAcceptIncomingChat(sess)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                                >
                                  Accept
                                </button>
                              )}
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION 4: ASTROLOGER MANAGEMENT */}
        {/* =================================================================== */}
        {activeTab === 'astrologers' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Astrologer Directory & Workstation Control</h1>
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
      {/* HIGH PRIORITY INCOMING CHAT POP-UP MODAL (RINGS CONTINUOUSLY) */}
      {/* ===================================================================== */}
      {incomingAlertSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#0B0F1C] border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl shadow-amber-500/20 relative overflow-hidden">
            
            {/* Pulsing Alert Top Ribbon */}
            <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 p-2.5 -mx-6 -mt-6 mb-5 flex items-center justify-center gap-2 text-slate-950 font-black text-xs uppercase tracking-wider animate-pulse">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
              </span>
              <span>Incoming Consultation Request • Ringing Live</span>
            </div>

            {/* Customer & Astrologer Details */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shrink-0">
                {(incomingAlertSession.customerName || 'S').charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white tracking-tight truncate">
                    {incomingAlertSession.customerName || 'Valued Seeker'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Live Seeker
                  </span>
                </div>
                
                <div className="text-xs text-slate-400 mt-0.5">
                  ID: <code className="text-slate-300 font-mono">{incomingAlertSession.id}</code>
                </div>

                <div className="mt-1 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Requested: <strong className="text-white">{incomingAlertSession.requestedReaderName || incomingAlertSession.assignedReaderName || 'Astrologer'}</strong></span>
                </div>
              </div>
            </div>

            {/* Consultation Topic & Details Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 mb-5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Topic: <strong className="text-slate-200">{incomingAlertSession.topic || 'General Reading'}</strong></span>
                <span className="font-mono text-amber-400 font-bold">Wait: {getElapsedText(incomingAlertSession.createdAt)}</span>
              </div>
              
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-300 italic line-clamp-3">
                "{incomingAlertSession.initialQuestion || incomingAlertSession.lastMessageText || 'Hello, I am seeking spiritual guidance today.'}"
              </div>

              {incomingAlertSession.birthDetails && (
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  <span>DOB: <strong className="text-slate-300">{incomingAlertSession.birthDetails.dob || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Time: <strong className="text-slate-300">{incomingAlertSession.birthDetails.birthTime || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Place: <strong className="text-slate-300">{incomingAlertSession.birthDetails.placeOfBirth || 'N/A'}</strong></span>
                </div>
              )}
            </div>

            {/* Accept & Decline Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDeclineIncomingChat(incomingAlertSession)}
                className="py-3 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Decline Request</span>
              </button>

              <button
                onClick={() => handleAcceptIncomingChat(incomingAlertSession)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Accept & Attend</span>
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-500 mt-3">
              Sound will stop immediately upon accepting or declining. Declined chats will not ring or popup again.
            </div>

          </div>
        </div>
      )}

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
