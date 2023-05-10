import { describe, expect, it } from 'vitest'
import { ageInYears, toDateOnly } from './dates'

describe('ageInYears', () => {
  it('counts whole years', () => {
    expect(ageInYears('2000-01-01', new Date('2023-06-01'))).toBe(23)
  })

  it('returns null without a birth date', () => {
    expect(ageInYears(null)).toBeNull()
  })

  it('is 0 for a hatchling born this year', () => {
    expect(ageInYears('2023-02-01', new Date('2023-05-10'))).toBe(0)
  })
})

describe('toDateOnly', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(toDateOnly(new Date('2023-05-10T12:00:00Z'))).toBe('2023-05-10')
  })
})
