import { describe, expect, it } from 'vitest';
import { parseClientMessage } from './protocol';

describe('parseClientMessage', () => {
  it('parses a well-formed JOIN_ROOM message', () => {
    const msg = parseClientMessage(JSON.stringify({ type: 'JOIN_ROOM', token: 'abc', name: 'Vyvolávač' }));
    expect(msg).toEqual({
      type: 'JOIN_ROOM',
      token: 'abc',
      name: 'Vyvolávač',
      playerId: undefined,
      secret: undefined,
      deckId: undefined,
    });
  });

  it('parses a well-formed ACTION message', () => {
    const action = { type: 'END_TURN', player: 'p1' };
    const msg = parseClientMessage(JSON.stringify({ type: 'ACTION', action }));
    expect(msg).toEqual({ type: 'ACTION', action });
  });

  it('rejects malformed JSON', () => {
    expect(parseClientMessage('{not json')).toBeNull();
  });

  it('rejects an unknown message type', () => {
    expect(parseClientMessage(JSON.stringify({ type: 'PING' }))).toBeNull();
  });

  it('rejects JOIN_ROOM with a non-string token or name', () => {
    expect(parseClientMessage(JSON.stringify({ type: 'JOIN_ROOM', token: 123, name: 'x' }))).toBeNull();
    expect(parseClientMessage(JSON.stringify({ type: 'JOIN_ROOM', token: 'abc', name: null }))).toBeNull();
  });

  it('rejects JOIN_ROOM with a non-string optional credential', () => {
    expect(
      parseClientMessage(JSON.stringify({ type: 'JOIN_ROOM', token: 'abc', name: 'x', secret: 42 })),
    ).toBeNull();
  });

  it('rejects an ACTION whose payload is not a valid Action', () => {
    expect(parseClientMessage(JSON.stringify({ type: 'ACTION', action: { type: 'PLAY_CARD' } }))).toBeNull();
    expect(
      parseClientMessage(
        JSON.stringify({
          type: 'ACTION',
          action: { type: 'ACTIVATE', player: 'p1', unit: { lane: 'vanguard', slot: -1 } },
        }),
      ),
    ).toBeNull();
  });
});
