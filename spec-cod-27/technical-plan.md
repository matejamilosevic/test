# Technical Plan — COD-27

**Approval:** approved (2026-06-03T14:31:28.067Z)  
**Version ID:** `4006e215-7556-4318-8cf3-6f7614efeb82`

## Technical approach

## Research decisions

We will implement the `refetch` functionality by introducing a `trigger` state (a simple counter or timestamp) within the `useAccountProfile` and `useLoyaltyPoints` hooks. This trigger will be added to the `useEffect` dependency array, allowing the existing fetch logic to re-run without duplicating code.

**Trade-off 1: Manual trigger vs. exposing internal fetch function.** We chose a state-based trigger over exposing the internal `fetchData` function directly. This ensures that the `useEffect` cleanup logic (which handles race conditions and stale responses) automatically applies to retries, maintaining the race safety requirement (FR-007) with minimal complexity.

**Trade-off 2: Inline error UI vs. Shared Error Component.** We will implement the "Try again" button directly within `UserProfileBanner` and `LoyaltyStrip`. While a shared component is cleaner, the ticket specifically targets these two components and their existing "Unable to load profile" state. We will keep the logic local to avoid over-engineering, but use a consistent button style.

## Component / module ownership

- **matejamilosevic/test** — Owns all changes.
- `src/hooks/useAccount.ts`: Implementation of `refetch` logic.
- `src/types/account.ts`: Type definitions for `AsyncDataState`.
- `src/components/ProfileBanner.tsx`: UI updates for error states.
- `src/services/*`: Must NOT be modified (backend/API logic is out of scope).

## Service interaction patterns

The hooks interact with the backend via standard HTTP fetch calls. Failure modes (4xx/5xx) are caught in the hook, setting the `error` state. The `refetch` call resets the state to `loading: true, error: null` before the effect re-triggers the service call.

## Feature-flag keys

- `enable_profile_retry_ux` → behavior-when-off: Components show the static "Unable to load profile" message without the "Try again" button. Hooks still return `refetch`, but it is not invoked by the UI.

## Multi-tenancy contract

Multi-tenancy is enforced by the `accountId` and `userId` props passed to the hooks. The `refetch` function uses the current value of these props from the hook's closure. No new query paths are introduced.

## Affected components

- **src/types/account.ts** — Update `AsyncDataState` to include `refetch?: () => void`.
- **src/hooks/useAccount.ts** — Implement `refetch` using a state trigger in `useAccountProfile` and `useLoyaltyPoints`.
- **src/lib/profile_config.ts** — Feature flag helper for `enable_profile_retry_ux`.
- **src/components/ProfileBanner.tsx** — Update `UserProfileBanner` and `LoyaltyStrip` to render a "Try again" button in error states.
- **src/hooks/useAccount.test.ts** — Add tests for `refetch` behavior and state transitions.
- **src/components/__tests__/ProfileBanner.test.tsx** — Add tests for button presence and click interaction.

## Data model changes

Not applicable — frontend-only change.

## API changes

Not applicable — no changes to HTTP routes, request bodies, or response schemas.

## Migration / rollout

1. **Gate Check**: Ensure `enable_profile_retry_ux` is OFF in production.
2. **Deploy**: Deploy the frontend changes containing the updated hooks and components.
3. **Verification**: Verify in staging that the "Try again" button appears and functions correctly when API calls are mocked to fail.
4. **Activation**: Toggle `enable_profile_retry_ux` to ON.
5. **Rollback**: If UI regressions occur, toggle the gate OFF.

## Risks

1. **Race Conditions**: If a user changes the `accountId` while a `refetch` for the old ID is in flight. *Mitigation*: Existing `useEffect` cleanup pattern preserved.
2. **Infinite Loading Loop**: If `refetch` triggers an immediate re-render loop. *Mitigation*: `refetch` updates a simple counter state; effect depends on that counter.
3. **UI Layout Shift**: Adding a button might shift layout in the banner. *Mitigation*: Minimal inline button in existing error area.

## Requirement mapping

- **FR-001** through **FR-007** — addressed
- **SC-001** through **SC-004** — addressed
