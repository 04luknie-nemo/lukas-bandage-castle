# ADR-003: npm workspaces monorepo 📦

- **Status:** ✅ Accepted
- **Date:** 2023-02-06
- **Deciders:** Priya Valdez

## Context

`server/` and `client/` were two unrelated npm projects. Shared types were copy-pasted and drifted apart. Starting the app needed two terminals.

## Decision

One repo, npm workspaces:

- `apps/api` — Express API
- `apps/web` — React app
- `packages/shared` — types, enums and helpers used by both

`npm run dev` at the root starts everything.

## Consequences

- 👍 One `npm install`, one place for shared code.
- 👎 Workspace hoisting occasionally surprises people. Run `npm install` from the root, never inside a workspace.
