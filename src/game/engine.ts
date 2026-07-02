/**
 * Core game engine — a pure reducer over GameState (GDD §2).
 *
 * `applyAction` never mutates its input; it clones, validates, applies and
 * returns the new state, throwing a (Slovak) Error for illegal moves. All
 * randomness comes from the injected Rng. In Fáza 2 this reducer moves
 * server-side into a Cloudflare Durable Object unchanged.
 */
import {
  BURN_TICK_DAMAGE,
  MAX_MANA,
  NEXUS_HP,
  SANCTUM_SLOTS,
  STARTING_HAND,
  VANGUARD_SLOTS,
} from './constants';
import { getCard, getUnitCard, STARTER_DECK } from './cards';
import { rollChain, rollCheck } from './dice';
import type {
  Action,
  GameState,
  LaneId,
  PlayerId,
  PlayerState,
  Rng,
  SlotRef,
  TargetRef,
  UnitCardDef,
  UnitState,
} from './types';

// ── Setup ───────────────────────────────────────────────────────────────────

function shuffle<T>(items: T[], rng: Rng): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createPlayer(id: PlayerId, name: string, rng: Rng, deckList?: string[]): PlayerState {
  const deck = shuffle(deckList ?? STARTER_DECK, rng);
  return {
    id,
    name,
    nexusHp: NEXUS_HP,
    mana: 0,
    maxMana: 0,
    deck,
    hand: deck.splice(0, STARTING_HAND),
    lanes: {
      vanguard: Array<UnitState | null>(VANGUARD_SLOTS).fill(null),
      sanctum: Array<UnitState | null>(SANCTUM_SLOTS).fill(null),
    },
  };
}

export function createGame(
  rng: Rng,
  names: [string, string] = ['Hráč 1', 'Hráč 2'],
  decks?: [string[] | undefined, string[] | undefined],
): GameState {
  const state: GameState = {
    players: {
      p1: createPlayer('p1', names[0], rng, decks?.[0]),
      p2: createPlayer('p2', names[1], rng, decks?.[1]),
    },
    active: 'p1',
    turn: 1,
    phase: 'main',
    winner: null,
    log: [],
    nextUid: 1,
    nextLogId: 1,
  };
  startTurn(state);
  logText(state, `Zápas začína — na ťahu je ${state.players.p1.name}.`);
  return state;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function opponentOf(player: PlayerId): PlayerId {
  return player === 'p1' ? 'p2' : 'p1';
}

function logText(state: GameState, text: string): void {
  state.log.push({ id: state.nextLogId++, kind: 'text', text });
}

function unitAt(player: PlayerState, ref: SlotRef): UnitState | null {
  return player.lanes[ref.lane][ref.slot] ?? null;
}

function cardOf(unit: UnitState): UnitCardDef {
  return getUnitCard(unit.cardId);
}

function laneHasUnits(player: PlayerState, lane: LaneId): boolean {
  return player.lanes[lane].some((u) => u !== null);
}

/** Berserker units need less on the dice the more they are wounded (min 2+). */
export function effectiveThreshold(unit: UnitState): number {
  const card = cardOf(unit);
  if (!card.dice) return 7;
  if (!card.keywords.includes('berserker')) return card.dice.threshold;
  return Math.max(2, card.dice.threshold - (unit.maxHp - unit.hp));
}

function damageNexus(state: GameState, player: PlayerId, amount: number): void {
  const p = state.players[player];
  p.nexusHp -= amount;
  logText(state, `Nexus hráča ${p.name} utrpel ${amount} poškodenie (${Math.max(0, p.nexusHp)} HP).`);
  if (p.nexusHp <= 0 && !state.winner) {
    state.winner = opponentOf(player);
    logText(state, `🏆 ${state.players[state.winner].name} víťazí — Nexus súpera padol!`);
  }
}

/** Armor absorbs damage first; pestControl kills tokens outright, past shields. */
function damageUnit(
  state: GameState,
  owner: PlayerId,
  ref: SlotRef,
  amount: number,
  opts: { pestControl?: boolean } = {},
): void {
  const player = state.players[owner];
  const unit = unitAt(player, ref);
  if (!unit) return;
  const card = cardOf(unit);
  if (opts.pestControl && card.token) {
    unit.hp = 0;
    logText(state, `Vyhubenie: ${card.name} je okamžite zničený (štíty ignorované).`);
  } else {
    const absorbed = Math.min(unit.armor, amount);
    unit.armor -= absorbed;
    unit.hp -= amount - absorbed;
    logText(
      state,
      `${card.name} utrpel ${amount} poškodenie${absorbed ? ` (${absorbed} pohltilo brnenie)` : ''}.`,
    );
  }
  cleanupIfDead(state, owner, ref);
}

/** Kyselina: each stack strips 1 armor; stacks past armor deal 1 damage. */
function applyAcid(state: GameState, owner: PlayerId, ref: SlotRef, stacks: number): void {
  const player = state.players[owner];
  const unit = unitAt(player, ref);
  if (!unit) return;
  const card = cardOf(unit);
  let shredded = 0;
  let bled = 0;
  for (let i = 0; i < stacks; i++) {
    if (unit.armor > 0) {
      unit.armor--;
      shredded++;
    } else {
      unit.hp--;
      bled++;
    }
  }
  const parts = [
    shredded ? `-${shredded} brnenie` : '',
    bled ? `-${bled} HP` : '',
  ].filter(Boolean);
  logText(state, `Kyselina leptá ${card.name}: ${parts.join(', ')}.`);
  cleanupIfDead(state, owner, ref);
}

function cleanupIfDead(state: GameState, owner: PlayerId, ref: SlotRef): void {
  const player = state.players[owner];
  const unit = unitAt(player, ref);
  if (unit && unit.hp <= 0) {
    player.lanes[ref.lane][ref.slot] = null;
    logText(state, `${cardOf(unit).name} umiera.`);
  }
}

/** Left/right neighbours in the same lane (cleave sweep). */
export function laneNeighbors(ref: SlotRef): SlotRef[] {
  const laneSize = ref.lane === 'vanguard' ? VANGUARD_SLOTS : SANCTUM_SLOTS;
  const neighbors: SlotRef[] = [];
  if (ref.slot > 0) neighbors.push({ lane: ref.lane, slot: ref.slot - 1 });
  if (ref.slot < laneSize - 1) neighbors.push({ lane: ref.lane, slot: ref.slot + 1 });
  return neighbors;
}

/** Cross-shaped AoE neighbours (piškvorková mriežka): left, right, and the aligned slot in the other lane. */
export function crossNeighbors(ref: SlotRef): SlotRef[] {
  const otherLane: LaneId = ref.lane === 'vanguard' ? 'sanctum' : 'vanguard';
  return [...laneNeighbors(ref), { lane: otherLane, slot: ref.slot }];
}

/** The vanguard wall: while it stands, sanctum and Nexus cannot be attacked. */
function assertLegalTarget(state: GameState, attacker: PlayerId, target: TargetRef): void {
  const defender = state.players[opponentOf(attacker)];
  if (target.kind === 'nexus' || target.lane === 'sanctum') {
    if (laneHasUnits(defender, 'vanguard')) {
      throw new Error('Predný voj súpera chráni zadnú líniu — najprv ho preraz.');
    }
  }
  if (target.kind === 'unit' && !unitAt(defender, target)) {
    throw new Error('Na cieľovom slote nie je žiadna jednotka.');
  }
}

function startTurn(state: GameState): void {
  const player = state.players[state.active];
  player.maxMana = Math.min(MAX_MANA, player.maxMana + 1);
  player.mana = player.maxMana;
  state.phase = 'main';

  // Draw one card.
  const drawn = player.deck.shift();
  if (drawn) player.hand.push(drawn);

  // Static effects (GDD §2.2): burn ticks on the active player's units.
  for (const lane of ['vanguard', 'sanctum'] as const) {
    player.lanes[lane].forEach((unit, slot) => {
      if (!unit) return;
      unit.ready = true;
      unit.movedThisTurn = false;
      if (unit.burn > 0) {
        const dmg = unit.burn * BURN_TICK_DAMAGE;
        unit.hp -= dmg;
        logText(state, `🔥 ${cardOf(unit).name} horí a stráca ${dmg} HP.`);
        cleanupIfDead(state, player.id, { lane, slot });
      }
    });
  }
}

// ── Actions ─────────────────────────────────────────────────────────────────

export function applyAction(prev: GameState, action: Action, rng: Rng): GameState {
  if (prev.winner) throw new Error('Zápas sa už skončil.');
  if (action.player !== prev.active) throw new Error('Nie si na ťahu.');
  const state = structuredClone(prev);

  switch (action.type) {
    case 'PLAY_CARD':
      playCard(state, action, rng);
      break;
    case 'ENTER_COMBAT':
      if (state.phase !== 'main') throw new Error('Bojová fáza už prebieha.');
      state.phase = 'combat';
      logText(state, `${state.players[state.active].name} vstupuje do bojovej fázy.`);
      break;
    case 'ATTACK':
      attack(state, action.attacker, action.target, action.useDice, rng);
      break;
    case 'ACTIVATE':
      activate(state, action.unit, rng);
      break;
    case 'MOVE_UNIT':
      moveUnit(state, action.from, action.to);
      break;
    case 'END_TURN': {
      state.active = opponentOf(state.active);
      state.turn++;
      startTurn(state);
      logText(state, `Ťah ${state.turn} — na rade je ${state.players[state.active].name}.`);
      break;
    }
  }
  return state;
}

function playCard(
  state: GameState,
  action: Extract<Action, { type: 'PLAY_CARD' }>,
  rng: Rng,
): void {
  if (state.phase !== 'main') throw new Error('Karty môžeš vykladať iba v hlavnej fáze.');
  const player = state.players[state.active];
  const cardId = player.hand[action.handIndex];
  if (!cardId) throw new Error('Neplatná karta v ruke.');
  const card = getCard(cardId);
  if (card.cost > player.mana) throw new Error('Nedostatok many.');

  if (card.type === 'unit') {
    const lane = action.lane;
    const slot = action.slot;
    if (lane === undefined || slot === undefined) throw new Error('Vyber slot pre jednotku.');
    if (lane !== card.lane) {
      throw new Error(`${card.name} patrí do línie ${card.lane === 'vanguard' ? 'Vanguard' : 'Sanctum'}.`);
    }
    if (player.lanes[lane][slot]) throw new Error('Slot je obsadený.');
    player.mana -= card.cost;
    player.hand.splice(action.handIndex, 1);
    player.lanes[lane][slot] = {
      uid: state.nextUid++,
      cardId: card.id,
      hp: card.maxHp,
      maxHp: card.maxHp,
      armor: card.armor,
      burn: 0,
      ready: false, // summoning sickness — acts from the owner's next turn
      movedThisTurn: false,
    };
    logText(state, `${player.name} povoláva ${card.name} (${lane === 'vanguard' ? 'Vanguard' : 'Sanctum'}).`);
  } else {
    castInfernalChain(state, action, card, rng);
  }
}

function castInfernalChain(
  state: GameState,
  action: Extract<Action, { type: 'PLAY_CARD' }>,
  card: ReturnType<typeof getCard>,
  rng: Rng,
): void {
  if (card.type !== 'spell') throw new Error('Karta nie je kúzlo.');
  const target = action.target;
  if (!target || target.kind !== 'unit' || target.player === state.active) {
    throw new Error('Vyber nepriateľskú jednotku ako cieľ kúzla.');
  }
  const player = state.players[state.active];
  // Spells are not "direct attacks" (GDD §2.1) — they ignore the vanguard wall,
  // but the initial target must exist.
  if (!unitAt(state.players[target.player], target)) {
    throw new Error('Na cieľovom slote nie je žiadna jednotka.');
  }
  player.mana -= card.cost;
  player.hand.splice(action.handIndex, 1);
  logText(state, `${player.name} zosiela ${card.name}.`);

  const chain = rollChain(rng);
  state.log.push({
    id: state.nextLogId++,
    kind: 'dice',
    player: state.active,
    label: card.name,
    rolls: chain.rolls,
    kept: chain.rolls[chain.rolls.length - 1],
    threshold: 3,
    success: chain.successes > 0,
  });

  const enemyId = opponentOf(state.active);
  for (const roll of chain.rolls) {
    if (roll >= 3 && roll <= 5) {
      // Successful link: damage the target (or the enemy Nexus once it died) and heal the caster.
      const targetUnit = unitAt(state.players[enemyId], target);
      if (targetUnit) {
        damageUnit(state, enemyId, target, card.spell.damagePerSuccess);
      } else {
        damageNexus(state, enemyId, card.spell.damagePerSuccess);
      }
      player.nexusHp = Math.min(NEXUS_HP, player.nexusHp + card.spell.healPerSuccess);
    }
  }
  if (chain.outcome === 'overload') {
    logText(state, `💥 Overload! Padla 6 — kúzlo sa vymyká spod kontroly.`);
    damageNexus(state, state.active, card.spell.overloadSelfDamage);
  } else {
    logText(state, `Reťaz sa bezpečne končí (${chain.successes}× úspech).`);
  }
}

function attack(
  state: GameState,
  attackerRef: SlotRef,
  target: TargetRef,
  useDice: boolean,
  rng: Rng,
): void {
  if (state.phase !== 'combat') throw new Error('Útočiť môžeš iba v bojovej fáze.');
  const player = state.players[state.active];
  const attacker = unitAt(player, attackerRef);
  if (!attacker) throw new Error('Na tomto slote nemáš jednotku.');
  if (!attacker.ready) throw new Error('Jednotka už tento ťah konala.');
  const card = cardOf(attacker);
  assertLegalTarget(state, state.active, target);

  // Dice rider (GDD §2.3): pay extra mana, roll, unlock the special effect on success.
  let diceSuccess = false;
  if (useDice) {
    if (!card.dice || card.dice.activation) throw new Error('Táto jednotka nemá kockový útok.');
    if (player.mana < card.dice.manaCost) throw new Error('Nedostatok many na hod kockou.');
    player.mana -= card.dice.manaCost;
    const roll = rollCheck(rng, effectiveThreshold(attacker), card.keywords.includes('advantage'));
    state.log.push({
      id: state.nextLogId++,
      kind: 'dice',
      player: state.active,
      label: `${card.name}: ${card.dice.label}`,
      rolls: roll.rolls,
      kept: roll.kept,
      threshold: effectiveThreshold(attacker),
      success: roll.success,
    });
    diceSuccess = roll.success;
  }

  attacker.ready = false;
  state.log.push({
    id: state.nextLogId++,
    kind: 'attack',
    player: state.active,
    from: attackerRef,
    target,
  });

  if (target.kind === 'nexus') {
    let damage = card.attack;
    if (diceSuccess && card.dice?.effect.kind === 'berserk') damage += card.dice.effect.bonusDamage;
    logText(state, `${card.name} útočí na Nexus.`);
    damageNexus(state, target.player, damage);
    return;
  }

  const enemyId = target.player;
  const primary: SlotRef = { lane: target.lane, slot: target.slot };
  const targets: SlotRef[] = [primary];
  if (diceSuccess && card.dice?.effect.kind === 'aoe') {
    logText(state, `💥 ${card.name} spúšťa plošný útok do kríža!`);
    targets.push(...crossNeighbors(primary));
  } else if (diceSuccess && card.dice?.effect.kind === 'cleave') {
    logText(state, `🪓 ${card.name} rozťatím zasahuje aj susedov v línii!`);
    targets.push(...laneNeighbors(primary));
  }

  for (const ref of targets) {
    const victim = unitAt(state.players[enemyId], ref);
    if (!victim) continue;
    let damage = card.attack;
    const isPrimary = ref.lane === primary.lane && ref.slot === primary.slot;
    if (isPrimary && diceSuccess && card.dice?.effect.kind === 'berserk') {
      damage += card.dice.effect.bonusDamage;
    }
    damageUnit(state, enemyId, ref, damage, {
      pestControl: card.keywords.includes('pestControl'),
    });
    // On-hit riders apply to survivors of every hit.
    const survivor = unitAt(state.players[enemyId], ref);
    if (survivor) {
      if (card.keywords.includes('lavaTouch')) {
        survivor.burn += 1;
        logText(state, `🔥 ${cardOf(survivor).name} horí (Láva ∞).`);
      }
      if (card.keywords.includes('acidTouch')) {
        const extra = isPrimary && diceSuccess && card.dice?.effect.kind === 'acidBlast'
          ? card.dice.effect.stacks
          : 0;
        applyAcid(state, enemyId, ref, 1 + extra);
      }
    }
  }
}

function activate(state: GameState, ref: SlotRef, rng: Rng): void {
  const player = state.players[state.active];
  const unit = unitAt(player, ref);
  if (!unit) throw new Error('Na tomto slote nemáš jednotku.');
  const card = cardOf(unit);
  if (!card.dice || !card.dice.activation) throw new Error('Táto jednotka nemá aktivovateľnú schopnosť.');
  if (!unit.ready) throw new Error('Jednotka už tento ťah konala.');
  if (player.mana < card.dice.manaCost) throw new Error('Nedostatok many.');

  player.mana -= card.dice.manaCost;
  unit.ready = false;
  const roll = rollCheck(rng, card.dice.threshold, card.keywords.includes('advantage'));
  state.log.push({
    id: state.nextLogId++,
    kind: 'dice',
    player: state.active,
    label: `${card.name}: ${card.dice.label}`,
    rolls: roll.rolls,
    kept: roll.kept,
    threshold: card.dice.threshold,
    success: roll.success,
  });
  if (!roll.success) {
    logText(state, `Hod zlyhal — schopnosť sa neaktivuje.`);
    return;
  }

  const effect = card.dice.effect;
  if (effect.kind === 'fortify') {
    unit.hp = Math.min(unit.maxHp, unit.hp + effect.heal);
    unit.armor += effect.armor;
    logText(state, `🛡️ ${card.name} sa opevňuje: +${effect.heal} HP, +${effect.armor} brnenie.`);
  } else if (effect.kind === 'blessVanguard') {
    for (const ally of player.lanes.vanguard) {
      if (!ally) continue;
      ally.hp = Math.min(ally.maxHp, ally.hp + effect.heal);
      ally.armor += effect.armor;
    }
    logText(state, `✨ ${card.name} žehná predný voj: +${effect.heal} HP, +${effect.armor} brnenie pre Vanguard.`);
  } else if (effect.kind === 'stormcall') {
    logText(state, `⚡ ${card.name} zvoláva búrku — blesky bijú do všetkých nepriateľov!`);
    const enemyId = opponentOf(state.active);
    const enemy = state.players[enemyId];
    for (const lane of ['vanguard', 'sanctum'] as const) {
      for (let slot = 0; slot < enemy.lanes[lane].length; slot++) {
        if (enemy.lanes[lane][slot]) damageUnit(state, enemyId, { lane, slot }, effect.damage);
      }
    }
  }
}

function moveUnit(state: GameState, from: SlotRef, to: SlotRef): void {
  if (state.phase !== 'combat') throw new Error('Presúvať sa dá iba v bojovej fáze.');
  const player = state.players[state.active];
  const unit = unitAt(player, from);
  if (!unit) throw new Error('Na tomto slote nemáš jednotku.');
  const card = cardOf(unit);
  if (!card.keywords.includes('agile')) throw new Error('Táto jednotka sa nevie presúvať.');
  if (unit.movedThisTurn) throw new Error('Jednotka sa tento ťah už presunula.');
  if (to.lane === from.lane) throw new Error('Presun musí zmeniť líniu.');
  if (player.lanes[to.lane][to.slot]) throw new Error('Cieľový slot je obsadený.');
  player.lanes[to.lane][to.slot] = unit;
  player.lanes[from.lane][from.slot] = null;
  unit.movedThisTurn = true;
  logText(state, `🐒 ${card.name} preskakuje do línie ${to.lane === 'vanguard' ? 'Vanguard' : 'Sanctum'}.`);
}
