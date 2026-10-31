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

// Append a message to a stored session
export function appendMessageToStoredSession(sessionId: string, message: ChatMessage): ConsultationSession | null {
  if (typeof window === 'undefined' || !sessionId || !message) return null;
  try {
    const current = getStoredSessions();
    const existingIndex = current.findIndex(s => s.id === sessionId);
    if (existingIndex >= 0) {
      const sess = current[existingIndex];
      const msgs = sess.messages || [];
      if (!msgs.some(m => m.id === message.id)) {
        const updatedSess: ConsultationSession = {
          ...sess,
          messages: [...msgs, message],
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
  | 'session_ended';

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
  customerOverride?: { id?: string; name?: string }
): ConsultationSession {
  const customerId = customerOverride?.id || (typeof window !== 'undefined' ? localStorage.getItem('astral_customer_id') : '') || ('cust_' + Date.now());
  const userName = startData?.firstName || startData?.fullName || customerOverride?.name || (typeof window !== 'undefined' ? localStorage.getItem('lumysic_user_name') : '') || 'Valued Seeker';
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
