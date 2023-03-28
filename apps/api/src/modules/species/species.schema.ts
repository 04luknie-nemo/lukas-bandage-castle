import { z } from 'zod'

export const DIET_TYPES = ['CARNIVORE', 'HERBIVORE', 'OMNIVORE', 'MINERAL', 'ETHEREAL'] as const

const percent = z.number().int().min(0).max(100)

export const speciesSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(5000).optional(),
    diet: z.string().trim().min(2).max(255),
    dietType: z.enum(DIET_TYPES),
    mealsPerDay: z.number().int().min(0).max(12),
    portionKg: z.number().min(0).max(5000),
    dangerLevel: z.number().int().min(1).max(5),
    tempMinC: z.number().int().min(-60).max(1200),
    tempMaxC: z.number().int().min(-60).max(1200),
    humidityMin: percent,
    humidityMax: percent,
    darkness: percent,
    lifespanYears: z.number().int().positive().nullable().optional(),
  })
  .refine((s) => s.tempMinC <= s.tempMaxC, { message: 'tempMinC must be <= tempMaxC', path: ['tempMinC'] })
  .refine((s) => s.humidityMin <= s.humidityMax, { message: 'humidityMin must be <= humidityMax', path: ['humidityMin'] })

export const ruleSchema = z.object({
  incompatibleSpeciesId: z.number().int().positive(),
  reason: z.string().trim().min(3).max(255),
})

export type SpeciesInput = z.infer<typeof speciesSchema>
export type RuleInput = z.infer<typeof ruleSchema>
