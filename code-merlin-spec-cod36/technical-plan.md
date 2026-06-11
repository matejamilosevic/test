# COD-36 Technical Plan

> **Citation**: [CodeMerlin Technical Plan](https://staging.codemerlin.ai/work-items/e1a84b21-b0a8-474c-a3e5-5b04a6cc6e92?tab=technical_plan)  
> **Version**: 14d4a5ad-5533-42cb-8219-acbbd7690c65  
> **Approved**: 2026-06-11T13:21:53.022Z by Luka Bura

## Technical approach

### Research decisions

1. **Quote Versioning Strategy**: Integer-based sequential versioning for `CheckoutQuote` to avoid clock-skew issues and provide deterministic stale detection (409 Conflict).
2. **Inventory Hold TTL**: Holds stored with explicit `expires_at`. Lazy expiration at submit time for immediate consistency, supplemented by a 60-second cleanup buffer.

**Trade-offs**:
- *Lazy vs. Proactive Expiration*: Lazy expiration at submit ensures we never process an expired hold; background cleanup prevents table bloat.
- *In-memory vs. DB-backed Quotes*: DB-backed quotes for cross-device resume; harness uses in-memory hold metadata with SQL migration stubs.

## Component / module ownership

- `src/api`: `checkout_routes` and `checkout_quote_service` logic
- `src/services`: `reservation_ledger`, `checkout_metrics`, hold cleanup job
- `src/lib`: `CheckoutQuote` Zod schema, feature gate constants
- **Must NOT be modified**: Payment provider adapters and frontend UI components

## Feature-flag keys

- `checkout_commercial_pipeline_v1` → When OFF, `shipping_fee`, `tax`, and `discount_total` return `0`. `quote_version` is ignored during submission.

## API changes

| Endpoint | Auth | Success | Key errors |
|---|---|---|---|
| POST /checkout/preflight | JWT Session | 200 CheckoutQuote | 401 |
| POST /checkout/coupon/apply | JWT Session | 200 updated quote | 422 COUPON_EXPIRED, MIN_SPEND_NOT_MET |
| POST /checkout/release | JWT Session | 204 | 403 cross-org |
| POST /checkout/submit | JWT Session | 201 Created | 409 QUOTE_STALE, 422 HOLD_EXPIRED |

## Migration / rollout

1. Ensure `checkout_commercial_pipeline_v1` gate is OFF pre-deployment
2. Run `0186_add_hold_metadata.sql`
3. Deploy updated API with new service logic
4. Enable gate for pilot organizations
5. Rollback via gate toggle; DB changes are additive

## Operational considerations

- **Metrics**: `checkout.quote_stale_total`, `checkout.hold_expired_total`, `checkout.quote_latency_ms`
- **Cleanup**: `checkout-hold-cleanup` job every 60 seconds
