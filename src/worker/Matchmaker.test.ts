import { describe, expect, it } from 'vitest';
import { Matchmaker } from './Matchmaker';

/**
 * Minimal in-memory stand-in for `DurableObjectState` — Matchmaker only
 * ever touches `ctx.storage.get/put/delete`, so that's all this fakes.
 */
function fakeCtx(): DurableObjectState {
  const map = new Map<string, unknown>();
  const storage = {
    get: async (key: string) => map.get(key),
    put: async (key: string, value: unknown) => {
      map.set(key, value);
    },
    delete: async (key: string) => map.delete(key),
  };
  return { storage } as unknown as DurableObjectState;
}

function request(action: 'join' | 'heartbeat' | 'cancel', body?: unknown): Request {
  return new Request(`https://mm.internal/${action}`, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

interface JoinBody {
  roomId: string;
  matched: boolean;
}

describe('Matchmaker', () => {
  it('the first joiner opens a room and waits', async () => {
    const mm = new Matchmaker(fakeCtx());
    const body = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    expect(body.matched).toBe(false);
    expect(body.roomId).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('the second joiner is paired straight into the first joiner\u2019s room', async () => {
    const ctx = fakeCtx();
    const mm = new Matchmaker(ctx);
    const first = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    const second = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    expect(second.matched).toBe(true);
    expect(second.roomId).toBe(first.roomId);
  });

  it('a third joiner after a pairing opens a brand new room (queue is empty again)', async () => {
    const ctx = fakeCtx();
    const mm = new Matchmaker(ctx);
    await mm.fetch(request('join')); // p1 waits
    await mm.fetch(request('join')); // p2 pairs — queue emptied
    const third = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    expect(third.matched).toBe(false);
  });

  it('an abandoned entry (stale heartbeat) is replaced rather than matched', async () => {
    const ctx = fakeCtx();
    const mm = new Matchmaker(ctx);
    const first = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    // Simulate the seeker's tab having been closed ~90s+ ago.
    await ctx.storage.put('waiting', { roomId: first.roomId, seenAt: Date.now() - 200_000 });
    const second = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    expect(second.matched).toBe(false);
    expect(second.roomId).not.toBe(first.roomId);
  });

  it('heartbeat refreshes the same waiting entry', async () => {
    const ctx = fakeCtx();
    const mm = new Matchmaker(ctx);
    const first = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    const res = await mm.fetch(request('heartbeat', { roomId: first.roomId }));
    expect(await res.json()).toEqual({ ok: true });
    expect(await ctx.storage.get('waiting')).toMatchObject({ roomId: first.roomId });
  });

  it('heartbeat never clobbers a different seeker\u2019s entry', async () => {
    const ctx = fakeCtx();
    const mm = new Matchmaker(ctx);
    const first = (await (await mm.fetch(request('join'))).json()) as JoinBody;
    // A stray heartbeat for some other room must not steal the waiting slot.
    await mm.fetch(request('heartbeat', { roomId: 'SOMEOTHERROOM' }));
    expect(await ctx.storage.get('waiting')).toMatchObject({ roomId: first.roomId });
  });

  it('heartbeat and cancel reject a request with no roomId', async () => {
    const mm = new Matchmaker(fakeCtx());
    const res = await mm.fetch(request('heartbeat', {}));
    expect(res.status).toBe(400);
  });

  it('cancel only clears a matching waiting entry', async () => {
    const ctx = fakeCtx();
    const mm = new Matchmaker(ctx);
    const first = (await (await mm.fetch(request('join'))).json()) as JoinBody;

    await mm.fetch(request('cancel', { roomId: 'NOT-THE-SAME' }));
    expect(await ctx.storage.get('waiting')).toBeDefined();

    await mm.fetch(request('cancel', { roomId: first.roomId }));
    expect(await ctx.storage.get('waiting')).toBeUndefined();
  });

  it('rejects non-POST requests', async () => {
    const mm = new Matchmaker(fakeCtx());
    const res = await mm.fetch(new Request('https://mm.internal/join', { method: 'GET' }));
    expect(res.status).toBe(405);
  });

  it('rejects unknown actions', async () => {
    const mm = new Matchmaker(fakeCtx());
    const res = await mm.fetch(new Request('https://mm.internal/nope', { method: 'POST' }));
    expect(res.status).toBe(404);
  });
});
