import type { Role } from './roles'

/** The logged-in user as returned by GET /api/auth/me. */
export type SessionUser = {
  id: number
  email: string
  name: string | null
  roles: Role[]
  /** id of the linked customer profile, for OWNER/OVERLORD accounts */
  customerId: number | null
}
