/** Board & resource constants — see docs/GDD.md §2. */

/** GDD allows 3–5 vanguard slots; 4 keeps a clean column alignment for AoE crosses. */
export const VANGUARD_SLOTS = 4;
export const SANCTUM_SLOTS = 4;

export const NEXUS_HP = 30;
export const MAX_MANA = 10;
export const STARTING_HAND = 4;
/** The player going second receives one extra opening card. */
export const SECOND_PLAYER_HAND_BONUS = 1;
/** Automatic mulligan guarantees a card playable by turn two when possible. */
export const OPENING_PLAYABLE_COST = 2;
/** Safety cap for pathological stalled games (counts individual player turns). */
export const MAX_MATCH_TURNS = 80;

/** Damage one burn (Láva) stack deals at the start of the owner's turn. */
export const BURN_TICK_DAMAGE = 1;
