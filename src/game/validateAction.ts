/**
 * Runtime shape validation for client-supplied actions (GDD §5.3).
 *
 * `Action` is only a compile-time guarantee. A WebSocket message can carry
 * anything JSON-shaped, so the server must not blindly cast raw input to
 * this type before handing it to the engine. This validator rejects
 * malformed actions at the protocol boundary — it only checks *shape*
 * (right fields, right primitive types), never game-rule legality, which
 * stays the engine's job (`applyAction` still validates whose turn it is,
 * mana, wall rules, etc.).
 */
import type { Action, LaneId, PlayerId, SlotRef, TargetRef } from './types';

function isPlayerId(v: unknown): v is PlayerId {
  return v === 'p1' || v === 'p2';
}

function isLaneId(v: unknown): v is LaneId {
  return v === 'vanguard' || v === 'sanctum';
}

/** Non-negative integer — slot indices are never negative or fractional. */
function isSlotIndex(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0;
}

function isSlotRef(v: unknown): v is SlotRef {
  if (typeof v !== 'object' || v === null) return false;
  const ref = v as Record<string, unknown>;
  return isLaneId(ref.lane) && isSlotIndex(ref.slot);
}

function isTargetRef(v: unknown): v is TargetRef {
  if (typeof v !== 'object' || v === null) return false;
  const t = v as Record<string, unknown>;
  if (t.kind === 'nexus') return isPlayerId(t.player);
  if (t.kind === 'unit') return isPlayerId(t.player) && isLaneId(t.lane) && isSlotIndex(t.slot);
  return false;
}

/**
 * Rejects anything that isn't a well-shaped `Action`. Exact slot bounds
 * (e.g. slot < VANGUARD_SLOTS) depend on live game state and are enforced
 * by the engine itself — this only guards against type-confused JSON.
 */
export function isValidAction(v: unknown): v is Action {
  if (typeof v !== 'object' || v === null) return false;
  const a = v as Record<string, unknown>;
  if (!isPlayerId(a.player)) return false;

  switch (a.type) {
    case 'PLAY_CARD':
      return (
        isSlotIndex(a.handIndex) &&
        (a.lane === undefined || isLaneId(a.lane)) &&
        (a.slot === undefined || isSlotIndex(a.slot)) &&
        (a.target === undefined || isTargetRef(a.target))
      );
    case 'ENTER_COMBAT':
    case 'END_TURN':
      return true;
    case 'ATTACK':
      return isSlotRef(a.attacker) && isTargetRef(a.target) && typeof a.useDice === 'boolean';
    case 'ACTIVATE':
      return isSlotRef(a.unit);
    case 'MOVE_UNIT':
      return isSlotRef(a.from) && isSlotRef(a.to);
    default:
      return false;
  }
}
