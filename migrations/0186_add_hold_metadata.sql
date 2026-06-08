-- COD-32: reservation hold metadata for quote versioning and TTL expiry
ALTER TABLE IF EXISTS inventory.holds
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS quote_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS metadata jsonb;

CREATE INDEX IF NOT EXISTS idx_holds_expires_at
  ON inventory.holds (expires_at)
  WHERE expires_at IS NOT NULL;
