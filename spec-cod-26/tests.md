# Test Scenarios — COD-26

**Approval:** approved (2026-06-03T13:45:37.530Z)  
**Version ID:** `4f02553b-b181-4d3b-b0ac-03e973a5b172`

## 1. Verify camelCase exports and re-exports

| Field | Value |
|-------|-------|
| Order | 1 |
| Validation type | integration |
| Scenario category | happy |
| FR anchors | FR-001, FR-002, FR-003 |
| Test data ref | N/A |

**Steps:**

1. Inspect `src/components/ProfileBanner.tsx` for `UserProfileBanner` and `LoyaltyStrip` exports.
2. Confirm `user_profile_banner` and `loyalty_strip` are no longer exported.
3. Verify `src/index.ts` re-exports the new names.

---

## 2. Static type checking

| Field | Value |
|-------|-------|
| Order | 2 |
| Validation type | unit |
| Scenario category | happy |
| FR anchors | FR-004, SC-001 |
| Test data ref | N/A |

**Steps:**

1. Run `pnpm typecheck` in the terminal.
2. Verify the process exits with code 0.
3. Search for `any` in `src/components/ProfileBanner.tsx`.

---

## 3. Verify hook-based data fetching

| Field | Value |
|-------|-------|
| Order | 3 |
| Validation type | integration |
| Scenario category | happy |
| FR anchors | FR-005 |
| Test data ref | N/A |

**Steps:**

1. Search `src/components/ProfileBanner.tsx` for `fetch` calls.
2. Verify `useAccount` hook is imported and called.

---

## 4. Successful data rendering

| Field | Value |
|-------|-------|
| Order | 4 |
| Validation type | unit |
| Scenario category | happy |
| FR anchors | FR-008, SC-002 |
| Test data ref | user-01 |

**Steps:**

1. Mock `useAccount` to return valid user data.
2. Render `UserProfileBanner`.
3. Assert user name is present in the DOM.

---

## 5. API Failure Handling

| Field | Value |
|-------|-------|
| Order | 5 |
| Validation type | unit |
| Scenario category | error |
| FR anchors | FR-006 |
| Test data ref | api-error-500 |

**Steps:**

1. Mock `useAccount` to return an error state (500).
2. Render `UserProfileBanner`.
3. Assert error message "Unable to load profile" is visible.

---

## 6. Empty API Response

| Field | Value |
|-------|-------|
| Order | 6 |
| Validation type | unit |
| Scenario category | edge |
| FR anchors | FR-006 |
| Test data ref | user-empty |

**Steps:**

1. Mock `useAccount` to return an empty object.
2. Render `UserProfileBanner`.
3. Verify no runtime errors occur.

---

## 7. Loading State Visibility

| Field | Value |
|-------|-------|
| Order | 7 |
| Validation type | unit |
| Scenario category | edge |
| FR anchors | FR-007 |
| Test data ref | api-slow |

**Steps:**

1. Mock `useAccount` to return a loading state.
2. Render `UserProfileBanner`.
3. Assert loading indicator is visible.

---

## 8. Handle 401 Unauthorized from account API

| Field | Value |
|-------|-------|
| Order | 8 |
| Validation type | integration |
| Scenario category | auth_401 |
| FR anchors | FR-006 |
| Test data ref | N/A |

**Steps:**

1. Mock API to return 401.
2. Render component.
3. Verify error or login UI is shown.

---

## 9. Baseline behavior when feature is disabled

| Field | Value |
|-------|-------|
| Order | 9 |
| Validation type | regression |
| Scenario category | flag_off |
| Test data ref | N/A |

**Steps:**

1. Disable the refactor feature gate (if applicable).
2. Verify application stability.

---

## 10. Full Profile Loading Journey

| Field | Value |
|-------|-------|
| Order | 10 |
| Validation type | e2e |
| Scenario category | e2e_chain |
| FR anchors | US-1, US-3 |
| Test data ref | user-01 |

**Steps:**

1. Navigate to dashboard.
2. Observe loading state.
3. Verify final data display in both Banner and Strip.
