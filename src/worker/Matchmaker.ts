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
  ticketId: string;
  /** Last heartbeat (ms since epoch). */
  seenAt: number;
}

/** Entries older than this are abandoned. */
const WAITING_TTL_MS = 90_000;
const QUEUE_TICKET_TTL_MS = 30 * 60_000;
const RATE_WINDOW_MS = 60_000;
const JOIN_RATE_LIMIT = 30;
const OTHER_RATE_LIMIT = 120;
const RATE_BUCKET_CAP = 1_000;

interface QueueTicketPayload {
  roomId: string;
  ticketId: string;
  expiresAt: number;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array | null {
  try {
    const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function randomToken(bytes = 24): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(bytes)));
}

export class Matchmaker {
  private readonly ctx: DurableObjectState;
  private readonly rateBuckets = new Map<string, RateBucket>();

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const rateLimit = action === 'join' ? JOIN_RATE_LIMIT : OTHER_RATE_LIMIT;
    if (!this.consumeRateLimit(`${ip}:${action ?? 'unknown'}`, rateLimit)) {
      return Response.json(
        { error: 'rateLimited' },
        { status: 429, headers: { 'retry-after': String(RATE_WINDOW_MS / 1000) } },
      );
    }

    if (action === 'join') return this.join();
    if (action === 'heartbeat' || action === 'cancel') {
      const body = await request.json().catch(() => null);
      if (typeof body !== 'object' || body === null) return Response.json({ error: 'invalidRequest' }, { status: 400 });
      const { roomId, ticket } = body as Record<string, unknown>;
      if (typeof roomId !== 'string' || typeof ticket !== 'string') {
        return Response.json({ error: 'queueTicketRequired' }, { status: 401 });
      }
      const payload = await this.verifyTicket(ticket);
      if (!payload || payload.roomId !== roomId || payload.expiresAt < Date.now()) {
        return Response.json({ error: 'invalidQueueTicket' }, { status: 401 });
      }
      return action === 'heartbeat' ? this.heartbeat(payload) : this.cancel(payload);
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
    const payload: QueueTicketPayload = {
      roomId,
      ticketId: randomToken(),
      // Heartbeats own freshness; this longer expiry only bounds how long a
      // stolen/abandoned capability could ever be replayed.
      expiresAt: Date.now() + QUEUE_TICKET_TTL_MS,
    };
    await this.ctx.storage.put('waiting', {
      roomId,
      ticketId: payload.ticketId,
      seenAt: Date.now(),
    } satisfies WaitingEntry);
    return Response.json({ roomId, matched: false, queueTicket: await this.signTicket(payload) });
  }

  private async heartbeat(payload: QueueTicketPayload): Promise<Response> {
    const waiting = await this.ctx.storage.get<WaitingEntry>('waiting');
    if (!waiting || waiting.roomId !== payload.roomId || waiting.ticketId !== payload.ticketId) {
      return Response.json({ error: 'queueEntryMissing' }, { status: 409 });
    }
    await this.ctx.storage.put('waiting', { ...waiting, seenAt: Date.now() } satisfies WaitingEntry);
    return Response.json({ ok: true });
  }

  private async cancel(payload: QueueTicketPayload): Promise<Response> {
    const waiting = await this.ctx.storage.get<WaitingEntry>('waiting');
    if (waiting?.roomId === payload.roomId && waiting.ticketId === payload.ticketId) {
      await this.ctx.storage.delete('waiting');
    }
    return Response.json({ ok: true });
  }

  private consumeRateLimit(key: string, limit: number): boolean {
    const now = Date.now();
    const current = this.rateBuckets.get(key);
    if (!current || current.resetAt <= now) {
      this.rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
      if (this.rateBuckets.size > RATE_BUCKET_CAP) {
        // Prune expired buckets first; if a burst of unique IPs still exceeds
        // the cap, evict the oldest live buckets (their limit simply resets).
        for (const [bucketKey, bucket] of this.rateBuckets) {
          if (bucket.resetAt <= now) this.rateBuckets.delete(bucketKey);
        }
        while (this.rateBuckets.size > RATE_BUCKET_CAP) {
          const oldest = this.rateBuckets.keys().next().value;
          if (oldest === undefined) break;
          this.rateBuckets.delete(oldest);
        }
      }
      return true;
    }
    current.count++;
    return current.count <= limit;
  }

  private async signingKey(): Promise<CryptoKey> {
    let encoded = await this.ctx.storage.get<string>('ticketSigningKey');
    if (!encoded) {
      encoded = randomToken(32);
      await this.ctx.storage.put('ticketSigningKey', encoded);
    }
    const bytes = base64UrlDecode(encoded);
    if (!bytes) throw new Error('invalid signing key');
    return crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  }

  private async signTicket(payload: QueueTicketPayload): Promise<string> {
    const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
    const signature = await crypto.subtle.sign(
      'HMAC',
      await this.signingKey(),
      new TextEncoder().encode(encodedPayload),
    );
    return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
  }

  private async verifyTicket(ticket: string): Promise<QueueTicketPayload | null> {
    const [encodedPayload, encodedSignature, ...extra] = ticket.split('.');
    if (!encodedPayload || !encodedSignature || extra.length > 0) return null;
    const signature = base64UrlDecode(encodedSignature);
    const payloadBytes = base64UrlDecode(encodedPayload);
    if (!signature || !payloadBytes) return null;
    const valid = await crypto.subtle.verify(
      'HMAC',
      await this.signingKey(),
      signature,
      new TextEncoder().encode(encodedPayload),
    );
    if (!valid) return null;
    try {
      const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as Record<string, unknown>;
      if (
        typeof payload.roomId !== 'string' ||
        typeof payload.ticketId !== 'string' ||
        typeof payload.expiresAt !== 'number'
      ) {
        return null;
      }
      return payload as unknown as QueueTicketPayload;
    } catch {
      return null;
    }
  }
}
