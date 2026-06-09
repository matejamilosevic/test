# Specification — COD-35

**Approval:** approved (2026-06-09T13:51:28.313Z)  
**Version ID:** `8065e5bc-c62b-4463-8327-4328b7b13b7b`  
**Citation:** [staging.codemerlin.ai](https://staging.codemerlin.ai/work-items/343dd24c-56e6-46ed-933d-40ab44ed32ae?tab=specification)

## Outcome

Users can manually recover from transient profile or loyalty data loading failures by clicking a "Try again" button, which triggers a data refetch without requiring a full page reload.

## User Stories

### User Story 1 — Manual Retry for Profile Failures (Priority: P1)

As a user, I want to see a "Try again" button when my profile fails to load so that I can attempt to recover from a temporary network error without refreshing the entire page.

- When the profile API fails, a "Try again" button is visible next to the error message.
- Clicking the button triggers a new network request to the profile endpoint.
- The UI transitions back to a loading state while the retry is in progress.

### User Story 2 — Manual Retry for Loyalty Failures (Priority: P1)

As a user, I want to see a "Try again" button when my loyalty points fail to load so that I can retry the request independently of the rest of the page.

- When the loyalty API fails, a "Try again" button is visible in the loyalty strip.
- Clicking the button triggers a new network request to the loyalty endpoint.
- The UI transitions back to a loading state while the retry is in progress.

### User Story 3 — Feature Flagged UX (Priority: P2)

As a developer, I want to control the visibility of the retry button via a feature flag so that I can safely roll out the feature or disable it if issues arise.

- If `enable_profile_retry_ux` is false, the "Try again" button is not rendered.
- If `enable_profile_retry_ux` is true, the "Try again" button is rendered on error.

## Functional Requirements

1. **FR-001**: The `useAccountProfile` hook must return a `refetch` function that triggers a re-execution of the fetch logic. [Story 1]
2. **FR-002**: The `useLoyaltyPoints` hook must return a `refetch` function that triggers a re-execution of the fetch logic. [Story 2]
3. **FR-003**: Calling `refetch` must immediately set the state to `loading: true` and `error: null`. [Story 1, 2]
4. **FR-004**: `UserProfileBanner` must render a "Try again" button when the profile state is in an error condition and the feature flag is enabled. [Story 1, 3]
5. **FR-005**: `LoyaltyStrip` must render a "Try again" button when the loyalty state is in an error condition and the feature flag is enabled. [Story 2, 3]
6. **FR-006**: The system must ignore responses from previous fetch attempts if a new `refetch` or prop change occurs before the previous request completes. [Story 1, 2]

## Success Criteria

1. **SC-001**: Clicking "Try again" results in exactly one network request per click.
2. **SC-002**: The transition from error state to loading state upon clicking "Try again" must occur in under 100ms (UI responsiveness).
3. **SC-003**: When the `enable_profile_retry_ux` flag is disabled, no "Try again" button is present in the DOM, even if an error occurs.

## Edge Cases

- **Rapid Clicks**: If a user clicks "Try again" multiple times quickly, the system should ensure only the latest request's result is applied to the state.
- **Prop Changes during Retry**: If the `accountId` changes while a retry is in flight, the in-flight retry for the old ID must be discarded.
- **Empty/Null Data**: If the API returns a 200 OK but with empty data that the hook considers an error, the retry button should still be available if the hook enters an error state.
- **Offline State**: If the user is offline, clicking "Try again" should immediately return to the error state after the failed attempt.

## Out of Scope

- Automatic retry logic (exponential backoff or fixed intervals).
- Polling for data updates.
- Changes to the backend API endpoints or response structures.
- Global error notifications or toast messages.
