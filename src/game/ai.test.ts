import { describe, expect, it } from 'vitest';
import { chooseAiAction } from './ai';
import { getUnitCard } from './cards';
import { applyAction, createGame } from './engine';

describe('chooseAiAction', () => {
  it('develops the strongest affordable unit instead of relying on hand order', () => {
    const g = createGame(() => 0);
    g.active = 'p1';
    g.players.p1.hand = ['kamenny_strazca', 'mahisa'];
    g.players.p1.mana = 5;

    expect(chooseAiAction(g, 'p1')).toMatchObject({
      type: 'PLAY_CARD',
      handIndex: 1,
      lane: 'vanguard',
    });
  });

  it('casts a spell at the weakest enemy unit when it is affordable', () => {
    const g = createGame(() => 0);
    const target = getUnitCard('lavovy_skriatok');
    g.active = 'p1';
    g.players.p1.hand = ['pekelne_zaklinadlo'];
    g.players.p1.mana = 3;
    g.players.p2.lanes.vanguard[2] = {
      uid: g.nextUid++,
      cardId: target.id,
      hp: target.maxHp,
      maxHp: target.maxHp,
      armor: target.armor,
      burn: 0,
      ready: true,
      movedThisTurn: false,
    };

    expect(chooseAiAction(g, 'p1')).toMatchObject({
      type: 'PLAY_CARD',
      handIndex: 0,
      target: { kind: 'unit', player: 'p2', lane: 'vanguard', slot: 2 },
    });
  });

  it('always returns legal actions — AI vs AI runs to a winner', () => {
    // Deterministic-enough smoke test: every chosen action must apply
    // without throwing, and the match must actually end.
    for (let run = 0; run < 3; run++) {
      let g = createGame(Math.random, ['AI 1', 'AI 2']);
      let steps = 0;
      while (!g.winner && steps < 1000) {
        g = applyAction(g, chooseAiAction(g, g.active), Math.random);
        steps++;
      }
      expect(g.winner).not.toBeNull();
    }
  });
});
