import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ConsultationSession, ChatMessage, Reader } from '../types';
import { 
  getStoredSessions, 
  saveStoredSession, 
  appendMessageToStoredSession, 
  broadcastSessionEvent, 
  SESSIONS_CHANNEL_NAME 
} from '../utils/sessionSync';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { 
  Send, 
  X, 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Clock, 
  Shield, 
  CheckCheck, 
  Check, 
  Compass, 
  User, 
  Calendar, 
  MapPin, 
  Info, 
  Heart, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  ThumbsUp,
  Award,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Smile
} from 'lucide-react';

interface LiveChatViewProps {
  session: ConsultationSession;
  reader: Reader;
  onSendMessage: (text: string) => Promise<ChatMessage | undefined | null | void> | void;
  onCloseChat: () => void;
  onEndConsultation: () => void;
  onTopUp?: (minutes: number) => void;
}

const QUICK_INQUIRIES = [
  '✨ Will I find my true soulmate or life partner this year?',
  '💼 What career shifts and opportunities are indicated for me?',
  '🌟 What spiritual remedies can remove obstacles right now?',
  '🪐 How are my current planetary transits affecting my mind and finances?'
];

const CELESTIAL_SYMBOLS = ['✨', '🌟', '🔮', '🌙', '🪐', '☀️', '💖', '🕊️'];

export const LiveChatView: React.FC<LiveChatViewProps> = ({
  session: initialSession,
  reader,
  onSendMessage,
  onCloseChat,
  onEndConsultation
}) => {
  const [session, setSession] = useState<ConsultationSession>(initialSession);
  const [messages, setMessages] = useState<ChatMessage[]>(initialSession.messages || []);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showBirthDetails, setShowBirthDetails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialSession.status === 'completed');
  const [rating, setRating] = useState<number>(5);
  const [selectedTag, setSelectedTag] = useState<string>('Accurate & Insightful');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [now, setNow] = useState(Date.now());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMessageCountRef = useRef(messages.length);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format elapsed consultation duration
  const elapsedDuration = useMemo(() => {
    const start = session.acceptedAt || session.createdAt || session.startTime;
    if (!start) return '00:00';
    const totalSecs = Math.max(0, Math.floor((now - new Date(start).getTime()) / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [now, session.acceptedAt, session.createdAt, session.startTime]);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {}
  };

  // =========================================================================
  // REAL-TIME FIRESTORE & SERVER CONNECTIVITY
  // =========================================================================
  useEffect(() => {
    if (!session?.id) return;

    // 1. Direct Firestore Real-time Listener (Receives replies from Astrologer/Admin instantaneously)
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = onSnapshot(doc(db, 'sessions', session.id), (docSnap) => {
        if (docSnap.exists()) {
          const remote = docSnap.data() as ConsultationSession;
          if (remote && remote.id === session.id) {
            setSession(curr => ({ ...curr, ...remote }));
            if (remote.messages && remote.messages.length > lastMessageCountRef.current) {
              const latestMsg = remote.messages[remote.messages.length - 1];
              if (latestMsg && latestMsg.sender === 'astrologer') {
                playChime();
              }
              lastMessageCountRef.current = remote.messages.length;
              setMessages(remote.messages);
            }
            if (remote.status === 'completed') {
              setIsCompleted(true);
            }
          }
        }
      }, (err) => {
        console.warn('Seeker Firestore live sync notice:', err);
      });
    } catch (err) {
      console.warn('Firestore onSnapshot init notice:', err);
    }

    // 2. Server-Sent Events / BroadcastChannel Listener
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(SESSIONS_CHANNEL_NAME);
        bc.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'message_received' && payload) {
            const msg: ChatMessage = payload;
            if (msg.sessionId === session.id) {
              setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                if (msg.sender === 'astrologer') playChime();
                return [...prev, msg];
              });
            }
          } else if (type === 'session_completed' && payload?.id === session.id) {
            setIsCompleted(true);
          }
        };
      }
    } catch {}

    // 3. Fallback periodic server poll (every 3 seconds)
    const pollInterval = setInterval(async () => {
      try {
        const token = sessionStorage.getItem(`lumsic_session_token_${session.id}`) || '';
        const res = await fetch(`/api/sessions/${session.id}`, {
          headers: token ? { 'x-session-token': token } : {}
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.session) {
            setSession(curr => ({ ...curr, ...data.session }));
            if (Array.isArray(data.session.messages) && data.session.messages.length > lastMessageCountRef.current) {
              lastMessageCountRef.current = data.session.messages.length;
              setMessages(data.session.messages);
            }
            if (data.session.status === 'completed') {
              setIsCompleted(true);
            }
          }
        }
      } catch {}
    }, 3000);

    return () => {
      if (unsubFirestore) unsubFirestore();
      if (bc) bc.close();
      clearInterval(pollInterval);
    };
  }, [session.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // =========================================================================
  // MESSAGE SENDING: Instantaneous Local + Firestore + Backend Dispatch
  // =========================================================================
  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || isSending || isCompleted) return;

    const cleanText = rawText.trim();
    setInputText('');
    setIsSending(true);

    const newMsg: ChatMessage = {
      id: 'msg_c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sessionId: session.id,
      sender: 'customer',
      senderName: session.customerName || 'Seeker',
      text: cleanText,
      timestamp: new Date().toISOString()
    };

    // 1. Immediate optimistic UI render
    setMessages(prev => [...prev, newMsg]);
    lastMessageCountRef.current += 1;

    // 2. Persist to local storage and broadcast to Admin tabs
    appendMessageToStoredSession(session.id, newMsg);
    broadcastSessionEvent('message_received', newMsg);

    // 3. Direct Firestore live delivery (sub-100ms delivery to Astrologer & Admin)
    try {
      const sessionRef = doc(db, 'sessions', session.id);
      await setDoc(sessionRef, {
        messages: [...(session.messages || []), newMsg],
        lastMessageText: cleanText,
        lastMessageAt: newMsg.timestamp,
        unreadForOperator: true
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore message dispatch notice:', fsErr);
    }

    // 4. Dispatch to backend API
    try {
      await onSendMessage(cleanText);
    } catch (err) {
      console.warn('Backend message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Conclude Consultation
  const handleEndConsultation = async () => {
    setShowEndConfirm(false);
    setIsCompleted(true);
    const updated: ConsultationSession = {
      ...session,
      status: 'completed',
      endedAt: new Date().toISOString()
    };
    setSession(updated);
    saveStoredSession(updated);
    broadcastSessionEvent('session_ended', updated);

    try {
      await setDoc(doc(db, 'sessions', session.id), { status: 'completed', endedAt: new Date().toISOString() }, { merge: true });
    } catch {}

    try {
      await fetch(`/api/sessions/${session.id}/complete`, { method: 'POST' });
    } catch {}

    onEndConsultation();
  };

  const handleRatingSubmit = async () => {
    setReviewSubmitted(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: reader.id,
          readerName: reader.name,
          customerName: session.customerName || 'Valued Seeker',
          rating,
          comment: selectedTag,
          timestamp: new Date().toISOString()
        })
      });
    } catch {}
  };

  const birthDetails = session.birthDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl overflow-hidden font-sans animate-in fade-in duration-200">
      
      {/* Hidden audio element for chime */}
      <audio 
        ref={audioRef} 
        src="/assets/aistudio/mixkit-marimba-waiting-ringtone-1360_715cddd4.wav" 
        preload="auto" 
      />

      {/* Main Luxury Consultation Container */}
      <div className="w-full h-full sm:max-w-2xl sm:h-[94vh] bg-[#0A0D18] text-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-amber-500/20 sm:ring-1 sm:ring-amber-500/30">
        
        {/* =================================================================== */}
        {/* 1. TOP HEADER: ASTROLOGER HERO & LIVE CONNECTION STATUS */}
        {/* =================================================================== */}
        <header className="bg-gradient-to-r from-[#11162B] via-[#0E1325] to-[#120F24] border-b border-amber-500/20 px-4 py-3 shrink-0 flex items-center justify-between gap-3 shadow-lg z-20">
          
          {/* Reader Profile Strip */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onCloseChat}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
              title="Close window (consultation remains active)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-amber-400/60 shadow-md shadow-amber-500/10">
                <img 
                  src={reader.avatar} 
                  alt={reader.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0A0D18]"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide truncate">
                  {session.requestedReaderName || reader.name}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Verified</span>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="truncate text-amber-200/80 text-[11px]">
                  {reader.category || 'Spiritual Guide'}
                </span>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1 text-[11px] text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{reader.rating || 4.98}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Status & Top Tools */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Live Timer Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>{elapsedDuration}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition cursor-pointer border border-slate-800"
              title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Birth Details Toggle */}
            {birthDetails && (
              <button
                onClick={() => setShowBirthDetails(!showBirthDetails)}
                className={`p-2 rounded-xl transition cursor-pointer border ${
                  showBirthDetails
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
                title="View your submitted Birth Details"
              >
                <Info className="w-4 h-4" />
              </button>
            )}

            {/* End Consultation Button */}
            {!isCompleted ? (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold transition cursor-pointer"
              >
                End
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                Concluded
              </span>
            )}

          </div>

        </header>

        {/* =================================================================== */}
        {/* 2. OPTIONAL BIRTH DETAILS COLLAPSIBLE DRAWER */}
        {/* =================================================================== */}
        {showBirthDetails && birthDetails && (
          <div className="bg-[#12162A] border-b border-amber-500/20 p-3.5 text-xs text-slate-300 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Chart Intake Details</span>
              </span>
              <button 
                onClick={() => setShowBirthDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Name</span>
                <strong className="text-white truncate block">{birthDetails.name || session.customerName}</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Date of Birth</span>
                <strong className="text-white truncate block">{birthDetails.dob || 'Not specified'}</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Birth Time</span>
                <strong className="text-white truncate block">{birthDetails.birthTime || 'Unknown'}</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Place of Birth</span>
                <strong className="text-white truncate block">{birthDetails.placeOfBirth || 'Not specified'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. CHAT MESSAGES STREAM */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0A0D18] via-[#0D1020] to-[#0A0D18]">
          
          {/* Sanctuary Introduction Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/70 to-indigo-950/30 border border-amber-500/20 text-center max-w-md mx-auto shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-xs font-bold text-amber-200">
              Personal Sanctuary with {session.requestedReaderName || reader.name}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Your consultation is active and protected. Ask freely about love, destiny, career, or remedies.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Encrypted 1-on-1 Sanctuary</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Reader Connected</span>
            </div>
          </div>

          {/* Render All Messages */}
          {messages.map((msg, index) => {
            const isCustomer = msg.sender === 'customer';
            const isSystem = msg.sender === 'system' || msg.isSystemNotice;

            if (isSystem) {
              return (
                <div key={msg.id || index} className="flex justify-center my-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/20 text-[11px] text-amber-300/90 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={msg.id || index}
                className={`flex gap-2.5 items-end ${isCustomer ? 'justify-end' : 'justify-start'}`}
              >
                {/* Astrologer mini avatar */}
                {!isCustomer && (
                  <img 
                    src={reader.avatar} 
                    alt={reader.name} 
                    className="w-7 h-7 rounded-xl object-cover shrink-0 ring-1 ring-amber-400/40 mb-1" 
                  />
                )}

                <div className={`max-w-[82%] sm:max-w-[75%] flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Name & Time */}
                  <div className="flex items-center gap-1.5 px-1 mb-1 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-400">
                      {isCustomer ? 'You' : (msg.senderName || reader.name)}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-line shadow-md ${
                    isCustomer
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-br-xs'
                      : 'bg-[#151A30] border border-slate-700/70 text-slate-100 rounded-bl-xs'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Delivery status for user messages */}
                  {isCustomer && (
                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-amber-400/80">
                      <CheckCheck className="w-3 h-3" />
                      <span>Delivered</span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* =================================================================== */}
        {/* 4. QUICK INQUIRY CHIPS (Shown when chat is active) */}
        {/* =================================================================== */}
        {!isCompleted && messages.length <= 4 && (
          <div className="px-3.5 py-2 bg-[#0E1222] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider shrink-0">Ask Guide:</span>
            {QUICK_INQUIRIES.map((inquiry, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(inquiry)}
                className="text-[11px] bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1 rounded-xl border border-slate-700/60 shrink-0 transition cursor-pointer"
              >
                {inquiry}
              </button>
            ))}
          </div>
        )}

        {/* =================================================================== */}
        {/* 5. INPUT COMPOSER BAR */}
        {/* =================================================================== */}
        {!isCompleted ? (
          <div className="p-3 bg-[#0B0E1C] border-t border-amber-500/20 shrink-0">
            
            {/* Quick Symbol bar */}
            <div className="flex items-center gap-1 mb-2 px-1">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Symbols:</span>
              {CELESTIAL_SYMBOLS.map((sym, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputText(prev => prev + sym)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-xs transition cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Ask ${session.requestedReaderName || reader.name} anything...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition"
                autoFocus
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="text-center text-[10px] text-slate-500 mt-1.5">
              Live sanctuary consultation • Responses are provided directly by verified astrologers
            </div>
          </div>
        ) : (
          /* Concluded Banner */
          <div className="p-4 bg-[#0E1222] border-t border-slate-800 text-center shrink-0">
            <p className="text-xs text-slate-400">
              This consultation has concluded. We hope the cosmic reading brought you clarity.
            </p>
            <button
              onClick={onCloseChat}
              className="mt-2.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
            >
              Return to Sanctuary
            </button>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* CONFIRM END CONSULTATION MODAL */}
      {/* =================================================================== */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0E1325] border border-amber-500/30 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-white">End Consultation?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to conclude your live reading with {session.requestedReaderName || reader.name}?
            </p>
            
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Continue Chat
              </button>
              <button
                onClick={handleEndConsultation}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Yes, End Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* COMPLETED REVIEW / FEEDBACK MODAL */}
      {/* =================================================================== */}
      {isCompleted && !reviewSubmitted && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0E1325] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center">
            
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-amber-400" />
            </div>

            <h3 className="text-base font-bold text-white">How was your reading?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your feedback helps {session.requestedReaderName || reader.name} and the LUMSIC collective.
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 my-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 transition hover:scale-125 cursor-pointer"
                >
                  <Star className={`w-7 h-7 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>

            {/* Feedback Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 my-3">
              {[
                'Accurate & Insightful',
                'Deep Spiritual Clarity',
                'Warm & Empathetic',
                'Fast Responses',
                'Life Changing'
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setReviewSubmitted(true)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Skip
              </button>
              <button
                onClick={handleRatingSubmit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Submit Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
