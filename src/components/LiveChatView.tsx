import React, { useState, useEffect, useRef } from 'react';
import { ConsultationSession, ChatMessage, Reader } from '../types';
import { 
  Send, 
  X, 
  ArrowLeft, 
  Star, 
  Check, 
  CheckCheck, 
  Sparkles, 
  CreditCard,
  Flame,
  Gift
} from 'lucide-react';

interface LiveChatViewProps {
  session: ConsultationSession;
  reader: Reader;
  onSendMessage: (text: string) => Promise<ChatMessage | undefined | null | void> | void;
  onCloseChat: () => void;
  onEndConsultation: () => void;
  onTopUp: (minutes: number) => void;
}

const RECHARGE_PACKS = [
  { mins: 5, price: 5, label: 'Quick Question', badge: '' },
  { mins: 15, price: 15, label: 'Deep Reading', badge: 'POPULAR' },
  { mins: 30, price: 30, label: 'Life & Destiny', badge: '100% CASHBACK' },
  { mins: 60, price: 50, label: 'Master Session', badge: 'BEST VALUE' }
];

export const LiveChatView: React.FC<LiveChatViewProps> = ({
  session,
  reader,
  onSendMessage,
  onCloseChat,
  onEndConsultation,
  onTopUp
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages);
  const [inputText, setInputText] = useState('');
  
  // Timer in seconds: freeSecondsRemaining for introductory free chat
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return session.freeSecondsRemaining > 0 ? session.freeSecondsRemaining : 300;
  });
  // Consultation time begins only after the human astrologer sends their first reply.
  const [humanReplyStarted, setHumanReplyStarted] = useState<boolean>(() =>
    (session.messages || []).some(message => message.sender === 'astrologer' && !message.isAiMessage)
  );
  
  const [isEnded, setIsEnded] = useState<boolean>(session.status === 'completed');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showCashbackPopup, setShowCashbackPopup] = useState<boolean>(false);
  const [showRechargePacks, setShowRechargePacks] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndexRef = useRef<number>(0);

  // Sync incoming props messages
  useEffect(() => {
    if (session.messages && session.messages.length > messages.length) {
      setMessages(session.messages);
    }
    if ((session.messages || []).some(message => message.sender === 'astrologer' && !message.isAiMessage)) {
      setHumanReplyStarted(true);
    }
  }, [session.messages]);

  // Add one local confirmation only; it is not an astrologer/AI reply.
  useEffect(() => {
    setMessages(prev => prev.some(message => message.id === `welcome_${session.id}`) ? prev : [{
      id: `welcome_${session.id}`,
      sessionId: session.id,
      sender: 'system',
      senderName: 'Lumsic',
      text: `Thank you for connecting with Lumsic. ${session.requestedReaderName || reader.name} will join you shortly.`,
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    }, ...prev]);
  }, [session.id]);

  // Real-time synchronization: Poll for new astrologer/operator messages
  useEffect(() => {
    if (!session?.id || isEnded) return;

    const pollInterval = setInterval(async () => {
      try {
        const sessionToken = sessionStorage.getItem(`lumsic_session_token_${session.id}`);
        const res = await fetch(`/api/sessions/${session.id}`, {
          headers: sessionToken ? { 'x-session-token': sessionToken } : {}
        });
        const data = await res.json();
        if (data.session && Array.isArray(data.session.messages)) {
          setMessages(prev => {
            if (data.session.messages.length > prev.length) {
              return data.session.messages;
            }
            return prev;
          });
        }
      } catch {
        // network resilience
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [session?.id, isEnded]);

  // Live Timer Countdown: runs every second
  useEffect(() => {
    if (isEnded || !humanReplyStarted) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsEnded(true);
          setShowCashbackPopup(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEnded, humanReplyStarted]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Format timer into mm:ss mins
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} mins`;
  };

  // Format message timestamp in 12-hour format e.g. "10:35 pm"
  const formatMsgTime = (isoString?: string) => {
    const d = isoString ? new Date(isoString) : new Date();
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  };

  // Today's date pill label e.g. "06 Oct 2026"
  const todayDateLabel = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handleSend = async () => {
    if (!inputText.trim() || isEnded) return;

    const userText = inputText.trim();
    const newMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sessionId: session.id,
      sender: 'customer',
      senderName: session.customerName,
      text: userText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiReply = await onSendMessage(userText);
      if (aiReply) {
        setMessages(prev => {
          if (prev.some(m => m.id === aiReply.id)) return prev;
          return [...prev, aiReply];
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndChat = () => {
    setIsEnded(true);
    setShowCashbackPopup(true);
    onEndConsultation();
  };

  const handleRechargePackage = (minutes: number) => {
    onTopUp(minutes);
    setSecondsRemaining(prev => prev + minutes * 60);
    setIsEnded(false);
    setShowCashbackPopup(false);
    setShowRechargePacks(false);

    // Confirmation message in chat
    const confirmMsg: ChatMessage = {
      id: 'msg_sys_topup_' + Date.now(),
      sessionId: session.id,
      sender: 'astrologer',
      senderName: reader.name,
      text: `Thank you! ${minutes} minutes added to our reading. Let us dive deeper into the cosmic cards.`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      
      {/* PHONE-STYLE CONTAINER MATCHING USER SCREENSHOTS */}
      <div 
        className="w-full h-full sm:max-w-md sm:h-[94vh] bg-[#ECE5DD] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border-4 sm:border-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-screen-title"
      >
        
        {/* ================= 1. HEADER ================= */}
        <div className="bg-white/95 border-b border-gray-200/90 px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-20 backdrop-blur-md">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCloseChat}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Astrologer Avatar with online indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-900 border border-purple-300 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                {reader.avatar ? (
                  <img
                    src={reader.avatar}
                    alt={reader.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>{reader.initials}</span>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            </div>

            {/* Name + Live Running Timer / Chat Ended */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 id="chat-screen-title" className="font-bold text-gray-900 text-sm leading-tight">
                  {session.requestedReaderName || reader.name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              {/* Running countdown timer or ended state */}
              <div className="text-[11px] font-medium leading-none mt-0.5">
                {isTyping ? (
                  <span className="text-purple-600 font-semibold animate-pulse">typing...</span>
                ) : isEnded ? (
                  <span className="text-gray-500">Chat ended</span>
                ) : (
                  <span className="text-gray-600 font-mono font-semibold">
                    {formatTimer(secondsRemaining)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Action: End button */}
          <div>
            {!isEnded ? (
              <button
                type="button"
                onClick={handleEndChat}
                className="px-3.5 py-1 rounded-md border border-gray-300 bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                End
              </button>
            ) : (
              <button
                type="button"
                onClick={onCloseChat}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>

        {/* ================= 2. STAR RATING STRIP (SCREENSHOT 4) ================= */}
        {isEnded && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 z-10 animate-in fade-in">
            <span className="font-medium">
              {hasRated ? 'Thank you for your rating!' : 'Rate your reading:'}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setUserRating(star);
                    setHasRated(true);
                  }}
                  className="p-0.5 text-amber-400 hover:text-amber-500 transition-transform hover:scale-125 cursor-pointer"
                  title={`Rate ${star} stars`}
                >
                  <Star 
                    className={`w-4 h-4 ${
                      star <= userRating 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-amber-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3. MESSAGES CONTAINER WITH WALLPAPER ================= */}
        <div 
          className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 relative"
          style={{
            backgroundImage: `radial-gradient(#00000008 1px, transparent 1px), radial-gradient(#00000008 1px, #ECE5DD 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        >
          {/* Centered Date Pill (Screenshot 1) */}
          <div className="flex justify-center my-1">
            <span className="px-3 py-1 rounded-md bg-white/80 border border-gray-200/60 text-gray-600 text-[11px] font-medium shadow-2xs">
              {todayDateLabel}
            </span>
          </div>

          {/* Messages Loop */}
          {messages.map((msg) => {
            // System Yellow Alert Banner (Screenshot 1)
            if (msg.isBanner) {
              return (
                <div key={msg.id} className="flex justify-center my-2 animate-in fade-in duration-200">
                  <div className="bg-[#FFF3CD] border border-[#FFEBAA] text-[#856404] px-4 py-2.5 rounded-xl text-center text-xs font-medium max-w-[90%] shadow-2xs leading-snug">
                    {msg.text}
                  </div>
                </div>
              );
            }

            const isCustomer = msg.sender === 'customer';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div
                  className={`relative px-3.5 py-2.5 rounded-2xl max-w-[85%] text-[13px] sm:text-sm leading-relaxed shadow-xs ${
                    isCustomer
                      ? 'bg-[#DCF8C6] text-gray-900 rounded-tr-xs' // WhatsApp light green
                      : 'bg-white text-gray-900 rounded-tl-xs border border-gray-100' // WhatsApp clean white
                  }`}
                >
                  {/* Text content with preserved newlines or dedicated User Details Card */}
                  {msg.text.includes('Below are my details:') ? (
                    <div className="bg-gradient-to-br from-[#1C1033] to-[#2B144E] text-white p-3 rounded-xl border border-purple-400/30 text-xs shadow-inner">
                      <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-purple-400/20 font-bold text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Seeker Birth &amp; Consultation Details</span>
                      </div>
                      <div className="whitespace-pre-line text-[12px] leading-relaxed text-purple-100/90 font-mono">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line break-words">
                      {msg.text}
                    </div>
                  )}

                  {/* Dynamic Image Attachment (if any) */}
                  {msg.imageUrl && (
                    <div className="mt-2.5 rounded-xl overflow-hidden border border-purple-200/90 shadow-sm bg-purple-50/50">
                      <img
                        src={msg.imageUrl}
                        alt="Reading Attachment"
                        className="w-full max-h-56 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Message Time and Blue Checkmarks */}
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500 font-medium`}>
                    <span>{formatMsgTime(msg.timestamp)}</span>
                    {isCustomer && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500 stroke-[2.5]" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Natural Chat Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start max-w-full animate-in fade-in duration-150">
              <div className="bg-white text-gray-500 px-3.5 py-2 rounded-2xl rounded-tl-xs border border-gray-100 shadow-xs flex items-center gap-1.5 text-xs">
                <span className="text-[12px] text-gray-500 font-normal">typing</span>
                <span className="flex items-center gap-1 ml-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= 4. BOTTOM INPUT OR ENDED BANNER ================= */}
        {!isEnded ? (
          // Active Input Bar (Screenshot 1 & 2)
          <div className="bg-white/95 border-t border-gray-200 px-3 py-2.5 flex items-center gap-2 shrink-0 shadow-lg z-20">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 border border-gray-200 flex items-center focus-within:border-purple-400 focus-within:bg-white transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full bg-transparent text-gray-900 text-sm focus:outline-none placeholder:text-gray-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-[#8DB8A3] hover:bg-[#8DB8A3]/90 text-[#3F7A63] flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer shrink-0 border border-[#3F7A63]/30"
              aria-label="Send"
            >
              <Send className="w-4 h-4 ml-0.5 text-[#3F7A63]" />
            </button>
          </div>
        ) : (
          // Persistent Special Offer Banner at bottom when chat has ended (Screenshot 4)
          <div className="bg-white border-t border-gray-200 p-3.5 shrink-0 shadow-xl z-20 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-purple-900 border border-purple-300 shrink-0">
                <img
                  src={reader.avatar}
                  alt={reader.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-gray-800 leading-snug">
                <span className="font-bold text-gray-950">Hi {session.customerName || 'there'},</span>{' '}
                Let's continue our chat. I've activated a <strong className="text-purple-700">Special Offer</strong> for you.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCashbackPopup(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] hover:brightness-110 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-purple-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Yes, Continue this chat</span>
            </button>
          </div>
        )}

        {/* ================= 5. POPUP: 100% CASHBACK BANNER (SCREENSHOT 3) ================= */}
        {showCashbackPopup && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 text-center shadow-2xl border border-purple-100 flex flex-col items-center animate-in zoom-in-95 duration-200">
              
              {/* Close Button X */}
              <button
                type="button"
                onClick={() => setShowCashbackPopup(false)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Colorful 100% CASHBACK Graphic Box (Screenshot 3) */}
              <div className="relative my-2">
                <div className="w-36 py-3 px-2 rounded-2xl bg-gradient-to-br from-[#FF9800] via-[#FF5722] to-[#E91E63] text-white font-black shadow-lg shadow-orange-500/30 transform -rotate-1">
                  <div className="text-2xl font-black tracking-tight leading-none">
                    100%
                  </div>
                  <div className="text-[11px] font-bold tracking-widest uppercase mt-0.5 bg-purple-900/40 rounded-md py-0.5">
                    CASHBACK
                  </div>
                </div>
              </div>

              {/* Title & Subtitle from Screenshot 3 */}
              <h4 className="text-base font-bold text-gray-950 mt-3 leading-snug">
                Enjoyed your free session?
              </h4>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Get £50 extra on £50 recharge
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Limited Time Offer · Valid for 30 mins.
              </p>

              {/* Recharge Now Button */}
              <button
                type="button"
                onClick={() => {
                  setShowCashbackPopup(false);
                  setShowRechargePacks(true);
                }}
                className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] hover:brightness-110 active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-900/30 transition-all cursor-pointer"
              >
                Recharge Now
              </button>

            </div>
          </div>
        )}

        {/* ================= 6. RECHARGE PACKAGES SELECTOR MODAL ================= */}
        {showRechargePacks && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-purple-100 flex flex-col text-gray-900 animate-in zoom-in-95">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-sm text-gray-900">
                    Add Minutes &amp; Continue Chat
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRechargePacks(false)}
                  className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {RECHARGE_PACKS.map((pack) => (
                  <button
                    key={pack.mins}
                    type="button"
                    onClick={() => handleRechargePackage(pack.mins)}
                    className="w-full p-3 rounded-2xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 flex items-center justify-between text-left transition-all cursor-pointer group active:scale-98"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {pack.mins} Minutes
                        </span>
                        {pack.badge && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
                            {pack.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {pack.label} · £{(pack.price / pack.mins).toFixed(2)}/min
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-purple-700 font-extrabold text-sm group-hover:translate-x-0.5 transition-transform">
                      <span>£{pack.price}</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                🔒 Safe &amp; Encrypted UK Checkout · 100% Satisfaction Guarantee
              </p>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
