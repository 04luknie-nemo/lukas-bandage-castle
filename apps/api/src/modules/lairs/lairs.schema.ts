import { z } from 'zod'

export const WINGS = ['NORTH_TOWER', 'DUNGEON', 'EAST_WING', 'MOAT', 'ROOFTOP', 'CELLAR'] as const

export const lairSchema = z.object({
  name: z.string().trim().min(2).max(100),
  wing: z.enum(WINGS),
  capacity: z.number().int().min(1).max(50),
  temperatureC: z.number().int().min(-60).max(1200),
  humidity: z.number().int().min(0).max(100),
  darkness: z.number().int().min(0).max(100),
  notes: z.string().max(5000).nullable().optional(),
  isActive: z.boolean().optional(),
})

export const assignSchema = z.object({
  monsterId: z.number().int().positive(),
  /** Assign even if the habitat isn't ideal (temperature etc). Compatibility rules can't be overridden. */
  ignoreHabitatWarnings: z.boolean().optional(),
})

export type LairInput = z.infer<typeof lairSchema>
export type AssignInput = z.infer<typeof assignSchema>
