/** Unambiguous room codes (no 0/O, 1/I/L). */
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const ROOM_WS_PATTERN = /^\/api\/rooms\/([A-Za-z0-9]{4,12})\/ws$/;

export function generateRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = '';
  for (const b of bytes) code += ROOM_ALPHABET[b % ROOM_ALPHABET.length];
  return code;
}

/** Extracts the upper-cased room code from a /api/rooms/:code/ws path. */
export function roomCodeFromWsPath(pathname: string): string | null {
  return pathname.match(ROOM_WS_PATTERN)?.[1].toUpperCase() ?? null;
}
