# ADR-005: Sessions in an httpOnly cookie 🍪

- **Status:** ✅ Accepted
- **Date:** 2023-03-01
- **Deciders:** Priya Valdez
- **Supersedes:** [ADR-002](002-jwt-in-localstorage.md)

## Context

Tokens in `localStorage` can be read by any script on the page. We also need users to hold more than one role (a customer can be both an owner and an overlord), which the single `tbl_user.role` column can't express.

## Decision

- Login sets a signed JWT in an **httpOnly, SameSite=Lax cookie** called `bc_session`. JavaScript can't read it.
- The JWT only carries the user id. Roles are loaded from the new `user_roles` table on each request by the `authenticate` middleware, so role changes apply immediately.
- New routes protect themselves with `requireRole(...)`. `checkAuth` stays for legacy routes only.
- `tbl_user.role` is kept for now because legacy code still reads it. Don't use it in new code.

## Consequences

- 👍 No token in JavaScript land. Multiple roles per user.
- 👎 One extra query per request (fine at castle scale 🏰).
