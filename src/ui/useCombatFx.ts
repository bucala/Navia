/**
 * Derives transient combat animations from state transitions, so both
 * local and server-driven updates animate identically on both clients:
 * attacker lunges (from the engine's structured attack events), hit
 * flashes and floating damage/heal popups (from HP diffs by unit uid).
 */
import { useEffect, useRef, useState } from 'react';
import type { GameViewState, LaneId, PlayerId } from '../game/types';
import { sfxHit } from './sfx';
import { triggerAttackFeedback } from '../utils/haptics';

export interface Popup {
  amount: number;
  kind: 'damage' | 'heal';
}

export interface SlotFx {
  lunge?: boolean;
  hit?: boolean;
  popup?: Popup;
}

/** Key: `${playerId}:${lane}:${slot}` */
export type FxMap = Record<string, SlotFx>;

export function slotFxKey(player: PlayerId, lane: LaneId, slot: number): string {
  return `${player}:${lane}:${slot}`;
}

interface UnitSnapshot {
  hp: number;
  player: PlayerId;
  lane: LaneId;
  slot: number;
}

function snapshotUnits(state: GameViewState): Map<number, UnitSnapshot> {
  const units = new Map<number, UnitSnapshot>();
  for (const player of Object.values(state.players)) {
    for (const lane of ['vanguard', 'sanctum'] as const) {
      player.lanes[lane].forEach((unit, slot) => {
        if (unit) units.set(unit.uid, { hp: unit.hp, player: player.id, lane, slot });
      });
    }
  }
  return units;
}

export function useCombatFx(state: GameViewState | null) {
  const [fx, setFx] = useState<FxMap>({});
  const [nexusFx, setNexusFx] = useState<Partial<Record<PlayerId, Popup>>>({});
  const prevRef = useRef<GameViewState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = state;
    if (!state || !prev || prev === state) return;
    // A rematch resets turn/log ids and unit uids — diffing against the
    // finished game would spawn false damage and Nexus-heal popups.
    if (state.turn < prev.turn || (prev.winner && !state.winner)) return;

    const nextFx: FxMap = {};
    const nextNexusFx: Partial<Record<PlayerId, Popup>> = {};

    // Attacker lunge + target flash from the engine's attack events.
    const lastSeen = prev.log.length ? prev.log[prev.log.length - 1].id : 0;
    for (const event of state.log) {
      if (event.id <= lastSeen || event.kind !== 'attack') continue;
      const attackerKey = slotFxKey(event.player, event.from.lane, event.from.slot);
      nextFx[attackerKey] = { ...nextFx[attackerKey], lunge: true };
      if (event.target.kind === 'unit') {
        const targetKey = slotFxKey(event.target.player, event.target.lane, event.target.slot);
        nextFx[targetKey] = { ...nextFx[targetKey], hit: true };
      }
    }

    // Damage / heal popups from HP diffs (uid-tracked, so agile moves don't confuse it).
    const before = snapshotUnits(prev);
    const after = snapshotUnits(state);
    let maxDamage = 0;
    for (const [uid, was] of before) {
      const now = after.get(uid);
      const delta = was.hp - (now?.hp ?? 0);
      if (delta === 0) continue;
      const at = now ?? was; // dead units pop over their last slot
      const key = slotFxKey(at.player, at.lane, at.slot);
      const kind = delta > 0 ? 'damage' : 'heal';
      if (kind === 'damage') maxDamage = Math.max(maxDamage, delta);
      nextFx[key] = { ...nextFx[key], hit: nextFx[key]?.hit || kind === 'damage', popup: { amount: Math.abs(delta), kind } };
    }

    for (const id of ['p1', 'p2'] as const) {
      const delta = prev.players[id].nexusHp - state.players[id].nexusHp;
      if (delta > 0) {
        nextNexusFx[id] = { amount: delta, kind: 'damage' };
        maxDamage = Math.max(maxDamage, delta);
      } else if (delta < 0) {
        nextNexusFx[id] = { amount: -delta, kind: 'heal' };
      }
    }

    if (Object.keys(nextFx).length === 0 && Object.keys(nextNexusFx).length === 0) return;
    if (maxDamage > 0) {
      sfxHit();
      void triggerAttackFeedback(maxDamage);
    }
    setFx(nextFx);
    setNexusFx(nextNexusFx);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setFx({});
      setNexusFx({});
    }, 950);
  }, [state]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return { fx, nexusFx };
}
