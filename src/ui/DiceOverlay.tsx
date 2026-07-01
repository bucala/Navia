import type { LogEvent } from '../game/types';
import { Die } from './Die';

/** Full-screen dice roll presentation for the latest dice log event. */
export function DiceOverlay({ event }: { event: Extract<LogEvent, { kind: 'dice' }> }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/50">
      <p className="mb-3 text-lg font-semibold text-amber-100 drop-shadow">{event.label}</p>
      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {event.rolls.map((roll, i) => (
          <Die key={i} value={roll} animate dim={event.rolls.length > 1 && roll !== event.kept && event.rolls.length === 2} />
        ))}
      </div>
      <p className={`mt-4 text-xl font-bold ${event.success ? 'text-emerald-400' : 'text-red-400'}`}>
        {event.success ? `Úspech! (${event.threshold}+)` : `Neúspech (${event.threshold}+)`}
      </p>
    </div>
  );
}
