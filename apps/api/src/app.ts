import express from 'express'
import cookieParser from 'cookie-parser'
import { legacyRouter } from './legacy'
import { authenticate } from './middleware/requireRole'
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './modules/auth/auth.routes'
import { usersRouter } from './modules/users/users.routes'

export function createApp() {
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use(authenticate)

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  // modules
  app.use('/api/auth', authRouter)
  app.use('/api/users', usersRouter)

  // pre-2023 routes
  app.use('/api', legacyRouter)

  app.use(errorHandler)
  return app
}
