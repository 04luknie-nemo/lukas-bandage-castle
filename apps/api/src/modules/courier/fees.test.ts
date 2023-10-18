import { describe, expect, it } from 'vitest'
import { isNightFlight, quote, tripMinutes } from './fees'

const noon = new Date(2023, 9, 18, 12, 0)

describe('quote', () => {
  it('base fee plus distance', () => {
    expect(quote({ distanceLeagues: 10, weightKg: 80, scheduledFor: noon })).toEqual({ base: 5, distance: 15, heavy: 0, night: 0, total: 20 })
  })

  it('heavy monsters cost half as much again', () => {
    const q = quote({ distanceLeagues: 10, weightKg: 800, scheduledFor: noon })
    expect(q.heavy).toBe(10)
    expect(q.total).toBe(30)
  })

  it('exactly 500 kg is not heavy', () => {
    expect(quote({ distanceLeagues: 10, weightKg: 500, scheduledFor: noon }).heavy).toBe(0)
  })

  it('night flights have a flat surcharge', () => {
    expect(quote({ distanceLeagues: 2, weightKg: 10, scheduledFor: new Date(2023, 9, 18, 23, 30) }).total).toBe(18)
  })

  it('rounds to whole copper', () => {
    expect(quote({ distanceLeagues: 3.3, weightKg: 10, scheduledFor: noon }).total).toBe(9.95)
  })
})

describe('isNightFlight', () => {
  it('20:00 to 06:00 is night', () => {
    expect(isNightFlight(new Date(2023, 9, 18, 20, 0))).toBe(true)
    expect(isNightFlight(new Date(2023, 9, 18, 5, 59))).toBe(true)
    expect(isNightFlight(new Date(2023, 9, 18, 6, 0))).toBe(false)
    expect(isNightFlight(new Date(2023, 9, 18, 19, 59))).toBe(false)
  })
})

describe('tripMinutes', () => {
  it('there and back plus loading, rounded up to 5 minutes', () => {
    expect(tripMinutes(10)).toBe(90) // 60 min flying + 30
    expect(tripMinutes(12)).toBe(105) // 72 -> 75 + 30
  })

  it('slow couriers take longer', () => {
    expect(tripMinutes(3, 6)).toBe(90)
  })
})
