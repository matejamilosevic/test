# Specification — COD-31

> Source: [CodeMerlin](https://staging.codemerlin.ai/work-items/3c7c1b48-d7ab-4242-9520-ed5d67f77b7e?tab=specification) (approved 2026-06-08)  
> Version: `bd20632d-83f5-4acd-9cea-8a84efb66f0b`  
> Approved by: Mateja

# Specification: Checkout Commercial Pipeline (Quote, Promotions, Hold Lifecycle)

## Outcome
Unify the checkout process into a single commercial path where customers receive accurate, real-time pricing (including taxes, shipping, and discounts) and inventory is reliably reserved with a defined expiration to prevent stock leakage.

## User Stories

### User Story 1 — Accurate Checkout Pricing (Priority: P1)
As a customer, I want to see the final total including shipping and taxes before I pay, so that I am not surprised by hidden costs at the final step.
- Preflight response contains non-zero shipping fees when below the free-shipping threshold.
- Preflight response contains calculated tax based on the subtotal and shipping.
- The UI displays these fees directly from the server response without client-side recalculation.

### User Story 2 — Reliable Promotions (Priority: P1)
As a customer, I want to apply coupon codes and see the discount reflected immediately in my quote, so that I can verify my savings.
- Applying a valid coupon updates the `grand_total` and increments the `quote_version`.
- Applying an invalid or expired coupon returns a clear error message (e.g., `COUPON_EXPIRED`).
- Coupon application is idempotent for the same cart and quote version.

### User Story 3 — Inventory Reservation Lifecycle (Priority: P2)
As a merchant, I want inventory to be held during checkout but released if the customer abandons their cart, so that my Available to Promise (ATP) inventory remains accurate.
- Inventory holds are created with a configurable Time-to-Live (TTL).
- Holds are automatically released upon expiration or explicit abandonment.
- Releasing a hold is idempotent.

### User Story 4 — Checkout Integrity (Priority: P2)
As a system, I want to prevent orders from being submitted with stale pricing or expired holds, so that the final transaction matches the customer's last reviewed quote.
- Order submission fails if the `quote_version` does not match the active hold metadata.
- Order submission fails if the inventory hold has expired.

## Functional Requirements

1. **FR-001**: The system shall calculate shipping fees based on configurable rules (thresholds and surcharges) during the preflight and coupon application phases. [US1]
2. **FR-002**: The system shall apply a flat-rate tax to the sum of the subtotal and shipping fees. [US1]
3. **FR-003**: `POST /checkout/preflight` must return a `CheckoutQuote` object containing `subtotal`, `shipping_fee`, `tax`, `discount_total`, `grand_total`, `quote_version`, and `correlation_id`. [US1]
4. **FR-004**: `POST /checkout/coupon/apply` shall validate coupon eligibility and stack policies, returning a new quote on success. [US2]
5. **FR-005**: The system shall generate a `quote_version` using a SHA-256 hash of cart lines, shipping address, and applied promo codes. [US4]
6. **FR-006**: Inventory holds must include an `expires_at` timestamp calculated from a configurable `hold_ttl_seconds`. [US3]
7. **FR-007**: `POST /checkout/release` shall allow explicit release of an inventory hold by the client. [US3]
8. **FR-008**: Order submission must validate that the provided `quote_version` matches the version stored in the active hold metadata. [US4]
9. **FR-009**: The system shall provide a feature gate `checkout_commercial_pipeline_v1` to toggle between legacy (zero-fee) and new commercial logic. [US1]

## Success Criteria

1. **SC-001**: 100% of preflight requests for carts under the free-shipping threshold return a non-zero `shipping_fee`. [FR-001, FR-003]
2. **SC-002**: Coupon rejection reasons must use stable error codes (e.g., `COUPON_EXPIRED`, `MIN_SPEND_NOT_MET`). [FR-004]
3. **SC-003**: The `checkout_quote_latency` metric (p95) must be tracked for all preflight and coupon application requests. [FR-003, FR-004]
4. **SC-004**: Inventory holds must be released within 60 seconds of their `expires_at` time if not converted to an order. [FR-006]
5. **SC-005**: Submission attempts with a mismatched `quote_version` must return a `409 QUOTE_STALE` error. [FR-008]

## Edge Cases

- **Concurrent Edits**: If a user applies a coupon in one tab and tries to submit an older quote in another, the system must return `409 QUOTE_STALE`.
- **Expired Hold during Submit**: If the TTL expires exactly during the submission processing, the system must release the hold and reject the order.
- **Empty Cart Preflight**: Preflight requests for empty carts should return a 400 error or a zeroed quote with no hold created.
- **Multi-tenant Isolation**: A request to `/checkout/release` for a hold belonging to Organization B by a user in Organization A must be rejected with a 403 or 404.
- **Feature Gate Off**: When `checkout_commercial_pipeline_v1` is OFF, the system must return legacy hardcoded zero fees even if rules are configured.

## Out of Scope

- Integration with external tax providers (e.g., Avalara).
- Integration with external shipping carriers for real-time rate quoting.
- Multi-currency support or FX conversion logic.
- Real-time payment authorization (handled in downstream payment processing).
- Fraud scoring (handled by COD-21).

## Jira Requirement Coverage

| Jira AC | Covered by |
|---|---|
| Preflight for $100 cart returns non-zero shipping | FR-001, SC-001 |
| Valid coupon reduces total and increments version | FR-004, FR-005 |
| Expired coupon returns COUPON_EXPIRED | FR-004, SC-002 |
| Hold expires within 60s of TTL | FR-006, SC-004 |
| Submit with stale quote_version returns 409 | FR-008, SC-005 |
| Org A cannot release Org B holds | Edge Cases |
| Gate-off restores legacy fees: 0 | FR-009, Edge Cases |
| checkout_quote_latency tracked | SC-003 |
