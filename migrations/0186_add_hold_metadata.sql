-- COD-36: reservation hold metadata and checkout quotes for commercial pipeline
ALTER TABLE IF EXISTS inventory.holds
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS quote_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS metadata jsonb;

CREATE INDEX IF NOT EXISTS idx_holds_expires_at
  ON inventory.holds (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS platform.checkout_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  version integer NOT NULL DEFAULT 1,
  subtotal integer NOT NULL,
  shipping_fee integer NOT NULL,
  tax integer NOT NULL,
  discount_total integer NOT NULL,
  grand_total integer NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkout_quotes_org_correlation
  ON platform.checkout_quotes (organization_id, correlation_id);
