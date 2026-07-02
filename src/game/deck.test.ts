import { describe, expect, it } from 'vitest';
import { STARTER_DECK } from './cards';
import { DECK_MIN, MAX_COPIES, validateDeck } from './deck';
import { ELO_START, eloDelta } from './elo';

describe('validateDeck', () => {
  it('accepts the starter deck', () => {
    expect(validateDeck(STARTER_DECK)).toBeNull();
  });

  it('rejects too small and too large decks', () => {
    expect(validateDeck(STARTER_DECK.slice(0, DECK_MIN - 1))?.code).toBe('deckTooSmall');
    expect(validateDeck([...STARTER_DECK, ...STARTER_DECK])?.code).toBe('deckTooBig');
  });

  it('rejects unknown cards and too many copies', () => {
    expect(validateDeck([...STARTER_DECK.slice(0, 14), 'falosna_karta'])?.code).toBe('deckUnknownCard');
    const tooMany = [...STARTER_DECK.slice(0, DECK_MIN - MAX_COPIES - 1), 'gorila', 'gorila', 'gorila'];
    expect(validateDeck(tooMany)?.code).toBe('deckTooManyCopies');
  });
});

describe('eloDelta', () => {
  it('gives 16 points for an even match (K=32)', () => {
    expect(eloDelta(ELO_START, ELO_START)).toBe(16);
  });

  it('rewards upsets more than expected wins, never below 1', () => {
    const underdogWin = eloDelta(800, 1200);
    const favouriteWin = eloDelta(1200, 800);
    expect(underdogWin).toBeGreaterThan(favouriteWin);
    expect(eloDelta(2400, 800)).toBeGreaterThanOrEqual(1);
  });
});
