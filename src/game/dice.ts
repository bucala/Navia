/**
 * The Dice Engine (D6) — GDD §2.3.
 *
 * All randomness flows through an injected Rng so tests are deterministic
 * and so the Durable Object can own the RNG in Fáza 2.
 */
import type { Rng } from './types';

export function rollD6(rng: Rng): number {
  return Math.floor(rng() * 6) + 1;
}

export interface DiceRoll {
  /** Every die rolled (2 entries with advantage). */
  rolls: number[];
  /** The result that counts. */
  kept: number;
  success: boolean;
}

/** Roll against a threshold ("3+"), optionally with advantage (2d6, keep better). */
export function rollCheck(rng: Rng, threshold: number, advantage: boolean): DiceRoll {
  const rolls = advantage ? [rollD6(rng), rollD6(rng)] : [rollD6(rng)];
  const kept = Math.max(...rolls);
  return { rolls, kept, success: kept >= threshold };
}

export type ChainOutcome = 'stopped' | 'overload';

export interface ChainResult {
  rolls: number[];
  /** Number of successful rolls (3, 4 or 5). */
  successes: number;
  /** 'stopped' = chain ended safely on 1/2; 'overload' = ended on 6. */
  outcome: ChainOutcome;
}

/**
 * Push-your-luck chain (Pekelné zaklínadlo): roll repeatedly —
 * 3/4/5 counts as a success and the chain continues, 1/2 ends it
 * safely, 6 ends it with an Overload backlash.
 */
export function rollChain(rng: Rng, maxRolls = 20): ChainResult {
  const rolls: number[] = [];
  let successes = 0;
  while (rolls.length < maxRolls) {
    const roll = rollD6(rng);
    rolls.push(roll);
    if (roll === 6) return { rolls, successes, outcome: 'overload' };
    if (roll <= 2) return { rolls, successes, outcome: 'stopped' };
    successes++;
  }
  return { rolls, successes, outcome: 'stopped' };
}
