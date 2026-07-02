import { AnimatePresence, motion } from 'framer-motion';
import { getUnitCard } from '../game/cards';
import type { Faction, UnitState } from '../game/types';
import { CardArt } from './CardArt';
import type { SlotFx } from './useCombatFx';

export type SlotHighlight = 'none' | 'place' | 'attack' | 'move' | 'selected';

const HIGHLIGHT_RING: Record<SlotHighlight, string> = {
  none: '',
  place: 'ring-2 ring-emerald-400 cursor-pointer',
  attack: 'ring-2 ring-red-500 cursor-pointer',
  move: 'ring-2 ring-sky-400 cursor-pointer',
  selected: 'ring-2 ring-yellow-300',
};

const FACTION_FRAME: Record<Faction, string> = {
  lava: 'border-red-800/90',
  nature: 'border-emerald-800/90',
  celestial: 'border-sky-800/90',
};

interface Props {
  unit: UnitState | null;
  highlight: SlotHighlight;
  /** Enemy units lunge downward (toward the viewer's side). */
  enemySide?: boolean;
  fx?: SlotFx;
  onClick?: () => void;
}

/** One recessed stone slot in a lane — empty, or holding an animated unit. */
export function UnitSlot({ unit, highlight, enemySide = false, fx, onClick }: Props) {
  const card = unit ? getUnitCard(unit.cardId) : null;
  const fxClasses = [
    fx?.lunge ? (enemySide ? 'animate-lunge-down' : 'animate-lunge-up') : '',
    fx?.hit ? 'animate-hit' : '',
  ].join(' ');

  return (
    <div
      onClick={onClick}
      className={`relative h-24 w-20 rounded-lg border border-slate-700/80 bg-slate-950/70 shadow-[inset_0_2px_10px_rgba(0,0,0,0.75)] transition ${HIGHLIGHT_RING[highlight]}`}
    >
      <AnimatePresence>
        {unit && card && (
          <motion.div
            key={unit.uid}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 10 }}
            transition={{ duration: 0.22 }}
            title={card.text}
            className={`absolute inset-0 overflow-hidden rounded-lg border-2 bg-slate-800 ${FACTION_FRAME[card.faction]} ${fxClasses}`}
          >
            <CardArt cardId={card.id} className="absolute inset-0 h-full w-full" glyphClass="text-3xl" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-1 pb-0.5 pt-3 text-center">
              <p className="truncate text-[9px] leading-tight text-slate-200">{card.name}</p>
              <div className="flex justify-center gap-1 text-[10px] font-bold">
                <span className="text-orange-300">⚔{card.attack}</span>
                {unit.armor > 0 && <span className="text-slate-300">🛡{unit.armor}</span>}
                <span className="text-red-400">🩸{unit.hp}</span>
              </div>
            </div>
            {unit.burn > 0 && (
              <span className="absolute right-0.5 top-0.5 rounded-full bg-red-900/90 px-1 text-[9px]">🔥{unit.burn}</span>
            )}
            {unit.ready && <span className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow" />}
          </motion.div>
        )}
      </AnimatePresence>

      {fx?.popup && (
        <span
          className={`animate-popup pointer-events-none absolute inset-x-0 top-1 z-10 text-center text-xl font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
            fx.popup.kind === 'damage' ? 'text-red-400' : 'text-emerald-300'
          }`}
        >
          {fx.popup.kind === 'damage' ? `−${fx.popup.amount}` : `+${fx.popup.amount}`}
        </span>
      )}
    </div>
  );
}
