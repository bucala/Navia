/**
 * TypeScript data models for cards and game state — GDD Fáza 1.
 *
 * The engine is a pure reducer over these types. In Fáza 2 the same
 * reducer runs inside a Cloudflare Durable Object, which becomes the
 * only authority calling the RNG for dice rolls.
 */

export type PlayerId = 'p1' | 'p2';
export type LaneId = 'vanguard' | 'sanctum';
export type Faction = 'lava' | 'nature' | 'celestial';
export type Rarity = 'common' | 'rare' | 'legendary';

/** Every player-facing string ships in both languages, kept in parallel. */
export interface LocalizedText {
  sk: string;
  en: string;
}

/** Turn phases the player interacts with; start/end-of-turn steps resolve automatically. */
export type Phase = 'main' | 'combat';

/** Keyword mechanics (GDD §3). */
export type Keyword =
  /** Láva ∞ krát — attacks apply a permanent burn stack (DoT). */
  | 'lavaTouch'
  /** Kyselina ∞ krát — attacks permanently shred armor. */
  | 'acidTouch'
  /** Vyhubenie — instantly kills tokens (max 1 HP), ignoring their shields. */
  | 'pestControl'
  /** Výhoda — dice rolls use 2d6, keep the better. */
  | 'advantage'
  /** Berserker — dice requirement drops as HP drops (Bojový Kohút). */
  | 'berserker'
  /** Agilná — may move between vanguard and sanctum during the combat phase. */
  | 'agile'
  /** Letec — flavour keyword for sanctum flyers (no rules effect in Fáza 1). */
  | 'flying';

/** Effect that triggers when a dice-boosted attack/activation succeeds. */
export type DiceEffect =
  /** Attack becomes a cross-shaped AoE (piškvorková mriežka). */
  | { kind: 'aoe' }
  /** Attack also hits the target's left/right neighbours in the same lane (Medvebor). */
  | { kind: 'cleave' }
  /** Storm strike — damages every enemy unit on the board (Rysoslav) — activation. */
  | { kind: 'stormcall'; damage: number }
  /** Extra acid stacks on the target (Papagáj). */
  | { kind: 'acidBlast'; stacks: number }
  /** Bonus damage on the target (Bojový Kohút). */
  | { kind: 'berserk'; bonusDamage: number }
  /** Self heal + armor (Gorila) — activation, not an attack. */
  | { kind: 'fortify'; heal: number; armor: number }
  /** Heal + armor for the whole friendly vanguard (Zlatý Gryf) — activation. */
  | { kind: 'blessVanguard'; heal: number; armor: number };

export interface DiceAbility {
  /** Short label shown in the UI and log. */
  label: LocalizedText;
  /** Roll >= threshold succeeds ("3+"). Berserker units override this dynamically. */
  threshold: 1 | 2 | 3 | 4 | 5 | 6;
  /** Extra mana paid to roll the dice. */
  manaCost: number;
  /** True for activations (used instead of attacking); false for attack riders. */
  activation: boolean;
  effect: DiceEffect;
}

export interface UnitCardDef {
  type: 'unit';
  id: string;
  name: LocalizedText;
  faction: Faction;
  rarity: Rarity;
  cost: number;
  attack: number;
  maxHp: number;
  /** Starting armor (shield points that absorb damage; acid shreds them). */
  armor: number;
  /** Lane the unit must be summoned into. */
  lane: LaneId;
  /** Tokens (max 1 HP) die instantly to pestControl. */
  token?: boolean;
  keywords: Keyword[];
  dice?: DiceAbility;
  /** Rules text. */
  text: LocalizedText;
  /** Emoji fallback shown while the art file is missing. */
  glyph: string;
  /** Art path under public/ (Fáza 3; R2-hosted later). */
  art: string;
}

/** Pekelné zaklínadlo — push-your-luck chain (GDD §4). */
export interface SpellCardDef {
  type: 'spell';
  id: string;
  name: LocalizedText;
  faction: Faction;
  rarity: Rarity;
  cost: number;
  spell: {
    kind: 'infernalChain';
    /** HP returned to the caster per successful roll ("Vráti 1+ HP hráčovi"). */
    healPerSuccess: number;
    /** Damage dealt to the target per successful roll (3, 4 or 5). */
    damagePerSuccess: number;
    /** Damage the caster's Nexus takes when the chain ends on a 6 (Overload). */
    overloadSelfDamage: number;
  };
  text: LocalizedText;
  glyph: string;
  art: string;
}

export type CardDef = UnitCardDef | SpellCardDef;

/** A unit instance on the board. */
export interface UnitState {
  uid: number;
  cardId: string;
  hp: number;
  maxHp: number;
  armor: number;
  /** Permanent burn stacks; each deals BURN_TICK_DAMAGE at the owner's turn start. */
  burn: number;
  /** One action (attack or activation) per turn. */
  ready: boolean;
  /** Agile units may reposition once per turn. */
  movedThisTurn: boolean;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  nexusHp: number;
  mana: number;
  maxMana: number;
  deck: string[];
  hand: string[];
  lanes: Record<LaneId, (UnitState | null)[]>;
}

/** Message keys resolved to the client's language by the UI (src/i18n). */
export type MsgKey =
  | 'gameStart'
  | 'turnStart'
  | 'summon'
  | 'enterCombat'
  | 'nexusDamage'
  | 'winner'
  | 'unitDamage'
  | 'unitDamageAbsorbed'
  | 'exterminate'
  | 'acidArmor'
  | 'acidHp'
  | 'unitDies'
  | 'burnTick'
  | 'burnApplied'
  | 'spellCast'
  | 'overload'
  | 'chainEnd'
  | 'aoeTrigger'
  | 'cleaveTrigger'
  | 'attackNexus'
  | 'fortify'
  | 'bless'
  | 'stormcall'
  | 'diceFail'
  | 'move'
  | 'eloUpdate';

export type LogEvent =
  /**
   * Localizable game message. By convention params.card / params.card2
   * carry card ids and params.lane a LaneId — the renderer resolves
   * them to the active language.
   */
  | { id: number; kind: 'msg'; msgKey: MsgKey; params: Record<string, string | number> }
  | {
      id: number;
      kind: 'dice';
      player: PlayerId;
      /** Card id of whatever rolled the dice. */
      source: string;
      /** Ability label; null for spell chains (the card name says it all). */
      ability: LocalizedText | null;
      rolls: number[];
      kept: number;
      threshold: number;
      success: boolean;
    }
  /** Structured combat event so both clients can animate the strike. */
  | { id: number; kind: 'attack'; player: PlayerId; from: SlotRef; target: TargetRef };

export interface GameState {
  players: Record<PlayerId, PlayerState>;
  active: PlayerId;
  turn: number;
  phase: Phase;
  winner: PlayerId | null;
  log: LogEvent[];
  nextUid: number;
  nextLogId: number;
}

export type SlotRef = { lane: LaneId; slot: number };

export type TargetRef =
  | { kind: 'unit'; player: PlayerId; lane: LaneId; slot: number }
  | { kind: 'nexus'; player: PlayerId };

export type Action =
  | { type: 'PLAY_CARD'; player: PlayerId; handIndex: number; lane?: LaneId; slot?: number; target?: TargetRef }
  | { type: 'ENTER_COMBAT'; player: PlayerId }
  | { type: 'ATTACK'; player: PlayerId; attacker: SlotRef; target: TargetRef; useDice: boolean }
  | { type: 'ACTIVATE'; player: PlayerId; unit: SlotRef }
  | { type: 'MOVE_UNIT'; player: PlayerId; from: SlotRef; to: SlotRef }
  | { type: 'END_TURN'; player: PlayerId };

/** Source of randomness — returns [0, 1). Injectable so tests are deterministic. */
export type Rng = () => number;
