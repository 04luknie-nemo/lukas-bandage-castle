import { z } from 'zod'

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

export const LISTING_STATUSES = ['DRAFT', 'OPEN', 'CLOSED'] as const

export const listingSchema = z.object({
  monsterId: z.number().int().positive(),
  title: z.string().trim().min(5).max(191),
  pitch: z.string().trim().min(20).max(5000),
  skills: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  availableFrom: dateOnly,
  feeGold: z.number().min(0).max(1_000_000),
  status: z.enum(LISTING_STATUSES).default('DRAFT'),
})

export const listingStatusSchema = z.object({ status: z.enum(LISTING_STATUSES) })

export type ListingInput = z.infer<typeof listingSchema>
