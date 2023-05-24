import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

export const TREATMENT_STATUSES = ['PLANNED', 'ONGOING', 'COMPLETE'] as const

export const recordSchema = z.object({
  visitDate: dateOnly,
  summary: z.string().trim().min(3).max(255),
  diagnosis: z.string().max(5000).optional(),
  notes: z.string().max(10000).optional(),
})

export const treatmentSchema = z.object({
  name: z.string().trim().min(2).max(191),
  status: z.enum(TREATMENT_STATUSES).default('PLANNED'),
  startedAt: dateOnly.optional(),
  notes: z.string().max(5000).optional(),
})

export const treatmentStatusSchema = z.object({
  status: z.enum(TREATMENT_STATUSES),
})

export type RecordInput = z.infer<typeof recordSchema>
export type TreatmentInput = z.infer<typeof treatmentSchema>
