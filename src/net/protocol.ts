/**
 * WebSocket protocol shared by the React client and the GameRoom
 * Durable Object (GDD §5.3). The engine's Action type is the payload;
 * the server validates the seat and owns all dice rolls.
 */
import type { Action, GameState, PlayerId } from '../game/types';

export type ClientMessage =
  /** Join (or rejoin) a room; the token identifies the player across reconnects. */
  | { type: 'JOIN_ROOM'; token: string; name: string }
  /** Any game action — PLAY_CARD, ATTACK (with the dice flag), END_TURN, … */
  | { type: 'ACTION'; action: Action };

/** Player names by seat; null while the seat is empty. */
export interface SeatsInfo {
  p1: string | null;
  p2: string | null;
}

export type ServerMessage =
  /** Which seat this connection plays. */
  | { type: 'ASSIGNED'; seat: PlayerId }
  /** Authoritative game state; null until both players joined. */
  | { type: 'ROOM_STATE'; state: GameState | null; seats: SeatsInfo }
  /** Rejected action or protocol problem ("Nedostatok many", …). */
  | { type: 'ERROR'; message: string };

export function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const msg = JSON.parse(raw) as ClientMessage;
    if (msg && (msg.type === 'JOIN_ROOM' || msg.type === 'ACTION')) return msg;
  } catch {
    // fall through
  }
  return null;
}
