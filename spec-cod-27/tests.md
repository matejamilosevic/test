# Test Scenarios — COD-27

**Approval:** approved (2026-06-03T14:32:30.935Z)  
**Version ID:** `3e70bf0b-92a8-4f93-8899-e072a03ca7c6`

## 1. Successful retry after transient error

| Field | Value |
|-------|-------|
| Order | 1 |
| Validation type | integration |
| Scenario category | happy |
| FR anchors | FR-005 |
| Test data ref | org-acme-01 |

**Steps:**

1. Mock `useAccountProfile` to return a 500 error.
2. Render `UserProfileBanner`.
3. Verify "Unable to load profile" text is present.
4. Verify "Try again" button is visible.
5. Click "Try again" button.
6. Verify component shows loading state.
7. Mock API to return 200 OK.
8. Verify profile data is displayed.

---

## 2. Retry button visibility in LoyaltyStrip

| Field | Value |
|-------|-------|
| Order | 2 |
| Validation type | integration |
| Scenario category | happy |
| FR anchors | FR-006 |
| Test data ref | user-alice-01 |

**Steps:**

1. Mock `useLoyaltyPoints` to return a 404 error.
2. Render `LoyaltyStrip`.
3. Verify "Try again" button is visible.
4. Click "Try again" button.
5. Verify the `refetch` function is called.

---

## 3. Hook state transitions during refetch

| Field | Value |
|-------|-------|
| Order | 3 |
| Validation type | unit |
| Scenario category | happy |
| FR anchors | FR-002, FR-004 |
| Test data ref | user-alice-01 |

**Steps:**

1. Initialize `useAccountProfile` hook in an error state.
2. Invoke the returned `refetch` function.
3. Verify state immediately becomes `loading: true` and `error: null`.
4. Verify a new fetch call is initiated.

---

## 4. Race condition protection on ID change

| Field | Value |
|-------|-------|
| Order | 6 |
| Validation type | integration |
| Scenario category | edge |
| FR anchors | FR-007 |
| Test data ref | user-alice-01 |

**Steps:**

1. Trigger refetch for account A.
2. While request is pending, change `accountId` prop to account B.
3. Resolve request for account A.
4. Verify account A data is NOT rendered.
5. Verify component shows state for account B.

---

## 5. Feature flag disabled baseline

| Field | Value |
|-------|-------|
| Order | 8 |
| Validation type | integration |
| Scenario category | flag_off |
| Test data ref | org-flag-off-03 |

**Steps:**

1. Set `enable_profile_retry_ux` flag to OFF.
2. Trigger an error state in `UserProfileBanner`.
3. Verify "Unable to load profile" is shown.
4. Verify "Try again" button is NOT rendered.

---

## 6. Full retry journey

| Field | Value |
|-------|-------|
| Order | 10 |
| Validation type | e2e |
| Scenario category | e2e_chain |
| FR anchors | FR-001, FR-002, FR-005 |
| Test data ref | user-alice-01 |

**Steps:**

1. Navigate to profile page.
2. Observe initial fetch failure.
3. Click "Try again" button.
4. Observe successful data load.
5. Verify both Banner and LoyaltyStrip are populated.
