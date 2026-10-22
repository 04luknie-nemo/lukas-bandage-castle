// Owners can see when a courier is coming for (or bringing back) their monsters. 2026.
import { Router } from 'express'
import { prisma } from '../../db/prisma'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'

export const myCouriersRouter = Router()

myCouriersRouter.use(requireRole('OWNER'))

myCouriersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const customerId = req.user!.customerId
    if (!customerId) return res.json([])
    const since = new Date(Date.now() - 60 * 24 * 3600 * 1000)
    const trips = await prisma.courierJob.findMany({
      where: { customerId, scheduledFor: { gte: since }, status: { not: 'CANCELLED' } },
      include: { courier: { select: { name: true, kind: true } } },
      orderBy: { scheduledFor: 'desc' },
    })
    const monsters = await prisma.monster.findMany({ where: { id: { in: trips.map((t) => t.monsterId) } }, select: { id: true, name: true } })
    res.json(
      trips.map((t) => ({
        id: t.id,
        monsterName: monsters.find((m) => m.id === t.monsterId)?.name ?? '?',
        direction: t.direction,
        scheduledFor: t.scheduledFor,
        status: t.status,
        courier: t.courier,
        address: t.address,
        fee: t.fee,
        deliveredAt: t.deliveredAt,
      })),
    )
  }),
)
