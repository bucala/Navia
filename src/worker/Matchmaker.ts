/**
 * Matchmaker Durable Object — a single global instance pairs "Rýchla
 * hra" players (GDD Fáza 4). The first seeker parks a room code in
 * storage; the next one consumes it and both meet in that GameRoom.
 *
 * The waiting client heartbeats every ~30 s; entries without a recent
 * heartbeat are considered abandoned (closed tab) and get replaced, so
 * nobody is ever matched into a dead room.
 */
import { generateRoomCode } from './roomCode';

interface WaitingEntry {
  roomId: string;
  /** Last heartbeat (ms since epoch). */
  seenAt: number;
}

/** Entries older than this are abandoned. */
const WAITING_TTL_MS = 90_000;

export class Matchmaker {
  private readonly ctx: DurableObjectState;

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    if (action === 'join') return this.join();
    if (action === 'heartbeat' || action === 'cancel') {
      const { roomId } = (await request.json().catch(() => ({}))) as { roomId?: string };
      if (!roomId) return new Response('roomId required', { status: 400 });
      return action === 'heartbeat' ? this.heartbeat(roomId) : this.cancel(roomId);
    }
    return new Response('Not found', { status: 404 });
  }

  private async join(): Promise<Response> {
    const waiting = await this.ctx.storage.get<WaitingEntry>('waiting');
    if (waiting && Date.now() - waiting.seenAt < WAITING_TTL_MS) {
      // Someone is waiting — pair up in their room.
      await this.ctx.storage.delete('waiting');
      return Response.json({ roomId: waiting.roomId, matched: true });
    }
    // Queue is empty (or stale) — this player opens a fresh room and waits.
    const roomId = generateRoomCode();
    await this.ctx.storage.put('waiting', { roomId, seenAt: Date.now() } satisfies WaitingEntry);
    return Response.json({ roomId, matched: false });
  }

  private async heartbeat(roomId: string): Promise<Response> {
    const waiting = await this.ctx.storage.get<WaitingEntry>('waiting');
    // Upsert: refresh own entry, or re-queue a still-waiting player whose
    // entry was lost — but never clobber a different seeker's entry.
    if (!waiting || waiting.roomId === roomId) {
      await this.ctx.storage.put('waiting', { roomId, seenAt: Date.now() } satisfies WaitingEntry);
    }
    return Response.json({ ok: true });
  }

  private async cancel(roomId: string): Promise<Response> {
    const waiting = await this.ctx.storage.get<WaitingEntry>('waiting');
    if (waiting?.roomId === roomId) await this.ctx.storage.delete('waiting');
    return Response.json({ ok: true });
  }
}
