import { useEffect, useState } from 'react';
import { getCard, getUnitCard } from '../game/cards';
import { effectiveThreshold, opponentOf } from '../game/engine';
import type { Action, GameViewState, LaneId, PlayerId, SlotRef, TargetRef, UnitState } from '../game/types';
import { CardFace } from './CardFace';
import { CardArt } from './CardArt';
import { ArmorIcon, AttackIcon, HpIcon, ManaIcon, NexusHeartIcon } from './icons';
import { UnitSlot, type SlotHighlight } from './UnitToken';
import { slotFxKey, useCombatFx } from './useCombatFx';
import { FloatingPopup } from './FloatingPopup';
import { useLang } from '../i18n';

type Selection =
  | { mode: 'idle' }
  | { mode: 'hand'; index: number }
  | { mode: 'unit'; ref: SlotRef }
  | { mode: 'move'; ref: SlotRef }
  | { mode: 'dicePrompt'; attacker: SlotRef; target: TargetRef };

interface Props {
  state: GameViewState;
  dispatch: (action: Action) => boolean;
  /** Whose seat this client renders — locally the active player, online the assigned seat. */
  viewpoint: PlayerId;
  /** False while it's the opponent's turn (or an action awaits the server). */
  canAct: boolean;
}

function sameSlot(a: SlotRef, b: SlotRef): boolean {
  return a.lane === b.lane && a.slot === b.slot;
}

function ManaBar({ mana, maxMana, label }: { mana: number; maxMana: number; label: string }) {
  return (
    <div className="flex items-center gap-0.5" title={label}>
      {Array.from({ length: maxMana }, (_, i) => (
        <span key={i} className={`h-3 w-3 rotate-45 rounded-sm ${i < mana ? 'bg-cyan-400' : 'bg-slate-700'}`} />
      ))}
      <span className="ml-1 text-xs text-cyan-300">
        {mana}/{maxMana}
      </span>
    </div>
  );
}

/** The arena, rendered from the given seat's perspective. */
export function Board({ state, dispatch, viewpoint, canAct }: Props) {
  const { t, lx } = useLang();
  const laneLabel = (lane: LaneId) => t(lane === 'vanguard' ? 'lane_vanguard' : 'lane_sanctum');
  const [selection, setSelection] = useState<Selection>({ mode: 'idle' });
  const me = state.players[viewpoint];
  const foe = state.players[opponentOf(viewpoint)];
  const foeHasVanguard = foe.lanes.vanguard.some((u) => u !== null);
  const { fx, nexusFx } = useCombatFx(state);

  // Drop stale selections when the turn or seat changes.
  useEffect(() => setSelection({ mode: 'idle' }), [state.active, viewpoint]);

  const reset = () => setSelection({ mode: 'idle' });
  const act = (action: Action) => {
    if (dispatch(action)) reset();
  };
  useEffect(() => {
    if (selection.mode !== 'dicePrompt') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') reset();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selection.mode]);

  // ── Selection-derived helpers ─────────────────────────────────────────────

  const selectedHandCard = selection.mode === 'hand' ? getCard(me.hand[selection.index]) : null;

  const selectedUnit: UnitState | null =
    selection.mode === 'unit' || selection.mode === 'move'
      ? me.lanes[selection.ref.lane][selection.ref.slot]
      : null;
  const selectedUnitCard = selectedUnit ? getUnitCard(selectedUnit.cardId) : null;

  // Selected hand card must actually be payable — otherwise every slot would
  // light up as "playable" only to reject the card with a mana error on click.
  const canAffordSelected = !selectedHandCard || me.mana >= selectedHandCard.cost;

  const canPlaceAt = (lane: LaneId, slot: number): boolean =>
    selectedHandCard?.type === 'unit' &&
    state.phase === 'main' &&
    selectedHandCard.lane === lane &&
    canAffordSelected &&
    !me.lanes[lane][slot];

  const isAttackTarget = (lane: LaneId, slot: number): boolean => {
    if (!foe.lanes[lane][slot]) return false;
    if (selectedHandCard?.type === 'spell') return canAffordSelected; // spells ignore the wall
    if (selection.mode !== 'unit' || state.phase !== 'combat' || !selectedUnit?.ready) return false;
    return lane === 'vanguard' || !foeHasVanguard;
  };

  const nexusTargetable =
    selection.mode === 'unit' && state.phase === 'combat' && !!selectedUnit?.ready && !foeHasVanguard;

  const canMoveTo = (lane: LaneId, slot: number): boolean =>
    selection.mode === 'move' && lane !== selection.ref.lane && !me.lanes[lane][slot];

  // ── Click handlers ────────────────────────────────────────────────────────

  const clickHandCard = (index: number) => {
    if (!canAct || state.phase !== 'main') return;
    setSelection(selection.mode === 'hand' && selection.index === index ? { mode: 'idle' } : { mode: 'hand', index });
  };

  const clickMySlot = (lane: LaneId, slot: number) => {
    if (!canAct) return;
    if (selection.mode === 'hand' && canPlaceAt(lane, slot)) {
      act({ type: 'PLAY_CARD', player: me.id, handIndex: selection.index, lane, slot });
      return;
    }
    if (selection.mode === 'move' && canMoveTo(lane, slot)) {
      act({ type: 'MOVE_UNIT', player: me.id, from: selection.ref, to: { lane, slot } });
      return;
    }
    const unit = me.lanes[lane][slot];
    if (unit) {
      const ref = { lane, slot };
      setSelection(
        (selection.mode === 'unit' || selection.mode === 'move') && sameSlot(selection.ref, ref)
          ? { mode: 'idle' }
          : { mode: 'unit', ref },
      );
    }
  };

  const clickFoeSlot = (lane: LaneId, slot: number) => {
    if (!canAct || !foe.lanes[lane][slot]) return;
    const target: TargetRef = { kind: 'unit', player: foe.id, lane, slot };
    if (selection.mode === 'hand' && selectedHandCard?.type === 'spell' && canAffordSelected) {
      act({ type: 'PLAY_CARD', player: me.id, handIndex: selection.index, target });
      return;
    }
    if (selection.mode === 'unit' && isAttackTarget(lane, slot)) {
      startAttack(selection.ref, target);
    }
  };

  const clickFoeNexus = () => {
    if (!canAct) return;
    if (selection.mode === 'unit' && nexusTargetable) {
      startAttack(selection.ref, { kind: 'nexus', player: foe.id });
    }
  };

  /** Offer the dice rider when the attacker has one and the mana is there. */
  const startAttack = (attacker: SlotRef, target: TargetRef) => {
    const unit = me.lanes[attacker.lane][attacker.slot];
    const card = unit ? getUnitCard(unit.cardId) : null;
    if (card?.dice && !card.dice.activation && me.mana >= card.dice.manaCost) {
      setSelection({ mode: 'dicePrompt', attacker, target });
    } else {
      act({ type: 'ATTACK', player: me.id, attacker, target, useDice: false });
    }
  };

  // ── Row renderers ─────────────────────────────────────────────────────────

  const renderLane = (owner: 'me' | 'foe', lane: LaneId) => {
    const player = owner === 'me' ? me : foe;
    return (
      <div className="flex items-center justify-center gap-1 py-1 sm:gap-2">
        <span className="w-8 shrink-0 text-right text-[8px] uppercase tracking-widest text-slate-500 sm:w-14 sm:text-[9px] md:w-16 lg:w-20 lg:text-[10px]">
          {laneLabel(lane)}
        </span>
        <div className="flex flex-1 justify-center gap-1 sm:gap-2">
          {player.lanes[lane].map((unit, slot) => {
            let highlight: SlotHighlight = 'none';
            if (owner === 'me') {
              if (canPlaceAt(lane, slot)) highlight = 'place';
              else if (canMoveTo(lane, slot)) highlight = 'move';
              else if (
                (selection.mode === 'unit' || selection.mode === 'move') &&
                sameSlot(selection.ref, { lane, slot })
              )
                highlight = 'selected';
            } else if (isAttackTarget(lane, slot)) {
              highlight = 'attack';
            }
            return (
              <UnitSlot
                key={slot}
                unit={unit}
                highlight={highlight}
                enemySide={owner === 'foe'}
                fx={fx[slotFxKey(player.id, lane, slot)]}
                interactive={
                  canAct &&
                  (owner === 'me'
                    ? Boolean(unit) || canPlaceAt(lane, slot) || canMoveTo(lane, slot)
                    : isAttackTarget(lane, slot))
                }
                onClick={() => (owner === 'me' ? clickMySlot(lane, slot) : clickFoeSlot(lane, slot))}
              />
            );
          })}
        </div>
        <span className="hidden w-14 shrink-0 sm:block md:w-16 lg:w-20" />
      </div>
    );
  };

  const dicePromptUnit =
    selection.mode === 'dicePrompt'
      ? me.lanes[selection.attacker.lane][selection.attacker.slot]
      : null;
  const dicePromptCard = dicePromptUnit ? getUnitCard(dicePromptUnit.cardId) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto w-full max-w-full">
      {/* Opponent bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">{foe.name}</span>
          <span className="text-xs text-slate-400">🂠 {t('cards_in_hand', { n: foe.hand.length })}</span>
        </div>
        <ManaBar mana={foe.mana} maxMana={foe.maxMana} label={t('mana_label', { m: foe.mana, max: foe.maxMana })} />
        <button
          type="button"
          onClick={clickFoeNexus}
          disabled={!nexusTargetable}
          aria-label={t('a11y_nexus', { name: foe.name, hp: foe.nexusHp })}
          className={`relative rounded-lg border px-3 py-1 text-sm font-bold ${
            nexusTargetable
              ? 'cursor-pointer border-red-500 bg-red-950 text-red-200 ring-2 ring-red-500'
              : 'border-slate-700 bg-slate-900 text-red-300'
          }`}
          title={t('nexus_title')}
        >
          <span className="inline-flex items-center gap-1"><NexusHeartIcon className="h-3.5 w-3.5" /> {foe.nexusHp}</span>
          <FloatingPopup popup={nexusFx[foe.id]} className="-top-2" />
        </button>
      </div>

      {/* Arena */}
      <div className="arena-bg flex flex-1 min-h-[8rem] flex-col justify-center relative overflow-hidden">
        {/* Environmental Battlefield Assets */}
        <img
          src="/art/assets/rune_monolith.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1 sm:left-4 top-3 h-24 sm:h-36 md:h-44 w-auto z-0 opacity-80 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
        />
        <img
          src="/art/assets/mana_crystals.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-1 sm:right-4 top-4 h-20 sm:h-32 md:h-40 w-auto z-0 opacity-85 drop-shadow-[0_8px_20px_rgba(56,189,248,0.4)]"
        />
        <img
          src="/art/assets/battle_banner.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-2 sm:left-6 bottom-3 h-24 sm:h-36 md:h-44 w-auto z-0 opacity-80 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
        />
        <img
          src="/art/assets/rune_altar.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-2 sm:right-6 bottom-3 h-16 sm:h-24 md:h-32 w-auto z-0 opacity-80 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
        />

        <div className="relative z-10 flex flex-col justify-center flex-1 py-1">
          {renderLane('foe', 'sanctum')}
          {renderLane('foe', 'vanguard')}

          {/* Mid controls */}
          <div className="my-1 flex items-center justify-center gap-4 border-y border-amber-900/40 bg-slate-950/80 backdrop-blur-md py-1.5 shadow-lg">
            <span className="text-xs text-slate-200">
              {t('turn_label', { n: state.turn })} ·{' '}
              <span className="font-semibold text-amber-300">
                {state.phase === 'main' ? t('phase_main') : t('phase_combat')}
              </span>
            </span>
            {state.phase === 'main' && (
              <button
                onClick={() => act({ type: 'ENTER_COMBAT', player: me.id })}
                disabled={!canAct}
                className="rounded bg-red-800 px-3 py-1 text-xs font-semibold text-red-100 hover:bg-red-700 disabled:opacity-40 shadow"
              >
                {t('btn_combat')}
              </button>
            )}
            <button
              onClick={() => act({ type: 'END_TURN', player: me.id })}
              disabled={!canAct}
              className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-600 disabled:opacity-40 shadow"
            >
              {t('btn_endturn')}
            </button>
          </div>

          {renderLane('me', 'vanguard')}
          {renderLane('me', 'sanctum')}
        </div>
      </div>

      {/* Selected-unit action bar */}
      {selection.mode === 'unit' && selectedUnit && selectedUnitCard && (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 bg-slate-950/90 border-t border-amber-900/50 py-2 px-4 text-xs shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="h-10 w-8 shrink-0 overflow-hidden rounded border border-amber-500/60 shadow">
              <CardArt cardId={selectedUnitCard.id} className="h-full w-full object-cover object-[center_15%]" />
            </div>
            <div className="text-left">
              <span className="font-bold text-amber-100 block">{lx(selectedUnitCard.name)}</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-300">
                <AttackIcon className="h-2.5 w-2.5" /> {selectedUnitCard.attack} ·
                <ArmorIcon className="h-2.5 w-2.5" /> {selectedUnit.armor} ·
                <HpIcon className="h-2.5 w-2.5" /> {selectedUnit.hp}/{selectedUnitCard.maxHp}
              </span>
            </div>
          </div>
          {!selectedUnit.ready && <span className="text-slate-500 italic">{t('action_exhausted')}</span>}
          {selectedUnitCard.dice?.activation && selectedUnit.ready && state.phase === 'combat' && (
            <button
              onClick={() => act({ type: 'ACTIVATE', player: me.id, unit: selection.ref })}
              disabled={me.mana < selectedUnitCard.dice.manaCost}
              className="inline-flex items-center gap-1 rounded bg-emerald-800 px-3 py-1.5 font-semibold text-emerald-100 hover:bg-emerald-700 disabled:opacity-40 shadow"
            >
              <img src="/art/icons/icon-dice.svg" alt="" aria-hidden="true" className="h-4 w-4" />
              {lx(selectedUnitCard.dice.label)} ({selectedUnitCard.dice.threshold}+, {selectedUnitCard.dice.manaCost}
              <ManaIcon className="h-2.5 w-2.5" />)
            </button>
          )}
          {selectedUnitCard.keywords.includes('agile') &&
            state.phase === 'combat' &&
            !selectedUnit.movedThisTurn && (
              <button
                onClick={() => setSelection({ mode: 'move', ref: selection.ref })}
                className="rounded bg-sky-800 px-3 py-1.5 font-semibold text-sky-100 hover:bg-sky-700 shadow"
              >
                {t('action_move')}
              </button>
            )}
          <button onClick={reset} className="rounded bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 border border-slate-700">
            {t('action_cancel')}
          </button>
        </div>
      )}
      {selection.mode === 'move' && (
        <div className="flex shrink-0 items-center justify-center gap-2 bg-slate-900/80 py-1.5 text-xs text-sky-200">
          {t('move_hint')}
          <button onClick={reset} className="rounded bg-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-600">
            {t('action_cancel')}
          </button>
        </div>
      )}

      {/* Player bar + hand */}
      <div className="flex shrink grow-0 min-h-[12rem] basis-[clamp(18rem,38dvh,24rem)] flex-col border-t border-slate-800 bg-slate-950/60 px-4 py-2">
        <div className="mb-2 flex shrink-0 items-center justify-between">
          <span className="font-semibold text-slate-200">{me.name}</span>
          <ManaBar mana={me.mana} maxMana={me.maxMana} label={t('mana_label', { m: me.mana, max: me.maxMana })} />
          <span className="relative rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm font-bold text-red-300">
            <span className="inline-flex items-center gap-1"><NexusHeartIcon className="h-3.5 w-3.5" /> {me.nexusHp}</span>
            <FloatingPopup popup={nexusFx[me.id]} className="-top-2" />
          </span>
        </div>
        <div className="relative z-10 flex flex-1 min-h-0 items-stretch w-max max-w-full mx-auto gap-3 sm:gap-4 overflow-x-auto overflow-y-auto pt-14 pb-4 px-4">
          {me.hand.length === 0 && <span className="py-6 text-xs text-slate-500">{t('hand_empty')}</span>}
          {me.hand.map((cardId, i) => (
            <CardFace
              key={`${cardId}-${i}`}
              cardId={cardId}
              selected={selection.mode === 'hand' && selection.index === i}
              affordable={canAct && getCard(cardId).cost <= me.mana && state.phase === 'main'}
              interactive={canAct && state.phase === 'main'}
              onClick={() => clickHandCard(i)}
            />
          ))}
        </div>
        {selectedHandCard && (
          <p className={`mt-1 shrink-0 text-center text-xs ${canAffordSelected ? 'text-slate-400' : 'text-red-400'}`}>
            {!canAffordSelected
              ? t('afford_hint', { cost: selectedHandCard.cost, mana: me.mana })
              : selectedHandCard.type === 'unit'
                ? t('place_hint', { lane: laneLabel(selectedHandCard.lane) })
                : t('spell_hint')}
          </p>
        )}
      </div>

      {/* Dice rider prompt */}
      {selection.mode === 'dicePrompt' && dicePromptCard?.dice && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dice-prompt-title"
            className="w-80 rounded-xl border border-slate-600 bg-slate-900 p-4 text-center shadow-2xl"
          >
            <p id="dice-prompt-title" className="mb-1 font-semibold text-amber-100">{lx(dicePromptCard.name)}</p>
            <p className="mb-3 text-xs text-slate-300">
              {t('dice_prompt', {
                label: lx(dicePromptCard.dice.label),
                t: effectiveThreshold(me.lanes[selection.attacker.lane][selection.attacker.slot]!),
                n: dicePromptCard.dice.manaCost,
              })}
            </p>
            <div className="flex justify-center gap-2">
              <button
                autoFocus
                onClick={() =>
                  act({ type: 'ATTACK', player: me.id, attacker: selection.attacker, target: selection.target, useDice: false })
                }
                className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-600"
              >
                {t('dice_basic')}
              </button>
              <button
                onClick={() =>
                  act({ type: 'ATTACK', player: me.id, attacker: selection.attacker, target: selection.target, useDice: true })
                }
                className="rounded bg-amber-700 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-amber-600"
              >
                {t('dice_roll_btn', { n: dicePromptCard.dice.manaCost })}
              </button>
              <button onClick={reset} className="rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700">
                {t('action_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
