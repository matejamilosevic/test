# Tasks — COD-26

**Approval:** approved (2026-06-03T13:44:39.840Z)  
**Version ID:** `71d13fe5-7e76-4e6c-ba93-b889a1a3c572`

## Define TypeScript interfaces and API types for ProfileBanner

- [ ] Create `src/types/account.ts` with interfaces for `/api/account` and `/api/account/lookup` responses
- [ ] Define `UserProfileBannerProps` and `LoyaltyStripProps` in `src/components/ProfileBanner.tsx` without using `any`

---

## Implement useAccount hook for data fetching

- [ ] Create `src/hooks/useAccount.ts` extracting logic from `ProfileBanner.tsx` component body
- [ ] Hook handles loading state, error state (non-200/network), and empty responses
- [ ] No direct `fetch` calls remain in `src/components/ProfileBanner.tsx`

---

## [US1] Refactor ProfileBanner exports to camelCase

- [ ] Rename `user_profile_banner` to `UserProfileBanner` in `src/components/ProfileBanner.tsx`
- [ ] Rename `loyalty_strip` to `LoyaltyStrip` in `src/components/ProfileBanner.tsx`
- [ ] Update `src/index.ts` to export the new camelCase names

---

## [US4] Add unit tests for ProfileBanner rendering and error states

- [ ] Create `src/components/__tests__/ProfileBanner.test.tsx` (or update existing)
- [ ] Assert component renders data correctly from mock hook/API
- [ ] Assert component displays error state when API fails
- [ ] `pnpm test` passes with 100% success for these components

---

## Final validation and typecheck

- [ ] `pnpm typecheck` returns no errors
- [ ] Verify no regressions in visual layout (manual check)
