import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { intakeSchema } from './intake.schema'
import * as intakeService from './intake.service'

export const intakeRouter = Router()

intakeRouter.use(requireRole('ADMIN', 'FRONT_DESK', 'KEEPER'))

intakeRouter.get(
  '/pending',
  asyncHandler(async (_req, res) => {
    res.json(await intakeService.pendingArrivals())
  }),
)

intakeRouter.get(
  '/:stayId',
  asyncHandler(async (req, res) => {
    res.json(await intakeService.getIntake(Number(req.params.stayId)))
  }),
)

intakeRouter.post(
  '/',
  validate(intakeSchema),
  asyncHandler(async (req, res) => {
    const intake = await intakeService.createIntake(req.body, req.user!.id)
    res.status(201).json(intake)
  }),
)
