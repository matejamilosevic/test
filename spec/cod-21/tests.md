# Tests — COD-21

> Source: CodeMerlin (approved 2026-06-01)  
> Version: `f9f22ba2-d7c3-47f7-b72a-7986efaf24b0`

## 1. Deterministic scoring for high-risk signals

- **Type:** integration | **Category:** happy
- **FR:** FR-001, FR-002 | **AC:** ac.1
- **Test data:** cart-high-risk-02

1. Given a RiskEvaluationInput for "cart-high-risk-02" with high-velocity signals
2. When I call evaluateCheckoutRisk
3. Then the response outcome should be "block"
4. And the score should exceed the block threshold

## 2. PII Scrubbing before persistence

- **Type:** unit | **Category:** edge
- **FR:** FR-006 | **AC:** ac.4
- **Test data:** alice@acme.com

1. Given a RiskEvaluationInput containing a credit card PAN
2. When I call evaluateCheckoutRisk
3. Then the record in "risk_evaluation_events" should have "scrubbed_input" without the PAN

## 3. Submit blocked without prior evaluation

- **Type:** integration | **Category:** error
- **FR:** FR-003 | **AC:** ac.1
- **Test data:** cart-happy-01

1. Given a cart "cart-happy-01" with no prior risk evaluation
2. When I POST to "/checkout/submit"
3. Then the response status should be 400 RISK_EVAL_REQUIRED

## 4. Blocked outcome prevents ledger commit

- **Type:** integration | **Category:** happy
- **FR:** FR-003, SC-004 | **AC:** ac.3
- **Test data:** cart-high-risk-02

1. Given a risk evaluation for "cart-high-risk-02" with outcome "block"
2. When I POST to "/checkout/submit"
3. Then the response status should be 403 RISK_DECLINED
4. And no ledger commit should be recorded

## 5. Review outcome creates case and returns 202

- **Type:** integration | **Category:** alt
- **FR:** FR-007 | **AC:** ac.3
- **Test data:** cart-review-03

1. Given a risk evaluation for "cart-review-03" with outcome "review"
2. When I POST to "/checkout/submit"
3. Then the response status should be 202 Accepted
4. And a new case should exist in "risk_review_cases" with status "open"

## 6. Shadow mode allows blocked orders

- **Type:** integration | **Category:** flag_off
- **FR:** FR-005 | **AC:** ac.6
- **Test data:** cart-high-risk-02

1. Given the feature flag "checkout.risk_shadow_mode" is ON
2. And a risk evaluation for "cart-high-risk-02" with outcome "block"
3. When I POST to "/checkout/submit"
4. Then the response status should be 200 OK

## 7. Support override allows checkout

- **Type:** integration | **Category:** happy
- **FR:** FR-007 | **AC:** ac.5
- **Test data:** support-agent@acme.com

1. Given an "open" case in "risk_review_cases" for "cart-review-03"
2. When "support-agent@acme.com" applies a "risk_override"
3. Then the case status should be "approved"
4. And a subsequent POST to "/checkout/submit" should return 200 OK

## 8. Multi-tenant isolation for review cases

- **Type:** integration | **Category:** auth_403
- **FR:** FR-007 | **AC:** ac.5
- **Test data:** charlie@globex.com

1. Given an "open" case exists for "org-acme-01"
2. When "charlie@globex.com" attempts to GET the case details
3. Then the response status should be 403 Forbidden

## 9. Unauthenticated risk evaluation

- **Type:** integration | **Category:** auth_401
- **FR:** FR-004 | **AC:** ac.1
- **Test data:** alice@acme.com

1. Given no authentication token
2. When I POST to "/checkout/risk-eval"
3. Then the response status should be 401 Unauthorized

## 10. Quote version mismatch forces re-evaluation

- **Type:** integration | **Category:** edge
- **FR:** FR-003 | **AC:** ac.2
- **Test data:** cart-happy-01

1. Given a risk evaluation for "cart-happy-01" with "quote-v1"
2. And the cart quote is updated to "quote-v2"
3. When I POST to "/checkout/submit"
4. Then the response status should be 400 RISK_EVAL_REQUIRED

## 11. Feature gate kill-switch

- **Type:** regression | **Category:** flag_off
- **FR:** SC-005 | **AC:** ac.6
- **Test data:** org-flag-off-03

1. Given the feature flag "checkout.risk_gate_enabled" is OFF
2. When I POST to "/checkout/submit" for a cart with no evaluation
3. Then the response status should be 200 OK

## 12. Latency target

- **Type:** integration | **Category:** perf
- **FR:** SC-002 | **AC:** ac.6
- **Test data:** cart-happy-01

1. When I call evaluateCheckoutRisk 100 times
2. Then the p95 latency should be less than 200ms

## 13. Full risk-gated checkout journey

- **Type:** e2e | **Category:** e2e_chain
- **FR:** FR-003, FR-004, FR-007 | **AC:** ac.1, ac.3, ac.5
- **Test data:** cart-review-03

1. Perform risk evaluation for a suspicious cart resulting in "review" outcome
2. Submit checkout and verify 202 Accepted status
3. Approve the review case via support override API
4. Submit checkout again and verify 200 OK
