import { describe, expect, it } from 'vitest'
import { coverageGaps } from './coverage'

const monday = new Date(2025, 10, 24)
const sunday = new Date(2025, 10, 30)
const at = (d: Date, h: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h)

const fullDay = (d: Date) => [
  { startsAt: at(d, 7), post: 'KEEPER' },
  { startsAt: at(d, 14), post: 'KEEPER' },
  { startsAt: at(d, 22), post: 'NIGHT_WATCH' },
  { startsAt: at(d, 8), post: 'VET' },
  { startsAt: at(d, 9), post: 'FRONT_DESK' },
]

describe('coverageGaps', () => {
  it('a fully staffed day has no gaps', () => {
    expect(coverageGaps([monday], fullDay(monday))).toEqual([])
  })

  it('reports what is missing', () => {
    const shifts = fullDay(monday).filter((s) => s.post !== 'VET')
    expect(coverageGaps([monday], shifts)).toEqual([{ day: '2025-11-24', post: 'VET', label: 'vet', have: 0, need: 1 }])
  })

  it('counts keepers', () => {
    const shifts = fullDay(monday).slice(1)
    expect(coverageGaps([monday], shifts)[0]).toMatchObject({ post: 'KEEPER', have: 1, need: 2 })
  })

  it('no vet or front desk needed on Sundays', () => {
    const shifts = fullDay(sunday).filter((s) => s.post !== 'VET' && s.post !== 'FRONT_DESK')
    expect(coverageGaps([sunday], shifts)).toEqual([])
  })

  it('an empty day misses everything', () => {
    expect(coverageGaps([monday], [])).toHaveLength(4)
  })
})
