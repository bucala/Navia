import type { RatingCoordinator } from './RatingCoordinator';

/** Worker/Durable Object bindings (wrangler.toml). */
export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  MATCHMAKER: DurableObjectNamespace;
  RATING_COORDINATOR: DurableObjectNamespace<RatingCoordinator>;
  /** D1 — players, ELO, decks, match history (GDD §5.2). */
  DB: D1Database;
  ASSETS: Fetcher;
  /** Optional comma-separated extra browser origins allowed to call /api. */
  CORS_ALLOWED_ORIGINS?: string;
}
