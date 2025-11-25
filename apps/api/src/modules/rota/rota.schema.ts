import { z } from 'zod'

export const POSTS = ['KEEPER', 'NIGHT_WATCH', 'VET', 'FRONT_DESK', 'THERAPIST'] as const

/** castle time, e.g. 2025-11-24T07:00 */
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Expected yyyy-mm-ddThh:mm')
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected yyyy-mm-dd')

export const shiftSchema = z.object({
  userId: z.number().int().positive(),
  startsAt: localDateTime,
  endsAt: localDateTime,
  post: z.enum(POSTS),
  area: z.string().trim().max(100).optional(),
  note: z.string().trim().max(255).optional(),
})

export const weekQuerySchema = z.object({ start: day.optional() })

export const leaveSchema = z
  .object({
    fromDate: day,
    toDate: day,
    reason: z.string().trim().max(255).optional(),
  })
  .refine((l) => l.fromDate <= l.toDate, { message: 'The leave has to end after it starts', path: ['toDate'] })

export const decideSchema = z.object({ status: z.enum(['APPROVED', 'REJECTED']) })

export type ShiftInput = z.infer<typeof shiftSchema>
export type LeaveInput = z.infer<typeof leaveSchema>
