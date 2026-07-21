import { useEffect, useState } from 'react';
import { getCard, getUnitCard } from '../game/cards';
import { effectiveThreshold, opponentOf } from '../game/engine';
import type { Action, GameState, LaneId, PlayerId, SlotRef, TargetRef, UnitState } from '../game/types';
import { CardFace } from './CardFace';
import { UnitSlot, type SlotHighlight } from './UnitToken';
import { slotFxKey, useCombatFx, type Popup } from './useCombatFx';
import { useLang } from '../i18n';

type Selection =
  | { mode: 'idle' }
  | { mode: 'hand'; index: number }
  | { mode: 'unit'; ref: SlotRef }
  | { mode: 'move'; ref: SlotRef }
  | { mode: 'dicePrompt'; attacker: SlotRef; target: TargetRef };

interface Props {
  state: GameState;
  dispatch: (action: Action) => boolean;
  /** Whose seat this client renders — locally the active player, online the assigned seat. */
  viewpoint: PlayerId;
  /** False while it's the opponent's turn (or an action awaits the server). */
  canAct: boolean;
}

function sameSlot(a: SlotRef, b: SlotRef): boolean {
  return a.lane === b.lane && a.slot === b.slot;
}

function NexusPopup({ popup }: { popup?: Popup }) {
  if (!popup) return null;
  return (
    <span
      className={`animate-popup pointer-events-none absolute inset-x-0 -top-2 z-10 text-center text-xl font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
        popup.kind === 'damage' ? 'text-red-400' : 'text-emerald-300'
      }`}
    >
      {popup.kind === 'damage' ? `−${popup.amount}` : `+${popup.amount}`}
    </span>
  );
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
                onClick={() => (owner === 'me' ? clickMySlot(lane, slot) : clickFoeSlot(lane, slot))}
              />
            );
          })}
        </div>
        <span className="hidden w-14 shrink-0 sm:block md:w-16 lg:w-20" />
      </div>
    );
  };

  const dicePromptCard =
    selection.mode === 'dicePrompt'
      ? getUnitCard(me.lanes[selection.attacker.lane][selection.attacker.slot]!.cardId)
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden w-full max-w-full">
      {/* Opponent bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200">{foe.name}</span>
          <span className="text-xs text-slate-400">🂠 {t('cards_in_hand', { n: foe.hand.length })}</span>
        </div>
        <ManaBar mana={foe.mana} maxMana={foe.maxMana} label={t('mana_label', { m: foe.mana, max: foe.maxMana })} />
        <button
          onClick={clickFoeNexus}
          className={`relative rounded-lg border px-3 py-1 text-sm font-bold ${
            nexusTargetable
              ? 'cursor-pointer border-red-500 bg-red-950 text-red-200 ring-2 ring-red-500'
              : 'border-slate-700 bg-slate-900 text-red-300'
          }`}
          title={t('nexus_title')}
        >
          ❤️ {foe.nexusHp}
          <NexusPopup popup={nexusFx[foe.id]} />
        </button>
      </div>

      {/* Arena */}
      <div className="arena-bg flex flex-1 flex-col justify-center">
        {renderLane('foe', 'sanctum')}
        {renderLane('foe', 'vanguard')}

        {/* Mid controls */}
        <div className="my-1 flex items-center justify-center gap-4 border-y border-slate-800/70 bg-slate-950/40 py-1.5">
          <span className="text-xs text-slate-400">
            {t('turn_label', { n: state.turn })} ·{' '}
            <span className="font-semibold text-amber-200">
              {state.phase === 'main' ? t('phase_main') : t('phase_combat')}
            </span>
          </span>
          {state.phase === 'main' && (
            <button
              onClick={() => act({ type: 'ENTER_COMBAT', player: me.id })}
              disabled={!canAct}
              className="rounded bg-red-800 px-3 py-1 text-xs font-semibold text-red-100 hover:bg-red-700 disabled:opacity-40"
            >
              {t('btn_combat')}
            </button>
          )}
          <button
            onClick={() => act({ type: 'END_TURN', player: me.id })}
            disabled={!canAct}
            className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-600 disabled:opacity-40"
          >
            {t('btn_endturn')}
          </button>
        </div>

        {renderLane('me', 'vanguard')}
        {renderLane('me', 'sanctum')}
      </div>

      {/* Selected-unit action bar */}
      {selection.mode === 'unit' && selectedUnit && selectedUnitCard && (
        <div className="flex items-center justify-center gap-2 bg-slate-900/80 py-1.5 text-xs">
          <span className="font-semibold text-amber-100">{lx(selectedUnitCard.name)}</span>
          {!selectedUnit.ready && <span className="text-slate-500">{t('action_exhausted')}</span>}
          {selectedUnitCard.dice?.activation && selectedUnit.ready && (
            <button
              onClick={() => act({ type: 'ACTIVATE', player: me.id, unit: selection.ref })}
              disabled={me.mana < selectedUnitCard.dice.manaCost}
              className="rounded bg-emerald-800 px-2 py-1 font-semibold text-emerald-100 hover:bg-emerald-700 disabled:opacity-40"
            >
              🎲 {lx(selectedUnitCard.dice.label)} ({selectedUnitCard.dice.threshold}+, {selectedUnitCard.dice.manaCost} 💧)
            </button>
          )}
          {selectedUnitCard.keywords.includes('agile') &&
            state.phase === 'combat' &&
            !selectedUnit.movedThisTurn && (
              <button
                onClick={() => setSelection({ mode: 'move', ref: selection.ref })}
                className="rounded bg-sky-800 px-2 py-1 font-semibold text-sky-100 hover:bg-sky-700"
              >
                {t('action_move')}
              </button>
            )}
          <button onClick={reset} className="rounded bg-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-600">
            {t('action_cancel')}
          </button>
        </div>
      )}
      {selection.mode === 'move' && (
        <div className="flex items-center justify-center gap-2 bg-slate-900/80 py-1.5 text-xs text-sky-200">
          {t('move_hint')}
          <button onClick={reset} className="rounded bg-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-600">
            {t('action_cancel')}
          </button>
        </div>
      )}

      {/* Player bar + hand */}
      <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-slate-200">{me.name}</span>
          <ManaBar mana={me.mana} maxMana={me.maxMana} label={t('mana_label', { m: me.mana, max: me.maxMana })} />
          <span className="relative rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-sm font-bold text-red-300">
            ❤️ {me.nexusHp}
            <NexusPopup popup={nexusFx[me.id]} />
          </span>
        </div>
        <div className="relative z-10 flex w-max max-w-full mx-auto gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pt-8 pb-4 px-4 sm:pt-12 sm:pb-6 sm:px-5 md:pt-16 md:pb-8 md:px-6">
          {me.hand.length === 0 && <span className="py-6 text-xs text-slate-500">{t('hand_empty')}</span>}
          {me.hand.map((cardId, i) => (
            <CardFace
              key={`${cardId}-${i}`}
              cardId={cardId}
              selected={selection.mode === 'hand' && selection.index === i}
              affordable={canAct && getCard(cardId).cost <= me.mana && state.phase === 'main'}
              onClick={() => clickHandCard(i)}
            />
          ))}
        </div>
        {selectedHandCard && (
          <p className={`mt-1 text-center text-xs ${canAffordSelected ? 'text-slate-400' : 'text-red-400'}`}>
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
          <div className="w-80 rounded-xl border border-slate-600 bg-slate-900 p-4 text-center shadow-2xl">
            <p className="mb-1 font-semibold text-amber-100">{lx(dicePromptCard.name)}</p>
            <p className="mb-3 text-xs text-slate-300">
              {t('dice_prompt', {
                label: lx(dicePromptCard.dice.label),
                t: effectiveThreshold(me.lanes[selection.attacker.lane][selection.attacker.slot]!),
                n: dicePromptCard.dice.manaCost,
              })}
            </p>
            <div className="flex justify-center gap-2">
              <button
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
