# 🏚️ Lairs module

Where every monster sleeps.

## Concepts

| Term | Meaning |
| --- | --- |
| **Lair** | An enclosure in one of the castle's wings, with a capacity and habitat settings (temperature, humidity, darkness). |
| **Assignment** | "Monster X lives in lair Y since Z". `releasedAt = null` means the monster is there right now. |
| **Compatibility rule** | Lives in the species module: "never house a basilisk next to a cockatrice". |

## Assigning a monster 🐲➡️🏚️

`POST /api/lairs/:id/assignments` with `{ monsterId, ignoreHabitatWarnings? }`.

Checks, in this order:

1. 🚪 The lair is open (`isActive`) and not full.
2. ⚠️ No compatibility rule is broken between the newcomer's species and the species already living there. This is a hard stop; nobody can override it.
3. 🌡️ The habitat suits the species. If not, the API answers `400` with `details.warnings`, and the client can retry with `ignoreHabitatWarnings: true`.

Moving a monster closes its previous assignment in the same transaction, so a monster is only ever in one lair.

## Files

- `lairs.routes.ts` — HTTP
- `lairs.service.ts` — the rules above
- `habitat.ts` — pure function comparing a lair to a species, unit tested in `habitat.test.ts`
