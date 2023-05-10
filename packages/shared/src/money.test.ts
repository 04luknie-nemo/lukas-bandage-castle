import { describe, expect, it } from 'vitest'
import { toGoldString } from './money'

describe('toGoldString', () => {
  it('formats with two decimals and a thousands separator', () => {
    expect(toGoldString(1234.5)).toBe('1,234.50 gp')
  })

  it('accepts strings from DECIMAL columns', () => {
    expect(toGoldString('99.90')).toBe('99.90 gp')
  })

  it('treats null as zero', () => {
    expect(toGoldString(null)).toBe('0.00 gp')
  })
})
