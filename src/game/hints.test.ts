import { describe, expect, it } from 'vitest';
import { getUnitCard } from './cards';
import { createGame, opponentOf } from './engine';
import { nextStepHint } from './hints';
import type { GameState, LaneId, PlayerId } from './types';

function place(state: GameState, player: PlayerId, lane: LaneId, slot: number, cardId: string, ready = true): void {
  const card = getUnitCard(cardId);
  state.players[player].lanes[lane][slot] = {
    uid: state.nextUid++,
    cardId,
    hp: card.maxHp,
    maxHp: card.maxHp,
    armor: card.armor,
    burn: 0,
    ready,
    movedThisTurn: false,
  };
}

/** A main-phase game where the active player holds exactly `hand` and has `mana`. */
function setup(hand: string[], mana: number): { state: GameState; seat: PlayerId } {
  const state = createGame(() => 0);
  const seat = state.active;
  state.players[seat].hand = hand;
  state.players[seat].mana = mana;
  return { state, seat };
}

describe('nextStepHint', () => {
  it('stays quiet while an affordable unit has a free slot', () => {
    const { state, seat } = setup(['salamandra'], 2);
    expect(nextStepHint(state, seat)).toBeNull();
  });

  it('points at End turn when nothing is affordable and no unit is ready', () => {
    const { state, seat } = setup(['megadrak'], 2);
    expect(nextStepHint(state, seat)).toBe('end');
  });

  it('points at Combat when no card can be played but a unit is ready', () => {
    const { state, seat } = setup(['megadrak'], 2);
    place(state, seat, 'vanguard', 0, 'salamandra');
    expect(nextStepHint(state, seat)).toBe('combat');
  });

  it('treats a full lane as unplayable for units of that lane', () => {
    const { state, seat } = setup(['salamandra'], 5);
    state.players[seat].lanes.vanguard.forEach((_, slot) => place(state, seat, 'vanguard', slot, 'kamenny_strazca', false));
    expect(nextStepHint(state, seat)).toBe('end');
  });

  it('needs an enemy unit before a spell counts as playable', () => {
    const { state, seat } = setup(['pekelne_zaklinadlo'], 3);
    expect(nextStepHint(state, seat)).toBe('end');
    place(state, opponentOf(seat), 'vanguard', 0, 'salamandra');
    expect(nextStepHint(state, seat)).toBeNull();
  });

  it('points at End turn in combat once no unit is ready', () => {
    const { state, seat } = setup([], 0);
    state.phase = 'combat';
    place(state, seat, 'vanguard', 0, 'salamandra', false);
    expect(nextStepHint(state, seat)).toBe('end');
    place(state, seat, 'vanguard', 1, 'salamandra');
    expect(nextStepHint(state, seat)).toBeNull();
  });

  it('never hints for the waiting player or a finished game', () => {
    const { state, seat } = setup([], 0);
    expect(nextStepHint(state, opponentOf(seat))).toBeNull();
    state.winner = seat;
    expect(nextStepHint(state, seat)).toBeNull();
  });
});
