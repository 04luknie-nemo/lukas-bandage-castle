import { Router } from 'express'
import { STAFF_ROLES } from '@bandage/shared'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { decideSchema, leaveSchema, shiftSchema, swapSchema, weekQuerySchema } from './rota.schema'
import * as rota from './rota.service'
import * as swaps from './swaps'

export const rotaRouter = Router()

// everyone who works here can see the rota; only admins change it
rotaRouter.use(requireRole(...STAFF_ROLES))
const admin = requireRole('ADMIN')

rotaRouter.get(
  '/week',
  validate(weekQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    res.json(await rota.week(req.query.start as string | undefined))
  }),
)

rotaRouter.get(
  '/staff',
  asyncHandler(async (_req, res) => {
    res.json(await rota.staff())
  }),
)

rotaRouter.get(
  '/mine',
  asyncHandler(async (req, res) => {
    res.json(await rota.mine(req.user!.id))
  }),
)

rotaRouter.post(
  '/shifts',
  admin,
  validate(shiftSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await rota.createShift(req.body, req.user!.id))
  }),
)

rotaRouter.put(
  '/shifts/:id',
  admin,
  validate(shiftSchema),
  asyncHandler(async (req, res) => {
    res.json(await rota.updateShift(Number(req.params.id), req.body, req.user!.id))
  }),
)

rotaRouter.delete(
  '/shifts/:id',
  admin,
  asyncHandler(async (req, res) => {
    await rota.deleteShift(Number(req.params.id), req.user!.id)
    res.status(204).end()
  }),
)

rotaRouter.post(
  '/time-off',
  validate(leaveSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await rota.requestLeave(req.user!.id, req.body))
  }),
)

rotaRouter.get(
  '/time-off/pending',
  admin,
  asyncHandler(async (_req, res) => {
    res.json(await rota.pendingLeave())
  }),
)

rotaRouter.post(
  '/time-off/:id/decide',
  admin,
  validate(decideSchema),
  asyncHandler(async (req, res) => {
    res.json(await rota.decideLeave(Number(req.params.id), req.body.status, req.user!.id))
  }),
)

// --- swaps ---------------------------------------------------------------

rotaRouter.get(
  '/swaps',
  asyncHandler(async (req, res) => {
    res.json(await swaps.swapsFor(req.user!.id))
  }),
)

rotaRouter.post(
  '/shifts/:id/swap',
  validate(swapSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await swaps.offerSwap(Number(req.params.id), req.user!.id, req.body.toUserId, req.body.message))
  }),
)

rotaRouter.post(
  '/swaps/:id/:action(accept|decline|cancel)',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const userId = req.user!.id
    if (req.params.action === 'accept') return res.json(await swaps.acceptSwap(id, userId))
    if (req.params.action === 'decline') return res.json(await swaps.declineSwap(id, userId))
    res.json(await swaps.cancelSwap(id, userId))
  }),
)
