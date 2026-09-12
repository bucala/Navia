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
import { applyAction, createGame, logMsg, opponentOf } from '../game/engine';
import {
  HIDDEN_CARD_ID,
  type Action,
  type GameState,
  type PlayerId,
  type PublicGameState,
  type PublicPlayerState,
} from '../game/types';
import { parseClientMessage, type ClientMessage, type SeatsInfo, type ServerMessage } from '../net/protocol';
import { authenticate } from './api';
import type { Env } from './env';
import { roomCodeFromWsPath } from './roomCode';
import { SerialExecutor } from './serialize';

const LOG_HISTORY_LIMIT = 200;
const WAITING_ROOM_TTL_MS = 5 * 60_000;
const ACTIVE_ROOM_TTL_MS = 30 * 60_000;
const FINISHED_ROOM_TTL_MS = 24 * 60 * 60_000;
const RESULT_RETRY_MS = 60_000;
const MAX_MESSAGE_LENGTH = 16_384;
const TURN_TIMEOUT_MS = 90_000;
const MAX_TURN_TIMEOUTS = 2;

interface RoomMeta {
  /** token → seat, so a returning player gets their seat back. */
  tokens: Record<string, PlayerId>;
  names: SeatsInfo;
  /** D1 profile id per seat — present only for logged-in players. */
  profiles: Partial<Record<PlayerId, string>>;
  /** Validated deck lists per seat (undefined → starter deck). */
  decks: Partial<Record<PlayerId, string[]>>;
  /** Globally unique key used to make D1 result recording idempotent. */
  matchId?: string;
  /** Missed turn deadlines per seat; a valid action resets that seat. */
  timeouts: Partial<Record<PlayerId, number>>;
}

interface Attachment {
  seat: PlayerId;
}

interface RatingResult {
  winnerName: string;
  loserName: string;
  delta: number;
  winnerElo: number;
  loserElo: number;
}

/** Build a player-specific view without either deck order or the opponent's hand. */
export function publicGameStateFor(state: GameState, seat: PlayerId): PublicGameState {
  const publicPlayer = (playerId: PlayerId): PublicPlayerState => {
    const { deck, hand, ...visible } = state.players[playerId];
    return {
      ...visible,
      hand: playerId === seat ? [...hand] : Array<string>(hand.length).fill(HIDDEN_CARD_ID),
      deckCount: deck.length,
    };
  };
  return {
    ...state,
    players: {
      p1: publicPlayer('p1'),
      p2: publicPlayer('p2'),
    },
  };
}

export class GameRoom {
  private readonly ctx: DurableObjectState;
  private readonly env: Env;
  private readonly serial = new SerialExecutor();

  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Očakávam WebSocket pripojenie.', { status: 426 });
    }
    // Remember the public room code (a DO cannot read its own name).
    const roomCode = roomCodeFromWsPath(new URL(request.url).pathname);
    if (roomCode && !(await this.ctx.storage.get('roomId'))) {
      await this.ctx.storage.put('roomId', roomCode);
    }
    if (!(await this.ctx.storage.get<number>('lastActivity'))) {
      await this.touchActivity(WAITING_ROOM_TTL_MS);
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws: WebSocket, raw: ArrayBuffer | string): Promise<void> {
    if (
      (typeof raw === 'string' && raw.length > MAX_MESSAGE_LENGTH) ||
      (raw instanceof ArrayBuffer && raw.byteLength > MAX_MESSAGE_LENGTH)
    ) {
      this.send(ws, { type: 'ERROR', message: 'messageTooLarge' });
      ws.close(1009, 'message too large');
      return;
    }
    const msg = typeof raw === 'string' ? parseClientMessage(raw) : null;
    if (!msg) {
      this.send(ws, { type: 'ERROR', message: 'invalidMessage' });
      return;
    }
    await this.serializeOperation(async () => {
      if (msg.type === 'JOIN_ROOM') {
        await this.handleJoin(ws, msg);
      } else {
        await this.handleAction(ws, msg.action);
      }
    });
  }

  async webSocketClose(): Promise<void> {
    // Players rejoin with their token; the room state lives in storage.
  }

  async alarm(): Promise<void> {
    await this.serializeOperation(() => this.handleAlarm());
  }

  private async handleAlarm(): Promise<void> {
    if (await this.ctx.storage.get<boolean>('resultPending')) {
      const game = await this.loadGame();
      const meta = await this.loadMeta();
      if (game?.winner && (await this.recordResult(game, meta))) {
        // A retried result changes the stored state (ELO log) — clients that
        // stayed connected after the original failure need the update.
        this.broadcastState(game, meta.names);
      }
    }

    let game = await this.loadGame();
    if (game && !game.winner && game.turnDeadline && Date.now() >= game.turnDeadline) {
      game = await this.handleTurnTimeout(game);
    }

    const lastActivity = (await this.ctx.storage.get<number>('lastActivity')) ?? Date.now();
    const ttl = game?.winner
      ? FINISHED_ROOM_TTL_MS
      : game
        ? ACTIVE_ROOM_TTL_MS
        : WAITING_ROOM_TTL_MS;
    const expiresAt = lastActivity + ttl;
    if (Date.now() >= expiresAt && !(await this.ctx.storage.get<boolean>('resultPending'))) {
      for (const socket of this.ctx.getWebSockets()) socket.close(1001, 'room expired');
      await this.ctx.storage.deleteAll();
      return;
    }
    const resultPending = await this.ctx.storage.get<boolean>('resultPending');
    const nextAlarm = [
      expiresAt,
      ...(resultPending ? [Date.now() + RESULT_RETRY_MS] : []),
      ...(game && !game.winner && game.turnDeadline ? [game.turnDeadline] : []),
    ];
    await this.ctx.storage.setAlarm(Math.min(...nextAlarm));
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
      // Persist the reservation before external D1 I/O. The operation queue
      // also serializes concurrent JOIN/ACTION events for this room.
      await this.ctx.storage.put('meta', meta);

      // Tie the seat to a D1 profile and load the chosen deck (never trust
      // the client: credentials checked, deck ownership + rules validated).
      const profile = await authenticate(this.env, msg).catch((e) => {
        console.error('authenticate failed', e);
        return null;
      });
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
      game.turnDeadline = Date.now() + TURN_TIMEOUT_MS;
      meta.matchId = crypto.randomUUID();
      await this.ctx.storage.put('meta', meta);
      await this.ctx.storage.put('game', game);
    }

    await this.touchActivity(game ? ACTIVE_ROOM_TTL_MS : WAITING_ROOM_TTL_MS, game);
    this.send(ws, { type: 'ASSIGNED', seat });
    this.broadcastState(game, meta.names);
  }

  private async loadDeck(playerId: string, deckId: string): Promise<string[] | null> {
    try {
      const row = await this.env.DB.prepare('SELECT cards FROM decks WHERE id = ? AND player_id = ?')
        .bind(deckId, playerId)
        .first<{ cards: string }>();
      if (!row) return null;
      const cards = JSON.parse(row.cards) as string[];
      return validateDeck(cards) === null ? cards : null;
    } catch (e) {
      console.error('loadDeck failed', e);
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
      meta.timeouts[attachment.seat] = 0;
      await this.ctx.storage.put('meta', meta);
      if (next.active !== game.active) next.turnDeadline = Date.now() + TURN_TIMEOUT_MS;
      this.pruneLog(next);
      await this.ctx.storage.put('game', next);
      await this.touchActivity(
        next.winner ? FINISHED_ROOM_TTL_MS : ACTIVE_ROOM_TTL_MS,
        next,
      );
      if (next.winner && !game.winner) await this.recordResult(next, meta);
      this.broadcastState(next, meta.names);
    } catch (e) {
      this.send(ws, { type: 'ERROR', message: e instanceof Error ? e.message : 'invalidAction' });
    }
  }

  /** Writes the ELO/W-L update and match row once per room (GDD §5.2). Returns true when the stored game changed. */
  private async recordResult(state: GameState, meta: RoomMeta): Promise<boolean> {
    const winner = state.winner;
    if (!winner) return false;
    if (await this.ctx.storage.get('resultRecorded')) {
      await this.ctx.storage.delete('resultPending');
      return false;
    }

    const p1Id = meta.profiles.p1;
    const p2Id = meta.profiles.p2;
    if (!p1Id || !p2Id || p1Id === p2Id) {
      await this.ctx.storage.put('resultRecorded', true);
      await this.ctx.storage.delete('resultPending');
      return false;
    }
    const winnerId = winner === 'p1' ? p1Id : p2Id;
    const loserId = winner === 'p1' ? p2Id : p1Id;

    try {
      const roomId = ((await this.ctx.storage.get('roomId')) as string | undefined) ?? 'unknown';
      const matchId = meta.matchId ?? crypto.randomUUID();
      if (!meta.matchId) {
        meta.matchId = matchId;
        await this.ctx.storage.put('meta', meta);
      }
      await this.ctx.storage.put('resultPending', true);
      const coordinator = this.env.RATING_COORDINATOR.get(
        this.env.RATING_COORDINATOR.idFromName('global'),
      );
      const result = (await coordinator.applyResult({
        matchId,
        roomId,
        p1Id,
        p2Id,
        winnerId,
        loserId,
      })) as RatingResult;
      if (!state.log.some((event) => event.kind === 'msg' && event.msgKey === 'eloUpdate')) {
        state.log.push({
          id: state.nextLogId++,
          kind: 'msg',
          msgKey: 'eloUpdate',
          params: {
            winner: result.winnerName,
            loser: result.loserName,
            delta: result.delta,
            welo: result.winnerElo,
            lelo: result.loserElo,
          },
        });
      }
      this.pruneLog(state);
      await this.ctx.storage.put({
        game: state,
        resultRecorded: true,
      });
      await this.ctx.storage.delete('resultPending');
      return true;
    } catch (e) {
      await this.ctx.storage.put('resultPending', true);
      await this.ctx.storage.setAlarm(Date.now() + RESULT_RETRY_MS);
      console.error('recordResult failed', e);
      return false;
    }
  }

  private async loadMeta(): Promise<RoomMeta> {
    const stored = await this.ctx.storage.get<Partial<RoomMeta>>('meta');
    return {
      tokens: stored?.tokens ?? {},
      names: stored?.names ?? { p1: null, p2: null },
      profiles: stored?.profiles ?? {},
      decks: stored?.decks ?? {},
      matchId: stored?.matchId,
      timeouts: stored?.timeouts ?? {},
    };
  }

  private async loadGame(): Promise<GameState | null> {
    return (await this.ctx.storage.get<GameState>('game')) ?? null;
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    ws.send(JSON.stringify(msg));
  }

  private async serializeOperation(operation: () => Promise<void>): Promise<void> {
    await this.serial.run(operation);
  }

  private pruneLog(state: GameState): void {
    if (state.log.length > LOG_HISTORY_LIMIT) {
      state.log = state.log.slice(-LOG_HISTORY_LIMIT);
    }
  }

  private async touchActivity(ttl: number, game?: GameState | null): Promise<void> {
    const now = Date.now();
    await this.ctx.storage.put('lastActivity', now);
    const deadline = game && !game.winner ? game.turnDeadline : undefined;
    await this.ctx.storage.setAlarm(Math.min(now + ttl, deadline ?? Number.POSITIVE_INFINITY));
  }

  private async handleTurnTimeout(game: GameState): Promise<GameState> {
    const meta = await this.loadMeta();
    const timedOut = game.active;
    meta.timeouts[timedOut] = (meta.timeouts[timedOut] ?? 0) + 1;
    const next = structuredClone(game);
    logMsg(next, 'turnTimedOut', { player: next.players[timedOut].name });

    if ((meta.timeouts[timedOut] ?? 0) >= MAX_TURN_TIMEOUTS) {
      next.winner = opponentOf(timedOut);
      next.turnDeadline = undefined;
      logMsg(next, 'timeoutForfeit', { player: next.players[next.winner].name });
      logMsg(next, 'winner', { player: next.players[next.winner].name });
    } else {
      const advanced = applyAction(
        next,
        { type: 'END_TURN', player: timedOut },
        Math.random,
      );
      Object.assign(next, advanced);
      if (!next.winner) next.turnDeadline = Date.now() + TURN_TIMEOUT_MS;
    }

    this.pruneLog(next);
    await this.ctx.storage.put({ game: next, meta });
    if (next.winner) await this.recordResult(next, meta);
    this.broadcastState(next, meta.names);
    return next;
  }

  private broadcastState(state: GameState | null, seats: SeatsInfo): void {
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment() as Attachment | null;
      if (!attachment) continue;
      this.send(ws, {
        type: 'ROOM_STATE',
        state: state ? publicGameStateFor(state, attachment.seat) : null,
        seats,
      });
    }
  }
}
