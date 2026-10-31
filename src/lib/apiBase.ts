// Lets the static frontend (GitHub Pages at lumsic.online) talk to the Express backend
// (server.ts) that runs on a different host.
//
// Set VITE_API_BASE_URL at build time (e.g. https://your-backend.example.com) and every
// relative "/api/..." or "/uploads/..." request — fetch calls AND the live EventSource
// stream used by the astrologer dashboard — is sent to that backend instead of to the
// static host (which answers POST with "405 Method Not Allowed").
// When the variable is empty (local dev, or backend + frontend served together) nothing changes.

const rawBase = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) || '';

export const API_BASE = rawBase.trim().replace(/\/+$/, '');

export function withApiBase(url: string): string {
  if (!API_BASE) return url;
  return /^\/(api|uploads)(\/|\?|$)/.test(url) ? API_BASE + url : url;
}

function install() {
  if (!API_BASE || typeof window === 'undefined') return;
  const w = window as any;
  if (w.__lumsicApiBaseInstalled) return;
  w.__lumsicApiBaseInstalled = true;

  try {
    const rawFetch = window.fetch || (globalThis as any).fetch;
    if (rawFetch) {
      const nativeFetch = rawFetch.bind(globalThis);
      const customFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof input === 'string') return nativeFetch(withApiBase(input), init);
        if (input instanceof URL && input.origin === window.location.origin) {
          return nativeFetch(withApiBase(input.pathname + input.search), init);
        }
        return nativeFetch(input, init);
      }) as typeof window.fetch;

      try {
        Object.defineProperty(window, 'fetch', {
          value: customFetch,
          writable: true,
          configurable: true
        });
      } catch {
        try {
          (window as any).fetch = customFetch;
        } catch (err) {
          console.warn('Could not override window.fetch:', err);
        }
      }
    }
  } catch (err) {
    console.warn('apiBase fetch patch notice:', err);
  }

  try {
    const NativeEventSource = window.EventSource;
    if (NativeEventSource) {
      const PatchedEventSource = function (this: any, url: string | URL, config?: EventSourceInit) {
        return new NativeEventSource(typeof url === 'string' ? withApiBase(url) : url, config);
      } as unknown as typeof EventSource;
      PatchedEventSource.prototype = NativeEventSource.prototype;
      (PatchedEventSource as any).CONNECTING = NativeEventSource.CONNECTING;
      (PatchedEventSource as any).OPEN = NativeEventSource.OPEN;
      (PatchedEventSource as any).CLOSED = NativeEventSource.CLOSED;

      try {
        Object.defineProperty(window, 'EventSource', {
          value: PatchedEventSource,
          writable: true,
          configurable: true
        });
      } catch {
        try {
          (window as any).EventSource = PatchedEventSource;
        } catch (err) {
          console.warn('Could not override window.EventSource:', err);
        }
      }
    }
  } catch (err) {
    console.warn('apiBase EventSource patch notice:', err);
  }
}

try {
  install();
} catch (err) {
  console.warn('apiBase install notice:', err);
}
