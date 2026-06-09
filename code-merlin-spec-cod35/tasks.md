# Tasks — COD-35

**Approval:** approved (2026-06-09T13:53:27.386Z)  
**Version ID:** `111260f6-1b30-442d-8ceb-19623639f0b4`  
**Citation:** [staging.codemerlin.ai](https://staging.codemerlin.ai/work-items/343dd24c-56e6-46ed-933d-40ab44ed32ae?tab=tasks)

- [x] Extend `AsyncDataState` with optional `refetch: () => void`
- [x] Add `enable_profile_retry_ux` feature flag helper (default false)
- [x] Implement `refetch` in `useAccountProfile` with state reset and cleanup
- [x] Implement `refetch` in `useLoyaltyPoints` with state reset and cleanup
- [x] Add "Try again" button to `UserProfileBanner` error state (flag-gated)
- [x] Add "Try again" button to `LoyaltyStrip` error state (flag-gated)
- [x] Verify flag-off behavior — no button in DOM during errors
- [x] Unit and component tests for refetch transitions and retry UX
