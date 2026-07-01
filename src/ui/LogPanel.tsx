import { useEffect, useRef } from 'react';
import type { GameState, LogEvent } from '../game/types';

function DiceLine({ event }: { event: Extract<LogEvent, { kind: 'dice' }> }) {
  return (
    <div className="rounded bg-slate-800/80 px-2 py-1">
      <span className="text-amber-200">🎲 {event.label}</span>{' '}
      <span className="text-slate-300">
        [{event.rolls.join(', ')}] proti {event.threshold}+ —{' '}
        {event.success ? <span className="text-emerald-400">úspech</span> : <span className="text-red-400">neúspech</span>}
      </span>
    </div>
  );
}

export function LogPanel({ state }: { state: GameState }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.log.length]);

  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-l border-slate-700 bg-slate-950/70 lg:flex">
      <h2 className="border-b border-slate-700 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        Priebeh zápasu
      </h2>
      <div className="flex-1 space-y-1 overflow-y-auto p-2 text-[11px] leading-snug text-slate-300">
        {state.log.map((event) =>
          event.kind === 'dice' ? <DiceLine key={event.id} event={event} /> : <p key={event.id}>{event.text}</p>,
        )}
        <div ref={bottomRef} />
      </div>
    </aside>
  );
}
