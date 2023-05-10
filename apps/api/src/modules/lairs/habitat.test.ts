import { describe, expect, it } from 'vitest'
import type { Species } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { habitatWarnings } from './habitat'

const dragon: Species = {
  id: 1,
  name: 'Dragon',
  slug: 'dragon',
  description: null,
  diet: 'Goats',
  dietType: 'CARNIVORE',
  mealsPerDay: 2,
  portionKg: new Prisma.Decimal(40),
  dangerLevel: 5,
  tempMinC: 30,
  tempMaxC: 60,
  humidityMin: 10,
  humidityMax: 40,
  darkness: 70,
  lifespanYears: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('habitatWarnings', () => {
  it('is empty for a perfect lair', () => {
    expect(habitatWarnings({ temperatureC: 45, humidity: 20, darkness: 70 }, dragon)).toEqual([])
  })

  it('complains when it is too cold', () => {
    const w = habitatWarnings({ temperatureC: 12, humidity: 20, darkness: 70 }, dragon)
    expect(w).toHaveLength(1)
    expect(w[0].field).toBe('temperature')
    expect(w[0].message).toContain('Too cold')
  })

  it('complains when it is too damp', () => {
    const w = habitatWarnings({ temperatureC: 45, humidity: 90, darkness: 70 }, dragon)
    expect(w.map((x) => x.field)).toEqual(['humidity'])
  })

  it('allows some slack on darkness', () => {
    expect(habitatWarnings({ temperatureC: 45, humidity: 20, darkness: 55 }, dragon)).toEqual([])
    expect(habitatWarnings({ temperatureC: 45, humidity: 20, darkness: 20 }, dragon)[0].message).toContain('Too bright')
  })
})
