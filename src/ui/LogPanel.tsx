import { useEffect, useRef, useState } from 'react';
import type { GameViewState, LogEvent } from '../game/types';
import { diceLabel, renderLogMsg, useLang } from '../i18n';

function DiceLine({ event }: { event: Extract<LogEvent, { kind: 'dice' }> }) {
  const { lang, t } = useLang();
  return (
    <div className="rounded bg-slate-800/80 px-2 py-1">
      <span className="inline-flex items-center gap-1 text-amber-200">
        <img src="/art/icons/icon-dice.svg" alt="" aria-hidden="true" className="h-3.5 w-3.5" />
        {diceLabel(lang, event)}
      </span>{' '}
      <span className="text-slate-300">
        [{event.rolls.join(', ')}] {t('vs_threshold', { t: event.threshold })} —{' '}
        {event.success ? (
          <span className="text-emerald-400">{t('roll_success')}</span>
        ) : (
          <span className="text-red-400">{t('roll_failure')}</span>
        )}
      </span>
    </div>
  );
}

/** Open by default on desktop (side panel), closed on phones (bottom sheet). */
export function useLogPanelState() {
  return useState(() => window.matchMedia('(min-width: 1024px)').matches);
}

/**
 * Right-side match log. Collapsible into a slim tab so the board can use the
 * freed width. On phones the closed log has no floating button (it covered
 * hand cards) — Board shows the opener in the player bar instead.
 */
export function LogPanel({
  state,
  open,
  onOpenChange: setOpen,
}: {
  state: GameViewState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lang, t } = useLang();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [state.log.length]);
  const latest = [...state.log].reverse().find((event) => event.kind !== 'attack');
  const latestText =
    latest?.kind === 'dice'
      ? `${diceLabel(lang, latest)}: ${latest.rolls.join(', ')}`
      : latest?.kind === 'msg'
        ? renderLogMsg(lang, latest)
        : '';

  if (!open) {
    return (
      <>
        <span className="sr-only" aria-live="polite" aria-atomic="true">{latestText}</span>
        <button
          onClick={() => setOpen(true)}
          title={t('log_show')}
          aria-label={t('log_show')}
          className="hidden w-7 shrink-0 flex-col items-center justify-center border-l border-slate-700 bg-slate-950/95 text-slate-200 hover:bg-slate-900 lg:flex"
        >
          <span aria-hidden="true" className="icon-mask icon-mask--chevron-left h-3 w-3 bg-current" />
        </button>
      </>
    );
  }

  return (
    <aside
      aria-label={t('log_title')}
      className="fixed inset-x-2 bottom-2 z-20 flex max-h-[45dvh] flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-950/95 shadow-2xl lg:static lg:inset-auto lg:z-auto lg:max-h-none lg:w-72 lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:bg-slate-950/70 lg:shadow-none"
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('log_title')}</h2>
        <button
          onClick={() => setOpen(false)}
          title={t('log_hide')}
          aria-label={t('log_hide')}
          className="text-slate-500 hover:text-slate-300"
        >
          <span aria-hidden="true" className="icon-mask icon-mask--chevron-right h-3 w-3 bg-current" />
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3 text-sm leading-snug text-slate-200 lg:p-2 lg:text-xs">
        {state.log.map((event) => {
          if (event.kind === 'attack') return null; // visual-only event
          return event.kind === 'dice' ? (
            <DiceLine key={event.id} event={event} />
          ) : (
            <p key={event.id}>{renderLogMsg(lang, event)}</p>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </aside>
  );
}
