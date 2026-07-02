/**
 * GameRoom Durable Object — one instance per match (GDD §5.2).
 *
 * Holds the authoritative GameState, accepts exactly two players over
 * hibernatable WebSockets, and is the only place Math.random ever rolls
 * a die — the client just asks and receives results. State is persisted
 * to Durable Object storage on every action, so rooms survive
 * hibernation and player reconnects (identified by their token).
 */
import { validateDeck } from '../game/deck';
import { eloDelta } from '../game/elo';
import { applyAction, createGame, opponentOf } from '../game/engine';
import type { Action, GameState, PlayerId } from '../game/types';
import { parseClientMessage, type ClientMessage, type SeatsInfo, type ServerMessage } from '../net/protocol';
import { authenticate, type PlayerRow } from './api';
import type { Env } from './env';

interface RoomMeta {
  /** token → seat, so a returning player gets their seat back. */
  tokens: Record<string, PlayerId>;
  names: SeatsInfo;
  /** D1 profile id per seat — present only for logged-in players. */
  profiles: Partial<Record<PlayerId, string>>;
  /** Validated deck lists per seat (undefined → starter deck). */
  decks: Partial<Record<PlayerId, string[]>>;
}

interface Attachment {
  seat: PlayerId;
}

export class GameRoom {
  private readonly ctx: DurableObjectState;
  private readonly env: Env;

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Očakávam WebSocket pripojenie.', { status: 426 });
    }
    // Remember the public room code (a DO cannot read its own name).
    const match = new URL(request.url).pathname.match(/\/api\/rooms\/([A-Za-z0-9]+)\/ws$/);
    if (match && !(await this.ctx.storage.get('roomId'))) {
      await this.ctx.storage.put('roomId', match[1].toUpperCase());
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws: WebSocket, raw: ArrayBuffer | string): Promise<void> {
    const msg = typeof raw === 'string' ? parseClientMessage(raw) : null;
    if (!msg) {
      this.send(ws, { type: 'ERROR', message: 'invalidMessage' });
      return;
    }
    if (msg.type === 'JOIN_ROOM') {
      await this.handleJoin(ws, msg);
    } else {
      await this.handleAction(ws, msg.action);
    }
  }

  async webSocketClose(): Promise<void> {
    // Players rejoin with their token; the room state lives in storage.
  }

  private async handleJoin(ws: WebSocket, msg: Extract<ClientMessage, { type: 'JOIN_ROOM' }>): Promise<void> {
    const meta = await this.loadMeta();
    let seat = meta.tokens[msg.token];
    if (!seat) {
      const taken = new Set(Object.values(meta.tokens));
      const free = (['p1', 'p2'] as const).find((s) => !taken.has(s));
      if (!free) {
        this.send(ws, { type: 'ERROR', message: 'roomFull' });
        ws.close(1008, 'room full');
        return;
      }
      seat = free;
      meta.tokens[msg.token] = seat;
      meta.names[seat] = msg.name.trim() || (seat === 'p1' ? 'Hráč 1' : 'Hráč 2');

      // Tie the seat to a D1 profile and load the chosen deck (never trust
      // the client: credentials checked, deck ownership + rules validated).
      const profile = await authenticate(this.env, msg).catch(() => null);
      if (profile) {
        meta.profiles[seat] = profile.id;
        meta.names[seat] = profile.name;
        if (msg.deckId) {
          const deck = await this.loadDeck(profile.id, msg.deckId);
          if (deck) meta.decks[seat] = deck;
        }
      }
      await this.ctx.storage.put('meta', meta);
    }
    ws.serializeAttachment({ seat } satisfies Attachment);

    // Both summoners present — create the match. The server RNG deals and rolls.
    let game = await this.loadGame();
    if (!game && meta.names.p1 && meta.names.p2) {
      game = createGame(Math.random, [meta.names.p1, meta.names.p2], [meta.decks.p1, meta.decks.p2]);
      await this.ctx.storage.put('game', game);
    }

    this.send(ws, { type: 'ASSIGNED', seat });
    this.broadcast({ type: 'ROOM_STATE', state: game, seats: meta.names });
  }

  private async loadDeck(playerId: string, deckId: string): Promise<string[] | null> {
    try {
      const row = await this.env.DB.prepare('SELECT cards FROM decks WHERE id = ? AND player_id = ?')
        .bind(deckId, playerId)
        .first<{ cards: string }>();
      if (!row) return null;
      const cards = JSON.parse(row.cards) as string[];
      return validateDeck(cards) === null ? cards : null;
    } catch {
      return null;
    }
  }

  private async handleAction(ws: WebSocket, action: Action): Promise<void> {
    const attachment = ws.deserializeAttachment() as Attachment | null;
    if (!attachment) {
      this.send(ws, { type: 'ERROR', message: 'joinFirst' });
      return;
    }
    const game = await this.loadGame();
    if (!game) {
      this.send(ws, { type: 'ERROR', message: 'gameNotStarted' });
      return;
    }
    // Seat spoofing guard: a client may only act as the seat it was assigned.
    if (action.player !== attachment.seat) {
      this.send(ws, { type: 'ERROR', message: 'notYourSeat' });
      return;
    }
    try {
      const next = applyAction(game, action, Math.random);
      const meta = await this.loadMeta();
      if (next.winner && !game.winner) await this.recordResult(next, meta);
      await this.ctx.storage.put('game', next);
      this.broadcast({ type: 'ROOM_STATE', state: next, seats: meta.names });
    } catch (e) {
      this.send(ws, { type: 'ERROR', message: e instanceof Error ? e.message : 'invalidAction' });
    }
  }

  /** Writes the ELO/W-L update and match row once per room (GDD §5.2). */
  private async recordResult(state: GameState, meta: RoomMeta): Promise<void> {
    const winner = state.winner;
    if (!winner) return;
    if (await this.ctx.storage.get('resultRecorded')) return;
    await this.ctx.storage.put('resultRecorded', true);

    const winnerId = meta.profiles[winner];
    const loserId = meta.profiles[opponentOf(winner)];
    if (!winnerId || !loserId || winnerId === loserId) return;

    try {
      const w = await this.env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(winnerId).first<PlayerRow>();
      const l = await this.env.DB.prepare('SELECT * FROM players WHERE id = ?').bind(loserId).first<PlayerRow>();
      if (!w || !l) return;
      const delta = eloDelta(w.elo, l.elo);
      const roomId = ((await this.ctx.storage.get('roomId')) as string | undefined) ?? 'unknown';
      await this.env.DB.batch([
        this.env.DB.prepare('UPDATE players SET elo = elo + ?, wins = wins + 1 WHERE id = ?').bind(delta, winnerId),
        this.env.DB.prepare('UPDATE players SET elo = MAX(0, elo - ?), losses = losses + 1 WHERE id = ?').bind(
          delta,
          loserId,
        ),
        this.env.DB.prepare(
          'INSERT INTO matches (room_id, p1_id, p2_id, winner_id, elo_delta) VALUES (?, ?, ?, ?, ?)',
        ).bind(roomId, meta.profiles.p1 ?? null, meta.profiles.p2 ?? null, winnerId, delta),
      ]);
      state.log.push({
        id: state.nextLogId++,
        kind: 'msg',
        msgKey: 'eloUpdate',
        params: { winner: w.name, loser: l.name, delta, welo: w.elo + delta, lelo: Math.max(0, l.elo - delta) },
      });
    } catch {
      // D1 unavailable — the match result stays unranked but the game is unaffected.
    }
  }

  private async loadMeta(): Promise<RoomMeta> {
    const stored = await this.ctx.storage.get<Partial<RoomMeta>>('meta');
    return {
      tokens: stored?.tokens ?? {},
      names: stored?.names ?? { p1: null, p2: null },
      profiles: stored?.profiles ?? {},
      decks: stored?.decks ?? {},
    };
  }

  private async loadGame(): Promise<GameState | null> {
    return (await this.ctx.storage.get<GameState>('game')) ?? null;
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    ws.send(JSON.stringify(msg));
  }

  private broadcast(msg: ServerMessage): void {
    for (const ws of this.ctx.getWebSockets()) this.send(ws, msg);
  }
}
