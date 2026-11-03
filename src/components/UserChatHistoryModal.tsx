import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, 
  MessageSquare, 
  Lock, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Sparkles, 
  Phone, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ConsultationSession, CustomerProfile, ChatMessage } from '../types';
import { getStoredSessions, deduplicateMessages } from '../utils/sessionSync';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface UserChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: CustomerProfile;
  onOpenLogin: () => void;
  onOpenSession?: (session: ConsultationSession) => void;
}

export const UserChatHistoryModal: React.FC<UserChatHistoryModalProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  onOpenLogin,
  onOpenSession
}) => {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [inspectingSession, setInspectingSession] = useState<ConsultationSession | null>(null);

  // Derive phone number reliably from user profile or local storage
  const activePhone = useMemo(() => {
    const raw = user.phone || 
      (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone')) : '') || 
      '';
    return raw.trim();
  }, [user.phone]);

  const activePhoneDigits = useMemo(() => {
    return activePhone.replace(/\D/g, '');
  }, [activePhone]);

  const activeName = useMemo(() => {
    return (user.name && user.name.trim()) || 
      (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name')) : '') || 
      'Seeker';
  }, [user.name]);

  // Load user sessions when modal is open and user is authenticated
  const loadChatHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);

    try {
      const sessionMap = new Map<string, ConsultationSession>();

      // 1. Local storage resilient sessions
      const localSessions = getStoredSessions();
      localSessions.forEach(s => {
        if (!s || !s.id) return;
        const matchesPhone = Boolean(
          activePhoneDigits && 
          s.customerPhone && 
          (s.customerPhone.replace(/\D/g, '').includes(activePhoneDigits) || 
           activePhoneDigits.includes(s.customerPhone.replace(/\D/g, '')) ||
           s.customerPhone.replace(/\D/g, '').slice(-10) === activePhoneDigits.slice(-10))
        );
        const matchesId = Boolean(user.id && s.customerId === user.id);
        const matchesName = Boolean(activeName && s.customerName && s.customerName.toLowerCase() === activeName.toLowerCase());

        if (matchesPhone || matchesId || (matchesName && !s.customerPhone)) {
          sessionMap.set(s.id, s);
        }
      });

      // 2. Fetch from backend API
      try {
        const queryParams = new URLSearchParams();
        if (activePhone) queryParams.set('phone', activePhone);
        if (user.id) queryParams.set('customerId', user.id);
        if (user.email) queryParams.set('email', user.email);

        const res = await fetch(`/api/user/chat-history?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.sessions)) {
            data.sessions.forEach((s: ConsultationSession) => {
              if (s && s.id) {
                const existing = sessionMap.get(s.id);
                sessionMap.set(s.id, {
                  ...(existing || {}),
                  ...s,
                  messages: deduplicateMessages(s.messages || existing?.messages || [])
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn('Backend chat history fetch notice:', err);
      }

      // 3. Fallback to Firestore sessions
      try {
        const firestoreSnap = await getDocs(collection(db, 'sessions'));
        firestoreSnap.forEach(d => {
          const s = d.data() as ConsultationSession;
          if (!s || !s.id) return;

          const sDigits = (s.customerPhone || '').replace(/\D/g, '');
          const phoneMatched = Boolean(
            activePhoneDigits && sDigits && 
            (sDigits === activePhoneDigits || 
             sDigits.endsWith(activePhoneDigits) || 
             activePhoneDigits.endsWith(sDigits) ||
             sDigits.slice(-10) === activePhoneDigits.slice(-10))
          );
          const idMatched = Boolean(user.id && s.customerId === user.id);

          if (phoneMatched || idMatched) {
            const existing = sessionMap.get(s.id);
            sessionMap.set(s.id, {
              ...(existing || {}),
              ...s,
              messages: deduplicateMessages(s.messages || existing?.messages || [])
            });
          }
        });
      } catch (fsErr) {
        console.warn('Firestore chat history fetch notice:', fsErr);
      }

      const list = Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setSessions(list);
    } catch (error) {
      console.warn('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, activePhone, activePhoneDigits, activeName, user.id, user.email]);

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        loadChatHistory();
      }
      setInspectingSession(null);
    }
  }, [isOpen, isAuthenticated, loadChatHistory]);

  if (!isOpen) return null;

  // Filtered sessions
  const filteredSessions = sessions.filter(session => {
    // Tab filter
    if (selectedFilter === 'active' && session.status !== 'active' && session.status !== 'waiting') {
      return false;
    }
    if (selectedFilter === 'completed' && session.status !== 'completed' && session.status !== 'cancelled') {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const readerName = (session.assignedReaderName || session.requestedReaderName || '').toLowerCase();
      const topic = (session.topic || '').toLowerCase();
      const msgMatch = (session.messages || []).some(m => (m.text || '').toLowerCase().includes(query));
      return readerName.includes(query) || topic.includes(query) || msgMatch;
    }
    return true;
  });

  const activeCount = sessions.filter(s => s.status === 'active' || s.status === 'waiting').length;
  const completedCount = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#1C162E] via-[#140F24] to-[#0D0A18] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200"
      >
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {inspectingSession ? (
              <button
                type="button"
                onClick={() => setInspectingSession(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#1C162E] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-300" />
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-200 flex items-center gap-2">
                <span>{inspectingSession ? inspectingSession.assignedReaderName || 'Consultation Archive' : 'Chat History'}</span>
                {!inspectingSession && (
                  <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Past Consultations
                  </span>
                )}
              </h2>
              <p className="text-xs text-purple-300/80 font-medium">
                {inspectingSession 
                  ? `${new Date(inspectingSession.createdAt || Date.now()).toLocaleDateString()} • ${inspectingSession.topic || 'Intuitive Guidance'}`
                  : (isAuthenticated 
                      ? (activePhone ? `Registered with ${activePhone}` : `Seeker: ${activeName}`) 
                      : 'Sign in to access your previous astrological readings')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && !inspectingSession && (
              <button
                type="button"
                onClick={loadChatHistory}
                disabled={isLoading}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                title="Refresh chat history"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 hover:text-rose-200 text-gray-400 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CASE 1: USER NOT AUTHENTICATED -> MANDATORY PHONE LOGIN GATE */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center overflow-y-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-purple-600/30 to-amber-300/20 border border-amber-400/40 p-1 flex items-center justify-center shadow-xl shadow-amber-950/40 mb-5">
              <div className="w-full h-full rounded-[20px] bg-[#181226] flex items-center justify-center">
                <Lock className="w-9 h-9 text-amber-300" />
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Login Required
            </span>

            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white mb-2">
              Access Your Chat History
            </h3>
            
            <p className="text-sm text-purple-200/80 max-w-md leading-relaxed mb-6">
              Chat history is securely tied to your phone number. Please log in with the same mobile number you used earlier during your consultations to view all your previous messages and astrologer transcripts.
            </p>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="w-full max-w-sm py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.98] text-gray-950 font-extrabold text-base shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
            >
              <Phone className="w-4 h-4" />
              <span>Sign In with Mobile Number</span>
            </button>

            <div className="mt-6 flex items-center gap-2 text-xs text-purple-300/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>All consultations linked to your number will automatically appear</span>
            </div>
          </div>
        ) : inspectingSession ? (
          /* ========================================================================= */
          /* CASE 2: INSPECTING A SINGLE CHAT TRANSCRIPT */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Session Summary Banner */}
            <div className="p-3 sm:p-4 bg-purple-950/40 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {inspectingSession.readerAvatar ? (
                  <img
                    src={inspectingSession.readerAvatar}
                    alt={inspectingSession.assignedReaderName}
                    className="w-11 h-11 rounded-2xl object-cover border border-amber-400/40 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-purple-800 flex items-center justify-center font-bold text-amber-300 shrink-0">
                    {inspectingSession.assignedReaderName?.slice(0, 1) || 'A'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">
                      {inspectingSession.assignedReaderName || 'Astrologer'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      inspectingSession.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : inspectingSession.status === 'waiting'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-white/10 text-gray-300 border border-white/10'
                    }`}>
                      {inspectingSession.status}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/70 truncate">
                    Topic: {inspectingSession.topic || 'General Guidance'} • {inspectingSession.messages?.length || 0} messages
                  </p>
                </div>
              </div>

              {/* Action to jump to live chat if active */}
              {(inspectingSession.status === 'active' || inspectingSession.status === 'waiting') && onOpenSession && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSession(inspectingSession);
                  }}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-gray-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Continue Live Chat</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable Message History Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-[#130E22] to-[#0A0713]">
              {/* Birth Chart Intake Card */}
              {inspectingSession.birthDetails && (
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Consultation Intake Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-purple-200/90 pt-1">
                    <div><span className="text-purple-300/60">Name:</span> {inspectingSession.birthDetails.name || inspectingSession.customerName}</div>
                    <div><span className="text-purple-300/60">Gender:</span> {inspectingSession.birthDetails.gender || 'Not specified'}</div>
                    <div><span className="text-purple-300/60">DOB:</span> {inspectingSession.birthDetails.dob || 'Not specified'}</div>
                    <div><span className="text-purple-300/60">Birth Time:</span> {inspectingSession.birthDetails.birthTime || 'Not specified'}</div>
                    {inspectingSession.birthDetails.placeOfBirth && (
                      <div className="col-span-2"><span className="text-purple-300/60">POB:</span> {inspectingSession.birthDetails.placeOfBirth}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Messages list */}
              {(!inspectingSession.messages || inspectingSession.messages.length === 0) ? (
                <div className="text-center py-8 text-xs text-purple-300/60">
                  No chat messages recorded in this consultation archive.
                </div>
              ) : (
                inspectingSession.messages.map((msg: ChatMessage, idx: number) => {
                  const isUser = msg.sender === 'customer';
                  const isSystem = msg.sender === 'system' || msg.isSystemNotice;

                  if (isSystem) {
                    return (
                      <div key={msg.id || idx} className="text-center my-2">
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[11px] text-purple-200/80 font-medium">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                        {!isUser && (
                          inspectingSession.readerAvatar ? (
                            <img
                              src={inspectingSession.readerAvatar}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-purple-700 text-amber-200 text-xs flex items-center justify-center font-bold shrink-0 mb-1">
                              A
                            </div>
                          )
                        )}
                        <div
                          className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white rounded-br-xs shadow-md shadow-purple-950/40'
                              : 'bg-white text-gray-950 rounded-bl-xs shadow-md shadow-black/20 font-medium whitespace-pre-wrap'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                      <span className="text-[10px] text-purple-300/50 mt-1 px-1">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASE 3: AUTHENTICATED -> LIST OF PAST CHATS */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="p-3 sm:p-4 bg-white/5 border-b border-white/10 space-y-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-purple-300/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search past chats by astrologer or topic..."
                    className="w-full bg-black/40 text-white pl-9.5 pr-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 text-xs font-medium placeholder:text-gray-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter('all')}
                    className={`py-1 px-2.5 rounded-lg font-bold transition-all ${
                      selectedFilter === 'all'
                        ? 'bg-amber-400 text-gray-950 shadow-xs'
                        : 'text-purple-200/80 hover:text-white'
                    }`}
                  >
                    All ({sessions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter('active')}
                    className={`py-1 px-2.5 rounded-lg font-bold transition-all ${
                      selectedFilter === 'active'
                        ? 'bg-emerald-400 text-gray-950 shadow-xs'
                        : 'text-purple-200/80 hover:text-white'
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter('completed')}
                    className={`py-1 px-2.5 rounded-lg font-bold transition-all ${
                      selectedFilter === 'completed'
                        ? 'bg-purple-400 text-gray-950 shadow-xs'
                        : 'text-purple-200/80 hover:text-white'
                    }`}
                  >
                    Done ({completedCount})
                  </button>
                </div>
              </div>

              {/* Verified Phone Chip */}
              {activePhone && (
                <div className="flex items-center justify-between text-[11px] text-purple-300/80 bg-purple-950/30 px-3 py-1.5 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Linked Phone: <strong className="text-amber-200 font-mono">{activePhone}</strong></span>
                  </div>
                  <span className="text-purple-300/60">Auto-synced</span>
                </div>
              )}
            </div>

            {/* Sessions List */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2.5 bg-gradient-to-b from-[#130E22] to-[#0A0713]">
              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-purple-200/70 font-medium">Fetching your consultation records...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="py-14 px-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-purple-300/50">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">No Consultations Found</h4>
                    <p className="text-xs text-purple-200/70 max-w-sm mx-auto mt-1">
                      {searchQuery
                        ? 'No chats matched your search term.'
                        : `No past consultations recorded under ${activePhone || activeName} yet.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-gray-950 font-extrabold text-xs shadow-lg transition-all hover:brightness-110 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start a New Consultation</span>
                  </button>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const readerName = session.assignedReaderName || session.requestedReaderName || 'Astrologer';
                  const dateStr = session.createdAt 
                    ? new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent';
                  const timeStr = session.createdAt 
                    ? new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';
                  const msgCount = session.messages?.length || 0;
                  const lastMessage = session.messages && session.messages.length > 0
                    ? session.messages[session.messages.length - 1]
                    : null;

                  const isActive = session.status === 'active' || session.status === 'waiting';

                  return (
                    <div
                      key={session.id}
                      onClick={() => setInspectingSession(session)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-purple-900/20 border-emerald-500/40 hover:border-emerald-400 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {session.readerAvatar ? (
                            <img
                              src={session.readerAvatar}
                              alt={readerName}
                              className="w-11 h-11 rounded-2xl object-cover border border-amber-400/30 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-700 flex items-center justify-center font-bold text-amber-300 text-sm shrink-0">
                              {readerName.slice(0, 1)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors truncate">
                                {readerName}
                              </h4>
                              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                session.status === 'active'
                                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                                  : session.status === 'waiting'
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : 'bg-white/10 text-gray-300'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                            <p className="text-xs text-purple-300/70 truncate mt-0.5">
                              {session.topic || session.readingType || 'Guidance Consultation'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-semibold text-purple-200/80 block">
                            {dateStr}
                          </span>
                          <span className="text-[10px] text-purple-300/50 block font-mono">
                            {timeStr}
                          </span>
                        </div>
                      </div>

                      {/* Last Message Preview */}
                      {lastMessage && (
                        <div className="bg-black/30 px-3 py-2 rounded-xl text-xs text-purple-200/90 truncate flex items-center justify-between gap-2 border border-white/5">
                          <span className="truncate">
                            <strong className="text-amber-300/90 font-medium">
                              {lastMessage.sender === 'customer' ? 'You' : readerName}:
                            </strong>{' '}
                            {lastMessage.text}
                          </span>
                          <span className="text-[10px] text-purple-300/60 font-mono shrink-0">
                            {msgCount} msgs
                          </span>
                        </div>
                      )}

                      {/* Bottom action row */}
                      <div className="flex items-center justify-between text-xs text-amber-300/90 font-bold pt-1">
                        <span className="text-[11px] text-purple-300/70 font-normal">
                          Tap to view full dialogue transcript
                        </span>
                        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>View Chat</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
