import express from 'express'
import { query } from '../db'
import { checkAuth } from '../middleware/checkAuth'
import { sendRaven } from './ravenPost'

const router = express.Router()

router.get('/', checkAuth, (req: any, res) => {
  if (req.user.role !== 'STAFF' && req.user.role !== 'ADMIN') return res.status(403).send('no')
  query(
    'SELECT r.*, c.first_name, c.last_name FROM tbl_raven r JOIN tbl_customer c ON c.id = r.customer_id ORDER BY r.created_at DESC LIMIT 200',
    (err: any, rows: any) => {
      if (err) return res.status(500).send('oops')
      res.json(rows)
    }
  )
})

router.post('/', checkAuth, (req: any, res) => {
  if (req.user.role !== 'STAFF' && req.user.role !== 'ADMIN') return res.status(403).send('no')
  sendRaven(req.body.customer_id, req.body.subject, req.body.body, (err: any, id: any) => {
    if (err) return res.status(500).send('oops')
    res.json({ id })
  })
})

router.post('/:id/resend', checkAuth, (req: any, res) => {
  if (req.user.role !== 'STAFF') return res.status(403).send('no')
  query("UPDATE tbl_raven SET status = 'QUEUED' WHERE id = ?", [req.params.id], (err: any) => {
    if (err) return res.status(500).send('oops')
    res.json({ ok: true })
  })
})

export default router
