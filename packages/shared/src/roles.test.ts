import { describe, expect, it } from 'vitest'
import { hasRole, isStaff } from './roles'

describe('hasRole', () => {
  it('is false for no user', () => {
    expect(hasRole(null, 'ADMIN')).toBe(false)
    expect(hasRole(undefined, 'VET')).toBe(false)
  })

  it('matches any of the requested roles', () => {
    const user = { roles: ['VET' as const] }
    expect(hasRole(user, 'ADMIN', 'VET')).toBe(true)
    expect(hasRole(user, 'KEEPER')).toBe(false)
  })

  it('works for customers with two roles', () => {
    const user = { roles: ['OWNER' as const, 'OVERLORD' as const] }
    expect(hasRole(user, 'OVERLORD')).toBe(true)
    expect(hasRole(user, 'OWNER')).toBe(true)
    expect(isStaff(user)).toBe(false)
  })

  describe('legacy STAFF accounts', () => {
    const igor = { roles: ['STAFF' as const] }

    it('count as any staff role', () => {
      expect(hasRole(igor, 'KEEPER')).toBe(true)
      expect(hasRole(igor, 'FRONT_DESK')).toBe(true)
      expect(isStaff(igor)).toBe(true)
    })

    it('never count as ADMIN', () => {
      expect(hasRole(igor, 'ADMIN')).toBe(false)
    })

    it('never count as a customer', () => {
      expect(hasRole(igor, 'OWNER')).toBe(false)
    })
  })
})
