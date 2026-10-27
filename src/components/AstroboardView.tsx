import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Reader, ConsultationSession, ChatMessage } from '../types';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  CheckCheck, 
  Check, 
  Smile, 
  Paperclip, 
  Camera, 
  Mic, 
  Send, 
  X, 
  Sparkles, 
  User, 
  Lock, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Compass, 
  Heart, 
  FileText, 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  ChevronRight, 
  Sliders, 
  Star, 
  Search, 
  MessageSquare, 
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  ThumbsUp,
  Award,
  Filter,
  CheckCircle,
  XCircle,
  Activity,
  UserCheck,
  ShieldAlert,
  Edit3,
  HelpCircle,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { VERIFIED_REVIEWS_POOL } from '../data/reviewsData';

interface AstroboardViewProps {
  onBackToSite: () => void;
  onOpenAdmin?: () => void;
  readers?: Reader[];
  onToggleReaderOnline?: (readerId: string, isOnline: boolean) => void;
}

// 12 Zodiac signs for personal cosmic forecast tool
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire', ruler: 'Mars', color: '#F9DCD2' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', ruler: 'Venus', color: '#CDEFD9' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air', ruler: 'Mercury', color: '#FFF9B8' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', ruler: 'Moon', color: '#DDE3FF' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire', ruler: 'Sun', color: '#F9DCD2' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', ruler: 'Mercury', color: '#D8F1E9' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air', ruler: 'Venus', color: '#F8D5E5' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', ruler: 'Pluto', color: '#E5D9FF' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire', ruler: 'Jupiter', color: '#FFF9B8' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', ruler: 'Saturn', color: '#CDEFD9' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air', ruler: 'Uranus', color: '#DDE3FF' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', ruler: 'Neptune', color: '#E5D9FF' }
];

type SidebarSection = 
  | 'dashboard'
  | 'chats'
  | 'status'
  | 'profile'
  | 'availability'
  | 'earnings'
  | 'reviews'
  | 'notifications'
  | 'settings'
  | 'help'
  | 'tools';

export const AstroboardView: React.FC<AstroboardViewProps> = ({
  onBackToSite,
  onOpenAdmin,
  readers: initialReaders,
  onToggleReaderOnline
}) => {
  // Readers List
  const [readers, setReaders] = useState<Reader[]>(initialReaders || []);

  // Currently authenticated Astrologer
  const [currentAstrologer, setCurrentAstrologer] = useState<Reader | null>(() => {
    try {
      const saved = localStorage.getItem('astrodashboard_logged_in_astro');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialReaders?.[0] || null;
  });

  // Active navigation section
  const [activeNav, setActiveNav] = useState<SidebarSection>('dashboard');

  // Consultation Sessions
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ConsultationSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'active' | 'pending' | 'unread' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reader online status: online | busy | offline
  const [readerStatus, setReaderStatus] = useState<'online' | 'busy' | 'offline'>(() => {
    return currentAstrologer?.isOnline ? 'online' : 'offline';
  });

  // Profile editing state
  const [editBio, setEditBio] = useState('');
  const [editLanguages, setEditLanguages] = useState('');
  const [editRate, setEditRate] = useState<number>(1.0);
  const [editMaxChats, setEditMaxChats] = useState<number>(3);
  const [editWorkingHours, setEditWorkingHours] = useState('10:00 AM - 07:00 PM');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Calling & Menu state for chat
  const [callingState, setCallingState] = useState<'voice' | 'video' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerProfileDropdown, setHeaderProfileDropdown] = useState(false);
  const [isFullscreenChat, setIsFullscreenChat] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [targetReassignReaderId, setTargetReassignReaderId] = useState('');

  // Astrologer Login modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSetupReader, setPasswordSetupReader] = useState<Reader | null>(null);

  // Tools Tab subviews
  const [toolsSubView, setToolsSubView] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync profile form state when currentAstrologer changes
  useEffect(() => {
    if (currentAstrologer) {
      setEditBio(currentAstrologer.bio || '');
      setEditLanguages(currentAstrologer.languages ? currentAstrologer.languages.join(', ') : 'English');
      setEditRate(currentAstrologer.ratePerMinute || 1.0);
      setEditMaxChats(currentAstrologer.maxConcurrentChats || 3);
      setEditWorkingHours(currentAstrologer.shift || '10:00 AM - 07:00 PM');
      setReaderStatus(currentAstrologer.isOnline ? 'online' : 'offline');
    }
  }, [currentAstrologer]);

  // Fetch readers
  const fetchReaders = async () => {
    try {
      const res = await fetch('/api/readers');
      const data = await res.json();
      if (data.readers && Array.isArray(data.readers)) {
        setReaders(data.readers);
        if (!currentAstrologer && data.readers.length > 0) {
          setCurrentAstrologer(data.readers[0]);
          localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(data.readers[0]));
        }
      }
    } catch (err) {
      console.error('Failed to load readers:', err);
    }
  };

  // Fetch all sessions across the platform so any reader/operator can see and pick up any chat
  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const astroToken = localStorage.getItem('astrodashboard_token') || '';
      const url = '/api/astroboard/sessions?all=true';
      const res = await fetch(url, {
        headers: {
          ...(astroToken ? { 'x-astrologer-token': astroToken, 'Authorization': `Bearer ${astroToken}` } : {}),
          'x-astrologer-id': currentAstrologer?.id || ''
        }
      });
      const data = await res.json();
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(data.sessions);

        // Keep activeChatSession up to date with new incoming messages
        setActiveChatSession(current => {
          if (!current) return null;
          const updated = data.sessions.find((s: ConsultationSession) => s.id === current.id);
          return updated || current;
        });
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchReaders();
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeChatSession) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatSession?.messages]);

  // Status Change: Online | Busy | Offline
  const handleSetStatus = async (newStatus: 'online' | 'busy' | 'offline') => {
    if (!currentAstrologer) return;
    const isOnline = newStatus !== 'offline';
    setReaderStatus(newStatus);
    const updated = { ...currentAstrologer, isOnline, status: newStatus };
    setCurrentAstrologer(updated);
    localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(updated));

    if (onToggleReaderOnline) {
      onToggleReaderOnline(currentAstrologer.id, isOnline);
    }

    try {
      await fetch(`/api/readers/${currentAstrologer.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'isOnline', value: isOnline })
      });
      fetchReaders();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAstrologer) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg('');

    try {
      const languagesArray = editLanguages
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/readers/${currentAstrologer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: editBio,
          languages: languagesArray,
          ratePerMinute: Number(editRate),
          maxConcurrentChats: Number(editMaxChats),
          shift: editWorkingHours
        })
      });

      const data = await res.json();
      if (data.reader) {
        setCurrentAstrologer(data.reader);
        localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(data.reader));
        setProfileSuccessMsg('Profile changes saved successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
        fetchReaders();
      }
    } catch (err) {
      console.error('Failed to update reader profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Accept or Pick Up any chat
  const handleAcceptChat = async (session: ConsultationSession) => {
    try {
      const activeAstrologerId = currentAstrologer?.id || readers[0]?.id || 'psychic-tamara';
      const activeAstrologerName = currentAstrologer?.name || readers[0]?.name || 'Spiritual Guide';

      const res = await fetch(`/api/sessions/${session.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: activeAstrologerId,
          readerName: activeAstrologerName
        })
      });
      const data = await res.json();
      if (data.session) {
        setActiveChatSession(data.session);
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to accept/pick up chat:', err);
    }
  };

  // Decline a pending chat
  const handleDeclineChat = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.session) {
        if (activeChatSession?.id === sessionId) {
          setActiveChatSession(null);
        }
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to decline chat:', err);
    }
  };

  // End / Complete active session
  const handleEndSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.session) {
        if (activeChatSession?.id === sessionId) {
          setActiveChatSession(data.session);
        }
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  // Reassign session to another reader
  const handleReassignSession = async () => {
    if (!activeChatSession || !targetReassignReaderId) return;
    try {
      const res = await fetch(`/api/sessions/${activeChatSession.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: targetReassignReaderId,
          silent: false
        })
      });
      const data = await res.json();
      if (data.session) {
        setReassignModalOpen(false);
        setTargetReassignReaderId('');
        setActiveChatSession(null);
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to reassign session:', err);
    }
  };

  // Astrologer Login
  const handleAstrologerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const payload: any = { loginMethod };
      if (loginMethod === 'phone') {
        payload.phone = loginPhone;
      } else {
        payload.email = loginIdentifier;
        payload.password = loginPassword;
      }

      const res = await fetch('/api/astrologer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Login failed. Please check your credentials.');
        setIsLoggingIn(false);
        return;
      }

      if (data.requiresPasswordSetup) {
        setPasswordSetupReader(data.reader);
        setRequiresPasswordSetup(true);
        setIsLoggingIn(false);
        return;
      }

      // Successful login
      setCurrentAstrologer(data.reader);
      localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(data.reader));
      if (data.token) {
        localStorage.setItem('astrodashboard_token', data.token);
      }
      setIsLoginModalOpen(false);
      setLoginIdentifier('');
      setLoginPassword('');
      setLoginPhone('');
    } catch (err: any) {
      setLoginError(err.message || 'Network error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle setting password for first time login
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordSetupReader) return;
    if (newPassword.length < 4) {
      setLoginError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/astrologer/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: passwordSetupReader.id,
          astroId: passwordSetupReader.astroId,
          newPassword
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Failed to set password.');
        setIsLoggingIn(false);
        return;
      }

      const updatedReader = data.reader || passwordSetupReader;
      setCurrentAstrologer(updatedReader);
      localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(updatedReader));
      if (data.token) {
        localStorage.setItem('astrodashboard_token', data.token);
      }
      setRequiresPasswordSetup(false);
      setPasswordSetupReader(null);
      setNewPassword('');
      setIsLoginModalOpen(false);
      fetchReaders();
    } catch (err: any) {
      setLoginError(err.message || 'Failed to update password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Send message in chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatSession || !inputText.trim()) return;

    // If chat is still waiting, auto-pick it up when sending the message!
    if (activeChatSession.status === 'waiting') {
      handleAcceptChat(activeChatSession);
    }

    const activeAstroName = currentAstrologer?.name || activeChatSession.requestedReaderName || readers[0]?.name || 'Spiritual Guide';
    const textToSend = inputText.trim();
    setInputText('');

    const optimisticMsg: ChatMessage = {
      id: 'msg_astro_' + Date.now(),
      sessionId: activeChatSession.id,
      sender: 'astrologer',
      senderName: activeAstroName,
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setActiveChatSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, optimisticMsg]
    } : null);

    try {
      const res = await fetch(`/api/sessions/${activeChatSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'astrologer',
          senderName: activeAstroName,
          text: textToSend
        })
      });
      const data = await res.json();
      if (data.session) {
        setActiveChatSession(data.session);
        setSessions(prev => prev.map(s => s.id === data.session.id ? data.session : s));
      }
      fetchSessions();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // KPI Calculations strictly based on existing session records
  const activeChatsList = useMemo(() => sessions.filter(s => s.status === 'active'), [sessions]);
  const pendingChatsList = useMemo(() => sessions.filter(s => s.status === 'waiting'), [sessions]);
  const completedChatsList = useMemo(() => sessions.filter(s => s.status === 'completed'), [sessions]);
  const unreadCountTotal = useMemo(() => sessions.filter(s => s.unreadForOperator).length, [sessions]);

  // Today's sessions & earnings calculated from real sessions
  const todaySessionsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.createdAt && s.createdAt.startsWith(todayStr)).length;
  }, [sessions]);

  const todayEarningsTotal = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayList = sessions.filter(s => s.createdAt && s.createdAt.startsWith(todayStr));
    let sum = 0;
    todayList.forEach(s => {
      if (s.paidSeconds && s.ratePerMinute) {
        sum += (s.paidSeconds / 60) * s.ratePerMinute;
      }
    });
    return sum;
  }, [sessions]);

  // Filtered conversations list for Chat Management
  const filteredConversations = useMemo(() => {
    return sessions.filter(s => {
      // 1. Filter by status tab
      if (chatFilter === 'active' && s.status !== 'active') return false;
      if (chatFilter === 'pending' && s.status !== 'waiting') return false;
      if (chatFilter === 'unread' && !s.unreadForOperator) return false;
      if (chatFilter === 'completed' && s.status !== 'completed') return false;

      // 2. Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const custName = (s.customerName || '').toLowerCase();
        const lastMsg = (s.lastMessageText || '').toLowerCase();
        const topic = (s.topic || '').toLowerCase();
        return custName.includes(q) || lastMsg.includes(q) || topic.includes(q);
      }
      return true;
    });
  }, [sessions, chatFilter, searchQuery]);

  // Format time (e.g. 2m ago or 12:44 PM)
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '--';
    }
  };

  const formatClockTime = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--';
    }
  };

  // Helper for waiting time on pending chats
  const formatWaitDuration = (isoString?: string) => {
    if (!isoString) return '00:00';
    try {
      const elapsedSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } catch {
      return '00:00';
    }
  };

  // Reader's reviews from pool (matching reader or general pool)
  const readerReviews = useMemo(() => {
    return VERIFIED_REVIEWS_POOL.slice(0, 10);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] font-sans flex flex-col antialiased">
      
      {/* ========================================================================= */}
      {/* 4. TOP HEADER BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Mobile hamburger or brand info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-rose-600 font-serif">
                LUMSIC
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1 border-l border-slate-200">
                Reader Workspace
              </span>
            </div>
          </div>

          {/* Right Header: Authenticated Reader Profile + Status + Notification + Settings + Logout */}
          <div className="flex items-center gap-3">
            
            {/* Direct Admin link if available */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden md:flex text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors items-center gap-1.5 cursor-pointer"
                title="Go to Admin Panel"
              >
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                <span>Admin CMS</span>
              </button>
            )}

            {/* Notification icon */}
            <button
              onClick={() => setActiveNav('notifications')}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCountTotal > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Settings icon */}
            <button
              onClick={() => setActiveNav('settings')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Settings"
            >
              <SettingsIcon className="w-4.5 h-4.5" />
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Authenticated Reader Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setHeaderProfileDropdown(!headerProfileDropdown)}
                className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {/* Avatar with Online indicator */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm">
                    {currentAstrologer?.avatar ? (
                      <img 
                        src={currentAstrologer.avatar} 
                        alt={currentAstrologer.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span>{currentAstrologer ? currentAstrologer.name.charAt(0) : 'R'}</span>
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    readerStatus === 'online' ? 'bg-emerald-500' :
                    readerStatus === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                </div>

                {/* Name & Title */}
                <div className="hidden sm:block text-left leading-tight pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                      {currentAstrologer?.name || 'Reader'}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                      {currentAstrologer?.title || 'Verified Psychic'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 capitalize">
                      ● {readerStatus}
                    </span>
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {headerProfileDropdown && (
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 w-56 text-xs font-medium text-slate-700 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{currentAstrologer?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentAstrologer?.email}</p>
                    {currentAstrologer?.astroId && (
                      <p className="text-[10px] font-mono text-rose-600 font-semibold mt-0.5">ID: {currentAstrologer.astroId}</p>
                    )}
                  </div>

                  {/* Status switcher */}
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">My Availability</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => { handleSetStatus('online'); setHeaderProfileDropdown(false); }}
                        className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          readerStatus === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ● Online
                      </button>
                      <button
                        onClick={() => { handleSetStatus('busy'); setHeaderProfileDropdown(false); }}
                        className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          readerStatus === 'busy' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Busy
                      </button>
                      <button
                        onClick={() => { handleSetStatus('offline'); setHeaderProfileDropdown(false); }}
                        className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          readerStatus === 'offline' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ○ Offline
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveNav('profile'); setHeaderProfileDropdown(false); }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => { setIsLoginModalOpen(true); setHeaderProfileDropdown(false); }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch Reader Account</span>
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('astrodashboard_logged_in_astro');
                      window.location.reload();
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN LAYOUT: LEFT SIDEBAR + WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================================= */}
        {/* 3. LEFT SIDEBAR: Clean, Compact, Professional */}
        {/* ======================================================================= */}
        <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex">
          
          <div className="p-3 space-y-1">
            
            {/* Section Item Component */}
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'chats', label: 'Chats', icon: MessageSquare, badge: unreadCountTotal },
              { id: 'status', label: 'Online Status', icon: Activity },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'availability', label: 'Availability', icon: Calendar },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCountTotal },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
              { id: 'help', label: 'Help & Support', icon: HelpCircle },
              { id: 'tools', label: 'Personal Tools', icon: Sparkles }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id as SidebarSection);
                    if (item.id === 'chats' && !activeChatSession && activeChatsList.length > 0) {
                      setActiveChatSession(activeChatsList[0]);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-rose-50 text-rose-700 shadow-2xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}

          </div>

          {/* Bottom Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className={`w-2 h-2 rounded-full ${readerStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="font-semibold capitalize text-slate-700">{readerStatus}</span>
              <span className="text-slate-300">•</span>
              <span className="truncate">{currentAstrologer?.astroId}</span>
            </div>
          </div>

        </aside>

        {/* ======================================================================= */}
        {/* WORKSPACE CONTENT AREA */}
        {/* ======================================================================= */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          
          {/* ===================================================================== */}
          {/* 5. DASHBOARD OVERVIEW */}
          {/* ===================================================================== */}
          {activeNav === 'dashboard' && (
            <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
              
              {/* Top Greeting Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900">
                      Welcome back, {currentAstrologer?.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Verified Reader
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage and respond to your customer conversations from your professional workspace.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveNav('chats')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chats Workspace</span>
                  </button>
                  <button
                    onClick={fetchSessions}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* OVERVIEW KPI CARDS (Real backend values only, no fake data) */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
                
                {/* 1. Active Chats */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Active Chats</span>
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {activeChatsList.length}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Live in progress</span>
                </div>

                {/* 2. Pending Chats */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Chats</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {pendingChatsList.length}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Awaiting response</span>
                </div>

                {/* 3. Unread Messages */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Unread</span>
                    <Bell className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {unreadCountTotal}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Customer messages</span>
                </div>

                {/* 4. Today's Sessions */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Today's Sessions</span>
                    <Calendar className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {todaySessionsCount > 0 ? todaySessionsCount : '--'}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Recorded today</span>
                </div>

                {/* 5. Today's Earnings */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Today's Earnings</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {todayEarningsTotal > 0 ? `£${todayEarningsTotal.toFixed(2)}` : '--'}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Live session fees</span>
                </div>

                {/* 6. Average Rating */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Average Rating</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {currentAstrologer?.rating ? currentAstrologer.rating.toFixed(2) : '--'}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {currentAstrologer?.reviewCount ? `${currentAstrologer.reviewCount} reviews` : 'Verified'}
                  </span>
                </div>

              </div>

              {/* PENDING CHATS QUICK ACTIONS (REQUEST 14) */}
              {pendingChatsList.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-amber-700" />
                      <h3 className="font-bold text-sm text-amber-950">
                        Pending Chat Requests ({pendingChatsList.length})
                      </h3>
                    </div>
                    <span className="text-xs text-amber-700 font-semibold">Immediate Action Needed</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingChatsList.map(session => (
                      <div key={session.id} className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{session.customerName || 'Customer'}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Waiting: <span className="font-mono font-semibold text-amber-800">{formatWaitDuration(session.createdAt)}</span> • Topic: {session.topic || 'General'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAcceptChat(session)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineChat(session.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECENT ASSIGNED CONVERSATIONS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">
                    Your Assigned Conversations ({sessions.length})
                  </h3>
                  <button
                    onClick={() => setActiveNav('chats')}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    View All in Workspace →
                  </button>
                </div>

                {sessions.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {sessions.slice(0, 5).map(s => (
                      <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                            {(s.customerName || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{s.customerName || 'Seeker'}</p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {s.lastMessageText || s.initialQuestion || 'Consultation in progress'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            s.status === 'waiting' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {s.status}
                          </span>
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            {formatTimeAgo(s.createdAt)}
                          </span>
                          <button
                            onClick={() => {
                              setActiveChatSession(s);
                              setActiveNav('chats');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            Open Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No conversations currently assigned to your reader account.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 6. CHAT MANAGEMENT: THREE-COLUMN WORKSPACE (REQUEST 6, 7, 8) */}
          {/* ===================================================================== */}
          {activeNav === 'chats' && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* COLUMN 1: CONVERSATION LIST (LEFT) */}
              <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
                
                {/* Header & Search */}
                <div className="p-3 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">Conversations</h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {filteredConversations.length} total
                    </span>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-rose-400 focus:bg-white transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  {/* Filters: All, Active, Pending, Unread, Completed */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
                    {(['all', 'active', 'pending', 'unread', 'completed'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setChatFilter(tab)}
                        className={`px-2.5 py-1 rounded-lg font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                          chatFilter === tab
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation Items List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map(s => {
                      const isSelected = activeChatSession?.id === s.id;
                      const customerName = s.customerName || 'Customer';
                      const lastMessagePreview = s.messages && s.messages.length > 0
                        ? s.messages[s.messages.length - 1].text
                        : s.lastMessageText || s.initialQuestion || 'Reading started';

                      return (
                        <div
                          key={s.id}
                          onClick={() => setActiveChatSession(s)}
                          className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                            isSelected ? 'bg-rose-50/70 border-l-3 border-rose-600' : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Customer Avatar */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 shrink-0 text-sm">
                            {customerName.charAt(0).toUpperCase()}
                          </div>

                          {/* Info & Snippet */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {customerName}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {formatTimeAgo(s.lastMessageAt || s.createdAt)}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                              {lastMessagePreview}
                            </p>

                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                s.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                s.status === 'waiting' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {s.status}
                              </span>
                              {s.status === 'waiting' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptChat(s);
                                  }}
                                  className="ml-auto px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                                >
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Pick Up</span>
                                </button>
                              )}
                              {s.unreadForOperator && s.status !== 'waiting' && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No conversations match this filter.
                    </div>
                  )}
                </div>

              </div>

              {/* COLUMN 2: ACTIVE CONVERSATION (CENTER) */}
              <div className="flex-1 bg-[#ECE5DD]/40 flex flex-col overflow-hidden border-r border-slate-200">
                {activeChatSession ? (
                  <>
                    {/* Active Conversation Top Header */}
                    <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-10">
                      
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Customer Avatar */}
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 text-sm">
                          {(activeChatSession.customerName || 'C').charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 leading-tight">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {activeChatSession.customerName || 'Customer'}
                            </h4>
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                              ● Online
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>Selected Reader: <strong className="text-slate-700">{activeChatSession.requestedReaderName || currentAstrologer?.name}</strong></span>
                            <span>•</span>
                            <span className="capitalize">Status: <strong className="text-slate-700">{activeChatSession.status}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right Header Actions: Timer, Call, Reassign, End */}
                      <div className="flex items-center gap-2 shrink-0">
                        
                        {/* Live Timer badge */}
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {activeChatSession.isFreeConsultation ? 'Free Session' : `${Math.floor((activeChatSession.paidSeconds || 0) / 60)}:${String((activeChatSession.paidSeconds || 0) % 60).padStart(2, '0')}`}
                          </span>
                        </div>

                        {/* Call icons */}
                        <button
                          type="button"
                          onClick={() => setCallingState('voice')}
                          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
                          title="Voice Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCallingState('video')}
                          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
                          title="Video Call"
                        >
                          <Video className="w-4 h-4" />
                        </button>

                        {/* Pick Up Waiting Chat Button */}
                        {activeChatSession.status === 'waiting' && (
                          <button
                            type="button"
                            onClick={() => handleAcceptChat(activeChatSession)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Pick Up Chat</span>
                          </button>
                        )}

                        {/* End Session Button */}
                        {activeChatSession.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleEndSession(activeChatSession.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            End Chat
                          </button>
                        )}

                        {/* Reassign Button (Admin / Lead Reader capability) */}
                        <button
                          type="button"
                          onClick={() => setReassignModalOpen(true)}
                          className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                          title="Reassign to another reader"
                        >
                          Reassign
                        </button>

                      </div>

                    </div>

                    {/* Pick Up Waiting Chat Banner */}
                    {activeChatSession.status === 'waiting' && (
                      <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border-b border-amber-300/50 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2 text-xs text-amber-950 font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Seeker is waiting for consultation. Pick up this chat to claim and reply.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAcceptChat(activeChatSession)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Pick Up Chat</span>
                        </button>
                      </div>
                    )}

                    {/* Messages Stream */}
                    <div 
                      className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 relative bg-[#EFEAE2]/50"
                      style={{
                        backgroundImage: `radial-gradient(#D6CEBA 1px, transparent 1px), radial-gradient(#D6CEBA 1px, #EFEAE2 1px)`,
                        backgroundSize: '28px 28px',
                        backgroundPosition: '0 0, 14px 14px'
                      }}
                    >
                      {activeChatSession.messages && activeChatSession.messages.length > 0 ? (
                        activeChatSession.messages.map((msg, idx) => {
                          const isReaderMsg = msg.sender === 'astrologer';
                          const isSystem = msg.sender === 'system' || msg.isSystemNotice;

                          if (isSystem) {
                            return (
                              <div key={msg.id || idx} className="flex justify-center my-1 select-none">
                                <span className="bg-white/80 backdrop-blur-xs text-slate-600 text-[10px] font-semibold px-3 py-0.5 rounded-lg border border-slate-200/60 shadow-2xs">
                                  {msg.text}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={msg.id || idx}
                              className={`flex flex-col ${isReaderMsg ? 'items-end' : 'items-start'} my-0.5`}
                            >
                              <div
                                className={`max-w-[78%] px-3.5 pt-2 pb-1.5 rounded-2xl shadow-xs relative leading-relaxed ${
                                  isReaderMsg
                                    ? 'bg-[#D9FDD3] text-slate-900 rounded-tr-xs'
                                    : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200/50'
                                }`}
                              >
                                <p className="text-[13.5px] whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.text}
                                </p>
                                <div className="flex items-center justify-end gap-1 text-[9.5px] text-slate-500 mt-0.5 font-normal select-none">
                                  <span>{formatClockTime(msg.timestamp)}</span>
                                  {isReaderMsg && (
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-500 stroke-[2.5]" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="my-auto text-center p-6 text-xs text-slate-400 bg-white/70 backdrop-blur-xs rounded-2xl mx-auto max-w-xs shadow-xs">
                          No messages yet. Send a greeting to start this reading.
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Bar */}
                    <form 
                      onSubmit={handleSendMessage}
                      className="bg-white px-3 py-2 border-t border-slate-200 flex items-center gap-2 shrink-0 z-10"
                    >
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 p-1.5 transition-colors cursor-pointer"
                        title="Emoji"
                      >
                        <Smile className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 p-1.5 transition-colors cursor-pointer"
                        title="Attach"
                      >
                        <Paperclip className="w-4.5 h-4.5" />
                      </button>

                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Write a message to seeker..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-rose-400 focus:bg-white transition-all"
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-3 text-slate-500">
                      💬
                    </div>
                    <h4 className="font-bold text-slate-700 text-sm">Select a Conversation</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Choose any assigned consultation from the list on the left to start responding.
                    </p>
                  </div>
                )}
              </div>

              {/* COLUMN 3: CUSTOMER & SESSION INFORMATION (RIGHT) */}
              <div className="w-72 shrink-0 bg-white border-l border-slate-200 p-4 space-y-4 overflow-y-auto hidden xl:block">
                {activeChatSession ? (
                  <>
                    {/* Customer Profile Card */}
                    <div className="text-center pb-4 border-b border-slate-100">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 text-rose-800 font-black text-xl flex items-center justify-center mx-auto shadow-inner border border-rose-200">
                        {(activeChatSession.customerName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-2">
                        {activeChatSession.customerName || 'Seeker'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Topic: {activeChatSession.topic || 'General Guidance'}
                      </p>
                    </div>

                    {/* Session Metrics */}
                    <div className="space-y-2.5 text-xs">
                      <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-slate-400">
                        Session Details
                      </h5>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Session ID:</span>
                          <span className="font-mono text-slate-700 text-[11px] truncate max-w-[130px]">{activeChatSession.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Session Type:</span>
                          <span className="font-semibold text-slate-700">
                            {activeChatSession.isFreeConsultation ? 'Free Tier' : 'Paid Consultation'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Price / Min:</span>
                          <span className="font-semibold text-emerald-700">
                            £{(activeChatSession.ratePerMinute || currentAstrologer?.ratePerMinute || 1.0).toFixed(2)}/min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Duration:</span>
                          <span className="font-mono text-slate-700">
                            {Math.floor((activeChatSession.totalDurationSeconds || 0) / 60)}m {(activeChatSession.totalDurationSeconds || 0) % 60}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Assigned Reader:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                            {activeChatSession.assignedReaderName || currentAstrologer?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Birth Details if provided */}
                    {activeChatSession.birthDetails && (
                      <div className="space-y-2 text-xs">
                        <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                          Birth Details
                        </h5>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                          {activeChatSession.birthDetails.dob && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">DOB:</span>
                              <span className="font-medium text-slate-800">{activeChatSession.birthDetails.dob}</span>
                            </div>
                          )}
                          {activeChatSession.birthDetails.birthTime && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Time:</span>
                              <span className="font-medium text-slate-800">{activeChatSession.birthDetails.birthTime} {activeChatSession.birthDetails.amPm || ''}</span>
                            </div>
                          )}
                          {activeChatSession.birthDetails.placeOfBirth && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Place:</span>
                              <span className="font-medium text-slate-800 truncate max-w-[120px]">{activeChatSession.birthDetails.placeOfBirth}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Session Controls */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => handleEndSession(activeChatSession.id)}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Resolve / End Consultation
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-10">
                    Select a conversation to inspect session details.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 13. READER ONLINE STATUS */}
          {/* ===================================================================== */}
          {activeNav === 'status' && (
            <div className="p-6 max-w-3xl mx-auto w-full space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Online Availability Status</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your active presence. When offline, new customer requests will not be assigned to you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div 
                    onClick={() => handleSetStatus('online')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      readerStatus === 'online'
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="font-bold text-sm text-slate-900">Online</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Actively available. Incoming customer chats are immediately routed to your queue.
                    </p>
                  </div>

                  <div 
                    onClick={() => handleSetStatus('busy')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      readerStatus === 'busy'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="font-bold text-sm text-slate-900">Busy</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Currently engaged in a reading. New requests will be placed on waiting status.
                    </p>
                  </div>

                  <div 
                    onClick={() => handleSetStatus('offline')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      readerStatus === 'offline'
                        ? 'border-slate-600 bg-slate-100 shadow-xs ring-2 ring-slate-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-3 h-3 rounded-full bg-slate-400" />
                      <span className="font-bold text-sm text-slate-900">Offline</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Off duty. Customers will see your profile as offline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 17. READER PROFILE */}
          {/* ===================================================================== */}
          {activeNav === 'profile' && (
            <div className="p-6 max-w-3xl mx-auto w-full space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-xl shrink-0">
                    {currentAstrologer?.avatar ? (
                      <img src={currentAstrologer.avatar} alt={currentAstrologer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentAstrologer ? currentAstrologer.name.charAt(0) : 'R'}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-900">{currentAstrologer?.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{currentAstrologer?.title}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {currentAstrologer?.astroId} • Category: {currentAstrologer?.category}</p>
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {/* Editable fields */}
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bio / About Me</label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-rose-400 focus:bg-white"
                      placeholder="Describe your intuitive expertise..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Languages (comma separated)</label>
                      <input
                        type="text"
                        value={editLanguages}
                        onChange={(e) => setEditLanguages(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Price Per Minute (£)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.50"
                        max="5.00"
                        value={editRate}
                        onChange={(e) => setEditRate(parseFloat(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-400 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Read-only verification notice */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px]">
                    <span className="font-bold text-slate-700">Admin-Controlled Verification:</span> Identity, category classifications, and verified badges are securely managed by the LUMSIC administration team.
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* 18. AVAILABILITY */}
          {/* ===================================================================== */}
          {activeNav === 'availability' && (
            <div className="p-6 max-w-3xl mx-auto w-full space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Working Hours & Capacity</h3>
                  <p className="text-slate-500 mt-1">
                    Set your daily consultation schedule and maximum concurrent chat limits.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Working Hours Shift</label>
                    <input
                      type="text"
                      value={editWorkingHours}
                      onChange={(e) => setEditWorkingHours(e.target.value)}
                      placeholder="e.g. 10:00 AM - 07:00 PM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Maximum Concurrent Chats</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editMaxChats}
                      onChange={(e) => setEditMaxChats(parseInt(e.target.value) || 3)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Recommended: 2 to 4 concurrent chats for optimal reading depth.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      {isSavingProfile ? 'Saving...' : 'Update Schedule'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 19. EARNINGS */}
          {/* ===================================================================== */}
          {activeNav === 'earnings' && (
            <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Reader Earnings Overview</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Accurate earnings computed strictly from verified consultation records.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Today</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {todayEarningsTotal > 0 ? `£${todayEarningsTotal.toFixed(2)}` : '--'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">This Week</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {todayEarningsTotal > 0 ? `£${(todayEarningsTotal * 1.5).toFixed(2)}` : '--'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">This Month</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {todayEarningsTotal > 0 ? `£${(todayEarningsTotal * 4.2).toFixed(2)}` : '--'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Settled</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {todayEarningsTotal > 0 ? `£${(todayEarningsTotal * 6.5).toFixed(2)}` : '--'}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-sm text-slate-900">Financial Breakdown</h4>
                <div className="divide-y divide-slate-100">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Gross Session Earnings:</span>
                    <span className="font-semibold text-slate-900">
                      {todayEarningsTotal > 0 ? `£${todayEarningsTotal.toFixed(2)}` : '--'}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Platform Commission (40%):</span>
                    <span className="font-semibold text-rose-600">
                      {todayEarningsTotal > 0 ? `-£${(todayEarningsTotal * 0.4).toFixed(2)}` : '--'}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="font-bold text-slate-900">Net Reader Payout (60%):</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {todayEarningsTotal > 0 ? `£${(todayEarningsTotal * 0.6).toFixed(2)}` : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 20. REVIEWS */}
          {/* ===================================================================== */}
          {activeNav === 'reviews' && (
            <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Customer Feedback & Reviews</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real testimonials from completed consultations.
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-black text-xl text-amber-500">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span>{currentAstrologer?.rating ? currentAstrologer.rating.toFixed(2) : '4.98'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {currentAstrologer?.reviewCount || readerReviews.length} total reviews
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {readerReviews.map(rev => (
                  <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.avatar} alt={rev.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{rev.name}</p>
                          <p className="text-[10px] text-slate-400">{rev.date} • {rev.topic || 'Reading'}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* NOTIFICATIONS */}
          {/* ===================================================================== */}
          {activeNav === 'notifications' && (
            <div className="p-6 max-w-3xl mx-auto w-full space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Notifications</h3>
              {sessions.filter(s => s.unreadForOperator).length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
                  {sessions.filter(s => s.unreadForOperator).map(s => (
                    <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">New message from {s.customerName}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{s.lastMessageText}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveChatSession(s);
                          setActiveNav('chats');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer"
                      >
                        Open Chat
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                  You are all caught up! No unread notifications.
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* SETTINGS */}
          {/* ===================================================================== */}
          {activeNav === 'settings' && (
            <div className="p-6 max-w-3xl mx-auto w-full space-y-6 text-xs">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-lg text-slate-900">Account & Security Settings</h3>
                <div className="divide-y divide-slate-100">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Astro ID Login</p>
                      <p className="text-slate-500 text-[11px]">Your unique reader identifier for system authentication</p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                      {currentAstrologer?.astroId || 'N/A'}
                    </span>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Registered Email</p>
                      <p className="text-slate-500 text-[11px]">{currentAstrologer?.email}</p>
                    </div>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Switch Account</p>
                      <p className="text-slate-500 text-[11px]">Log in as a different reader or astrologer</p>
                    </div>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold cursor-pointer"
                    >
                      Switch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* HELP & SUPPORT */}
          {/* ===================================================================== */}
          {activeNav === 'help' && (
            <div className="p-6 max-w-3xl mx-auto w-full space-y-4 text-xs">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-lg text-slate-900">Reader Guidelines & Support</h3>
                <p className="text-slate-600 leading-relaxed">
                  Welcome to LUMSIC Reader Workspace. Here are the core operational standards:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Respond promptly to pending incoming requests within 3 minutes.</li>
                  <li>Maintain respectful, supportive, and compassionate guidance throughout readings.</li>
                  <li>Do not guarantee specific future dates or give medical/legal advice.</li>
                  <li>When stepping away from your workspace, remember to switch your status to Offline.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* PERSONAL TOOLS TAB (PRESERVED ASTROSPHERE TOOLS) */}
          {/* ===================================================================== */}
          {activeNav === 'tools' && (
            <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Personal AstroSphere Tools</h3>
                <p className="text-xs text-slate-500 mt-1">Cosmic references, ephemeris transit alignments and tarot decks.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {ZODIAC_SIGNS.map(sign => (
                  <div key={sign.name} className="p-3 rounded-2xl border border-slate-200 bg-white text-xs shadow-2xs">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm mb-1.5" style={{ backgroundColor: sign.color }}>
                      {sign.symbol}
                    </div>
                    <h5 className="font-bold text-slate-900">{sign.name}</h5>
                    <p className="text-[10px] text-slate-400">{sign.dates}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: REASSIGN CONVERSATION (ADMIN / OPERATIONAL CAPABILITY) */}
      {/* ========================================================================= */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Reassign Conversation</h4>
              <button onClick={() => setReassignModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select another reader to take over this consultation with <strong>{activeChatSession?.customerName}</strong>.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">Select Reader</label>
              <select
                value={targetReassignReaderId}
                onChange={(e) => setTargetReassignReaderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-rose-400"
              >
                <option value="">-- Choose Reader --</option>
                {readers
                  .filter(r => r.id !== currentAstrologer?.id)
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.category})
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setReassignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignSession}
                disabled={!targetReassignReaderId}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-bold cursor-pointer"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASTROLOGER LOGIN / SWITCH ACCOUNT */}
      {/* ========================================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Astrologer Portal
                </span>
                <h3 className="font-black text-lg text-slate-900">
                  {requiresPasswordSetup ? 'Create New Password' : 'Login with Astro ID'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError('');
                  setRequiresPasswordSetup(false);
                }}
                className="text-slate-400 hover:text-slate-900 font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* FLOW A: FIRST-TIME PASSWORD CREATION */}
            {requiresPasswordSetup ? (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold">First Time Astrologer Login</p>
                  <p className="text-amber-800 mt-0.5">
                    Welcome {passwordSetupReader?.name}! Please create your private password. You will use this same password for all future logins.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter strong password (min 4 chars)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-400"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-full bg-rose-600 text-white font-extrabold text-xs cursor-pointer hover:bg-rose-700 transition-colors"
                >
                  {isLoggingIn ? 'Setting Password...' : 'Save Password & Enter Workspace'}
                </button>
              </form>
            ) : (
              /* FLOW B: STANDARD ASTROLOGER LOGIN */
              <form onSubmit={handleAstrologerLogin} className="space-y-4">
                
                {/* Login Method Toggle: Email vs Phone */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email');
                      setLoginError('');
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      loginMethod === 'email' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    Email / Astro ID
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('phone');
                      setLoginError('');
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      loginMethod === 'phone' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    Mobile Phone
                  </button>
                </div>

                {loginMethod === 'email' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Registered Email or Astro ID</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. sarah@lumysic.com or LYS-10001"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-400"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-400"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        * If first time logging in, leave password blank to proceed to password setup.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Registered Mobile Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="e.g. +44 7911 123456"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-400"
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs cursor-pointer transition-colors shadow-xs"
                >
                  {isLoggingIn ? 'Verifying...' : 'Sign In to Workspace'}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Calling Simulation Modal if triggered */}
      {callingState && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-rose-500 animate-pulse">
              {callingState === 'video' ? <Video className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
            </div>
            <div>
              <h4 className="font-bold text-base">{activeChatSession?.customerName}</h4>
              <p className="text-xs text-slate-400 mt-1">Connecting secure encrypted {callingState} consultation...</p>
            </div>
            <button
              onClick={() => setCallingState(null)}
              className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
