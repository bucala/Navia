import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { opponentOf } from '../game/engine';
import type { GameViewState, LogEvent, PlayerId } from '../game/types';
import { useLang } from '../i18n';
import type { StringKey } from '../i18n/strings';
import { DiceOverlay } from './DiceOverlay';
import { sfxDefeat, sfxDiceRoll, sfxFail, sfxSuccess, sfxVictory } from './sfx';
import type { MatchStats, PlayerStats } from './useMatchStats';

export type DiceEvent = Extract<LogEvent, { kind: 'dice' }>;

/**
 * Watches the game log and surfaces freshly rolled dice as a short overlay
 * (GDD §6). Works for both local and server-driven state updates.
 */
export function useDiceFeedback(state: GameViewState | null) {
  const [diceEvent, setDiceEvent] = useState<DiceEvent | null>(null);
  const lastLogId = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const settleTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!state) return;
    const latestId = state.log.length ? state.log[state.log.length - 1].id : 0;
    if (lastLogId.current === null) {
      // First state after (re)join — don't replay historic rolls.
      lastLogId.current = latestId;
      return;
    }
    const seen = lastLogId.current;
    // A new local/AI game starts its log ids from one while this hook remains
    // mounted. Reset the cursor instead of suppressing all new dice events.
    if (latestId < seen) {
      lastLogId.current = latestId;
      setDiceEvent(null);
      return;
    }
    lastLogId.current = latestId;
    const fresh = state.log.filter((e): e is DiceEvent => e.kind === 'dice' && e.id > seen);
    if (fresh.length > 0) {
      const shown = fresh[fresh.length - 1];
      setDiceEvent(shown);
      sfxDiceRoll();
      const settle = 1150 + (shown.rolls.length - 1) * 160;
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => (shown.success ? sfxSuccess() : sfxFail()), settle);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDiceEvent(null), Math.min(4200, settle + 1100));
    }
  }, [state]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(settleTimer.current);
    },
    [],
  );

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
  useEffect(() => () => clearTimeout(timer.current), []);
  return { toast, showToast };
}

export function Toast({ message }: { message: string }) {
  return (
    <div role="alert" aria-live="assertive" className="fixed left-1/2 top-14 z-50 -translate-x-1/2 rounded-lg border border-red-700 bg-red-950/95 px-4 py-2 text-sm text-red-100 shadow-xl">
      {message}
    </div>
  );
}

/** Compact match status that floats over the arena instead of resizing it. */
export function GameStatusOverlay({
  children,
  className = '',
  announcement,
}: {
  children: ReactNode;
  className?: string;
  announcement?: ReactNode;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-10 z-30 flex min-w-0 justify-center px-2">
      {announcement && (
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      )}
      <div className={`flex min-w-0 max-w-full items-center justify-center gap-2 overflow-hidden rounded-full border px-3 py-1 text-xs font-semibold shadow-xl backdrop-blur-md ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function GameOverlays({ diceEvent }: { diceEvent: DiceEvent | null }) {
  return diceEvent ? <DiceOverlay event={diceEvent} /> : null;
}

/** Embers rising behind the victory banner: [left %, delay s, duration s, size px]. */
const VICTORY_EMBERS: [number, number, number, number][] = [
  [8, 0, 3.2, 6], [18, 1.2, 2.8, 4], [30, 0.5, 3.6, 7], [42, 2, 3, 5], [55, 0.2, 3.4, 6],
  [66, 1.6, 2.9, 4], [77, 0.8, 3.8, 7], [88, 2.4, 3.1, 5], [24, 2.8, 3.3, 4], [72, 3.1, 3.5, 6],
];

/** Why the match ended, phrased for the seat looking at the screen. */
function resultReason(state: GameViewState, viewpoint: PlayerId | null): { key: StringKey; player?: string } {
  const winner = state.winner!;
  const loser = opponentOf(winner);
  const recent = state.log.slice(-6);
  if (recent.some((e) => e.kind === 'msg' && e.msgKey === 'timeoutForfeit')) return { key: 'result_sub_forfeit' };
  if (state.players[loser].nexusHp > 0) return { key: 'result_sub_turn_limit' };
  if (viewpoint === loser) return { key: 'result_sub_nexus_lost' };
  if (viewpoint === winner) return { key: 'winner_sub' };
  return { key: 'result_sub_nexus_fell', player: state.players[loser].name };
}

export function WinnerOverlay({ state, viewpoint, stats, onNewGame, backToMenu = false }: {
  state: GameViewState;
  /** The seat this screen belongs to; null on a shared hot-seat device. */
  viewpoint: PlayerId | null;
  stats: MatchStats;
  onNewGame: () => void;
  /** True when the button leads back to the menu instead of a rematch. */
  backToMenu?: boolean;
}) {
  const { t } = useLang();
  const winner = state.winner!;
  const outcome = viewpoint === null ? 'neutral' : viewpoint === winner ? 'win' : 'loss';
  const reason = resultReason(state, viewpoint);
  // Your seat on the left; on a shared device the winner goes first.
  const left = viewpoint ?? winner;
  const right = opponentOf(left);

  useEffect(() => {
    if (outcome === 'loss') sfxDefeat();
    else sfxVictory();
  }, [outcome]);

  const rows: [StringKey, keyof PlayerStats][] = [
    ['stat_nexus_damage', 'nexusDamage'],
    ['stat_summons', 'summons'],
    ['stat_kills', 'kills'],
    ['stat_spells', 'spells'],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
    >
      {outcome !== 'loss' && (
        <span aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          {VICTORY_EMBERS.map(([left, delay, duration, size], i) => (
            <span
              key={i}
              className="menu-ember"
              style={{ left: `${left}%`, width: size, height: size, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
            />
          ))}
        </span>
      )}
      <div className={`result-panel menu-panel flex w-full max-w-md flex-col items-center px-6 py-7 text-center ${outcome === 'loss' ? 'result-panel--loss' : ''}`}>
        <img
          src="/art/icons/icon-trophy.svg"
          alt=""
          aria-hidden="true"
          className={`h-16 w-16 drop-shadow-lg ${outcome === 'loss' ? 'opacity-40 grayscale' : 'result-trophy'}`}
        />
        <p
          id="winner-title"
          className={`mt-3 text-3xl font-extrabold tracking-wide ${outcome === 'loss' ? 'text-slate-300' : 'result-title text-amber-100'}`}
        >
          {outcome === 'win' ? t('result_victory') : outcome === 'loss' ? t('result_defeat') : t('winner_title', { player: state.players[winner].name })}
        </p>
        <p className="mt-1 text-sm text-slate-400">{t(reason.key, reason.player ? { player: reason.player } : {})}</p>

        <img src="/art/frames/ornament-divider.svg" alt="" aria-hidden="true" className="mt-4 h-3 w-36" />
        <table className="mt-3 w-full text-sm">
          <caption className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-amber-200/80">{t('stats_title')}</caption>
          <thead>
            <tr className="text-xs text-slate-400">
              <th className="w-1/2" />
              <th className="truncate px-1 pb-1 font-semibold text-amber-100">{state.players[left].name}</th>
              <th className="truncate px-1 pb-1 font-semibold text-slate-300">{state.players[right].name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, key]) => (
              <tr key={key} className="border-t border-amber-900/30">
                <th scope="row" className="py-1.5 text-left font-normal text-slate-400">{t(label)}</th>
                <td className="py-1.5 font-bold text-amber-100">{stats[left][key]}</td>
                <td className="py-1.5 font-bold text-slate-300">{stats[right][key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500">{t('stat_turns', { n: state.turn })}</p>

        <button autoFocus onClick={onNewGame} className="navia-btn mt-5 px-6 py-2">
          {t(backToMenu ? 'back_to_menu_win' : 'new_game')}
        </button>
      </div>
    </div>
  );
}
