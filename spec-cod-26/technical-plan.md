# Technical Plan — COD-26

**Approval:** approved (2026-06-03T13:44:24.949Z)  
**Version ID:** `756f2be7-c128-4ce7-a889-330686250825`

## Technical approach

## Research decisions

- **Hook vs. Helper**: A custom React hook (`useAccountData`) was chosen over a simple helper function to manage the lifecycle of the fetch request, including loading and error states, which are inherently reactive in the UI.
- **Naming Convention**: Transitioning from `snake_case` to `PascalCase` for React components to align with standard React ecosystem conventions and the project's STYLEGUIDE.md.
- **Trade-off 1**: Using a single hook for both `/api/account` and `/api/account/lookup` vs. separate hooks. A single hook with a parameter or separate methods was chosen to centralize error handling logic, reducing boilerplate.
- **Trade-off 2**: Manual fetch vs. React Query. Given the current dependencies (only `react` and `zod`), we will implement a standard `useEffect` + `fetch` pattern to avoid introducing new heavy dependencies, while ensuring robust error handling.

## Component / module ownership

- `src/components/ProfileBanner.tsx`: Owns the presentational logic for `UserProfileBanner` and `LoyaltyStrip`.
- `src/hooks/useAccount.ts`: New module to own data fetching and state management for account-related data.
- `src/index.ts`: Public API surface for the package.
- **NOT MODIFIED**: Backend API routes and existing CSS/styles.

## Service interaction patterns

- The components will interact with the backend via HTTP GET requests to `/api/account` and `/api/account/lookup`.
- **Failure Handling**: The hook will catch network errors and non-200 HTTP statuses, returning an `error` state to the component. The component will render a fallback UI (e.g., "Unable to load profile") instead of crashing.

## Feature-flag keys

- Not applicable — this is a structural refactor of existing components and does not introduce new gated features.

## Multi-tenancy contract

- Not applicable — the components consume existing APIs that handle session-based or token-based isolation. This refactor does not change the request headers or auth context.

## Affected components

- **src/components/ProfileBanner.tsx** — Renaming exports, adding interfaces, and removing fetch logic.
- **src/hooks/useAccount.ts** — New file created to house the extracted data fetching logic.
- **src/index.ts** — Updated to export the new camelCase component names.
- **src/components/__tests__/ProfileBanner.test.tsx** — New or updated test file to verify rendering and error states.

## Data model changes

No database schema changes are required for this refactor.

## API changes

No changes to backend API routes. The internal TypeScript interfaces for the API responses will be defined in `src/types/account.ts` to ensure type safety.

## Migration / rollout

1. **Development**: Implement `useAccount` hook and refactor `ProfileBanner.tsx` locally.
2. **Verification**: Run `pnpm typecheck` and `pnpm test` to ensure no regressions.
3. **Deployment**: Standard CI/CD deployment. Since this is a frontend refactor of existing routes, no database migration or gate-off period is required.
4. **Rollback**: Revert to the previous commit if UI regressions are detected in production.

## Operational considerations

- Monitor client-side error logs for any increase in `fetch` failures related to the new hook.
- PostHog events: No new events, but ensure existing tracking (if any) is preserved during the rename.

## Repository scope

- `matejamilosevic/test`: All changes are contained within this repository's `src` directory.

## Risks

1. **Broken Imports**: Renaming exports in `ProfileBanner.tsx` might break external consumers if they don't use the `index.ts` entry point. Mitigation: Ensure `index.ts` is updated and check for internal usage.
2. **Type Mismatch**: If the API response changes and the new interfaces are too strict, the UI might show error states. Mitigation: Use Zod or optional chaining to handle unexpected API shapes safely.
3. **Race Conditions**: Rapid re-renders could trigger multiple fetches. Mitigation: Implement a cleanup function in the `useEffect` within the custom hook to ignore stale responses.

## Alternatives considered

1. **Keep fetch in components but add types**: Rejected because it violates the separation of concerns and makes unit testing difficult (requires mocking global fetch inside component tests).
2. **Use a state management library (Redux/Zustand)**: Rejected as it is overkill for a simple profile banner and would increase the bundle size unnecessarily.

## Requirement mapping

- **FR-001** — addressed
- **FR-002** — addressed
- **FR-003** — addressed
- **FR-004** — addressed
- **FR-005** — addressed
- **FR-006** — addressed
- **FR-007** — addressed
- **FR-008** — addressed
- **SC-001** — addressed
- **SC-002** — addressed

## ADR references

_(none listed in artifact)_
