# Specification — COD-28

**Approval:** approved (2026-06-04T14:38:22.108Z)  
**Version ID:** `c037bf83-ca4d-4ff7-88cd-ffb0fb81ec7d`

## Outcome

Restore TypeScript type safety and successful build execution by resolving discriminated union narrowing errors in the checkout and reporting API routes. The system will correctly handle polymorphic response types from internal services without altering existing runtime behavior or API contract shapes.

## User Stories

### User Story 1 — Developer Type Safety (Priority: P1)

As a developer, I want the `pnpm typecheck` command to exit with a zero status so that I can ensure type safety across the codebase and prevent unsafe property access on union types.

- `pnpm typecheck` completes without errors in `src/api/checkout_routes.ts` and `src/api/reporting_routes.ts`.
- TypeScript compiler correctly identifies the specific branch of a union type before allowing access to properties like `.status`, `.body`, `.code`, `.skuId`, or `.asOfIso`.

### User Story 2 — Regression Prevention (Priority: P2)

As a developer, I want to ensure that fixing type errors does not change the application's runtime behavior so that existing API consumers do not experience breaking changes.

- All 64 existing tests in the test suite pass after type fixes.
- HTTP status codes and JSON response bodies remain identical to their current state as verified by `checkout_routes.test.ts` and `reporting_routes.test.ts`.

## Functional Requirements

1. **FR-001: Discriminated Union Narrowing in Checkout** — Use explicit type guards or property-based narrowing before accessing union members from risk gate, commit hold, or reserve hold operations.

2. **FR-002: Discriminated Union Narrowing in Reporting** — Use explicit narrowing before accessing parse-as-of union results in reporting routes.

3. **FR-003: Preservation of API Contracts** — Maintain the exact same mapping of service results to HTTP responses (status codes and JSON payloads).

## Success Criteria

1. **SC-001:** `pnpm typecheck` returns exit code 0.
2. **SC-002:** `pnpm test` reports 64 passing tests and 0 failures.
3. **SC-003:** `checkout_routes.test.ts` and `reporting_routes.test.ts` pass without test file modifications.

## Out of Scope

- New features or logic in risk engine or reporting services.
- Refactoring modules outside the two route files unless required for types.
- TypeScript version or `tsconfig` strictness changes.
- Modifying existing test assertions.
