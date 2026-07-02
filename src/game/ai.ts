/**
 * Duch Arény — a simple deterministic opponent for single player.
 * Pure function over GameState, so it is testable and could later run
 * server-side too. Policy: develop the board, then attack with every
 * ready unit (vanguard targets first, dice riders whenever affordable),
 * use activated abilities on damaged units, and pass.
 */
import { getCard, getUnitCard } from './cards';
import { opponentOf } from './engine';
import type { Action, GameState, PlayerId } from './types';

export function chooseAiAction(state: GameState, seat: PlayerId): Action {
  const me = state.players[seat];
  const foe = state.players[opponentOf(seat)];

  if (state.phase === 'main') {
    // Summon the first affordable unit that has a free slot in its lane.
    for (let i = 0; i < me.hand.length; i++) {
      const card = getCard(me.hand[i]);
      if (card.type !== 'unit' || card.cost > me.mana) continue;
      const slot = me.lanes[card.lane].findIndex((u) => u === null);
      if (slot === -1) continue;
      return { type: 'PLAY_CARD', player: seat, handIndex: i, lane: card.lane, slot };
    }
    return { type: 'ENTER_COMBAT', player: seat };
  }

  // Combat: strike with the first ready unit. The wall rule decides targets.
  const foeVanguardSlot = foe.lanes.vanguard.findIndex((u) => u !== null);
  for (const lane of ['vanguard', 'sanctum'] as const) {
    for (let slot = 0; slot < me.lanes[lane].length; slot++) {
      const unit = me.lanes[lane][slot];
      if (!unit || !unit.ready) continue;
      const card = getUnitCard(unit.cardId);

      // Wounded defenders shore themselves up instead of trading.
      if (card.dice?.activation && unit.hp < unit.maxHp && me.mana >= card.dice.manaCost) {
        return { type: 'ACTIVATE', player: seat, unit: { lane, slot } };
      }

      const target =
        foeVanguardSlot >= 0
          ? ({ kind: 'unit', player: foe.id, lane: 'vanguard', slot: foeVanguardSlot } as const)
          : ({ kind: 'nexus', player: foe.id } as const);
      const useDice = !!card.dice && !card.dice.activation && me.mana >= card.dice.manaCost;
      return { type: 'ATTACK', player: seat, attacker: { lane, slot }, target, useDice };
    }
  }
  return { type: 'END_TURN', player: seat };
}
