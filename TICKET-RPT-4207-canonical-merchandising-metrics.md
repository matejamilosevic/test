# RPT-4207 — Canonical merchandising metrics pipeline + accumulator v1

**Type:** Feature / Platform  
**Priority:** P2  
**Labels:** `backend`, `reporting`, `data`, `checkout`, `api-contract`

## Summary

Replace one-off dashboard queries and ad-hoc spreadsheets with a **single, versioned merchandising metrics layer** built around the existing **reporting accumulator** idea: every order, refund, and adjustment produces **idempotent facts** that roll up to GMV, net revenue, discount leakage, shipping revenue, and margin signals. Downstream BI, finance close, and partner exports all read the **same materialized rollups** with explicit **as-of** semantics.

## Problem

- Finance and growth each maintain parallel definitions of “revenue” (pre/post tax, pre/post returns, inclusive/exclusive of shipping).
- Checkout snapshots and fulfillment events land in different stores; reporting joins are fragile and slow at month-end.
- Partial replay (e.g. one order re-processed) can double-count or drop lines without a stable **fact key**.
- External exports lack a **schema version**; breaking column changes silently break partner integrations.

## Goals

1. **Fact table contract** — Introduce `merchandising_facts` (or equivalent) keyed by `{source, source_id, line_id, event_type}` with amounts in minor units, currency, tax bucket, channel, and `correlation_id` aligned with checkout and fulfillment traces.
2. **Accumulator semantics** — Extend the reporting accumulator into a pure **reduce** step over ordered facts: deterministic given the same input stream (golden fixtures for representative orders, partial refunds, split shipments, gift cards).
3. **Versioned exports** — CSV/JSON exports declare `export_version`; deprecations are announced with a **minimum** overlap window for consumers.
4. **As-of reads** — API and jobs can request rollups `as_of=ISO8601` for audit and close; document clock source and late-arriving fact handling.

## Scope (why this is a “big ticket”)

- **Ingestion:** Wire checkout submit / order-finalize paths to emit fact rows (or enqueue to an outbox); reconcile with legacy `orders` rows during dual-write.
- **Storage:** Fact + rollup tables, partitioning by time, indexes for channel/SKU slices; optional columnar projection for BI.
- **Jobs:** Hourly rollup refresh, backfill from historical orders, reconciliation report (fact total vs. legacy total) with alerting threshold.
- **API:** Internal read endpoints for aggregates and drill-down; OpenAPI with stable error `code` on bad `as_of` / currency mismatch (per STYLEGUIDE).
- **Docs:** Metric dictionary (single source of truth for metric names), runbook for backfill and replay.

## Non-goals (v1)

- Self-serve metric builder for non-engineers (fixed catalog of rollups only).
- Real-time sub-second dashboards (minute-level freshness is enough).
- Full general ledger / ERP replacement.

## Acceptance criteria

- [ ] Golden tests cover ≥8 scenarios: simple sale, multi-line discount, partial refund, full return, shipping surcharge, tax-inclusive region, currency round-trip, duplicate ingest (idempotent).
- [ ] Rollup job produces identical results when facts are replayed in batch vs. streamed in-order.
- [ ] Export documents `export_version` and column order; sample fixture checked into repo.
- [ ] Reconciliation job emits a report artifact; breach of threshold pages on-call (or tickets) per runbook.
- [ ] `as_of` query returns 400 with stable `code` for unparseable or future timestamps.

## Risks / dependencies

- Historical data quality (missing tax splits, manual credits) may require **exception** rows and manual mapping tables.
- Must align with **INV-5100** / checkout `correlation_id` and order reference fields for traceability.
- Finance sign-off on metric definitions before flipping org-wide defaults.

## Estimate

**L–XL —** schema + ingestion + jobs + exports + reconciliation; likely multiple PRs over several weeks depending on backfill volume and partner coordination.
