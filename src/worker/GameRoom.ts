/**
 * GameRoom Durable Object — one instance per match (GDD §5.2).
 *
 * Holds the authoritative GameState, accepts exactly two players over
 * hibernatable WebSockets, and is the only place Math.random ever rolls
 * a die — the client just asks and receives results. State is persisted
 * to Durable Object storage on every action, so rooms survive
 * hibernation and player reconnects (identified by their token).
 */
import { applyAction, createGame } from '../game/engine';
import type { Action, GameState, PlayerId } from '../game/types';
import { parseClientMessage, type SeatsInfo, type ServerMessage } from '../net/protocol';

interface RoomMeta {
  /** token → seat, so a returning player gets their seat back. */
  tokens: Record<string, PlayerId>;
  names: SeatsInfo;
}

interface Attachment {
  seat: PlayerId;
}

export class GameRoom {
  private readonly ctx: DurableObjectState;

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Očakávam WebSocket pripojenie.', { status: 426 });
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws: WebSocket, raw: ArrayBuffer | string): Promise<void> {
    const msg = typeof raw === 'string' ? parseClientMessage(raw) : null;
    if (!msg) {
      this.send(ws, { type: 'ERROR', message: 'Neplatná správa.' });
      return;
    }
    if (msg.type === 'JOIN_ROOM') {
      await this.handleJoin(ws, msg.token, msg.name);
    } else {
      await this.handleAction(ws, msg.action);
    }
  }

  async webSocketClose(): Promise<void> {
    // Players rejoin with their token; the room state lives in storage.
  }

  private async handleJoin(ws: WebSocket, token: string, name: string): Promise<void> {
    const meta = await this.loadMeta();
    let seat = meta.tokens[token];
    if (!seat) {
      const taken = new Set(Object.values(meta.tokens));
      const free = (['p1', 'p2'] as const).find((s) => !taken.has(s));
      if (!free) {
        this.send(ws, { type: 'ERROR', message: 'Miestnosť je už plná.' });
        ws.close(1008, 'room full');
        return;
      }
      seat = free;
      meta.tokens[token] = seat;
      meta.names[seat] = name.trim() || (seat === 'p1' ? 'Hráč 1' : 'Hráč 2');
      await this.ctx.storage.put('meta', meta);
    }
    ws.serializeAttachment({ seat } satisfies Attachment);

    // Both summoners present — create the match. The server RNG deals and rolls.
    let game = await this.loadGame();
    if (!game && meta.names.p1 && meta.names.p2) {
      game = createGame(Math.random, [meta.names.p1, meta.names.p2]);
      await this.ctx.storage.put('game', game);
    }

    this.send(ws, { type: 'ASSIGNED', seat });
    this.broadcast({ type: 'ROOM_STATE', state: game, seats: meta.names });
  }

  private async handleAction(ws: WebSocket, action: Action): Promise<void> {
    const attachment = ws.deserializeAttachment() as Attachment | null;
    if (!attachment) {
      this.send(ws, { type: 'ERROR', message: 'Najprv sa pripoj do miestnosti.' });
      return;
    }
    const game = await this.loadGame();
    if (!game) {
      this.send(ws, { type: 'ERROR', message: 'Hra ešte nezačala — čaká sa na druhého hráča.' });
      return;
    }
    // Seat spoofing guard: a client may only act as the seat it was assigned.
    if (action.player !== attachment.seat) {
      this.send(ws, { type: 'ERROR', message: 'Nemôžeš hrať za súpera.' });
      return;
    }
    try {
      const next = applyAction(game, action, Math.random);
      await this.ctx.storage.put('game', next);
      const meta = await this.loadMeta();
      this.broadcast({ type: 'ROOM_STATE', state: next, seats: meta.names });
    } catch (e) {
      this.send(ws, { type: 'ERROR', message: e instanceof Error ? e.message : 'Neplatná akcia.' });
    }
  }

  private async loadMeta(): Promise<RoomMeta> {
    return (
      (await this.ctx.storage.get<RoomMeta>('meta')) ?? { tokens: {}, names: { p1: null, p2: null } }
    );
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
