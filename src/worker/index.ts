/**
 * Cloudflare Worker entry point (GDD §5.2): routes API traffic,
 * upgrades /api/rooms/:id/ws to a WebSocket handled by the room's
 * Durable Object, pairs quick-play seekers via the Matchmaker DO,
 * and serves the built React app for everything else.
 */
import { handleApi } from './api';
import type { Env } from './env';
import { generateRoomCode } from './roomCode';

export { GameRoom } from './GameRoom';
export { Matchmaker } from './Matchmaker';
export type { Env } from './env';

const ROOM_WS_PATTERN = /^\/api\/rooms\/([A-Za-z0-9]{4,12})\/ws$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/rooms' && request.method === 'POST') {
      return Response.json({ roomId: generateRoomCode() });
    }

    // Profiles, decks, leaderboard (D1).
    const apiResponse = await handleApi(request, env).catch((e) => {
      console.error('api error', e);
      return Response.json({ error: 'Server error' }, { status: 500 });
    });
    if (apiResponse) return apiResponse;

    if (url.pathname.startsWith('/api/matchmaking/')) {
      const stub = env.MATCHMAKER.get(env.MATCHMAKER.idFromName('global'));
      return stub.fetch(request);
    }

    const wsMatch = url.pathname.match(ROOM_WS_PATTERN);
    if (wsMatch) {
      const roomId = wsMatch[1].toUpperCase();
      const stub = env.GAME_ROOM.get(env.GAME_ROOM.idFromName(roomId));
      return stub.fetch(request);
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response('Not found', { status: 404 });
    }

    // Static frontend (SPA fallback handled by the assets config).
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
