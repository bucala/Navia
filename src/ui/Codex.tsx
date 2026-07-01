import { useState } from 'react';
import { getCard } from '../game/cards';
import { LORE } from '../game/lore';
import type { Faction, Rarity } from '../game/types';

const FACTION_LABEL: Record<Faction, string> = {
  lava: 'Lávový dvor',
  nature: 'Prírodný a Zemský Pakt',
  celestial: 'Nebeský Zbor',
};

const FACTION_CHIP: Record<Faction, string> = {
  lava: 'bg-red-950 text-red-200 border-red-700',
  nature: 'bg-emerald-950 text-emerald-200 border-emerald-700',
  celestial: 'bg-sky-950 text-sky-200 border-sky-700',
};

const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Bežná',
  rare: 'Vzácna',
  legendary: 'Legendárna',
};

/** Sieň Božstiev — browse the pantheon's characters and their stories. */
export function Codex({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [brokenArt, setBrokenArt] = useState<Record<string, boolean>>({});

  const entry = LORE[index];
  const card = getCard(entry.cardId);
  const showArt = !brokenArt[entry.cardId];

  const step = (delta: number) => setIndex((i) => (i + delta + LORE.length) % LORE.length);

  return (
    <div className="flex min-h-0 flex-1">
      {/* Character list */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-800 bg-slate-950/70 md:flex">
        <h2 className="border-b border-slate-800 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          Sieň Božstiev
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
              <span className="text-2xl">{c.glyph}</span>
              <span className="truncate">{c.name}</span>
            </button>
          );
        })}
        <button onClick={onBack} className="mt-auto px-3 py-3 text-left text-xs text-slate-500 hover:text-slate-300">
          ← Späť do menu
        </button>
      </aside>

      {/* Detail */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button onClick={onBack} className="text-xs text-slate-400">
              ← Menu
            </button>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Art */}
            <div className="mx-auto flex h-80 w-64 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-900/60 bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl">
              {showArt ? (
                <img
                  src={entry.art}
                  alt={card.name}
                  className="h-full w-full object-cover"
                  onError={() => setBrokenArt((prev) => ({ ...prev, [entry.cardId]: true }))}
                />
              ) : (
                <span className="text-8xl drop-shadow-lg">{card.glyph}</span>
              )}
            </div>

            {/* Facts */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-amber-100">{card.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className={`rounded-full border px-2 py-0.5 ${FACTION_CHIP[card.faction]}`}>
                  {FACTION_LABEL[card.faction]}
                </span>
                <span className="rounded-full border border-amber-700 bg-amber-950 px-2 py-0.5 text-amber-200">
                  {RARITY_LABEL[card.rarity]}
                </span>
                <span className="rounded-full border border-cyan-700 bg-cyan-950 px-2 py-0.5 text-cyan-200">
                  💎 {card.cost} many
                </span>
                {card.type === 'unit' && (
                  <>
                    <span className="rounded-full border border-slate-600 bg-slate-900 px-2 py-0.5 text-slate-200">
                      ⚔ {card.attack} · 🩸 {card.maxHp}
                      {card.armor > 0 ? ` · 🛡 ${card.armor}` : ''}
                    </span>
                    <span className="rounded-full border border-slate-600 bg-slate-900 px-2 py-0.5 text-slate-200">
                      {card.lane === 'vanguard' ? 'Vanguard' : 'Sanctum'}
                    </span>
                  </>
                )}
              </div>

              <h3 className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Schopnosti</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{card.text}</p>

              <h3 className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Príbeh</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">{entry.story}</p>

              <h3 className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Kultúrny odkaz</h3>
              <p className="mt-1 text-sm italic leading-relaxed text-slate-400">{entry.culture}</p>
            </div>
          </div>

          {/* Pager */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => step(-1)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              ◀ Predchádzajúca
            </button>
            <span className="text-xs text-slate-500">
              {index + 1} / {LORE.length}
            </span>
            <button
              onClick={() => step(1)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
            >
              Ďalšia ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
