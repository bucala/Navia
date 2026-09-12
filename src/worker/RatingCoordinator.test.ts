import { describe, expect, it, vi } from 'vitest';

vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    protected readonly ctx: DurableObjectState;
    protected readonly env: unknown;

    constructor(ctx: DurableObjectState, env: unknown) {
      this.ctx = ctx;
      this.env = env;
    }
  },
}));

import { RatingCoordinator, type ResultRequest } from './RatingCoordinator';
import type { PlayerRow } from './api';
import type { Env } from './env';

interface Match {
  resultKey: string;
  eloDelta: number;
}

function fakeEnv() {
  const players = new Map<string, PlayerRow>([
    ['p1-id', { id: 'p1-id', secret: 's1', name: 'Alica', elo: 1000, wins: 0, losses: 0 }],
    ['p2-id', { id: 'p2-id', secret: 's2', name: 'Bob', elo: 1000, wins: 0, losses: 0 }],
  ]);
  const matches = new Map<string, Match>();
  let batches = 0;

  class Statement {
    private values: unknown[] = [];

    constructor(readonly query: string) {}

    bind(...values: unknown[]) {
      this.values = values;
      return this;
    }

    async first<T>(): Promise<T | null> {
      if (this.query.includes('FROM matches')) {
        const match = matches.get(String(this.values[0]));
        return (match ? { elo_delta: match.eloDelta } : null) as T | null;
      }
      if (this.query.includes('FROM players')) {
        return (players.get(String(this.values[0])) ?? null) as T | null;
      }
      throw new Error(`Unexpected query: ${this.query}`);
    }

    apply(): void {
      if (this.query.startsWith('UPDATE players SET elo = elo +')) {
        const [delta, id] = this.values as [number, string];
        const player = players.get(id)!;
        player.elo += delta;
        player.wins++;
      } else if (this.query.includes('UPDATE players SET elo = MAX')) {
        const [delta, id] = this.values as [number, string];
        const player = players.get(id)!;
        player.elo = Math.max(0, player.elo - delta);
        player.losses++;
      } else if (this.query.includes('INSERT INTO matches')) {
        const [resultKey, , , , , delta] = this.values as [string, string, string, string, string, number];
        matches.set(resultKey, { resultKey, eloDelta: delta });
      } else {
        throw new Error(`Unexpected batch query: ${this.query}`);
      }
    }
  }

  const DB = {
    prepare: (query: string) => new Statement(query),
    batch: async (statements: Statement[]) => {
      batches++;
      for (const statement of statements) statement.apply();
      return [];
    },
  } as unknown as Env['DB'];

  return {
    env: { DB } as unknown as Env,
    players,
    matches,
    batchCount: () => batches,
  };
}

const result: ResultRequest = {
  matchId: 'match-1',
  roomId: 'ROOM01',
  p1Id: 'p1-id',
  p2Id: 'p2-id',
  winnerId: 'p1-id',
  loserId: 'p2-id',
};

describe('RatingCoordinator', () => {
  it('updates both players and writes the match in one D1 batch', async () => {
    const fake = fakeEnv();
    const coordinator = new RatingCoordinator({} as DurableObjectState, fake.env);

    const recorded = await coordinator.applyResult(result);

    expect(recorded).toMatchObject({ winnerName: 'Alica', loserName: 'Bob', delta: 16 });
    expect(fake.players.get('p1-id')).toMatchObject({ elo: 1016, wins: 1 });
    expect(fake.players.get('p2-id')).toMatchObject({ elo: 984, losses: 1 });
    expect(fake.matches.has('match-1')).toBe(true);
    expect(fake.batchCount()).toBe(1);
  });

  it('treats a repeated match key as an idempotent retry', async () => {
    const fake = fakeEnv();
    const coordinator = new RatingCoordinator({} as DurableObjectState, fake.env);

    await coordinator.applyResult(result);
    await coordinator.applyResult(result);

    expect(fake.players.get('p1-id')).toMatchObject({ elo: 1016, wins: 1 });
    expect(fake.players.get('p2-id')).toMatchObject({ elo: 984, losses: 1 });
    expect(fake.batchCount()).toBe(1);
  });

  it('serializes rating calculations for concurrent match results', async () => {
    const fake = fakeEnv();
    const coordinator = new RatingCoordinator({} as DurableObjectState, fake.env);

    await Promise.all([
      coordinator.applyResult({ ...result, matchId: 'match-a' }),
      coordinator.applyResult({ ...result, matchId: 'match-b' }),
    ]);

    expect(fake.players.get('p1-id')).toMatchObject({ elo: 1031, wins: 2 });
    expect(fake.players.get('p2-id')).toMatchObject({ elo: 969, losses: 2 });
    expect(fake.batchCount()).toBe(2);
  });

  it('rejects player ids that do not match the two seats', async () => {
    const fake = fakeEnv();
    const coordinator = new RatingCoordinator({} as DurableObjectState, fake.env);

    await expect(coordinator.applyResult({ ...result, winnerId: 'other' })).rejects.toThrow(
      'invalidResult',
    );
    expect(fake.batchCount()).toBe(0);
  });
});
