import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  Eye,
  Sliders,
  Globe
} from 'lucide-react';
import { useBrandSettings, SiteBrandingSettings } from '../utils/brandSettings';
import { LumysicLogo } from './LumysicLogo';
import { openInNewTab } from '../utils/openNewTab';

interface AdminLogoStudioProps {
  onNotify?: (text: string, type: 'success' | 'error' | 'info') => void;
}

// Preset celestial emblem choices
const PRESET_EMBLEMS = [
  {
    id: 'default_aries',
    name: 'Celestial Aries Ram (Default)',
    url: '', // Empty means use the default master SVG emblem
    shape: 'circle' as const,
    description: 'Original iconic gold astrological ram emblem'
  },
  {
    id: 'mystic_star',
    name: 'Cosmic 8-Point Star',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    shape: 'circle' as const,
    description: 'Brilliant starlight sacred geometry'
  },
  {
    id: 'golden_astrolabe',
    name: 'Solar Astrolabe',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    shape: 'circle' as const,
    description: 'Golden celestial navigation sphere'
  }
];

export const AdminLogoStudio: React.FC<AdminLogoStudioProps> = ({ onNotify }) => {
  const { branding, updateBrandSettings, resetBrandSettings } = useBrandSettings();

  // Local editable draft state
  const [logoUrl, setLogoUrl] = useState<string>(branding.logoUrl || '');
  const [brandName, setBrandName] = useState<string>(branding.brandName || 'LUMSIC');
  const [tagline, setTagline] = useState<string>(branding.tagline || 'Light • Mystic • Guidance');
  const [logoShape, setLogoShape] = useState<'circle' | 'transparent' | 'badge'>(branding.logoShape || 'circle');
  const [glowEffect, setGlowEffect] = useState<boolean>(branding.glowEffect !== false);

  // Status & processing
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft whenever saved branding changes remotely
  useEffect(() => {
    setLogoUrl(branding.logoUrl || '');
    setBrandName(branding.brandName || 'LUMSIC');
    setTagline(branding.tagline || 'Light • Mystic • Guidance');
    setLogoShape(branding.logoShape || 'circle');
    setGlowEffect(branding.glowEffect !== false);
  }, [branding]);

  // Handle local image file upload & convert to base64 Data URL
  const handleFileUpload = (file?: File | null) => {
    if (!file) return;
    setUploadError(null);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP, or GIF).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size is too large (maximum 5MB). Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
        setFileName(file.name);
        if (onNotify) {
          onNotify(`Selected "${file.name}". Click "Publish Logo" to make it live!`, 'info');
        }
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Save changes to Firestore, Server and LocalStorage
  const handlePublish = async () => {
    setIsSaving(true);
    setUploadError(null);
    try {
      const updated = await updateBrandSettings({
        logoUrl: logoUrl.trim(),
        brandName: brandName.trim() || 'LUMSIC',
        tagline: tagline.trim() || 'Light • Mystic • Guidance',
        logoShape,
        glowEffect
      }, 'admin');

      if (onNotify) {
        onNotify('✨ Logo & brand identity updated live on the website!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to save branding:', err);
      setUploadError(err?.message || 'Failed to publish logo changes.');
      if (onNotify) {
        onNotify('Could not publish logo. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original default emblem
  const handleResetToDefault = async () => {
    if (!window.confirm('Reset the website logo back to the original default celestial emblem?')) {
      return;
    }
    setIsResetting(true);
    try {
      await resetBrandSettings('admin');
      setLogoUrl('');
      setBrandName('LUMSIC');
      setTagline('Light • Mystic • Guidance');
      setLogoShape('circle');
      setGlowEffect(true);
      setFileName(null);
      if (onNotify) {
        onNotify('Restored default celestial Aries emblem.', 'info');
      }
    } catch (err) {
      console.error('Failed to reset branding:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Website Logo & Brand Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Live Real-Time Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Update your website logo image, brand typography, and emblem style. Once published, your updated logo reflects instantly across the public site, mobile navigation, and user modals without refreshing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openInNewTab('/')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Open Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 active:scale-95 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Publishing Live...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Logo to Website</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Interactive Real-Time Preview Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Live Visual Preview (Real Website Context)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Preview updates dynamically as you configure
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Preview 1: Header Dark Mode (The primary public header) */}
          <div className="lg:col-span-2 bg-[#0B1024] border border-[#F6D06E]/30 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-amber-300/80 mb-3 pb-2 border-b border-white/5">
              <span className="font-semibold uppercase tracking-wider">Public Header Preview (Dark Cosmic Theme)</span>
              <span className="text-slate-400 font-mono text-[10px]">#070B1F / Desktop & Mobile</span>
            </div>

            {/* Simulated Public Header Bar */}
            <div className="bg-[#070B1F] border border-[#F6D06E]/20 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-md">
              
              {/* Left: Hamburger & Live Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-[#F6D06E]/40 flex flex-col items-center justify-center gap-1 p-2">
                  <span className="h-0.5 w-full bg-[#F6D06E] rounded-full" />
                  <span className="h-0.5 w-full bg-[#F6D06E] rounded-full" />
                  <span className="h-0.5 w-full bg-[#F6D06E] rounded-full" />
                </div>

                <div className="flex items-center gap-2.5">
                  <LumysicLogo 
                    size={38} 
                    glow={glowEffect} 
                    customLogoUrl={logoUrl} 
                    brandName={brandName}
                  />

                  <div className="flex flex-col">
                    <span 
                      className="font-serif font-black tracking-[0.24em] text-lg sm:text-xl bg-gradient-to-r from-[#FFF5C8] via-[#F6D06E] to-[#D4A034] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(246,208,110,0.35)] leading-tight"
                      style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                    >
                      {brandName || 'LUMSIC'}
                    </span>
                    <span className="text-[9px] tracking-[0.18em] text-[#FCE38A]/80 uppercase font-semibold leading-none mt-0.5">
                      {tagline || 'Light • Mystic • Guidance'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Simulated Navigation & CTA */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300">
                  <span>Horoscope</span>
                  <span>•</span>
                  <span>Tarot</span>
                  <span>•</span>
                  <span>Mall</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-bold shadow-xs">
                  Chat Now
                </div>
              </div>

            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>This emblem displays at top-left of every page.</span>
              <span className="text-amber-400 font-medium">Standard size: 38px emblem</span>
            </div>
          </div>

          {/* Preview 2: Footer Light Mode & Standalone Emblem */}
          <div className="space-y-4">
            
            {/* Footer Light Mode Mock */}
            <div className="bg-[#FAF6EB] text-[#2B2418] border-2 border-[#E5D29C] rounded-2xl p-4 shadow-md flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#B45309] mb-2 pb-1 border-b border-[#E5D29C]">
                Footer Light Theme Preview
              </span>
              <div className="flex items-center gap-2.5 py-1">
                <LumysicLogo 
                  size={30} 
                  glow={false} 
                  customLogoUrl={logoUrl} 
                  brandName={brandName}
                />
                <span 
                  className="font-serif font-black tracking-[0.22em] text-base text-[#2B2418]"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                >
                  {brandName || 'LUMSIC'}
                </span>
              </div>
              <span className="text-[10px] text-[#6F6654] mt-2">
                © {new Date().getFullYear()} {brandName || 'LUMSIC'} Sanctuary Inc.
              </span>
            </div>

            {/* Large Emblem Showcase */}
            <div className="bg-[#0B0F1C] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LumysicLogo 
                  size={60} 
                  glow={glowEffect} 
                  customLogoUrl={logoUrl} 
                  brandName={brandName}
                />
                <div>
                  <span className="text-xs font-bold text-white block">Large Display (60px)</span>
                  <span className="text-[10px] text-slate-400">Used in Auth modals & Hero</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isResetting}
                title="Reset to default celestial logo"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition cursor-pointer"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Logo Configuration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Logo Source (Upload, URL, or Presets) */}
        <div className="bg-[#0B0F1C] border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Select Logo Image
              </h3>
            </div>
            
            {/* Input Method Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'upload' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'url' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Image URL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'presets' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Presets
              </button>
            </div>
          </div>

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/40 hover:bg-slate-900/70 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-200">
                  Click to browse or drag & drop your logo image
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG (recommended transparent background), SVG, JPG, WebP (Max 5MB)
                </p>

                {fileName && (
                  <div className="mt-4 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Loaded: {fileName}</span>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Direct Image URL (Hosted Online)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setFileName(null);
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Paste any public HTTPS image URL from your CDN, Cloudinary, Imgur, or website host.
                </p>
              </div>

              {logoUrl && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400 truncate max-w-[280px]">{logoUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl('');
                      setFileName(null);
                    }}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                Select one of our curated celestial emblems or restore the default:
              </p>
              <div className="space-y-2">
                {PRESET_EMBLEMS.map((preset) => {
                  const isSelected = logoUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setLogoUrl(preset.url);
                        setLogoShape(preset.shape);
                        setFileName(null);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-400/60 shadow-sm' 
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LumysicLogo 
                          size={32} 
                          glow={false} 
                          customLogoUrl={preset.url}
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">{preset.name}</span>
                          <span className="text-[10px] text-slate-400">{preset.description}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Logo Indicator */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Status:</span>
            <span className={logoUrl ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {logoUrl ? 'Custom Image Active' : 'Default Celestial Aries Emblem Active'}
            </span>
          </div>

        </div>

        {/* Right Column: Brand Typography & Styling Settings */}
        <div className="bg-[#0B0F1C] border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="pb-3 border-b border-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Brand Name & Style Settings
            </h3>
          </div>

          <div className="space-y-4">
            
            {/* Brand Title Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Brand Name (Displayed in Header & Footer)
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="LUMSIC"
                maxLength={30}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-400 transition"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard: "LUMSIC" • Rendered in gold celestial serif typography.
              </span>
            </div>

            {/* Tagline Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Light • Mystic • Guidance"
                maxLength={50}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400 transition"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Displayed underneath brand name in header and about areas.
              </span>
            </div>

            {/* Emblem Frame Style */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Emblem Frame Container
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'circle', label: 'Gold Orbit Ring', desc: 'Classic circle frame' },
                  { id: 'transparent', label: 'Transparent', desc: 'Floating logo art' },
                  { id: 'badge', label: 'Jewel Badge', desc: 'Curved squircle' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLogoShape(s.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      logoShape === s.id
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs block">{s.label}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Glow Halo Toggle */}
            <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Ambient Golden Aura Glow</span>
                <span className="text-[10px] text-slate-400">Radiates warm celestial light behind the emblem</span>
              </div>
              <button
                type="button"
                onClick={() => setGlowEffect(!glowEffect)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  glowEffect ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {glowEffect ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isResetting}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition cursor-pointer"
            >
              Reset Defaults
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 active:scale-95 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
