import { describe, expect, it } from 'vitest';
import { GameRoom } from './GameRoom';
import type { Env } from './env';
import type { GameState } from '../game/types';
import type { ServerMessage } from '../net/protocol';

/**
 * Minimal in-memory stand-ins for the Cloudflare primitives GameRoom
 * touches: `ctx.storage` (get/put/delete) and `ctx.getWebSockets()`
 * (used by `broadcast`). `fetch()` itself needs a real `WebSocketPair`
 * and is intentionally not exercised here — every test drives the room
 * through the public `webSocketMessage` entry point instead, exactly
 * like the real Durable Object runtime does after `fetch()` accepts a
 * connection.
 */
function fakeCtx(): { ctx: DurableObjectState; sockets: FakeWebSocket[] } {
  const map = new Map<string, unknown>();
  const sockets: FakeWebSocket[] = [];
  const storage = {
    get: async (key: string) => map.get(key),
    put: async (key: string, value: unknown) => {
      map.set(key, value);
    },
    delete: async (key: string) => map.delete(key),
  };
  return { ctx: { storage, getWebSockets: () => sockets } as unknown as DurableObjectState, sockets };
}

class FakeWebSocket {
  sent: ServerMessage[] = [];
  closed: { code: number; reason?: string } | null = null;
  private attachment: unknown = null;
  send(data: string): void {
    this.sent.push(JSON.parse(data) as ServerMessage);
  }
  close(code: number, reason?: string): void {
    this.closed = { code, reason };
  }
  serializeAttachment(value: unknown): void {
    this.attachment = value;
  }
  deserializeAttachment(): unknown {
    return this.attachment;
  }
}

/** Records every query D1 was asked to run without ever answering it. */
function fakeEnv(): { env: Env; dbCalls: string[] } {
  const dbCalls: string[] = [];
  const DB = {
    prepare(query: string) {
      dbCalls.push(query);
      throw new Error('unexpected D1 access in this test');
    },
  } as unknown as Env['DB'];
  return { env: { DB } as unknown as Env, dbCalls };
}

function joinMsg(token: string, name: string): string {
  return JSON.stringify({ type: 'JOIN_ROOM', token, name });
}

/** Most recent ROOM_STATE broadcast — a socket usually accumulates several. */
function roomState(sent: ServerMessage[]): Extract<ServerMessage, { type: 'ROOM_STATE' }> | undefined {
  for (let i = sent.length - 1; i >= 0; i--) {
    const m = sent[i];
    if (m.type === 'ROOM_STATE') return m;
  }
  return undefined;
}

describe('GameRoom', () => {
  it('the first joiner is seated p1; the game waits for a second player', async () => {
    const { ctx, sockets } = fakeCtx();
    const { env } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws1 = new FakeWebSocket();
    sockets.push(ws1);

    await room.webSocketMessage(ws1 as unknown as WebSocket, joinMsg('t1', 'Alica'));

    expect(ws1.sent).toContainEqual({ type: 'ASSIGNED', seat: 'p1' });
    expect(roomState(ws1.sent)).toMatchObject({ state: null, seats: { p1: 'Alica', p2: null } });
  });

  it('a second, distinct joiner is seated p2 and the match starts', async () => {
    const { ctx, sockets } = fakeCtx();
    const { env } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws1 = new FakeWebSocket();
    const ws2 = new FakeWebSocket();
    sockets.push(ws1, ws2);

    await room.webSocketMessage(ws1 as unknown as WebSocket, joinMsg('t1', 'Alica'));
    await room.webSocketMessage(ws2 as unknown as WebSocket, joinMsg('t2', 'Bob'));

    expect(ws2.sent).toContainEqual({ type: 'ASSIGNED', seat: 'p2' });
    const started = roomState(ws2.sent);
    expect(started?.state).not.toBeNull();
    expect(started?.seats).toEqual({ p1: 'Alica', p2: 'Bob' });
    // Both sockets are re-broadcast the freshly created game.
    expect(roomState(ws1.sent)?.state).not.toBeNull();
  });

  it('rejoining with the same token returns the same seat instead of stealing a new one', async () => {
    const { ctx, sockets } = fakeCtx();
    const { env } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws1 = new FakeWebSocket();
    sockets.push(ws1);
    await room.webSocketMessage(ws1 as unknown as WebSocket, joinMsg('t1', 'Alica'));

    const ws1Reconnect = new FakeWebSocket();
    sockets.push(ws1Reconnect);
    await room.webSocketMessage(ws1Reconnect as unknown as WebSocket, joinMsg('t1', 'Alica'));

    expect(ws1Reconnect.sent).toContainEqual({ type: 'ASSIGNED', seat: 'p1' });
  });

  it('a third, distinct joiner is rejected once both seats are taken', async () => {
    const { ctx, sockets } = fakeCtx();
    const { env } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws1 = new FakeWebSocket();
    const ws2 = new FakeWebSocket();
    const ws3 = new FakeWebSocket();
    sockets.push(ws1, ws2, ws3);

    await room.webSocketMessage(ws1 as unknown as WebSocket, joinMsg('t1', 'Alica'));
    await room.webSocketMessage(ws2 as unknown as WebSocket, joinMsg('t2', 'Bob'));
    await room.webSocketMessage(ws3 as unknown as WebSocket, joinMsg('t3', 'Cyril'));

    expect(ws3.sent).toContainEqual({ type: 'ERROR', message: 'roomFull' });
    expect(ws3.closed).toMatchObject({ code: 1008 });
  });

  it('an action with no prior JOIN_ROOM is rejected with joinFirst', async () => {
    const { ctx } = fakeCtx();
    const { env } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws = new FakeWebSocket();

    await room.webSocketMessage(
      ws as unknown as WebSocket,
      JSON.stringify({ type: 'ACTION', action: { type: 'END_TURN', player: 'p1' } }),
    );

    expect(ws.sent).toContainEqual({ type: 'ERROR', message: 'joinFirst' });
  });

  it('an action before the second seat is filled is rejected with gameNotStarted', async () => {
    const { ctx, sockets } = fakeCtx();
    const { env } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws1 = new FakeWebSocket();
    sockets.push(ws1);
    await room.webSocketMessage(ws1 as unknown as WebSocket, joinMsg('t1', 'Alica'));
    ws1.sent = [];

    await room.webSocketMessage(
      ws1 as unknown as WebSocket,
      JSON.stringify({ type: 'ACTION', action: { type: 'END_TURN', player: 'p1' } }),
    );

    expect(ws1.sent).toContainEqual({ type: 'ERROR', message: 'gameNotStarted' });
  });

  it('the seat-spoofing guard rejects an action submitted for the other seat', async () => {
    const { ctx, sockets } = fakeCtx();
    const { env } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws1 = new FakeWebSocket();
    const ws2 = new FakeWebSocket();
    sockets.push(ws1, ws2);
    await room.webSocketMessage(ws1 as unknown as WebSocket, joinMsg('t1', 'Alica'));
    await room.webSocketMessage(ws2 as unknown as WebSocket, joinMsg('t2', 'Bob'));
    ws1.sent = [];

    // ws1 is seated p1 — submitting an action as p2 must be rejected before
    // it ever reaches the engine, regardless of whose turn it actually is.
    await room.webSocketMessage(
      ws1 as unknown as WebSocket,
      JSON.stringify({ type: 'ACTION', action: { type: 'END_TURN', player: 'p2' } }),
    );

    expect(ws1.sent).toContainEqual({ type: 'ERROR', message: 'notYourSeat' });
  });

  it('the double-win guard skips D1 entirely once a result is already recorded', async () => {
    const { ctx, sockets } = fakeCtx();
    const { env, dbCalls } = fakeEnv();
    const room = new GameRoom(ctx, env);
    const ws1 = new FakeWebSocket();
    const ws2 = new FakeWebSocket();
    sockets.push(ws1, ws2);
    await room.webSocketMessage(ws1 as unknown as WebSocket, joinMsg('t1', 'Alica'));
    await room.webSocketMessage(ws2 as unknown as WebSocket, joinMsg('t2', 'Bob'));

    // Hand-craft a lethal, combat-phase position and mark the result as
    // already recorded — as if this exact winning move had been processed
    // once already (e.g. a duplicated message after a reconnect).
    const game = (await ctx.storage.get('game')) as GameState;
    game.phase = 'combat';
    game.players.p1.lanes.vanguard[0] = {
      uid: game.nextUid++,
      cardId: 'megadrak', // attack 3
      hp: 6,
      maxHp: 6,
      armor: 0,
      burn: 0,
      ready: true,
      movedThisTurn: false,
    };
    game.players.p2.nexusHp = 1; // one hit from lethal
    await ctx.storage.put('game', game);
    await ctx.storage.put('resultRecorded', true);
    ws1.sent = [];

    await room.webSocketMessage(
      ws1 as unknown as WebSocket,
      JSON.stringify({
        type: 'ACTION',
        action: {
          type: 'ATTACK',
          player: 'p1',
          attacker: { lane: 'vanguard', slot: 0 },
          target: { kind: 'nexus', player: 'p2' },
          useDice: false,
        },
      }),
    );

    // The win itself still resolves normally...
    expect(roomState(ws1.sent)?.state?.winner).toBe('p1');
    // ...but recordResult's guard must stop it before it ever asks D1 anything.
    expect(dbCalls).toEqual([]);
  });
});
