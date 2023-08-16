import { describe, expect, it } from 'vitest'
import { buildSchedule, mealTimes, shoppingList } from './schedule'

describe('mealTimes', () => {
  it('one meal is at noon', () => {
    expect(mealTimes(1)).toEqual(['12:00'])
  })

  it('spreads meals from 07:00 to 21:00', () => {
    expect(mealTimes(2)).toEqual(['07:00', '21:00'])
    expect(mealTimes(3)).toEqual(['07:00', '14:00', '21:00'])
  })

  it('handles uneven spacing', () => {
    expect(mealTimes(4)).toEqual(['07:00', '11:40', '16:20', '21:00'])
  })

  it('no meals for monsters that do not eat', () => {
    expect(mealTimes(0)).toEqual([])
  })
})

describe('buildSchedule', () => {
  const troll = {
    lair: { id: 1, name: 'Under the Old Bridge', wing: 'DUNGEON' },
    monster: { id: 10, name: 'Mumbles' },
    species: { name: 'Troll', diet: 'Turnips and goats', mealsPerDay: 2, portionKg: 6 },
  }
  const wraith = {
    lair: { id: 2, name: 'The Draughty Attic', wing: 'NORTH_TOWER' },
    monster: { id: 11, name: 'Whisper' },
    species: { name: 'Wraith', diet: 'Moonlight', mealsPerDay: 0, portionKg: 0 },
  }

  it('creates one entry per meal', () => {
    const s = buildSchedule([troll])
    expect(s).toHaveLength(2)
    expect(s[0]).toMatchObject({ time: '07:00', monsterName: 'Mumbles', food: 'Turnips and goats', portionKg: 6 })
  })

  it('skips monsters that do not eat', () => {
    expect(buildSchedule([wraith])).toEqual([])
  })

  it('sums the shopping list', () => {
    expect(shoppingList(buildSchedule([troll]))).toEqual([{ food: 'Turnips and goats', kg: 12 }])
  })
})
