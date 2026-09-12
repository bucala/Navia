/**
 * Duch Arény — a simple deterministic opponent for single player.
 * Pure function over GameState, so it is testable and could later run
 * server-side too. Policy: develop the board, then attack with every
 * ready unit (vanguard targets first, dice riders whenever affordable),
 * use activated abilities on damaged units, and pass.
 */
import { getCard, getUnitCard } from './cards';
import { effectiveThreshold, opponentOf } from './engine';
import type { Action, GameState, PlayerId, SlotRef, UnitState } from './types';

function effectiveHealth(unit: UnitState): number {
  return unit.hp + unit.armor;
}

function occupiedSlots(state: GameState, seat: PlayerId): { ref: SlotRef; unit: UnitState }[] {
  const player = state.players[seat];
  return (['vanguard', 'sanctum'] as const).flatMap((lane) =>
    player.lanes[lane].flatMap((unit, slot) =>
      unit ? [{ ref: { lane, slot }, unit }] : [],
    ),
  );
}

export function chooseAiAction(state: GameState, seat: PlayerId): Action {
  const me = state.players[seat];
  const foe = state.players[opponentOf(seat)];

  if (state.phase === 'main') {
    const enemyUnits = occupiedSlots(state, foe.id).sort(
      (a, b) => effectiveHealth(a.unit) - effectiveHealth(b.unit),
    );
    const spellIndex = me.hand.findIndex((cardId) => {
      const card = getCard(cardId);
      return card.type === 'spell' && card.cost <= me.mana;
    });
    if (spellIndex >= 0 && enemyUnits.length > 0) {
      const target = enemyUnits[0].ref;
      return {
        type: 'PLAY_CARD',
        player: seat,
        handIndex: spellIndex,
        target: { kind: 'unit', player: foe.id, ...target },
      };
    }

    // Develop the strongest affordable body, rather than depending on deck order.
    const candidates = me.hand
      .map((cardId, handIndex) => ({ card: getCard(cardId), handIndex }))
      .filter(({ card }) => card.type === 'unit' && card.cost <= me.mana)
      .sort((a, b) => b.card.cost - a.card.cost);
    for (const { card, handIndex } of candidates) {
      if (card.type !== 'unit') continue;
      const slot = me.lanes[card.lane].findIndex((unit) => unit === null);
      if (slot >= 0) {
        return { type: 'PLAY_CARD', player: seat, handIndex, lane: card.lane, slot };
      }
    }
    return { type: 'ENTER_COMBAT', player: seat };
  }

  const ready = occupiedSlots(state, seat)
    .filter(({ unit }) => unit.ready)
    .sort((a, b) => getUnitCard(b.unit.cardId).attack - getUnitCard(a.unit.cardId).attack);

  // Use activations only when their board effect has useful targets.
  for (const { ref, unit } of ready) {
    const card = getUnitCard(unit.cardId);
    if (!card.dice?.activation || me.mana < card.dice.manaCost) continue;
    const effect = card.dice.effect;
    const useful =
      (effect.kind === 'fortify' && unit.hp < unit.maxHp) ||
      (effect.kind === 'blessVanguard' &&
        me.lanes.vanguard.some((ally) => ally && ally.hp < ally.maxHp)) ||
      (effect.kind === 'stormcall' && occupiedSlots(state, foe.id).length >= 2);
    if (useful) return { type: 'ACTIVATE', player: seat, unit: ref };
  }

  const foeVanguard = foe.lanes.vanguard
    .map((unit, slot) => ({ unit, slot }))
    .filter((entry): entry is { unit: UnitState; slot: number } => entry.unit !== null)
    .sort((a, b) => effectiveHealth(a.unit) - effectiveHealth(b.unit));
  for (const { ref, unit } of ready) {
    const card = getUnitCard(unit.cardId);
    const target =
      foeVanguard.length > 0
        ? ({ kind: 'unit', player: foe.id, lane: 'vanguard', slot: foeVanguard[0].slot } as const)
        : ({ kind: 'nexus', player: foe.id } as const);
    const threshold = effectiveThreshold(unit);
    const useDice =
      !!card.dice &&
      !card.dice.activation &&
      me.mana >= card.dice.manaCost &&
      // Spend mana on reliable riders, or when berserk bonus can secure lethal.
      (threshold <= 4 ||
        (target.kind === 'nexus' &&
          card.dice.effect.kind === 'berserk' &&
          card.attack + card.dice.effect.bonusDamage >= foe.nexusHp));
    return { type: 'ATTACK', player: seat, attacker: ref, target, useDice };
  }
  return { type: 'END_TURN', player: seat };
}
