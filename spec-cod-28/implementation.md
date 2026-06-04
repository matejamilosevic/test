# Implementation — COD-28

Implementation checklist derived from approved tasks and technical plan.

## Files to modify

| File | Changes |
|------|---------|
| `src/api/checkout_routes.ts` | Use `ok === false` narrowing for risk gate, commit, reserve; map lines to `CartLine` |
| `src/api/reporting_routes.ts` | Map `ParseAsOfResult` in `resolveAsOfIso`; use `ok === false` before `.code` / `.asOfIso` |

## Implementation order

1. **checkout_routes.ts**
   - Replace `!riskGate.ok` with `riskGate.ok === false` before `.status` / `.body`.
   - Replace `!commit.ok` with `commit.ok === false` before `.code` / `.skuId`.
   - Map `body.lines` to `{ sku, qty }[]` for `reserveCartHold`; use `reserved.ok === false` before error fields.
2. **reporting_routes.ts**
   - In `resolveAsOfIso`, return explicit `{ ok: false, code }` or `{ ok: true, asOfIso }` from `parseMerchandisingAsOf`.
   - Replace `!asOf.ok` with `asOf.ok === false` in both handlers.
3. Run `pnpm typecheck` and `pnpm test`.

## Acceptance mapping

| Requirement | Verification |
|-------------|--------------|
| FR-001 checkout narrowing | `pnpm typecheck` on checkout_routes |
| FR-002 reporting narrowing | `pnpm typecheck` on reporting_routes |
| FR-003 no contract change | Existing route tests pass unchanged |
| SC-001–003 | CI scripts pass |
