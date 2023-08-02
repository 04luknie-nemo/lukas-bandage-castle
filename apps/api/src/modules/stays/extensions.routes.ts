// Stay extensions. The rest of /api/stays still lives in legacy/stays.
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../db/prisma'
import { BadRequestError, NotFoundError } from '../../errors/httpErrors'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'

export const stayExtensionsRouter = Router()

const extendSchema = z.object({
  newPickup: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(3).max(255),
})

stayExtensionsRouter.get(
  '/:id/extensions',
  requireRole('ADMIN', 'FRONT_DESK', 'KEEPER', 'VET'),
  asyncHandler(async (req, res) => {
    const extensions = await prisma.stayExtension.findMany({ where: { stayId: Number(req.params.id) }, orderBy: { createdAt: 'asc' } })
    res.json(extensions)
  }),
)

stayExtensionsRouter.post(
  '/:id/extend',
  requireRole('ADMIN', 'FRONT_DESK'),
  validate(extendSchema),
  asyncHandler(async (req, res) => {
    const stayId = Number(req.params.id)
    const stay = await prisma.stay.findUnique({ where: { id: stayId } })
    if (!stay) throw new NotFoundError('Stay')
    if (stay.status !== 'BOOKED' && stay.status !== 'CHECKED_IN') throw new BadRequestError('Only booked or active stays can be extended')

    const newPickup = new Date(req.body.newPickup)
    if (stay.expectedPickup && newPickup <= stay.expectedPickup) {
      throw new BadRequestError('The new pickup date must be after the current one')
    }

    const [extension] = await prisma.$transaction([
      prisma.stayExtension.create({
        data: {
          stayId,
          oldPickup: stay.expectedPickup ?? newPickup,
          newPickup,
          reason: req.body.reason,
          createdById: req.user!.id,
        },
      }),
      prisma.stay.update({ where: { id: stayId }, data: { expectedPickup: newPickup } }),
    ])
    res.status(201).json(extension)
  }),
)
