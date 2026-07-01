import { getUnitCard } from '../game/cards';
import type { UnitState } from '../game/types';

export type SlotHighlight = 'none' | 'place' | 'attack' | 'move' | 'selected';

const HIGHLIGHT_RING: Record<SlotHighlight, string> = {
  none: '',
  place: 'ring-2 ring-emerald-400 cursor-pointer',
  attack: 'ring-2 ring-red-500 cursor-pointer',
  move: 'ring-2 ring-sky-400 cursor-pointer',
  selected: 'ring-2 ring-yellow-300',
};

interface Props {
  unit: UnitState | null;
  highlight: SlotHighlight;
  dimmed?: boolean;
  onClick?: () => void;
}

/** One stone slot in a lane, empty or holding a unit. */
export function UnitSlot({ unit, highlight, dimmed = false, onClick }: Props) {
  const card = unit ? getUnitCard(unit.cardId) : null;
  return (
    <div
      onClick={onClick}
      className={`relative flex h-24 w-20 flex-col items-center justify-center rounded-lg border transition ${
        unit ? 'border-slate-500 bg-slate-800/90' : 'border-slate-700 bg-slate-900/60'
      } ${HIGHLIGHT_RING[highlight]} ${dimmed ? 'opacity-60' : ''}`}
    >
      {unit && card && (
        <>
          <span className="text-3xl leading-none drop-shadow" title={card.text}>
            {card.glyph}
          </span>
          <span className="mt-0.5 max-w-full truncate px-1 text-[9px] text-slate-300">{card.name}</span>
          <div className="flex gap-1 text-[10px] font-bold">
            <span className="text-orange-300">⚔{card.attack}</span>
            {unit.armor > 0 && <span className="text-slate-300">🛡{unit.armor}</span>}
            <span className="text-red-400">🩸{unit.hp}</span>
          </div>
          {unit.burn > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-900 px-1 text-[9px]">🔥{unit.burn}</span>
          )}
          {unit.ready && <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow" />}
        </>
      )}
    </div>
  );
}
