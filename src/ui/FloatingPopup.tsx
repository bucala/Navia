import type { Popup } from './useCombatFx';

/** Floating −damage/+heal number over a unit or Nexus. */
export function FloatingPopup({ popup, className = '' }: { popup?: Popup; className?: string }) {
  if (!popup) return null;
  return (
    <span
      className={`animate-popup pointer-events-none absolute inset-x-0 z-10 text-center text-xl font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
        popup.kind === 'damage' ? 'text-red-400' : 'text-emerald-300'
      } ${className}`}
    >
      {popup.kind === 'damage' ? `−${popup.amount}` : `+${popup.amount}`}
    </span>
  );
}
