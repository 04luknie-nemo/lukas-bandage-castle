export type CompatibilityRule = { id: number; speciesId: number; speciesName: string; reason: string }

export type Species = {
  id: number
  name: string
  slug: string
  description: string | null
  diet: string
  dietType: 'CARNIVORE' | 'HERBIVORE' | 'OMNIVORE' | 'MINERAL' | 'ETHEREAL'
  mealsPerDay: number
  portionKg: number
  dangerLevel: number
  tempMinC: number
  tempMaxC: number
  humidityMin: number
  humidityMax: number
  darkness: number
  lifespanYears: number | null
  residentCount: number
  incompatibleWith: CompatibilityRule[]
}
