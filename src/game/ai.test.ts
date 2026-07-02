import { describe, expect, it } from 'vitest';
import { chooseAiAction } from './ai';
import { applyAction, createGame } from './engine';

describe('chooseAiAction', () => {
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
