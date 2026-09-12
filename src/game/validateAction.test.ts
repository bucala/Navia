import { describe, expect, it } from 'vitest';
import { isValidAction } from './validateAction';

describe('isValidAction', () => {
  it('accepts well-shaped actions of every type', () => {
    expect(isValidAction({ type: 'END_TURN', player: 'p1' })).toBe(true);
    expect(isValidAction({ type: 'ENTER_COMBAT', player: 'p2' })).toBe(true);
    expect(
      isValidAction({ type: 'PLAY_CARD', player: 'p1', handIndex: 0, lane: 'vanguard', slot: 2 }),
    ).toBe(true);
    expect(
      isValidAction({
        type: 'PLAY_CARD',
        player: 'p1',
        handIndex: 0,
        target: { kind: 'unit', player: 'p2', lane: 'sanctum', slot: 1 },
      }),
    ).toBe(true);
    expect(
      isValidAction({
        type: 'ATTACK',
        player: 'p1',
        attacker: { lane: 'vanguard', slot: 0 },
        target: { kind: 'nexus', player: 'p2' },
        useDice: false,
      }),
    ).toBe(true);
    expect(isValidAction({ type: 'ACTIVATE', player: 'p1', unit: { lane: 'sanctum', slot: 3 } })).toBe(true);
    expect(
      isValidAction({
        type: 'MOVE_UNIT',
        player: 'p1',
        from: { lane: 'vanguard', slot: 0 },
        to: { lane: 'sanctum', slot: 1 },
      }),
    ).toBe(true);
  });

  it('rejects non-objects and unknown action types', () => {
    expect(isValidAction(null)).toBe(false);
    expect(isValidAction(undefined)).toBe(false);
    expect(isValidAction('ATTACK')).toBe(false);
    expect(isValidAction(42)).toBe(false);
    expect(isValidAction([])).toBe(false);
    expect(isValidAction({ type: 'DESTROY_UNIVERSE', player: 'p1' })).toBe(false);
  });

  it('rejects an unknown or missing player id', () => {
    expect(isValidAction({ type: 'END_TURN', player: 'p3' })).toBe(false);
    expect(isValidAction({ type: 'END_TURN' })).toBe(false);
    expect(isValidAction({ type: 'END_TURN', player: null })).toBe(false);
  });

  it('rejects type-confused or out-of-shape slot refs', () => {
    expect(isValidAction({ type: 'ACTIVATE', player: 'p1', unit: { lane: 'vanguard', slot: '0' } })).toBe(false);
    expect(isValidAction({ type: 'ACTIVATE', player: 'p1', unit: { lane: 'vanguard', slot: -1 } })).toBe(false);
    expect(isValidAction({ type: 'ACTIVATE', player: 'p1', unit: { lane: 'vanguard', slot: 1.5 } })).toBe(false);
    expect(isValidAction({ type: 'ACTIVATE', player: 'p1', unit: { lane: 'nowhere', slot: 0 } })).toBe(false);
    expect(isValidAction({ type: 'ACTIVATE', player: 'p1', unit: null })).toBe(false);
    expect(isValidAction({ type: 'ACTIVATE', player: 'p1' })).toBe(false);
  });

  it('rejects a malformed ATTACK target or useDice flag', () => {
    const attacker = { lane: 'vanguard', slot: 0 };
    expect(
      isValidAction({ type: 'ATTACK', player: 'p1', attacker, target: { kind: 'nexus' }, useDice: false }),
    ).toBe(false);
    expect(
      isValidAction({
        type: 'ATTACK',
        player: 'p1',
        attacker,
        target: { kind: 'unit', player: 'p2', lane: 'sanctum' },
        useDice: false,
      }),
    ).toBe(false);
    expect(
      isValidAction({ type: 'ATTACK', player: 'p1', attacker, target: { kind: 'planet', player: 'p2' }, useDice: false }),
    ).toBe(false);
    expect(
      isValidAction({ type: 'ATTACK', player: 'p1', attacker, target: { kind: 'nexus', player: 'p2' }, useDice: 'yes' }),
    ).toBe(false);
  });

  it('allows PLAY_CARD with only handIndex (spell target or lane/slot filled in later checks)', () => {
    expect(isValidAction({ type: 'PLAY_CARD', player: 'p1', handIndex: 0 })).toBe(true);
  });

  it('rejects PLAY_CARD with a non-integer handIndex', () => {
    expect(isValidAction({ type: 'PLAY_CARD', player: 'p1', handIndex: 'first' })).toBe(false);
    expect(isValidAction({ type: 'PLAY_CARD', player: 'p1' })).toBe(false);
  });
});
