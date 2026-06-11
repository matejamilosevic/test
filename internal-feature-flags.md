# Internal Feature Flags

## checkout_commercial_pipeline_v1

Enables server-side commercial pricing in checkout (shipping, tax, discounts) with versioned quotes and hold TTL.

- **OFF**: `shipping_fee`, `tax`, and `discount_total` return 0; legacy fee stubs.
- **ON**: Full `CheckoutQuote` breakdown with integer `quote_version`.

Environment override: `CHECKOUT_COMMERCIAL_PIPELINE_V1=false` disables the pipeline.

## PostHog: checkout_submitted

Properties when commercial pipeline is enabled:

- `quote_version` (integer)
- `discount_applied` (boolean)

Metrics:

- `checkout.quote_stale_total` — 409 QUOTE_STALE counter
- `checkout.hold_expired_total` — holds expired before submission (422 HOLD_EXPIRED)
- `checkout-hold-cleanup` — BullMQ-style interval job (60s) purging expired holds past grace buffer
