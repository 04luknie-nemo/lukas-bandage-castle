import { describe, expect, it } from 'vitest'
import { onLeave, overlaps, shiftProblems } from './rules'

const t = (day: number, h: number, m = 0) => new Date(2025, 10, day, h, m)
const shift = (id: number, day: number, from: number, to: number) => ({ id, startsAt: t(day, from), endsAt: t(day, to) })

describe('overlaps', () => {
  it('detects every kind of overlap', () => {
    const a = { startsAt: t(24, 9), endsAt: t(24, 17) }
    expect(overlaps(a, { startsAt: t(24, 12), endsAt: t(24, 20) })).toBe(true)
    expect(overlaps(a, { startsAt: t(24, 6), endsAt: t(24, 10) })).toBe(true)
    expect(overlaps(a, { startsAt: t(24, 10), endsAt: t(24, 11) })).toBe(true)
    expect(overlaps(a, { startsAt: t(24, 17), endsAt: t(24, 22) })).toBe(false)
  })
})

describe('onLeave', () => {
  const leave = [{ fromDate: new Date('2025-11-26'), toDate: new Date('2025-11-27'), status: 'APPROVED' }]

  it('approved leave blocks the day', () => {
    expect(onLeave(shift(0, 27, 7, 15), leave)).toBeDefined()
    expect(onLeave(shift(0, 28, 7, 15), leave)).toBeUndefined()
  })

  it('requested leave does not count yet', () => {
    expect(onLeave(shift(0, 27, 7, 15), [{ ...leave[0], status: 'REQUESTED' }])).toBeUndefined()
  })
})

describe('shiftProblems', () => {
  it('a normal shift is fine', () => {
    expect(shiftProblems(shift(0, 25, 7, 15), [shift(1, 24, 7, 15)], [])).toEqual([])
  })

  it('no double shifts', () => {
    expect(shiftProblems(shift(0, 24, 12, 20), [shift(1, 24, 7, 15)], [])).toContainEqual(expect.stringMatching(/Already working/))
  })

  it('needs 11 hours rest', () => {
    expect(shiftProblems(shift(0, 25, 7, 15), [shift(1, 24, 14, 22)], [])).toContainEqual(expect.stringMatching(/Only 9 hours rest/))
  })

  it('no more than 48 hours a week', () => {
    const week = [24, 25, 26, 27, 28].map((d, i) => ({ id: i + 1, startsAt: t(d, 6), endsAt: t(d, 16) })) // 50 hours
    const problems = shiftProblems(shift(0, 29, 6, 10), week, [])
    expect(problems).toContainEqual(expect.stringMatching(/54 hours this week/))
  })

  it('editing a shift does not clash with itself', () => {
    expect(shiftProblems(shift(1, 24, 8, 16), [shift(1, 24, 7, 15)], [])).toEqual([])
  })

  it('ends before it starts', () => {
    expect(shiftProblems({ startsAt: t(24, 15), endsAt: t(24, 7) }, [], [])).toContain('A shift has to end after it starts')
  })
})
