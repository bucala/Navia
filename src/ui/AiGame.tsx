import { useCallback, useEffect, useState } from 'react';
import { chooseAiAction } from '../game/ai';
import { applyAction, createGame } from '../game/engine';
import type { Action, GameState } from '../game/types';
import { errorText, useLang } from '../i18n';
import { Board } from './Board';
import { GameOverlays, Toast, useDiceFeedback, useToast, WinnerOverlay } from './feedback';
import { LogPanel } from './LogPanel';

/** Single player vs the Arena Spirit (Duch Arény). */
export function AiGame() {
  const { lang, t } = useLang();
  const makeGame = useCallback(
    () => createGame(Math.random, [localStorage.getItem('pantheon-name') || t('you'), t('ai_name')]),
    [t],
  );
  const [state, setState] = useState<GameState>(makeGame);
  const { toast, showToast } = useToast();
  const { diceEvent, shake } = useDiceFeedback(state);

  const myTurn = state.active === 'p1';

  const dispatch = useCallback(
    (action: Action): boolean => {
      try {
        setState(applyAction(state, action, Math.random));
        return true;
      } catch (e) {
        showToast(errorText(lang, e instanceof Error ? e.message : String(e)));
        return false;
      }
    },
    [state, showToast, lang],
  );

  // The Arena Spirit plays one action per beat, so its moves are watchable.
  useEffect(() => {
    if (state.active !== 'p2' || state.winner) return;
    const timer = setTimeout(() => {
      setState((current) => {
        if (current.active !== 'p2' || current.winner) return current;
        try {
          return applyAction(current, chooseAiAction(current, 'p2'), Math.random);
        } catch {
          return applyAction(current, { type: 'END_TURN', player: 'p2' }, Math.random);
        }
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${shake ? 'shake' : ''}`}>
      {!myTurn && !state.winner && (
        <div className="flex items-center justify-center bg-slate-900/80 py-1 text-xs font-semibold text-slate-400">
          <span className="animate-pulse">🔮 {t('ai_thinking')}</span>
        </div>
      )}
      <div className="flex min-h-0 flex-1 overflow-y-auto">
        <Board state={state} dispatch={dispatch} viewpoint="p1" canAct={myTurn && !state.winner} />
        <LogPanel state={state} />
      </div>

      {toast && <Toast message={toast} />}
      <GameOverlays diceEvent={diceEvent} />
      {state.winner && <WinnerOverlay name={state.players[state.winner].name} onNewGame={() => setState(makeGame())} />}
    </div>
  );
}
