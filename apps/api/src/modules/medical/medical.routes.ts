import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { prescriptionSchema, recordSchema, treatmentSchema, treatmentStatusSchema } from './medical.schema'
import * as medicalService from './medical.service'

export const medicalRouter = Router()

medicalRouter.get(
  '/patients',
  requireRole('VET', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    res.json(await medicalService.listPatients())
  }),
)

// keepers need to see what a monster is being treated for
medicalRouter.get(
  '/monsters/:monsterId/records',
  requireRole('VET', 'ADMIN', 'KEEPER'),
  asyncHandler(async (req, res) => {
    res.json(await medicalService.recordsForMonster(Number(req.params.monsterId)))
  }),
)

medicalRouter.post(
  '/monsters/:monsterId/records',
  requireRole('VET'),
  validate(recordSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await medicalService.createRecord(Number(req.params.monsterId), req.user!.id, req.body))
  }),
)

medicalRouter.post(
  '/records/:recordId/treatments',
  requireRole('VET'),
  validate(treatmentSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await medicalService.addTreatment(Number(req.params.recordId), req.body))
  }),
)

medicalRouter.post(
  '/records/:recordId/prescriptions',
  requireRole('VET'),
  validate(prescriptionSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await medicalService.addPrescription(Number(req.params.recordId), req.body))
  }),
)

medicalRouter.get(
  '/prescriptions/active',
  requireRole('VET', 'KEEPER', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    res.json(await medicalService.activePrescriptions())
  }),
)

medicalRouter.patch(
  '/treatments/:id',
  requireRole('VET'),
  validate(treatmentStatusSchema),
  asyncHandler(async (req, res) => {
    res.json(await medicalService.setTreatmentStatus(Number(req.params.id), req.body.status))
  }),
)
