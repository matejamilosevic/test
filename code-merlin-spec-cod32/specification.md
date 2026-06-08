# Specification — COD-32

**Approval:** approved (2026-06-08T11:10:01.788Z)  
**Version ID:** `9efb0306-30cb-435a-8964-94607c6951c3`  
**Source:** [CodeMerlin specification](https://staging.codemerlin.ai/work-items/72081f3b-7585-4ebe-a16a-5f1bda7cf8ae?tab=specification)

## Outcome

Establish a robust commercial checkout pipeline that replaces hardcoded fee stubs with accurate server-side pricing (shipping, tax, and discounts), introduces versioned quotes to prevent stale submissions, and implements a managed inventory hold lifecycle with TTL-based expiration and explicit release capabilities.

## User Stories

### User Story 1 — Accurate Pricing (Priority: P1)

As a customer, I want to see the final total including subtotal, shipping, and tax minus any discounts from the server response, so that I have confidence in the final price without relying on client-side calculations.

### User Story 2 — Promotions (Priority: P1)

As a customer, I want to apply coupons to my checkout and see the price update immediately, so that I can benefit from promotional offers.

### User Story 3 — Hold Lifecycle (Priority: P2)

As a system administrator, I want inventory holds to have a defined time-to-live (TTL) and an explicit release mechanism, so that inventory is not locked indefinitely by abandoned checkouts.

### User Story 4 — Checkout Integrity (Priority: P2)

As a customer, I want the system to prevent me from submitting an order with an outdated price or an expired hold, so that my order is processed with the terms I last agreed to.

## Functional Requirements

1. **FR-001**: `POST /checkout/preflight` returns `CheckoutQuote` with subtotal, shipping_fee, tax, discount_total, grand_total, quote_version, correlation_id.
2. **FR-002**: Non-zero `shipping_fee` for carts below free-shipping threshold.
3. **FR-003**: `POST /checkout/coupon/apply` validates coupon code.
4. **FR-004**: Successful coupon application returns new `CheckoutQuote` with incremented `quote_version`.
5. **FR-005**: `COUPON_EXPIRED` for expired coupons.
6. **FR-006**: `MIN_SPEND_NOT_MET` when subtotal below coupon threshold.
7. **FR-007**: Holds include `expires_at` from `hold_ttl_seconds`.
8. **FR-008**: `POST /checkout/release` explicitly releases hold (idempotent).
9. **FR-009**: `POST /checkout/submit` rejects stale `quote_version` with 409 `QUOTE_STALE`.
10. **FR-010**: Feature gate OFF reverts to legacy behavior (fees = 0).
