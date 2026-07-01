/**
 * Cloudflare Worker entry point (GDD §5.2): routes API traffic,
 * upgrades /api/rooms/:id/ws to a WebSocket handled by the room's
 * Durable Object, and serves the built React app for everything else.
 */
export { GameRoom } from './GameRoom';

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  ASSETS: Fetcher;
}

/** Unambiguous room codes (no 0/O, 1/I/L). */
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = '';
  for (const b of bytes) code += ROOM_ALPHABET[b % ROOM_ALPHABET.length];
  return code;
}

const ROOM_WS_PATTERN = /^\/api\/rooms\/([A-Za-z0-9]{4,12})\/ws$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/rooms' && request.method === 'POST') {
      return Response.json({ roomId: generateRoomCode() });
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
