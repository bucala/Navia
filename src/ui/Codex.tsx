import { useState } from 'react';
import { CARDS, getCard } from '../game/cards';
import { getLore, LORE } from '../game/lore';
import type { Faction } from '../game/types';
import { useLang } from '../i18n';
import { CardArt } from './CardArt';
import { CardPortrait } from './CardPortrait';
import { CodexCard } from './CodexCard';
import { ArmorIcon, AttackIcon, HpIcon } from './icons';

const FACTION_CHIP: Record<Faction, string> = {
  lava: 'bg-red-950 text-red-200 border-red-700',
  nature: 'bg-emerald-950 text-emerald-200 border-emerald-700',
  celestial: 'bg-sky-950 text-sky-200 border-sky-700',
};

const FACTION_BG: Record<Faction, string> = {
  lava: 'from-red-950 via-slate-950 to-orange-950',
  nature: 'from-emerald-950 via-slate-950 to-green-950',
  celestial: 'from-sky-950 via-slate-950 to-indigo-950',
};

/**
 * Every card in the hall: deities with a written legend first (in LORE
 * order), then the rest of the catalogue — they show card text until their
 * story is written.
 */
const ENTRIES = [
  ...LORE.map(({ cardId }) => ({ cardId })),
  ...Object.keys(CARDS)
    .filter((cardId) => !getLore(cardId))
    .map((cardId) => ({ cardId })),
];

/** Sieň Božstiev — browse the pantheon's characters and their stories. */
export function Codex({ onBack }: { onBack: () => void }) {
  const { t, lx } = useLang();
  const [index, setIndex] = useState(0);

  const entry = ENTRIES[index];
  const card = getCard(entry.cardId);
  const lore = getLore(entry.cardId);

  const step = (delta: number) => setIndex((i) => (i + delta + ENTRIES.length) % ENTRIES.length);

  const cardFront = (
    <div
      className={`card-frame card-frame--${card.rarity} flex h-full w-full flex-col overflow-hidden rounded-[inherit] bg-gradient-to-b ${FACTION_BG[card.faction]} shadow-[0_15px_35px_rgba(0,0,0,0.8),_0_0_20px_rgba(245,158,11,0.2)]`}
    >
      <div className="relative h-[230px] w-full shrink-0">
        <CardArt cardId={entry.cardId} className="h-full w-full object-cover object-top" glyphClass="text-8xl" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <span className="absolute left-3 top-3 flex h-10 w-10 rotate-45 items-center justify-center rounded border border-cyan-200 bg-gradient-to-br from-cyan-400 to-blue-700 shadow-xl">
          <span className="-rotate-45 text-base font-extrabold text-white drop-shadow-md">{card.cost}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 bg-slate-950/90 border-t border-amber-900/20">
        <span className="text-center text-sm font-bold text-amber-100 tracking-wider border-b border-amber-900/30 pb-1.5 uppercase">
          {lx(card.name)}
        </span>
        <p className="flex-1 mt-3 text-[11px] leading-relaxed text-slate-300 text-center italic px-1 font-medium">
          {lx(card.text)}
        </p>

        <div className="flex items-center justify-around bg-slate-900/80 rounded-xl py-1.5 px-4 mt-2 text-xs font-bold border border-slate-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          {card.type === 'unit' ? (
            <>
              <span className="text-orange-400 flex items-center gap-1.5 drop-shadow"><AttackIcon className="h-4 w-4" /> <span className="text-sm font-extrabold">{card.attack}</span></span>
              {card.armor > 0 && <span className="text-slate-300 flex items-center gap-1.5 drop-shadow"><ArmorIcon className="h-4 w-4" /> <span className="text-sm font-extrabold">{card.armor}</span></span>}
              <span className="text-red-500 flex items-center gap-1.5 drop-shadow"><HpIcon className="h-4 w-4" /> <span className="text-sm font-extrabold">{card.maxHp}</span></span>
            </>
          ) : (
            <span className="mx-auto uppercase tracking-wider text-fuchsia-300 font-extrabold text-[10px]">{t('spell_badge')}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1">
      {/* Character list */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-amber-900/40 bg-stone-950/80 md:flex">
        <h2 className="border-b border-amber-900/30 px-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-200/70">
          {t('codex_title')}
        </h2>
        {ENTRIES.map((item, i) => {
          const c = getCard(item.cardId);
          return (
            <button
              key={item.cardId}
              onClick={() => setIndex(i)}
              className={`flex items-center gap-2.5 border-b border-stone-900/80 px-3 py-2.5 text-left text-sm transition ${
                i === index ? 'bg-amber-900/40 text-amber-200 font-bold border-l-4 border-l-amber-500' : 'text-stone-300 hover:bg-stone-900/60'
              }`}
            >
              <CardPortrait cardId={item.cardId} className="h-11 w-11" active={i === index} />
              <span className="truncate">{lx(c.name)}</span>
            </button>
          );
        })}
        <div className="mt-auto p-3 border-t border-slate-900/60 bg-slate-950/50">
          <button onClick={onBack} className="navia-back-btn w-full justify-center">
            {t('back_menu')}
          </button>
        </div>
      </aside>

      {/* Detail */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-950/30">
        <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
          {/* Phones have no sidebar: pick a deity from a strip of head medallions. */}
          <nav aria-label={t('codex_title')} className="no-scrollbar -mx-4 mb-5 flex gap-2.5 overflow-x-auto px-4 pb-1 md:hidden">
            {ENTRIES.map((item, i) => (
              <button
                key={item.cardId}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                aria-label={lx(getCard(item.cardId).name)}
                className="shrink-0 rounded-full p-0.5"
              >
                <CardPortrait cardId={item.cardId} className="h-12 w-12" active={i === index} />
              </button>
            ))}
          </nav>

          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6 md:gap-8 w-full">
            {/* The large card: tilt, drag-spin and flip to the shared back. */}
            <div className="mx-auto shrink-0 xl:mx-0">
              <CodexCard
                resetKey={entry.cardId}
                  front={cardFront}
              />
            </div>

            {/* Full Width Facts & Story Panel */}
            <div className="menu-panel w-full min-w-0 flex-1 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-black text-amber-100 tracking-wide">{lx(card.name)}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className={`rounded-full border px-3 py-1 ${FACTION_CHIP[card.faction]}`}>
                  {t(`faction_${card.faction}`)}
                </span>
                <span className="rounded-full border border-amber-700 bg-amber-950/80 px-3 py-1 text-amber-200">
                  {t(`rarity_${card.rarity}`)}
                </span>
                <span className="rounded-full border border-cyan-700 bg-cyan-950/80 px-3 py-1 text-cyan-200 shadow-sm">
                  {t('codex_mana', { n: card.cost })}
                </span>
                {card.type === 'unit' && (
                  <>
                    <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-slate-200 shadow-sm">
                      <AttackIcon className="h-3 w-3" /> {card.attack} · <HpIcon className="h-3 w-3" /> {card.maxHp}
                      {card.armor > 0 && (
                        <>
                          · <ArmorIcon className="h-3 w-3" /> {card.armor}
                        </>
                      )}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-slate-200 shadow-sm">
                      {t(card.lane === 'vanguard' ? 'lane_vanguard' : 'lane_sanctum')}
                    </span>
                  </>
                )}
              </div>

              <h3 className="mt-6 text-xs font-extrabold uppercase tracking-widest text-amber-400/90 border-b border-slate-800/80 pb-1">
                {t('codex_abilities')}
              </h3>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-200 font-medium">{lx(card.text)}</p>

              {lore && (
                <>
                  <h3 className="mt-6 text-xs font-extrabold uppercase tracking-widest text-amber-400/90 border-b border-slate-800/80 pb-1">
                    {t('codex_story')}
                  </h3>
                  <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-200">{lx(lore.story)}</p>

                  <h3 className="mt-6 text-xs font-extrabold uppercase tracking-widest text-amber-400/90 border-b border-slate-800/80 pb-1">
                    {t('codex_culture')}
                  </h3>
                  <p className="mt-2 text-sm md:text-base italic leading-relaxed text-slate-300">{lx(lore.culture)}</p>
                </>
              )}
            </div>
          </div>

          {/* Pager */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => step(-1)}
              className="navia-btn"
            >
              <span aria-hidden="true" className="icon-mask icon-mask--chevron-left h-3 w-3 bg-current" />
              {t('codex_prev')}
            </button>
            <span className="rounded-full bg-stone-950/80 px-3 py-1 text-xs font-semibold text-amber-200">
              {index + 1} / {ENTRIES.length}
            </span>
            <button
              onClick={() => step(1)}
              className="navia-btn"
            >
              {t('codex_next')}
              <span aria-hidden="true" className="icon-mask icon-mask--chevron-right h-3 w-3 bg-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
