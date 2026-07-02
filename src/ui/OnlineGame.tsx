import { useEffect, useRef, useState } from 'react';
import { apiUrl } from '../net/api';
import { useMultiplayerGame } from '../net/useMultiplayerGame';
import { Board } from './Board';
import { GameOverlays, Toast, useDiceFeedback, useToast, WinnerOverlay } from './feedback';
import { LogPanel } from './LogPanel';

function roomFromUrl(): string | null {
  const room = new URLSearchParams(window.location.search).get('room');
  return room ? room.toUpperCase() : null;
}

function setRoomInUrl(roomId: string | null): void {
  const url = new URL(window.location.href);
  if (roomId) url.searchParams.set('room', roomId);
  else url.searchParams.delete('room');
  window.history.replaceState(null, '', url);
}

/** Lobby → waiting room → online match (GDD Fáza 2). */
export function OnlineGame({ onExit }: { onExit: () => void }) {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('pantheon-name') ?? '');
  const [joinCode, setJoinCode] = useState('');
  const [roomId, setRoomId] = useState<string | null>(roomFromUrl);
  const [quickMatch, setQuickMatch] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast, showToast } = useToast();

  const rememberName = () => {
    const name = playerName.trim() || 'Vyvolávač';
    localStorage.setItem('pantheon-name', name);
    return name;
  };

  const createRoom = async () => {
    rememberName();
    setBusy(true);
    try {
      const res = await fetch(apiUrl('/api/rooms'), { method: 'POST' });
      if (!res.ok) throw new Error(`Server odpovedal ${res.status}`);
      const { roomId: created } = (await res.json()) as { roomId: string };
      setRoomInUrl(created);
      setRoomId(created);
    } catch (e) {
      showToast(`Miestnosť sa nepodarilo vytvoriť: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
    }
  };

  /** Rýchla hra — the Matchmaker pairs us with the next seeker (GDD Fáza 4). */
  const quickPlay = async () => {
    rememberName();
    setBusy(true);
    try {
      const res = await fetch(apiUrl('/api/matchmaking/join'), { method: 'POST' });
      if (!res.ok) throw new Error(`Server odpovedal ${res.status}`);
      const { roomId: found } = (await res.json()) as { roomId: string; matched: boolean };
      setQuickMatch(true);
      setRoomInUrl(found);
      setRoomId(found);
    } catch (e) {
      showToast(`Vyhľadávanie súpera zlyhalo: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      showToast('Zadaj kód miestnosti.');
      return;
    }
    rememberName();
    setRoomInUrl(code);
    setRoomId(code);
  };

  const leave = () => {
    // Free the queue slot if we bail out of a quick match before it starts.
    if (quickMatch && roomId) {
      void fetch(apiUrl('/api/matchmaking/cancel'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ roomId }),
      }).catch(() => {});
    }
    setRoomInUrl(null);
    setRoomId(null);
    onExit();
  };

  if (!roomId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-2xl font-bold text-amber-100">🌐 Online hra</h2>
        <label className="flex w-72 flex-col gap-1 text-xs text-slate-400">
          Tvoje meno
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Vyvolávač"
            maxLength={20}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
          />
        </label>
        <button
          onClick={quickPlay}
          disabled={busy}
          className="w-72 rounded-xl bg-amber-700 px-6 py-3 font-semibold text-amber-50 shadow-lg hover:bg-amber-600 disabled:opacity-50"
        >
          ⚡ Rýchla hra (nájdi súpera)
        </button>
        <button
          onClick={createRoom}
          disabled={busy}
          className="w-72 rounded-xl bg-slate-700 px-6 py-3 font-semibold text-slate-100 shadow-lg hover:bg-slate-600 disabled:opacity-50"
        >
          ➕ Vytvoriť miestnosť pre priateľa
        </button>
        <div className="flex w-72 items-center gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="KÓD MIESTNOSTI"
            maxLength={12}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm uppercase tracking-widest text-slate-100 outline-none focus:border-amber-500"
          />
          <button
            onClick={joinRoom}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600"
          >
            Pripojiť sa
          </button>
        </div>
        {toast && <Toast message={toast} />}
      </div>
    );
  }

  return (
    <OnlineMatch
      roomId={roomId}
      playerName={playerName.trim() || 'Vyvolávač'}
      quickMatch={quickMatch}
      onLeave={leave}
    />
  );
}

function OnlineMatch({
  roomId,
  playerName,
  quickMatch,
  onLeave,
}: {
  roomId: string;
  playerName: string;
  quickMatch: boolean;
  onLeave: () => void;
}) {
  const { toast, showToast } = useToast();
  const { status, seat, state, seats, pending, sendAction } = useMultiplayerGame(roomId, playerName, showToast);
  const { diceEvent, shake } = useDiceFeedback(state);
  const [copied, setCopied] = useState(false);

  // Quick match: keep the queue entry alive while waiting. Cancelling is an
  // explicit user action (onLeave) — never effect cleanup, which would fire a
  // spurious cancel on StrictMode's dev double-mount. Closed tabs are handled
  // by the server-side TTL.
  const statusRef = useRef(status);
  statusRef.current = status;
  useEffect(() => {
    if (!quickMatch) return;
    const interval = setInterval(() => {
      if (statusRef.current === 'playing') return;
      void fetch(apiUrl('/api/matchmaking/heartbeat'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ roomId }),
      }).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [quickMatch, roomId]);

  const inviteLink = `${window.location.origin}/?room=${roomId}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('Kopírovanie zlyhalo — skopíruj linku ručne.');
    }
  };

  if (status === 'closed') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-lg text-red-300">Spojenie so serverom sa prerušilo.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-amber-700 px-5 py-2 font-semibold text-amber-50 hover:bg-amber-600"
        >
          Skúsiť znova
        </button>
        <button onClick={onLeave} className="text-xs text-slate-400 hover:text-slate-200">
          ← Späť do menu
        </button>
      </div>
    );
  }

  if (!state || !seat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-slate-400">
          {status === 'connecting'
            ? 'Pripájam sa do miestnosti…'
            : quickMatch
              ? '⚡ Hľadám súpera — hra začne automaticky…'
              : 'Čaká sa na druhého hráča…'}
        </p>
        <p className="text-4xl font-bold tracking-[0.3em] text-amber-200">{roomId}</p>
        <div className="flex w-full max-w-md items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300"
          />
          <button
            onClick={copyLink}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600"
          >
            {copied ? '✓ Skopírované' : 'Kopírovať'}
          </button>
        </div>
        <p className="text-xs text-slate-500">Pošli linku alebo kód súperovi — hra začne, keď sa pripojí.</p>
        <button onClick={onLeave} className="text-xs text-slate-400 hover:text-slate-200">
          ← Späť do menu
        </button>
        {toast && <Toast message={toast} />}
      </div>
    );
  }

  const myTurn = state.active === seat;
  const canAct = myTurn && !pending && !state.winner;
  const foeName = seats[seat === 'p1' ? 'p2' : 'p1'] ?? 'Súper';

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${shake ? 'shake' : ''}`}>
      <div
        className={`flex items-center justify-center gap-2 py-1 text-xs font-semibold ${
          myTurn ? 'bg-amber-900/60 text-amber-100' : 'bg-slate-900/80 text-slate-400'
        }`}
      >
        {pending ? (
          <span className="animate-pulse">⏳ Čakám na server…</span>
        ) : myTurn ? (
          <span>⚔ Si na ťahu!</span>
        ) : (
          <span>🕐 Na ťahu je {foeName}…</span>
        )}
        <span className="text-slate-500">· miestnosť {roomId}</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <Board state={state} dispatch={sendAction} viewpoint={seat} canAct={canAct} />
        <LogPanel state={state} />
      </div>

      {toast && <Toast message={toast} />}
      <GameOverlays diceEvent={diceEvent} />
      {state.winner && (
        <WinnerOverlay name={state.players[state.winner].name} onNewGame={onLeave} newGameLabel="Späť do menu" />
      )}
    </div>
  );
}
