# Tasks — COD-28

**Approval:** approved (2026-06-04T14:38:51.535Z)  
**Version ID:** `a63e3894-861f-44ee-9430-68005c31dd54`

## Verify baseline

- [x] `pnpm typecheck` fails with union property errors in checkout and reporting routes.
- [x] `pnpm test` passes with 64 tests.

## [US1] Fix checkout_routes.ts

- [x] Narrow risk gate, commit hold, and reserve hold with `ok === false` checks.
- [x] Map preflight `lines` to explicit `CartLine` shape for `reserveCartHold`.
- [x] File compiles under `tsc --noEmit`.

## [US1] Fix reporting_routes.ts

- [x] Map `ParseAsOfResult` to `{ ok: true; asOfIso } | { ok: false; code }` in `resolveAsOfIso`.
- [x] Narrow `asOf` with `ok === false` before accessing `.code` or `.asOfIso`.
- [x] File compiles under `tsc --noEmit`.

## [US2] Final regression

- [x] `pnpm typecheck` exits 0.
- [x] `pnpm test` — 64 pass.
- [x] Route tests unchanged and passing.
