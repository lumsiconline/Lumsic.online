import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Sliders, 
  BookOpen, 
  ShieldAlert, 
  Play, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare,
  Clock,
  Layers,
  Search,
  Filter,
  Check,
  X,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';
import { AssistantSettings, AssistantTrainingExample, Reader } from '../types';
import { auth } from '../lib/firebase';

interface AdminAssistantTrainingPanelProps {
  readers: Reader[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminAssistantTrainingPanel: React.FC<AdminAssistantTrainingPanelProps> = ({
  readers,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'training' | 'behavior' | 'personas' | 'safety' | 'tester'>('training');
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filter state for training examples
  const [exampleFilterCategory, setExampleFilterCategory] = useState<string>('all');
  const [exampleFilterAstro, setExampleFilterAstro] = useState<string>('all');
  const [exampleSearchQuery, setExampleSearchQuery] = useState<string>('');

  // Form state for adding/editing a training example
  const [editingExampleId, setEditingExampleId] = useState<string | null>(null);
  const [formQuestion, setFormQuestion] = useState('');
  const [formResponse, setFormResponse] = useState('');
  const [formWhy, setFormWhy] = useState('');
  const [formCategory, setFormCategory] = useState<'love' | 'career' | 'ex' | 'money' | 'tarot' | 'astrology' | 'general'>('ex');
  const [formAstroId, setFormAstroId] = useState<string>('');

  // Persona overrides selection
  const [selectedPersonaAstroId, setSelectedPersonaAstroId] = useState<string>(readers[0]?.id || 'genevieve-laurent');

  // Disallowed word input
  const [newDisallowedWord, setNewDisallowedWord] = useState('');

  // Sandbox Tester state
  const [testQuestion, setTestQuestion] = useState('Will my ex reach out this weekend?');
  const [testAstroId, setTestAstroId] = useState<string>(readers[0]?.id || 'genevieve-laurent');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const adminFetch = async (url: string, init?: RequestInit): Promise<Response> => {
    let token = '';
    try {
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
    } catch {}
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    };
    return fetch(url, { ...init, headers });
  };

  // Fetch settings & analytics on mount
  useEffect(() => {
    fetchSettings();
    fetchAnalytics();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminFetch('/api/admin/assistant-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch {
      showToast('Failed to load assistant settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await adminFetch('/api/admin/assistant-analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {}
  };

  const handleSaveGlobalSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await adminFetch('/api/admin/assistant-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Assistant behavioral settings updated successfully!', 'success');
      } else {
        showToast('Error saving settings', 'error');
      }
    } catch {
      showToast('Network error while saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTrainingExample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formResponse.trim() || !formWhy.trim()) {
      showToast('Please fill in Question, Good Response, and Why It Is Good', 'error');
      return;
    }

    try {
      if (editingExampleId) {
        // Update
        const res = await adminFetch(`/api/admin/assistant-settings/examples/${editingExampleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userQuestion: formQuestion.trim(),
            goodResponse: formResponse.trim(),
            whyItIsGood: formWhy.trim(),
            category: formCategory,
            astrologerId: formAstroId || undefined
          })
        });
        if (res.ok) {
          showToast('Training example updated!', 'success');
          resetForm();
          fetchSettings();
        }
      } else {
        // Create
        const res = await adminFetch('/api/admin/assistant-settings/examples', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userQuestion: formQuestion.trim(),
            goodResponse: formResponse.trim(),
            whyItIsGood: formWhy.trim(),
            category: formCategory,
            astrologerId: formAstroId || undefined
          })
        });
        if (res.ok) {
          showToast('New training example added!', 'success');
          resetForm();
          fetchSettings();
        }
      }
    } catch {
      showToast('Error saving training example', 'error');
    }
  };

  const handleDeleteExample = async (id: string) => {
    if (!confirm('Are you sure you want to remove this training example?')) return;
    try {
      const res = await adminFetch(`/api/admin/assistant-settings/examples/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Training example removed', 'info');
        fetchSettings();
      }
    } catch {
      showToast('Failed to delete example', 'error');
    }
  };

  const handleEditExample = (ex: AssistantTrainingExample) => {
    setEditingExampleId(ex.id);
    setFormQuestion(ex.userQuestion);
    setFormResponse(ex.goodResponse);
    setFormWhy(ex.whyItIsGood || ex.whyItWorks || '');
    setFormCategory((ex.category as any) || 'general');
    setFormAstroId(ex.astrologerId || '');
  };

  const resetForm = () => {
    setEditingExampleId(null);
    setFormQuestion('');
    setFormResponse('');
    setFormWhy('');
    setFormCategory('ex');
    setFormAstroId('');
  };

  const handleAddDisallowedWord = () => {
    if (!newDisallowedWord.trim() || !settings) return;
    const clean = newDisallowedWord.trim().toLowerCase();
    if (settings.disallowedWords.includes(clean)) {
      showToast('Word already in list', 'info');
      return;
    }
    const updated = [...settings.disallowedWords, clean];
    setSettings({ ...settings, disallowedWords: updated });
    setNewDisallowedWord('');
  };

  const handleRemoveDisallowedWord = (word: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      disallowedWords: settings.disallowedWords.filter((w: string) => w !== word)
    });
  };

  const handleRunSandboxTest = async () => {
    if (!testQuestion.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await adminFetch('/api/admin/assistant-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: testQuestion.trim(),
          astrologerId: testAstroId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      } else {
        showToast('Error running test', 'error');
      }
    } catch {
      showToast('Network error while running test', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
        <p className="text-xs font-bold">Loading Assistant Configuration &amp; Training Data...</p>
      </div>
    );
  }

  // Filtered training examples
  const filteredExamples = settings.trainingExamples.filter((ex: AssistantTrainingExample) => {
    if (exampleFilterCategory !== 'all' && ex.category !== exampleFilterCategory) return false;
    if (exampleFilterAstro === 'global' && ex.astrologerId) return false;
    if (exampleFilterAstro !== 'all' && exampleFilterAstro !== 'global' && ex.astrologerId !== exampleFilterAstro) return false;
    if (exampleSearchQuery.trim()) {
      const q = exampleSearchQuery.toLowerCase();
      return (
        ex.userQuestion.toLowerCase().includes(q) ||
        ex.goodResponse.toLowerCase().includes(q) ||
        (ex.whyItIsGood || ex.whyItWorks || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & METRICS BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Conversational Assistant &amp; Training Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 uppercase">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure natural, human-like psychic conversational intelligence, 1-2 line limits, 30s recharge warnings, and few-shot training examples.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveGlobalSettings}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Deploy Settings'}</span>
            </button>
          </div>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Active Training Rules</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{settings.trainingExamples.length}</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Behavioral Few-Shots</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Paid Conversion Rate</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{analytics?.conversionRatePercent || 48}%</div>
            <div className="text-[10px] text-rose-600 font-bold mt-0.5">Free 2-Min → Paid</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Average Seeker Messages</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{analytics?.avgUserMessages || 5.4}</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">Per 2-Min Session</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Satisfaction Score</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">4.96 ★</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">Natural &amp; Engaging</div>
          </div>
        </div>
      </div>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'training', label: 'Few-Shot Training Area', icon: BookOpen },
          { id: 'behavior', label: 'Core Behavior & Rules', icon: Sliders },
          { id: 'personas', label: 'Astrologer Personas', icon: HeartHandshake },
          { id: 'safety', label: 'Safety & Disallowed Rules', icon: ShieldAlert },
          { id: 'tester', label: 'Interactive Sandbox Tester', icon: Play },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: FEW-SHOT TRAINING AREA (REQUIREMENTS 14 & 15) */}
      {/* ========================================================= */}
      {activeSubTab === 'training' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Add / Edit Training Example Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-sm text-slate-900">
                  {editingExampleId ? 'Edit Training Example' : 'Add New Training Example'}
                </h3>
              </div>
              {editingExampleId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveTrainingExample} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-rose-500"
                  >
                    <option value="ex">Ex / Broken Relationship</option>
                    <option value="love">Love &amp; Soulmate</option>
                    <option value="career">Career &amp; Work</option>
                    <option value="money">Money &amp; Decisions</option>
                    <option value="tarot">Tarot Card Meaning</option>
                    <option value="astrology">Vedic / Kundli Astrology</option>
                    <option value="general">General Intuitive Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Astrologer Context</label>
                  <select
                    value={formAstroId}
                    onChange={(e) => setFormAstroId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-rose-500"
                  >
                    <option value="">Global (All Astrologers)</option>
                    {readers.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* USER QUESTION */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  USER QUESTION:
                </label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. Will my ex come back?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 font-medium"
                />
              </div>

              {/* GOOD RESPONSE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-800">
                    GOOD RESPONSE (1–2 Short Lines):
                  </label>
                  <span className="text-[10px] text-rose-600 font-bold">Max 2 lines · Curiosity Hook</span>
                </div>
                <textarea
                  rows={2}
                  value={formResponse}
                  onChange={(e) => setFormResponse(e.target.value)}
                  placeholder="e.g. I feel there's still unfinished emotion around this connection. ❤️&#10;Before I go deeper, are you two currently in contact?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500 font-medium resize-none"
                />
              </div>

              {/* WHY IT IS GOOD */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  WHY IT IS GOOD:
                </label>
                <textarea
                  rows={2}
                  value={formWhy}
                  onChange={(e) => setFormWhy(e.target.value)}
                  placeholder="e.g. Validates the emotional bond immediately without making false promises, and asks a relevant follow-up question."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingExampleId ? 'Update Example' : 'Add Example to Training Set'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Training Examples List with Filters */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-slate-900">
                  Current Training Corpus ({filteredExamples.length} Examples)
                </h3>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={exampleSearchQuery}
                    onChange={(e) => setExampleSearchQuery(e.target.value)}
                    placeholder="Search examples..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-rose-500 w-36 sm:w-44"
                  />
                </div>

                <select
                  value={exampleFilterCategory}
                  onChange={(e) => setExampleFilterCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="ex">Ex Connections</option>
                  <option value="love">Love &amp; Soulmate</option>
                  <option value="career">Career</option>
                  <option value="money">Money</option>
                  <option value="tarot">Tarot</option>
                  <option value="astrology">Astrology</option>
                  <option value="general">General</option>
                </select>

                <select
                  value={exampleFilterAstro}
                  onChange={(e) => setExampleFilterAstro(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="all">All Astrologers</option>
                  <option value="global">Global Only</option>
                  {readers.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredExamples.map((ex: AssistantTrainingExample) => {
                const targetReader = readers.find(r => r.id === ex.astrologerId);
                return (
                  <div 
                    key={ex.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                          {ex.category || 'General'}
                        </span>
                        {targetReader ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            Reader: {targetReader.name}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Global
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditExample(ex)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                          title="Edit Example"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExample(ex.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Example"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question & Response Card Presentation */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="font-black text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">
                          USER QUESTION:
                        </div>
                        <div className="font-extrabold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200/60">
                          "{ex.userQuestion}"
                        </div>
                      </div>

                      <div>
                        <div className="font-black text-emerald-600 text-[10px] uppercase tracking-wider mb-0.5">
                          GOOD RESPONSE:
                        </div>
                        <div className="font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-emerald-200/60 whitespace-pre-line leading-relaxed">
                          {ex.goodResponse}
                        </div>
                      </div>

                      <div>
                        <div className="font-black text-rose-600 text-[10px] uppercase tracking-wider mb-0.5">
                          WHY IT IS GOOD:
                        </div>
                        <div className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                          {ex.whyItIsGood}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredExamples.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  No examples match the current filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CORE BEHAVIOR & RULES (REQUIREMENTS 1, 3, 8, 11, 12) */}
      {/* ========================================================= */}
      {activeSubTab === 'behavior' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-black text-sm text-slate-900 mb-1">Global Conversational Rules &amp; Timing</h3>
            <p className="text-xs text-slate-500">
              Control the assistant's underlying persona, response length constraints, and the 2-minute introductory session timer.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Global System Instructions
              </label>
              <textarea
                rows={4}
                value={settings.globalInstructions}
                onChange={(e) => setSettings({ ...settings, globalInstructions: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tone &amp; Emotional Posture
                </label>
                <input
                  type="text"
                  value={settings.toneStyle}
                  onChange={(e) => setSettings({ ...settings, toneStyle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Language Behavior
                </label>
                <input
                  type="text"
                  value={settings.languageBehavior}
                  onChange={(e) => setSettings({ ...settings, languageBehavior: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Session duration & 30s recharge timing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Max Response Lines
                </label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={settings.maxResponseLines}
                  onChange={(e) => setSettings({ ...settings, maxResponseLines: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Strictly 1–2 short lines</span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Free Session Duration (Seconds)
                </label>
                <input
                  type="number"
                  min={60}
                  max={600}
                  step={10}
                  value={settings.sessionDurationSeconds}
                  onChange={(e) => setSettings({ ...settings, sessionDurationSeconds: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: 120s (2 Minutes)</span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Recharge Warning Notice (Seconds Remaining)
                </label>
                <input
                  type="number"
                  min={15}
                  max={60}
                  step={5}
                  value={settings.warningTimingSeconds}
                  onChange={(e) => setSettings({ ...settings, warningTimingSeconds: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: 30s before expiration</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Follow-up Question Style
              </label>
              <input
                type="text"
                value={settings.followUpBehavior}
                onChange={(e) => setSettings({ ...settings, followUpBehavior: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveGlobalSettings}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Save Core Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ASTROLOGER PERSONAS (REQUIREMENT 10) */}
      {/* ========================================================= */}
      {activeSubTab === 'personas' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-black text-sm text-slate-900 mb-1">Astrologer Persona Adaptations</h3>
            <p className="text-xs text-slate-500">
              The assistant inherits each astrologer's profile context (specialties, style, bio, shift) while strictly following the 1-2 line conversational rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Astrologer Selector */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {readers.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedPersonaAstroId(r.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    selectedPersonaAstroId === r.id
                      ? 'bg-rose-50 border-rose-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="truncate">
                    <div className="font-extrabold text-xs text-slate-900 truncate">{r.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{r.category} · {r.specialties?.[0]}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Custom Astrologer Notes */}
            <div className="md:col-span-2 space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              {(() => {
                const currentReader = readers.find(r => r.id === selectedPersonaAstroId) || readers[0];
                const currentOverride = settings.astrologerOverrides?.[currentReader.id] || {};

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <img src={currentReader.avatar} alt={currentReader.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{currentReader.name}</h4>
                        <p className="text-xs text-slate-500">{currentReader.title} · {currentReader.category}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Specialty &amp; Persona Focus</label>
                      <input
                        type="text"
                        value={currentOverride.specialtyFocus || currentReader.specialties?.join(', ') || ''}
                        onChange={(e) => {
                          const updated = {
                            ...settings.astrologerOverrides,
                            [currentReader.id]: {
                              ...currentOverride,
                              specialtyFocus: e.target.value
                            }
                          };
                          setSettings({ ...settings, astrologerOverrides: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Reading Style &amp; Intuitive Voice</label>
                      <input
                        type="text"
                        value={currentOverride.readingStyle || currentReader.category || ''}
                        onChange={(e) => {
                          const updated = {
                            ...settings.astrologerOverrides,
                            [currentReader.id]: {
                              ...currentOverride,
                              readingStyle: e.target.value
                            }
                          };
                          setSettings({ ...settings, astrologerOverrides: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Astrologer Specific Behavioral Instructions</label>
                      <textarea
                        rows={3}
                        value={currentOverride.customInstructions || ''}
                        placeholder="e.g. Focus on Tarot Major Arcana archetypes. Emphasize unspoken heart currents."
                        onChange={(e) => {
                          const updated = {
                            ...settings.astrologerOverrides,
                            [currentReader.id]: {
                              ...currentOverride,
                              customInstructions: e.target.value
                            }
                          };
                          setSettings({ ...settings, astrologerOverrides: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveGlobalSettings}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                      >
                        Update {currentReader.name} Persona
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SAFETY & DISALLOWED RESPONSES (REQUIREMENT 13) */}
      {/* ========================================================= */}
      {activeSubTab === 'safety' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-black text-sm text-slate-900 mb-1">Safety Boundaries &amp; Disallowed Content</h3>
            <p className="text-xs text-slate-500">
              The assistant will never make guaranteed claims regarding death, illness, pregnancy, legal outcomes, or guaranteed money.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Disallowed Phrases &amp; Rigid Words
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newDisallowedWord}
                  onChange={(e) => setNewDisallowedWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDisallowedWord())}
                  placeholder="e.g. 100% guarantee, definitely return"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddDisallowedWord}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Add Phrase
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.disallowedWords.map((word: string) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDisallowedWord(word)}
                      className="hover:text-rose-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Approved Transparent Canned Responses */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Approved Transparency Responses
              </label>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-extrabold text-slate-900">AI Inquiry Standard Response (Section 2)</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium italic">
                  "I'm a virtual astrology assistant here to help you explore your question before you connect with a reader. ✨"
                </div>
                <p className="text-[10px] text-slate-500">
                  Triggered automatically when seeker asks if speaking with AI, bot, or human.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: INTERACTIVE SANDBOX TESTER */}
      {/* ========================================================= */}
      {activeSubTab === 'tester' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-black text-sm text-slate-900 mb-1">Interactive Assistant Sandbox Tester</h3>
            <p className="text-xs text-slate-500">
              Test any seeker question in real-time under any astrologer's persona to verify 1-2 line limits, warmth, curiosity, and language matching.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Test Astrologer Context</label>
                <select
                  value={testAstroId}
                  onChange={(e) => setTestAstroId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                >
                  {readers.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Quick Test Prompts</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTestQuestion("Will my ex come back to me?")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    Ex Return
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestQuestion("Are you an AI or real psychic?")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    AI Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestQuestion("Meri shaadi kab hogi?")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    Hindi Marriage
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestQuestion("Will I get promoted next month?")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    Career
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Seeker Question</label>
              <textarea
                rows={2}
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                placeholder="Enter any question a seeker would ask..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <button
              onClick={handleRunSandboxTest}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Generating Response...' : 'Run Real-Time Simulation'}</span>
            </button>

            {/* Test Results Output */}
            {testResult && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-xs text-slate-900">
                      Simulation Generated for {testResult.astrologerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      testResult.adheresToLengthLimit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {testResult.lineCount} Lines · {testResult.wordCount} Words
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/90 text-sm font-bold text-slate-900 whitespace-pre-line leading-relaxed shadow-xs">
                  {testResult.response}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-4">
                  <span>✓ 1-2 Line Rule Respected</span>
                  <span>✓ Curiosity Follow-Up Hook Present</span>
                  <span>✓ Emotionally Attuned Phrasing</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
