import { Router } from 'express'
import { hasRole } from '@bandage/shared'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { listingSchema, listingStatusSchema } from './hiring.schema'
import * as hiringService from './hiring.service'
import * as applicationsService from './applications.service'
import * as contractsService from './contracts.service'
import { z } from 'zod'

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
  '/listings/soon',
  requireRole('OVERLORD', 'ADMIN', 'FRONT_DESK', 'KEEPER', 'VET'),
  asyncHandler(async (_req, res) => {
    res.json(await hiringService.availableSoon())
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

// --- applications (#41) ---

const applySchema = z.object({
  message: z.string().trim().min(20, 'Tell us a bit more about yourself and your lair').max(5000),
  lairDescription: z.string().max(5000).optional(),
  references: z
    .array(
      z.object({
        refereeName: z.string().trim().min(2).max(191),
        relationship: z.string().trim().min(2).max(191),
        text: z.string().trim().min(10).max(2000),
      }),
    )
    .max(3)
    .default([]),
})

hiringRouter.post(
  '/listings/:id/applications',
  requireRole('OVERLORD'),
  validate(applySchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await applicationsService.apply(Number(req.params.id), req.user!.customerId, req.body))
  }),
)

hiringRouter.get(
  '/applications',
  requireRole('OVERLORD', ...STAFF),
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    // overlords only see their own
    const customerId = hasRole(req.user, ...STAFF) ? undefined : (req.user!.customerId ?? -1)
    res.json(await applicationsService.listApplications({ customerId, status }))
  }),
)

hiringRouter.post(
  '/applications/:id/withdraw',
  requireRole('OVERLORD'),
  asyncHandler(async (req, res) => {
    res.json(await applicationsService.withdraw(Number(req.params.id), req.user!.customerId))
  }),
)

hiringRouter.post(
  '/applications/:id/decision',
  requireRole(...STAFF),
  validate(z.object({ decision: z.enum(['ACCEPTED', 'REJECTED']) })),
  asyncHandler(async (req, res) => {
    res.json(await applicationsService.decide(Number(req.params.id), req.body.decision, req.user!.id))
  }),
)

// --- contracts ---

hiringRouter.get(
  '/contracts',
  requireRole('OVERLORD', ...STAFF),
  asyncHandler(async (req, res) => {
    const customerId = hasRole(req.user, ...STAFF) ? undefined : (req.user!.customerId ?? -1)
    res.json(await contractsService.listContracts(customerId))
  }),
)

hiringRouter.post(
  '/contracts/:id/sign',
  requireRole('OVERLORD'),
  asyncHandler(async (req, res) => {
    res.json(await contractsService.signContract(Number(req.params.id), req.user!.customerId))
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
