import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Scale, FileText, Lock, Cookie, AlertTriangle, Users, Wallet, Mail } from 'lucide-react';
import { LumysicLogo } from './LumysicLogo';

export type PolicyPageId = 
  | 'terms'
  | 'refund'
  | 'privacy'
  | 'cookies'
  | 'disclaimer'
  | 'community'
  | 'wallet-terms'
  | 'contact';

interface LegalPolicyPageProps {
  pageId: PolicyPageId;
  onBack: () => void;
  onNavigatePolicy: (policyId: PolicyPageId) => void;
  onOpenContactModal?: () => void;
}

interface PolicyContent {
  id: PolicyPageId;
  title: string;
  subtitle: string;
  lastUpdated: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
}

const POLICIES_DATA: Record<PolicyPageId, PolicyContent> = {
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Comprehensive terms governing your usage of the LUMSIC Sanctuary platform and spiritual consultation services.',
    lastUpdated: 'October 13, 2026',
    icon: Scale,
    sections: [
      {
        heading: '1. Agreement to Terms',
        paragraphs: [
          'Welcome to LUMSIC Sanctuary ("LUMSIC", "we", "us", or "our"). By accessing or using our website, services, mobile web application, or engaging in communications with verified spiritual readers and astrologers, you agree to be bound by these Terms & Conditions and all applicable laws.',
          'If you do not agree with any part of these terms, you must discontinue your use of our platform immediately.'
        ]
      },
      {
        heading: '2. Eligibility & Account Registration',
        paragraphs: [
          'You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to create an account, purchase wallet credits, or initiate consultations with our readers.',
          'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration.'
        ],
        bullets: [
          'Users must be 18+ to book paid consultations.',
          'One account per seeker; multi-accounting to exploit promotional bonuses is strictly prohibited.',
          'Account activity must comply with domestic and international regulations.'
        ]
      },
      {
        heading: '3. Scope of Spiritual Consultations & Guidance',
        paragraphs: [
          'LUMSIC provides a sacred digital platform connecting seekers with independent verified astrologers, tarot readers, Vedic practitioners, numerologists, and psychic advisors.',
          'All consultations, readings, horoscopes, and intuitive insights are provided exclusively for spiritual self-discovery, reflective contemplation, and entertainment purposes. They do not constitute, and must never substitute for, professional medical, psychological, psychiatric, legal, or financial advice.'
        ]
      },
      {
        heading: '4. Promotional Offers & Introductory Sessions',
        paragraphs: [
          'Promotional offers, including "First Chat Free" minutes or introductory rate discounts, are limited to verified first-time users. LUMSIC reserves the right to verify user authenticity via telephone, email, or device authentication before granting bonus consultation time.',
          'Any fraudulent manipulation or automated exploitation of introductory offers will result in immediate account termination.'
        ]
      },
      {
        heading: '5. Intellectual Property Rights',
        paragraphs: [
          'All materials on LUMSIC, including but not limited to texts, sacred graphics, astronomical ephemeris algorithms, logos, user interface designs, and soundscapes, are protected by intellectual property laws and remain the exclusive property of LUMSIC Sanctuary Inc.'
        ]
      },
      {
        heading: '6. Limitation of Liability',
        paragraphs: [
          'Under no circumstances shall LUMSIC, its directors, employees, or affiliated readers be held liable for any direct, indirect, incidental, consequential, or punitive damages arising from decisions made by seekers based upon spiritual readings or platform content.'
        ]
      }
    ]
  },

  refund: {
    id: 'refund',
    title: 'Refund & Cancellation Policy',
    subtitle: 'Transparent satisfaction guarantees, wallet credits, and consultation cancellation terms.',
    lastUpdated: 'October 13, 2026',
    icon: ShieldCheck,
    sections: [
      {
        heading: '1. 100% Satisfaction Guarantee Credit',
        paragraphs: [
          'At LUMSIC Sanctuary, we stand behind the integrity and authenticity of our verified practitioners. If your consultation fails to establish a spiritual connection or is impacted by technical interruptions, you are fully protected under our satisfaction guarantee.',
          'If you are dissatisfied with a live chat or audio session within the first three (3) minutes, you may end the session immediately and submit a credit request to receive a 100% refund in Sanctuary wallet credits.'
        ],
        bullets: [
          'Valid for sessions ended within the first 3 minutes of consultation.',
          'Credits are deposited directly back to your LUMSIC Wallet balance.',
          'Wallet credits can be utilized with any verified reader across the directory.'
        ]
      },
      {
        heading: '2. Technical Disruptions & Connection Failures',
        paragraphs: [
          'If an active reading is interrupted due to reader disconnection, network failure, or platform server issues, unspent consultation minutes are automatically preserved and refunded to your wallet balance without penalty.'
        ]
      },
      {
        heading: '3. Sacred Rituals & Consecrated Orders',
        paragraphs: [
          'Because consecrated rituals, personalized birth charts, and spellwork require individualized preparation, time, and consecrated physical items by master practitioners, completed customized rituals cannot be refunded once performance has commenced.',
          'If you wish to cancel an advance ritual booking prior to the practitioner beginning consecration, you may request a full cancellation up to 6 hours before the scheduled ritual time.'
        ]
      },
      {
        heading: '4. Dispute Process & Requesting a Refund',
        paragraphs: [
          'To submit a refund or credit request, open the 24/7 Priority Support Chat or email our Sanctuary Concierge at support@lumsic.com within 48 hours of your session. Include your Order ID, reader name, and a brief description of the issue. Our support team reviews and resolves requests within 12-24 hours.'
        ]
      }
    ]
  },

  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How we collect, encrypt, safeguard, and respect your sacred personal data and birth coordinates.',
    lastUpdated: 'October 13, 2026',
    icon: Lock,
    sections: [
      {
        heading: '1. Our Privacy Commitment',
        paragraphs: [
          'Your spiritual inquiries, birth chart details, relationship concerns, and private session transcripts are deeply sacred. LUMSIC Sanctuary is committed to upholding the highest standards of data protection, in accordance with the UK Data Protection Act 2018 and the General Data Protection Regulation (GDPR).',
          'We will never sell, rent, lease, or monetize your personal identity or consultation records to third-party data brokers or advertising networks.'
        ]
      },
      {
        heading: '2. Information We Collect',
        paragraphs: [
          'We collect only the essential information required to deliver precise astrological calculations, verify seeker identity, and facilitate secure communications:'
        ],
        bullets: [
          'Astrological data: Date of birth, exact time of birth, and birthplace coordinates (used exclusively for planetary ephemeris calculation).',
          'Account credentials: Name, email address, telephone number, and hashed passwords.',
          'Transaction records: Payment processor tokens, transaction IDs, and currency preferences (we do not store full credit card numbers).',
          'Consultation notes: Encrypted chat messages and session history between you and your chosen readers.'
        ]
      },
      {
        heading: '3. Data Security & 256-Bit SSL Encryption',
        paragraphs: [
          'All communications between your device and our sanctuary servers are protected by enterprise-grade 256-bit Transport Layer Security (TLS/SSL). Stored personal information and birth coordinates are encrypted at rest with multi-layer access controls.'
        ]
      },
      {
        heading: '4. Data Retention & Right to Erasure',
        paragraphs: [
          'You retain full sovereignty over your data at all times. Under GDPR regulations, you have the right to request a complete export of your personal information or request permanent deletion (scrubbing) of your birth charts, chat logs, and account records.',
          'To request immediate account erasure, contact support@lumsic.com or access the Data Sovereignty settings in your User Dashboard.'
        ]
      }
    ]
  },

  cookies: {
    id: 'cookies',
    title: 'Cookie Policy',
    subtitle: 'Understanding our minimal and privacy-focused cookie usage across the platform.',
    lastUpdated: 'October 13, 2026',
    icon: Cookie,
    sections: [
      {
        heading: '1. What Are Cookies?',
        paragraphs: [
          'Cookies are small text files placed on your device when you visit websites. They help the website remember your login session, saved currency preferences, astrological chart calculations, and security configurations.'
        ]
      },
      {
        heading: '2. Types of Cookies We Use',
        paragraphs: [
          'LUMSIC uses only necessary and functional cookies to ensure a smooth, uninterrupted consultation experience:'
        ],
        bullets: [
          'Strictly Necessary Cookies: Essential for user authentication, maintaining secure sessions during live psychic chats, and processing wallet balance recharges.',
          'Preference Cookies: Remember your chosen currency (e.g., GBP, USD, EUR, INR) and language selection so you do not have to reselect them upon every visit.',
          'Performance & Reliability Cookies: Help monitor platform latency and prevent DDoS attacks during high-traffic astrological events (e.g., Solar Eclipses, Mercury Retrograde).'
        ]
      },
      {
        heading: '3. Managing Your Cookie Preferences',
        paragraphs: [
          'You can manage or disable cookies at any time via your browser settings. Please note that disabling strictly necessary cookies may prevent you from logging in, maintaining a live chat connection, or saving birth charts.'
        ]
      }
    ]
  },

  disclaimer: {
    id: 'disclaimer',
    title: 'Disclaimer',
    subtitle: 'Spiritual guidance, astrological interpretation, and entertainment notice.',
    lastUpdated: 'October 13, 2026',
    icon: AlertTriangle,
    sections: [
      {
        heading: '1. Entertainment & Reflective Guidance Notice',
        paragraphs: [
          'All services, astrological interpretations, tarot card readings, clairvoyant sessions, numerology calculations, daily horoscopes, and spiritual rituals available on LUMSIC Sanctuary are provided strictly for spiritual guidance, personal self-discovery, and entertainment purposes.',
          'Spiritual guidance illuminates archetypal energies, psychological patterns, and energetic possibilities. It does not determine fixed outcomes and must never override individual human free will.'
        ]
      },
      {
        heading: '2. Professional Medical, Legal & Financial Advice Exclusion',
        paragraphs: [
          'Neither LUMSIC Sanctuary nor any reader on our platform offers licensed professional medical, psychiatric, legal, or financial counsel. Astrological charts and intuitive readings should never be utilized as a substitute for diagnosis, treatment, or advice from qualified healthcare providers, licensed attorneys, or registered financial advisors.',
          'If you are experiencing a medical or mental health emergency, please immediately contact your local emergency services, crisis hotline, or qualified healthcare professional.'
        ]
      },
      {
        heading: '3. Independent Contractor Readers',
        paragraphs: [
          'Readers and spiritual advisors on the LUMSIC platform operate as independent practitioners. While all readers undergo our rigorous screening, identity verification, and ethical vetting, their personal beliefs, interpretations, and statements represent their individual perspectives and not the official endorsement of LUMSIC Sanctuary Inc.'
        ]
      }
    ]
  },

  community: {
    id: 'community',
    title: 'Community Guidelines',
    subtitle: 'Fostering a safe, respectful, empathetic, and sacred sanctuary for all seekers and readers.',
    lastUpdated: 'October 13, 2026',
    icon: Users,
    sections: [
      {
        heading: '1. Mutual Respect & Kindness',
        paragraphs: [
          'LUMSIC is a sacred space devoted to personal healing, compassion, and insight. We uphold a zero-tolerance policy toward any form of harassment, hate speech, discrimination, profanity, abusive conduct, or intimidation directed at readers, fellow seekers, or support staff.',
          'Any seeker or reader violating these standards will face immediate suspension or permanent platform ban.'
        ]
      },
      {
        heading: '2. Ethical Astrological Code for Readers',
        paragraphs: [
          'Every reader featured in our directory agrees to strictly adhere to our Reader Ethical Code:'
        ],
        bullets: [
          'No Fear-Mongering: Readers are strictly forbidden from inducing fear, predicting death, fabricating curses, or demanding extortionate fees for "curse removal".',
          'Sovereign Free Will: Readers must always emphasize that the seeker possesses ultimate power and responsibility over their life choices.',
          'Absolute Confidentiality: Readers must hold all shared secrets, relationship concerns, and private confessions in the strictest sacred confidence.',
          'No Off-Platform Solicitation: Conducting private transactions outside of the LUMSIC platform is strictly forbidden to protect seeker security.'
        ]
      },
      {
        heading: '3. Reporting Violations',
        paragraphs: [
          'If you experience any reader conduct that violates our ethical standards or makes you feel uncomfortable, please report the session immediately using the "Report" flag in your chat room or contact our Sanctuary Ethics Committee at ethics@lumsic.com.'
        ]
      }
    ]
  },

  'wallet-terms': {
    id: 'wallet-terms',
    title: 'Payment & Wallet Terms',
    subtitle: 'Rules regarding sanctuary wallet recharge, currency conversion, per-minute billing, and credit validity.',
    lastUpdated: 'October 13, 2026',
    icon: Wallet,
    sections: [
      {
        heading: '1. Sanctuary Wallet System',
        paragraphs: [
          'LUMSIC operates on a prepaid Sanctuary Wallet credit balance. To initiate paid consultations with verified readers, seekers recharge their wallet with credits in their chosen currency (GBP, USD, EUR, INR, CAD, AUD, etc.).',
          'Consultations are billed on a real-time per-minute basis according to the reader’s published rate. Billing commences only after the initial introductory grace period and ceases immediately the moment a session is terminated.'
        ]
      },
      {
        heading: '2. Payment Methods & Security',
        paragraphs: [
          'All payments are processed through PCI-DSS Level 1 compliant gateways (Stripe, Razorpay, Apple Pay, Google Pay). LUMSIC does not store credit or debit card numbers on its servers. All recharge transactions are encrypted via 256-bit SSL technology.'
        ]
      },
      {
        heading: '3. Credit Expiration & Inactive Accounts',
        paragraphs: [
          'Purchased wallet credits never expire as long as your account remains in good standing. Promotional bonus credits granted during registration or seasonal campaigns may carry specific validity windows, clearly noted at the time of issue.'
        ]
      },
      {
        heading: '4. Auto-Recharge & Transparency',
        paragraphs: [
          'LUMSIC does not engage in hidden recurring subscriptions or unexpected auto-charges. Seekers maintain complete control over when and how much they recharge. When your balance reaches a 1-minute threshold during a consultation, the system presents an explicit notification before disconnection.'
        ]
      }
    ]
  },

  contact: {
    id: 'contact',
    title: 'Contact Us',
    subtitle: 'Reach out to the LUMSIC Sanctuary Concierge, Ethics Board, or 24/7 Priority Support.',
    lastUpdated: 'October 13, 2026',
    icon: Mail,
    sections: [
      {
        heading: '1. 24/7 Priority Support Chat',
        paragraphs: [
          'Our Sanctuary Support team is available around the clock to assist you with wallet recharges, session inquiries, order assistance, or reader recommendations.',
          'You can initiate a live conversation at any time by clicking the "Open 24/7 Support Chat" button below or through the support option in your User Dashboard.'
        ]
      },
      {
        heading: '2. Official Sanctuary Communications',
        paragraphs: [
          'For formal inquiries, partnership requests, legal notices, or reader verification applications, you may contact our dedicated departments via email:'
        ],
        bullets: [
          'General & Seeker Support: support@lumsic.com (Response within 2-4 hours)',
          'Sanctuary Ethics & Compliance: ethics@lumsic.com',
          'Legal & Data Protection Officer: legal@lumsic.com',
          'Astrologer Collective Applications: readers@lumsic.com'
        ]
      },
      {
        heading: '3. Sanctuary Headquarters',
        paragraphs: [
          'LUMSIC Sanctuary Inc.',
          '71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom.',
          'Operating internationally for seekers across the UK, North America, Europe, India, and Australasia.'
        ]
      }
    ]
  }
};

const ALL_POLICIES_LINKS: { id: PolicyPageId; label: string }[] = [
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'refund', label: 'Refund & Cancellation Policy' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'cookies', label: 'Cookie Policy' },
  { id: 'disclaimer', label: 'Disclaimer' },
  { id: 'community', label: 'Community Guidelines' },
  { id: 'wallet-terms', label: 'Payment & Wallet Terms' },
  { id: 'contact', label: 'Contact Us' },
];

export const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({
  pageId,
  onBack,
  onNavigatePolicy,
  onOpenContactModal
}) => {
  const policy = POLICIES_DATA[pageId] || POLICIES_DATA.terms;
  const Icon = policy.icon;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageId]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2B2418] flex flex-col font-sans">
      
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF6EB]/95 backdrop-blur-md border-b border-[#E5D29C] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8C6D23] hover:text-[#B45309] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Sanctuary</span>
          </button>

          <div className="flex items-center gap-2">
            <LumysicLogo size={22} glow={false} />
            <span
              className="font-serif font-black tracking-[0.2em] text-sm text-[#2B2418]"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            >
              LUMSIC
            </span>
            <span className="text-xs text-[#8C6D23]/60 hidden sm:inline">· Legal Center</span>
          </div>

          {pageId === 'contact' && onOpenContactModal ? (
            <button
              type="button"
              onClick={onOpenContactModal}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#B45309] text-white hover:bg-[#92400E] transition-all cursor-pointer shadow-xs"
            >
              Open Live Chat
            </button>
          ) : (
            <div className="text-xs text-[#6F6654] font-medium hidden sm:block">
              Updated {policy.lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Policy Header Banner */}
        <header className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EB] to-[#F7EFCB] rounded-2xl sm:rounded-3xl border border-[#E5D29C] p-6 sm:p-10 mb-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5D29C]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C6D23]/10 border border-[#8C6D23]/25 text-[#8C6D23] text-xs font-bold uppercase tracking-wider mb-4">
              <Icon className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Official Policy & Compliance</span>
            </div>

            <h1 
              className="text-2xl sm:text-4xl font-extrabold text-[#2B2418] tracking-tight mb-3 font-serif"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            >
              {policy.title}
            </h1>

            <p className="text-sm sm:text-base text-[#5C5343] max-w-3xl leading-relaxed">
              {policy.subtitle}
            </p>

            <div className="mt-4 pt-4 border-t border-[#E5D29C]/60 flex flex-wrap items-center gap-4 text-xs text-[#6F6654]">
              <span><strong>Last Updated:</strong> {policy.lastUpdated}</span>
              <span>·</span>
              <span><strong>Effective Date:</strong> Immediate</span>
              <span>·</span>
              <span><strong>Jurisdiction:</strong> United Kingdom & Global</span>
            </div>
          </div>
        </header>

        {/* Content Layout: Quick Policy Switcher Nav + Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Nav: All Legal Links */}
          <aside className="lg:col-span-4 bg-[#FFFDF9] rounded-2xl border border-[#E5D29C] p-4 sm:p-5 shadow-xs sticky top-20">
            <h3 className="text-xs uppercase font-extrabold text-[#2B2418] tracking-wider font-serif mb-3 px-2">
              Legal & Policy Directory
            </h3>
            <nav className="space-y-1">
              {ALL_POLICIES_LINKS.map((link) => {
                const isSelected = link.id === pageId;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => onNavigatePolicy(link.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#B45309] text-white shadow-xs font-bold'
                        : 'text-[#5C5343] hover:text-[#B45309] hover:bg-[#FAF6EB]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isSelected && <span className="text-white text-xs">●</span>}
                  </button>
                );
              })}
            </nav>

            {pageId === 'contact' && onOpenContactModal && (
              <div className="mt-6 pt-5 border-t border-[#E5D29C] text-center">
                <p className="text-xs text-[#6F6654] mb-3">
                  Need immediate help with a reading or wallet balance?
                </p>
                <button
                  type="button"
                  onClick={onOpenContactModal}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B45309] to-[#D6A83F] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
                >
                  Start Live Support Chat
                </button>
              </div>
            )}
          </aside>

          {/* Main Content Sections */}
          <article className="lg:col-span-8 bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border border-[#E5D29C] p-6 sm:p-10 shadow-xs space-y-8">
            {policy.sections.map((sec, idx) => (
              <section key={idx} className="space-y-3 pb-6 border-b border-[#E5D29C]/50 last:border-b-0 last:pb-0">
                <h2 className="text-lg sm:text-xl font-bold text-[#2B2418] font-serif tracking-tight">
                  {sec.heading}
                </h2>
                
                {sec.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-sm text-[#5C5343] leading-relaxed">
                    {p}
                  </p>
                ))}

                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className="space-y-2 pt-1 pl-1">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#5C5343] leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] mt-2 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {pageId === 'contact' && onOpenContactModal && (
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-[#FAF6EB] to-[#F7EFCB] border border-[#E5D29C] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[#2B2418] text-sm">Need direct assistance right now?</h4>
                  <p className="text-xs text-[#5C5343]">Our support priestesses and concierge are online 24/7.</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenContactModal}
                  className="py-2.5 px-6 rounded-full bg-[#B45309] text-white text-xs font-bold shadow-xs hover:bg-[#92400E] transition-all cursor-pointer shrink-0"
                >
                  Launch Support Chat
                </button>
              </div>
            )}
          </article>

        </div>

      </main>

      {/* Footer Return Bar */}
      <footer className="mt-auto border-t border-[#E5D29C] bg-[#FAF6EB] py-6 px-4 text-center text-xs text-[#6F6654]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} LUMSIC Sanctuary Inc. All Rights Reserved.</span>
          <button
            type="button"
            onClick={onBack}
            className="text-[#8C6D23] hover:text-[#B45309] font-semibold cursor-pointer underline"
          >
            Return to Homepage
          </button>
        </div>
      </footer>

    </div>
  );
};
