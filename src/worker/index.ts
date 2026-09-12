/**
 * Cloudflare Worker entry point (GDD §5.2): routes API traffic,
 * upgrades /api/rooms/:id/ws to a WebSocket handled by the room's
 * Durable Object, pairs quick-play seekers via the Matchmaker DO,
 * and serves the built React app for everything else.
 */
import { handleApi } from './api';
import type { Env } from './env';
import { generateRoomCode, roomCodeFromWsPath } from './roomCode';

export { GameRoom } from './GameRoom';
export { Matchmaker } from './Matchmaker';
export { RatingCoordinator } from './RatingCoordinator';
export type { Env } from './env';

const CAPACITOR_ORIGINS = new Set([
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
]);

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin');
  if (!origin) return null;
  const requestOrigin = new URL(request.url).origin;
  const configured = new Set(
    (env.CORS_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return origin === requestOrigin || CAPACITOR_ORIGINS.has(origin) || configured.has(origin) ? origin : null;
}

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function withCors(response: Response, origin: string | null): Response {
  if (!origin) return response;
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders(origin))) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);

    // Browsers always send Origin on cross-origin requests and WebSocket
    // handshakes. Reject unknown origins before routing, not merely by omitting
    // response headers, so simple POSTs cannot still consume server resources.
    if (url.pathname.startsWith('/api/') && request.headers.has('Origin') && !origin) {
      return new Response('Origin not allowed', { status: 403 });
    }

    if (url.pathname.startsWith('/api/') && request.method === 'OPTIONS') {
      if (!origin) return new Response(null, { status: 400 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === '/api/rooms' && request.method === 'POST') {
      return withCors(Response.json({ roomId: generateRoomCode() }), origin);
    }

    // Profiles, decks, leaderboard (D1).
    const apiResponse = await handleApi(request, env).catch((e) => {
      console.error('api error', e);
      return Response.json({ error: 'Server error' }, { status: 500 });
    });
    if (apiResponse) return withCors(apiResponse, origin);

    if (url.pathname.startsWith('/api/matchmaking/')) {
      const stub = env.MATCHMAKER.get(env.MATCHMAKER.idFromName('global'));
      return withCors(await stub.fetch(request), origin);
    }

    const roomId = roomCodeFromWsPath(url.pathname);
    if (roomId) {
      const stub = env.GAME_ROOM.get(env.GAME_ROOM.idFromName(roomId));
      return stub.fetch(request);
    }

    if (url.pathname.startsWith('/api/')) {
      return withCors(new Response('Not found', { status: 404 }), origin);
    }

    // Static frontend (SPA fallback handled by the assets config).
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
