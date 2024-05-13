import { describe, expect, it } from 'vitest'
import { courierLines } from './courierLines'
import { totalOf } from './engine'

describe('courierLines', () => {
  it('one line per delivered trip', () => {
    const lines = courierLines([
      { direction: 'PICKUP', distanceLeagues: '12.0', fee: 2300 },
      { direction: 'RETURN', distanceLeagues: '12.0', fee: 2300 },
    ])
    expect(lines).toHaveLength(2)
    expect(lines[0]).toMatchObject({ description: 'Wyvern courier, pickup from the lair (12 leagues)', quantity: 1, unitCopper: 2300, amountCopper: 2300, kind: 'OTHER' })
    expect(lines[1].description).toContain('return to')
    expect(totalOf(lines)).toBe(4600)
  })

  it('no trips, no lines', () => {
    expect(courierLines([])).toEqual([])
  })

  it('never produces fractions of a copper', () => {
    const [line] = courierLines([{ direction: 'PICKUP', distanceLeagues: 3, fee: '1249.5' }])
    expect(Number.isInteger(line.amountCopper)).toBe(true)
  })
})
