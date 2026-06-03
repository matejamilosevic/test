# COD-27 — Retry and refetch in account hooks + error UX in ProfileBanner components

Pulled from CodeMerlin (organization: **test**) on 2026-06-03.

## Work item

| Field | Value |
|-------|-------|
| External ID | COD-27 |
| Title | Retry and refetch in account hooks + error UX in ProfileBanner components |
| Work item ID | `c3018468-4a0a-4afb-8079-db4dc03f8351` |
| Lifecycle stage | backlog |
| Repository scope | matejamilosevic/test |

## CodeMerlin links

- [Work item (overview)](https://staging.codemerlin.ai/work-items/c3018468-4a0a-4afb-8079-db4dc03f8351)
- [Specification](https://staging.codemerlin.ai/work-items/c3018468-4a0a-4afb-8079-db4dc03f8351?tab=specification)
- [Technical plan](https://staging.codemerlin.ai/work-items/c3018468-4a0a-4afb-8079-db4dc03f8351?tab=technical_plan)
- [Tasks](https://staging.codemerlin.ai/work-items/c3018468-4a0a-4afb-8079-db4dc03f8351?tab=tasks)
- [Tests](https://staging.codemerlin.ai/work-items/c3018468-4a0a-4afb-8079-db4dc03f8351?tab=tests)

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

Extend `useAccountProfile` and `useLoyaltyPoints` with a `refetch` function and add a "Try again" button to `UserProfileBanner` and `LoyaltyStrip` when data loading fails. Automatic retries, polling, and backend API changes are out of scope.
