import React, { useState } from 'react';
import { Reader, ConsultationStartData } from '../types';
import { 
  X, 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Check
} from 'lucide-react';

interface CustomerIntakeModalProps {
  reader: Reader;
  existingName?: string;
  onClose: () => void;
  onSubmit: (data: ConsultationStartData) => void;
  isFirstTimeUser: boolean;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const POPULAR_LOCATIONS = [
  'London, UK',
  'New York, NY, USA',
  'Manchester, UK',
  'Los Angeles, CA, USA',
  'Birmingham, UK',
  'Chicago, IL, USA',
  'Edinburgh, UK',
  'Toronto, ON, Canada'
];

export const CustomerIntakeModal: React.FC<CustomerIntakeModalProps> = ({
  reader,
  existingName = '',
  onClose,
  onSubmit,
  isFirstTimeUser
}) => {
  const savedName = existingName || (typeof window !== 'undefined' ? (localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name')) : '') || '';

  // 5 sequential steps:
  // 1: Name (auto-skipped if already known)
  // 2: Gender
  // 3: Date of Birth
  // 4: Birth Time
  // 5: Place of Birth / Location
  const [step, setStep] = useState<number>(() => {
    return savedName.trim() ? 2 : 1;
  });

  // Form Fields
  const [name, setName] = useState<string>(savedName);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  
  // Date of Birth fields
  const [birthMonth, setBirthMonth] = useState<number>(6); // 0-indexed, default July (6)
  const [birthDay, setBirthDay] = useState<number>(15);
  const [birthYear, setBirthYear] = useState<number>(1998);

  // Birth Time fields
  const [birthHour, setBirthHour] = useState<number>(10);
  const [birthMinute, setBirthMinute] = useState<number>(30);
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>('AM');
  const [unknownTime, setUnknownTime] = useState<boolean>(false);

  // Place of Birth field
  const [placeOfBirth, setPlaceOfBirth] = useState<string>('');

  // Transition animation flag
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const goToStep = (nextStep: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBack = () => {
    if (step > 1) {
      goToStep(step - 1);
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;

    if (step < 5) {
      goToStep(step + 1);
    } else {
      // Step 5 completed: submit and start chat
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    const formattedMonth = String(birthMonth + 1).padStart(2, '0');
    const formattedDay = String(birthDay).padStart(2, '0');
    const formattedDob = `${birthYear}-${formattedMonth}-${formattedDay}`;

    const formattedTime = unknownTime
      ? undefined
      : `${String(birthHour).padStart(2, '0')}:${String(birthMinute).padStart(2, '0')}`;

    const startData: ConsultationStartData = {
      firstName: name.trim(),
      fullName: name.trim(),
      gender,
      topic: 'Love, Career & Life Guidance',
      readingType: reader.specialties?.[0] || (reader.category === 'Tarot' ? 'Tarot' : 'Psychic'),
      question: `Hello ${reader.name}, I am looking for intuitive guidance on my path.`,
      birthDetails: {
        name: name.trim(),
        gender,
        dob: formattedDob,
        birthTime: formattedTime,
        amPm: unknownTime ? undefined : birthAmPm,
        placeOfBirth: placeOfBirth.trim() || undefined,
        unknownTime
      }
    };

    onSubmit(startData);
  };

  // Helper for Year scroll
  const adjustYear = (delta: number) => {
    setBirthYear(prev => Math.min(2026, Math.max(1930, prev + delta)));
  };

  // Helper for Day scroll
  const adjustDay = (delta: number) => {
    setBirthDay(prev => {
      const next = prev + delta;
      if (next < 1) return 31;
      if (next > 31) return 1;
      return next;
    });
  };

  // Helper for Month scroll
  const adjustMonth = (delta: number) => {
    setBirthMonth(prev => {
      const next = prev + delta;
      if (next < 0) return 11;
      if (next > 11) return 0;
      return next;
    });
  };

  // Helper for Time scroll
  const adjustHour = (delta: number) => {
    setBirthHour(prev => {
      const next = prev + delta;
      if (next < 1) return 12;
      if (next > 12) return 1;
      return next;
    });
  };

  const adjustMinute = (delta: number) => {
    setBirthMinute(prev => {
      const next = prev + delta;
      if (next < 0) return 59;
      if (next > 59) return 0;
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md min-h-[580px] bg-gradient-to-b from-[#180C2E] via-[#241342] to-[#0E061C] border border-[#7C3AED]/40 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col justify-between my-4 text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intake-form-title"
      >
        {/* Subtle Cosmic Nebula Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BAR: Back Arrow + Title + Close Button */}
        <div className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between border-b border-purple-900/40">
          <button
            type="button"
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
            aria-label="Previous step"
            title={step === 1 ? 'Close' : 'Go back'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center">
            <h2 id="intake-form-title" className="text-base font-bold text-white tracking-wide">
              Chat Intake Form
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-200/80 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>With {reader.name}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEPPER: 5 Circles Matching User Screenshots */}
        <div className="relative z-10 px-6 pt-5 pb-2">
          <div className="flex items-center justify-center gap-3.5">
            {[
              { id: 1, icon: User },
              { id: 2, icon: Sparkles },
              { id: 3, icon: Calendar },
              { id: 4, icon: Clock },
              { id: 5, icon: MapPin }
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div
                  key={s.id}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white ring-4 ring-purple-500/30 shadow-md shadow-purple-900/60 scale-110'
                      : isCompleted
                      ? 'bg-[#6D28D9] text-white'
                      : 'bg-white/15 text-white/40'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY: Dynamic Step Card with Smooth Fade/Slide */}
        <div 
          className={`relative z-10 px-6 py-4 flex-1 flex flex-col justify-center transition-all duration-200 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >

          {/* ================= STEP 1: NAME ================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  Hey there!
                </h3>
                <p className="text-base sm:text-lg text-purple-200/90 font-medium mt-1">
                  What is your name?
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) handleNext();
                  }}
                  className="w-full bg-white text-gray-950 px-5 py-4 rounded-2xl border border-white/20 focus:outline-none focus:ring-4 focus:ring-purple-400 font-semibold text-base shadow-xl placeholder:text-gray-400 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!name.trim()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] hover:brightness-110 active:scale-[0.98] text-white font-bold text-base shadow-xl shadow-purple-950/60 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: GENDER ================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  What is your gender?
                </h3>
                <p className="text-sm text-purple-200/80 mt-1">
                  Helps our reader tailor energetic alignment
                </p>
              </div>

              {/* 3 Circular Selection Buttons */}
              <div className="flex items-center justify-center gap-6 sm:gap-7 py-4">
                {[
                  { id: 'Male', label: 'Male', symbol: '♂' },
                  { id: 'Female', label: 'Female', symbol: '♀' },
                  { id: 'Other', label: 'Other', symbol: '⚧' }
                ].map((g) => {
                  const isSelected = gender === g.id;
                  return (
                    <div key={g.id} className="flex flex-col items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGender(g.id as any)}
                        className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center text-3xl font-bold transition-all cursor-pointer shadow-lg active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-tr from-[#6D28D9] to-[#9333EA] text-white border-2 border-white ring-4 ring-purple-400/50 shadow-purple-950/80 scale-105'
                            : 'bg-white/10 hover:bg-white/20 text-white/90 border-2 border-white/25 hover:border-purple-300'
                        }`}
                      >
                        <span>{g.symbol}</span>
                      </button>
                      <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-white' : 'text-purple-200/70'}`}>
                        {g.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] hover:brightness-110 active:scale-[0.98] text-white font-bold text-base shadow-xl shadow-purple-950/60 transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DATE OF BIRTH ================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  Enter your birth date
                </h3>
                <p className="text-sm text-purple-200/80 mt-1">
                  Required to calculate celestial transit coordinates
                </p>
              </div>

              {/* Roller Drum Picker for Month | Day | Year */}
              <div className="bg-white/10 rounded-2xl border border-white/15 p-4 shadow-xl">
                <div className="grid grid-cols-3 gap-2 text-center select-none relative">
                  
                  {/* Highlight Bar across selected middle row */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 bg-white/10 border-y border-purple-300/40 rounded-lg pointer-events-none" />

                  {/* Column 1: Month */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => adjustMonth(-1)}
                      className="p-1 text-white/50 hover:text-white cursor-pointer"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>

                    <div className="py-1 text-xs text-purple-300/60 font-medium">
                      {MONTHS[(birthMonth + 11) % 12]}
                    </div>
                    <div className="py-2 text-lg sm:text-xl font-bold text-white tracking-wide">
                      {MONTHS[birthMonth]}
                    </div>
                    <div className="py-1 text-xs text-purple-300/60 font-medium">
                      {MONTHS[(birthMonth + 1) % 12]}
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustMonth(1)}
                      className="p-1 text-white/50 hover:text-white cursor-pointer"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Column 2: Day */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => adjustDay(-1)}
                      className="p-1 text-white/50 hover:text-white cursor-pointer"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>

                    <div className="py-1 text-xs text-purple-300/60 font-medium">
                      {birthDay === 1 ? 31 : birthDay - 1}
                    </div>
                    <div className="py-2 text-lg sm:text-xl font-bold text-white tracking-wide">
                      {birthDay}
                    </div>
                    <div className="py-1 text-xs text-purple-300/60 font-medium">
                      {birthDay === 31 ? 1 : birthDay + 1}
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustDay(1)}
                      className="p-1 text-white/50 hover:text-white cursor-pointer"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Column 3: Year */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => adjustYear(-1)}
                      className="p-1 text-white/50 hover:text-white cursor-pointer"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>

                    <div className="py-1 text-xs text-purple-300/60 font-medium">
                      {birthYear - 1}
                    </div>
                    <div className="py-2 text-lg sm:text-xl font-bold text-white tracking-wide">
                      {birthYear}
                    </div>
                    <div className="py-1 text-xs text-purple-300/60 font-medium">
                      {birthYear + 1}
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustYear(1)}
                      className="p-1 text-white/50 hover:text-white cursor-pointer"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] hover:brightness-110 active:scale-[0.98] text-white font-bold text-base shadow-xl shadow-purple-950/60 transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: BIRTH TIME ================= */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  Enter your birth time
                </h3>
                <p className="text-sm text-purple-200/80 mt-1">
                  Accurate time reveals exact rising sign and houses
                </p>
              </div>

              {/* Time Selector Wheel */}
              {!unknownTime && (
                <div className="bg-white/10 rounded-2xl border border-white/15 p-4 shadow-xl">
                  <div className="grid grid-cols-3 gap-2 text-center select-none relative">
                    
                    {/* Middle highlight bar */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 bg-white/10 border-y border-purple-300/40 rounded-lg pointer-events-none" />

                    {/* Column 1: Hour */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => adjustHour(-1)}
                        className="p-1 text-white/50 hover:text-white cursor-pointer"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>

                      <div className="py-1 text-xs text-purple-300/60 font-medium">
                        {birthHour === 1 ? 12 : birthHour - 1}
                      </div>
                      <div className="py-2 text-lg sm:text-xl font-bold text-white tracking-wide">
                        {String(birthHour).padStart(2, '0')}
                      </div>
                      <div className="py-1 text-xs text-purple-300/60 font-medium">
                        {birthHour === 12 ? 1 : birthHour + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() => adjustHour(1)}
                        className="p-1 text-white/50 hover:text-white cursor-pointer"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Column 2: Minute */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => adjustMinute(-1)}
                        className="p-1 text-white/50 hover:text-white cursor-pointer"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>

                      <div className="py-1 text-xs text-purple-300/60 font-medium">
                        {String((birthMinute + 59) % 60).padStart(2, '0')}
                      </div>
                      <div className="py-2 text-lg sm:text-xl font-bold text-white tracking-wide">
                        {String(birthMinute).padStart(2, '0')}
                      </div>
                      <div className="py-1 text-xs text-purple-300/60 font-medium">
                        {String((birthMinute + 1) % 60).padStart(2, '0')}
                      </div>

                      <button
                        type="button"
                        onClick={() => adjustMinute(1)}
                        className="p-1 text-white/50 hover:text-white cursor-pointer"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Column 3: AM / PM */}
                    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                      <button
                        type="button"
                        onClick={() => setBirthAmPm('AM')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          birthAmPm === 'AM'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setBirthAmPm('PM')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          birthAmPm === 'PM'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        PM
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Checkbox: Don't know exact time of birth */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={unknownTime}
                    onChange={(e) => setUnknownTime(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-400 border-gray-300 cursor-pointer"
                  />
                  <div className="text-xs text-purple-100">
                    <span className="font-semibold block">Don't know my exact time of birth</span>
                    <span className="text-[11px] text-purple-300/70 mt-0.5 block leading-normal">
                      Note: Without time of birth, we can still achieve upto 80% accurate predictions
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] hover:brightness-110 active:scale-[0.98] text-white font-bold text-base shadow-xl shadow-purple-950/60 transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: PLACE OF BIRTH / LOCATION ================= */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                  Where were you born? <span className="text-base font-normal text-purple-300/80">(Optional)</span>
                </h3>
                <p className="text-sm text-purple-200/80 mt-1">
                  Enter your city, state or country, or skip to begin
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  placeholder="e.g. London, UK or New York, USA"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinalSubmit();
                  }}
                  className="w-full bg-white text-gray-950 pl-5 pr-11 py-4 rounded-2xl border border-white/20 focus:outline-none focus:ring-4 focus:ring-purple-400 font-semibold text-base shadow-xl placeholder:text-gray-400 transition-all"
                />
                <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Quick suggestion chips */}
              <div>
                <span className="text-xs text-purple-300/80 font-semibold block mb-2">
                  Popular Locations:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setPlaceOfBirth(loc)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        placeOfBirth === loc
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-white/10 hover:bg-white/20 text-purple-100 border border-white/10'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.98] text-gray-950 font-bold text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
                >
                  <Sparkles className="w-5 h-5 fill-gray-950 text-gray-950" />
                  <span>Start chat with {reader.name}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM HELPER: Privacy & Security Assurance */}
        <div className="relative z-10 px-6 py-3 border-t border-purple-900/40 text-center">
          <p className="text-[11px] text-purple-300/60 font-medium">
            🔒 100% Private &amp; Confidential · End-to-End Encrypted Consultation
          </p>
        </div>

      </div>
    </div>
  );
};
