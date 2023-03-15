import { z } from 'zod'
import { ROLES } from '@bandage/shared'

const role = z.enum(ROLES)

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1).max(191),
  password: z.string().min(8),
  roles: z.array(role).min(1),
})

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(191).optional(),
  roles: z.array(role).min(1).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
