import { z } from 'zod'

export const SUPPLY_CATEGORIES = ['FOOD', 'POTION', 'BANDAGE', 'BEDDING', 'CLEANING', 'OTHER'] as const
export const MOVEMENT_REASONS = ['DELIVERY', 'USED', 'SPOILED', 'ADJUSTMENT'] as const

export const supplySchema = z.object({
  name: z.string().trim().min(2).max(191),
  category: z.enum(SUPPLY_CATEGORIES),
  unit: z.string().trim().min(1).max(32),
  quantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0),
  supplier: z.string().max(191).nullable().optional(),
})

export const movementSchema = z.object({
  amount: z.number().refine((n) => n !== 0, 'Amount cannot be zero'),
  reason: z.enum(MOVEMENT_REASONS),
  note: z.string().max(255).optional(),
})

export type SupplyInput = z.infer<typeof supplySchema>
export type MovementInput = z.infer<typeof movementSchema>
