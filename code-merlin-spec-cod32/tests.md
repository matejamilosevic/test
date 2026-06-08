# Test Plan — COD-32

**Approval:** approved (2026-06-08T11:14:06.542Z)  
**Version ID:** `cd91565b-088c-4053-a61d-b98bb98ebc3d`  
**Source:** [CodeMerlin tests](https://staging.codemerlin.ai/work-items/72081f3b-7585-4ebe-a16a-5f1bda7cf8ae?tab=tests)

1. Preflight with shipping fee applied ($10 subtotal → $5 shipping)
2. Apply valid coupon increments quote_version
3. Apply expired coupon returns COUPON_EXPIRED (422)
4. Idempotent hold release (204)
5. Reject stale quote version (409 QUOTE_STALE)
6. Unauthenticated preflight denied (401)
7. Cross-org hold release denied (403)
8. Legacy behavior when gate is off
9. Full checkout journey rehearsal
10. Latency check for quote calculation
