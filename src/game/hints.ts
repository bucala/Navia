import { getCard } from './cards';
import { opponentOf } from './engine';
import type { GameViewState, PlayerId } from './types';

/**
 * The button worth pointing at once the current phase has nothing left to
 * do: 'combat' when no card can be played but units could attack, 'end'
 * when nothing at all is left, null while there are still moves. A ready
 * unit always has a target — the foe's Vanguard if it stands, otherwise the
 * open Nexus.
 */
export function nextStepHint(state: GameViewState, seat: PlayerId): 'combat' | 'end' | null {
  if (state.winner || state.active !== seat) return null;
  const me = state.players[seat];
  const foe = state.players[opponentOf(seat)];
  const foeHasUnits = foe.lanes.vanguard.some(Boolean) || foe.lanes.sanctum.some(Boolean);
  const canPlay = me.hand.some((cardId) => {
    const card = getCard(cardId);
    if (card.cost > me.mana) return false;
    return card.type === 'unit' ? me.lanes[card.lane].some((u) => !u) : foeHasUnits;
  });
  const canAttack = me.lanes.vanguard.some((u) => u?.ready) || me.lanes.sanctum.some((u) => u?.ready);
  if (state.phase === 'main') return canPlay ? null : canAttack ? 'combat' : 'end';
  return canAttack ? null : 'end';
}
