-- COD-31: reservation hold metadata for quote versioning and TTL expiry
ALTER TABLE IF EXISTS inventory.reservation_holds
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS quote_version varchar(64),
  ADD COLUMN IF NOT EXISTS correlation_id uuid;

CREATE INDEX IF NOT EXISTS idx_reservation_holds_expires_at
  ON inventory.reservation_holds (expires_at)
  WHERE expires_at IS NOT NULL;
