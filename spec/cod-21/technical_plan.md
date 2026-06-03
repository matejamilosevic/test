# Technical Plan — COD-21

> Source: CodeMerlin (approved 2026-06-01)  
> Version: `bf2a2afa-8c4c-4b0c-b4a8-e5bd1afd2339`

## Technical approach

## Research decisions

- **Deterministic Scoring Engine**: We will implement a weighted-sum engine where `RiskSignal` definitions are stored in the database. This allows for dynamic weight adjustments without redeploying code.
- **Trade-off 1 (Caching Strategy)**: We chose a 15-minute Redis-backed cache for evaluations keyed by `(cart_id, quote_version)` over re-evaluating on every submit. This protects the 200ms p95 latency SLO (SC-002) at the cost of slight data staleness if session metadata changes rapidly.
- **Trade-off 2 (PII Handling)**: We chose application-level scrubbing (using a `RiskScrubber` utility) before persistence rather than database-level encryption. This ensures that even in-memory logs and temporary objects are safe, aligning with OBS-2744.
- **State Machine for Reviews**: `risk_review_cases` will use a strict state machine (Open -> Approved/Rejected). An 'Approved' state will generate a short-lived `override_token` that the checkout submit path validates.

## Component / module ownership

- `apps/api`: Owns the `POST /checkout/risk-eval` endpoint and the middleware/hook in the checkout submission route.
- `packages/risk-engine`: A new shared package containing the `evaluateCheckoutRisk` logic, signal definitions, and scrubbing utilities.
- `packages/db`: Owns the Drizzle schema definitions and migrations for the three new tables.
- **Non-modified**: The core ledger commit logic in `reservation_ledger.ts` should not be modified; instead, it should be wrapped or preceded by the risk gate check.

## Service interaction patterns

- **HTTP REST**: The checkout flow calls the risk service internally. Failure to reach the risk service will trigger a 'fail-safe' behavior (defaulting to `review` or `allow` based on a secondary `risk.fail_open` flag).
- **BullMQ**: When an evaluation results in `review`, a job is dispatched to the `risk-ops` queue to notify support systems and initialize the review case.

## Feature-flag keys

- `checkout.risk_gate_enabled` → When OFF, the risk evaluation is skipped entirely (legacy behavior).
- `checkout.risk_shadow_mode` → When ON (and gate is enabled), evaluations are performed and logged, but `block` or `review` outcomes do not stop the checkout flow.
- `checkout.risk_fail_open` → Determines if the system allows checkout when the risk engine is unreachable.

## Multi-tenancy contract

- Every query to `risk_evaluation_events`, `risk_signal_definitions`, and `risk_review_cases` MUST include an `organization_id` filter.
- The `RiskEvaluationInput` will require `organization_id` to ensure signals are scoped to the correct tenant's policy.

## Affected components

- **packages/db** — New migrations for risk tables; schema updates in `src/schema/risk.ts`.
- **packages/risk-engine** — New package for core scoring logic and PII scrubbing.
- **apps/api** — Integration of risk gate into `src/api/checkout_routes.ts`.
- **packages/shared** — New error code `RISK_DECLINED` and `RISK_EVAL_REQUIRED` in the global error registry.

## Data model changes

- **platform.risk_signal_definitions**: `id` (uuid), `organization_id` (uuid), `name` (text), `weight` (int), `predicate_key` (text), `version` (int). Index on `(organization_id, predicate_key)`.
- **platform.risk_evaluation_events**: `id` (uuid), `organization_id` (uuid), `cart_id` (uuid), `quote_version` (text), `score` (int), `outcome` (enum), `hits` (jsonb), `scrubbed_input` (jsonb). Index on `(cart_id, quote_version)`.
- **platform.risk_review_cases**: `id` (uuid), `organization_id` (uuid), `evaluation_id` (uuid), `status` (enum: open, approved, rejected), `assigned_to` (uuid), `override_reason` (text). Index on `status`.
- **Migration**: `0186_risk_gate_init.sql` (Idempotent via `CREATE TABLE IF NOT EXISTS`).

## API changes

- **POST /checkout/risk-eval**
  - Auth: JWT Session
  - Request: `{ cart_id: string, quote_version: string, session_metadata: object }`
  - Response: `200 OK { evaluation_id: string, outcome: "allow" | "challenge" | "review" | "block", score: number }`
- **POST /checkout/submit**
  - Updated to return `400 RISK_EVAL_REQUIRED` if no evaluation exists.
  - Updated to return `403 RISK_DECLINED` if outcome is `block`.
  - Updated to return `202 Accepted` if outcome is `review` (order held).

## Migration / rollout

1. Deploy database migrations (`0186_risk_gate_init.sql`).
2. Deploy `packages/risk-engine` and updated `apps/api` with `checkout.risk_gate_enabled` OFF.
3. Enable `checkout.risk_gate_enabled` and `checkout.risk_shadow_mode` ON to verify scoring accuracy in production without blocking users.
4. After 48 hours of monitoring, disable `checkout.risk_shadow_mode` to begin enforcement.
5. **Rollback**: Flip `checkout.risk_gate_enabled` to OFF; this immediately restores the legacy checkout path.

## Operational considerations

- **Metrics**: `risk_eval_latency_ms` (Histogram), `risk_outcome_count` (Counter with `outcome` label), `risk_review_queue_size` (Gauge).
- **Logs**: "Risk evaluation completed: outcome={outcome} score={score} cart_id={cart_id}".
- **Alerts**: High-priority alert if `risk_eval_latency` p99 > 500ms or if the error rate for `/checkout/risk-eval` exceeds 1%.

## Repository scope

- `c5ce088d-6dc7-4adc-b189-00c989801280` (matejamilosevic/test): This is the primary repository where all changes (API, Risk Engine, DB) will be implemented.

## Risks

1. **False Positives**: Legitimate high-value orders might be blocked. Mitigation: Shadow mode for 48h and support override capability.
2. **Latency Impact**: Risk evaluation adds a network hop. Mitigation: Redis caching and 200ms timeout on the risk engine call.
3. **PII Leakage**: Risk signals often contain sensitive data. Mitigation: Mandatory `RiskScrubber` utility used before any logging or DB persistence.
4. **Multi-tenancy**: Risk cases for Org A visible to Org B. Mitigation: Row-level security (RLS) or mandatory `organization_id` filters on all repository methods.

## Alternatives considered

1. **Third-party Fraud Provider**: Considered using Sift or Forter. Rejected due to cost and the requirement for a deterministic, auditable internal policy engine first.
2. **Synchronous Review**: Considered making the checkout request wait for a human review. Rejected as it would break the checkout UX; asynchronous `review` outcome with a 'Pending' status is preferred.

## Requirement mapping

- **FR-001** — addressed
- **FR-002** — addressed
- **FR-003** — addressed
- **FR-004** — addressed
- **FR-005** — addressed
- **FR-006** — addressed
- **FR-007** — addressed
- **FR-008** — addressed
- **SC-001** — addressed
- **SC-002** — addressed
- **SC-003** — addressed
- **SC-004** — addressed
- **SC-005** — addressed

## ADR references
