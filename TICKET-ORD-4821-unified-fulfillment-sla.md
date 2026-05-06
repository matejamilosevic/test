# ORD-4821 — Unified fulfillment timeline + SLA engine (v1)

**Type:** Feature / Platform  
**Priority:** P2  
**Labels:** `backend`, `frontend`, `data-migration`, `observability`

## Summary

Replace ad-hoc “status timestamps” and manual SLA checks with a **single event-sourced fulfillment timeline**, a **configurable SLA policy engine**, and **customer-visible ETA ranges** across web, API, and bulk/export flows.

## Problem

- Order status changes are logged inconsistently (some paths write `updated_at`, others emit domain events, some only touch read models).
- SLA breaches are detected in cron scripts with duplicated rules per carrier/region.
- Support and customers see different “expected delivery” logic than internal tools.

## Goals

1. **Canonical timeline** — Every fulfillment-relevant transition appends an immutable row to `fulfillment_timeline_events` (or equivalent) with `order_id`, `actor`, `from_status`, `to_status`, `correlation_id`, `payload` (JSON), and `occurred_at`.
2. **SLA policies as data** — Policies are versioned documents (region, product class, carrier, channel) with declarative rules; evaluation is deterministic and unit-tested.
3. **Consistent surfaces** — Order detail API, admin console, and CSV/JSON bulk exports expose the same timeline + computed SLA fields (`sla_deadline_at`, `breach_risk`, `eta_window`).

## Scope (why this is a “big PR”)

- **DB:** New tables + indexes; backfill job from historical `orders` / legacy logs; feature flag to dual-write during rollout.
- **Backend:** Event writers at all transition points; policy loader + evaluator service; extend public and internal APIs; deprecate old SLA cron entrypoints.
- **Frontend:** Order detail timeline UI, policy viewer (read-only v1), badges for breach risk.
- **Bulk/export:** Extend export schema; document breaking changes (version bump).
- **Observability:** Metrics for evaluation latency, backfill lag, dual-write mismatch rate; structured logs with `correlation_id`.

## Non-goals (v1)

- Customer self-service policy editing.
- Real-time push notifications (polling / refresh is enough).
- ML-based ETA; use rule-based windows only.

## Acceptance criteria

- [ ] All documented order transitions produce exactly one timeline event (idempotent on retries).
- [ ] Golden tests cover ≥10 representative policy matrices (region × carrier × product class).
- [ ] API responses include `timeline[]` and `sla` object; OpenAPI updated.
- [ ] Admin UI shows timeline with actor and correlation id; export includes new columns behind `export_version=2`.
- [ ] Backfill completes for last 24 months without blocking writes (batched); runbook documents rollback (disable flag, stop evaluator).

## Risks / dependencies

- Historical data quality may require heuristic mapping for old statuses — document assumptions in runbook.
- Coordinating deploy order: migration → dual-write → backfill → cut read path → remove legacy.

## Estimate

**L —** one large PR or a small train of PRs if your team splits by layer; expect broad touch (DB, services, UI, jobs, docs).
