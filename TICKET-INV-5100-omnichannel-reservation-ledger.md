# INV-5100 — Omnichannel reservation ledger + checkout allocation v2

**Type:** Feature / Platform  
**Priority:** P1  
**Labels:** `backend`, `inventory`, `checkout`, `transactions`, `observability`

## Summary

Introduce a **durable, auditable reservation ledger** that coordinates warehouse availability, cart holds, payment capture, and fulfillment allocation so **no channel oversells** and **every checkout path** uses the same concurrency model. Builds on existing inventory sync and checkout surfaces by replacing best-effort totals with **serializable reservations** and explicit **release / commit / transfer** transitions.

## Problem

- Multiple writers (POS, web checkout, marketplace connectors, bulk replenisment jobs) adjust stock without a single source of truth for in-flight demand.
- Checkout preflight and submit can race: two sessions may both see “available” and proceed until a late failure or manual intervention.
- Partial failures (payment authorized but allocation lost) are hard to reconcile; support lacks a per-line ledger tied to `correlation_id`.
- Reporting and operational dashboards aggregate **projected** inventory while fulfillment still sees **legacy buckets** that drift during peak.

## Goals

1. **Ledger as contract** — Every quantity change affecting sellable stock is an append-only `inventory_reservation_events` row: `sku_id`, `location_id`, `delta`, `reason` (cart_hold, payment_pending, committed, released, transferred), `reference` (order_id, cart_id, external_ref), `correlation_id`, `occurred_at`.
2. **Serializable holds** — Cart and checkout acquire time-bounded holds with TTL and extension rules; submit either **commits** holds into committed allocation or **releases** on hard failure paths.
3. **Single evaluation path** — One service API (`reserve`, `extend`, `commit`, `release`, `reconcile`) used by HTTP checkout, internal tools, and batch reconcilers; no ad-hoc direct stock mutation from feature code.
4. **Observable drift** — Metrics and alerts for hold expiry backlog, unreleased holds after payment, and mismatch between ledger-derived ATP and legacy projections.

## Scope (why this is a “big ticket”)

- **DB:** New ledger + materialized “available to promise” view or periodic snapshot table; indexes for hot `sku_id`/`location_id` lookups; migration strategy with backfill from current balances and open orders.
- **Backend:** Wire `checkout_routes` preflight/submit to reservation API; extend `inventory_sync_service` ingestion to post **adjustment events** instead of overwriting totals where possible; add idempotency keys on all mutating endpoints.
- **Reconciliation:** Nightly (or continuous) job to diff ledger vs. warehouse truth; admin tooling to approve corrective transfers.
- **API:** Versioned JSON errors per STYLEGUIDE (stable `code` on validation failure); OpenAPI updates for checkout and internal reservation endpoints.
- **Frontend / UX:** Surface hold expiry warnings in order summary; operator view for active holds by SKU (read-only v1).
- **Observability:** Traces spanning checkout → reservation → payment; dashboards for commit rate, release latency, and contention hotspots.

## Non-goals (v1)

- Cross-region active-active replication (single primary region; read replicas OK).
- Dynamic pricing or promotions driven by ATP (keep existing coupon/checkout logic).
- Full replacement of vendor EDI ingest formats — emit ledger events **after** existing ingest normalizes payloads.

## Acceptance criteria

- [ ] Two concurrent checkout sessions for the last unit cannot both commit; one receives a deterministic `INSUFFICIENT_STOCK` (or equivalent) with stable error `code`.
- [ ] Every successful order line has a matching committed ledger chain traceable from API response / export.
- [ ] Holds auto-expire per policy; expired holds restore ATP within SLO; metrics exposed for `holds_expired_total`.
- [ ] Golden / integration tests cover: happy path commit, payment failure release, partial ship transfer, sync job racing with checkout.
- [ ] Runbook documents freeze procedure, manual release, and rollback (feature flag to bypass ledger read path with documented risk).

## Risks / dependencies

- Backfill accuracy depends on historical open carts and partial shipments — may need bounded “unknown” bucket with human review queue.
- Vendor latency: reservation timeouts must be tuned against slow payment providers to avoid false releases.
- Requires coordination with fulfillment timeline work (ORD-4821) for consistent `correlation_id` across domains.

## Estimate

**XL —** multiple PRs by layer (schema + core service → checkout → sync → UI → observability); expect 3–6 sprint weeks depending on data quality and rollout strategy.
