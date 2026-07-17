import { useEffect, useRef, useState } from 'react';
import type { GameState, LogEvent } from '../game/types';
import { diceLabel, renderLogMsg, useLang } from '../i18n';

function DiceLine({ event }: { event: Extract<LogEvent, { kind: 'dice' }> }) {
  const { lang, t } = useLang();
  return (
    <div className="rounded bg-slate-800/80 px-2 py-1">
      <span className="text-amber-200">🎲 {diceLabel(lang, event)}</span>{' '}
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

/** Right-side match log. Collapsible into a slim tab so the board can use the freed width. */
export function LogPanel({ state }: { state: GameState }) {
  const { lang, t } = useLang();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.log.length]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title={t('log_show')}
        className="hidden w-6 shrink-0 flex-col items-center justify-center gap-1 border-l border-slate-700 bg-slate-950/70 text-slate-500 hover:bg-slate-900 hover:text-slate-300 lg:flex"
      >
        <span aria-hidden="true">❮</span>
      </button>
    );
  }

  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-l border-slate-700 bg-slate-950/70 lg:flex">
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('log_title')}</h2>
        <button
          onClick={() => setOpen(false)}
          title={t('log_hide')}
          className="text-slate-500 hover:text-slate-300"
        >
          ❯
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2 text-[11px] leading-snug text-slate-300">
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
