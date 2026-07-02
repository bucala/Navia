/**
 * Card catalog — GDD §4. All player-facing text is bilingual (sk/en).
 *
 * Attack values and mana costs of dice abilities are balancing
 * assumptions (the GDD specifies HP, rarity and mechanics but not attack
 * stats); tune them after playtesting. Emoji glyphs stand in for the
 * art files (public/art/) until they are added.
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
  name: { sk: 'Megadrak', en: 'Megadrake' },
  faction: 'lava',
  rarity: 'legendary',
  cost: 6,
  attack: 3,
  maxHp: 6,
  armor: 0,
  lane: 'vanguard',
  keywords: ['lavaTouch', 'acidTouch', 'pestControl'],
  dice: {
    label: { sk: 'Piškvorkový plošný útok', en: 'Cross-Grid Barrage' },
    threshold: 3,
    manaCost: 2,
    activation: false,
    effect: { kind: 'aoe' },
  },
  text: {
    sk: 'Láva ∞: útoky zapaľujú. Kyselina ∞: útoky trvalo znižujú brnenie. Vyhubenie: tokeny zabíja okamžite. Kocka 3+ (2 many): útok zasiahne aj susedné sloty do kríža.',
    en: 'Lava ∞: attacks ignite. Acid ∞: attacks permanently shred armor. Extermination: kills tokens instantly. Dice 3+ (2 mana): the attack also hits adjacent slots in a cross.',
  },
  glyph: '🐉',
  art: '/art/megadrak.jpg',
});

export const PEKELNE_ZAKLINADLO = define<CardDef>({
  type: 'spell',
  id: 'pekelne_zaklinadlo',
  name: { sk: 'Pekelné zaklínadlo', en: 'Infernal Incantation' },
  faction: 'lava',
  rarity: 'legendary',
  cost: 3,
  spell: {
    kind: 'infernalChain',
    healPerSuccess: 1,
    damagePerSuccess: 2,
    overloadSelfDamage: 3,
  },
  text: {
    sk: 'Hádž kockou: pri 3–5 udelí cieľu 2 poškodenie, vráti ti 1 HP a hádžeš znova. Pri 1–2 sa reťaz ukončí bez postihu. Pri 6 reťaz končí a tvoj Nexus utrpí 3 poškodenie (Overload).',
    en: 'Roll the die: on 3–5 deal 2 damage to the target, restore 1 HP and roll again. On 1–2 the chain ends safely. On 6 the chain ends and your Nexus takes 3 damage (Overload).',
  },
  glyph: '🔥',
  art: '/art/pekelne_zaklinadlo.jpg',
});

export const LAVOVY_SKRIATOK = define<UnitCardDef>({
  type: 'unit',
  id: 'lavovy_skriatok',
  name: { sk: 'Lávový škriatok', en: 'Lava Imp' },
  faction: 'lava',
  rarity: 'common',
  cost: 1,
  attack: 1,
  maxHp: 1,
  armor: 0,
  lane: 'vanguard',
  token: true,
  keywords: ['lavaTouch'],
  text: {
    sk: 'Token. Láva ∞: útoky zapaľujú cieľ.',
    en: 'Token. Lava ∞: attacks ignite the target.',
  },
  glyph: '👺',
  art: '/art/lavovy_skriatok.jpg',
});

// ── Frakcia: Prírodný a Zemský Pakt (Obrana a Stabilita) ────────────────────

export const MAHAKAPI = define<UnitCardDef>({
  type: 'unit',
  id: 'gorila',
  name: { sk: 'Mahákapi, Obrnený Titan', en: 'Mahakapi, the Armored Titan' },
  faction: 'nature',
  rarity: 'legendary',
  cost: 6,
  attack: 2,
  maxHp: 6,
  armor: 1,
  lane: 'vanguard',
  keywords: ['advantage'],
  dice: {
    label: { sk: 'Defenzívny hod', en: 'Defensive Roll' },
    threshold: 5,
    manaCost: 1,
    activation: true,
    effect: { kind: 'fortify', heal: 3, armor: 3 },
  },
  text: {
    sk: 'Výhoda: pri hodoch hádže 2× D6 a berie lepší výsledok. Kocka 5+ (1 mana): vylieči si 3 HP a získa 3 brnenie.',
    en: 'Advantage: rolls 2× D6 and keeps the better result. Dice 5+ (1 mana): heals 3 HP and gains 3 armor.',
  },
  glyph: '🦍',
  art: '/art/gorila.jpg',
});

export const KAMENNY_STRAZCA = define<UnitCardDef>({
  type: 'unit',
  id: 'kamenny_strazca',
  name: { sk: 'Kamenný strážca', en: 'Stone Warden' },
  faction: 'nature',
  rarity: 'common',
  cost: 2,
  attack: 1,
  maxHp: 4,
  armor: 1,
  lane: 'vanguard',
  keywords: [],
  text: {
    sk: 'Pevný obranca predného voja.',
    en: 'A steadfast defender of the vanguard.',
  },
  glyph: '🗿',
  art: '/art/kamenny_strazca.jpg',
});

export const ZLATY_GRYF = define<UnitCardDef>({
  type: 'unit',
  id: 'zlaty_gryf',
  name: { sk: 'Zlatý Gryf', en: 'Golden Gryphon' },
  faction: 'nature',
  rarity: 'rare',
  cost: 4,
  attack: 2,
  maxHp: 5,
  armor: 0,
  lane: 'sanctum',
  keywords: ['flying'],
  dice: {
    label: { sk: 'Požehnanie predného voja', en: 'Vanguard Blessing' },
    threshold: 3,
    manaCost: 2,
    activation: true,
    effect: { kind: 'blessVanguard', heal: 2, armor: 1 },
  },
  text: {
    sk: 'Kocka 3+ (2 many): každá tvoja jednotka vo Vanguarde si vylieči 2 HP a získa 1 brnenie.',
    en: 'Dice 3+ (2 mana): each of your Vanguard units heals 2 HP and gains 1 armor.',
  },
  glyph: '🦅',
  art: '/art/zlaty_gryf.jpg',
});

export const MEDVEBOR = define<UnitCardDef>({
  type: 'unit',
  id: 'medvebor',
  name: { sk: 'Medvebor, Velesov Šampión', en: 'Medvebor, Champion of Veles' },
  faction: 'nature',
  rarity: 'legendary',
  cost: 5,
  attack: 3,
  maxHp: 7,
  armor: 1,
  lane: 'vanguard',
  keywords: [],
  dice: {
    label: { sk: 'Rozťatie kolovratom', en: 'Kolovrat Cleave' },
    threshold: 4,
    manaCost: 2,
    activation: false,
    effect: { kind: 'cleave' },
  },
  text: {
    sk: 'Kocka 4+ (2 many): sekera zasiahne aj jednotky naľavo a napravo od cieľa v tej istej línii.',
    en: 'Dice 4+ (2 mana): the axe also hits the units left and right of the target in the same lane.',
  },
  glyph: '🐻',
  art: '/art/medvebor.jpg',
});

export const MAHISA = define<UnitCardDef>({
  type: 'unit',
  id: 'mahisa',
  name: { sk: 'Mahiša, Chrámový Býk', en: 'Mahisha, the Temple Bull' },
  faction: 'nature',
  rarity: 'rare',
  cost: 5,
  attack: 3,
  maxHp: 7,
  armor: 1,
  lane: 'vanguard',
  keywords: [],
  dice: {
    label: { sk: 'Splašený výpad', en: 'Stampede' },
    threshold: 4,
    manaCost: 1,
    activation: false,
    effect: { kind: 'berserk', bonusDamage: 3 },
  },
  text: {
    sk: 'Kocka 4+ (1 mana): rozbehnutý býk udelí cieľu +3 poškodenie navyše.',
    en: 'Dice 4+ (1 mana): the charging bull deals +3 bonus damage to the target.',
  },
  glyph: '🐃',
  art: '/art/mahisa.jpg',
});

export const CHEPRI = define<UnitCardDef>({
  type: 'unit',
  id: 'chepri',
  name: { sk: 'Chepri, Skarabejský Strážca', en: 'Khepri, the Scarab Warden' },
  faction: 'nature',
  rarity: 'rare',
  cost: 4,
  attack: 2,
  maxHp: 5,
  armor: 2,
  lane: 'vanguard',
  keywords: ['flying'],
  dice: {
    label: { sk: 'Znovuzrodenie slnka', en: 'Rebirth of the Sun' },
    threshold: 3,
    manaCost: 1,
    activation: true,
    effect: { kind: 'fortify', heal: 2, armor: 2 },
  },
  text: {
    sk: 'Letec. Kocka 3+ (1 mana): chitínový pancier sa obnoví — vylieči si 2 HP a získa 2 brnenie.',
    en: 'Flyer. Dice 3+ (1 mana): the chitin shell renews — heals 2 HP and gains 2 armor.',
  },
  glyph: '🪲',
  art: '/art/chepri.jpg',
});

export const KHADGA = define<UnitCardDef>({
  type: 'unit',
  id: 'khadga',
  name: { sk: 'Khadga, Štít Chrámu', en: 'Khadga, Shield of the Temple' },
  faction: 'nature',
  rarity: 'rare',
  cost: 5,
  attack: 2,
  maxHp: 6,
  armor: 3,
  lane: 'vanguard',
  keywords: [],
  dice: {
    label: { sk: 'Neprelomný val', en: 'Unbreakable Rampart' },
    threshold: 3,
    manaCost: 1,
    activation: true,
    effect: { kind: 'fortify', heal: 1, armor: 2 },
  },
  text: {
    sk: 'Kocka 3+ (1 mana): pozdvihne runový štít — vylieči si 1 HP a získa 2 brnenie.',
    en: 'Dice 3+ (1 mana): raises the runic shield — heals 1 HP and gains 2 armor.',
  },
  glyph: '🦏',
  art: '/art/khadga.jpg',
});

// ── Frakcia: Nebeský Zbor (Mobilita a Podfuky) ──────────────────────────────

export const PAPAGAJ = define<UnitCardDef>({
  type: 'unit',
  id: 'papagaj',
  name: { sk: 'Papagáj', en: 'Parrot' },
  faction: 'celestial',
  rarity: 'legendary',
  cost: 6,
  attack: 2,
  maxHp: 6,
  armor: 0,
  lane: 'sanctum',
  keywords: ['acidTouch', 'flying'],
  dice: {
    label: { sk: 'Kyselinová spŕška', en: 'Acid Downpour' },
    threshold: 1,
    manaCost: 1,
    activation: false,
    effect: { kind: 'acidBlast', stacks: 2 },
  },
  text: {
    sk: 'Letec. Kyselina ∞: útoky trvalo znižujú brnenie. Stabilita — Kocka 1+ (1 mana): spŕška 2 kyseliny navyše, hod prakticky nemôže zlyhať.',
    en: 'Flyer. Acid ∞: attacks permanently shred armor. Stability — Dice 1+ (1 mana): 2 extra acid stacks; the roll practically cannot fail.',
  },
  glyph: '🦜',
  art: '/art/papagaj.jpg',
});

export const BOJOVY_KOHUT = define<UnitCardDef>({
  type: 'unit',
  id: 'bojovy_kohut',
  name: { sk: 'Bojový Kohút', en: 'War Rooster' },
  faction: 'celestial',
  rarity: 'rare',
  cost: 4,
  attack: 2,
  maxHp: 6,
  armor: 0,
  lane: 'vanguard',
  keywords: ['berserker'],
  dice: {
    label: { sk: 'Berserk', en: 'Berserk' },
    threshold: 5,
    manaCost: 1,
    activation: false,
    effect: { kind: 'berserk', bonusDamage: 4 },
  },
  text: {
    sk: 'Berserker — Kocka (1 mana): +4 poškodenie. Požiadavka klesá so zraneniami: plné HP 5+, každé chýbajúce HP ju znižuje o 1 (najmenej 2+).',
    en: 'Berserker — Dice (1 mana): +4 damage. The requirement drops as he bleeds: full HP 5+, each missing HP lowers it by 1 (minimum 2+).',
  },
  glyph: '🐓',
  art: '/art/bojovy_kohut.jpg',
});

export const OPICI_KRAL = define<UnitCardDef>({
  type: 'unit',
  id: 'opici_kral',
  name: { sk: 'Wukong, Opičí Kráľ', en: 'Wukong, the Monkey King' },
  faction: 'celestial',
  rarity: 'rare',
  cost: 3,
  attack: 2,
  maxHp: 4,
  armor: 0,
  lane: 'vanguard',
  keywords: ['agile'],
  text: {
    sk: 'Agilná: raz za ťah sa počas bojovej fázy môže presunúť medzi Vanguardom a Sanctom (uhýba sa AoE útokom).',
    en: 'Agile: once per turn during combat he may hop between Vanguard and Sanctum (dodging AoE attacks).',
  },
  glyph: '🐒',
  art: '/art/wukong.jpg',
});

export const CUAUHTLI = define<UnitCardDef>({
  type: 'unit',
  id: 'cuauhtli',
  name: { sk: 'Cuauhtli, Orlí Rytier', en: 'Cuauhtli, the Eagle Knight' },
  faction: 'celestial',
  rarity: 'rare',
  cost: 5,
  attack: 3,
  maxHp: 4,
  armor: 0,
  lane: 'sanctum',
  keywords: ['flying'],
  dice: {
    label: { sk: 'Strmhlavý útok', en: 'Dive Strike' },
    threshold: 3,
    manaCost: 1,
    activation: false,
    effect: { kind: 'berserk', bonusDamage: 2 },
  },
  text: {
    sk: 'Letec. Kocka 3+ (1 mana): strmhlavý útok z oblohy udelí cieľu +2 poškodenie navyše.',
    en: 'Flyer. Dice 3+ (1 mana): a dive from the sky deals +2 bonus damage to the target.',
  },
  glyph: '🦅',
  art: '/art/cuauhtli.jpg',
});

export const RYSOSLAV = define<UnitCardDef>({
  type: 'unit',
  id: 'rysoslav',
  name: { sk: 'Rysoslav, Žrec Perúna', en: 'Rysoslav, Priest of Perun' },
  faction: 'celestial',
  rarity: 'legendary',
  cost: 4,
  attack: 1,
  maxHp: 4,
  armor: 0,
  lane: 'sanctum',
  keywords: [],
  dice: {
    label: { sk: 'Perúnov hnev', en: "Perun's Wrath" },
    threshold: 4,
    manaCost: 2,
    activation: true,
    effect: { kind: 'stormcall', damage: 1 },
  },
  text: {
    sk: 'Kocka 4+ (2 many): zvolá búrku — každá nepriateľská jednotka na ploche utrpí 1 poškodenie.',
    en: 'Dice 4+ (2 mana): calls down a storm — every enemy unit on the board takes 1 damage.',
  },
  glyph: '🐆',
  art: '/art/rysoslav.jpg',
});

export const NEBESKY_VRABEC = define<UnitCardDef>({
  type: 'unit',
  id: 'nebesky_vrabec',
  name: { sk: 'Nebeský vrabec', en: 'Sky Sparrow' },
  faction: 'celestial',
  rarity: 'common',
  cost: 2,
  attack: 2,
  maxHp: 2,
  armor: 0,
  lane: 'sanctum',
  keywords: ['flying'],
  text: {
    sk: 'Letec. Rýchly prieskumník Nebeského zboru.',
    en: 'Flyer. A swift scout of the Celestial Chorus.',
  },
  glyph: '🐦',
  art: '/art/nebesky_vrabec.jpg',
});

/** Shared test deck — both players run this list unless they pick their own. */
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
  'khadga',
  'cuauhtli',
  'chepri',
  'mahisa',
  'medvebor',
  'rysoslav',
  'megadrak',
  'gorila',
  'papagaj',
];

export function getCard(id: string): CardDef {
  const card = CARDS[id];
  if (!card) throw new Error(`unknownCard:${id}`);
  return card;
}

export function getUnitCard(id: string): UnitCardDef {
  const card = getCard(id);
  if (card.type !== 'unit') throw new Error(`notAUnit:${id}`);
  return card;
}
