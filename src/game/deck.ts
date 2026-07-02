/**
 * Deck construction rules — shared by the deckbuilder UI and the
 * server-side validation in the Worker (never trust the client).
 */
import { CARDS } from './cards';

export const DECK_MIN = 15;
export const DECK_MAX = 25;
export const MAX_COPIES = 2;

/** Returns a Slovak error message, or null when the deck is legal. */
export function validateDeck(cards: string[]): string | null {
  if (cards.length < DECK_MIN) return `Balíček musí mať aspoň ${DECK_MIN} kariet.`;
  if (cards.length > DECK_MAX) return `Balíček môže mať najviac ${DECK_MAX} kariet.`;
  const counts = new Map<string, number>();
  for (const id of cards) {
    if (!CARDS[id]) return `Neznáma karta: ${id}.`;
    const count = (counts.get(id) ?? 0) + 1;
    if (count > MAX_COPIES) return `Karta ${CARDS[id].name} môže byť v balíčku najviac ${MAX_COPIES}×.`;
    counts.set(id, count);
  }
  return null;
}
