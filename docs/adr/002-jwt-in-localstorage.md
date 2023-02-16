# ADR-002: JWT stored in localStorage 🔑

- **Status:** ⚰️ Superseded by [ADR-005](005-httponly-cookie-sessions.md)
- **Date:** 2022-02 (written down retroactively in 2023-02)

## Context

The client needs to prove who it is on every request.

## Decision

The API returns a JWT on login. The client stores it in `localStorage` and sends it as `Authorization: Bearer <token>`.

## Consequences

- 👍 Trivial to implement.
- 👎 Any script on the page can read the token (XSS risk). A goblin with a browser extension could steal it. 👺
