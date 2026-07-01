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
  /** Short Slovak label shown in the UI and log. */
  label: string;
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
  name: string;
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
  /** Rules text (Slovak). */
  text: string;
  /** Emoji stand-in until the R2-hosted art lands in Fáza 3. */
  glyph: string;
}

/** Pekelné zaklínadlo — push-your-luck chain (GDD §4). */
export interface SpellCardDef {
  type: 'spell';
  id: string;
  name: string;
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
  text: string;
  glyph: string;
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

export type LogEvent =
  | { id: number; kind: 'text'; text: string }
  | {
      id: number;
      kind: 'dice';
      player: PlayerId;
      label: string;
      rolls: number[];
      kept: number;
      threshold: number;
      success: boolean;
    };

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
