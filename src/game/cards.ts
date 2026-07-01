/**
 * Card catalog — GDD §4.
 *
 * Attack values and mana costs of dice abilities are Fáza 1 balancing
 * assumptions (the GDD specifies HP, rarity and mechanics but not attack
 * stats); tune them after Pass & Play testing. Emoji glyphs stand in for
 * the R2-hosted art until Fáza 3.
 */
import type { CardDef, UnitCardDef } from './types';

export const CARDS: Record<string, CardDef> = {};

function define<T extends CardDef>(card: T): T {
  CARDS[card.id] = card;
  return card;
}

// ── Frakcia: Lávový dvor (Útok a Deštrukcia) ────────────────────────────────

export const MEGADRAK = define<UnitCardDef>({
  type: 'unit',
  id: 'megadrak',
  name: 'Megadrak',
  faction: 'lava',
  rarity: 'legendary',
  cost: 6,
  attack: 3,
  maxHp: 6,
  armor: 0,
  lane: 'vanguard',
  keywords: ['lavaTouch', 'acidTouch', 'pestControl'],
  dice: {
    label: 'Piškvorkový plošný útok',
    threshold: 3,
    manaCost: 2,
    activation: false,
    effect: { kind: 'aoe' },
  },
  text: 'Láva ∞: útoky zapaľujú. Kyselina ∞: útoky trvalo znižujú brnenie. Vyhubenie: tokeny zabíja okamžite. Kocka 3+ (2 many): útok zasiahne aj susedné sloty do kríža.',
  glyph: '🐉',
});

export const PEKELNE_ZAKLINADLO = define<CardDef>({
  type: 'spell',
  id: 'pekelne_zaklinadlo',
  name: 'Pekelné zaklínadlo',
  faction: 'lava',
  rarity: 'legendary',
  cost: 3,
  spell: {
    kind: 'infernalChain',
    healPerSuccess: 1,
    damagePerSuccess: 2,
    overloadSelfDamage: 3,
  },
  text: 'Hádž kockou: pri 3–5 udelí cieľu 2 poškodenie, vráti ti 1 HP a hádžeš znova. Pri 1–2 sa reťaz ukončí bez postihu. Pri 6 reťaz končí a tvoj Nexus utrpí 3 poškodenie (Overload).',
  glyph: '🔥',
});

export const LAVOVY_SKRIATOK = define<UnitCardDef>({
  type: 'unit',
  id: 'lavovy_skriatok',
  name: 'Lávový škriatok',
  faction: 'lava',
  rarity: 'common',
  cost: 1,
  attack: 1,
  maxHp: 1,
  armor: 0,
  lane: 'vanguard',
  token: true,
  keywords: ['lavaTouch'],
  text: 'Token. Láva ∞: útoky zapaľujú cieľ.',
  glyph: '👺',
});

// ── Frakcia: Prírodný a Zemský Pakt (Obrana a Stabilita) ────────────────────

export const GORILA = define<UnitCardDef>({
  type: 'unit',
  id: 'gorila',
  name: 'Gorila',
  faction: 'nature',
  rarity: 'legendary',
  cost: 6,
  attack: 2,
  maxHp: 6,
  armor: 1,
  lane: 'vanguard',
  keywords: ['advantage'],
  dice: {
    label: 'Defenzívny hod',
    threshold: 5,
    manaCost: 1,
    activation: true,
    effect: { kind: 'fortify', heal: 3, armor: 3 },
  },
  text: 'Výhoda: pri hodoch hádže 2× D6 a berie lepší výsledok. Kocka 5+ (1 mana): vylieči si 3 HP a získa 3 brnenie.',
  glyph: '🦍',
});

export const KAMENNY_STRAZCA = define<UnitCardDef>({
  type: 'unit',
  id: 'kamenny_strazca',
  name: 'Kamenný strážca',
  faction: 'nature',
  rarity: 'common',
  cost: 2,
  attack: 1,
  maxHp: 4,
  armor: 1,
  lane: 'vanguard',
  keywords: [],
  text: 'Pevný obranca predného voja.',
  glyph: '🗿',
});

export const ZLATY_GRYF = define<UnitCardDef>({
  type: 'unit',
  id: 'zlaty_gryf',
  name: 'Zlatý Gryf',
  faction: 'nature',
  rarity: 'rare',
  cost: 4,
  attack: 2,
  maxHp: 5,
  armor: 0,
  lane: 'sanctum',
  keywords: ['flying'],
  dice: {
    label: 'Požehnanie predného voja',
    threshold: 3,
    manaCost: 2,
    activation: true,
    effect: { kind: 'blessVanguard', heal: 2, armor: 1 },
  },
  text: 'Kocka 3+ (2 many): každá tvoja jednotka vo Vanguarde si vylieči 2 HP a získa 1 brnenie.',
  glyph: '🦅',
});

// ── Frakcia: Nebeský Zbor (Mobilita a Podfuky) ──────────────────────────────

export const PAPAGAJ = define<UnitCardDef>({
  type: 'unit',
  id: 'papagaj',
  name: 'Papagáj',
  faction: 'celestial',
  rarity: 'legendary',
  cost: 6,
  attack: 2,
  maxHp: 6,
  armor: 0,
  lane: 'sanctum',
  keywords: ['acidTouch', 'flying'],
  dice: {
    label: 'Kyselinová spŕška',
    threshold: 1,
    manaCost: 1,
    activation: false,
    effect: { kind: 'acidBlast', stacks: 2 },
  },
  text: 'Letec. Kyselina ∞: útoky trvalo znižujú brnenie. Stabilita — Kocka 1+ (1 mana): spŕška 2 kyseliny navyše, hod prakticky nemôže zlyhať.',
  glyph: '🦜',
});

export const BOJOVY_KOHUT = define<UnitCardDef>({
  type: 'unit',
  id: 'bojovy_kohut',
  name: 'Bojový Kohút',
  faction: 'celestial',
  rarity: 'rare',
  cost: 4,
  attack: 2,
  maxHp: 6,
  armor: 0,
  lane: 'vanguard',
  keywords: ['berserker'],
  dice: {
    label: 'Berserk',
    threshold: 5,
    manaCost: 1,
    activation: false,
    effect: { kind: 'berserk', bonusDamage: 4 },
  },
  text: 'Berserker — Kocka (1 mana): +4 poškodenie. Požiadavka klesá so zraneniami: plné HP 5+, každé chýbajúce HP ju znižuje o 1 (najmenej 2+).',
  glyph: '🐓',
});

export const OPICI_KRAL = define<UnitCardDef>({
  type: 'unit',
  id: 'opici_kral',
  name: 'Opičí Kráľ',
  faction: 'celestial',
  rarity: 'rare',
  cost: 3,
  attack: 2,
  maxHp: 4,
  armor: 0,
  lane: 'vanguard',
  keywords: ['agile'],
  text: 'Agilná: raz za ťah sa počas bojovej fázy môže presunúť medzi Vanguardom a Sanctom (uhýba sa AoE útokom).',
  glyph: '🐒',
});

export const NEBESKY_VRABEC = define<UnitCardDef>({
  type: 'unit',
  id: 'nebesky_vrabec',
  name: 'Nebeský vrabec',
  faction: 'celestial',
  rarity: 'common',
  cost: 2,
  attack: 2,
  maxHp: 2,
  armor: 0,
  lane: 'sanctum',
  keywords: ['flying'],
  text: 'Letec. Rýchly prieskumník Nebeského zboru.',
  glyph: '🐦',
});

/** Shared Fáza 1 test deck — both Pass & Play players run the same list. */
export const STARTER_DECK: string[] = [
  'lavovy_skriatok',
  'lavovy_skriatok',
  'kamenny_strazca',
  'kamenny_strazca',
  'nebesky_vrabec',
  'nebesky_vrabec',
  'opici_kral',
  'opici_kral',
  'pekelne_zaklinadlo',
  'pekelne_zaklinadlo',
  'zlaty_gryf',
  'zlaty_gryf',
  'bojovy_kohut',
  'bojovy_kohut',
  'megadrak',
  'gorila',
  'papagaj',
];

export function getCard(id: string): CardDef {
  const card = CARDS[id];
  if (!card) throw new Error(`Neznáma karta: ${id}`);
  return card;
}

export function getUnitCard(id: string): UnitCardDef {
  const card = getCard(id);
  if (card.type !== 'unit') throw new Error(`Karta ${id} nie je jednotka`);
  return card;
}
