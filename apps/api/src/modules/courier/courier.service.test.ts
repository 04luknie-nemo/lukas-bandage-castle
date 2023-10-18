import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../db/prisma', () => ({
  prisma: {
    courierJob: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
    courier: { findUnique: vi.fn() },
    monster: { findUnique: vi.fn() },
  },
}))
vi.mock('../../legacy/ravenPost/ravenPost', () => ({ sendRaven: vi.fn() }))

import { prisma } from '../../db/prisma'
import { sendRaven } from '../../legacy/ravenPost/ravenPost'
import { assignCourier, createJob, setStatus } from './courier.service'

const db = prisma as unknown as { [model: string]: { [m: string]: ReturnType<typeof vi.fn> } }

const job = (over: object = {}) => ({
  id: 10,
  monsterId: 3,
  customerId: 2,
  direction: 'PICKUP',
  distanceLeagues: '10.0',
  weightKg: 300,
  scheduledFor: new Date(2023, 9, 20, 10, 0),
  durationMin: 90,
  status: 'REQUESTED',
  ...over,
})
const skyrender = { id: 1, name: 'Skyrender', kind: 'WYVERN', maxLoadKg: 900, speed: 20, active: true }

beforeEach(() => {
  vi.resetAllMocks()
  db.monster.findUnique.mockResolvedValue({ id: 3, name: 'Gloopert' })
  db.courierJob.update.mockImplementation(({ data }) => Promise.resolve({ ...job(), ...data }))
})

describe('assignCourier', () => {
  it('schedules the trip and sends a raven to the owner', async () => {
    db.courierJob.findUnique.mockResolvedValue(job())
    db.courier.findUnique.mockResolvedValue(skyrender)
    db.courierJob.findMany.mockResolvedValue([])
    const updated = await assignCourier(10, 1)
    expect(updated.status).toBe('SCHEDULED')
    expect(sendRaven).toHaveBeenCalledOnce()
  })

  it('refuses monsters that are too heavy for the courier', async () => {
    db.courierJob.findUnique.mockResolvedValue(job({ weightKg: 1200 }))
    db.courier.findUnique.mockResolvedValue(skyrender)
    await expect(assignCourier(10, 1)).rejects.toThrow(/can carry 900 kg/)
  })

  it('refuses grounded couriers', async () => {
    db.courierJob.findUnique.mockResolvedValue(job())
    db.courier.findUnique.mockResolvedValue({ ...skyrender, active: false })
    await expect(assignCourier(10, 1)).rejects.toThrow(/not flying/)
  })

  it('refuses when the courier is still out on another trip', async () => {
    db.courierJob.findUnique.mockResolvedValue(job({ scheduledFor: new Date(2023, 9, 20, 10, 30) }))
    db.courier.findUnique.mockResolvedValue(skyrender)
    db.courierJob.findMany.mockResolvedValue([job({ id: 9, scheduledFor: new Date(2023, 9, 20, 9, 0), durationMin: 120, status: 'SCHEDULED' })])
    await expect(assignCourier(10, 1)).rejects.toThrow(/out on trip #9/)
  })

  it('cannot assign cancelled trips', async () => {
    db.courierJob.findUnique.mockResolvedValue(job({ status: 'CANCELLED' }))
    await expect(assignCourier(10, 1)).rejects.toThrow(/cancelled/)
  })
})

describe('setStatus', () => {
  it('delivered trips get a delivery time', async () => {
    db.courierJob.findUnique.mockResolvedValue(job({ status: 'IN_FLIGHT' }))
    const updated = await setStatus(10, 'DELIVERED')
    expect(updated.deliveredAt).toBeInstanceOf(Date)
  })

  it('cannot skip straight to delivered', async () => {
    db.courierJob.findUnique.mockResolvedValue(job({ status: 'REQUESTED' }))
    await expect(setStatus(10, 'DELIVERED')).rejects.toThrow(/Can't go from REQUESTED/)
  })

  it('unscheduling frees the courier', async () => {
    db.courierJob.findUnique.mockResolvedValue(job({ status: 'SCHEDULED', courierId: 1 }))
    const updated = await setStatus(10, 'REQUESTED')
    expect(updated.courierId).toBeNull()
  })
})

describe('createJob', () => {
  it('uses the lair address on file and prices the trip', async () => {
    db.monster.findUnique.mockResolvedValue({ id: 3, name: 'Gloopert', owner: { id: 2, lairAddress: 'The Bog, Lower Mire' } })
    db.courierJob.create.mockImplementation(({ data }) => Promise.resolve(data))
    const created = await createJob({ monsterId: 3, direction: 'PICKUP', distanceLeagues: 10, weightKg: 40, scheduledFor: '2023-10-20T10:00' }, 5)
    expect(created.address).toBe('The Bog, Lower Mire')
    expect(created.fee).toBe(20)
    expect(created.durationMin).toBe(90)
  })

  it('castle monsters have nowhere to fly to', async () => {
    db.monster.findUnique.mockResolvedValue({ id: 3, name: 'Grumbold', owner: null })
    await expect(createJob({ monsterId: 3, direction: 'RETURN', distanceLeagues: 1, weightKg: 1, scheduledFor: '2023-10-20T10:00' }, 5)).rejects.toThrow(/belongs to the castle/)
  })
})
