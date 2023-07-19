import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { movementSchema, supplySchema } from './supplies.schema'
import * as suppliesService from './supplies.service'

export const suppliesRouter = Router()

suppliesRouter.use(requireRole('ADMIN', 'KEEPER', 'VET'))

suppliesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined
    res.json(await suppliesService.listSupplies(category))
  }),
)

suppliesRouter.get(
  '/low',
  asyncHandler(async (_req, res) => {
    res.json(await suppliesService.lowStock())
  }),
)

suppliesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await suppliesService.getSupply(Number(req.params.id)))
  }),
)

suppliesRouter.post(
  '/',
  requireRole('ADMIN', 'KEEPER'),
  validate(supplySchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await suppliesService.createSupply(req.body))
  }),
)

suppliesRouter.patch(
  '/:id',
  requireRole('ADMIN', 'KEEPER'),
  validate(supplySchema.partial()),
  asyncHandler(async (req, res) => {
    res.json(await suppliesService.updateSupply(Number(req.params.id), req.body))
  }),
)

suppliesRouter.post(
  '/:id/movements',
  validate(movementSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await suppliesService.recordMovement(Number(req.params.id), req.body, req.user!.id))
  }),
)
