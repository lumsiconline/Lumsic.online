// Lets the static frontend (GitHub Pages at lumsic.online) talk to the Express backend
// (server.ts) that runs on Cloud Run / custom host.
//
// When running on lumsic.online or *.github.io, relative "/api/..." or "/uploads/..."
// requests and SSE EventSource streams are routed to the live Cloud Run backend
// instead of hitting the static host (which answers POST with "405 Method Not Allowed").
// On local dev or unified Cloud Run deployments, relative URLs remain unchanged.

const DEFAULT_CLOUD_RUN_BACKEND = 'https://ais-dev-xia7bhme6juyfqryqodf6b-551171641031.asia-southeast1.run.app';

function resolveApiBase(): string {
  const envBase = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.trim();
  if (envBase) return envBase.replace(/\/+$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When served from static GitHub Pages or custom domain lumsic.online without an Express proxy
    if (host === 'lumsic.online' || host === 'www.lumsic.online' || host.endsWith('.github.io')) {
      return DEFAULT_CLOUD_RUN_BACKEND;
    }
  }
  return '';
}

export const API_BASE = resolveApiBase();

export function withApiBase(url: string): string {
  if (!API_BASE) return url;
  return /^\/(api|uploads)(\/|\?|$)/.test(url) ? API_BASE + url : url;
}

function install() {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__lumsicApiBaseInstalled) return;
  w.__lumsicApiBaseInstalled = true;

  // Safely neutralize blocking modal alerts to prevent "lumsic.online says" dialogs
  try {
    window.alert = (msg?: any) => {
      console.warn('[LUMSIC Safe Alert]:', msg);
    };
  } catch {}

  if (!API_BASE) return;

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
