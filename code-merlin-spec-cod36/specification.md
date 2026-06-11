# COD-36 Specification

> **Citation**: [CodeMerlin Specification](https://staging.codemerlin.ai/work-items/e1a84b21-b0a8-474c-a3e5-5b04a6cc6e92?tab=specification)  
> **Version**: 7c5b1ff2-1dbf-4b72-a02c-bad167361f12  
> **Approved**: 2026-06-11T13:20:51.166Z by Luka Bura

## Outcome

Transition the checkout process from client-side fee stubs to a robust server-side commercial pipeline. This ensures accurate pricing for shipping, taxes, and discounts, prevents stale order submissions through versioned quotes, and manages inventory availability via a time-limited hold lifecycle.

## User Stories

### User Story 1 — Accurate pricing (Priority: P1)

As a customer, I want the final total from the server so I can trust the price without client-side math.

*   The checkout preflight returns a breakdown of subtotal, shipping, tax, and discounts.
*   Shipping fees are automatically calculated based on the cart total.

### User Story 2 — Promotions (Priority: P1)

As a customer, I want to apply coupons and see the price update immediately.

*   Applying a valid coupon code updates the quote and increments the quote version.
*   Invalid or expired coupons provide clear error feedback.

### User Story 3 — Hold lifecycle (Priority: P2)

As an admin, I want holds to expire via TTL and be explicitly releasable so inventory is not locked forever.

*   Inventory holds have a visible expiration timestamp.
*   Holds can be manually released via an idempotent endpoint.

### User Story 4 — Checkout integrity (Priority: P2)

As a customer, I want the system to block submission with an outdated price or expired hold.

*   Submitting an order with a stale quote version results in a conflict error.
*   Orders cannot be placed if the inventory hold has expired.

## Functional Requirements

1.  **FR-001**: The system shall provide a `POST /checkout/preflight` endpoint that returns a `CheckoutQuote` containing `subtotal`, `shipping_fee`, `tax`, `discount_total`, `grand_total`, `quote_version`, and `correlation_id`. [User Story 1]
2.  **FR-002**: The system shall calculate a non-zero `shipping_fee` for carts with a subtotal below $50. [User Story 1]
3.  **FR-003**: The system shall provide a `POST /checkout/coupon/apply` endpoint that validates coupon codes and returns an updated `CheckoutQuote` with an incremented `quote_version`. [User Story 2]
4.  **FR-004**: The system shall return a `422 COUPON_EXPIRED` error if a user attempts to apply an expired coupon. [User Story 2]
5.  **FR-005**: The system shall return a `422 MIN_SPEND_NOT_MET` error if the cart subtotal is below the coupon's required minimum. [User Story 2]
6.  **FR-006**: The system shall assign an `expires_at` timestamp to inventory holds based on a configurable `hold_ttl_seconds`. [User Story 3]
7.  **FR-007**: The system shall provide an idempotent `POST /checkout/release` endpoint that returns `204 No Content` upon successful release of a hold. [User Story 3]
8.  **FR-008**: The system shall restrict hold release to the organization that owns the hold, returning `403 Forbidden` for cross-org attempts. [User Story 3]
9.  **FR-009**: The system shall reject `POST /checkout/submit` requests with a `409 QUOTE_STALE` error if the provided `quote_version` does not match the current server-side version. [User Story 4]
10. **FR-010**: The system shall reject `POST /checkout/submit` requests if the associated inventory hold has expired. [User Story 4]
11. **FR-011**: The system shall return `401 Unauthorized` for unauthenticated requests to the preflight endpoint. [User Story 1]
12. **FR-012**: The system shall preserve legacy zero-fee behavior when the `checkout_commercial_pipeline_v1` feature gate is disabled. [User Story 1]

## Success Criteria

1.  **SC-001**: 100% of successful `POST /checkout/preflight` calls return a non-null `quote_version` and `correlation_id`.
2.  **SC-002**: Shipping fee is exactly $0.00 for all carts ≥ $50.00 and > $0.00 for carts < $50.00.
3.  **SC-003**: `POST /checkout/submit` latency remains under 500ms for 95% of requests (p95).
4.  **SC-004**: Zero inventory holds remain active beyond their `expires_at` timestamp plus a 60-second cleanup buffer.
5.  **SC-005**: 100% of order submissions with mismatched `quote_version` are blocked with `409 QUOTE_STALE`.

## Edge Cases

*   **Empty Cart**: Preflight requests for empty carts should return a quote with zeroed totals and a valid `quote_version` rather than an error.
*   **Concurrent Coupon Application**: If two coupons are applied simultaneously, the system must ensure the `quote_version` increments sequentially and only one valid state persists.
*   **Hold Expiration during Submit**: If a hold expires exactly during the processing of `POST /checkout/submit`, the transaction must roll back and return an expiration error.
*   **Feature Gate Toggle**: If the feature gate is toggled OFF mid-session, subsequent submissions must handle the transition gracefully (e.g., by defaulting to legacy validation).
*   **Multi-tenant Isolation**: Ensure that `correlation_id` and `quote_version` are strictly scoped to the authenticated user's session and organization.

## Out of Scope

*   Changes to the client-side UI or frontend components.
*   Integration with third-party payment providers (e.g., Stripe, PayPal).
*   Dynamic tax jurisdiction lookup (tax calculation logic is assumed to be internal or static for this phase).
