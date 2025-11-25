import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../db/prisma', () => ({
  prisma: {
    shift: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    timeOff: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}))

import { prisma } from '../../db/prisma'
import { createShift, decideLeave, updateShift } from './rota.service'

const db = prisma as unknown as { [model: string]: { [m: string]: ReturnType<typeof vi.fn> } }

const hobbsMonday = { id: 1, userId: 3, startsAt: new Date(2025, 10, 24, 7), endsAt: new Date(2025, 10, 24, 15), post: 'KEEPER' }

beforeEach(() => {
  vi.resetAllMocks()
  db.shift.findMany.mockResolvedValue([hobbsMonday])
  db.timeOff.findMany.mockResolvedValue([])
  db.shift.create.mockImplementation(({ data }) => Promise.resolve({ id: 2, ...data }))
  db.shift.update.mockImplementation(({ data }) => Promise.resolve({ id: 1, ...data }))
})

describe('createShift', () => {
  it('saves a shift that fits and writes the audit log', async () => {
    const s = await createShift({ userId: 3, startsAt: '2025-11-25T07:00', endsAt: '2025-11-25T15:00', post: 'KEEPER' }, 1)
    expect(s.startsAt).toEqual(new Date(2025, 10, 25, 7))
    expect(db.auditLog.create).toHaveBeenCalledOnce()
  })

  it('refuses a shift on top of another one', async () => {
    await expect(createShift({ userId: 3, startsAt: '2025-11-24T14:00', endsAt: '2025-11-24T22:00', post: 'KEEPER' }, 1)).rejects.toThrow(/Already working/)
    expect(db.shift.create).not.toHaveBeenCalled()
  })

  it('refuses shifts during approved leave', async () => {
    db.timeOff.findMany.mockResolvedValue([{ fromDate: new Date('2025-11-27'), toDate: new Date('2025-11-28'), status: 'APPROVED' }])
    await expect(createShift({ userId: 3, startsAt: '2025-11-27T07:00', endsAt: '2025-11-27T15:00', post: 'KEEPER' }, 1)).rejects.toThrow(/On leave/)
  })
})

describe('updateShift', () => {
  it('moving a shift does not clash with its old self', async () => {
    db.shift.findUnique.mockResolvedValue(hobbsMonday)
    const s = await updateShift(1, { userId: 3, startsAt: '2025-11-24T08:00', endsAt: '2025-11-24T16:00', post: 'KEEPER' }, 1)
    expect(s.endsAt).toEqual(new Date(2025, 10, 24, 16))
  })
})

describe('decideLeave', () => {
  it('records who approved it', async () => {
    db.timeOff.findUnique.mockResolvedValue({ id: 4, userId: 3, status: 'REQUESTED' })
    db.timeOff.update.mockImplementation(({ data }) => Promise.resolve({ id: 4, ...data }))
    const l = await decideLeave(4, 'APPROVED', 1)
    expect(l).toMatchObject({ status: 'APPROVED', decidedById: 1 })
  })
})
