import React, { useState } from 'react';
import { 
  X, User, Compass, Moon, BookOpen, Heart, Bookmark, Star, Bell, Settings, Plus, Sparkles, Check 
} from 'lucide-react';

interface MyAstralDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
  onLogout?: () => void;
  userProfile?: any;
}

export const MyAstralDashboardModal: React.FC<MyAstralDashboardProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
  onLogout,
  userProfile
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'horoscope' | 'readings' | 'saved' | 'settings'>('chart');
  const [profiles, setProfiles] = useState([
    { name: 'Self Profile', date: 'July 15, 1998', time: '14:30', location: 'London, UK', sun: 'Cancer ♋', moon: 'Aries ♈', rising: 'Scorpio ♏' }
  ]);
  const [newProfileName, setNewProfileName] = useState('');
  const [showAddProfile, setShowAddProfile] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="cosmic-card rounded-2xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl flex flex-col md:flex-row h-[600px] border border-[#252A42]">
        
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-64 bg-[#070A18] border-r border-[#252A42] p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#252A42]">
              <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 flex items-center justify-center text-[#E7C878] font-bold">
                L
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">My LUMSIC Sanctuary</h3>
                <span className="text-[10px] text-emerald-400">Free Seeker Tier</span>
              </div>
            </div>

            <nav className="space-y-1 text-xs">
              {[
                { id: 'chart', label: 'My Birth Chart', icon: Compass },
                { id: 'horoscope', label: 'My Daily Horoscope', icon: Moon },
                { id: 'readings', label: 'My Saved Readings', icon: BookOpen },
                { id: 'saved', label: 'Saved Articles & Experts', icon: Bookmark },
                { id: 'settings', label: 'Preferences & Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-[#11162B] text-white font-semibold border border-[#252A42]' 
                        : 'text-[#A8ADC2] hover:text-white hover:bg-[#11162B]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#7C5CFF]" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {userProfile && (
              <div className="mt-4 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Account</div>
                <div className="font-bold text-white truncate">{userProfile.name || 'Seeker'}</div>
                {userProfile.phone && <div className="text-amber-300 font-mono text-[11px] truncate">{userProfile.phone}</div>}
                {userProfile.email && <div className="text-slate-300 text-[11px] truncate">{userProfile.email}</div>}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#252A42] space-y-2">
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Log Out / Switch Account</span>
              </button>
            )}
            <div className="flex items-center justify-between text-[11px] text-[#A8ADC2]">
              <span>ASTRAL v2.4 Global</span>
              <button
                type="button"
                onClick={onClose}
                className="text-[#E7C878] hover:underline cursor-pointer"
              >
                Exit Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#0D1026] relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 rounded-lg text-[#A8ADC2] hover:text-white bg-[#070A18] border border-[#252A42] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Tab 1: My Birth Chart */}
          {activeTab === 'chart' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#252A42]">
                <div>
                  <h3 className="text-xl font-bold text-white">My Birth Profiles</h3>
                  <p className="text-xs text-[#A8ADC2]">Manage your primary chart and partner/family charts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProfile(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#7C5CFF] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Profile</span>
                </button>
              </div>

              {profiles.map((p, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-[#11162B] border border-[#252A42] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{p.name}</span>
                    <span className="text-xs text-[#E7C878] font-mono">{p.date} • {p.time}</span>
                  </div>
                  <div className="text-xs text-[#A8ADC2]">Location: {p.location}</div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#070A18] text-center border border-[#252A42]">
                      <span className="text-gray-400 block text-[10px]">Sun</span>
                      <span className="font-bold text-white">{p.sun}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070A18] text-center border border-[#252A42]">
                      <span className="text-gray-400 block text-[10px]">Moon</span>
                      <span className="font-bold text-white">{p.moon}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070A18] text-center border border-[#252A42]">
                      <span className="text-gray-400 block text-[10px]">Rising</span>
                      <span className="font-bold text-white">{p.rising}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateSection('birth-chart');
                    }}
                    className="w-full mt-2 py-2 rounded-lg bg-[#1A2038] hover:bg-[#7C5CFF] text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    View Complete Natal Wheel
                  </button>
                </div>
              ))}

              {showAddProfile && (
                <div className="p-4 rounded-xl bg-[#070A18] border border-[#7C5CFF]/40 space-y-3">
                  <h4 className="text-xs font-bold text-white">Create Additional Birth Profile</h4>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Profile name (e.g. Partner, Sibling)..."
                    className="w-full bg-[#11162B] border border-[#252A42] rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (newProfileName) {
                          setProfiles(prev => [...prev, {
                            name: newProfileName,
                            date: 'Oct 10, 1996',
                            time: '09:15',
                            location: 'Paris, France',
                            sun: 'Libra ♎',
                            moon: 'Virgo ♍',
                            rising: 'Cancer ♋'
                          }]);
                          setNewProfileName('');
                          setShowAddProfile(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#7C5CFF] text-xs text-white font-semibold cursor-pointer"
                    >
                      Save Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProfile(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#11162B] text-xs text-[#A8ADC2] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: My Horoscope */}
          {activeTab === 'horoscope' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Personalized Transit Summary</h3>
              <p className="text-xs text-[#A8ADC2]">Based on your Sun in Cancer and Scorpio Ascendant:</p>
              
              <div className="p-4 rounded-xl bg-[#11162B] border border-[#252A42] space-y-2">
                <span className="text-xs font-bold text-[#E7C878] block">Today's Highlighted Transit:</span>
                <p className="text-xs text-[#A8ADC2] leading-relaxed">
                  The Moon enters Gemini, illuminating your 8th house of transformation and joint ventures. Communication flows with heightened intuitive accuracy.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateSection('horoscope');
                }}
                className="px-4 py-2 rounded-lg bg-[#7C5CFF] text-xs font-semibold text-white cursor-pointer"
              >
                Open Full Daily Horoscope Section
              </button>
            </div>
          )}

          {/* Tab 3: Saved Readings */}
          {activeTab === 'readings' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Recorded Consultations &amp; Card Draws</h3>
              <div className="p-4 rounded-xl bg-[#11162B] border border-[#252A42] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">The Star (XVII) – Daily Single Draw</span>
                  <span className="text-[10px] text-[#A8ADC2]">Today</span>
                </div>
                <p className="text-xs text-[#A8ADC2]">Keywords: Hope, Inspiration, Serenity, Spiritual Grace.</p>
              </div>
            </div>
          )}

          {/* Tab 4: Saved Articles & Experts */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Saved Library</h3>
              <div className="p-3.5 rounded-xl bg-[#11162B] border border-[#252A42] text-xs space-y-1">
                <span className="font-bold text-white block">The Architecture of Self: Reading a Natal Chart</span>
                <span className="text-[#A8ADC2]">By Elena Vance • 6 min read</span>
              </div>
            </div>
          )}

          {/* Tab 5: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Account Settings &amp; Timezone</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#A8ADC2] mb-1">Display Timezone</label>
                  <select className="w-full bg-[#11162B] border border-[#252A42] rounded-lg p-2.5 text-white">
                    <option>GMT (UTC+0) – London</option>
                    <option>EST (UTC-5) – New York</option>
                    <option>PST (UTC-8) – Los Angeles</option>
                    <option>CET (UTC+1) – Paris/Berlin</option>
                    <option>IST (UTC+5:30) – Mumbai/Delhi</option>
                    <option>JST (UTC+9) – Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#A8ADC2] mb-1">Preferred Ephemeris House System</label>
                  <select className="w-full bg-[#11162B] border border-[#252A42] rounded-lg p-2.5 text-white">
                    <option>Placidus (Standard Western)</option>
                    <option>Whole Sign</option>
                    <option>Koch</option>
                    <option>Equal House</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
