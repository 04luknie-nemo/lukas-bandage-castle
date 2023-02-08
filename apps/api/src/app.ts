import express from 'express'
import { legacyRouter } from './legacy'

export function createApp() {
  const app = express()
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api', legacyRouter)

  return app
}
