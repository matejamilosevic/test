# Specification — COD-27

**Approval:** approved (2026-06-03T14:31:02.470Z)  
**Version ID:** `3c45a219-af8b-46bb-a563-e5ebed27f606`

## Outcome

Users will be able to recover from transient network or API errors in the `UserProfileBanner` and `LoyaltyStrip` components by clicking a "Try again" button. This is enabled by extending the underlying account hooks to support manual data refetching, ensuring a smoother user experience without requiring a full page reload.

## User Stories

### User Story 1 — Manual Retry (Priority: P1)

As a user, I want to see a "Try again" button when my profile or loyalty data fails to load, so that I can attempt to fetch the information again without refreshing the entire application.

- [ ] When a fetch error occurs, the `UserProfileBanner` and `LoyaltyStrip` display a "Try again" button alongside the error message.
- [ ] Clicking the "Try again" button triggers a new network request for the failed resource.
- [ ] The component transitions back to a loading state immediately after clicking the button.

### User Story 2 — Hook Refetch API (Priority: P1)

As a developer, I want the `useAccountProfile` and `useLoyaltyPoints` hooks to provide a `refetch` function, so that I can programmatically trigger data updates in response to user actions.

- [ ] `useAccountProfile` returns a `refetch` function in its result object.
- [ ] `useLoyaltyPoints` returns a `refetch` function in its result object.
- [ ] Calling `refetch` clears the current `error` state and sets `loading` to true before starting the request.

## Functional Requirements

1. **FR-001**: Extend the `AsyncDataState` type to include an optional `refetch` function that returns `void`. [User Story 2]
2. **FR-002**: Implement a `refetch` mechanism in `useAccountProfile` that re-executes the fetch logic using the current `accountId`. [User Story 2]
3. **FR-003**: Implement a `refetch` mechanism in `useLoyaltyPoints` that re-executes the fetch logic using the current `userId`. [User Story 2]
4. **FR-004**: Ensure that calling `refetch` resets the `error` state to `null` and sets the `loading` state to `true` before the request is dispatched. [User Story 1, 2]
5. **FR-005**: Update `UserProfileBanner` to render a "Try again" button when the hook returns an error state. [User Story 1]
6. **FR-006**: Update `LoyaltyStrip` to render a "Try again" button when the hook returns an error state. [User Story 1]
7. **FR-007**: Maintain existing race-condition protection; if a `refetch` is in progress and the `accountId`/`userId` prop changes, the stale `refetch` response must be ignored. [User Story 2]

## Success Criteria

1. **SC-001**: `pnpm typecheck` completes with zero errors, confirming `refetch` is correctly integrated into types and components.
2. **SC-002**: Automated tests confirm that clicking the "Try again" button calls the `refetch` function exactly once.
3. **SC-003**: Automated tests verify that the `loading` state is active and `error` is null during a retry attempt.
4. **SC-004**: `pnpm test` passes all existing and new test cases for `useAccount.ts` and `ProfileBanner.tsx`.

## Edge Cases

- **Rapid Clicks**: If a user clicks "Try again" multiple times rapidly, the implementation should ensure only the latest request's result is applied (handled by existing cleanup patterns).
- **Prop Change during Retry**: If the `userId` or `accountId` changes while a retry request is in flight, the result of that retry must not overwrite the data for the new ID.
- **Offline State**: If the user is offline, clicking "Try again" should immediately fail and return to the error state with the button still visible.
- **Feature Flag**: If this logic is gated, the components must default to the previous static "Unable to load profile" message without the button.
- **Multi-tenant Isolation**: The `refetch` function must use the current props (ID) to ensure it never fetches data for a different organization or user context than what is currently rendered.

## Out of Scope

- Automatic background retries or exponential backoff logic.
- Polling for data updates.
- Global error handling or toast notifications (errors remain local to the banner/strip).
- Modification of the API response structure or backend logic.

## Jira Requirement Coverage

| Jira AC | Covered by |
|---|---|
| `useAccountProfile` and `useLoyaltyPoints` return a `refetch` function | FR-002, FR-003 |
| Clicking "Try again" after an error reloads data and shows loading state | FR-004, FR-005, FR-006 |
| `pnpm typecheck` passes with zero errors | SC-001 |
| `pnpm test` passes; test asserts `refetch` is called | SC-002, SC-004 |
| Rapid changes to `accountId` / `userId` still prevent race conditions | FR-007 |
