-- Hashované tajné kľúče hráčov. Nové účty ukladajú len SHA-256 hash;
-- staré riadky sa prevedú pri najbližšom prihlásení (secret sa potom vyprázdni).
ALTER TABLE players ADD COLUMN secret_hash TEXT;
