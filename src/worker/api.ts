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

export interface PlayerRow {
  id: string;
  secret: string;
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

export async function authenticate(env: Env, creds: Credentials): Promise<PlayerRow | null> {
  if (!creds.playerId || !creds.secret) return null;
  const row = await env.DB.prepare('SELECT * FROM players WHERE id = ?')
    .bind(creds.playerId)
    .first<PlayerRow>();
  return row && row.secret === creds.secret ? row : null;
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

  const body = (await request.json().catch(() => ({}))) as Credentials & {
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
    // Mint a fresh anonymous account.
    const row: PlayerRow = {
      id: crypto.randomUUID(),
      secret: crypto.randomUUID(),
      name: body.name?.trim().slice(0, 20) || 'Vyvolávač',
      elo: ELO_START,
      wins: 0,
      losses: 0,
    };
    await env.DB.prepare('INSERT INTO players (id, secret, name, elo, wins, losses) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(row.id, row.secret, row.name, row.elo, row.wins, row.losses)
      .run();
    return json({ ...publicProfile(row), secret: row.secret });
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
    const cards = body.cards ?? [];
    const error = validateDeck(cards);
    if (error) return json({ error: error.code, params: error.params }, 400);
    const name = body.deckName?.trim().slice(0, 30) || 'Bez názvu';
    const deckId = body.deckId ?? crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO decks (id, player_id, name, cards, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, cards = excluded.cards, updated_at = excluded.updated_at
       WHERE decks.player_id = excluded.player_id`,
    )
      .bind(deckId, player.id, name, JSON.stringify(cards))
      .run();
    return json({ deckId, name });
  }

  if (path === '/api/decks/delete') {
    if (!body.deckId) return json({ error: 'deckId required' }, 400);
    await env.DB.prepare('DELETE FROM decks WHERE id = ? AND player_id = ?').bind(body.deckId, player.id).run();
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
}
