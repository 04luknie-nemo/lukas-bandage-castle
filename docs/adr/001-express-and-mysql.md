# ADR-001: Express + MySQL for the API 🏗️

- **Status:** ✅ Accepted
- **Date:** 2022-02 (written down retroactively in 2023-02)
- **Deciders:** Gorm Ashby

## Context

The castle needed a booking system *fast*. The only developer knew Node and had MySQL running on the castle server already.

## Decision

- Node.js + Express for a JSON REST API.
- MySQL as the only database.

## Consequences

- 👍 Simple, well-known, cheap to host in the cellar.
- 👎 No ORM was chosen, so the first year of code uses hand-written SQL (see ADR-004).
