import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, LogEvent } from '../game/types';
import { useLang } from '../i18n';
import { DiceOverlay } from './DiceOverlay';
import { sfxDiceRoll, sfxFail, sfxSuccess } from './sfx';

export type DiceEvent = Extract<LogEvent, { kind: 'dice' }>;

/**
 * Watches the game log and surfaces freshly rolled dice as a short overlay
 * (GDD §6). Works for both local and server-driven state updates.
 */
export function useDiceFeedback(state: GameState | null) {
  const [diceEvent, setDiceEvent] = useState<DiceEvent | null>(null);
  const lastLogId = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!state) return;
    const latestId = state.log.length ? state.log[state.log.length - 1].id : 0;
    if (lastLogId.current === null) {
      // First state after (re)join — don't replay historic rolls.
      lastLogId.current = latestId;
      return;
    }
    const seen = lastLogId.current;
    lastLogId.current = Math.max(seen, latestId);
    const fresh = state.log.filter((e): e is DiceEvent => e.kind === 'dice' && e.id > seen);
    if (fresh.length > 0) {
      const shown = fresh[fresh.length - 1];
      setDiceEvent(shown);
      sfxDiceRoll();
      const settle = 1150 + (shown.rolls.length - 1) * 160;
      setTimeout(() => (shown.success ? sfxSuccess() : sfxFail()), settle);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDiceEvent(null), Math.min(4200, settle + 1100));
    }
  }, [state]);

  const shake = diceEvent?.rolls.includes(6) ?? false;
  return { diceEvent, shake };
}

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const showToast = useCallback((message: string) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, showToast };
}

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed left-1/2 top-14 z-50 -translate-x-1/2 rounded-lg border border-red-700 bg-red-950/95 px-4 py-2 text-sm text-red-100 shadow-xl">
      {message}
    </div>
  );
}

export function GameOverlays({ diceEvent }: { diceEvent: DiceEvent | null }) {
  return diceEvent ? <DiceOverlay event={diceEvent} /> : null;
}

export function WinnerOverlay({ name, onNewGame, backToMenu = false }: {
  name: string;
  onNewGame: () => void;
  /** True when the button leads back to the menu instead of a rematch. */
  backToMenu?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      <p className="text-6xl">🏆</p>
      <p className="mt-4 text-2xl font-bold text-amber-200">{t('winner_title', { player: name })}</p>
      <p className="mt-1 text-sm text-slate-400">{t('winner_sub')}</p>
      <button
        onClick={onNewGame}
        className="mt-6 rounded-lg bg-amber-700 px-6 py-2 font-semibold text-amber-50 hover:bg-amber-600"
      >
        {t(backToMenu ? 'back_to_menu_win' : 'new_game')}
      </button>
    </div>
  );
}
