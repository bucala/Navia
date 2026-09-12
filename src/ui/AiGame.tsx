import { useCallback, useEffect, useState } from 'react';
import { chooseAiAction } from '../game/ai';
import { applyAction, createGame } from '../game/engine';
import type { Action, GameState } from '../game/types';
import { errorText, useLang } from '../i18n';
import { getPlayerName } from '../net/profile';
import { Board } from './Board';
import {
  GameOverlays,
  GameStatusOverlay,
  Toast,
  useDiceFeedback,
  useToast,
  WinnerOverlay,
} from './feedback';
import { LogPanel } from './LogPanel';

/** Single player vs the Arena Spirit (Duch Arény). */
export function AiGame() {
  const { lang, t } = useLang();
  const makeGame = useCallback(
    () => createGame(Math.random, [getPlayerName() || t('you'), t('ai_name')]),
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
    <div className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${shake ? 'shake' : ''}`}>
      {!myTurn && !state.winner && (
        <GameStatusOverlay
          announcement={t('ai_thinking')}
          className="border-slate-700 bg-slate-950/90 text-slate-300"
        >
          <img
            src="/art/icons/icon-crystal-ball.svg"
            alt=""
            aria-hidden="true"
            className="h-4 w-4 animate-pulse"
          />
          <span className="animate-pulse">{t('ai_thinking')}</span>
        </GameStatusOverlay>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Board state={state} dispatch={dispatch} viewpoint="p1" canAct={myTurn && !state.winner} />
        <LogPanel state={state} />
      </div>

      {toast && <Toast message={toast} />}
      <GameOverlays diceEvent={diceEvent} />
      {state.winner && <WinnerOverlay name={state.players[state.winner].name} onNewGame={() => setState(makeGame())} />}
    </div>
  );
}
