/** ELO rating (GDD §5.2). K-factor 32, classic expected-score formula. */

export const ELO_START = 1000;
const K_FACTOR = 32;

/** Points the winner gains (and the loser loses). Always at least 1. */
export function eloDelta(winnerElo: number, loserElo: number): number {
  const expected = 1 / (1 + 10 ** ((loserElo - winnerElo) / 400));
  return Math.max(1, Math.round(K_FACTOR * (1 - expected)));
}
