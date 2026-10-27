/**
 * Profile, deck and leaderboard API backed by D1 (GDD §5.2).
 *
 * Identity is a lightweight anonymous account: the client holds a
 * playerId + secret pair (minted by POST /api/profile) and sends it
 * with every authenticated call. No e-mail, no passwords — good enough
 * until real accounts arrive.
 */
import { validateDeck } from '../game/deck';
import { ELO_START } from '../game/elo';
import type { Env } from './env';

/** Upper bound on saved decks per player — keeps D1 rows per account bounded. */
export const MAX_DECKS_PER_PLAYER = 20;

export interface PlayerRow {
  id: string;
  /** Legacy plaintext secret; emptied once the row is upgraded to `secret_hash`. */
  secret: string;
  /** SHA-256 (hex) of the client secret; null on rows minted before migration 0004. */
  secret_hash?: string | null;
  name: string;
  elo: number;
  wins: number;
  losses: number;
}

interface Credentials {
  playerId?: string;
  secret?: string;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function publicProfile(row: PlayerRow) {
  return { playerId: row.id, name: row.name, elo: row.elo, wins: row.wins, losses: row.losses };
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Length-independent comparison so response timing doesn't leak how much of a secret matched. */
function constantTimeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function authenticate(env: Env, creds: Credentials): Promise<PlayerRow | null> {
  if (!creds.playerId || !creds.secret) return null;
  const row = await env.DB.prepare('SELECT * FROM players WHERE id = ?')
    .bind(creds.playerId)
    .first<PlayerRow>();
  if (!row) return null;
  const hash = await sha256Hex(creds.secret);
  if (row.secret_hash) return constantTimeEqual(row.secret_hash, hash) ? row : null;

  // Legacy row with a plaintext secret: verify it, then upgrade to a hash.
  if (!row.secret || !constantTimeEqual(row.secret, creds.secret)) return null;
  await env.DB.prepare("UPDATE players SET secret_hash = ?, secret = '' WHERE id = ?").bind(hash, row.id).run();
  return { ...row, secret: '', secret_hash: hash };
}

/** Per-IP cap on minting anonymous accounts (binding optional, e.g. in tests). */
async function profileCreationAllowed(request: Request, env: Env): Promise<boolean> {
  if (!env.PROFILE_LIMITER) return true;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.PROFILE_LIMITER.limit({ key: `profile:${ip}` });
  return success;
}

/** Handles /api/profile, /api/decks/* and /api/leaderboard. Returns null when the path is not ours. */
export async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/leaderboard' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT name, elo, wins, losses FROM players WHERE wins + losses > 0 ORDER BY elo DESC LIMIT 10',
    ).all();
    return json({ players: results });
  }

  if (!path.startsWith('/api/profile') && !path.startsWith('/api/decks')) return null;
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const rawBody = await request.json().catch(() => null);
  if (typeof rawBody !== 'object' || rawBody === null || Array.isArray(rawBody)) {
    return json({ error: 'invalidRequest' }, 400);
  }
  const body = rawBody as Credentials & {
    name?: string;
    deckId?: string;
    deckName?: string;
    cards?: string[];
  };

  if (path === '/api/profile') {
    const existing = await authenticate(env, body);
    if (existing) {
      // Optional rename on login.
      const name = body.name?.trim().slice(0, 20);
      if (name && name !== existing.name) {
        await env.DB.prepare('UPDATE players SET name = ? WHERE id = ?').bind(name, existing.id).run();
        existing.name = name;
      }
      return json(publicProfile(existing) satisfies object & { playerId: string });
    }
    // Mint a fresh anonymous account (rate-limited per IP).
    if (!(await profileCreationAllowed(request, env))) return json({ error: 'rateLimited' }, 429);
    const secret = crypto.randomUUID();
    const row: PlayerRow = {
      id: crypto.randomUUID(),
      secret: '',
      secret_hash: await sha256Hex(secret),
      name: body.name?.trim().slice(0, 20) || 'Vyvolávač',
      elo: ELO_START,
      wins: 0,
      losses: 0,
    };
    // Only the hash is stored — the plaintext secret lives solely on the client.
    await env.DB.prepare(
      'INSERT INTO players (id, secret, secret_hash, name, elo, wins, losses) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(row.id, row.secret, row.secret_hash, row.name, row.elo, row.wins, row.losses)
      .run();
    return json({ ...publicProfile(row), secret });
  }

  const player = await authenticate(env, body);
  if (!player) return json({ error: 'badLogin' }, 401);

  if (path === '/api/decks/list') {
    const { results } = await env.DB.prepare(
      'SELECT id, name, cards FROM decks WHERE player_id = ? ORDER BY updated_at DESC',
    )
      .bind(player.id)
      .all<{ id: string; name: string; cards: string }>();
    return json({
      decks: results.map((d) => ({ id: d.id, name: d.name, cards: JSON.parse(d.cards) as string[] })),
    });
  }

  if (path === '/api/decks/save') {
    const cards: unknown = body.cards;
    const error = validateDeck(cards);
    if (error) return json({ error: error.code, params: error.params }, 400);
    const name = body.deckName?.trim().slice(0, 30) || 'Bez názvu';
    const deckId = body.deckId ?? crypto.randomUUID();
    const counts = await env.DB.prepare(
      'SELECT COUNT(*) AS total, SUM(id = ?) AS mine FROM decks WHERE player_id = ?',
    )
      .bind(deckId, player.id)
      .first<{ total: number; mine: number | null }>();
    if (!counts?.mine && (counts?.total ?? 0) >= MAX_DECKS_PER_PLAYER) {
      return json({ error: 'deckLimit', params: { n: MAX_DECKS_PER_PLAYER } }, 409);
    }
    const saved = await env.DB.prepare(
      `INSERT INTO decks (id, player_id, name, cards, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, cards = excluded.cards, updated_at = excluded.updated_at
       WHERE decks.player_id = excluded.player_id`,
    )
      .bind(deckId, player.id, name, JSON.stringify(cards))
      .run();
    // The conflict guard skips updates to decks owned by someone else — a
    // zero-row write must not look like a successful save.
    if (saved.meta.changes !== 1) return json({ error: 'deckNotFound' }, 404);
    return json({ deckId, name });
  }

  if (path === '/api/decks/delete') {
    if (!body.deckId) return json({ error: 'deckId required' }, 400);
    await env.DB.prepare('DELETE FROM decks WHERE id = ? AND player_id = ?').bind(body.deckId, player.id).run();
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
}
