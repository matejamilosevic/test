# Specification — COD-21

> Source: CodeMerlin (approved 2026-06-01)  
> Version: `362b76f2-a100-4207-a10a-097a13fe8d08`

## Outcome

Establish a deterministic risk evaluation gate in the checkout process that scores session and order signals to prevent fraudulent transactions before they are committed to the ledger. This system provides an auditable trail of risk decisions, supports manual review workflows for suspicious orders, and allows for configurable risk policies without requiring code changes for standard rule adjustments.

## User Stories

### User Story 1 — Risk Evaluation Engine (Priority: P1)

As a system architect, I want a centralized risk evaluation service so that checkout signals are scored consistently and auditably against versioned policy definitions.

- [ ] `evaluateCheckoutRisk` accepts a typed `RiskEvaluationInput` including `cart_id`, `quote_version`, and `session_metadata`.
- [ ] The engine returns a `RiskEvaluationResult` containing a score, a list of triggered signal hits, and a policy outcome (`allow`, `challenge`, `review`, `block`).
- [ ] Risk signals are defined in a versioned catalog (`risk_signal_definitions`) with weights and trigger predicates.
- [ ] Evaluation results are persisted in `risk_evaluation_events` without sensitive PII (PAN, CVV, or full gift messages).

### User Story 2 — Checkout Integration & Enforcement (Priority: P2)

As a checkout developer, I want to integrate the risk gate into the submission flow so that high-risk orders are blocked or held for review before inventory is committed.

- [ ] The checkout submission path invokes the risk evaluator after quote validation but before ledger commit.
- [ ] If `checkout.risk_gate_enabled` is ON, submissions without a valid evaluation return a `400 RISK_EVAL_REQUIRED` error.
- [ ] `block` outcomes result in a `403 RISK_DECLINED` response with a support reference ID.
- [ ] `review` outcomes block the ledger commit and create a case in `risk_review_cases`.
- [ ] The system caches evaluations for 15 minutes for the same `cart_id` and `quote_version` to maintain performance.

### User Story 3 — Risk Operations & Overrides (Priority: P3)

As a support agent, I want to review flagged orders and override risk decisions so that legitimate customers blocked by false positives can complete their purchases.

- [ ] A review queue displays cases in `open`, `approved`, or `rejected` states.
- [ ] Support agents can apply a `risk_override` with a reason and ticket ID.
- [ ] An approved override allows a one-time checkout submission for the associated cart/session.
- [ ] All override actions are audit-logged with the actor's identity.

## Functional Requirements

1. **FR-001**: The system shall maintain a versioned catalog of risk signals including velocity, subtotal mismatches, and SKU concentration. [User Story 1]
2. **FR-002**: The risk engine shall produce a deterministic outcome based on the sum of weighted signal hits against configurable thresholds. [User Story 1]
3. **FR-003**: The checkout submission handler shall verify the presence of a valid `allow` outcome or a signed `challenge_token` before proceeding to ledger commit. [User Story 2]
4. **FR-004**: The system shall provide a `POST /checkout/risk-eval` endpoint for explicit risk assessment. [User Story 2]
5. **FR-005**: The system shall support a "shadow mode" via feature flag where risk outcomes are calculated and logged but do not block the checkout flow. [User Story 2]
6. **FR-006**: The system shall redact PII from risk feature vectors before persistence, specifically scrubbing payment card details and full message bodies. [User Story 1]
7. **FR-007**: The system shall create a review case for any evaluation resulting in a `review` outcome, preventing order fulfillment until the case is resolved. [User Story 2, User Story 3]
8. **FR-008**: The system shall expose metrics for evaluation latency, outcome distribution, and review queue depth. [User Story 1, User Story 3]

## Success Criteria

1. **SC-001**: 100% of checkout submissions must have a corresponding entry in `risk_evaluation_events` when the risk gate is enabled.
2. **SC-002**: Risk evaluation latency (p95) must be under 200ms to stay within the checkout SLO.
3. **SC-003**: Zero instances of raw PAN or CVV data stored in risk-related database tables or logs.
4. **SC-004**: 100% of `block` outcomes must successfully prevent the `INV-5100` ledger commit process.
5. **SC-005**: Emergency kill switch (feature flag) must disable enforcement across all nodes within 60 seconds of activation.

## Edge Cases

- **Quote Version Mismatch**: If the `quote_version` in the risk evaluation does not match the current cart quote, the submission must be rejected and a re-evaluation forced.
- **Concurrent Submissions**: If two submissions occur for the same cart, the system must ensure only one evaluation is processed and applied to the ledger commit.
- **Database Downtime**: If the risk database is unavailable, the system should fail-safe (configurable to `allow` or `block`) and log a high-priority alert.
- **Empty Cart/Signals**: Evaluations for empty carts or missing session metadata should return a default `block` or `review` outcome to prevent bypass via malformed requests.
- **Multi-tenant Isolation**: Risk signals and review cases must be strictly partitioned by `organization_id`; agents from Org A cannot view or override cases for Org B.

## Out of Scope

- Implementation of actual 3D Secure (3DS) or PSP-level step-up authentication (placeholder contract only).
- Machine learning model training or integration with external fraud scoring vendors.
- Detection of account takeover (ATO) for login or profile management surfaces.
- Automated generation of legal adverse action notices for blocked users.

## Jira Requirement Coverage

| Jira AC | Covered by |
|---|---|
| With flag on, submit without prior evaluation returns 400 RISK_EVAL_REQUIRED | FR-003, SC-001 |
| Golden tests: each documented rule triggers expected hit; score bands map to correct outcome | FR-001, FR-002 |
| block prevents ledger commit; review creates case; allow unchanged happy path | FR-003, FR-007, SC-004 |
| Evaluation row persisted without PAN, CVV, or full gift message body | FR-006, SC-003 |
| Support override flips case to approved and allows one-time commit | FR-007, User Story 3 |
| Metrics and runbook published; kill switch disables gate | FR-008, SC-005 |
