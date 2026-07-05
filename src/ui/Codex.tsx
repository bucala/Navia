import { useState } from 'react';
import { getCard } from '../game/cards';
import { LORE } from '../game/lore';
import type { Faction } from '../game/types';
import { useLang } from '../i18n';
import { CardArt } from './CardArt';

const FACTION_CHIP: Record<Faction, string> = {
  lava: 'bg-red-950 text-red-200 border-red-700',
  nature: 'bg-emerald-950 text-emerald-200 border-emerald-700',
  celestial: 'bg-sky-950 text-sky-200 border-sky-700',
};

/** Sieň Božstiev — browse the pantheon's characters and their stories. */
export function Codex({ onBack }: { onBack: () => void }) {
  const { t, lx } = useLang();
  const [index, setIndex] = useState(0);

  const entry = LORE[index];
  const card = getCard(entry.cardId);

  const step = (delta: number) => setIndex((i) => (i + delta + LORE.length) % LORE.length);

  return (
    <div className="flex min-h-0 flex-1">
      {/* Character list */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-800 bg-slate-950/70 md:flex">
        <h2 className="border-b border-slate-800 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          {t('codex_title')}
        </h2>
        {LORE.map((item, i) => {
          const c = getCard(item.cardId);
          return (
            <button
              key={item.cardId}
              onClick={() => setIndex(i)}
              className={`flex items-center gap-2 border-b border-slate-900 px-3 py-2.5 text-left text-sm transition ${
                i === index ? 'bg-slate-800/80 text-amber-200' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900">
                <CardArt cardId={item.cardId} className="h-full w-full rounded-full" glyphClass="text-lg" />
                <img
                  src="/art/frames/medallion.svg"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                />
              </span>
              <span className="truncate">{lx(c.name)}</span>
            </button>
          );
        })}
        <button onClick={onBack} className="mt-auto px-3 py-3 text-left text-xs text-slate-500 hover:text-slate-300">
          {t('back_menu')}
        </button>
      </aside>

      {/* Detail */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button onClick={onBack} className="text-xs text-slate-400">
              {t('header_menu')}
            </button>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Art */}
            <div
              className={`card-frame card-frame--${card.rarity} mx-auto flex h-80 w-64 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl`}
            >
              <CardArt cardId={entry.cardId} className="h-full w-full" glyphClass="text-8xl" />
            </div>

            {/* Facts */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-amber-100">{lx(card.name)}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className={`rounded-full border px-2 py-0.5 ${FACTION_CHIP[card.faction]}`}>
                  {t(`faction_${card.faction}`)}
                </span>
                <span className="rounded-full border border-amber-700 bg-amber-950 px-2 py-0.5 text-amber-200">
                  {t(`rarity_${card.rarity}`)}
                </span>
                <span className="rounded-full border border-cyan-700 bg-cyan-950 px-2 py-0.5 text-cyan-200">
                  {t('codex_mana', { n: card.cost })}
                </span>
                {card.type === 'unit' && (
                  <>
                    <span className="rounded-full border border-slate-600 bg-slate-900 px-2 py-0.5 text-slate-200">
                      ⚔ {card.attack} · 🩸 {card.maxHp}
                      {card.armor > 0 ? ` · 🛡 ${card.armor}` : ''}
                    </span>
                    <span className="rounded-full border border-slate-600 bg-slate-900 px-2 py-0.5 text-slate-200">
                      {t(card.lane === 'vanguard' ? 'lane_vanguard' : 'lane_sanctum')}
                    </span>
                  </>
                )}
              </div>

              <h3 className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {t('codex_abilities')}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{lx(card.text)}</p>

              <h3 className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {t('codex_story')}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">{lx(entry.story)}</p>

              <h3 className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {t('codex_culture')}
              </h3>
              <p className="mt-1 text-sm italic leading-relaxed text-slate-400">{lx(entry.culture)}</p>
            </div>
          </div>

          {/* Pager */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => step(-1)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              {t('codex_prev')}
            </button>
            <span className="text-xs text-slate-500">
              {index + 1} / {LORE.length}
            </span>
            <button
              onClick={() => step(1)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              {t('codex_next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
