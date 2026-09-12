/**
 * API endpoint resolution. In the browser the backend is same-origin
 * (empty base). The Capacitor Android app runs from a local origin, so
 * builds for it set VITE_API_BASE to the deployed Worker URL, e.g.
 *   VITE_API_BASE=https://pantheon-dice-of-destiny.example.workers.dev
 */
const API_BASE = ((import.meta.env.VITE_API_BASE as string | undefined) ?? '').replace(/\/$/, '');
const PUBLIC_APP_BASE = (
  (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ??
  API_BASE
).replace(/\/$/, '');

/** Absolute or same-origin URL for an /api/... path. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** ws(s):// URL for an /api/... WebSocket path. */
export function wsUrl(path: string): string {
  const base = API_BASE || `${window.location.protocol}//${window.location.host}`;
  return `${base.replace(/^http/, 'ws')}${path}`;
}

/** Public browser URL used for links shared outside the Capacitor WebView. */
export function publicAppUrl(path = '/'): string {
  const base = PUBLIC_APP_BASE || window.location.origin;
  return new URL(path, `${base}/`).toString();
}
