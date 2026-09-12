import { DurableObject } from 'cloudflare:workers';
import { eloDelta } from '../game/elo';
import { type PlayerRow } from './api';
import type { Env } from './env';
import { SerialExecutor } from './serialize';

export interface ResultRequest {
  matchId: string;
  roomId: string;
  p1Id: string;
  p2Id: string;
  winnerId: string;
  loserId: string;
}

interface MatchRow {
  elo_delta: number;
}

function isResultRequest(value: unknown): value is ResultRequest {
  if (typeof value !== 'object' || value === null) return false;
  const body = value as Record<string, unknown>;
  if (
    !['matchId', 'roomId', 'p1Id', 'p2Id', 'winnerId', 'loserId'].every(
      (key) => typeof body[key] === 'string' && body[key].length > 0,
    )
  ) {
    return false;
  }
  return (
    body.p1Id !== body.p2Id &&
    (body.winnerId === body.p1Id || body.winnerId === body.p2Id) &&
    (body.loserId === body.p1Id || body.loserId === body.p2Id) &&
    body.winnerId !== body.loserId
  );
}

/**
 * Serializes rating changes across rooms. GameRoom DOs are isolated from one
 * another, so D1 reads and writes must pass through one coordinator to ensure
 * every delta is calculated from the latest committed ratings.
 */
export class RatingCoordinator extends DurableObject<Env> {
  private readonly serial = new SerialExecutor();

  async applyResult(value: ResultRequest) {
    return this.serial.run(() => this.applyResultSerialized(value));
  }

  private async applyResultSerialized(value: ResultRequest) {
    if (!isResultRequest(value)) throw new Error('invalidResult');
    const body = value;

    const existing = await this.env.DB.prepare(
      'SELECT elo_delta FROM matches WHERE result_key = ? LIMIT 1',
    )
      .bind(body.matchId)
      .first<MatchRow>();

    const [winner, loser] = await Promise.all([
      this.env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(body.winnerId).first<PlayerRow>(),
      this.env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(body.loserId).first<PlayerRow>(),
    ]);
    if (!winner || !loser) throw new Error('playerMissing');

    if (existing) {
      return {
        winnerName: winner.name,
        loserName: loser.name,
        delta: existing.elo_delta,
        winnerElo: winner.elo,
        loserElo: loser.elo,
      };
    }

    const delta = eloDelta(winner.elo, loser.elo);
    await this.env.DB.batch([
      this.env.DB.prepare('UPDATE players SET elo = elo + ?, wins = wins + 1 WHERE id = ?').bind(
        delta,
        winner.id,
      ),
      this.env.DB.prepare(
        'UPDATE players SET elo = MAX(0, elo - ?), losses = losses + 1 WHERE id = ?',
      ).bind(delta, loser.id),
      this.env.DB.prepare(
        `INSERT INTO matches (result_key, room_id, p1_id, p2_id, winner_id, elo_delta)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(body.matchId, body.roomId, body.p1Id, body.p2Id, winner.id, delta),
    ]);

    return {
      winnerName: winner.name,
      loserName: loser.name,
      delta,
      winnerElo: winner.elo + delta,
      loserElo: Math.max(0, loser.elo - delta),
    };
  }
}
