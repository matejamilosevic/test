# Tasks — COD-27

**Approval:** approved (2026-06-03T14:31:39.350Z)  
**Version ID:** `b99a3f21-09a9-4727-9c15-c8df2f152a05`

## Extend AsyncDataState type with refetch function

- [ ] `AsyncDataState` interface in `src/types/account.ts` includes optional `refetch: () => void`
- [ ] `pnpm typecheck` passes

---

## [US2] Implement refetch logic in useAccountProfile and useLoyaltyPoints

- [ ] `useAccountProfile` returns a `refetch` function that re-triggers the fetch
- [ ] `useLoyaltyPoints` returns a `refetch` function that re-triggers the fetch
- [ ] Calling `refetch` sets `loading: true` and `error: null` before the request starts
- [ ] Existing `useEffect` cleanup logic prevents race conditions for stale refetch calls

---

## [US1] Add "Try again" button to UserProfileBanner and LoyaltyStrip

- [ ] `UserProfileBanner` renders a button with text "Try again" when error is present
- [ ] `LoyaltyStrip` renders a button with text "Try again" when error is present
- [ ] Clicking the button calls the `refetch` function from the hook
- [ ] Feature flag `enable_profile_retry_ux` gates the retry button

---

## Verify retry flow and race safety in hook and component tests

- [ ] `src/hooks/useAccount.test.ts` asserts that `refetch` resets state and triggers new fetch
- [ ] `src/components/__tests__/ProfileBanner.test.tsx` asserts that clicking "Try again" calls `refetch`
- [ ] `pnpm test` passes for all modified files

---

## Final typecheck

- [ ] `pnpm typecheck` returns 0 errors
