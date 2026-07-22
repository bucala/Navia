import { useEffect, useMemo, useState } from 'react';
import { CARDS } from '../game/cards';
import { DECK_MAX, DECK_MIN, MAX_COPIES, validateDeck } from '../game/deck';
import { activeDeckId, deckApi, setActiveDeckId, useProfile, type Profile } from '../net/profile';
import { errorText, useLang } from '../i18n';
import { CardFace } from './CardFace';
import { Toast, useToast } from './feedback';

interface DeckSummary {
  id: string;
  name: string;
  cards: string[];
}

interface Draft {
  deckId?: string;
  name: string;
  counts: Record<string, number>;
}

function draftCards(draft: Draft): string[] {
  return Object.entries(draft.counts).flatMap(([id, n]) => Array<string>(n).fill(id));
}

/** 🃏 Balíčky — build, save and pick the deck used for online matches. */
export function DeckBuilder({ onBack }: { onBack: () => void }) {
  const { t } = useLang();
  const { profile, loading } = useProfile();
  const { toast, showToast } = useToast();
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [active, setActive] = useState<string | null>(activeDeckId);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    deckApi<{ decks: DeckSummary[] }>('/api/decks/list', profile)
      .then((data) => setDecks(data.decks))
      .catch((e) => showToast(e instanceof Error ? e.message : String(e)));
  }, [profile, showToast]);

  if (loading) return <Center>{t('loading_profile')}</Center>;
  if (!profile) {
    return (
      <Center>
        {t('profile_missing')}
        <button onClick={onBack} className="navia-back-btn mt-4">
          ← {t('back_menu')}
        </button>
      </Center>
    );
  }

  if (draft) {
    return (
      <DeckEditor
        profile={profile}
        draft={draft}
        setDraft={setDraft}
        busy={busy}
        onSave={async () => {
          setBusy(true);
          try {
            const cards = draftCards(draft);
            const saved = await deckApi<{ deckId: string; name: string }>('/api/decks/save', profile, {
              deckId: draft.deckId,
              deckName: draft.name,
              cards,
            });
            setDecks((prev) => {
              const rest = prev.filter((d) => d.id !== saved.deckId);
              return [{ id: saved.deckId, name: saved.name, cards }, ...rest];
            });
            setDraft(null);
            showToast(t('decks_saved'));
          } catch (e) {
            showToast(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
        toast={toast}
      />
    );
  }

  const openEditor = (deck?: DeckSummary) => {
    const counts: Record<string, number> = {};
    for (const id of deck?.cards ?? []) counts[id] = (counts[id] ?? 0) + 1;
    setDraft({ deckId: deck?.id, name: deck?.name ?? t('decks_default_name'), counts });
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-6">
      <div className="menu-panel p-6">
        <h2 className="text-2xl font-bold text-amber-100">{t('decks_title')}</h2>
        <p className="mt-1 text-xs text-slate-400">
          {t('decks_hint')}
        </p>

        <button
          onClick={() => openEditor()}
          className="mt-4 w-full rounded-xl bg-amber-700 px-4 py-3 font-semibold text-amber-50 hover:bg-amber-600"
        >
          {t('decks_new')}
        </button>

        <div className="mt-4 space-y-2">
          {decks.length === 0 && <p className="text-sm text-slate-500">{t('decks_none')}</p>}
          {decks.map((deck) => (
            <div key={deck.id} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-100">
                  {deck.name}{' '}
                  {active === deck.id && <span className="text-xs font-normal text-emerald-400">{t('decks_active')}</span>}
                </p>
                <p className="text-xs text-slate-500">{t('decks_cards', { n: deck.cards.length })}</p>
              </div>
              {active !== deck.id && (
                <button
                  onClick={() => {
                    setActiveDeckId(deck.id);
                    setActive(deck.id);
                  }}
                  className="rounded bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-700"
                >
                  {t('decks_set_active')}
                </button>
              )}
              <button
                onClick={() => openEditor(deck)}
                className="rounded bg-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-600"
              >
                {t('decks_edit')}
              </button>
              <button
                onClick={async () => {
                  try {
                    await deckApi('/api/decks/delete', profile, { deckId: deck.id });
                    setDecks((prev) => prev.filter((d) => d.id !== deck.id));
                    if (active === deck.id) {
                      setActiveDeckId(null);
                      setActive(null);
                    }
                  } catch (e) {
                    showToast(e instanceof Error ? e.message : String(e));
                  }
                }}
                className="rounded bg-red-900 px-3 py-1.5 text-xs text-red-200 hover:bg-red-800"
              >
                {t('decks_delete')}
              </button>
            </div>
          ))}
        </div>

        <button onClick={onBack} className="navia-back-btn mt-6">
          ← {t('back_menu')}
        </button>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  );
}

function DeckEditor({
  draft,
  setDraft,
  onSave,
  busy,
  toast,
}: {
  profile: Profile;
  draft: Draft;
  setDraft: (d: Draft | null) => void;
  onSave: () => void;
  busy: boolean;
  toast: string | null;
}) {
  const { t, lang } = useLang();
  const cards = useMemo(() => draftCards(draft), [draft]);
  const error = validateDeck(cards);

  const bump = (cardId: string, delta: number) => {
    const next = Math.max(0, Math.min(MAX_COPIES, (draft.counts[cardId] ?? 0) + delta));
    const counts = { ...draft.counts };
    if (next === 0) delete counts[cardId];
    else counts[cardId] = next;
    setDraft({ ...draft, counts });
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto p-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          maxLength={30}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 outline-none focus:border-amber-500"
        />
        <span className={`text-sm font-bold ${cards.length > DECK_MAX ? 'text-red-400' : 'text-slate-300'}`}>
          {t('editor_count', { n: cards.length, min: DECK_MIN, max: DECK_MAX })}
        </span>
        <span className="text-xs text-red-400">{error ? errorText(lang, error.code, error.params) : ''}</span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onSave}
            disabled={!!error || busy}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-600 disabled:opacity-40"
          >
            {t('editor_save')}
          </button>
          <button
            onClick={() => setDraft(null)}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-600"
          >
            {t('action_cancel')}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-4">
        {Object.values(CARDS).map((card) => {
          const count = draft.counts[card.id] ?? 0;
          return (
            <div key={card.id} className="flex flex-col items-center gap-1">
              <CardFace cardId={card.id} affordable={count > 0} onClick={() => bump(card.id, +1)} />
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => bump(card.id, -1)}
                  className="h-6 w-6 rounded bg-slate-700 font-bold text-slate-100 hover:bg-slate-600"
                >
                  −
                </button>
                <span className={`w-8 text-center font-bold ${count > 0 ? 'text-amber-200' : 'text-slate-600'}`}>
                  {count}/{MAX_COPIES}
                </span>
                <button
                  onClick={() => bump(card.id, +1)}
                  className="h-6 w-6 rounded bg-slate-700 font-bold text-slate-100 hover:bg-slate-600"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {toast && <Toast message={toast} />}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="menu-panel p-6 text-sm text-slate-400">{children}</div>
    </div>
  );
}
