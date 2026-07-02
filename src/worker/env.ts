/** Worker/Durable Object bindings (wrangler.toml). */
export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  MATCHMAKER: DurableObjectNamespace;
  /** D1 — players, ELO, decks, match history (GDD §5.2). */
  DB: D1Database;
  ASSETS: Fetcher;
}
