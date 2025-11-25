import { describe, expect, it } from 'vitest'
import { restBetween, shiftHours, totalHours, weekStart } from './hours'

const t = (day: number, h: number, m = 0) => new Date(2025, 10, day, h, m) // November 2025

describe('shiftHours', () => {
  it('an early shift is eight hours', () => {
    expect(shiftHours({ startsAt: t(24, 7), endsAt: t(24, 15) })).toBe(8)
  })

  it('counts half hours', () => {
    expect(shiftHours({ startsAt: t(24, 9), endsAt: t(24, 17, 30) })).toBe(8.5)
    expect(shiftHours({ startsAt: t(24, 9, 30), endsAt: t(24, 13) })).toBe(3.5)
  })
})

describe('totalHours', () => {
  it('adds up a normal week', () => {
    const week = [24, 25, 26, 27, 28].map((d) => ({ startsAt: t(d, 7), endsAt: t(d, 15) }))
    expect(totalHours(week)).toBe(40)
  })

  it('no shifts, no hours', () => {
    expect(totalHours([])).toBe(0)
  })
})

describe('weekStart', () => {
  it('weeks start on Monday', () => {
    expect(weekStart(t(27, 12))).toEqual(t(24, 0)) // Thursday -> Monday 24th
    expect(weekStart(t(30, 12))).toEqual(t(24, 0)) // Sunday belongs to the week before
    expect(weekStart(t(24, 0))).toEqual(t(24, 0))
  })
})

describe('restBetween', () => {
  it('late shift then early shift is not enough rest', () => {
    expect(restBetween({ startsAt: t(24, 14), endsAt: t(24, 22) }, { startsAt: t(25, 7), endsAt: t(25, 15) })).toBe(9)
  })
})
