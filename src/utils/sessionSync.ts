import { ConsultationSession, ChatMessage, Reader, ConsultationStartData } from '../types';

export const SESSIONS_STORAGE_KEY = 'lumysic_consultation_sessions';
export const SESSIONS_CHANNEL_NAME = 'lumsic_sessions_channel';

// Get all stored consultation sessions
export function getStoredSessions(): ConsultationSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse stored sessions:', err);
    return [];
  }
}

// Save or update a session in local storage
export function saveStoredSession(session: ConsultationSession): ConsultationSession[] {
  if (typeof window === 'undefined' || !session || !session.id) return [];
  try {
    const current = getStoredSessions();
    const existingIndex = current.findIndex(s => s.id === session.id);
    let updated: ConsultationSession[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...session };
    } else {
      updated = [session, ...current];
    }
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem('lumysic_active_session', JSON.stringify(session));
    return updated;
  } catch (err) {
    console.warn('Failed to save session to storage:', err);
    return [];
  }
}

// Robust message deduplication helper by ID, and by identical text + sender within 5 seconds
export function deduplicateMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!messages || !Array.isArray(messages) || messages.length === 0) return [];
  const seenIds = new Set<string>();
  const result: ChatMessage[] = [];

  for (const msg of messages) {
    if (!msg || typeof msg.text !== 'string') continue;
    const cleanId = msg.id ? String(msg.id) : '';
    if (cleanId && seenIds.has(cleanId)) continue;

    const trimmedText = msg.text.trim().toLowerCase();
    const msgTime = new Date(msg.timestamp || 0).getTime();

    // Check if duplicate of an existing message with identical sender, text, and proximate timestamp
    const isDuplicate = result.some(prev => {
      if (prev.sender !== msg.sender) return false;
      if (prev.text.trim().toLowerCase() !== trimmedText) return false;
      const prevTime = new Date(prev.timestamp || 0).getTime();
      return Math.abs(msgTime - prevTime) < 5000;
    });

    if (isDuplicate) continue;

    if (cleanId) seenIds.add(cleanId);
    result.push(msg);
  }

  return result;
}

// Append a message to a stored session with deduplication
export function appendMessageToStoredSession(sessionId: string, message: ChatMessage): ConsultationSession | null {
  if (typeof window === 'undefined' || !sessionId || !message) return null;
  try {
    const current = getStoredSessions();
    const existingIndex = current.findIndex(s => s.id === sessionId);
    if (existingIndex >= 0) {
      const sess = current[existingIndex];
      const msgs = sess.messages || [];
      const cleanText = message.text?.trim().toLowerCase();
      const msgTime = new Date(message.timestamp || 0).getTime();
      const isDuplicate = msgs.some(m => 
        m.id === message.id || 
        (m.sender === message.sender && m.text?.trim().toLowerCase() === cleanText && Math.abs(new Date(m.timestamp || 0).getTime() - msgTime) < 5000)
      );
      if (!isDuplicate) {
        const updatedMsgs = deduplicateMessages([...msgs, message]);
        const updatedSess: ConsultationSession = {
          ...sess,
          messages: updatedMsgs,
          updatedAt: new Date().toISOString()
        };
        current[existingIndex] = updatedSess;
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(current));
        localStorage.setItem('lumysic_active_session', JSON.stringify(updatedSess));
        return updatedSess;
      }
      return sess;
    }
    return null;
  } catch (err) {
    console.warn('Failed to append message to stored session:', err);
    return null;
  }
}

export type SessionEventType = 
  | 'new_session' 
  | 'message_received' 
  | 'session_updated' 
  | 'session_accepted' 
  | 'session_declined' 
  | 'session_ended'
  | 'typing';

// Broadcast an event to other tabs/windows
export function broadcastSessionEvent(type: SessionEventType, data: any) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SESSIONS_CHANNEL_NAME);
      channel.postMessage({ type, payload: data, data, timestamp: Date.now() });
      setTimeout(() => channel.close(), 100);
    }
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }

  // Also dispatch a DOM window event on current window
  try {
    window.dispatchEvent(new CustomEvent('lumsic_session_event', { detail: { type, payload: data, data } }));
  } catch {}
}

// Create a robust, standardized consultation session object
export function createResilientSession(
  reader: Reader,
  startData?: Partial<ConsultationStartData>,
  customerOverride?: { id?: string; name?: string; phone?: string; email?: string }
): ConsultationSession {
  const customerId = customerOverride?.id || (typeof window !== 'undefined' ? localStorage.getItem('astral_customer_id') : '') || ('cust_' + Date.now());
  const userName = startData?.firstName || startData?.fullName || customerOverride?.name || (typeof window !== 'undefined' ? localStorage.getItem('lumysic_user_name') : '') || 'Valued Seeker';
  const userPhone = startData?.phone || customerOverride?.phone || (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone')) : '') || '';
  const userEmail = customerOverride?.email || (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_email') || localStorage.getItem('astral_customer_email')) : '') || '';
  const userGender = startData?.birthDetails?.gender || startData?.gender || 'Not specified';
  const userDob = startData?.birthDetails?.dob || 'Not specified';
  const userTob = startData?.birthDetails?.unknownTime 
    ? 'Not known' 
    : (startData?.birthDetails?.birthTime ? `${startData.birthDetails.birthTime} ${startData.birthDetails.amPm || ''}`.trim() : 'Not specified');
  const userPob = startData?.birthDetails?.placeOfBirth || 'Not specified';
  const initialText = startData?.question || `Hello ${reader.name}, I am connecting with you for guidance today.`;
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const initialMessage: ChatMessage = {
    id: 'msg_init_' + Date.now(),
    sessionId,
    sender: 'customer',
    senderName: userName,
    text: initialText,
    timestamp: new Date().toISOString()
  };

  const newSession: ConsultationSession = {
    id: sessionId,
    customerId,
    customerName: userName,
    customerPhone: userPhone.trim() || undefined,
    customerEmail: userEmail.trim() || undefined,
    requestedReaderId: reader.id,
    requestedReaderName: reader.name,
    requestedAstroId: reader.astroId,
    assignedReaderId: reader.id,
    assignedReaderName: reader.name,
    assignedAstroId: reader.astroId,
    readerId: reader.id,
    readerName: reader.name,
    readerAvatar: reader.avatar,
    topic: startData?.topic || 'Love, Career & Life Guidance',
    readingType: startData?.readingType || reader.category || 'Live Consultation',
    status: 'waiting',
    startTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isFreeConsultation: true,
    freeMinutesTotal: 2,
    freeSecondsRemaining: 180,
    totalDurationSeconds: 0,
    paidSeconds: 0,
    ratePerMinute: reader.ratePerMinute || 1.75,
    isFreeTier: true,
    paymentStatus: 'free_tier',
    unreadForOperator: true,
    messages: [initialMessage],
    birthDetails: startData?.birthDetails || {
      name: userName,
      gender: userGender,
      dob: userDob,
      birthTime: userTob,
      placeOfBirth: userPob
    }
  };

  return newSession;
}
