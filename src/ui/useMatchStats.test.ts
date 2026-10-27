import { describe, expect, it } from 'vitest';
import { getUnitCard } from '../game/cards';
import { applyAction, createGame, logMsg } from '../game/engine';
import type { GameState } from '../game/types';
import { statsDelta } from './useMatchStats';

const clone = (state: GameState): GameState => structuredClone(state);

describe('statsDelta', () => {
  it('credits a summon to the owner of the new unit', () => {
    const prev = createGame(() => 0);
    const seat = prev.active;
    prev.players[seat].hand = ['salamandra'];
    prev.players[seat].mana = 2;
    const next = applyAction(prev, { type: 'PLAY_CARD', player: seat, handIndex: 0, lane: 'vanguard', slot: 0 }, () => 0);
    expect(statsDelta(prev, next)[seat].summons).toBe(1);
  });

  it('credits Nexus damage and kills to the opponent of whoever lost them', () => {
    const prev = createGame(() => 0);
    const card = getUnitCard('salamandra');
    prev.players.p2.lanes.vanguard[0] = {
      uid: prev.nextUid++, cardId: card.id, hp: 1, maxHp: card.maxHp, armor: 0, burn: 0, ready: true, movedThisTurn: false,
    };
    const next = clone(prev);
    next.players.p2.lanes.vanguard[0] = null;
    next.players.p2.nexusHp -= 4;
    const delta = statsDelta(prev, next);
    expect(delta.p1.kills).toBe(1);
    expect(delta.p1.nexusDamage).toBe(4);
    expect(delta.p2.nexusDamage).toBe(0);
  });

  it("doesn't count fatigue as damage dealt by the opponent", () => {
    const prev = createGame(() => 0);
    const next = clone(prev);
    next.players.p1.nexusHp -= 2;
    logMsg(next, 'fatigue', { player: next.players.p1.name, n: 2 });
    expect(statsDelta(prev, next).p2.nexusDamage).toBe(0);
  });

  it('counts spells cast since the previous state only', () => {
    const prev = createGame(() => 0);
    logMsg(prev, 'spellCast', { player: prev.players.p1.name, card: 'pekelne_zaklinadlo' });
    const next = clone(prev);
    logMsg(next, 'spellCast', { player: next.players.p2.name, card: 'pekelne_zaklinadlo' });
    const delta = statsDelta(prev, next);
    expect(delta.p1.spells).toBe(0);
    expect(delta.p2.spells).toBe(1);
  });
});
