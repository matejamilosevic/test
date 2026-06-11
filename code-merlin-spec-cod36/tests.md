# COD-36 Test Plan

> **Citation**: [CodeMerlin Tests](https://staging.codemerlin.ai/work-items/e1a84b21-b0a8-474c-a3e5-5b04a6cc6e92?tab=tests)  
> **Version**: 1cb3bd70-348f-482b-963f-9aaee739430c  
> **Approved**: 2026-06-11T13:22:58.376Z by Luka Bura

| # | Title | FR anchors | Category |
|---|---|---|---|
| 1 | Preflight pricing for cart below free shipping threshold | FR-001, FR-002 | happy |
| 2 | Apply valid coupon increments version | FR-003 | happy |
| 3 | Apply expired coupon returns 422 | FR-004 | error |
| 4 | Idempotent hold release | FR-007 | happy |
| 5 | Cross-org hold release denial | FR-008 | auth_403 |
| 6 | Reject stale quote version | FR-009 | edge |
| 7 | Unauthenticated preflight denial | FR-011 | auth_401 |
| 8 | Legacy behavior when feature gate is OFF | FR-012 | flag_off |
| 9 | Full E2E Checkout Journey | FR-001, FR-003, FR-009 | e2e_chain |

Implementation: `src/api/checkout_commercial.test.ts`, `src/services/checkout_quote_service.test.ts`, `src/services/checkout_hold_cleanup.test.ts`
