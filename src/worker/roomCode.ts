/** Unambiguous room codes (no 0/O, 1/I/L). */
const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = '';
  for (const b of bytes) code += ROOM_ALPHABET[b % ROOM_ALPHABET.length];
  return code;
}
