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

export const REMEDY_FORMS = ['POTION', 'SALVE', 'TINCTURE', 'POULTICE', 'ELIXIR'] as const

export const prescriptionSchema = z
  .object({
    remedy: z.string().trim().min(2).max(191),
    form: z.enum(REMEDY_FORMS),
    dosage: z.string().trim().min(1).max(100),
    frequency: z.string().trim().min(1).max(100),
    startDate: dateOnly,
    endDate: dateOnly.optional(),
    notes: z.string().max(5000).optional(),
  })
  .refine((p) => !p.endDate || p.endDate >= p.startDate, { message: 'End date is before start date', path: ['endDate'] })

export type PrescriptionInput = z.infer<typeof prescriptionSchema>
export type RecordInput = z.infer<typeof recordSchema>
export type TreatmentInput = z.infer<typeof treatmentSchema>
