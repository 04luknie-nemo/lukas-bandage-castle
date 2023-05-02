import { z } from 'zod'

export const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'] as const

export const intakeSchema = z.object({
  stayId: z.number().int().positive(),
  conditionOnArrival: z.enum(CONDITIONS),
  weightKg: z.number().positive().max(100000).optional(),
  injuries: z.string().max(5000).optional(),
  behaviourNotes: z.string().max(5000).optional(),
  belongings: z.string().max(2000).optional(),
})

export type IntakeInput = z.infer<typeof intakeSchema>
