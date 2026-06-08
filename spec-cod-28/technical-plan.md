# Technical Plan — COD-28

**Approval:** approved (2026-06-04T14:38:46.236Z)  
**Version ID:** `2cca3c92-e853-4274-9f8a-17dda0043b18`

## Technical approach

Resolve TypeScript errors in `src/api/checkout_routes.ts` and `src/api/reporting_routes.ts` caused by unsafe property access on union types.

**Chosen: Discriminated union narrowing** — Check discriminator properties (`ok === false`, etc.) so TypeScript narrows types before accessing branch-specific fields. Rejected type assertions (`as`) and `@ts-ignore` as they bypass safety.

## Affected components

- `src/api/checkout_routes.ts` — Risk gate, commit hold, reserve hold results; cart line mapping for `CartLine[]`.
- `src/api/reporting_routes.ts` — `resolveAsOfIso` mapping from `ParseAsOfResult` to route-local union.

## API changes

None. HTTP status codes and JSON bodies remain identical.

## Requirement mapping

- FR-001, FR-002, FR-003 — addressed
- SC-001, SC-002, SC-003 — addressed
