import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ShieldCheck, Compass } from 'lucide-react';
import { AdminCMSPanel } from './components/AdminCMSPanel';
import { AdminStandaloneApp } from './components/AdminStandaloneApp';
import { Header } from './components/Header';
import { OfferBanner } from './components/OfferBanner';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { ChooseYourPath } from './components/ChooseYourPath';
import { AstrologersCarousel } from './components/AstrologersCarousel';
import { HowItWorks } from './components/HowItWorks';
import { TestimonialsSection } from './components/TestimonialsSection';
import { WhyAstralSection } from './components/WhyAstralSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import { SanctuaryHub } from './components/SanctuaryHub';
import { ReaderCollective } from './components/ReaderCollective';
import { ReaderProfileModal } from './components/ReaderProfileModal';
import { CustomerIntakeModal } from './components/CustomerIntakeModal';
import { LiveChatView } from './components/LiveChatView';
import { CompatibilitySection } from './components/CompatibilitySection';
import { LearnSection } from './components/LearnSection';
import { Footer } from './components/Footer';
import { BirthChartModal } from './components/BirthChartModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AstralUniversalExplorer } from './components/AstralUniversalExplorer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { MyAstralDashboardModal } from './components/MyAstralDashboardModal';
import { StarryBackground } from './components/StarryBackground';
import { MobileFeedView } from './components/MobileFeedView';
import { DailyTarotModal } from './components/DailyTarotModal';
import { DailyHoroscopeModal } from './components/DailyHoroscopeModal';
import { SacredRitualsModal } from './components/SacredRitualsModal';
import { RitualsAndSpellsSection } from './components/RitualsAndSpellsSection';
import { AuthScreen, AuthRedirectTarget } from './components/AuthScreen';
import { supabase, signOutUser, getUserProfile, isSupabaseConfigured } from './lib/supabase';
import { NavigationDrawer } from './components/NavigationDrawer';
import { WalletTransactionModal } from './components/WalletTransactionModal';
import { SupportChatModal } from './components/SupportChatModal';
import { RedeemGiftCardModal } from './components/RedeemGiftCardModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ViewAllReadersPage } from './components/ViewAllReadersPage';
import { LegalPolicyPage, PolicyPageId } from './components/LegalPolicyPage';
import { detectUserGeo, CountryInfo } from './utils/currency';
import { Reader, ConsultationSession, CustomerProfile, ConsultationStartData, ChatMessage } from './types';
import { READERS } from './data/readers';
import { 
  getStoredSessions, 
  saveStoredSession, 
  appendMessageToStoredSession, 
  broadcastSessionEvent, 
  createResilientSession, 
  SESSIONS_CHANNEL_NAME 
} from './utils/sessionSync';
import { db } from './lib/firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function App() {


  // Admin View State - automatically opens when navigating to admin/lumsic.online, /admin, or ?admin=true
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path.includes('admin/lumsic.online') ||
        hash.includes('admin/lumsic.online') ||
        path.includes('/admin') ||
        hash.includes('/admin') ||
        params.get('admin') === 'true' ||
        params.get('panel') === 'admin'
      ) {
        return true;
      }
    }
    return false;
  });

  // Readers state
  const [readers, setReaders] = useState<Reader[]>(READERS);

  // Modals state
  const [selectedProfileReader, setSelectedProfileReader] = useState<Reader | null>(null);
  const [selectedIntakeReader, setSelectedIntakeReader] = useState<Reader | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [explorerCategory, setExplorerCategory] = useState<string>('astrology');
  const [isBirthChartModalOpen, setIsBirthChartModalOpen] = useState(false);
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);
  const [isHoroscopeModalOpen, setIsHoroscopeModalOpen] = useState(false);
  const [isRitualsModalOpen, setIsRitualsModalOpen] = useState(false);
  const [ritualsInitialTab, setRitualsInitialTab] = useState<'spell' | 'healing' | 'shop'>('spell');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectTarget, setAuthRedirectTarget] = useState<AuthRedirectTarget | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [activePolicyPage, setActivePolicyPage] = useState<PolicyPageId | null>(null);

  // Trigger popup screen for Birth Chart
  const handleOpenBirthChart = () => {
    setIsBirthChartModalOpen(true);
  };

  // Navigation History & Back Button tracking
  const [navHistory, setNavHistory] = useState<string[]>(['home']);
  const [currentSection, setCurrentSection] = useState<string>('home');
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('astral_is_logged_in') === 'true';
  });

  const [detectedGeo, setDetectedGeo] = useState<CountryInfo | undefined>(undefined);

  // Global Language & Currency (Auto-detected by IP & Country)
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    return localStorage.getItem('astral_currency') || 'USD';
  });

  // Auto-detect Geo and Currency based on IP / Timezone on startup
  useEffect(() => {
    detectUserGeo().then(geo => {
      if (geo) {
        setDetectedGeo(geo);
        if (!localStorage.getItem('astral_currency')) {
          setCurrentCurrency(geo.currency);
          localStorage.setItem('astral_currency', geo.currency);
        }
      }
    });
  }, []);

  // Supabase Auth session synchronization & persistent profile hydration
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check existing active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        localStorage.setItem('astral_is_logged_in', 'true');
        localStorage.setItem('lumysic_is_logged_in', 'true');
        
        getUserProfile(session.user.id).then(profile => {
          if (profile) {
            setCustomer(prev => ({
              ...prev,
              id: profile.id,
              name: profile.full_name || prev.name,
              email: profile.email || prev.email,
              phone: profile.phone || prev.phone,
              country: profile.country || prev.country,
              countryCode: profile.country_code || prev.countryCode,
              currency: profile.currency || prev.currency
            }));
            if (profile.full_name) {
              localStorage.setItem('astral_customer_name', profile.full_name);
              localStorage.setItem('lumysic_user_name', profile.full_name);
            }
            if (profile.phone) {
              localStorage.setItem('astral_customer_phone', profile.phone);
              localStorage.setItem('lumysic_user_phone', profile.phone);
            }
            if (profile.email) {
              localStorage.setItem('lumysic_user_email', profile.email);
            }
          }
        });
      }
    });

    // Subscribe to live auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        localStorage.setItem('astral_is_logged_in', 'true');
        localStorage.setItem('lumysic_is_logged_in', 'true');

        getUserProfile(session.user.id).then(profile => {
          if (profile) {
            setCustomer(prev => ({
              ...prev,
              id: profile.id,
              name: profile.full_name || prev.name,
              email: profile.email || prev.email,
              phone: profile.phone || prev.phone,
              country: profile.country || prev.country,
              countryCode: profile.country_code || prev.countryCode,
              currency: profile.currency || prev.currency
            }));
            if (profile.full_name) {
              localStorage.setItem('astral_customer_name', profile.full_name);
              localStorage.setItem('lumysic_user_name', profile.full_name);
            }
            if (profile.phone) {
              localStorage.setItem('astral_customer_phone', profile.phone);
              localStorage.setItem('lumysic_user_phone', profile.phone);
            }
            if (profile.email) {
              localStorage.setItem('lumysic_user_email', profile.email);
            }
          }
        });
      } else if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem('astral_is_logged_in');
        localStorage.removeItem('lumysic_is_logged_in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Customer Profile (saved or empty when not logged in)
  const [customer, setCustomer] = useState<CustomerProfile>(() => {
    const savedId = localStorage.getItem('astral_customer_id') || 'cust_' + Date.now();
    localStorage.setItem('astral_customer_id', savedId);
    const savedName = localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name') || '';
    const savedPhone = localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone') || '';
    const savedEmail = localStorage.getItem('lumysic_user_email') || localStorage.getItem('astral_customer_email') || '';
    return {
      id: savedId,
      name: savedName,
      phone: savedPhone,
      email: savedEmail,
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      totalConsultations: 0
    };
  });

  // Owner Admin Authorization: strictly enabled ONLY when authenticated with bankush014@gmail.com
  const OWNER_ADMIN_EMAILS = ['bankush014@gmail.com', 'banksuh014@gmail.com', 'info.lumsic@gmail.com'];
  const currentUserEmail = (
    customer.email ||
    (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_email') || localStorage.getItem('astral_customer_email') || '') : '')
  ).trim().toLowerCase();
  const isOwnerAdmin = Boolean(
    isAuthenticated &&
    currentUserEmail &&
    OWNER_ADMIN_EMAILS.includes(currentUserEmail)
  );

  // Wallet Balances State (clean 0 balance for new seekers)
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astral_wallet_bal');
    return saved ? parseFloat(saved) : 0;
  });
  const [rechargeBalance, setRechargeBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astral_recharge_bal');
    return saved ? parseFloat(saved) : 0;
  });
  const [cashbackBalance, setCashbackBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astral_cashback_bal');
    return saved ? parseFloat(saved) : 0;
  });

  // Drawer & Wallet Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'wallet' | 'referral' | 'order' | 'remedies'>('wallet');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Recharge & Redeem Handlers
  const handleRechargeSuccess = (addedRecharge: number, addedCashback: number) => {
    setRechargeBalance(prev => {
      const next = prev + addedRecharge;
      localStorage.setItem('astral_recharge_bal', next.toString());
      return next;
    });
    setCashbackBalance(prev => {
      const next = prev + addedCashback;
      localStorage.setItem('astral_cashback_bal', next.toString());
      return next;
    });
    setAvailableBalance(prev => {
      const next = prev + addedRecharge + addedCashback;
      localStorage.setItem('astral_wallet_bal', next.toString());
      return next;
    });
  };

  const handleRedeemSuccess = (addedAmount: number) => {
    setCashbackBalance(prev => {
      const next = prev + addedAmount;
      localStorage.setItem('astral_cashback_bal', next.toString());
      return next;
    });
    setAvailableBalance(prev => {
      const next = prev + addedAmount;
      localStorage.setItem('astral_wallet_bal', next.toString());
      return next;
    });
  };

  // Synchronize backend wallet balance and check referral link parameters
  useEffect(() => {
    // 1. Check URL parameters for referral link (e.g. ?ref=LUM-XXXXX)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      if (refParam && customer.id) {
        localStorage.setItem('lumysic_pending_ref_code', refParam);
        fetch('/api/referral/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: customer.id,
            referralCode: refParam,
            customerName: customer.name
          })
        }).catch(() => {});
      }
    } catch {
      // ignore
    }

    // 2. Fetch real verified wallet balance from backend
    if (customer.id) {
      fetch(`/api/wallet/info/${customer.id}?currency=${currentCurrency}`)
        .then(res => res.json())
        .then(data => {
          if (data.wallet) {
            setAvailableBalance(data.wallet.totalBalance);
            setRechargeBalance(data.wallet.purchasedBalance);
            setCashbackBalance(data.wallet.bonusBalance);
            localStorage.setItem('astral_wallet_bal', data.wallet.totalBalance.toString());
            localStorage.setItem('astral_recharge_bal', data.wallet.purchasedBalance.toString());
            localStorage.setItem('astral_cashback_bal', data.wallet.bonusBalance.toString());
          }
        })
        .catch(() => {});
    }
  }, [customer.id, currentCurrency]);

  // Active Live Chat Session
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Scroll listener for floating back button and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolledDown(scrollY > 220);
      if (scrollY < 140) {
        setCurrentSection('home');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Fetch readers from server with resilient caching fallback
  const reloadReaders = useCallback(() => {
    fetch('/api/readers')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.readers && Array.isArray(data.readers) && data.readers.length > 0) {
          setReaders(data.readers);
          try {
            localStorage.setItem('lumsic_cached_readers', JSON.stringify(data.readers));
          } catch {}
        }
      })
      .catch(err => {
        console.warn('Reader catalog server fetch notice (using cache/defaults):', err);
        try {
          const cached = localStorage.getItem('lumsic_cached_readers');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReaders(parsed);
            }
          }
        } catch {}
      });
  }, []);

  // Fetch readers on initial mount and rehydrate whenever returning from admin panel to ensure live site updates
  useEffect(() => {
    reloadReaders();
  }, [isAdminView, reloadReaders]);

  // Real-time SSE listener for consultation sessions and instant live astrologer/reader updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('session_accepted', (e) => {
      try {
        const { session } = JSON.parse(e.data);
        if (activeSession && session.id === activeSession.id) {
          setActiveSession(session);
        }
      } catch (err) {
        console.error('Failed to parse session_accepted event:', err);
      }
    });

    eventSource.addEventListener('message_received', (e) => {
      try {
        const { sessionId, message, session } = JSON.parse(e.data);
        if (activeSession && activeSession.id === sessionId) {
          if (session) {
            setActiveSession(session);
          } else {
            setActiveSession(prev => prev ? ({
              ...prev,
              messages: [...prev.messages, message]
            }) : null);
          }
        }
      } catch (err) {
        console.error('Failed to parse message_received event:', err);
      }
    });

    // Real-time reader update: instant live reflection of photo, rate, bio, or status changes
    eventSource.addEventListener('reader_updated', (e) => {
      try {
        const raw = JSON.parse(e.data);
        const updated = raw.reader || raw;
        if (updated && updated.id) {
          setReaders(prev => prev.map(r => (r.id === updated.id || (r.astroId && r.astroId === updated.astroId)) ? { ...r, ...updated } : r));
          setSelectedProfileReader(prev => (prev && (prev.id === updated.id || prev.astroId === updated.astroId)) ? { ...prev, ...updated } : prev);
        }
      } catch (err) {
        console.error('Failed to parse reader_updated event:', err);
      }
    });

    // Real-time reader created: new astrologer immediately appears on the website
    eventSource.addEventListener('reader_created', (e) => {
      try {
        const raw = JSON.parse(e.data);
        const created = raw.reader || raw;
        if (created && created.id) {
          setReaders(prev => [created, ...prev.filter(r => r.id !== created.id)]);
        }
      } catch (err) {
        console.error('Failed to parse reader_created event:', err);
      }
    });

    // Real-time reader deleted
    eventSource.addEventListener('reader_deleted', (e) => {
      try {
        const { id } = JSON.parse(e.data);
        if (id) {
          setReaders(prev => prev.filter(r => r.id !== id));
          setSelectedProfileReader(prev => (prev && prev.id === id) ? null : prev);
        }
      } catch (err) {
        console.error('Failed to parse reader_deleted event:', err);
      }
    });

    return () => eventSource.close();
  }, [activeSession]);

  // Real-time Firestore synchronization for active consultation session (0ms cross-platform sync)
  useEffect(() => {
    if (!activeSession?.id) return;
    const unsub = onSnapshot(doc(db, 'sessions', activeSession.id), (docSnap) => {
      if (docSnap.exists()) {
        const remoteSession = docSnap.data() as ConsultationSession;
        if (remoteSession && remoteSession.id === activeSession.id) {
          setActiveSession(curr => {
            if (!curr || curr.id !== remoteSession.id) return curr;
            const remoteMsgs = remoteSession.messages || [];
            const currMsgs = curr.messages || [];
            if (remoteMsgs.length > currMsgs.length || remoteSession.status !== curr.status) {
              return { ...curr, ...remoteSession };
            }
            return curr;
          });
        }
      }
    }, (err) => {
      console.warn('Active session Firestore listener notice:', err);
    });
    return () => unsub();
  }, [activeSession?.id]);

  // Real-time cross-tab synchronization for active consultation session
  useEffect(() => {
    const handleIncomingSessionEvent = (e: any) => {
      const { type, payload, data } = e.detail || e.data || {};
      const sessionData = payload || data;
      if (!type || !sessionData) return;

      if (type === 'message_received' && sessionData.sessionId) {
        setActiveSession(prev => {
          if (!prev || prev.id !== sessionData.sessionId) return prev;
          const msgs = prev.messages || [];
          if (msgs.some(m => m.id === sessionData.id)) return prev;
          return { ...prev, messages: [...msgs, sessionData] };
        });
      } else if ((type === 'session_updated' || type === 'session_accepted') && sessionData.id) {
        setActiveSession(prev => (prev && prev.id === sessionData.id ? { ...prev, ...sessionData, status: 'active' } : prev));
      } else if (type === 'session_ended' && sessionData.id) {
        setActiveSession(prev => (prev && prev.id === sessionData.id ? { ...prev, ...sessionData, status: 'completed' } : prev));
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(SESSIONS_CHANNEL_NAME);
        channel.onmessage = (event) => handleIncomingSessionEvent(event);
      }
    } catch {}

    const onCustomEvent = (event: Event) => handleIncomingSessionEvent(event as CustomEvent);
    window.addEventListener('lumsic_session_event', onCustomEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('lumsic_session_event', onCustomEvent);
    };
  }, []);

  // Go to Home function
  const handleGoHome = () => {
    setSelectedProfileReader(null);
    setSelectedIntakeReader(null);
    setIsSearchOpen(false);
    setIsDashboardOpen(false);
    setIsExplorerOpen(false);
    setIsBirthChartModalOpen(false);
    setIsChatOpen(false);
    setCurrentSection('home');
    setNavHistory(['home']);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const homeEl = document.getElementById('home');
    if (homeEl) {
      homeEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Navigate to sections directly
  const handleNavigateSection = (sectionId: string, pushHistory = true) => {
    if (sectionId === 'home') {
      handleGoHome();
      return;
    }

    if (sectionId === 'all-readers') {
      setIsViewAllOpen(true);
      return;
    }

    if (
      sectionId === 'terms' ||
      sectionId === 'refund' ||
      sectionId === 'privacy' ||
      sectionId === 'cookies' ||
      sectionId === 'disclaimer' ||
      sectionId === 'community' ||
      sectionId === 'wallet-terms' ||
      sectionId === 'contact'
    ) {
      if (sectionId === 'contact') {
        setIsSupportOpen(true);
        return;
      }
      setActivePolicyPage(sectionId as PolicyPageId);
      return;
    }

    if (sectionId === 'admin') {
      setIsAdminView(true);
      return;
    }

    if (sectionId === 'birth-chart') {
      handleOpenBirthChart();
      return;
    }
    if (sectionId === 'tarot') {
      setIsTarotModalOpen(true);
      return;
    }
    if (sectionId === 'horoscope') {
      setIsHoroscopeModalOpen(true);
      return;
    }
    if (sectionId === 'rituals' || sectionId === 'spells' || sectionId === 'healing' || sectionId === 'shop' || sectionId === 'astral-shop') {
      const targetTab: 'spell' | 'healing' | 'shop' = 
        (sectionId === 'shop' || sectionId === 'astral-shop') ? 'shop' : 
        sectionId === 'healing' ? 'healing' : 'spell';
      setRitualsInitialTab(targetTab);
      window.dispatchEvent(new CustomEvent('switch_rituals_tab', { detail: { tab: targetTab } }));

      const el = document.getElementById('rituals');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsRitualsModalOpen(true);
      }
      return;
    }

    setCurrentSection(sectionId);
    if (pushHistory) {
      setNavHistory(prev => {
        if (prev[prev.length - 1] === sectionId) return prev;
        return [...prev, sectionId];
      });
    }

    const jumpToTarget = () => {
      const targetId = (sectionId === 'shop' || sectionId === 'astral-shop') ? 'astral-shop' : sectionId;
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 76;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementPosition - headerOffset);
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    };

    jumpToTarget();
  };

  const handleOpenExplorer = (categoryId: string = 'astrology') => {
    setExplorerCategory(categoryId);
    setIsExplorerOpen(true);
  };

  // Consultation Handlers
  const handleInitiateChatWithReader = (reader: Reader) => {
    setSelectedProfileReader(null);
    // Directly open intake modal to gather name & birth details without blocking with password auth
    setSelectedIntakeReader(reader);
  };

  const handleQuickStartConsultation = () => {
    const reader = readers.find(r => r.id === 'psychic-tamara') || readers.find(r => r.isOnline && r.isChatEnabled !== false) || readers[0];
    if (reader) {
      handleInitiateChatWithReader(reader);
    }
  };

  const handleIntakeSubmit = (startData: ConsultationStartData) => {
    const updatedCustomer: CustomerProfile = {
      ...customer,
      name: startData.firstName,
      birthDetails: startData.birthDetails || customer.birthDetails
    };
    setCustomer(updatedCustomer);
    localStorage.setItem('astral_customer_name', startData.firstName);
    localStorage.setItem('lumysic_user_name', startData.firstName);
    const reader = selectedIntakeReader || readers[0];
    setSelectedIntakeReader(null);
    createSession(reader, startData);
  };

  const createSession = async (reader: Reader, startData?: Partial<ConsultationStartData>) => {
    const targetReader = reader || readers[0];
    if (!targetReader) return;

    const customerId = customer.id || localStorage.getItem('astral_customer_id') || ('cust_' + Date.now());
    const userName = startData?.firstName || startData?.fullName || customer.name || localStorage.getItem('lumysic_user_name') || 'Valued Seeker';
    const userGender = startData?.birthDetails?.gender || startData?.gender || 'Not specified';
    const userDob = startData?.birthDetails?.dob || 'Not specified';
    const userTob = startData?.birthDetails?.unknownTime
      ? 'Not known'
      : (startData?.birthDetails?.birthTime ? `${startData.birthDetails.birthTime} ${startData.birthDetails.amPm || ''}`.trim() : 'Not specified');
    const userPob = startData?.birthDetails?.placeOfBirth || 'Not specified';

    // 1. Create robust standardized session locally first for 0ms lag
    const resilientSession = createResilientSession(targetReader, startData, { id: customerId, name: userName });

    // 2. Persist locally and broadcast immediately across tabs (Astrologer & Admin dashboards receive it instantly!)
    saveStoredSession(resilientSession);
    broadcastSessionEvent('new_session', resilientSession);
    setActiveSession(resilientSession);
    setIsChatOpen(true);

    // 3. Write directly to Firestore: Guarantees delivery to Admin Dashboard across all domains & devices
    try {
      await setDoc(doc(db, 'sessions', resilientSession.id), resilientSession);
    } catch (fsErr) {
      console.warn('Firestore session create notice:', fsErr);
    }

    // 4. Register with backend server asynchronously without blocking or alerting
    try {
      const clientRequestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const res = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientRequestId,
          customerId,
          firstName: userName,
          customerName: userName,
          readingType: startData?.readingType || targetReader.category || 'Live Consultation',
          topic: startData?.topic || 'Love, Career & Life Guidance',
          initialQuestion: startData?.question || `Hello ${targetReader.name}, I am connecting with you for guidance today.`,
          birthDetails: startData?.birthDetails || {
            name: userName,
            gender: userGender,
            dob: userDob,
            birthTime: userTob,
            placeOfBirth: userPob
          },
          requestedReaderId: targetReader.id,
          existingSessionId: resilientSession.id
        })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.session) {
          if (data.session.sessionToken) {
            try { sessionStorage.setItem(`lumsic_session_token_${data.session.id}`, data.session.sessionToken); } catch {}
          }
          saveStoredSession(data.session);
          broadcastSessionEvent('new_session', data.session);
          setActiveSession(data.session);
          try {
            await setDoc(doc(db, 'sessions', data.session.id), data.session, { merge: true });
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Backend session registration notice (operating resiliently):', err);
    }
  };
  
  const handleSendMessage = async (text: string) => {
    if (!activeSession || !text.trim()) return null;

    const sessionId = activeSession.id;
    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sessionId,
      sender: 'customer',
      senderName: activeSession.customerName,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    // 1. Immediately append to active state for zero-latency UI
    setActiveSession(prev => {
      if (!prev) return null;
      return { ...prev, messages: [...(prev.messages || []), userMsg] };
    });

    // 2. Append to local storage and broadcast to Astrologer & Admin tabs
    appendMessageToStoredSession(sessionId, userMsg);
    broadcastSessionEvent('message_received', userMsg);

    // 3. Write directly to Firestore for zero-latency cross-platform message delivery
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await setDoc(sessionRef, {
        messages: [...(activeSession.messages || []), userMsg],
        lastMessageText: text.trim(),
        lastMessageAt: new Date().toISOString(),
        unreadForOperator: true
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore message sync notice:', fsErr);
    }

    // 4. Dispatch to backend if available
    try {
      const token = sessionStorage.getItem(`lumsic_session_token_${sessionId}`) || '';
      const res = await fetch(`/api/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-session-token': token } : {})
        },
        body: JSON.stringify({
          sender: 'customer',
          senderName: activeSession.customerName,
          text: text.trim()
        })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.session) {
          setActiveSession(prev => prev && prev.id === sessionId ? data.session : prev);
        }
      }
    } catch (err) {
      console.warn('Backend message sync notice:', err);
    }
    return userMsg;
  };

  const handleToggleReaderOnline = (readerId: string, isOnline: boolean) => {
    fetch(`/api/readers/${readerId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'isOnline', value: isOnline })
    })
      .then(res => res.json())
      .then(data => {
        if (data.reader) {
          setReaders(prev => prev.map(r => r.id === data.reader.id ? data.reader : r));
        }
      })
      .catch(console.error);
  };

  const activeReader = activeSession 
    ? (readers.find(r => r.id === activeSession.requestedReaderId) || readers.find(r => r.id === activeSession.assignedReaderId) || readers[0])
    : readers[0];

  if (isAdminView) {
    return (
      <AdminStandaloneApp
        onBackToSite={() => setIsAdminView(false)}
        initialTab={typeof window !== 'undefined' && window.location.pathname.toLowerCase().includes('astrologer') ? 'chats' : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8DF] text-[#2B2418] flex flex-col font-sans selection:bg-[#F4E7B8] selection:text-[#2B2418] relative">
      {/* Background Star Layer */}
      <StarryBackground density="dense" className="fixed inset-0 z-0 opacity-40 pointer-events-none" />

      {/* TOP STICKY BAR: ROTATING MARQUEE TICKER AT VERY TOP + GLOBAL LUXURY HEADER */}
      <div className="sticky top-0 z-40 shadow-md shadow-amber-950/10">
        <OfferBanner onClaimOffer={() => handleNavigateSection('readers')} />
        <Header
          onStartReading={() => handleNavigateSection('readers')}
          onNavigateSection={handleNavigateSection}
          onOpenExplorer={handleOpenExplorer}
          onOpenBirthChartModal={() => handleNavigateSection('birth-chart')}
          onOpenProfile={() => setIsDashboardOpen(true)}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAudio={() => setIsHoroscopeModalOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          currentCurrency={currentCurrency}
          onSelectCurrency={(cur) => {
            setCurrentCurrency(cur);
            localStorage.setItem('astral_currency', cur);
          }}
          walletBalance={rechargeBalance + availableBalance}
          onOpenWallet={() => {
            setWalletInitialTab('wallet');
            setIsWalletOpen(true);
          }}
          isOwnerAdmin={isOwnerAdmin}
          onOpenAdmin={() => setIsAdminView(true)}
        />
      </div>


      {/* MAIN WEBSITE CONTENT */}
      <main className="flex-1 pb-16 md:pb-0 relative z-10">
        {/* 1. HERO */}
        <Hero
          onCreateBirthChart={handleOpenBirthChart}
          onFindAstrologer={handleQuickStartConsultation}
          onOpenCompatibility={() => handleNavigateSection('compatibility')}
        />

        {/* MOBILE VIEW ONLY: Dedicated mobile feed matching user reference directly below Hero */}
        <div className="lg:hidden">
          <MobileFeedView
            readers={readers}
            onStartChat={handleInitiateChatWithReader}
            onViewProfile={(reader) => setSelectedProfileReader(reader)}
            onExploreAll={() => setIsViewAllOpen(true)}
            onSelectPromptQuestion={(_q) => {
              const onlineReader = readers.find(r => r.isOnline) || readers[0];
              setSelectedIntakeReader(onlineReader);
            }}
            currentCurrency={currentCurrency}
          />
        </div>

        {/* DESKTOP-ONLY SECTIONS (Cards carousel, trust bar, choose your path) */}
        <div className="hidden lg:block">
          <TrustBar />
          <ChooseYourPath
            onSelectPath={() => {
              const onlineReader = readers.find(r => r.isOnline) || readers[0];
              setSelectedIntakeReader(onlineReader);
            }}
          />
          <AstrologersCarousel
            readers={readers}
            onViewProfile={(reader) => setSelectedProfileReader(reader)}
            onStartChat={handleInitiateChatWithReader}
            onExploreAll={() => setIsViewAllOpen(true)}
            currentCurrency={currentCurrency}
          />
        </div>

        {/* 2. LOVE & COMPATIBILITY (COMPLETELY SHIFTED DIRECTLY UNDER THE ASTROLOGERS SECTION) */}
        <CompatibilitySection
          onChatWithLovePsychics={(_topic) => {
            // Find top love psychic (Psychic Tamara or Psychic Gabrielle, or top online love reader)
            const loveReader = readers.find(r => 
              r.id === 'psychic-tamara' || 
              r.id === 'psychic-gabrielle' || 
              r.specialities?.some(s => s.toLowerCase().includes('love'))
            ) || readers[0];

            handleInitiateChatWithReader(loveReader);
          }}
        />

        {/* 3. REVIEWS & TESTIMONIALS (FIXED IN UPPER SIDE - Social Proof directly after Compatibility) */}
        <TestimonialsSection />

        {/* 5. HOW IT WORKS */}
        <HowItWorks />

        {/* 6. WHY LUMSIC */}
        <WhyAstralSection />

        {/* 7. FAQ */}
        <FAQSection />

        {/* 9. FINAL CTA (Start Free Chat with Psychics - Space tightened) */}
        <FinalCTA
          onStartBirthChart={handleQuickStartConsultation}
          onFindAstrologer={handleQuickStartConsultation}
        />

        {/* 10. VLOGS & GUIDES */}
        <LearnSection onNavigateSection={handleNavigateSection} />
      </main>

      {/* FOOTER */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenPolicyPage={(policyId) => setActivePolicyPage(policyId as PolicyPageId)}
        onOpenContact={() => setIsSupportOpen(true)}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
      />

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav
        activeSection={isWalletOpen ? 'chatroom' : currentSection}
        onNavigateSection={handleNavigateSection}
        onGoHome={handleGoHome}
        onOpenProfile={() => setIsDashboardOpen(true)}
        onOpenChatroom={() => {
          setWalletInitialTab('order');
          setIsWalletOpen(true);
        }}
        onOpenRituals={() => handleNavigateSection('rituals')}
        onOpenTarot={() => setIsTarotModalOpen(true)}
        onOpenHoroscope={() => setIsHoroscopeModalOpen(true)}
      />

      {/* ASTRAL 18-PILLAR GLOBAL STRUCTURE UNIVERSAL EXPLORER */}
      <AstralUniversalExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        initialCategoryId={explorerCategory}
        onNavigateSection={handleNavigateSection}
        onStartReading={handleQuickStartConsultation}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        currentCurrency={currentCurrency}
        onSelectCurrency={setCurrentCurrency}
      />

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSection={handleNavigateSection}
      />

      {/* MY LUMSIC USER DASHBOARD */}
      <MyAstralDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onNavigateSection={handleNavigateSection}
        userProfile={customer}
        onLogout={() => {
          localStorage.removeItem('astral_is_logged_in');
          localStorage.removeItem('lumysic_is_logged_in');
          localStorage.removeItem('astral_customer_name');
          localStorage.removeItem('lumysic_user_name');
          localStorage.removeItem('astral_customer_phone');
          localStorage.removeItem('lumysic_user_phone');
          setCustomer({
            id: 'cust_' + Date.now(),
            name: '',
            phone: '',
            isFirstTimeUser: true,
            freeMinutesUsed: false,
            totalConsultations: 0
          });
          setIsDashboardOpen(false);
          setIsAuthenticated(false);
        }}
      />

      {/* MODAL: READER PROFILE */}
      <ReaderProfileModal
        reader={selectedProfileReader}
        onClose={() => setSelectedProfileReader(null)}
        onStartReading={handleInitiateChatWithReader}
        currentCurrency={currentCurrency}
      />

      {/* POPUP SCREEN: COMPLETE NATAL BIRTH CHART MODAL */}
      <BirthChartModal
        isOpen={isBirthChartModalOpen}
        onClose={() => setIsBirthChartModalOpen(false)}
        onConsultAstrologer={handleQuickStartConsultation}
      />

      {/* MODAL: CUSTOMER INTAKE */}
      {selectedIntakeReader && (
        <CustomerIntakeModal
          reader={selectedIntakeReader}
          existingName={customer.name}
          onClose={() => setSelectedIntakeReader(null)}
          onSubmit={handleIntakeSubmit}
          isFirstTimeUser={customer.isFirstTimeUser}
        />
      )}


      {/* LIVE CHAT VIEW */}
      {isChatOpen && activeSession && (
        <LiveChatView
          session={activeSession}
          reader={activeReader}
          onSendMessage={handleSendMessage}
          onCloseChat={() => setIsChatOpen(false)}
          onEndConsultation={async () => {
            setActiveSession(prev => prev ? ({ ...prev, status: 'completed' }) : null);
          }}
          onTopUp={async (minutes: number) => {
            setActiveSession(prev => prev ? ({
              ...prev,
              freeSecondsRemaining: prev.freeSecondsRemaining + minutes * 60
            }) : null);
          }}
        />
      )}

      {/* DAILY TAROT MODAL */}
      <DailyTarotModal
        isOpen={isTarotModalOpen}
        onClose={() => setIsTarotModalOpen(false)}
      />

      {/* DAILY HOROSCOPE MODAL */}
      <DailyHoroscopeModal
        isOpen={isHoroscopeModalOpen}
        onClose={() => setIsHoroscopeModalOpen(false)}
        onStartReading={handleQuickStartConsultation}
      />

      {/* SACRED RITUALS & SPELLS MODAL */}
      <SacredRitualsModal
        isOpen={isRitualsModalOpen}
        onClose={() => setIsRitualsModalOpen(false)}
        initialTab={ritualsInitialTab}
        currentCurrency={currentCurrency}
      />

      {/* THREE-LINE LEFT HEADER NAVIGATION DRAWER (MATCHING USER REFERENCE) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={customer}
        isAuthenticated={isAuthenticated}
        isOwnerAdmin={isOwnerAdmin}
        onOpenLogin={() => {
          setIsDrawerOpen(false);
          setIsAuthModalOpen(true);
        }}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onOpenWallet={() => {
          setWalletInitialTab('wallet');
          setIsWalletOpen(true);
        }}
        onOpenReferral={() => {
          setWalletInitialTab('referral');
          setIsWalletOpen(true);
        }}
        onOpenOrders={() => {
          setWalletInitialTab('order');
          setIsWalletOpen(true);
        }}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenRedeem={() => setIsRedeemOpen(true)}
        onOpenSettings={() => setIsDashboardOpen(true)}
        onLogout={async () => {
          await signOutUser();
          localStorage.removeItem('astral_is_logged_in');
          localStorage.removeItem('lumysic_is_logged_in');
          localStorage.removeItem('astral_customer_name');
          localStorage.removeItem('lumysic_user_name');
          localStorage.removeItem('lumsic_user_name');
          localStorage.removeItem('astral_customer_phone');
          localStorage.removeItem('lumysic_user_phone');
          localStorage.removeItem('lumsic_user_phone');
          localStorage.removeItem('lumysic_user_email');
          localStorage.removeItem('astral_customer_email');
          setCustomer({
            id: 'cust_' + Date.now(),
            name: '',
            phone: '',
            email: '',
            isFirstTimeUser: true,
            freeMinutesUsed: false,
            totalConsultations: 0
          });
          setIsAdminView(false);
          setIsDrawerOpen(false);
          setIsAuthenticated(false);
        }}
        onOpenAdmin={() => {
          setIsDrawerOpen(false);
          setIsAdminView(true);
        }}
        onOpenAstrologerDashboard={() => {
          setIsDrawerOpen(false);
          setIsAdminView(true);
        }}
      />

      {/* DEDICATED INTERNATIONAL LOGIN / SIGN UP MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-y-auto">
          <AuthScreen
            redirectTarget={authRedirectTarget}
            onLoginSuccess={(profile, redirect) => {
              localStorage.setItem('astral_is_logged_in', 'true');
              localStorage.setItem('lumysic_is_logged_in', 'true');
              if (profile.email) {
                localStorage.setItem('lumysic_user_email', profile.email);
                localStorage.setItem('astral_customer_email', profile.email);
              }
              if (profile.currency) {
                setCurrentCurrency(profile.currency);
                localStorage.setItem('astral_currency', profile.currency);
              }
              if (profile.country) {
                localStorage.setItem('astral_country', profile.country);
              }
              if (profile.name) {
                localStorage.setItem('astral_customer_name', profile.name);
                localStorage.setItem('lumysic_user_name', profile.name);
              }
              if (profile.phone) {
                localStorage.setItem('astral_customer_phone', profile.phone);
                localStorage.setItem('lumysic_user_phone', profile.phone);
              }
              setCustomer(prev => ({
                ...prev,
                ...profile,
                id: profile.id || prev.id,
                name: profile.name || prev.name,
                phone: profile.phone || prev.phone,
                email: profile.email || prev.email,
              }));
              setIsAuthenticated(true);
              setIsAuthModalOpen(false);

              // UNIFIED REDIRECT: Immediately start the consultation chat!
              const target = redirect || authRedirectTarget;
              if (target && target.profileId) {
                const targetReader = readers.find(r => r.id === target.profileId) || readers[0];
                const userName = profile.name || localStorage.getItem('lumysic_user_name') || 'Valued Seeker';
                createSession(targetReader, {
                  firstName: userName,
                  fullName: userName,
                  readingType: targetReader.category || 'Live Consultation',
                  topic: 'Life, Love & Destiny Guidance',
                  question: `Hello ${targetReader.name}, I am glad to connect with you.`
                });
              }
              setAuthRedirectTarget(null);
            }}
            onBackToSite={() => {
              setIsAuthModalOpen(false);
              setAuthRedirectTarget(null);
            }}
            detectedGeo={detectedGeo}
          />
        </div>
      )}

      {/* FULL WALLET TRANSACTIONS & ORDER / REMEDIES HISTORY MODAL */}
      <WalletTransactionModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        customerId={customer.id}
        currentCurrency={currentCurrency}
        availableBalance={availableBalance}
        rechargeBalance={rechargeBalance}
        cashbackBalance={cashbackBalance}
        onRechargeSuccess={handleRechargeSuccess}
        initialTab={walletInitialTab}
        readers={readers}
        onStartChatWithReader={(reader) => {
          setIsWalletOpen(false);
          handleInitiateChatWithReader(reader);
        }}
        onOpenRemediesModal={() => {
          setIsWalletOpen(false);
          setIsRitualsModalOpen(true);
        }}
        onOpenDrawer={() => {
          setIsWalletOpen(false);
          setIsDrawerOpen(true);
        }}
      />

      {/* CUSTOMER SUPPORT CHAT MODAL */}
      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        userName={customer.name}
      />

      {/* REDEEM GIFT CARD MODAL */}
      <RedeemGiftCardModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        onRedeemSuccess={handleRedeemSuccess}
        currentCurrency={currentCurrency}
      />

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={customer}
        onSave={({ name, phone }) => {
          localStorage.setItem('astral_customer_name', name);
          localStorage.setItem('lumysic_user_name', name);
          localStorage.setItem('astral_customer_phone', phone);
          localStorage.setItem('lumysic_user_phone', phone);
          setCustomer(prev => ({ ...prev, name, phone }));
        }}
      />

      {/* VIEW ALL 100+ ASTROLOGERS DIRECTORY OVERLAY */}
      {isViewAllOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F5]">
          <ViewAllReadersPage
            readers={readers}
            onBack={() => setIsViewAllOpen(false)}
            onViewProfile={(reader) => setSelectedProfileReader(reader)}
            onStartChat={(reader) => {
              setIsViewAllOpen(false);
              handleInitiateChatWithReader(reader);
            }}
            currentCurrency={currentCurrency}
          />
        </div>
      )}

      {/* DEDICATED LEGAL & POLICY PAGES VIEW */}
      {activePolicyPage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F5]">
          <LegalPolicyPage
            pageId={activePolicyPage}
            onBack={() => setActivePolicyPage(null)}
            onNavigatePolicy={(policyId) => setActivePolicyPage(policyId)}
            onOpenContactModal={() => {
              setActivePolicyPage(null);
              setIsSupportOpen(true);
            }}
          />
        </div>
      )}


      {/* Floating Admin Panel Quick Switcher Button (Strictly for authorized owner: bankush014@gmail.com) */}
      {isOwnerAdmin && (
        <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsAdminView(true)}
            className="px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-amber-300 hover:text-amber-200 border border-amber-500/40 shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            title="Open Admin CMS & n8n Automation Dashboard"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Admin Panel</span>
          </button>

          <button
            onClick={() => setIsAdminView(true)}
            className="px-3 py-2 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-400/50 shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            title="Open Astrologer Workstation & Live Console"
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>Astrologer Dashboard</span>
          </button>
        </div>
      )}
    </div>
  );
}
