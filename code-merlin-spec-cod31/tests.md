# Tests — COD-31

> Source: [CodeMerlin](https://staging.codemerlin.ai/work-items/3c7c1b48-d7ab-4242-9520-ed5d67f77b7e?tab=tests) (approved 2026-06-08)  
> Version: `30b311ec-4253-4aad-844e-1534e7d44fed`  
> Approved by: Mateja

## 1. Preflight returns non-zero shipping and tax

- **Type:** integration | **Category:** happy
- **FR:** FR-001, FR-002, FR-003 | **AC:** ac.1
- **Test data:** cart-100-usd

1. Authenticate as alice@acme.com
2. POST /checkout/preflight with cart-100-usd
3. Verify status 200
4. Verify shipping_fee > 0 and tax > 0
5. Verify quote_version is present

## 2. Valid coupon updates quote and version

- **Type:** integration | **Category:** happy
- **FR:** FR-004, FR-005 | **AC:** ac.2
- **Test data:** SAVE10

1. Perform preflight to get version V1
2. POST /checkout/coupon/apply with code SAVE10 and version V1
3. Verify status 200
4. Verify grand_total is reduced
5. Verify quote_version is different from V1

## 3. Expired coupon rejection

- **Type:** integration | **Category:** error
- **FR:** FR-004 | **AC:** ac.2
- **Test data:** EXPIRED20

1. POST /checkout/coupon/apply with code EXPIRED20
2. Verify status 200
3. Verify applied: false
4. Verify reason: COUPON_EXPIRED

## 4. Explicit hold release

- **Type:** integration | **Category:** happy
- **FR:** FR-007 | **AC:** ac.3
- **Test data:** org-acme-01

1. Create hold-123 for cart-100-usd
2. POST /checkout/release with hold_id hold-123
3. Verify status 200
4. Verify inventory is restored

## 5. Submit with stale quote version

- **Type:** integration | **Category:** edge
- **FR:** FR-008 | **AC:** ac.4
- **Test data:** org-acme-01

1. Obtain quote version V2
2. POST /checkout/submit with version V1
3. Verify status 409
4. Verify error code QUOTE_STALE

## 6. Unauthenticated preflight denied

- **Type:** integration | **Category:** auth_401
- **FR:** FR-003
- **Test data:** scenario-6

1. POST /checkout/preflight without JWT
2. Verify status 401

## 7. Cross-tenant hold release denied

- **Type:** integration | **Category:** auth_403
- **FR:** FR-007 | **AC:** Tenant
- **Test data:** org-globex-02

1. Authenticate as alice@acme.com (Org A)
2. POST /checkout/release with hold_id from Org B
3. Verify status 403

## 8. Pipeline flag OFF restores legacy behavior

- **Type:** integration | **Category:** flag_off
- **FR:** FR-009 | **AC:** Gate-off
- **Test data:** org-flag-off-03

1. Disable checkout_commercial_pipeline_v1
2. POST /checkout/preflight
3. Verify shipping_fee is 0
4. Verify tax is 0

## 9. Hold expires during submission

- **Type:** integration | **Category:** edge
- **FR:** FR-006 | **AC:** ac.3
- **Test data:** org-acme-01

1. Create hold with 1s TTL
2. Wait 2s
3. POST /checkout/submit
4. Verify status 409
5. Verify hold is released

## 10. Latency tracking

- **Type:** integration | **Category:** perf
- **FR:** FR-003 | **AC:** SC-003
- **Test data:** org-acme-01

1. POST /checkout/preflight
2. Verify checkout_quote_latency metric is recorded

## 11. Full checkout commercial journey

- **Type:** e2e | **Category:** e2e_chain
- **FR:** FR-003, FR-004, FR-008 | **AC:** ac.1, ac.2, ac.4
- **Test data:** org-acme-01

1. Perform preflight
2. Apply coupon
3. Submit order with final version
4. Verify order success
