import { AnimatePresence, motion } from 'framer-motion';
import { getUnitCard } from '../game/cards';
import type { Faction, UnitState } from '../game/types';
import { useLang } from '../i18n';
import { CardArt } from './CardArt';
import { ArmorIcon, AttackIcon, BurnIcon, HpIcon } from './icons';
import { FloatingPopup } from './FloatingPopup';
import type { SlotFx } from './useCombatFx';

export type SlotHighlight = 'none' | 'place' | 'attack' | 'move' | 'selected';

const HIGHLIGHT_RING: Record<SlotHighlight, string> = {
  none: '',
  place: 'shadow-[0_0_15px_rgba(52,211,153,0.85)] border border-emerald-400 cursor-pointer scale-[1.02] transition-all duration-200',
  attack: 'shadow-[0_0_18px_rgba(239,68,68,0.9)] border border-red-500 cursor-pointer animate-pulse',
  move: 'shadow-[0_0_15px_rgba(56,189,248,0.85)] border border-sky-400 cursor-pointer scale-[1.02] transition-all duration-200',
  selected: 'shadow-[0_0_20px_rgba(251,191,36,0.95)] border-2 border-yellow-300 scale-105 z-10',
};

const FACTION_BG: Record<Faction, string> = {
  lava: 'from-red-950 to-orange-900',
  nature: 'from-emerald-950 to-green-900',
  celestial: 'from-sky-950 to-indigo-900',
};

interface Props {
  unit: UnitState | null;
  highlight: SlotHighlight;
  /** Enemy units lunge downward (toward the viewer's side). */
  enemySide?: boolean;
  fx?: SlotFx;
  onClick?: () => void;
  interactive?: boolean;
}

/** One recessed stone slot in a lane — empty, or holding an animated unit. */
export function UnitSlot({ unit, highlight, enemySide = false, fx, onClick, interactive = false }: Props) {
  const { lx, t } = useLang();
  const card = unit ? getUnitCard(unit.cardId) : null;
  const fxClasses = [
    fx?.lunge ? (enemySide ? 'animate-lunge-down' : 'animate-lunge-up') : '',
    fx?.hit ? 'animate-hit' : '',
  ].join(' ');

  const description =
    unit && card
      ? t('a11y_unit_slot', {
          name: lx(card.name),
          attack: card.attack,
          hp: unit.hp,
          armor: unit.armor,
        })
      : t('a11y_empty_slot');
  const action =
    highlight === 'place'
      ? t('a11y_place_here')
      : highlight === 'attack'
        ? t('a11y_attack_here')
        : highlight === 'move'
          ? t('a11y_move_here')
          : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-label={action ? `${description}. ${action}` : description}
      aria-pressed={highlight === 'selected'}
      className={`slot-alcove relative h-full min-h-0 min-w-0 aspect-[4/5] w-auto max-w-[4rem] flex-none rounded-lg bg-slate-950/70 shadow-[inset_0_2px_10px_rgba(0,0,0,0.75)] transition sm:max-w-[5rem] md:max-w-[5.75rem] lg:max-w-[7rem] ${HIGHLIGHT_RING[highlight]}`}
    >
      <AnimatePresence>
        {unit && card && (
          <motion.div
            key={unit.uid}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 10 }}
            transition={{ duration: 0.22 }}
            title={lx(card.text)}
            className={`slot-frame slot-frame--${card.rarity} absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-b ${FACTION_BG[card.faction]} ${fxClasses}`}
          >
            <CardArt cardId={card.id} className="absolute inset-0 h-full w-full" glyphClass="text-3xl" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-1 pb-0.5 pt-3 text-center">
              <p className="truncate text-[10px] leading-tight text-slate-100">{lx(card.name)}</p>
              <div className="flex justify-center gap-1 text-[11px] font-bold">
                <span className="flex items-center gap-0.5 text-orange-300"><AttackIcon className="h-2.5 w-2.5" />{card.attack}</span>
                {unit.armor > 0 && <span className="flex items-center gap-0.5 text-slate-300"><ArmorIcon className="h-2.5 w-2.5" />{unit.armor}</span>}
                <span className="flex items-center gap-0.5 text-red-400"><HpIcon className="h-2.5 w-2.5" />{unit.hp}</span>
              </div>
            </div>
            {unit.burn > 0 && (
              <span className="absolute right-0.5 top-0.5 flex items-center gap-0.5 rounded-full bg-red-900/90 px-1 text-[9px]"><BurnIcon className="h-2.5 w-2.5" />{unit.burn}</span>
            )}
            {unit.ready && (
              <span className="absolute left-1.5 top-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#34d399]"></span>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingPopup popup={fx?.popup} className="top-1" />
    </button>
  );
}
