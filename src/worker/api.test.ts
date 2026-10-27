import { describe, expect, it } from 'vitest';
import { STARTER_DECK } from '../game/cards';
import { authenticate, handleApi, MAX_DECKS_PER_PLAYER, sha256Hex, type PlayerRow } from './api';
import type { Env } from './env';

/** Minimal in-memory D1 covering the queries api.ts issues. */
function fakeEnv(rows: PlayerRow[], deckCount = 0, limiterAllows = true) {
  const players = new Map(rows.map((row) => [row.id, { ...row }]));
  const inserted: PlayerRow[] = [];
  const DB = {
    prepare(query: string) {
      let values: unknown[] = [];
      return {
        bind(...args: unknown[]) {
          values = args;
          return this;
        },
        async first() {
          if (query.startsWith('SELECT * FROM players')) return players.get(String(values[0])) ?? null;
          if (query.includes('COUNT(*) AS total')) return { total: deckCount, mine: 0 };
          throw new Error(`unexpected first(): ${query}`);
        },
        async run() {
          if (query.startsWith('UPDATE players SET secret_hash')) {
            const row = players.get(String(values[1]))!;
            row.secret_hash = String(values[0]);
            row.secret = '';
          } else if (query.startsWith('INSERT INTO players')) {
            const [id, secret, secret_hash, name, elo, wins, losses] = values as [string, string, string, string, number, number, number];
            inserted.push({ id, secret, secret_hash, name, elo, wins, losses });
          } else {
            throw new Error(`unexpected run(): ${query}`);
          }
          return { meta: { changes: 1 } };
        },
      };
    },
  } as unknown as Env['DB'];
  const PROFILE_LIMITER = { limit: async () => ({ success: limiterAllows }) } as unknown as RateLimit;
  return { env: { DB, PROFILE_LIMITER } as unknown as Env, players, inserted };
}

const base = { name: 'Alica', elo: 1000, wins: 0, losses: 0 };

function post(path: string, body: object): Request {
  return new Request(`https://navia.test${path}`, { method: 'POST', body: JSON.stringify(body) });
}

describe('authenticate', () => {
  it('accepts the right secret against a stored hash and rejects a wrong one', async () => {
    const fake = fakeEnv([{ id: 'p1', secret: '', secret_hash: await sha256Hex('good'), ...base }]);
    expect(await authenticate(fake.env, { playerId: 'p1', secret: 'good' })).not.toBeNull();
    expect(await authenticate(fake.env, { playerId: 'p1', secret: 'bad' })).toBeNull();
  });

  it('upgrades a legacy plaintext secret to a hash on first login', async () => {
    const fake = fakeEnv([{ id: 'p1', secret: 'legacy', secret_hash: null, ...base }]);
    expect(await authenticate(fake.env, { playerId: 'p1', secret: 'legacy' })).not.toBeNull();
    const row = fake.players.get('p1')!;
    expect(row.secret).toBe('');
    expect(row.secret_hash).toBe(await sha256Hex('legacy'));
  });
});

describe('handleApi', () => {
  it('stores only a hash for new accounts and returns the secret once', async () => {
    const fake = fakeEnv([]);
    const res = await handleApi(post('/api/profile', { name: 'Bob' }), fake.env);
    const data = (await res!.json()) as { secret: string };
    expect(fake.inserted[0].secret).toBe('');
    expect(fake.inserted[0].secret_hash).toBe(await sha256Hex(data.secret));
  });

  it('rate-limits account creation', async () => {
    const fake = fakeEnv([], 0, false);
    const res = await handleApi(post('/api/profile', { name: 'Bob' }), fake.env);
    expect(res!.status).toBe(429);
    expect(fake.inserted).toHaveLength(0);
  });

  it('refuses a new deck once the per-player cap is reached', async () => {
    const fake = fakeEnv([{ id: 'p1', secret: '', secret_hash: await sha256Hex('s'), ...base }], MAX_DECKS_PER_PLAYER);
    const res = await handleApi(
      post('/api/decks/save', { playerId: 'p1', secret: 's', cards: STARTER_DECK.slice(0, 15) }),
      fake.env,
    );
    expect(res!.status).toBe(409);
  });
});
