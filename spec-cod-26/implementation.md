# Implementation — COD-26

Implementation checklist derived from approved tasks and technical plan.

## Files to create

| File | Purpose |
|------|---------|
| `src/types/account.ts` | TypeScript interfaces for account API responses |
| `src/hooks/useAccount.ts` | `useAccountProfile` and `useLoyaltyPoints` hooks with fetch logic |
| `src/components/__tests__/ProfileBanner.test.tsx` | Unit tests for rendering, error, and loading states |

## Files to modify

| File | Changes |
|------|---------|
| `src/components/ProfileBanner.tsx` | Rename exports, add prop interfaces, consume hooks, remove fetch |
| `src/index.ts` | Export `UserProfileBanner` and `LoyaltyStrip` |
| `package.json` | Include ProfileBanner tests in `pnpm test` script |

## Implementation order

1. Add `src/types/account.ts` with `AccountProfile` and `AccountLookupResponse` interfaces.
2. Add `src/hooks/useAccount.ts`:
   - `useAccountProfile(accountId)` — GET `/api/account?id=…`
   - `useLoyaltyPoints(userId, initialPoints?)` — POST `/api/account/lookup`
   - Return `{ data, loading, error }`; cancel stale requests in `useEffect` cleanup.
3. Refactor `ProfileBanner.tsx`:
   - `UserProfileBanner` shows loading, "Unable to load profile" on error, and profile data on success.
   - `LoyaltyStrip` uses `useLoyaltyPoints`; no direct fetch in component bodies.
4. Update `src/index.ts` exports.
5. Add tests using `node:test` and `react-dom/server` `renderToStaticMarkup` with mocked hooks.
6. Run `pnpm typecheck` and `pnpm test`.

## Acceptance mapping

| Requirement | Verification |
|-------------|--------------|
| FR-001–003 camelCase exports | `ProfileBanner.test.tsx` export check + `index.ts` |
| FR-004 prop types | `pnpm typecheck` |
| FR-005–007 hooks | No `fetch` in components; hook unit tests |
| FR-008 tests | Render + error assertions in test file |
| SC-001–002 | CI scripts pass |
