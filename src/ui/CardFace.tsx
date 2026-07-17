import { getCard } from '../game/cards';
import type { Faction } from '../game/types';
import { useLang } from '../i18n';
import { CardArt } from './CardArt';

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
}

/** A card in hand — full-bleed art on top, name banner, rules text and stats. */
export function CardFace({ cardId, selected = false, affordable = true, onClick }: Props) {
  const { lx, t } = useLang();
  const card = getCard(cardId);
  return (
    <button
      onClick={onClick}
      title={lx(card.text)}
      className={`card-frame card-frame--${card.rarity} relative flex h-40 w-28 shrink-0 flex-col overflow-hidden rounded-xl bg-gradient-to-b transition-transform sm:h-44 sm:w-30 md:h-52 md:w-34 lg:h-60 lg:w-40 ${FACTION_BG[card.faction]} ${
        selected ? '-translate-y-3 ring-2 ring-yellow-300' : 'hover:-translate-y-1.5'
      } ${affordable ? '' : 'opacity-50 grayscale'}`}
    >
      {/* Art fills the top half of the card. */}
      <div className="relative h-16 w-full shrink-0 sm:h-20 md:h-24 lg:h-28">
        <CardArt cardId={cardId} className="h-full w-full" glyphClass="text-5xl" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute left-1 top-1 flex h-7 w-7 rotate-45 items-center justify-center rounded-sm border border-cyan-200 bg-gradient-to-br from-cyan-400 to-blue-700 shadow-lg">
          <span className="-rotate-45 text-sm font-bold text-white drop-shadow">{card.cost}</span>
        </span>
      </div>

      <span className="truncate px-1 pt-0.5 text-center text-[10px] font-semibold text-amber-100">
        {lx(card.name)}
      </span>
      <span className="line-clamp-4 flex-1 px-1.5 pt-0.5 text-[8px] leading-tight text-slate-300">
        {lx(card.text)}
      </span>
      <div className="flex items-center justify-between bg-black/40 px-1.5 py-0.5 text-[11px] font-bold">
        {card.type === 'unit' ? (
          <>
            <span className="text-orange-300">⚔ {card.attack}</span>
            {card.armor > 0 && <span className="text-slate-300">🛡 {card.armor}</span>}
            <span className="text-red-400">🩸 {card.maxHp}</span>
          </>
        ) : (
          <span className="mx-auto uppercase tracking-widest text-fuchsia-300">{t('spell_badge')}</span>
        )}
      </div>
    </button>
  );
}
