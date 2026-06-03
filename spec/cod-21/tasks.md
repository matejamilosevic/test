# Tasks — COD-21

> Source: CodeMerlin (approved 2026-06-01)  
> Version: `19e865fd-4d80-4125-8ad8-0ded93381a3b`

## Define shared risk schemas and feature-gate constants

- [ ] Zod schemas for `RiskEvaluationInput` and `RiskEvaluationResult` exported from `packages/shared`.
- [ ] Feature gate keys `checkout.risk_gate_enabled`, `checkout.risk_shadow_mode`, and `checkout.risk_fail_open` added to constants.
- [ ] Error codes `RISK_DECLINED` and `RISK_EVAL_REQUIRED` added to global registry.

---

## Add migration 0186_risk_gate_init.sql and Drizzle schemas

- [ ] Migration file creates `risk_signal_definitions`, `risk_evaluation_events`, and `risk_review_cases` tables.
- [ ] Drizzle schema modules in `packages/db` match the migration DDL.
- [ ] Multi-tenant `organization_id` column present and indexed on all tables.

---

## [US1] Implement core Risk Engine and PII Scrubber

- [ ] `evaluateCheckoutRisk` calculates deterministic scores based on weighted signal hits.
- [ ] `RiskScrubber` utility successfully redacts PAN, CVV, and gift messages from input vectors.
- [ ] Unit tests in `packages/risk-engine` cover ≥12 golden scenarios for scoring bands.

---

## [US2] Add POST /checkout/risk-eval and submission integration

- [ ] `POST /checkout/risk-eval` endpoint implemented with 15m Redis caching.
- [ ] `checkout_routes.ts` updated to call risk evaluator before ledger commit.
- [ ] Submissions return `400 RISK_EVAL_REQUIRED` if gate is enabled and no evaluation exists.

---

## [US2] Implement risk enforcement and shadow mode logic

- [ ] `block` outcome returns `403 RISK_DECLINED` and prevents ledger commit.
- [ ] `shadow_mode` flag allows checkout to proceed even on `block` outcomes while logging results.
- [ ] `review` outcome creates a case in `risk_review_cases` and returns `202 Accepted`.

---

## [US3] Implement Support Overrides and Review Queue API

- [ ] API endpoints for listing and updating `risk_review_cases` status.
- [ ] `risk_override` logic generates a one-time token for checkout bypass.
- [ ] All override actions are audit-logged with actor ID and reason.

---

## Integration tests for tenant isolation and gate-off regression

- [ ] Integration tests verify Org A cannot access Org B risk events or cases.
- [ ] Gate-off smoke tests confirm legacy checkout behavior is preserved when flag is OFF.
- [ ] Latency benchmarks confirm p95 < 200ms for evaluation calls.

---

## Observability wiring and documentation

- [ ] Prometheus metrics for `risk_eval_latency_ms` and `risk_outcome_count` implemented.
- [ ] Runbook for tuning weights and emergency kill switch published.
- [ ] `CLAUDE.md` updated with new risk engine architecture details.
