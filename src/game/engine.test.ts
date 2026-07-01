import { describe, expect, it } from 'vitest';
import { applyAction, createGame, crossNeighbors, effectiveThreshold } from './engine';
import { getUnitCard } from './cards';
import { d6seq } from './dice.test';
import type { GameState, LaneId, PlayerId, UnitState } from './types';

function newGame(): GameState {
  return createGame(Math.random);
}

/** Test helper: put a unit straight onto the board, ready to act. */
function place(
  state: GameState,
  player: PlayerId,
  lane: LaneId,
  slot: number,
  cardId: string,
  overrides: Partial<UnitState> = {},
): UnitState {
  const card = getUnitCard(cardId);
  const unit: UnitState = {
    uid: state.nextUid++,
    cardId,
    hp: card.maxHp,
    maxHp: card.maxHp,
    armor: card.armor,
    burn: 0,
    ready: true,
    movedThisTurn: false,
    ...overrides,
  };
  state.players[player].lanes[lane][slot] = unit;
  return unit;
}

function inCombat(state: GameState): GameState {
  return applyAction(state, { type: 'ENTER_COMBAT', player: state.active }, Math.random);
}

describe('game setup and turn flow', () => {
  it('starts with 30 HP nexuses and mana 1 for the first player', () => {
    const g = newGame();
    expect(g.players.p1.nexusHp).toBe(30);
    expect(g.players.p2.nexusHp).toBe(30);
    expect(g.players.p1.maxMana).toBe(1);
    expect(g.players.p1.hand).toHaveLength(5); // 4 starting + 1 drawn
    expect(g.players.p2.hand).toHaveLength(4);
  });

  it('ramps mana by 1 per turn up to the cap and refills it', () => {
    let g = newGame();
    g = applyAction(g, { type: 'END_TURN', player: 'p1' }, Math.random);
    expect(g.active).toBe('p2');
    expect(g.players.p2.maxMana).toBe(1);
    g = applyAction(g, { type: 'END_TURN', player: 'p2' }, Math.random);
    expect(g.players.p1.maxMana).toBe(2);
    expect(g.players.p1.mana).toBe(2);
  });

  it('rejects actions from the player not on turn', () => {
    const g = newGame();
    expect(() => applyAction(g, { type: 'END_TURN', player: 'p2' }, Math.random)).toThrow();
  });
});

describe('playing cards', () => {
  it('summons a unit into its lane, paying mana, with summoning sickness', () => {
    const g = newGame();
    g.players.p1.hand = ['kamenny_strazca'];
    g.players.p1.mana = 3;
    const next = applyAction(
      g,
      { type: 'PLAY_CARD', player: 'p1', handIndex: 0, lane: 'vanguard', slot: 1 },
      Math.random,
    );
    const unit = next.players.p1.lanes.vanguard[1];
    expect(unit?.cardId).toBe('kamenny_strazca');
    expect(unit?.ready).toBe(false);
    expect(next.players.p1.mana).toBe(1);
    expect(next.players.p1.hand).toHaveLength(0);
  });

  it('rejects the wrong lane and insufficient mana', () => {
    const g = newGame();
    g.players.p1.hand = ['papagaj', 'kamenny_strazca'];
    g.players.p1.mana = 10;
    expect(() =>
      applyAction(g, { type: 'PLAY_CARD', player: 'p1', handIndex: 0, lane: 'vanguard', slot: 0 }, Math.random),
    ).toThrow(/Sanctum/);
    g.players.p1.mana = 1;
    expect(() =>
      applyAction(g, { type: 'PLAY_CARD', player: 'p1', handIndex: 1, lane: 'vanguard', slot: 0 }, Math.random),
    ).toThrow(/many/);
  });
});

describe('combat and the vanguard wall', () => {
  it('blocks attacks on sanctum and nexus while the vanguard stands', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'kamenny_strazca');
    place(g, 'p2', 'vanguard', 0, 'kamenny_strazca');
    place(g, 'p2', 'sanctum', 0, 'nebesky_vrabec');
    g = inCombat(g);
    expect(() =>
      applyAction(
        g,
        { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'nexus', player: 'p2' }, useDice: false },
        Math.random,
      ),
    ).toThrow(/Predný voj/);
    expect(() =>
      applyAction(
        g,
        { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'unit', player: 'p2', lane: 'sanctum', slot: 0 }, useDice: false },
        Math.random,
      ),
    ).toThrow(/Predný voj/);
  });

  it('armor absorbs damage before HP', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'gorila'); // attack 2
    const defender = place(g, 'p2', 'vanguard', 0, 'kamenny_strazca', { armor: 1 });
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 0 }, useDice: false },
      Math.random,
    );
    const hit = g.players.p2.lanes.vanguard[0];
    expect(hit?.armor).toBe(0);
    expect(hit?.hp).toBe(defender.maxHp - 1);
  });

  it('reduces the nexus and declares a winner when it falls', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'megadrak'); // attack 3
    g.players.p2.nexusHp = 3;
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'nexus', player: 'p2' }, useDice: false },
      Math.random,
    );
    expect(g.players.p2.nexusHp).toBe(0);
    expect(g.winner).toBe('p1');
    expect(() => applyAction(g, { type: 'END_TURN', player: 'p1' }, Math.random)).toThrow(/skončil/);
  });
});

describe('keyword mechanics', () => {
  it('lavaTouch sets targets on fire and burn ticks at the owner’s turn start', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'lavovy_skriatok'); // attack 1, lavaTouch
    place(g, 'p2', 'vanguard', 0, 'gorila', { armor: 0 });
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 0 }, useDice: false },
      Math.random,
    );
    const burned = g.players.p2.lanes.vanguard[0]!;
    expect(burned.burn).toBe(1);
    const hpAfterAttack = burned.hp;
    g = applyAction(g, { type: 'END_TURN', player: 'p1' }, Math.random);
    expect(g.players.p2.lanes.vanguard[0]!.hp).toBe(hpAfterAttack - 1);
  });

  it('acidTouch shreds armor first, then HP', () => {
    let g = newGame();
    place(g, 'p1', 'sanctum', 0, 'papagaj'); // attack 2, acidTouch
    place(g, 'p2', 'vanguard', 0, 'kamenny_strazca', { armor: 3 });
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'ATTACK', player: 'p1', attacker: { lane: 'sanctum', slot: 0 }, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 0 }, useDice: false },
      Math.random,
    );
    // 2 attack fully absorbed by armor (3 → 1), then 1 acid stack strips the last point.
    const hit = g.players.p2.lanes.vanguard[0]!;
    expect(hit.armor).toBe(0);
    expect(hit.hp).toBe(hit.maxHp);
  });

  it('pestControl exterminates tokens through their shields', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'megadrak');
    place(g, 'p2', 'vanguard', 0, 'lavovy_skriatok', { armor: 5 });
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 0 }, useDice: false },
      Math.random,
    );
    expect(g.players.p2.lanes.vanguard[0]).toBeNull();
  });

  it('berserker dice requirement drops with missing HP, floored at 2+', () => {
    const g = newGame();
    const fresh = place(g, 'p1', 'vanguard', 0, 'bojovy_kohut');
    expect(effectiveThreshold(fresh)).toBe(5);
    const wounded = place(g, 'p1', 'vanguard', 1, 'bojovy_kohut', { hp: 1 });
    expect(effectiveThreshold(wounded)).toBe(2);
  });

  it('agile units can hop lanes once per turn during combat', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'opici_kral');
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'MOVE_UNIT', player: 'p1', from: { lane: 'vanguard', slot: 0 }, to: { lane: 'sanctum', slot: 2 } },
      Math.random,
    );
    expect(g.players.p1.lanes.vanguard[0]).toBeNull();
    expect(g.players.p1.lanes.sanctum[2]?.cardId).toBe('opici_kral');
    expect(() =>
      applyAction(
        g,
        { type: 'MOVE_UNIT', player: 'p1', from: { lane: 'sanctum', slot: 2 }, to: { lane: 'vanguard', slot: 0 } },
        Math.random,
      ),
    ).toThrow(/už presunula/);
  });
});

describe('dice-boosted attacks', () => {
  it('Megadrak AoE (3+) hits the target and its cross neighbours', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'megadrak'); // attack 3
    place(g, 'p2', 'vanguard', 1, 'gorila', { armor: 0 }); // primary, 6 HP
    place(g, 'p2', 'vanguard', 0, 'kamenny_strazca', { armor: 0 }); // left neighbour, 4 HP
    place(g, 'p2', 'sanctum', 1, 'nebesky_vrabec'); // aligned back-line slot, 2 HP
    g.players.p1.mana = 5;
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 1 }, useDice: true },
      d6seq(4), // success vs 3+
    );
    expect(g.players.p1.mana).toBe(3); // paid the 2-mana dice cost
    expect(g.players.p2.lanes.vanguard[1]!.hp).toBe(2); // 6 - 3, then 1 acid bleed
    expect(g.players.p2.lanes.vanguard[0]).toBeNull(); // 4 - 3, acid finishes it
    expect(g.players.p2.lanes.sanctum[1]).toBeNull(); // 2 HP sparrow dies
    expect(g.players.p2.lanes.vanguard[1]!.burn).toBe(1); // Láva ∞ sticks to survivors
  });

  it('a failed dice roll still lands the basic attack', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'megadrak');
    place(g, 'p2', 'vanguard', 1, 'gorila', { armor: 0 });
    place(g, 'p2', 'vanguard', 0, 'kamenny_strazca', { armor: 0 });
    g.players.p1.mana = 5;
    g = inCombat(g);
    g = applyAction(
      g,
      { type: 'ATTACK', player: 'p1', attacker: { lane: 'vanguard', slot: 0 }, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 1 }, useDice: true },
      d6seq(2), // fails vs 3+
    );
    expect(g.players.p2.lanes.vanguard[1]!.hp).toBe(2); // basic damage + acid bleed applied
    expect(g.players.p2.lanes.vanguard[0]!.hp).toBe(4); // no AoE splash
  });

  it('Gorila fortifies with advantage (2d6, keep better)', () => {
    let g = newGame();
    place(g, 'p1', 'vanguard', 0, 'gorila', { hp: 2, armor: 0 });
    g.players.p1.mana = 3;
    g = applyAction(
      g,
      { type: 'ACTIVATE', player: 'p1', unit: { lane: 'vanguard', slot: 0 } },
      d6seq(2, 6), // low die fails, advantage keeps the 6
    );
    const gorila = g.players.p1.lanes.vanguard[0]!;
    expect(gorila.hp).toBe(5); // +3 heal
    expect(gorila.armor).toBe(3);
    const dice = g.log.filter((e) => e.kind === 'dice').at(-1)!;
    expect(dice.kind === 'dice' && dice.rolls).toEqual([2, 6]);
  });
});

describe('Pekelné zaklínadlo (push-your-luck spell)', () => {
  it('deals chain damage, heals the caster, and overloads on a 6', () => {
    let g = newGame();
    place(g, 'p2', 'vanguard', 0, 'gorila', { armor: 0 }); // 6 HP target
    g.players.p1.hand = ['pekelne_zaklinadlo'];
    g.players.p1.mana = 3;
    g.players.p1.nexusHp = 20;
    g = applyAction(
      g,
      { type: 'PLAY_CARD', player: 'p1', handIndex: 0, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 0 } },
      d6seq(3, 5, 6), // 2 successes, then overload
    );
    expect(g.players.p2.lanes.vanguard[0]!.hp).toBe(2); // 6 - 2×2
    // +2 healed from successes, −3 overload backlash.
    expect(g.players.p1.nexusHp).toBe(19);
  });

  it('redirects remaining chain damage to the enemy nexus once the target dies', () => {
    let g = newGame();
    place(g, 'p2', 'vanguard', 0, 'lavovy_skriatok'); // 1 HP
    g.players.p1.hand = ['pekelne_zaklinadlo'];
    g.players.p1.mana = 3;
    g = applyAction(
      g,
      { type: 'PLAY_CARD', player: 'p1', handIndex: 0, target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 0 } },
      d6seq(4, 4, 1), // two successes, then a safe stop
    );
    expect(g.players.p2.lanes.vanguard[0]).toBeNull();
    expect(g.players.p2.nexusHp).toBe(28); // second success spills onto the nexus
  });
});

describe('crossNeighbors', () => {
  it('returns left, right and the aligned slot in the other lane', () => {
    expect(crossNeighbors({ lane: 'vanguard', slot: 1 })).toEqual([
      { lane: 'vanguard', slot: 0 },
      { lane: 'vanguard', slot: 2 },
      { lane: 'sanctum', slot: 1 },
    ]);
    expect(crossNeighbors({ lane: 'sanctum', slot: 0 })).toEqual([
      { lane: 'sanctum', slot: 1 },
      { lane: 'vanguard', slot: 0 },
    ]);
  });
});
