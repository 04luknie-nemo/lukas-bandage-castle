import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { assignSchema, lairSchema } from './lairs.schema'
import * as lairsService from './lairs.service'

export const lairsRouter = Router()

lairsRouter.use(requireRole('ADMIN', 'KEEPER', 'FRONT_DESK', 'VET'))

lairsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await lairsService.listLairs())
  }),
)

lairsRouter.get(
  '/unassigned',
  asyncHandler(async (_req, res) => {
    res.json(await lairsService.unassignedMonsters())
  }),
)

lairsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await lairsService.getLair(Number(req.params.id)))
  }),
)

lairsRouter.post(
  '/',
  requireRole('ADMIN'),
  validate(lairSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await lairsService.createLair(req.body))
  }),
)

lairsRouter.put(
  '/:id',
  requireRole('ADMIN', 'KEEPER'),
  validate(lairSchema),
  asyncHandler(async (req, res) => {
    res.json(await lairsService.updateLair(Number(req.params.id), req.body))
  }),
)

lairsRouter.post(
  '/:id/assignments',
  requireRole('ADMIN', 'KEEPER', 'FRONT_DESK'),
  validate(assignSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await lairsService.assignMonster(Number(req.params.id), req.body, req.user!.id))
  }),
)

lairsRouter.delete(
  '/:id/assignments/:assignmentId',
  requireRole('ADMIN', 'KEEPER', 'FRONT_DESK'),
  asyncHandler(async (req, res) => {
    await lairsService.releaseAssignment(Number(req.params.id), Number(req.params.assignmentId))
    res.status(204).end()
  }),
)
