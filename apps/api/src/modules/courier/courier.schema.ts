import { z } from 'zod'

export const DIRECTIONS = ['PICKUP', 'RETURN'] as const
export const JOB_STATUSES = ['REQUESTED', 'SCHEDULED', 'IN_FLIGHT', 'DELIVERED', 'CANCELLED'] as const

const dateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Expected a date and time')

export const quoteSchema = z.object({
  distanceLeagues: z.number().positive().max(500),
  weightKg: z.number().int().positive().max(20000),
  scheduledFor: dateTime,
})

export const createJobSchema = quoteSchema.extend({
  monsterId: z.number().int().positive(),
  stayId: z.number().int().positive().nullable().optional(),
  direction: z.enum(DIRECTIONS),
  address: z.string().trim().max(255).optional(),
  notes: z.string().max(5000).optional(),
})

export const listQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(JOB_STATUSES).optional(),
})

export const assignSchema = z.object({ courierId: z.number().int().positive() })

export const statusSchema = z.object({ status: z.enum(JOB_STATUSES) })

export type CreateJobInput = z.infer<typeof createJobSchema>
export type ListQuery = z.infer<typeof listQuerySchema>
export type JobStatus = (typeof JOB_STATUSES)[number]
