# Tasks — COD-31

> Source: [CodeMerlin](https://staging.codemerlin.ai/work-items/3c7c1b48-d7ab-4242-9520-ed5d67f77b7e?tab=tasks) (approved 2026-06-08)  
> Version: `d983a065-9a0f-4d1c-9fc8-a839395012e7`  
> Approved by: Mateja

Add shared Zod schemas for CheckoutQuote and Preflight
- [ ] Export `CheckoutQuote`, `PreflightRequest`, and `CouponApplyRequest` schemas from `src/services/checkout_quote_service.ts`
- [ ] `CheckoutQuote` includes `subtotal`, `shipping_fee`, `tax`, `discount_total`, `grand_total`, `quote_version`, and `correlation_id`
- [ ] `quote_version` is defined as a 64-character string (SHA-256)
---
Add migration 0186_add_hold_metadata for reservation holds
- [ ] Migration adds `expires_at` (timestamptz), `quote_version` (varchar 64), and `correlation_id` (uuid) to `reservation_holds` table
- [ ] Index created on `expires_at` for expiry worker performance
- [ ] Drizzle schema in `src/services/reservation_ledger.ts` updated to match DDL
---
[US1] Implement buildCheckoutQuote with shipping and tax rules
- [ ] `buildCheckoutQuote` calculates non-zero shipping based on threshold/surcharge rules
- [ ] Flat-rate tax applied to subtotal + shipping
- [ ] `quote_version` generated via SHA-256 hash of cart state
- [ ] Unit tests in `src/services/checkout_quote_service.test.ts` pass
---
[US1] Update POST /checkout/preflight with real quote logic
- [ ] Route returns full `CheckoutQuote` instead of hardcoded zeros
- [ ] Feature gate `checkout_commercial_pipeline_v1` toggles legacy vs new behavior
- [ ] Integration test verifies non-zero fees for $100 cart
---
[US2] Implement POST /checkout/coupon/apply with stack policy
- [ ] Valid coupon updates `grand_total` and `quote_version`
- [ ] Ineligible codes return `COUPON_EXPIRED` or `MIN_SPEND_NOT_MET`
- [ ] Idempotency keyed by `(cart_id, code, quote_version)`
---
[US3] Implement hold TTL and POST /checkout/release
- [ ] `reserveCartHold` sets `expires_at` based on `hold_ttl_seconds` config
- [ ] `POST /checkout/release` clears holds idempotently
- [ ] Multi-tenant check: Org A cannot release Org B holds (returns 403/404)
---
[US4] Implement submit guard for quote_version and lazy expiry
- [ ] Order submission validates `quote_version` against hold metadata
- [ ] Mismatch returns `409 QUOTE_STALE`
- [ ] Lazy-expiry check releases hold if TTL passed during submit
---
Update OrderSummaryPanel UI and add observability metrics
- [ ] `OrderSummaryPanel` displays `shipping_fee` and `tax` from server quote
- [ ] `checkout_quote_latency` tracked on preflight and coupon routes
- [ ] `hold_expired_total` and `coupon_rejected_total` counters implemented
