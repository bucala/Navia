import { getCard } from '../game/cards';
import type { Faction } from '../game/types';
import { useLang } from '../i18n';
import { CardArt } from './CardArt';
import { ArmorIcon, AttackIcon, HpIcon } from './icons';

const FACTION_BG: Record<Faction, string> = {
  lava: 'from-red-950 to-orange-950',
  nature: 'from-emerald-950 to-green-950',
  celestial: 'from-sky-950 to-indigo-950',
};

interface Props {
  cardId: string;
  selected?: boolean;
  affordable?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

/** A card in hand — full-bleed art on top, name banner, rules text and stats. */
export function CardFace({ cardId, selected = false, affordable = true, onClick, interactive = true }: Props) {
  const { lx, t } = useLang();
  const card = getCard(cardId);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      aria-pressed={selected}
      aria-label={`${lx(card.name)}. ${t('a11y_card_cost', { n: card.cost })}. ${lx(card.text)}`}
      title={lx(card.text)}
      className={`card-frame card-frame--${card.rarity} relative flex h-full min-h-16 max-w-48 aspect-[5/7] shrink-0 origin-bottom flex-col overflow-hidden rounded-xl bg-gradient-to-b transition-all duration-300 ${FACTION_BG[card.faction]} ${
        selected
          ? '-translate-y-4 scale-110 z-20 shadow-[0_0_18px_rgba(245,158,11,0.9)] ring-4 ring-amber-400 border-amber-400 animate-pulse'
          : 'hover:-translate-y-2 hover:scale-105 hover:z-10 hover:shadow-[0_4px_15px_rgba(0,0,0,0.5)]'
      } ${affordable ? '' : 'opacity-40 grayscale'}`}
    >
      {/* Art fills the top half of the card. */}
      <div className="relative h-[44%] w-full shrink-0">
        <CardArt cardId={cardId} className="h-full w-full" glyphClass="text-5xl" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-1 top-1 flex h-7 w-7 rotate-45 items-center justify-center rounded-sm border border-cyan-200 bg-gradient-to-br from-cyan-400 to-blue-700 shadow-lg">
          <span className="-rotate-45 text-sm font-bold text-white drop-shadow">{card.cost}</span>
        </span>
      </div>

      <span className="truncate px-1 pt-0.5 text-center text-[11px] font-semibold text-amber-100 sm:text-xs">
        {lx(card.name)}
      </span>
      <span className="line-clamp-4 flex-1 px-1.5 pt-0.5 text-[10px] leading-tight text-slate-200 sm:text-[11px]">
        {lx(card.text)}
      </span>
      <div className="flex items-center justify-between bg-black/40 px-1.5 py-0.5 text-xs font-bold">
        {card.type === 'unit' ? (
          <>
            <span className="flex items-center gap-0.5 text-orange-300"><AttackIcon className="h-2.5 w-2.5" /> {card.attack}</span>
            {card.armor > 0 && <span className="flex items-center gap-0.5 text-slate-300"><ArmorIcon className="h-2.5 w-2.5" /> {card.armor}</span>}
            <span className="flex items-center gap-0.5 text-red-400"><HpIcon className="h-2.5 w-2.5" /> {card.maxHp}</span>
          </>
        ) : (
          <span className="mx-auto uppercase tracking-widest text-fuchsia-300">{t('spell_badge')}</span>
        )}
      </div>
    </button>
  );
}
