import { describe, expect, it } from 'vitest'
import { clashes, findClash, tripEnd } from './schedule'

const at = (h: number, m = 0) => new Date(2023, 9, 18, h, m)

describe('tripEnd', () => {
  it('adds the duration', () => {
    expect(tripEnd({ scheduledFor: at(9), durationMin: 90 })).toEqual(at(10, 30))
  })
})

describe('clashes', () => {
  const morning = { id: 1, scheduledFor: at(9), durationMin: 120 }

  it('a trip that starts while the courier is out clashes', () => {
    expect(clashes({ scheduledFor: at(10), durationMin: 60 }, morning)).toBe(true)
  })

  it('same start time clashes', () => {
    expect(clashes({ scheduledFor: at(9), durationMin: 30 }, morning)).toBe(true)
  })

  it('back to back is fine', () => {
    expect(clashes({ scheduledFor: at(11), durationMin: 60 }, morning)).toBe(false)
  })

  it('a later trip is fine', () => {
    expect(clashes({ scheduledFor: at(15), durationMin: 60 }, morning)).toBe(false)
  })
})

describe('findClash', () => {
  it('ignores the trip itself', () => {
    const trip = { id: 7, scheduledFor: at(9), durationMin: 60 }
    expect(findClash(trip, [trip])).toBeUndefined()
  })

  it('finds the clashing trip', () => {
    const a = { id: 1, scheduledFor: at(8), durationMin: 60 }
    const b = { id: 2, scheduledFor: at(13), durationMin: 60 }
    expect(findClash({ scheduledFor: at(13, 30), durationMin: 30 }, [a, b])).toBe(b)
  })
})
