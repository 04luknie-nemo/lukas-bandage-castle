import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireRole } from '../../middleware/requireRole'
import { validate } from '../../middleware/validate'
import { createUserSchema, updateUserSchema } from './users.schema'
import * as usersService from './users.service'

export const usersRouter = Router()

usersRouter.use(requireRole('ADMIN'))

usersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    res.json(await usersService.listUsers(search))
  }),
)

usersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await usersService.getUser(Number(req.params.id)))
  }),
)

usersRouter.post(
  '/',
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await usersService.createUser(req.body))
  }),
)

usersRouter.patch(
  '/:id',
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    res.json(await usersService.updateUser(Number(req.params.id), req.body, req.user!.id))
  }),
)
