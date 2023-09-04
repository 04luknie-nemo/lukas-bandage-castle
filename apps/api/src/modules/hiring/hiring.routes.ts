import { Router } from 'express'
import { hasRole } from '@bandage/shared'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { listingSchema, listingStatusSchema } from './hiring.schema'
import * as hiringService from './hiring.service'

export const hiringRouter = Router()

const STAFF = ['ADMIN', 'FRONT_DESK'] as const

hiringRouter.get(
  '/listings',
  requireRole('OVERLORD', 'ADMIN', 'FRONT_DESK', 'KEEPER', 'VET'),
  asyncHandler(async (_req, res) => {
    res.json(await hiringService.publicListings())
  }),
)

hiringRouter.get(
  '/listings/all',
  requireRole(...STAFF),
  asyncHandler(async (_req, res) => {
    res.json(await hiringService.allListings())
  }),
)

hiringRouter.get(
  '/listings/:id',
  requireRole('OVERLORD', 'ADMIN', 'FRONT_DESK', 'KEEPER', 'VET'),
  asyncHandler(async (req, res) => {
    res.json(await hiringService.getListing(Number(req.params.id), hasRole(req.user, ...STAFF)))
  }),
)

hiringRouter.post(
  '/listings',
  requireRole(...STAFF),
  validate(listingSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await hiringService.createListing(req.body, req.user!.id))
  }),
)

hiringRouter.patch(
  '/listings/:id/status',
  requireRole(...STAFF),
  validate(listingStatusSchema),
  asyncHandler(async (req, res) => {
    res.json(await hiringService.setListingStatus(Number(req.params.id), req.body.status))
  }),
)
