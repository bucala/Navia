-- Fáza 5 doplnok: chýbajúce indexy na matches (GDD §5.2).
--
-- `matches` doteraz nemala index na p1_id/p2_id/winner_id, takže akékoľvek
-- budúce "história zápasov hráča X" dopyty by robili plný scan tabuľky.
-- Foreign key kontroly sem zámerne nedávame retroaktívne — D1 ich už aj tak
-- defaultne presadzuje pre nové zápisy (identické s `PRAGMA foreign_keys=on`
-- pre každú transakciu, https://developers.cloudflare.com/d1/sql-api/foreign-keys/),
-- a dodatočné pridanie FK/CHECK na existujúci stĺpec by si v SQLite vyžiadalo
-- rebuild celej tabuľky (rename → create → copy → drop), čo by zlyhalo, ak by
-- produkčné dáta obsahovali čo i len jeden osirelý riadok, ktorý odtiaľto
-- nevieme overiť.

CREATE INDEX idx_matches_p1 ON matches (p1_id);
CREATE INDEX idx_matches_p2 ON matches (p2_id);
CREATE INDEX idx_matches_winner ON matches (winner_id);
