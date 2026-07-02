import type { LogEvent } from '../game/types';
import { Die3D } from './Die';

/** Full-screen 3D dice presentation for the latest dice log event. */
export function DiceOverlay({ event }: { event: Extract<LogEvent, { kind: 'dice' }> }) {
  const isAdvantagePair = event.rolls.length === 2;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/50">
      <p className="mb-5 text-lg font-semibold text-amber-100 drop-shadow">{event.label}</p>
      <div className="flex max-w-lg flex-wrap justify-center gap-3">
        {event.rolls.map((roll, i) => (
          <Die3D
            key={i}
            value={roll}
            delay={i * 0.16}
            dim={isAdvantagePair && roll !== event.kept}
          />
        ))}
      </div>
      <p className={`dice-result mt-6 text-xl font-bold ${event.success ? 'text-emerald-400' : 'text-red-400'}`}>
        {event.success ? `Úspech! (${event.threshold}+)` : `Neúspech (${event.threshold}+)`}
      </p>
    </div>
  );
}
