-- Globally unique idempotency key used by RatingCoordinator retries. Room
-- codes are intentionally short and can be reused, so they are not safe keys.
ALTER TABLE matches ADD COLUMN result_key TEXT;
UPDATE matches SET result_key = 'legacy:' || id WHERE result_key IS NULL;
CREATE UNIQUE INDEX idx_matches_result_key ON matches (result_key);
