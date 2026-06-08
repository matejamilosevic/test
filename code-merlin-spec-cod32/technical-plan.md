# Technical Plan — COD-32

**Approval:** approved (2026-06-08T11:10:29.704Z)  
**Version ID:** `d2f0fd50-5cc0-4012-b263-ebe8b6636d12`  
**Source:** [CodeMerlin technical plan](https://staging.codemerlin.ai/work-items/72081f3b-7585-4ebe-a16a-5f1bda7cf8ae?tab=technical_plan)

## Technical approach

Versioned commercial checkout with integer `quote_version` stored in hold metadata, TTL-backed holds with 60s submit grace period, and feature gate `checkout_commercial_pipeline_v1`.

## Affected components

- `src/api/checkout_routes.ts` — commercial logic and version validation
- `src/services/reservation_ledger.ts` — hold metadata (expires_at, quote_version)
- `src/lib/checkout_constants.ts` — DTOs and error codes
- `migrations/0186_add_hold_metadata.sql` — schema migration

## Feature-flag keys

- `checkout_commercial_pipeline_v1` → OFF returns zero fees
