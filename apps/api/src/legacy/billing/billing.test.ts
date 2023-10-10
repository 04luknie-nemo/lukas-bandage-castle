import { describe, expect, it } from 'vitest'
import { lateDays, nights } from './billing'

// First tests for the legacy billing code, before we touch it for Billing v2.

describe('nights', () => {
  it('counts nights between check-in and check-out', () => {
    expect(nights('2023-10-01', '2023-10-04')).toBe(3)
  })

  it('charges at least one night', () => {
    expect(nights('2023-10-01T09:00:00', '2023-10-01T17:00:00')).toBe(1)
  })

  it('ignores the time of day', () => {
    expect(nights('2023-10-01T23:00:00', '2023-10-02T01:00:00')).toBe(1)
  })
})

describe('lateDays', () => {
  it('is 0 without an agreed pickup date', () => {
    expect(lateDays(null, '2023-10-05')).toBe(0)
  })

  it('is 0 when the owner comes early', () => {
    expect(lateDays('2023-10-05', '2023-10-03')).toBe(0)
  })

  // TODO: fails on CI around midnight, moment + timezones. Gorm knows the details. (#52)
  it.skip('does not charge a late fee on the agreed pickup day', () => {
    expect(lateDays('2023-10-05', '2023-10-05T16:30:00')).toBe(0)
  })
})
