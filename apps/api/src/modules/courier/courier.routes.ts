import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { assignSchema, createJobSchema, listQuerySchema, quoteSchema, statusSchema, type ListQuery } from './courier.schema'
import * as courier from './courier.service'
import { quote, tripMinutes } from './fees'

export const courierRouter = Router()

courierRouter.use(requireRole('ADMIN', 'FRONT_DESK', 'KEEPER'))

courierRouter.get(
  '/couriers',
  asyncHandler(async (_req, res) => {
    res.json(await courier.listCouriers())
  }),
)

courierRouter.post(
  '/quote',
  validate(quoteSchema),
  asyncHandler(async (req, res) => {
    const q = quote({ ...req.body, scheduledFor: new Date(req.body.scheduledFor) })
    res.json({ ...q, durationMin: tripMinutes(req.body.distanceLeagues) })
  }),
)

courierRouter.get(
  '/jobs',
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    res.json(await courier.listJobs(req.query as ListQuery))
  }),
)

courierRouter.get(
  '/route-sheet',
  asyncHandler(async (req, res) => {
    const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().slice(0, 10)
    res.json(await courier.routeSheet(date))
  }),
)

courierRouter.get(
  '/jobs/:id',
  asyncHandler(async (req, res) => {
    res.json(await courier.getJob(Number(req.params.id)))
  }),
)

courierRouter.post(
  '/jobs',
  validate(createJobSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await courier.createJob(req.body, req.user!.id))
  }),
)

courierRouter.post(
  '/jobs/:id/assign',
  validate(assignSchema),
  asyncHandler(async (req, res) => {
    res.json(await courier.assignCourier(Number(req.params.id), req.body.courierId))
  }),
)

courierRouter.post(
  '/jobs/:id/status',
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    res.json(await courier.setStatus(Number(req.params.id), req.body.status))
  }),
)
