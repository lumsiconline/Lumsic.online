/**
 * Safe Storage utility for restricted iframe environments (AI Studio, sandbox, privacy modes).
 * In Chrome/Safari third-party iframes, accessing `window.localStorage` can throw
 * a DOMException (SecurityError: Access is denied for this document).
 * This wrapper transparently catches all errors and falls back to an in-memory store.
 */

const memoryStore = new Map<string, string>();

function getNativeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const storage = window.localStorage;
      // Probe to verify storage read/write permission
      const probeKey = '__lumsic_storage_probe__';
      storage.setItem(probeKey, '1');
      storage.removeItem(probeKey);
      return storage;
    }
  } catch {
    // Restricted iframe or third-party cookies/storage blocked
  }
  return null;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      const storage = getNativeStorage();
      if (storage) {
        return storage.getItem(key);
      }
    } catch {}
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      const storage = getNativeStorage();
      if (storage) {
        storage.setItem(key, value);
        return;
      }
    } catch {}
    memoryStore.set(key, value);
  },

  removeItem(key: string): void {
    try {
      const storage = getNativeStorage();
      if (storage) {
        storage.removeItem(key);
        return;
      }
    } catch {}
    memoryStore.delete(key);
  },

  clear(): void {
    try {
      const storage = getNativeStorage();
      if (storage) {
        storage.clear();
      }
    } catch {}
    memoryStore.clear();
  }
};
