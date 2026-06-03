# COD-26 — Refactor ProfileBanner components — camelCase, types, and separated fetch logic

Pulled from CodeMerlin (organization: **test**) on 2026-06-03.

## Work item

| Field | Value |
|-------|-------|
| External ID | COD-26 |
| Title | Refactor ProfileBanner components — camelCase, types, and separated fetch logic |
| Work item ID | `ceb25dde-1b05-46c1-b3fe-5d4fd479513c` |
| Lifecycle stage | backlog |
| Repository scope | matejamilosevic/test |

## CodeMerlin links

- [Work item (overview)](https://staging.codemerlin.ai/work-items/ceb25dde-1b05-46c1-b3fe-5d4fd479513c)
- [Specification](https://staging.codemerlin.ai/work-items/ceb25dde-1b05-46c1-b3fe-5d4fd479513c?tab=specification)
- [Technical plan](https://staging.codemerlin.ai/work-items/ceb25dde-1b05-46c1-b3fe-5d4fd479513c?tab=technical_plan)
- [Tasks](https://staging.codemerlin.ai/work-items/ceb25dde-1b05-46c1-b3fe-5d4fd479513c?tab=tasks)
- [Tests](https://staging.codemerlin.ai/work-items/ceb25dde-1b05-46c1-b3fe-5d4fd479513c?tab=tests)

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

Refactor `ProfileBanner` to follow TypeScript and React best practices: PascalCase exports, explicit prop interfaces, data fetching moved into `useAccount` hooks, and functional tests for rendering and error states. Backend API routes and visual layout are out of scope.
