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
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  Send, 
  X, 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Clock, 
  Shield, 
  CheckCheck, 
  Compass, 
  Info, 
  Award,
  AlertCircle,
  RefreshCw,
  MessageCircle
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
  '✨ Will I find my true soulmate this year?',
  '💼 What career shifts are indicated for me?',
  '🌟 What spiritual remedies can remove obstacles?',
  '🪐 How are my current planetary transits affecting me?'
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
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  // Real-time Astrologer Typing State
  const [isAstrologerTyping, setIsAstrologerTyping] = useState<boolean>(false);
  const typingTimerRef = useRef<any>(null);

  // Mobile Viewport Keyboard & Screen Fitting State (WhatsApp-style)
  const [viewportHeight, setViewportHeight] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.visualViewport.height;
    }
    return typeof window !== 'undefined' ? window.innerHeight : 0;
  });
  const [viewportTop, setViewportTop] = useState<number>(0);

  // If previously completed, allow user to resume or keep active
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  const [rating, setRating] = useState<number>(5);
  const [selectedTag, setSelectedTag] = useState<string>('Accurate & Insightful');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [now, setNow] = useState(Date.now());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef(messages.length);

  // =========================================================================
  // MOBILE SCREEN FIT (WHATSAPP-STYLE): Lock body & Track Visual Viewport
  // =========================================================================
  useEffect(() => {
    // Prevent document scrolling so keyboard ONLY resizes chat messages
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalBodyPosition = document.body.style.position;
    const originalBodyWidth = document.body.style.width;
    const originalBodyTop = document.body.style.top;

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';

    const handleViewport = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        setViewportTop(window.visualViewport.offsetTop || 0);
        // Guarantee page window stays anchored at (0, 0)
        if (window.scrollY !== 0 || window.scrollX !== 0) {
          window.scrollTo(0, 0);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewport);
      window.visualViewport.addEventListener('scroll', handleViewport);
      handleViewport();
    }

    const preventWindowScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    window.addEventListener('scroll', preventWindowScroll);

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.height = originalHtmlHeight;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
      document.body.style.position = originalBodyPosition;
      document.body.style.width = originalBodyWidth;
      document.body.style.top = originalBodyTop;
      document.body.style.left = '';

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewport);
        window.visualViewport.removeEventListener('scroll', handleViewport);
      }
      window.removeEventListener('scroll', preventWindowScroll);
    };
  }, []);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update Astrologer Typing status from session state (with 4.5s debounce timeout)
  useEffect(() => {
    if (session?.isAstrologerTyping) {
      const elapsed = Date.now() - (session.astrologerTypingAt || Date.now());
      if (elapsed < 4500) {
        setIsAstrologerTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          setIsAstrologerTyping(false);
        }, Math.max(1000, 4500 - elapsed));
      } else {
        setIsAstrologerTyping(false);
      }
    } else {
      setIsAstrologerTyping(false);
    }
  }, [session?.isAstrologerTyping, session?.astrologerTypingAt]);

  // Find first message from astrologer/reader
  const firstAstrologerMessage = useMemo(() => {
    return (messages || []).find(m => m.sender === 'astrologer' && !m.isSystemNotice);
  }, [messages]);

  const hasAstrologerReplied = Boolean(firstAstrologerMessage);

  // 3-Minute Free Chat Countdown Timer (180 seconds)
  // Back counting starts ONLY when astrologer attends and sends 1st message!
  const countdownSecondsRemaining = useMemo(() => {
    const TOTAL_FREE_SECONDS = 180; // 3 minutes free chat

    // If astrologer has not sent their 1st message yet, timer stays at 03:00 (180s)
    if (!firstAstrologerMessage?.timestamp) {
      return TOTAL_FREE_SECONDS;
    }

    const replyTime = new Date(firstAstrologerMessage.timestamp).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((now - replyTime) / 1000));
    return Math.max(0, TOTAL_FREE_SECONDS - elapsedSeconds);
  }, [now, firstAstrologerMessage]);

  // Formatted countdown: "03:00", "02:59", etc.
  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(countdownSecondsRemaining / 60);
    const secs = countdownSecondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [countdownSecondsRemaining]);

  const isFreeTimeExpired = hasAstrologerReplied && countdownSecondsRemaining === 0;

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
              lastMessageCountRef.current = remote.messages.length;
              setMessages(remote.messages);
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
              // Astrologer message arrived -> stop typing indicator immediately
              if (msg.sender === 'astrologer') {
                setIsAstrologerTyping(false);
              }
              setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
          } else if (type === 'typing' && payload && payload.sessionId === session.id) {
            if (payload.sender === 'astrologer') {
              if (payload.isTyping) {
                setIsAstrologerTyping(true);
                if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                typingTimerRef.current = setTimeout(() => {
                  setIsAstrologerTyping(false);
                }, 4000);
              } else {
                setIsAstrologerTyping(false);
              }
            }
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

  // Auto scroll to bottom when new messages arrive or astrologer starts typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAstrologerTyping]);

  // Handle mobile keyboard focus (WhatsApp-style screen fit)
  const handleInputFocus = () => {
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
    setTimeout(() => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  // =========================================================================
  // MESSAGE SENDING: Instantaneous Local + Firestore + Backend Dispatch
  // =========================================================================
  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || isSending) return;

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
  const astrologerName = session.requestedReaderName || session.assignedReaderName || reader.name;

  return (
    <div 
      style={{
        height: viewportHeight ? `${viewportHeight}px` : '100dvh',
        maxHeight: viewportHeight ? `${viewportHeight}px` : '100dvh',
        top: `${viewportTop}px`
      }}
      className="fixed left-0 right-0 z-50 flex flex-col w-full bg-white text-gray-900 font-sans overflow-hidden overscroll-none"
    >
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER: PROPERLY ASSIGNED PURPLE HEADER (FIT TO SCREEN) */}
      {/* =================================================================== */}
      <header className="bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-[#6D28D9] text-white px-3 sm:px-5 py-2.5 shrink-0 sticky top-0 flex items-center justify-between gap-2 shadow-md z-30">
        
        {/* Left: Back Button, Avatar, Full Astrologer Name & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onCloseChat}
            className="p-1.5 -ml-1 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer shrink-0"
            title="Back to Sanctuary"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Astrologer Avatar with Active Status Indicator */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden ring-2 ring-white/60 shadow-sm">
              <img 
                src={reader.avatar} 
                alt={astrologerName} 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#5B21B6]"></span>
          </div>

          {/* Astrologer Details: Full Name (No truncation) & Rating */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate leading-tight">
                {astrologerName}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-300/40 shrink-0 hidden xs:inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>Verified Guide</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-purple-200 mt-0.5">
              <span className="text-[11px] sm:text-xs truncate text-purple-100">
                {reader.category || 'Vedic & Psychic Guidance'}
              </span>
              <span className="text-purple-300">•</span>
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium shrink-0">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                <span>{reader.rating || 4.98}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timer, Info (Birth Details), End Button (Notification toggle REMOVED) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* 3-Minute Free Countdown Timer Pill (Starts when astrologer sends 1st message) */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition ${
              isFreeTimeExpired
                ? 'bg-rose-500/30 text-rose-200 border-rose-300 animate-pulse'
                : hasAstrologerReplied
                ? 'bg-amber-400/25 text-amber-200 border-amber-300/40 shadow-xs'
                : 'bg-white/15 text-white/90 border-white/20'
            }`}
            title={
              hasAstrologerReplied
                ? `Free consultation time remaining: ${formattedCountdown}`
                : `Free 3-minute countdown begins when ${astrologerName} sends first message`
            }
          >
            <Clock className={`w-3.5 h-3.5 ${hasAstrologerReplied ? 'text-amber-300' : 'text-yellow-300'}`} />
            <span>{formattedCountdown}</span>
            {!hasAstrologerReplied && (
              <span className="text-[10px] uppercase font-sans font-semibold text-amber-200 hidden xs:inline">
                Free
              </span>
            )}
          </div>

          {/* Birth Details Info Button */}
          {birthDetails && (
            <button
              type="button"
              onClick={() => setShowBirthDetails(!showBirthDetails)}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                showBirthDetails
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="View your submitted birth chart details"
              aria-label="Birth Details"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {/* End Consultation Button */}
          {!isCompleted ? (
            <button
              type="button"
              onClick={() => setShowEndConfirm(true)}
              className="px-3 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              End
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-white/90 text-xs font-medium">
              Concluded
            </span>
          )}

        </div>

      </header>

      {/* =================================================================== */}
      {/* 2. OPTIONAL BIRTH DETAILS CARD (COLLAPSIBLE) */}
      {/* =================================================================== */}
      {showBirthDetails && birthDetails && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-3 text-xs text-purple-950 animate-in slide-in-from-top-2 duration-150 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-700" />
              <span>Your Chart Details Shared with {astrologerName}</span>
            </span>
            <button 
              onClick={() => setShowBirthDetails(false)}
              className="text-purple-600 hover:text-purple-900 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-xl border border-purple-200/80 shadow-xs">
              <span className="text-[10px] text-gray-500 block">Name</span>
              <strong className="text-gray-900 truncate block">{birthDetails.name || session.customerName}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-purple-200/80 shadow-xs">
              <span className="text-[10px] text-gray-500 block">Date of Birth</span>
              <strong className="text-gray-900 truncate block">{birthDetails.dob || 'Not specified'}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-purple-200/80 shadow-xs">
              <span className="text-[10px] text-gray-500 block">Birth Time</span>
              <strong className="text-gray-900 truncate block">{birthDetails.birthTime || 'Unknown'}</strong>
            </div>
            <div className="bg-white p-2 rounded-xl border border-purple-200/80 shadow-xs">
              <span className="text-[10px] text-gray-500 block">Place of Birth</span>
              <strong className="text-gray-900 truncate block">{birthDetails.placeOfBirth || 'Not specified'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. CHAT MESSAGES STREAM (WHITE BACKGROUND, CLEAN PURPLE ACCENTS) */}
      {/* =================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4 bg-[#F8F9FD]">
        
        {/* Sanctuary Welcome Card */}
        <div className="p-4 rounded-2xl bg-white border border-purple-100 text-center max-w-md mx-auto shadow-xs">
          <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-200 mx-auto flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4 text-purple-700" />
          </div>
          <h2 className="text-xs font-bold text-purple-950">
            Consultation Sanctuary with {astrologerName}
          </h2>
          <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
            Your consultation is active and private. Ask freely about love, destiny, career, or remedies.
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-gray-500">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span className="font-medium text-gray-700">Confidential Session</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Astrologer Online</span>
          </div>
        </div>

        {/* 3-Minute Free Chat Dynamic Timer Banner */}
        {!hasAstrologerReplied ? (
          <div className="flex justify-center my-1">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200 text-xs text-amber-900 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Free 3-minute countdown starts when <strong>{astrologerName}</strong> sends their 1st reply</span>
            </div>
          </div>
        ) : isFreeTimeExpired ? (
          <div className="flex justify-center my-1">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-900 shadow-2xs font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Free 3 minutes completed. Your live reading continues.</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center my-1">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 shadow-2xs font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>3-Minute Free Consultation Active: <strong>{formattedCountdown}</strong> remaining</span>
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg, index) => {
          const isCustomer = msg.sender === 'customer';
          const isSystem = msg.sender === 'system' || msg.isSystemNotice;

          if (isSystem) {
            return (
              <div key={msg.id || index} className="flex justify-center my-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] text-purple-900 shadow-xs">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id || index}
              className={`flex gap-2 items-end ${isCustomer ? 'justify-end' : 'justify-start'}`}
            >
              {/* Astrologer mini avatar */}
              {!isCustomer && (
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-purple-300 mb-1">
                  <img 
                    src={reader.avatar} 
                    alt={astrologerName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                
                {/* Sender Name & Time */}
                <div className="flex items-center gap-1.5 px-1 mb-1 text-[10px] text-gray-400">
                  <span className="font-semibold text-gray-600">
                    {isCustomer ? 'You' : (msg.senderName || astrologerName)}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble: User is Vibrant Purple, Astrologer is White Card */}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  isCustomer
                    ? 'bg-[#6D28D9] text-white rounded-tr-xs font-normal'
                    : 'bg-white text-gray-900 border border-purple-100/90 rounded-tl-xs shadow-xs'
                }`}>
                  {msg.text}
                </div>

                {/* Delivery status for user messages */}
                {isCustomer && (
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-purple-600 font-medium">
                    <CheckCheck className="w-3 h-3" />
                    <span>Delivered</span>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Astrologer Real-Time Typing Indicator (WhatsApp Style) */}
        {isAstrologerTyping && (
          <div className="flex gap-2 items-end justify-start animate-in fade-in slide-in-from-bottom-1 duration-150">
            {/* Mini avatar */}
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-purple-300 mb-1">
              <img 
                src={reader.avatar} 
                alt={astrologerName} 
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Bubble with typing animation */}
            <div className="bg-white text-gray-800 border border-purple-200/90 rounded-2xl rounded-tl-xs px-3.5 py-2 text-xs shadow-xs flex items-center gap-2">
              <span className="font-semibold text-purple-900">{astrologerName}</span>
              <span className="text-gray-500">is typing</span>
              <div className="flex items-center gap-1 ml-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* =================================================================== */}
      {/* 4. QUICK INQUIRY SUGGESTIONS CHIPS */}
      {/* =================================================================== */}
      {!isCompleted && messages.length <= 4 && (
        <div className="px-3.5 py-2 bg-purple-50/70 border-t border-purple-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider shrink-0">Suggestions:</span>
          {QUICK_INQUIRIES.map((inquiry, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(inquiry)}
              className="text-[11px] bg-white hover:bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200 shrink-0 transition cursor-pointer shadow-2xs"
            >
              {inquiry}
            </button>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. WHITE COMPOSER BAR & PURPLE ACTION BUTTON */}
      {/* =================================================================== */}
      {!isCompleted ? (
        <div className="p-3 bg-white border-t border-purple-100 shrink-0 sticky bottom-0 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          
          {/* Quick Symbol bar */}
          <div className="flex items-center gap-1 mb-2 px-1">
            <span className="text-[10px] text-gray-500 font-medium mr-1">Symbols:</span>
            {CELESTIAL_SYMBOLS.map((sym, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputText(prev => prev + sym)}
                className="p-1 hover:bg-purple-50 rounded-lg text-xs transition cursor-pointer"
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
              placeholder={`Type your message for ${astrologerName}...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onFocus={handleInputFocus}
              enterKeyHint="send"
              autoComplete="off"
              className="flex-1 bg-gray-50 border border-purple-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-400 rounded-full px-4 py-2.5 text-sm transition"
              autoFocus
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white font-bold text-sm transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-[10px] text-gray-400 mt-1.5">
            Real-time consultation • All messages are securely routed to verified astrologers
          </div>
        </div>
      ) : (
        /* Concluded Banner with option to restart */
        <div className="p-4 bg-purple-50 border-t border-purple-200 text-center shrink-0">
          <p className="text-xs text-purple-900 font-medium">
            This consultation has concluded. We hope your reading brought you peace and clarity.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => setIsCompleted(false)}
              className="px-4 py-2 rounded-full bg-white border border-purple-300 text-purple-800 font-semibold text-xs hover:bg-purple-100 transition cursor-pointer"
            >
              Resume Consultation
            </button>
            <button
              type="button"
              onClick={onCloseChat}
              className="px-4 py-2 rounded-full bg-[#6D28D9] text-white font-bold text-xs hover:bg-purple-800 transition cursor-pointer shadow-sm"
            >
              Return to Sanctuary
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* CONFIRM END CONSULTATION MODAL */}
      {/* =================================================================== */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-purple-200 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">End Consultation?</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Are you sure you want to conclude your live reading with {astrologerName}?
            </p>
            
            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
              >
                Continue Chat
              </button>
              <button
                type="button"
                onClick={handleEndConsultation}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-rose-600/20"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-purple-200 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center">
            
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 mx-auto flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-amber-500" />
            </div>

            <h3 className="text-base font-bold text-gray-900">How was your reading?</h3>
            <p className="text-xs text-gray-600 mt-1">
              Your feedback helps {astrologerName} and the LUMSIC collective.
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
                  <Star className={`w-7 h-7 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#6D28D9] text-white font-bold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setReviewSubmitted(true)}
                className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-semibold cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleRatingSubmit}
                className="flex-1 py-2.5 rounded-full bg-[#6D28D9] hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer"
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
