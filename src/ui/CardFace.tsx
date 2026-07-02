import { getCard } from '../game/cards';
import type { Faction, Rarity } from '../game/types';
import { useLang } from '../i18n';
import { CardArt } from './CardArt';

const FACTION_BG: Record<Faction, string> = {
  lava: 'from-red-950 to-orange-900',
  nature: 'from-emerald-950 to-green-900',
  celestial: 'from-sky-950 to-indigo-900',
};

const RARITY_BORDER: Record<Rarity, string> = {
  common: 'border-slate-500',
  rare: 'border-violet-400',
  legendary: 'border-amber-400',
};

interface Props {
  cardId: string;
  selected?: boolean;
  affordable?: boolean;
  onClick?: () => void;
}

/** A card in hand — mana crystal, art, name, stats and rules text. */
export function CardFace({ cardId, selected = false, affordable = true, onClick }: Props) {
  const { lx, t } = useLang();
  const card = getCard(cardId);
  return (
    <button
      onClick={onClick}
      title={lx(card.text)}
      className={`relative flex h-44 w-28 shrink-0 flex-col rounded-xl border-2 bg-gradient-to-b p-1.5 text-left transition-transform ${FACTION_BG[card.faction]} ${RARITY_BORDER[card.rarity]} ${
        selected ? '-translate-y-3 ring-2 ring-yellow-300' : 'hover:-translate-y-1.5'
      } ${affordable ? '' : 'opacity-50 grayscale'}`}
    >
      <span className="absolute -left-1.5 -top-1.5 flex h-7 w-7 rotate-45 items-center justify-center rounded-sm border border-cyan-200 bg-gradient-to-br from-cyan-400 to-blue-700 shadow">
        <span className="-rotate-45 text-sm font-bold text-white">{card.cost}</span>
      </span>
      <CardArt cardId={cardId} className="mt-2 h-14 w-full rounded-md" glyphClass="text-4xl" />
      <span className="mt-1 truncate text-center text-[11px] font-semibold text-amber-100">{lx(card.name)}</span>
      <span className="mt-auto line-clamp-4 text-[8px] leading-tight text-slate-200">{lx(card.text)}</span>
      <div className="mt-1 flex items-center justify-between text-[11px] font-bold">
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
