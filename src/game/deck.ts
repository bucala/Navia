/**
 * Deck construction rules — shared by the deckbuilder UI and the
 * server-side validation in the Worker (never trust the client).
 * Errors are codes + params so the client can localize them.
 */
import { CARDS } from './cards';

export const DECK_MIN = 15;
export const DECK_MAX = 25;
export const MAX_COPIES = 2;

export interface DeckError {
  code: 'deckTooSmall' | 'deckTooBig' | 'deckUnknownCard' | 'deckTooManyCopies';
  params: Record<string, string | number>;
}

/** Returns an error descriptor, or null when the deck is legal. */
export function validateDeck(cards: string[]): DeckError | null {
  if (cards.length < DECK_MIN) return { code: 'deckTooSmall', params: { n: DECK_MIN } };
  if (cards.length > DECK_MAX) return { code: 'deckTooBig', params: { n: DECK_MAX } };
  const counts = new Map<string, number>();
  for (const id of cards) {
    if (!CARDS[id]) return { code: 'deckUnknownCard', params: { card: id } };
    const count = (counts.get(id) ?? 0) + 1;
    if (count > MAX_COPIES) return { code: 'deckTooManyCopies', params: { card: id, n: MAX_COPIES } };
    counts.set(id, count);
  }
  return null;
}
