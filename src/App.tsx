import { useCallback, useRef, useState } from 'react';
import { applyAction, createGame } from './game/engine';
import type { Action, GameState, LogEvent } from './game/types';
import { Board } from './ui/Board';
import { DiceOverlay } from './ui/DiceOverlay';
import { LogPanel } from './ui/LogPanel';

type DiceEvent = Extract<LogEvent, { kind: 'dice' }>;

/**
 * Pantheon: Dice of Destiny — Fáza 1: local Pass & Play.
 * Math.random is the RNG for now; in Fáza 2 the Durable Object owns it.
 */
export default function App() {
  const [state, setState] = useState<GameState>(() => createGame(Math.random));
  const [error, setError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState(false);
  const [diceEvent, setDiceEvent] = useState<DiceEvent | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout>>();
  const diceTimer = useRef<ReturnType<typeof setTimeout>>();

  const dispatch = useCallback(
    (action: Action): boolean => {
      try {
        const next = applyAction(state, action, Math.random);
        setState(next);
        if (action.type === 'END_TURN' && !next.winner) setHandoff(true);

        // Surface freshly rolled dice as a short overlay (GDD §6).
        const newDice = next.log.filter(
          (e): e is DiceEvent => e.kind === 'dice' && !state.log.some((old) => old.id === e.id),
        );
        if (newDice.length > 0) {
          const shown = newDice[newDice.length - 1];
          setDiceEvent(shown);
          clearTimeout(diceTimer.current);
          diceTimer.current = setTimeout(() => setDiceEvent(null), shown.rolls.length > 2 ? 2600 : 1800);
        }
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        clearTimeout(errorTimer.current);
        errorTimer.current = setTimeout(() => setError(null), 2500);
        return false;
      }
    },
    [state],
  );

  const newGame = () => {
    setState(createGame(Math.random));
    setHandoff(false);
    setDiceEvent(null);
  };

  const shake = diceEvent?.rolls.includes(6) ?? false;

  return (
    <div className={`flex h-screen flex-col text-slate-100 ${shake ? 'shake' : ''}`}>
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-1.5">
        <h1 className="text-sm font-bold tracking-wide text-amber-200">
          ⚄ Pantheon: Dice of Destiny <span className="font-normal text-slate-500">— Pass &amp; Play (Fáza 1)</span>
        </h1>
        <button onClick={newGame} className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700">
          Nová hra
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <Board state={state} dispatch={dispatch} />
        <LogPanel state={state} />
      </div>

      {error && (
        <div className="fixed left-1/2 top-14 z-50 -translate-x-1/2 rounded-lg border border-red-700 bg-red-950/95 px-4 py-2 text-sm text-red-100 shadow-xl">
          {error}
        </div>
      )}

      {diceEvent && <DiceOverlay event={diceEvent} />}

      {handoff && !state.winner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
          <p className="text-4xl">🔄</p>
          <p className="mt-3 text-lg text-slate-200">
            Odovzdajte zariadenie — na ťahu je{' '}
            <span className="font-bold text-amber-200">{state.players[state.active].name}</span>.
          </p>
          <button
            onClick={() => setHandoff(false)}
            className="mt-6 rounded-lg bg-amber-700 px-6 py-2 font-semibold text-amber-50 hover:bg-amber-600"
          >
            Som pripravený ▶
          </button>
        </div>
      )}

      {state.winner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
          <p className="text-6xl">🏆</p>
          <p className="mt-4 text-2xl font-bold text-amber-200">{state.players[state.winner].name} víťazí!</p>
          <p className="mt-1 text-sm text-slate-400">Nexus súpera padol.</p>
          <button
            onClick={newGame}
            className="mt-6 rounded-lg bg-amber-700 px-6 py-2 font-semibold text-amber-50 hover:bg-amber-600"
          >
            Nová hra
          </button>
        </div>
      )}
    </div>
  );
}
