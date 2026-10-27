import { 
  X, Headphones, Wallet, Clock, Gift, Settings, Edit3, LogOut, ShieldCheck, ChevronRight, Share2, MessageSquare, Compass 
} from 'lucide-react';
import { CustomerProfile } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerProfile;
  isAuthenticated?: boolean;
  onOpenLogin?: () => void;
  onEditProfile: () => void;
  onOpenWallet: () => void;
  onOpenReferral?: () => void;
  onOpenOrders: () => void;
  onOpenSupport: () => void;
  onOpenRedeem: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenFreeChat?: () => void;
  onOpenAdmin?: () => void;
  onOpenAstrologerDashboard?: () => void;
  isOwnerAdmin?: boolean;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  user,
  isAuthenticated = false,
  onOpenLogin,
  onEditProfile,
  onOpenWallet,
  onOpenReferral,
  onOpenOrders,
  onOpenSupport,
  onOpenRedeem,
  onOpenSettings,
  onLogout,
  onOpenFreeChat,
  onOpenAdmin,
  onOpenAstrologerDashboard,
  isOwnerAdmin = false
}) => {
  if (!isOpen) return null;

  const storedName = (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name')) : '') || '';
  const storedPhone = (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone')) : '') || '';

  const effectiveName = (user.name && user.name.trim()) || storedName.trim();
  const effectivePhone = (user.phone && user.phone.trim()) || storedPhone.trim();

  const displayName = effectiveName 
    ? effectiveName 
    : (isAuthenticated ? 'LUMSIC Seeker' : 'Guest Seeker');

  const displayPhone = effectivePhone 
    ? effectivePhone 
    : (isAuthenticated ? 'Profile Active' : 'Tap to sign in');

  const menuItems = [
    {
      id: 'support',
      label: 'Customer Support Desk (24/7)',
      icon: Headphones,
      action: () => {
        onClose();
        onOpenSupport();
      }
    },
    {
      id: 'wallet',
      label: 'Wallet & Recharge',
      icon: Wallet,
      action: () => {
        onClose();
        onOpenWallet();
      }
    },
    {
      id: 'referral',
      label: 'Refer & Earn Free Chat',
      icon: Share2,
      action: () => {
        onClose();
        if (onOpenReferral) onOpenReferral();
        else onOpenWallet();
      }
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: Clock,
      action: () => {
        onClose();
        onOpenOrders();
      }
    },
    {
      id: 'redeem',
      label: 'Redeem Gift Card',
      icon: Gift,
      action: () => {
        onClose();
        onOpenRedeem();
      }
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => {
        onClose();
        onOpenSettings();
      }
    },
    ...(isOwnerAdmin ? [
      {
        id: 'admin',
        label: 'Admin Command Center (n8n & CMS)',
        icon: ShieldCheck,
        action: () => {
          onClose();
          if (onOpenAdmin) onOpenAdmin();
          else window.location.href = '/admin.html';
        }
      },
      {
        id: 'astrologer_dashboard',
        label: 'Astrologer Dashboard (Workstation)',
        icon: Compass,
        action: () => {
          onClose();
          if (onOpenAstrologerDashboard) onOpenAstrologerDashboard();
        }
      }
    ] : [])
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide-out Drawer Panel (from Left) - Warm Yellowish Cosmic Theme */}
      <div className="relative w-[85%] max-w-[340px] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EB] to-[#FFF8DF] border-r border-[#EAD8A4] text-gray-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        
        {/* Top Header & User Profile Bar */}
        <div className="p-5 border-b border-[#EAD8A4]/70 bg-gradient-to-r from-[#FFF9E6]/60 via-[#FFFDF9] to-[#FFF5D6]/60">
          <div className="flex items-start justify-between gap-3">
            {/* User Avatar & Name Section */}
            <div className="flex items-center gap-3.5">
              {/* Golden Cosmic Emblem Avatar */}
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#D97706] via-[#F59E0B] to-[#FDE68A] p-0.5 shadow-md shadow-amber-900/15 shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#1F1929] flex items-center justify-center overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 font-black text-xl select-none">
                    ✨
                  </div>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-[#2B2418] text-base truncate font-serif">
                    {displayName}
                  </h3>
                  {/* Edit Pencil Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditProfile();
                    }}
                    className="p-1 text-[#8C6D23] hover:text-[#B45309] hover:bg-amber-100/60 rounded-full transition-colors cursor-pointer"
                    title="Edit Name & Phone"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-[#78350F] font-mono tracking-tight mt-0.5 font-semibold truncate">
                  {displayPhone}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1 text-[#8C6D23] hover:text-[#2B2418] hover:bg-amber-100/70 rounded-full transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="w-full flex items-center justify-between py-3 px-3.5 rounded-2xl bg-white/70 hover:bg-white active:bg-amber-100/70 border border-[#EAD8A4]/60 hover:border-[#D6A83F] shadow-2xs hover:shadow-xs transition-all text-left text-[#2B2418] font-bold text-sm cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-50 group-hover:from-amber-200 group-hover:to-amber-100 text-[#92400E] border border-amber-200/80 flex items-center justify-center transition-all group-hover:scale-105 shadow-2xs">
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[14.5px] tracking-tight">{item.label}</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-50 group-hover:bg-amber-100/80 flex items-center justify-center border border-amber-200/50">
                  <ChevronRight className="w-3.5 h-3.5 text-[#B45309] transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}

          {/* Quick Sign Out / Sign In Action */}
          <div className="pt-3 mt-3 border-t border-[#EAD8A4]/70">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center justify-between py-3 px-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 active:bg-rose-100 border border-rose-200/80 text-rose-700 hover:text-rose-900 transition-all font-bold text-sm cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LogOut className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[14.5px]">Sign Out / Switch</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-105 active:scale-98 text-gray-950 font-black text-sm uppercase tracking-wider shadow-md shadow-amber-500/20 border border-amber-300 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Version Label */}
        <div className="p-4 text-center border-t border-[#EAD8A4]/70 bg-gradient-to-r from-[#FAF6EB] via-[#FFFDF9] to-[#FAF6EB]">
          <span className="text-xs font-bold text-[#8C6D23] font-mono tracking-wider">
            Version 1.1.386
          </span>
        </div>
      </div>
    </div>
  );
};
