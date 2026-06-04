# COD-28 — Fix TypeScript discriminated-union errors in checkout and reporting API routes

Pulled from CodeMerlin (organization: **test**) on 2026-06-04.

## Work item

| Field | Value |
|-------|-------|
| External ID | COD-28 |
| Title | Fix TypeScript discriminated-union errors in checkout and reporting API routes |
| Work item ID | `2e9e041a-04cc-47db-a36c-86e8999cb4a6` |
| Lifecycle stage | backlog |
| Repository scope | matejamilosevic/test |

## CodeMerlin links

- [Work item (overview)](https://staging.codemerlin.ai/work-items/2e9e041a-04cc-47db-a36c-86e8999cb4a6)
- [Specification](https://staging.codemerlin.ai/work-items/2e9e041a-04cc-47db-a36c-86e8999cb4a6?tab=specification)
- [Technical plan](https://staging.codemerlin.ai/work-items/2e9e041a-04cc-47db-a36c-86e8999cb4a6?tab=technical_plan)
- [Tasks](https://staging.codemerlin.ai/work-items/2e9e041a-04cc-47db-a36c-86e8999cb4a6?tab=tasks)
- [Tests](https://staging.codemerlin.ai/work-items/2e9e041a-04cc-47db-a36c-86e8999cb4a6?tab=tests)

## Artifacts in this folder

| File | Source | Approval |
|------|--------|----------|
| [specification.md](./specification.md) | SDD specification | approved |
| [technical-plan.md](./technical-plan.md) | SDD technical plan | approved |
| [tasks.md](./tasks.md) | SDD tasks | approved |
| [tests.md](./tests.md) | SDD test scenarios | approved |
| [implementation.md](./implementation.md) | Implementation checklist derived from tasks | — |
| [citations.md](./citations.md) | Version IDs and evaluation metadata | — |

## Summary

Restore `pnpm typecheck` by narrowing discriminated unions in `checkout_routes.ts` and `reporting_routes.ts` before accessing `.status`, `.body`, `.code`, `.skuId`, or `.asOfIso`. No HTTP contract or runtime behavior changes.
