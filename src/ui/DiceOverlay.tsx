import type { LogEvent } from '../game/types';
import { diceLabel, useLang } from '../i18n';
import { Die3D } from './Die';

/** Full-screen 3D dice presentation for the latest dice log event. */
export function DiceOverlay({ event }: { event: Extract<LogEvent, { kind: 'dice' }> }) {
  const { lang, t } = useLang();
  const isAdvantagePair = event.rolls.length === 2;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/50">
      <p className="mb-5 text-lg font-semibold text-amber-100 drop-shadow">{diceLabel(lang, event)}</p>
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
        {event.success ? t('dice_success', { t: event.threshold }) : t('dice_failure', { t: event.threshold })}
      </p>
    </div>
  );
}
