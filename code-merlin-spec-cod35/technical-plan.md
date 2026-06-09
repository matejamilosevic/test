# Technical Plan — COD-35

**Approval:** approved (2026-06-09T13:53:19.295Z)  
**Version ID:** `29bafe79-7257-47e9-9d94-50d9129015af`  
**Citation:** [staging.codemerlin.ai](https://staging.codemerlin.ai/work-items/343dd24c-56e6-46ed-933d-40ab44ed32ae?tab=technical_plan)

## Technical approach

State-based trigger (`refetchTrigger` counter in `useEffect` deps) for `refetch` in `useAccountProfile` and `useLoyaltyPoints`. Inline "Try again" buttons in `UserProfileBanner` and `LoyaltyStrip` error states, gated by `enable_profile_retry_ux`.

## Affected components

- `src/types/account.ts` — `AsyncDataState` includes `refetch?: () => void`
- `src/hooks/useAccount.ts` — refetch logic for profile and loyalty hooks
- `src/hooks/useRefetchTrigger.ts` — shared trigger primitive
- `src/components/ProfileBanner.tsx` — "Try again" buttons in error states
- `src/lib/profile_config.ts` — `enable_profile_retry_ux` feature flag helper

## Feature-flag keys

- `enable_profile_retry_ux` → default `false`; when off, no retry button is rendered

## Requirement mapping

All FR-001 through FR-006 and SC-001 through SC-003 are addressed by the existing COD-27 implementation, verified and extended with COD-35 test coverage.
