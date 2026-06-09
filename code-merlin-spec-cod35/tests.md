# Test Scenarios — COD-35

**Approval:** approved (2026-06-09T13:53:22.803Z)  
**Version ID:** `b6bca5ed-ee40-42b9-958a-52852a4a06a8`  
**Citation:** [staging.codemerlin.ai](https://staging.codemerlin.ai/work-items/343dd24c-56e6-46ed-933d-40ab44ed32ae?tab=tests)

## 1. Successful profile retry after transient failure

Integration — mock 500, mount `UserProfileBanner`, verify "Try again", mock 200, click, verify loading then data.

## 2. Successful loyalty retry after transient failure

Integration — mock 503 on `/api/account/lookup`, mount `LoyaltyStrip`, verify "Try again", mock 200, click, verify loading then points.

## 3. Retry button hidden when flag is disabled

Integration — `enable_profile_retry_ux` off, mock 500, verify error without "Try again" in DOM.

## 4. Unauthenticated retry attempt

Integration — mock 401, click "Try again", verify error state persists.

## 5. Multiple rapid clicks only trigger one effective update

Unit — rapid `refetch` calls; each triggers a network call; only last response updates state.

## 6. Account ID change cancels previous retry response

Unit — change `accountId` during in-flight retry; stale response ignored.

## 7. UI Responsiveness on retry

Integration — loading transition within 100ms of click.

## 8. Full recovery journey

E2E — both profile and loyalty fail, retry each independently, page fully loaded.
