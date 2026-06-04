# Tests — COD-28

**Approval:** approved (2026-06-04T14:41:00.810Z)  
**Version ID:** `dc0db744-4dc4-4d04-b584-901ba8e76207`

## Scenarios

1. **Clean type check** — `pnpm typecheck` exit 0; no errors in checkout or reporting routes. (SC-001, FR-001, FR-002)
2. **Full test suite** — `pnpm test` — 64 tests, 0 failures. (SC-002, FR-003)
3. **Checkout API contract** — `tsx --test src/api/checkout_routes.test.ts` passes unchanged. (SC-003)
4. **Reporting API contract** — `tsx --test src/api/reporting_routes.test.ts` passes unchanged. (SC-003)
5. **CI validation chain** — typecheck + test in pipeline. (SC-001, SC-002)
