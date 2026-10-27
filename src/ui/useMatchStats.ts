/**
 * Tallies per-player match statistics for the end screen from state
 * transitions — Nexus damage dealt, units summoned and destroyed, spells
 * cast. Diffing states (like useCombatFx) instead of re-reading the log
 * keeps the counts right online, where the server trims old log entries.
 */
import { useEffect, useRef, useState } from 'react';
import { opponentOf } from '../game/engine';
import type { GameViewState, PlayerId } from '../game/types';

export interface PlayerStats {
  nexusDamage: number;
  summons: number;
  kills: number;
  spells: number;
}

export type MatchStats = Record<PlayerId, PlayerStats>;

export const emptyStats = (): MatchStats => ({
  p1: { nexusDamage: 0, summons: 0, kills: 0, spells: 0 },
  p2: { nexusDamage: 0, summons: 0, kills: 0, spells: 0 },
});

function unitOwners(state: GameViewState): Map<number, PlayerId> {
  const owners = new Map<number, PlayerId>();
  for (const player of Object.values(state.players)) {
    for (const lane of ['vanguard', 'sanctum'] as const) {
      for (const unit of player.lanes[lane]) if (unit) owners.set(unit.uid, player.id);
    }
  }
  return owners;
}

/** What happened between two consecutive states, per player. */
export function statsDelta(prev: GameViewState, state: GameViewState): MatchStats {
  const delta = emptyStats();
  const idByName = (name: unknown): PlayerId | null =>
    (['p1', 'p2'] as const).find((id) => state.players[id].name === name) ?? null;

  // Fatigue hurts your own Nexus — don't credit it to the opponent.
  const fatigue: Record<PlayerId, number> = { p1: 0, p2: 0 };
  const lastSeen = prev.log.length ? prev.log[prev.log.length - 1].id : 0;
  for (const event of state.log) {
    if (event.id <= lastSeen || event.kind !== 'msg') continue;
    if (event.msgKey === 'spellCast') delta[idByName(event.params.player) ?? state.active].spells++;
    if (event.msgKey === 'fatigue') {
      const id = idByName(event.params.player);
      if (id) fatigue[id] += Number(event.params.n) || 0;
    }
  }

  for (const id of ['p1', 'p2'] as const) {
    const lost = prev.players[id].nexusHp - state.players[id].nexusHp - fatigue[id];
    if (lost > 0) delta[opponentOf(id)].nexusDamage += lost;
  }

  const before = unitOwners(prev);
  const after = unitOwners(state);
  for (const [uid, owner] of after) if (!before.has(uid)) delta[owner].summons++;
  for (const [uid, owner] of before) if (!after.has(uid)) delta[opponentOf(owner)].kills++;
  return delta;
}

function add(a: MatchStats, b: MatchStats): MatchStats {
  const sum = emptyStats();
  for (const id of ['p1', 'p2'] as const) {
    for (const key of Object.keys(sum[id]) as (keyof PlayerStats)[]) sum[id][key] = a[id][key] + b[id][key];
  }
  return sum;
}

export function useMatchStats(state: GameViewState | null): MatchStats {
  const [stats, setStats] = useState<MatchStats>(emptyStats);
  const prevRef = useRef<GameViewState | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = state;
    if (!state || prev === state) return;
    // A fresh game or rematch starts the tally over.
    if (!prev || state.turn < prev.turn || (prev.winner && !state.winner)) {
      setStats(emptyStats());
      return;
    }
    const delta = statsDelta(prev, state);
    if ((['p1', 'p2'] as const).some((id) => Object.values(delta[id]).some((n) => n > 0))) {
      setStats((current) => add(current, delta));
    }
  }, [state]);

  return stats;
}
