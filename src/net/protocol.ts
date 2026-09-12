/**
 * WebSocket protocol shared by the React client and the GameRoom
 * Durable Object (GDD §5.3). The engine's Action type is the payload;
 * the server validates the seat and owns all dice rolls.
 */
import type { Action, GameState, PlayerId } from '../game/types';
import { isValidAction } from '../game/validateAction';

export type ClientMessage =
  /**
   * Join (or rejoin) a room; the token identifies the player across
   * reconnects. Optional playerId+secret tie the seat to a D1 profile
   * (ELO is recorded when both seats have one); optional deckId picks
   * one of the player's saved decks instead of the starter deck.
   */
  | { type: 'JOIN_ROOM'; token: string; name: string; playerId?: string; secret?: string; deckId?: string }
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
    const msg = JSON.parse(raw) as Record<string, unknown>;
    if (!msg || typeof msg !== 'object') return null;

    if (msg.type === 'JOIN_ROOM') {
      const { token, name, playerId, secret, deckId } = msg;
      if (
        typeof token === 'string' &&
        typeof name === 'string' &&
        (playerId === undefined || typeof playerId === 'string') &&
        (secret === undefined || typeof secret === 'string') &&
        (deckId === undefined || typeof deckId === 'string')
      ) {
        return { type: 'JOIN_ROOM', token, name, playerId, secret, deckId };
      }
      return null;
    }

    if (msg.type === 'ACTION') {
      const { action } = msg;
      if (isValidAction(action)) return { type: 'ACTION', action };
      return null;
    }
  } catch {
    // fall through
  }
  return null;
}
