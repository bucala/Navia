/**
 * Multiplayer client hook — replaces local dispatch with a WebSocket to
 * the GameRoom Durable Object. The UI is "dumb": it sends actions and
 * only re-renders when the authoritative ROOM_STATE arrives.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Action, GameState, PlayerId } from '../game/types';
import { wsUrl } from './api';
import type { ClientMessage, SeatsInfo, ServerMessage } from './protocol';

export type ConnectionStatus = 'connecting' | 'waiting' | 'playing' | 'closed';

/** Stable per-room identity so refresh/reconnect returns the same seat. */
function playerToken(roomId: string): string {
  const key = `pantheon-token-${roomId}`;
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export function useMultiplayerGame(roomId: string, playerName: string, onError: (message: string) => void) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [seat, setSeat] = useState<PlayerId | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [seats, setSeats] = useState<SeatsInfo>({ p1: null, p2: null });
  /** True between sending an action and the server's reply. */
  const [pending, setPending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const ws = new WebSocket(wsUrl(`/api/rooms/${roomId}/ws`));
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      const join: ClientMessage = { type: 'JOIN_ROOM', token: playerToken(roomId), name: playerName };
      ws.send(JSON.stringify(join));
    };
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data as string) as ServerMessage;
      if (msg.type === 'ASSIGNED') {
        setSeat(msg.seat);
      } else if (msg.type === 'ROOM_STATE') {
        setState(msg.state);
        setSeats(msg.seats);
        setPending(false);
        setStatus(msg.state ? 'playing' : 'waiting');
      } else {
        setPending(false);
        onErrorRef.current(msg.message);
      }
    };
    ws.onclose = () => {
      if (wsRef.current === ws) setStatus('closed');
    };

    return () => {
      wsRef.current = null;
      ws.close();
    };
  }, [roomId, playerName]);

  const sendAction = useCallback((action: Action): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      onErrorRef.current('Spojenie so serverom nie je aktívne.');
      return false;
    }
    setPending(true);
    const msg: ClientMessage = { type: 'ACTION', action };
    ws.send(JSON.stringify(msg));
    return true;
  }, []);

  return { status, seat, state, seats, pending, sendAction };
}
