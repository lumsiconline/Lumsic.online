import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface SiteBrandingSettings {
  logoUrl?: string; // base64 or remote URL
  brandName: string; // default "LUMSIC"
  tagline: string; // default "Light • Mystic • Guidance"
  logoShape?: 'circle' | 'transparent' | 'badge';
  glowEffect?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_BRANDING: SiteBrandingSettings = {
  logoUrl: '',
  brandName: 'LUMSIC',
  tagline: 'Light • Mystic • Guidance',
  logoShape: 'circle',
  glowEffect: true
};

const STORAGE_KEY = 'lumsic_site_branding_v1';
const BRANDING_CHANNEL_NAME = 'lumsic_branding_channel';
const BRANDING_EVENT_NAME = 'lumsic_branding_updated';

// Read initial state safely from localStorage
export function getStoredBrandSettings(): SiteBrandingSettings {
  if (typeof window === 'undefined') return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_BRANDING, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to parse stored branding settings:', err);
  }
  return DEFAULT_BRANDING;
}

// In-memory cache
let cachedBranding: SiteBrandingSettings = getStoredBrandSettings();
const subscribers = new Set<(branding: SiteBrandingSettings) => void>();

function notifySubscribers(branding: SiteBrandingSettings) {
  cachedBranding = branding;
  subscribers.forEach(cb => {
    try {
      cb(branding);
    } catch {}
  });
}

// Save locally and broadcast to all tabs
export function persistBrandSettingsLocally(settings: SiteBrandingSettings) {
  cachedBranding = settings;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save branding to localStorage:', err);
    }

    // Broadcast across tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(BRANDING_CHANNEL_NAME);
        channel.postMessage({ type: 'branding_updated', branding: settings });
        channel.close();
      }
    } catch {}

    // Dispatch within window
    try {
      window.dispatchEvent(new CustomEvent(BRANDING_EVENT_NAME, { detail: settings }));
    } catch {}
  }
  notifySubscribers(settings);
}

// Global initialization: setup listeners once
let isInitialized = false;
function initGlobalBrandingSync() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // 1. Listen for cross-tab updates via BroadcastChannel
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(BRANDING_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === 'branding_updated' && event.data.branding) {
          cachedBranding = { ...DEFAULT_BRANDING, ...event.data.branding };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedBranding));
          } catch {}
          notifySubscribers(cachedBranding);
        }
      };
    }
  } catch {}

  // 2. Listen for window CustomEvents
  window.addEventListener(BRANDING_EVENT_NAME, (e: any) => {
    if (e.detail) {
      cachedBranding = { ...DEFAULT_BRANDING, ...e.detail };
      notifySubscribers(cachedBranding);
    }
  });

  // 3. Listen to Firebase Firestore in real-time
  try {
    const brandingDocRef = doc(db, 'site_settings', 'branding');
    onSnapshot(brandingDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SiteBrandingSettings;
        if (data && (data.logoUrl !== undefined || data.brandName)) {
          const merged = { ...DEFAULT_BRANDING, ...data };
          cachedBranding = merged;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
          notifySubscribers(merged);
        }
      }
    }, (err) => {
      console.warn('Branding Firestore listener notice:', err);
    });
  } catch (err) {
    console.warn('Firestore branding listener init notice:', err);
  }

  // 4. Fetch from server API as fallback
  fetch('/api/site-settings/branding')
    .then(res => res.json())
    .then(data => {
      if (data?.success && data?.branding) {
        const merged = { ...DEFAULT_BRANDING, ...data.branding };
        cachedBranding = merged;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
        notifySubscribers(merged);
      }
    })
    .catch(() => {});
}

// Auto-run sync on client
if (typeof window !== 'undefined') {
  initGlobalBrandingSync();
}

/**
 * Save updated branding to Firestore, backend API, and local storage
 */
export async function saveBrandSettings(
  updated: Partial<SiteBrandingSettings>,
  updatedBy: string = 'admin'
): Promise<SiteBrandingSettings> {
  const merged: SiteBrandingSettings = {
    ...cachedBranding,
    ...updated,
    updatedAt: new Date().toISOString(),
    updatedBy
  };

  // 1. Instantly persist locally so UI updates with 0 lag
  persistBrandSettingsLocally(merged);

  // 2. Save to Firestore
  try {
    const brandingDocRef = doc(db, 'site_settings', 'branding');
    await setDoc(brandingDocRef, merged, { merge: true });
  } catch (fsErr) {
    console.warn('Firestore branding save notice (falling back to server API):', fsErr);
  }

  // 3. Save to server backend
  try {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('lumsic_admin_token') || sessionStorage.getItem('lumsic_admin_token') || '') : '';
    await fetch('/api/admin/branding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(merged)
    }).catch(async () => {
      // Fallback public endpoint
      await fetch('/api/site-settings/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
    });
  } catch (serverErr) {
    console.warn('Server branding save notice:', serverErr);
  }

  return merged;
}

/**
 * Reset logo to original default celestial Aries emblem
 */
export async function resetBrandSettingsToDefault(updatedBy: string = 'admin'): Promise<SiteBrandingSettings> {
  return saveBrandSettings({
    logoUrl: '',
    brandName: 'LUMSIC',
    tagline: 'Light • Mystic • Guidance',
    logoShape: 'circle',
    glowEffect: true
  }, updatedBy);
}

/**
 * React Hook for any component that needs the live branding configuration
 */
export function useBrandSettings() {
  const [branding, setBranding] = useState<SiteBrandingSettings>(cachedBranding);

  useEffect(() => {
    // Initial sync
    setBranding(cachedBranding);

    // Subscribe to memory updates
    const listener = (newBranding: SiteBrandingSettings) => {
      setBranding({ ...newBranding });
    };
    subscribers.add(listener);

    return () => {
      subscribers.delete(listener);
    };
  }, []);

  return {
    branding,
    updateBrandSettings: (updates: Partial<SiteBrandingSettings>, updatedBy?: string) => 
      saveBrandSettings(updates, updatedBy),
    resetBrandSettings: (updatedBy?: string) => 
      resetBrandSettingsToDefault(updatedBy)
  };
}
