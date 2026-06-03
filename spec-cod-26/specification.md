# Specification — COD-26

**Approval:** approved (2026-06-03T13:43:06.426Z)  
**Version ID:** `e8425b3f-3cbc-4dc9-ae04-51bbdd513ab4`

## Outcome

The `ProfileBanner` components will be refactored to follow modern TypeScript and React best practices. This includes renaming exports to camelCase, extracting data-fetching logic into reusable hooks or helpers, and ensuring full type safety. The resulting code will be more maintainable, easier to test, and compliant with the project's style guidelines without changing the existing visual layout.

## User Stories

### User Story 1 — Standardized Naming (Priority: P1)

As a developer, I want the `ProfileBanner` components to use camelCase naming so that the codebase remains consistent with the project's style guide.

- [ ] `user_profile_banner` is renamed to `UserProfileBanner`.
- [ ] `loyalty_strip` is renamed to `LoyaltyStrip`.
- [ ] The main entry point (`src/index.ts`) exports these components using their new names.

### User Story 2 — Type Safety (Priority: P2)

As a developer, I want explicit TypeScript interfaces for all component props so that I can catch integration errors at compile-time rather than runtime.

- [ ] `UserProfileBanner` and `LoyaltyStrip` have defined prop interfaces.
- [ ] No `any` types are used for component props or state.
- [ ] `pnpm typecheck` passes without errors.

### User Story 3 — Separation of Concerns (Priority: P3)

As a developer, I want data-fetching logic removed from the presentational components so that the UI is easier to test and the logic can be reused.

- [ ] Direct `fetch` calls are removed from `ProfileBanner.tsx`.
- [ ] A new hook or helper handles requests to `/api/account` and `/api/account/lookup`.
- [ ] The data-loading logic handles loading states, API failures, and empty responses.

### User Story 4 — Automated Testing (Priority: P4)

As a developer, I want meaningful unit tests for the profile components so that I can verify they handle data and error states correctly.

- [ ] A test file exists (e.g., `profile_banner.test.tsx`).
- [ ] Tests verify that components render correctly with data.
- [ ] Tests verify that components display appropriate states when the API fails.

## Functional Requirements

1. **FR-001**: Rename `user_profile_banner` to `UserProfileBanner` in `src/components/ProfileBanner.tsx`. [US-1]
2. **FR-002**: Rename `loyalty_strip` to `LoyaltyStrip` in `src/components/ProfileBanner.tsx`. [US-1]
3. **FR-003**: Update `src/index.ts` to export `UserProfileBanner` and `LoyaltyStrip`. [US-1]
4. **FR-004**: Define TypeScript interfaces for all props in `ProfileBanner.tsx`. [US-2]
5. **FR-005**: Extract API calls for `/api/account` and `/api/account/lookup` into a custom hook or utility function. [US-3]
6. **FR-006**: Implement error handling in the data-fetching logic to manage non-200 responses and network failures. [US-3]
7. **FR-007**: Implement loading state logic to indicate when data is being retrieved. [US-3]
8. **FR-008**: Create or update a test suite that asserts the presence of UI elements based on mock API responses. [US-4]

## Success Criteria

1. **SC-001**: `pnpm typecheck` completes with zero errors. [FR-4]
2. **SC-002**: `pnpm test` completes with all tests passing, including at least one assertion for a rendered state and one for an error state in the profile banner tests. [FR-8]
3. **SC-003**: The components `UserProfileBanner` and `LoyaltyStrip` are successfully exported and usable from the package root. [FR-3]
4. **SC-004**: No instances of `fetch` remain within the body of the React components in `ProfileBanner.tsx`. [FR-5]

## Edge Cases

- **API Returns 404/500:** The component must display a graceful error state or fallback UI rather than crashing. [FR-6]
- **Empty API Response:** If the API returns an empty object or null, the component should handle this without throwing "cannot read property of undefined" errors. [FR-6]
- **Slow Network:** The loading state must be triggered and visible while the extracted hook/helper is fetching data. [FR-7]
- **Concurrent Requests:** If the component re-renders or props change rapidly, the data-fetching logic should handle or cancel stale requests to prevent race conditions.

## Out of Scope

- Modifying the visual design, CSS, or HTML structure of the components.
- Changing the backend API endpoints or their response schemas.
- Refactoring other components outside of the `ProfileBanner` scope.

## Jira Requirement Coverage

| Jira AC | Covered by |
|---|---|
| Exports from `ProfileBanner.tsx` use camelCase | FR-001, FR-002 |
| `src/index.ts` re-exports components under the new names | FR-003 |
| Both components have explicit TypeScript interfaces for props | FR-004 |
| No direct `fetch` in component bodies; logic lives in hook/helper | FR-005 |
| Hook/helper handles API failure, empty response, loading state | FR-006, FR-007 |
| `profile_banner.spec.ts` includes meaningful assertions | FR-008 |
| `pnpm typecheck` passes | SC-001 |
| `pnpm test` passes | SC-002 |
