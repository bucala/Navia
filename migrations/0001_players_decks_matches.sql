-- Fáza 5: účty hráčov, ELO rating, balíčky a história zápasov (GDD §5.2)

CREATE TABLE players (
  id TEXT PRIMARY KEY,
  secret TEXT NOT NULL,
  name TEXT NOT NULL,
  elo INTEGER NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_players_elo ON players (elo DESC);

CREATE TABLE decks (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id),
  name TEXT NOT NULL,
  -- JSON pole card id-čiek
  cards TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_decks_player ON decks (player_id);

CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  p1_id TEXT,
  p2_id TEXT,
  winner_id TEXT,
  elo_delta INTEGER NOT NULL,
  finished_at TEXT NOT NULL DEFAULT (datetime('now'))
);
