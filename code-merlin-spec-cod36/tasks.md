# COD-36 Tasks

> **Citation**: [CodeMerlin Tasks](https://staging.codemerlin.ai/work-items/e1a84b21-b0a8-474c-a3e5-5b04a6cc6e92?tab=tasks)  
> **Version**: cc2f2456-2e8f-418d-bc15-8c63fa619d10  
> **Approved**: 2026-06-11T13:24:36.288Z by Luka Bura

- [x] `CheckoutQuote` schema in `src/services/checkout_quote_service.ts` with subtotal, shipping_fee, tax, discount_total, grand_total, quote_version, correlation_id
- [x] `checkout_commercial_pipeline_v1` constant in `src/lib/checkout_constants.ts`
- [x] Migration `0186_add_hold_metadata.sql` with hold metadata and `platform.checkout_quotes` table
- [x] `checkout_quote_service` — $50 free shipping threshold, feature gate OFF returns zero fees
- [x] Coupon application — validation, version increment, 422 errors
- [x] Hold TTL via `expires_at`, idempotent `POST /checkout/release`, cross-org 403
- [x] Submit integrity — 409 QUOTE_STALE, 422 HOLD_EXPIRED, 201 Created
- [x] `checkout-hold-cleanup` job (60s interval)
- [x] Integration tests in `checkout_commercial.test.ts`
- [x] Metrics and `internal-feature-flags.md` documentation
