import { useCallback, useState } from 'react';
import { applyAction, createGame } from '../game/engine';
import type { Action, GameState } from '../game/types';
import { errorText, useLang } from '../i18n';
import { Board } from './Board';
import { GameOverlays, Toast, useDiceFeedback, useToast, WinnerOverlay } from './feedback';
import { LogPanel } from './LogPanel';

/** Hot-seat Pass & Play — two players on one device. */
export function LocalGame() {
  const { lang, t } = useLang();
  const [state, setState] = useState<GameState>(() =>
    createGame(Math.random, [`${t('you')} 1`, `${t('you')} 2`]),
  );
  const [handoff, setHandoff] = useState(false);
  const { toast, showToast } = useToast();
  const { diceEvent, shake } = useDiceFeedback(state);

  const dispatch = useCallback(
    (action: Action): boolean => {
      try {
        const next = applyAction(state, action, Math.random);
        setState(next);
        if (action.type === 'END_TURN' && !next.winner) setHandoff(true);
        return true;
      } catch (e) {
        showToast(errorText(lang, e instanceof Error ? e.message : String(e)));
        return false;
      }
    },
    [state, showToast, lang],
  );

  const newGame = () => {
    setState(createGame(Math.random, [`${t('you')} 1`, `${t('you')} 2`]));
    setHandoff(false);
  };

  return (
    <div className={`flex min-h-0 flex-1 overflow-y-auto ${shake ? 'shake' : ''}`}>
      <Board state={state} dispatch={dispatch} viewpoint={state.active} canAct />
      <LogPanel state={state} />

      {toast && <Toast message={toast} />}
      <GameOverlays diceEvent={diceEvent} />

      {handoff && !state.winner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
          <p className="text-4xl">🔄</p>
          <p className="mt-3 text-lg text-slate-200">
            {t('handoff_pass')}{' '}
            <span className="font-bold text-amber-200">{state.players[state.active].name}</span>.
          </p>
          <button
            onClick={() => setHandoff(false)}
            className="mt-6 rounded-lg bg-amber-700 px-6 py-2 font-semibold text-amber-50 hover:bg-amber-600"
          >
            {t('handoff_ready')}
          </button>
        </div>
      )}

      {state.winner && <WinnerOverlay name={state.players[state.winner].name} onNewGame={newGame} />}
    </div>
  );
}
