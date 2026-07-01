import { describe, expect, it } from 'vitest';
import { rollChain, rollCheck, rollD6 } from './dice';
import type { Rng } from './types';

/** Rng producing an exact sequence of D6 faces (repeats the last one). */
export function d6seq(...faces: number[]): Rng {
  let i = 0;
  return () => {
    const face = faces[Math.min(i, faces.length - 1)];
    i++;
    return (face - 1) / 6 + 0.001;
  };
}

describe('rollD6', () => {
  it('maps the rng range onto faces 1–6', () => {
    expect(rollD6(() => 0)).toBe(1);
    expect(rollD6(() => 0.999)).toBe(6);
    for (let face = 1; face <= 6; face++) {
      expect(rollD6(d6seq(face))).toBe(face);
    }
  });
});

describe('rollCheck', () => {
  it('succeeds when the roll meets the threshold', () => {
    expect(rollCheck(d6seq(3), 3, false)).toEqual({ rolls: [3], kept: 3, success: true });
    expect(rollCheck(d6seq(2), 3, false).success).toBe(false);
  });

  it('advantage rolls twice and keeps the better die', () => {
    const result = rollCheck(d6seq(2, 5), 5, true);
    expect(result.rolls).toEqual([2, 5]);
    expect(result.kept).toBe(5);
    expect(result.success).toBe(true);
  });
});

describe('rollChain (push-your-luck)', () => {
  it('keeps rolling on 3–5 and stops safely on 1–2', () => {
    const result = rollChain(d6seq(3, 5, 4, 2));
    expect(result.rolls).toEqual([3, 5, 4, 2]);
    expect(result.successes).toBe(3);
    expect(result.outcome).toBe('stopped');
  });

  it('ends with overload on a 6', () => {
    const result = rollChain(d6seq(3, 4, 6));
    expect(result.successes).toBe(2);
    expect(result.outcome).toBe('overload');
  });

  it('a first-roll 1 ends the chain with zero successes', () => {
    const result = rollChain(d6seq(1));
    expect(result.successes).toBe(0);
    expect(result.outcome).toBe('stopped');
  });

  it('is capped so a lucky streak cannot loop forever', () => {
    const result = rollChain(d6seq(4), 10);
    expect(result.rolls).toHaveLength(10);
    expect(result.outcome).toBe('stopped');
  });
});
