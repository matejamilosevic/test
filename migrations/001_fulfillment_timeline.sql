-- KAN-16 / ORD-4821: canonical fulfillment timeline (deploy with dual-write flag in app).
CREATE TABLE IF NOT EXISTS fulfillment_timeline_events (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    occurred_at TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_fte_order_occurred
    ON fulfillment_timeline_events (order_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_fte_correlation
    ON fulfillment_timeline_events (correlation_id);
