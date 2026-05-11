# OBS-2744 — Session replay sampling + PII scrub pipeline for product analytics

**Type:** Feature / Observability  
**Priority:** P3  
**Labels:** `frontend`, `privacy`, `infra`, `analytics`, `security-review`

## Summary

Introduce **opt-in session replay** for a small, representative slice of authenticated sessions to debug UX regressions and funnel drops. Captured payloads pass through a **central scrubber** that redacts PII and secrets before storage; **retention**, **access roles**, and **consent linkage** are explicit so observability gains do not outpace compliance.

## Problem

- Support and product rely on screenshots and anecdotes when reproducing “/checkout froze” or “address form cleared” reports.
- Third-party replay tools were rejected for **data residency** and **opaque PII handling**.
- Client-side logging is verbose enough to leak tokens or free-text fields when engineers add “temporary” `console.log`s.
- No standard **sampling policy** — either zero visibility or ad-hoc full capture in staging only.

## Goals

1. **Deterministic sampling** — Configurable rates per `app_surface` + `severity`; sticky session id so a replay belongs to one trace; kill switch via feature flag with <1 min propagation.
2. **Scrub-before-store** — Pluggable rules (regex + DOM selectors + field registry) with golden fixtures; failed scrub → **drop chunk**, not “best effort” store.
3. **Consent gate** — Only record when `analytics.session_replay` scope is true and region policy allows; banner copy and settings page link to privacy explainer.
4. **Access model** — Replay viewer role in internal admin; all views **watermarked** and **audit-logged**; export disabled in v1.

## Scope

- **SDK:** Lightweight recorder (mutations + network metadata; **no** full response bodies by default).
- **Pipeline:** Ingest → scrub → object store with TTL; metadata index for search by `session_id`, `release`, `route`.
- **UI:** Internal “session inspector” with timeline, console breadcrumbs, link-out to APM trace id when present.

## Non-goals (v1)

- Heatmaps or long-term UX benchmarking suites.
- Full RUM parity with commercial products (long tasks, layout instability) unless already on roadmap elsewhere.
- Public API for third parties to pull replays.

## Acceptance criteria

- [ ] Sampling and consent documented in runbook; default **off** in production until SRE sign-off.
- [ ] Scrubber tests cover emails, phone numbers, payment last-four patterns, auth headers, and password fields; CI fails on regression.
- [ ] No replay stored if scrubber errors or consent missing; metrics for `dropped_scrub_failed` and `skipped_no_consent`.
- [ ] Audit log entry for each replay opened in internal UI (actor, session id, timestamp).
- [ ] Data deleted within **N** days of TTL; manual erase request removes replay index + blobs.

## Risks / dependencies

- **Performance:** Recorder must stay under agreed CPU/network budget on low-end devices; fallback to “metadata only” mode.
- **Legal:** Coordinate with privacy council for wording and regional carve-outs (replay may be unavailable in some locales).
- Depends on stable **release version** tagging in the web app for filtering replays by deployment.

## Estimate

**M —** SDK + pipeline + scrub harness + internal viewer; can ship behind flag in two milestones if scrub rules and consent are agreed early.
