import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../db/prisma', () => ({
  prisma: {
    shift: { findUnique: vi.fn(), update: vi.fn() },
    shiftSwap: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    user: { findUnique: vi.fn() },
    notification: { create: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { prisma } from '../../db/prisma'
import { acceptSwap, cancelSwap, declineSwap, offerSwap } from './swaps'

type M = { [k: string]: { [m: string]: ReturnType<typeof vi.fn> } } & { $transaction: ReturnType<typeof vi.fn> }
const db = prisma as unknown as M

const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000)
const shift = { id: 5, userId: 4, startsAt: nextWeek, endsAt: new Date(nextWeek.getTime() + 8 * 3600 * 1000), post: 'KEEPER' }
const pending = { id: 9, shiftId: 5, fromUserId: 4, toUserId: 3, status: 'PENDING', shift }

beforeEach(() => {
  vi.resetAllMocks()
  db.$transaction.mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops))
  db.shiftSwap.update.mockImplementation(({ data }) => Promise.resolve({ ...pending, ...data }))
  db.shift.update.mockImplementation(({ data }) => Promise.resolve({ ...shift, ...data }))
  db.user.findUnique.mockResolvedValue({ displayName: 'Bryony Mudlark' })
})

describe('offerSwap', () => {
  it('offers my shift to a colleague and tells them', async () => {
    db.shift.findUnique.mockResolvedValue(shift)
    db.shiftSwap.create.mockImplementation(({ data }) => Promise.resolve({ id: 9, ...data }))
    const swap = await offerSwap(5, 4, 3, 'Dentist!')
    expect(swap).toMatchObject({ shiftId: 5, fromUserId: 4, toUserId: 3 })
    expect(db.notification.create.mock.calls[0][0].data.userId).toBe(3)
  })

  it("can't give away someone else's shift", async () => {
    db.shift.findUnique.mockResolvedValue(shift)
    await expect(offerSwap(5, 3, 2)).rejects.toThrow(/your own shifts/)
  })

  it('one open swap per shift', async () => {
    db.shift.findUnique.mockResolvedValue(shift)
    db.shiftSwap.findFirst.mockResolvedValue(pending)
    await expect(offerSwap(5, 4, 2)).rejects.toThrow(/already an open swap/)
  })
})

describe('acceptSwap', () => {
  it('moves the shift to me', async () => {
    db.shiftSwap.findUnique.mockResolvedValue(pending)
    await acceptSwap(9, 3)
    expect(db.shift.update).toHaveBeenCalledWith({ where: { id: 5 }, data: { userId: 3 } })
    expect(db.auditLog.create).toHaveBeenCalledOnce()
  })

  it('only the colleague who was asked can accept', async () => {
    db.shiftSwap.findUnique.mockResolvedValue(pending)
    await expect(acceptSwap(9, 7)).rejects.toThrow(/not found/i)
    expect(db.shift.update).not.toHaveBeenCalled()
  })

  it('cannot accept twice', async () => {
    db.shiftSwap.findUnique.mockResolvedValue({ ...pending, status: 'ACCEPTED' })
    await expect(acceptSwap(9, 3)).rejects.toThrow(/already accepted/)
  })
})

describe('declineSwap / cancelSwap', () => {
  it('declining leaves the shift alone', async () => {
    db.shiftSwap.findUnique.mockResolvedValue(pending)
    const s = await declineSwap(9, 3)
    expect(s.status).toBe('DECLINED')
    expect(db.shift.update).not.toHaveBeenCalled()
  })

  it('only the asker can cancel', async () => {
    db.shiftSwap.findUnique.mockResolvedValue(pending)
    await expect(cancelSwap(9, 3)).rejects.toThrow(/not found/i)
    expect((await cancelSwap(9, 4)).status).toBe('CANCELLED')
  })
})
