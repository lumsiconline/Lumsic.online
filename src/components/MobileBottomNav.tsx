import React from 'react';
import { Home, MessageSquare, ShoppingBag, Layers, Compass } from 'lucide-react';

interface MobileBottomNavProps {
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onOpenProfile?: () => void;
  onGoHome?: () => void;
  onOpenMall?: () => void;
  onOpenRituals?: () => void;
  onOpenTarot?: () => void;
  onOpenHoroscope?: () => void;
  onOpenChatroom?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onNavigateSection,
  onGoHome,
  onOpenMall,
  onOpenRituals,
  onOpenTarot,
  onOpenHoroscope,
  onOpenChatroom
}) => {
  const handleHomeClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      onNavigateSection('home');
    }
  };

  const handleMallClick = () => {
    if (onOpenMall) {
      onOpenMall();
    } else if (onOpenRituals) {
      onOpenRituals();
    } else {
      onNavigateSection('shop');
    }
  };

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      action: handleHomeClick 
    },
    { 
      id: 'chatroom', 
      label: 'Chat', 
      icon: MessageSquare, 
      action: onOpenChatroom ? onOpenChatroom : () => onNavigateSection('readers') 
    },
    { 
      id: 'mall', 
      label: 'Mall', 
      icon: ShoppingBag, 
      action: handleMallClick,
      badge: 'New'
    },
    { 
      id: 'tarot', 
      label: 'Tarot', 
      icon: Layers, 
      action: onOpenTarot ? onOpenTarot : () => onNavigateSection('tarot') 
    },
    { 
      id: 'horoscope', 
      label: 'Horoscope', 
      icon: Compass, 
      action: onOpenHoroscope ? onOpenHoroscope : () => onNavigateSection('horoscope') 
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070B1F]/95 backdrop-blur-2xl border-t border-[#F6D06E]/25 px-2.5 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-8px_25px_rgba(0,0,0,0.6)] select-none"
    >
      {/* Top subtle golden filament starlight line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#F6D06E]/40 to-transparent pointer-events-none" />

      <div className="grid grid-cols-5 gap-1.5 items-center max-w-md mx-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            activeSection === item.id || 
            (item.id === 'home' && (activeSection === 'home' || !activeSection)) ||
            (item.id === 'mall' && (activeSection === 'shop' || activeSection === 'store' || activeSection === 'mall'));

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`group relative flex flex-col items-center justify-center h-[54px] w-full rounded-2xl transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                isActive 
                  ? 'bg-gradient-to-b from-[#F6D06E]/25 via-[#E5B744]/15 to-[#F6D06E]/5 border border-[#F6D06E] text-[#FFF6D4] shadow-[0_0_14px_rgba(246,208,110,0.32)] scale-[1.02]' 
                  : 'bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-[#F6D06E]/15 hover:border-[#F6D06E]/40 text-slate-300 hover:text-white shadow-xs'
              }`}
            >
              {/* Top active jewel line */}
              {isActive && (
                <span className="absolute -top-[1.5px] w-4 h-[2px] rounded-full bg-gradient-to-r from-amber-300 via-[#F6D06E] to-yellow-400 shadow-[0_0_6px_rgba(246,208,110,0.9)]" />
              )}

              {/* Optional micro-badge on Mall */}
              {item.badge && !isActive && (
                <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase tracking-tight px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs border border-amber-300 pointer-events-none">
                  {item.badge}
                </span>
              )}

              {/* Icon */}
              <div className={`w-5 h-5 flex items-center justify-center transition-transform duration-200 ${
                isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(246,208,110,0.7)] text-[#F6D06E]' : 'text-amber-200/80 group-hover:text-amber-200'
              }`}>
                <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>

              {/* Label */}
              <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight mt-0.5 truncate leading-none ${
                isActive ? 'text-[#FFF5C6] font-extrabold' : 'text-slate-300 group-hover:text-white'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
