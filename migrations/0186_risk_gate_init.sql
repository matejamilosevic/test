-- COD-21 / FRA-4320: checkout risk evaluation gate tables
CREATE TABLE IF NOT EXISTS risk_signal_definitions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    weight INTEGER NOT NULL,
    predicate_key TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_risk_signal_definitions_org_predicate
    ON risk_signal_definitions (organization_id, predicate_key);

CREATE TABLE IF NOT EXISTS risk_evaluation_events (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    cart_id UUID NOT NULL,
    quote_version TEXT NOT NULL,
    score INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    hits JSONB NOT NULL DEFAULT '[]'::jsonb,
    scrubbed_input JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_evaluation_events_cart_quote
    ON risk_evaluation_events (cart_id, quote_version);

CREATE TABLE IF NOT EXISTS risk_review_cases (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    evaluation_id UUID NOT NULL,
    status TEXT NOT NULL,
    assigned_to UUID,
    override_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_review_cases_status
    ON risk_review_cases (status);
