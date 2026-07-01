var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/game/constants.ts
var VANGUARD_SLOTS = 4;
var SANCTUM_SLOTS = 4;
var NEXUS_HP = 30;
var MAX_MANA = 10;
var STARTING_HAND = 4;
var BURN_TICK_DAMAGE = 1;

// src/game/cards.ts
var CARDS = {};
function define(card) {
  CARDS[card.id] = card;
  return card;
}
__name(define, "define");
var MEGADRAK = define({
  type: "unit",
  id: "megadrak",
  name: "Megadrak",
  faction: "lava",
  rarity: "legendary",
  cost: 6,
  attack: 3,
  maxHp: 6,
  armor: 0,
  lane: "vanguard",
  keywords: ["lavaTouch", "acidTouch", "pestControl"],
  dice: {
    label: "Pi\u0161kvorkov\xFD plo\u0161n\xFD \xFAtok",
    threshold: 3,
    manaCost: 2,
    activation: false,
    effect: { kind: "aoe" }
  },
  text: "L\xE1va \u221E: \xFAtoky zapa\u013Euj\xFA. Kyselina \u221E: \xFAtoky trvalo zni\u017Euj\xFA brnenie. Vyhubenie: tokeny zab\xEDja okam\u017Eite. Kocka 3+ (2 many): \xFAtok zasiahne aj susedn\xE9 sloty do kr\xED\u017Ea.",
  glyph: "\u{1F409}"
});
var PEKELNE_ZAKLINADLO = define({
  type: "spell",
  id: "pekelne_zaklinadlo",
  name: "Pekeln\xE9 zakl\xEDnadlo",
  faction: "lava",
  rarity: "legendary",
  cost: 3,
  spell: {
    kind: "infernalChain",
    healPerSuccess: 1,
    damagePerSuccess: 2,
    overloadSelfDamage: 3
  },
  text: "H\xE1d\u017E kockou: pri 3\u20135 udel\xED cie\u013Eu 2 po\u0161kodenie, vr\xE1ti ti 1 HP a h\xE1d\u017Ee\u0161 znova. Pri 1\u20132 sa re\u0165az ukon\u010D\xED bez postihu. Pri 6 re\u0165az kon\u010D\xED a tvoj Nexus utrp\xED 3 po\u0161kodenie (Overload).",
  glyph: "\u{1F525}"
});
var LAVOVY_SKRIATOK = define({
  type: "unit",
  id: "lavovy_skriatok",
  name: "L\xE1vov\xFD \u0161kriatok",
  faction: "lava",
  rarity: "common",
  cost: 1,
  attack: 1,
  maxHp: 1,
  armor: 0,
  lane: "vanguard",
  token: true,
  keywords: ["lavaTouch"],
  text: "Token. L\xE1va \u221E: \xFAtoky zapa\u013Euj\xFA cie\u013E.",
  glyph: "\u{1F47A}"
});
var GORILA = define({
  type: "unit",
  id: "gorila",
  name: "Gorila",
  faction: "nature",
  rarity: "legendary",
  cost: 6,
  attack: 2,
  maxHp: 6,
  armor: 1,
  lane: "vanguard",
  keywords: ["advantage"],
  dice: {
    label: "Defenz\xEDvny hod",
    threshold: 5,
    manaCost: 1,
    activation: true,
    effect: { kind: "fortify", heal: 3, armor: 3 }
  },
  text: "V\xFDhoda: pri hodoch h\xE1d\u017Ee 2\xD7 D6 a berie lep\u0161\xED v\xFDsledok. Kocka 5+ (1 mana): vylie\u010Di si 3 HP a z\xEDska 3 brnenie.",
  glyph: "\u{1F98D}"
});
var KAMENNY_STRAZCA = define({
  type: "unit",
  id: "kamenny_strazca",
  name: "Kamenn\xFD str\xE1\u017Eca",
  faction: "nature",
  rarity: "common",
  cost: 2,
  attack: 1,
  maxHp: 4,
  armor: 1,
  lane: "vanguard",
  keywords: [],
  text: "Pevn\xFD obranca predn\xE9ho voja.",
  glyph: "\u{1F5FF}"
});
var ZLATY_GRYF = define({
  type: "unit",
  id: "zlaty_gryf",
  name: "Zlat\xFD Gryf",
  faction: "nature",
  rarity: "rare",
  cost: 4,
  attack: 2,
  maxHp: 5,
  armor: 0,
  lane: "sanctum",
  keywords: ["flying"],
  dice: {
    label: "Po\u017Eehnanie predn\xE9ho voja",
    threshold: 3,
    manaCost: 2,
    activation: true,
    effect: { kind: "blessVanguard", heal: 2, armor: 1 }
  },
  text: "Kocka 3+ (2 many): ka\u017Ed\xE1 tvoja jednotka vo Vanguarde si vylie\u010Di 2 HP a z\xEDska 1 brnenie.",
  glyph: "\u{1F985}"
});
var PAPAGAJ = define({
  type: "unit",
  id: "papagaj",
  name: "Papag\xE1j",
  faction: "celestial",
  rarity: "legendary",
  cost: 6,
  attack: 2,
  maxHp: 6,
  armor: 0,
  lane: "sanctum",
  keywords: ["acidTouch", "flying"],
  dice: {
    label: "Kyselinov\xE1 sp\u0155\u0161ka",
    threshold: 1,
    manaCost: 1,
    activation: false,
    effect: { kind: "acidBlast", stacks: 2 }
  },
  text: "Letec. Kyselina \u221E: \xFAtoky trvalo zni\u017Euj\xFA brnenie. Stabilita \u2014 Kocka 1+ (1 mana): sp\u0155\u0161ka 2 kyseliny navy\u0161e, hod prakticky nem\xF4\u017Ee zlyha\u0165.",
  glyph: "\u{1F99C}"
});
var BOJOVY_KOHUT = define({
  type: "unit",
  id: "bojovy_kohut",
  name: "Bojov\xFD Koh\xFAt",
  faction: "celestial",
  rarity: "rare",
  cost: 4,
  attack: 2,
  maxHp: 6,
  armor: 0,
  lane: "vanguard",
  keywords: ["berserker"],
  dice: {
    label: "Berserk",
    threshold: 5,
    manaCost: 1,
    activation: false,
    effect: { kind: "berserk", bonusDamage: 4 }
  },
  text: "Berserker \u2014 Kocka (1 mana): +4 po\u0161kodenie. Po\u017Eiadavka kles\xE1 so zraneniami: pln\xE9 HP 5+, ka\u017Ed\xE9 ch\xFDbaj\xFAce HP ju zni\u017Euje o 1 (najmenej 2+).",
  glyph: "\u{1F413}"
});
var OPICI_KRAL = define({
  type: "unit",
  id: "opici_kral",
  name: "Wukong, Opi\u010D\xED Kr\xE1\u013E",
  faction: "celestial",
  rarity: "rare",
  cost: 3,
  attack: 2,
  maxHp: 4,
  armor: 0,
  lane: "vanguard",
  keywords: ["agile"],
  text: "Agiln\xE1: raz za \u0165ah sa po\u010Das bojovej f\xE1zy m\xF4\u017Ee presun\xFA\u0165 medzi Vanguardom a Sanctom (uh\xFDba sa AoE \xFAtokom).",
  glyph: "\u{1F412}"
});
var MEDVEBOR = define({
  type: "unit",
  id: "medvebor",
  name: "Medvebor, Velesov \u0160ampi\xF3n",
  faction: "nature",
  rarity: "legendary",
  cost: 5,
  attack: 3,
  maxHp: 7,
  armor: 1,
  lane: "vanguard",
  keywords: [],
  dice: {
    label: "Roz\u0165atie kolovratom",
    threshold: 4,
    manaCost: 2,
    activation: false,
    effect: { kind: "cleave" }
  },
  text: "Kocka 4+ (2 many): sekera zasiahne aj jednotky na\u013Eavo a napravo od cie\u013Ea v tej istej l\xEDnii.",
  glyph: "\u{1F43B}"
});
var MAHISA = define({
  type: "unit",
  id: "mahisa",
  name: "Mahi\u0161a, Chr\xE1mov\xFD B\xFDk",
  faction: "nature",
  rarity: "rare",
  cost: 5,
  attack: 3,
  maxHp: 7,
  armor: 1,
  lane: "vanguard",
  keywords: [],
  dice: {
    label: "Spla\u0161en\xFD v\xFDpad",
    threshold: 4,
    manaCost: 1,
    activation: false,
    effect: { kind: "berserk", bonusDamage: 3 }
  },
  text: "Kocka 4+ (1 mana): rozbehnut\xFD b\xFDk udel\xED cie\u013Eu +3 po\u0161kodenie navy\u0161e.",
  glyph: "\u{1F403}"
});
var CHEPRI = define({
  type: "unit",
  id: "chepri",
  name: "Chepri, Skarabejsk\xFD Str\xE1\u017Eca",
  faction: "nature",
  rarity: "rare",
  cost: 4,
  attack: 2,
  maxHp: 5,
  armor: 2,
  lane: "vanguard",
  keywords: ["flying"],
  dice: {
    label: "Znovuzrodenie slnka",
    threshold: 3,
    manaCost: 1,
    activation: true,
    effect: { kind: "fortify", heal: 2, armor: 2 }
  },
  text: "Letec. Kocka 3+ (1 mana): chit\xEDnov\xFD pancier sa obnov\xED \u2014 vylie\u010Di si 2 HP a z\xEDska 2 brnenie.",
  glyph: "\u{1FAB2}"
});
var RYSOSLAV = define({
  type: "unit",
  id: "rysoslav",
  name: "Rysoslav, \u017Drec Per\xFAna",
  faction: "celestial",
  rarity: "legendary",
  cost: 4,
  attack: 1,
  maxHp: 4,
  armor: 0,
  lane: "sanctum",
  keywords: [],
  dice: {
    label: "Per\xFAnov hnev",
    threshold: 4,
    manaCost: 2,
    activation: true,
    effect: { kind: "stormcall", damage: 1 }
  },
  text: "Kocka 4+ (2 many): zvol\xE1 b\xFArku \u2014 ka\u017Ed\xE1 nepriate\u013Esk\xE1 jednotka na ploche utrp\xED 1 po\u0161kodenie.",
  glyph: "\u{1F406}"
});
var NEBESKY_VRABEC = define({
  type: "unit",
  id: "nebesky_vrabec",
  name: "Nebesk\xFD vrabec",
  faction: "celestial",
  rarity: "common",
  cost: 2,
  attack: 2,
  maxHp: 2,
  armor: 0,
  lane: "sanctum",
  keywords: ["flying"],
  text: "Letec. R\xFDchly prieskumn\xEDk Nebesk\xE9ho zboru.",
  glyph: "\u{1F426}"
});
var STARTER_DECK = [
  "lavovy_skriatok",
  "lavovy_skriatok",
  "kamenny_strazca",
  "kamenny_strazca",
  "nebesky_vrabec",
  "nebesky_vrabec",
  "opici_kral",
  "opici_kral",
  "pekelne_zaklinadlo",
  "pekelne_zaklinadlo",
  "zlaty_gryf",
  "zlaty_gryf",
  "bojovy_kohut",
  "bojovy_kohut",
  "chepri",
  "mahisa",
  "medvebor",
  "rysoslav",
  "megadrak",
  "gorila",
  "papagaj"
];
function getCard(id) {
  const card = CARDS[id];
  if (!card) throw new Error(`Nezn\xE1ma karta: ${id}`);
  return card;
}
__name(getCard, "getCard");
function getUnitCard(id) {
  const card = getCard(id);
  if (card.type !== "unit") throw new Error(`Karta ${id} nie je jednotka`);
  return card;
}
__name(getUnitCard, "getUnitCard");

// src/game/dice.ts
function rollD6(rng) {
  return Math.floor(rng() * 6) + 1;
}
__name(rollD6, "rollD6");
function rollCheck(rng, threshold, advantage) {
  const rolls = advantage ? [rollD6(rng), rollD6(rng)] : [rollD6(rng)];
  const kept = Math.max(...rolls);
  return { rolls, kept, success: kept >= threshold };
}
__name(rollCheck, "rollCheck");
function rollChain(rng, maxRolls = 20) {
  const rolls = [];
  let successes = 0;
  while (rolls.length < maxRolls) {
    const roll = rollD6(rng);
    rolls.push(roll);
    if (roll === 6) return { rolls, successes, outcome: "overload" };
    if (roll <= 2) return { rolls, successes, outcome: "stopped" };
    successes++;
  }
  return { rolls, successes, outcome: "stopped" };
}
__name(rollChain, "rollChain");

// src/game/engine.ts
function shuffle(items, rng) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
__name(shuffle, "shuffle");
function createPlayer(id, name, rng) {
  const deck = shuffle(STARTER_DECK, rng);
  return {
    id,
    name,
    nexusHp: NEXUS_HP,
    mana: 0,
    maxMana: 0,
    deck,
    hand: deck.splice(0, STARTING_HAND),
    lanes: {
      vanguard: Array(VANGUARD_SLOTS).fill(null),
      sanctum: Array(SANCTUM_SLOTS).fill(null)
    }
  };
}
__name(createPlayer, "createPlayer");
function createGame(rng, names = ["Hr\xE1\u010D 1", "Hr\xE1\u010D 2"]) {
  const state = {
    players: {
      p1: createPlayer("p1", names[0], rng),
      p2: createPlayer("p2", names[1], rng)
    },
    active: "p1",
    turn: 1,
    phase: "main",
    winner: null,
    log: [],
    nextUid: 1,
    nextLogId: 1
  };
  startTurn(state);
  logText(state, `Z\xE1pas za\u010D\xEDna \u2014 na \u0165ahu je ${state.players.p1.name}.`);
  return state;
}
__name(createGame, "createGame");
function opponentOf(player) {
  return player === "p1" ? "p2" : "p1";
}
__name(opponentOf, "opponentOf");
function logText(state, text) {
  state.log.push({ id: state.nextLogId++, kind: "text", text });
}
__name(logText, "logText");
function unitAt(player, ref) {
  return player.lanes[ref.lane][ref.slot] ?? null;
}
__name(unitAt, "unitAt");
function cardOf(unit) {
  return getUnitCard(unit.cardId);
}
__name(cardOf, "cardOf");
function laneHasUnits(player, lane) {
  return player.lanes[lane].some((u) => u !== null);
}
__name(laneHasUnits, "laneHasUnits");
function effectiveThreshold(unit) {
  const card = cardOf(unit);
  if (!card.dice) return 7;
  if (!card.keywords.includes("berserker")) return card.dice.threshold;
  return Math.max(2, card.dice.threshold - (unit.maxHp - unit.hp));
}
__name(effectiveThreshold, "effectiveThreshold");
function damageNexus(state, player, amount) {
  const p = state.players[player];
  p.nexusHp -= amount;
  logText(state, `Nexus hr\xE1\u010Da ${p.name} utrpel ${amount} po\u0161kodenie (${Math.max(0, p.nexusHp)} HP).`);
  if (p.nexusHp <= 0 && !state.winner) {
    state.winner = opponentOf(player);
    logText(state, `\u{1F3C6} ${state.players[state.winner].name} v\xED\u0165az\xED \u2014 Nexus s\xFApera padol!`);
  }
}
__name(damageNexus, "damageNexus");
function damageUnit(state, owner, ref, amount, opts = {}) {
  const player = state.players[owner];
  const unit = unitAt(player, ref);
  if (!unit) return;
  const card = cardOf(unit);
  if (opts.pestControl && card.token) {
    unit.hp = 0;
    logText(state, `Vyhubenie: ${card.name} je okam\u017Eite zni\u010Den\xFD (\u0161t\xEDty ignorovan\xE9).`);
  } else {
    const absorbed = Math.min(unit.armor, amount);
    unit.armor -= absorbed;
    unit.hp -= amount - absorbed;
    logText(
      state,
      `${card.name} utrpel ${amount} po\u0161kodenie${absorbed ? ` (${absorbed} pohltilo brnenie)` : ""}.`
    );
  }
  cleanupIfDead(state, owner, ref);
}
__name(damageUnit, "damageUnit");
function applyAcid(state, owner, ref, stacks) {
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
    shredded ? `-${shredded} brnenie` : "",
    bled ? `-${bled} HP` : ""
  ].filter(Boolean);
  logText(state, `Kyselina lept\xE1 ${card.name}: ${parts.join(", ")}.`);
  cleanupIfDead(state, owner, ref);
}
__name(applyAcid, "applyAcid");
function cleanupIfDead(state, owner, ref) {
  const player = state.players[owner];
  const unit = unitAt(player, ref);
  if (unit && unit.hp <= 0) {
    player.lanes[ref.lane][ref.slot] = null;
    logText(state, `${cardOf(unit).name} umiera.`);
  }
}
__name(cleanupIfDead, "cleanupIfDead");
function laneNeighbors(ref) {
  const laneSize = ref.lane === "vanguard" ? VANGUARD_SLOTS : SANCTUM_SLOTS;
  const neighbors = [];
  if (ref.slot > 0) neighbors.push({ lane: ref.lane, slot: ref.slot - 1 });
  if (ref.slot < laneSize - 1) neighbors.push({ lane: ref.lane, slot: ref.slot + 1 });
  return neighbors;
}
__name(laneNeighbors, "laneNeighbors");
function crossNeighbors(ref) {
  const otherLane = ref.lane === "vanguard" ? "sanctum" : "vanguard";
  return [...laneNeighbors(ref), { lane: otherLane, slot: ref.slot }];
}
__name(crossNeighbors, "crossNeighbors");
function assertLegalTarget(state, attacker, target) {
  const defender = state.players[opponentOf(attacker)];
  if (target.kind === "nexus" || target.lane === "sanctum") {
    if (laneHasUnits(defender, "vanguard")) {
      throw new Error("Predn\xFD voj s\xFApera chr\xE1ni zadn\xFA l\xEDniu \u2014 najprv ho preraz.");
    }
  }
  if (target.kind === "unit" && !unitAt(defender, target)) {
    throw new Error("Na cie\u013Eovom slote nie je \u017Eiadna jednotka.");
  }
}
__name(assertLegalTarget, "assertLegalTarget");
function startTurn(state) {
  const player = state.players[state.active];
  player.maxMana = Math.min(MAX_MANA, player.maxMana + 1);
  player.mana = player.maxMana;
  state.phase = "main";
  const drawn = player.deck.shift();
  if (drawn) player.hand.push(drawn);
  for (const lane of ["vanguard", "sanctum"]) {
    player.lanes[lane].forEach((unit, slot) => {
      if (!unit) return;
      unit.ready = true;
      unit.movedThisTurn = false;
      if (unit.burn > 0) {
        const dmg = unit.burn * BURN_TICK_DAMAGE;
        unit.hp -= dmg;
        logText(state, `\u{1F525} ${cardOf(unit).name} hor\xED a str\xE1ca ${dmg} HP.`);
        cleanupIfDead(state, player.id, { lane, slot });
      }
    });
  }
}
__name(startTurn, "startTurn");
function applyAction(prev, action, rng) {
  if (prev.winner) throw new Error("Z\xE1pas sa u\u017E skon\u010Dil.");
  if (action.player !== prev.active) throw new Error("Nie si na \u0165ahu.");
  const state = structuredClone(prev);
  switch (action.type) {
    case "PLAY_CARD":
      playCard(state, action, rng);
      break;
    case "ENTER_COMBAT":
      if (state.phase !== "main") throw new Error("Bojov\xE1 f\xE1za u\u017E prebieha.");
      state.phase = "combat";
      logText(state, `${state.players[state.active].name} vstupuje do bojovej f\xE1zy.`);
      break;
    case "ATTACK":
      attack(state, action.attacker, action.target, action.useDice, rng);
      break;
    case "ACTIVATE":
      activate(state, action.unit, rng);
      break;
    case "MOVE_UNIT":
      moveUnit(state, action.from, action.to);
      break;
    case "END_TURN": {
      state.active = opponentOf(state.active);
      state.turn++;
      startTurn(state);
      logText(state, `\u0164ah ${state.turn} \u2014 na rade je ${state.players[state.active].name}.`);
      break;
    }
  }
  return state;
}
__name(applyAction, "applyAction");
function playCard(state, action, rng) {
  if (state.phase !== "main") throw new Error("Karty m\xF4\u017Ee\u0161 vyklada\u0165 iba v hlavnej f\xE1ze.");
  const player = state.players[state.active];
  const cardId = player.hand[action.handIndex];
  if (!cardId) throw new Error("Neplatn\xE1 karta v ruke.");
  const card = getCard(cardId);
  if (card.cost > player.mana) throw new Error("Nedostatok many.");
  if (card.type === "unit") {
    const lane = action.lane;
    const slot = action.slot;
    if (lane === void 0 || slot === void 0) throw new Error("Vyber slot pre jednotku.");
    if (lane !== card.lane) {
      throw new Error(`${card.name} patr\xED do l\xEDnie ${card.lane === "vanguard" ? "Vanguard" : "Sanctum"}.`);
    }
    if (player.lanes[lane][slot]) throw new Error("Slot je obsaden\xFD.");
    player.mana -= card.cost;
    player.hand.splice(action.handIndex, 1);
    player.lanes[lane][slot] = {
      uid: state.nextUid++,
      cardId: card.id,
      hp: card.maxHp,
      maxHp: card.maxHp,
      armor: card.armor,
      burn: 0,
      ready: false,
      // summoning sickness — acts from the owner's next turn
      movedThisTurn: false
    };
    logText(state, `${player.name} povol\xE1va ${card.name} (${lane === "vanguard" ? "Vanguard" : "Sanctum"}).`);
  } else {
    castInfernalChain(state, action, card, rng);
  }
}
__name(playCard, "playCard");
function castInfernalChain(state, action, card, rng) {
  if (card.type !== "spell") throw new Error("Karta nie je k\xFAzlo.");
  const target = action.target;
  if (!target || target.kind !== "unit" || target.player === state.active) {
    throw new Error("Vyber nepriate\u013Esk\xFA jednotku ako cie\u013E k\xFAzla.");
  }
  const player = state.players[state.active];
  if (!unitAt(state.players[target.player], target)) {
    throw new Error("Na cie\u013Eovom slote nie je \u017Eiadna jednotka.");
  }
  player.mana -= card.cost;
  player.hand.splice(action.handIndex, 1);
  logText(state, `${player.name} zosiela ${card.name}.`);
  const chain = rollChain(rng);
  state.log.push({
    id: state.nextLogId++,
    kind: "dice",
    player: state.active,
    label: card.name,
    rolls: chain.rolls,
    kept: chain.rolls[chain.rolls.length - 1],
    threshold: 3,
    success: chain.successes > 0
  });
  const enemyId = opponentOf(state.active);
  for (const roll of chain.rolls) {
    if (roll >= 3 && roll <= 5) {
      const targetUnit = unitAt(state.players[enemyId], target);
      if (targetUnit) {
        damageUnit(state, enemyId, target, card.spell.damagePerSuccess);
      } else {
        damageNexus(state, enemyId, card.spell.damagePerSuccess);
      }
      player.nexusHp = Math.min(NEXUS_HP, player.nexusHp + card.spell.healPerSuccess);
    }
  }
  if (chain.outcome === "overload") {
    logText(state, `\u{1F4A5} Overload! Padla 6 \u2014 k\xFAzlo sa vymyk\xE1 spod kontroly.`);
    damageNexus(state, state.active, card.spell.overloadSelfDamage);
  } else {
    logText(state, `Re\u0165az sa bezpe\u010Dne kon\u010D\xED (${chain.successes}\xD7 \xFAspech).`);
  }
}
__name(castInfernalChain, "castInfernalChain");
function attack(state, attackerRef, target, useDice, rng) {
  if (state.phase !== "combat") throw new Error("\xDAto\u010Di\u0165 m\xF4\u017Ee\u0161 iba v bojovej f\xE1ze.");
  const player = state.players[state.active];
  const attacker = unitAt(player, attackerRef);
  if (!attacker) throw new Error("Na tomto slote nem\xE1\u0161 jednotku.");
  if (!attacker.ready) throw new Error("Jednotka u\u017E tento \u0165ah konala.");
  const card = cardOf(attacker);
  assertLegalTarget(state, state.active, target);
  let diceSuccess = false;
  if (useDice) {
    if (!card.dice || card.dice.activation) throw new Error("T\xE1to jednotka nem\xE1 kockov\xFD \xFAtok.");
    if (player.mana < card.dice.manaCost) throw new Error("Nedostatok many na hod kockou.");
    player.mana -= card.dice.manaCost;
    const roll = rollCheck(rng, effectiveThreshold(attacker), card.keywords.includes("advantage"));
    state.log.push({
      id: state.nextLogId++,
      kind: "dice",
      player: state.active,
      label: `${card.name}: ${card.dice.label}`,
      rolls: roll.rolls,
      kept: roll.kept,
      threshold: effectiveThreshold(attacker),
      success: roll.success
    });
    diceSuccess = roll.success;
  }
  attacker.ready = false;
  if (target.kind === "nexus") {
    let damage = card.attack;
    if (diceSuccess && card.dice?.effect.kind === "berserk") damage += card.dice.effect.bonusDamage;
    logText(state, `${card.name} \xFAto\u010D\xED na Nexus.`);
    damageNexus(state, target.player, damage);
    return;
  }
  const enemyId = target.player;
  const primary = { lane: target.lane, slot: target.slot };
  const targets = [primary];
  if (diceSuccess && card.dice?.effect.kind === "aoe") {
    logText(state, `\u{1F4A5} ${card.name} sp\xFA\u0161\u0165a plo\u0161n\xFD \xFAtok do kr\xED\u017Ea!`);
    targets.push(...crossNeighbors(primary));
  } else if (diceSuccess && card.dice?.effect.kind === "cleave") {
    logText(state, `\u{1FA93} ${card.name} roz\u0165at\xEDm zasahuje aj susedov v l\xEDnii!`);
    targets.push(...laneNeighbors(primary));
  }
  for (const ref of targets) {
    const victim = unitAt(state.players[enemyId], ref);
    if (!victim) continue;
    let damage = card.attack;
    const isPrimary = ref.lane === primary.lane && ref.slot === primary.slot;
    if (isPrimary && diceSuccess && card.dice?.effect.kind === "berserk") {
      damage += card.dice.effect.bonusDamage;
    }
    damageUnit(state, enemyId, ref, damage, {
      pestControl: card.keywords.includes("pestControl")
    });
    const survivor = unitAt(state.players[enemyId], ref);
    if (survivor) {
      if (card.keywords.includes("lavaTouch")) {
        survivor.burn += 1;
        logText(state, `\u{1F525} ${cardOf(survivor).name} hor\xED (L\xE1va \u221E).`);
      }
      if (card.keywords.includes("acidTouch")) {
        const extra = isPrimary && diceSuccess && card.dice?.effect.kind === "acidBlast" ? card.dice.effect.stacks : 0;
        applyAcid(state, enemyId, ref, 1 + extra);
      }
    }
  }
}
__name(attack, "attack");
function activate(state, ref, rng) {
  const player = state.players[state.active];
  const unit = unitAt(player, ref);
  if (!unit) throw new Error("Na tomto slote nem\xE1\u0161 jednotku.");
  const card = cardOf(unit);
  if (!card.dice || !card.dice.activation) throw new Error("T\xE1to jednotka nem\xE1 aktivovate\u013En\xFA schopnos\u0165.");
  if (!unit.ready) throw new Error("Jednotka u\u017E tento \u0165ah konala.");
  if (player.mana < card.dice.manaCost) throw new Error("Nedostatok many.");
  player.mana -= card.dice.manaCost;
  unit.ready = false;
  const roll = rollCheck(rng, card.dice.threshold, card.keywords.includes("advantage"));
  state.log.push({
    id: state.nextLogId++,
    kind: "dice",
    player: state.active,
    label: `${card.name}: ${card.dice.label}`,
    rolls: roll.rolls,
    kept: roll.kept,
    threshold: card.dice.threshold,
    success: roll.success
  });
  if (!roll.success) {
    logText(state, `Hod zlyhal \u2014 schopnos\u0165 sa neaktivuje.`);
    return;
  }
  const effect = card.dice.effect;
  if (effect.kind === "fortify") {
    unit.hp = Math.min(unit.maxHp, unit.hp + effect.heal);
    unit.armor += effect.armor;
    logText(state, `\u{1F6E1}\uFE0F ${card.name} sa opev\u0148uje: +${effect.heal} HP, +${effect.armor} brnenie.`);
  } else if (effect.kind === "blessVanguard") {
    for (const ally of player.lanes.vanguard) {
      if (!ally) continue;
      ally.hp = Math.min(ally.maxHp, ally.hp + effect.heal);
      ally.armor += effect.armor;
    }
    logText(state, `\u2728 ${card.name} \u017Eehn\xE1 predn\xFD voj: +${effect.heal} HP, +${effect.armor} brnenie pre Vanguard.`);
  } else if (effect.kind === "stormcall") {
    logText(state, `\u26A1 ${card.name} zvol\xE1va b\xFArku \u2014 blesky bij\xFA do v\u0161etk\xFDch nepriate\u013Eov!`);
    const enemyId = opponentOf(state.active);
    const enemy = state.players[enemyId];
    for (const lane of ["vanguard", "sanctum"]) {
      for (let slot = 0; slot < enemy.lanes[lane].length; slot++) {
        if (enemy.lanes[lane][slot]) damageUnit(state, enemyId, { lane, slot }, effect.damage);
      }
    }
  }
}
__name(activate, "activate");
function moveUnit(state, from, to) {
  if (state.phase !== "combat") throw new Error("Pres\xFAva\u0165 sa d\xE1 iba v bojovej f\xE1ze.");
  const player = state.players[state.active];
  const unit = unitAt(player, from);
  if (!unit) throw new Error("Na tomto slote nem\xE1\u0161 jednotku.");
  const card = cardOf(unit);
  if (!card.keywords.includes("agile")) throw new Error("T\xE1to jednotka sa nevie pres\xFAva\u0165.");
  if (unit.movedThisTurn) throw new Error("Jednotka sa tento \u0165ah u\u017E presunula.");
  if (to.lane === from.lane) throw new Error("Presun mus\xED zmeni\u0165 l\xEDniu.");
  if (player.lanes[to.lane][to.slot]) throw new Error("Cie\u013Eov\xFD slot je obsaden\xFD.");
  player.lanes[to.lane][to.slot] = unit;
  player.lanes[from.lane][from.slot] = null;
  unit.movedThisTurn = true;
  logText(state, `\u{1F412} ${card.name} preskakuje do l\xEDnie ${to.lane === "vanguard" ? "Vanguard" : "Sanctum"}.`);
}
__name(moveUnit, "moveUnit");

// src/net/protocol.ts
function parseClientMessage(raw) {
  try {
    const msg = JSON.parse(raw);
    if (msg && (msg.type === "JOIN_ROOM" || msg.type === "ACTION")) return msg;
  } catch {
  }
  return null;
}
__name(parseClientMessage, "parseClientMessage");

// src/worker/GameRoom.ts
var GameRoom = class {
  static {
    __name(this, "GameRoom");
  }
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  async fetch(request) {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("O\u010Dak\xE1vam WebSocket pripojenie.", { status: 426 });
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  async webSocketMessage(ws, raw) {
    const msg = typeof raw === "string" ? parseClientMessage(raw) : null;
    if (!msg) {
      this.send(ws, { type: "ERROR", message: "Neplatn\xE1 spr\xE1va." });
      return;
    }
    if (msg.type === "JOIN_ROOM") {
      await this.handleJoin(ws, msg.token, msg.name);
    } else {
      await this.handleAction(ws, msg.action);
    }
  }
  async webSocketClose() {
  }
  async handleJoin(ws, token, name) {
    const meta = await this.loadMeta();
    let seat = meta.tokens[token];
    if (!seat) {
      const taken = new Set(Object.values(meta.tokens));
      const free = ["p1", "p2"].find((s) => !taken.has(s));
      if (!free) {
        this.send(ws, { type: "ERROR", message: "Miestnos\u0165 je u\u017E pln\xE1." });
        ws.close(1008, "room full");
        return;
      }
      seat = free;
      meta.tokens[token] = seat;
      meta.names[seat] = name.trim() || (seat === "p1" ? "Hr\xE1\u010D 1" : "Hr\xE1\u010D 2");
      await this.ctx.storage.put("meta", meta);
    }
    ws.serializeAttachment({ seat });
    let game = await this.loadGame();
    if (!game && meta.names.p1 && meta.names.p2) {
      game = createGame(Math.random, [meta.names.p1, meta.names.p2]);
      await this.ctx.storage.put("game", game);
    }
    this.send(ws, { type: "ASSIGNED", seat });
    this.broadcast({ type: "ROOM_STATE", state: game, seats: meta.names });
  }
  async handleAction(ws, action) {
    const attachment = ws.deserializeAttachment();
    if (!attachment) {
      this.send(ws, { type: "ERROR", message: "Najprv sa pripoj do miestnosti." });
      return;
    }
    const game = await this.loadGame();
    if (!game) {
      this.send(ws, { type: "ERROR", message: "Hra e\u0161te neza\u010Dala \u2014 \u010Dak\xE1 sa na druh\xE9ho hr\xE1\u010Da." });
      return;
    }
    if (action.player !== attachment.seat) {
      this.send(ws, { type: "ERROR", message: "Nem\xF4\u017Ee\u0161 hra\u0165 za s\xFApera." });
      return;
    }
    try {
      const next = applyAction(game, action, Math.random);
      await this.ctx.storage.put("game", next);
      const meta = await this.loadMeta();
      this.broadcast({ type: "ROOM_STATE", state: next, seats: meta.names });
    } catch (e) {
      this.send(ws, { type: "ERROR", message: e instanceof Error ? e.message : "Neplatn\xE1 akcia." });
    }
  }
  async loadMeta() {
    return await this.ctx.storage.get("meta") ?? { tokens: {}, names: { p1: null, p2: null } };
  }
  async loadGame() {
    return await this.ctx.storage.get("game") ?? null;
  }
  send(ws, msg) {
    ws.send(JSON.stringify(msg));
  }
  broadcast(msg) {
    for (const ws of this.ctx.getWebSockets()) this.send(ws, msg);
  }
};

// src/worker/index.ts
var ROOM_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function generateRoomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let code = "";
  for (const b of bytes) code += ROOM_ALPHABET[b % ROOM_ALPHABET.length];
  return code;
}
__name(generateRoomCode, "generateRoomCode");
var ROOM_WS_PATTERN = /^\/api\/rooms\/([A-Za-z0-9]{4,12})\/ws$/;
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/rooms" && request.method === "POST") {
      return Response.json({ roomId: generateRoomCode() });
    }
    const wsMatch = url.pathname.match(ROOM_WS_PATTERN);
    if (wsMatch) {
      const roomId = wsMatch[1].toUpperCase();
      const stub = env.GAME_ROOM.get(env.GAME_ROOM.idFromName(roomId));
      return stub.fetch(request);
    }
    if (url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }
    return env.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-7WZIKb/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-7WZIKb/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  GameRoom,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
