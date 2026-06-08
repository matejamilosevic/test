# Technical Plan — COD-31

> Source: [CodeMerlin](https://staging.codemerlin.ai/work-items/3c7c1b48-d7ab-4242-9520-ed5d67f77b7e?tab=technical_plan) (approved 2026-06-08)  
> Version: `502a832e-1330-4bdf-a462-bd6191aa9b87`  
> Approved by: Mateja

# Technical Plan draft

## Technical approach
## Research decisions

We are unifying the checkout commercial pipeline by introducing a centralized `CheckoutQuoteService`. This service will be the single source of truth for pricing, replacing the current fragmented logic where `handle_checkout_preflight` returns hardcoded zeros.

**Trade-off 1: Hash-based vs. Sequential Versioning**: We chose SHA-256 hashing of the cart state (lines, address, promos) for `quote_version` over a simple incrementing counter. This ensures that identical cart states across different sessions or tabs result in the same version, reducing unnecessary `409 QUOTE_STALE` errors while maintaining strict integrity during submission.

**Trade-off 2: Lazy vs. Worker-based Expiry**: We will implement both. A BullMQ worker will handle bulk cleanup of expired holds to maintain ATP accuracy (SC-004), but we will also perform a 'lazy check' during the order submission. This prevents a race condition where a hold expires milliseconds before submission but the worker hasn't processed it yet.

## Component / module ownership

- **apps/api** (`src/api/checkout_routes.ts`): Owns the HTTP interface for preflight, coupon application, and release.
- **packages/services** (`src/services/checkout_quote_service.ts`): New package/module owning the `buildCheckoutQuote` logic and version hashing.
- **packages/services** (`src/services/reservation_ledger.ts`): Owns the inventory hold state and TTL logic.
- **packages/shared** (`src/lib/reporting_accumulator.ts`): Legacy helpers to be refactored for use by the new quote service.
- **apps/web** (`src/components/OrderSummaryPanel.tsx`): UI component for displaying the server-provided quote.

## Service interaction patterns

- **HTTP REST**: Clients interact with `/checkout/preflight` and `/checkout/coupon/apply`. Failure to reach these services results in a UI block to prevent stale pricing.
- **BullMQ**: A new `inventory-hold-expiry` queue will be used to trigger `releaseCartHold` when `expires_at` is reached. If the worker fails, the lazy check on submit acts as a safety net.
- **Database**: All operations are wrapped in transactions, specifically ensuring that `quote_version` validation and hold commitment are atomic.

## Feature-flag keys

- `checkout_commercial_pipeline_v1` → When OFF, `preflight` returns legacy hardcoded zero fees and skips version hashing.
- `inventory_hold_ttl_enabled` → When OFF, holds are created without an `expires_at` timestamp and the expiry worker ignores them.

## Multi-tenancy contract

Every query against the reservation ledger and quote snapshots MUST include an `organization_id` filter. The `POST /checkout/release` endpoint will validate that the `hold_id` belongs to the `organization_id` extracted from the requester's JWT to prevent cross-tenant hold manipulation.

## Affected components
- **api-service** — Updates `checkout_routes.ts` to implement new preflight and coupon logic; adds `/checkout/release`.
- **quote-service** — New service `checkout_quote_service.ts` for centralized pricing logic.
- **reservation-ledger** — Updates `reservation_ledger.ts` to support TTL and version metadata.
- **web-app** — Updates `OrderSummaryPanel.tsx` to consume full quote objects.
- **database** — New migration `0186_add_hold_metadata.sql` to add TTL and version columns.

## Data model changes
Table: `inventory.reservation_holds` (or equivalent ledger table)
- `expires_at`: `timestamp with time zone`, nullable (null if TTL disabled), indexed for expiry worker.
- `quote_version`: `varchar(64)`, non-nullable, stores the SHA-256 hash.
- `correlation_id`: `uuid`, non-nullable, for tracing the quote through submission.

Migration: `0186_add_hold_metadata.sql` (Idempotent via `IF NOT EXISTS`).
Drizzle Schema: `src/db/schema/inventory.ts`

## API changes
### POST /checkout/preflight
- **Auth**: JWT Session
- **Request**: `{ cart_id: string, shipping_address: Address }`
- **Response**: `CheckoutQuote` (subtotal, shipping_fee, tax, discount_total, grand_total, quote_version, correlation_id, expires_at)

### POST /checkout/coupon/apply
- **Auth**: JWT Session
- **Request**: `{ cart_id: string, code: string, current_quote_version: string }`
- **Response**: `CheckoutQuote` or `{ applied: false, reason: string }` (Error codes: `COUPON_EXPIRED`, `MIN_SPEND_NOT_MET`)

### POST /checkout/release
- **Auth**: JWT Session
- **Request**: `{ hold_id: string }`
- **Response**: `200 OK` (Idempotent)

## Migration / rollout
1. **Pre-deployment**: Ensure `checkout_commercial_pipeline_v1` and `inventory_hold_ttl_enabled` are OFF in all environments.
2. **Database**: Run migration `0186_add_hold_metadata.sql` to add columns.
3. **App Deploy**: Deploy updated API and Quote services.
4. **Activation**: Enable `checkout_commercial_pipeline_v1` to start generating real quotes.
5. **Cleanup**: Enable `inventory_hold_ttl_enabled` and start the BullMQ expiry worker.
6. **Rollback**: Disable both flags; the system will revert to zero-fee logic and ignore the new metadata columns.

## Operational considerations
- **Metrics**: `checkout_quote_latency` (Timer), `hold_expired_total` (Counter), `coupon_rejected_total` (Counter).
- **Queues**: `inventory-hold-expiry` (BullMQ) with 3 retries and exponential backoff.
- **Logs**: Monitor for "Quote version mismatch for cart {id}" to detect high rates of `409` errors which may indicate UI sync issues.
- **PostHog**: Emit `checkout_quote_generated` and `coupon_applied` events (including `organization_id`).

## Repository scope
Scope is limited to the primary backend repository (`matejamilosevic/test`). Coordination with the frontend is required to ensure `OrderSummaryPanel` is updated simultaneously with the API deployment to avoid displaying zero fees when the server starts returning real values.

## Risks
1. **Migration Lock**: Adding columns to a high-traffic ledger table. Mitigation: Use nullable columns with defaults handled in code to avoid long-running table rewrites.
2. **Multi-tenancy**: Risk of Org A releasing Org B's holds. Mitigation: Strict `organization_id` enforcement in the `WHERE` clause of all ledger updates.
3. **Performance**: SHA-256 hashing and complex shipping rules could increase latency. Mitigation: Cache shipping rules in memory and monitor `checkout_quote_latency` p95.
4. **Rollback**: If the migration is reversed, `quote_version` data is lost. Mitigation: Ensure the application can gracefully handle missing metadata if the flag is toggled back.

## Alternatives considered
1. **Client-side Quoting**: Considered calculating tax/shipping in the browser for speed. Rejected because it leads to price drift and security vulnerabilities; the server must be the source of truth.
2. **Soft Deletes for Holds**: Considered marking holds as 'expired' instead of releasing them. Rejected to keep the ledger lean; explicit release/deletion is preferred for ATP accuracy.

## Requirement mapping
- **FR-001** — addressed
- **FR-002** — addressed
- **FR-003** — addressed
- **FR-004** — addressed
- **FR-005** — addressed
- **FR-006** — addressed
- **FR-007** — addressed
- **FR-008** — addressed
- **FR-009** — addressed
- **SC-001** — addressed
- **SC-002** — addressed
- **SC-003** — addressed
- **SC-004** — addressed
- **SC-005** — addressed

## ADR references
