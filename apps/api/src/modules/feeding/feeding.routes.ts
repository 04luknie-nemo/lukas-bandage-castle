import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import * as feedingService from './feeding.service'

export const feedingRouter = Router()

feedingRouter.use(requireRole('ADMIN', 'KEEPER', 'VET'))

const logSchema = z.object({
  monsterId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealTime: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().max(255).optional(),
})

feedingRouter.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const date = typeof req.query.date === 'string' ? req.query.date : undefined
    res.json(await feedingService.scheduleFor(date))
  }),
)

feedingRouter.post(
  '/logs',
  validate(logSchema),
  asyncHandler(async (req, res) => {
    const { monsterId, date, mealTime, note } = req.body
    res.status(201).json(await feedingService.markFed(monsterId, date, mealTime, req.user!.id, note))
  }),
)

feedingRouter.delete(
  '/logs',
  validate(logSchema),
  asyncHandler(async (req, res) => {
    const { monsterId, date, mealTime } = req.body
    await feedingService.unmarkFed(monsterId, date, mealTime)
    res.status(204).end()
  }),
)
