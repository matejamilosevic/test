# Implementation — COD-27

Implementation checklist derived from approved tasks and technical plan.

## Files to create

| File | Purpose |
|------|---------|
| `src/lib/profile_config.ts` | Feature flag helper for `enable_profile_retry_ux` |

## Files to modify

| File | Changes |
|------|---------|
| `src/types/account.ts` | Add optional `refetch` to `AsyncDataState` |
| `src/hooks/useAccount.ts` | Add trigger-based `refetch` to both hooks |
| `src/components/ProfileBanner.tsx` | "Try again" button in error states (gated by feature flag) |
| `src/hooks/useAccount.test.ts` | Tests for refetch state transitions and fetch re-trigger |
| `src/components/__tests__/ProfileBanner.test.tsx` | Tests for retry button and refetch invocation |
| `package.json` | Include account hook and ProfileBanner tests in `pnpm test` |

## Implementation order

1. Extend `AsyncDataState` with `refetch?: () => void`.
2. Add `src/lib/profile_config.ts` with `isProfileRetryUxEnabled()` (env `ENABLE_PROFILE_RETRY_UX`).
3. Update `useAccountProfile` and `useLoyaltyPoints`:
   - Add `refetchTrigger` counter state.
   - Include trigger in `useEffect` deps.
   - Return `refetch` that sets `loading: true`, `error: null`, and increments trigger.
4. Update `ProfileBanner.tsx` view components to show "Try again" when error + flag enabled.
5. Add tests; run `pnpm typecheck` and `pnpm test`.

## Acceptance mapping

| Requirement | Verification |
|-------------|--------------|
| FR-001–003 refetch API | Hook return type + hook tests |
| FR-004 state reset on refetch | Hook test for loading/error transition |
| FR-005–006 Try again UI | ProfileBanner tests |
| FR-007 race safety | Existing cleanup + ID change test |
| SC-001–004 | CI scripts pass |
