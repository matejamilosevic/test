# Engineering style guide (test repo)

These rules apply to application code in this repository. CodeMerlin should treat them as reviewable standards.

## TypeScript exports

- Exported functions, variables, and React components in `.ts` and `.tsx` files **must use camelCase** names (e.g. `fetchUser`, not `fetch_user`).
- Public APIs exported from `src/` **must not use `any`**; use proper types or `unknown` with narrowing.

## React components

- Components under `src/components/` **must define explicit prop types** (interface or `type`); do not rely on implicit `any` for props.
- Data fetching **must not** live directly inside presentational components; use hooks or container modules and pass data as props.

## API routes

- HTTP handlers **must validate external input** with a schema (e.g. Zod) before business logic runs.
- Route handlers **must return JSON errors** with a stable `code` field on validation failure.

## Naming & files

- Test files **must** match `*.test.ts` or `*.test.tsx` and live next to or under `__tests__/` for the code they cover.

## Out of scope (should not become strict “policy”)

This README section only describes local setup: run `pnpm install` and `pnpm dev`. It does not define coding standards.
