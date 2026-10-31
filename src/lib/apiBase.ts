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

  const nativeFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') return nativeFetch(withApiBase(input), init);
    if (input instanceof URL && input.origin === window.location.origin) {
      return nativeFetch(withApiBase(input.pathname + input.search), init);
    }
    return nativeFetch(input, init);
  }) as typeof window.fetch;

  const NativeEventSource = window.EventSource;
  if (NativeEventSource) {
    const PatchedEventSource = function (this: any, url: string | URL, config?: EventSourceInit) {
      return new NativeEventSource(typeof url === 'string' ? withApiBase(url) : url, config);
    } as unknown as typeof EventSource;
    PatchedEventSource.prototype = NativeEventSource.prototype;
    (PatchedEventSource as any).CONNECTING = NativeEventSource.CONNECTING;
    (PatchedEventSource as any).OPEN = NativeEventSource.OPEN;
    (PatchedEventSource as any).CLOSED = NativeEventSource.CLOSED;
    window.EventSource = PatchedEventSource;
  }
}

install();
