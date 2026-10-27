import React from 'react';
import { Home, MessageSquare, Moon, Layers, Compass, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onOpenProfile?: () => void;
  onGoHome?: () => void;
  onOpenRituals?: () => void;
  onOpenTarot?: () => void;
  onOpenHoroscope?: () => void;
  onOpenChatroom?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection,
  onNavigateSection,
  onGoHome,
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

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      action: handleHomeClick 
    },
    { 
      id: 'chatroom', 
      label: 'Chatroom', 
      icon: MessageSquare, 
      action: onOpenChatroom ? onOpenChatroom : () => onNavigateSection('readers') 
    },
    { 
      id: 'rituals', 
      label: 'Rituals', 
      icon: Moon, 
      action: onOpenRituals ? onOpenRituals : () => onNavigateSection('rituals') 
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060A1C]/95 backdrop-blur-2xl border-t border-indigo-950/80 px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl select-none"
    >
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || (item.id === 'home' && activeSection === 'home');
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-90 ${
                isActive 
                  ? 'text-[#F6D06E] font-semibold bg-white/5' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#F6D06E]' : 'text-slate-400'}`} />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
