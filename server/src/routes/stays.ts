import express from 'express'
import { query, q } from '../db'
import { checkAuth, staffOnly } from '../middleware/checkAuth'

const router = express.Router()

router.get('/', checkAuth, (req: any, res) => {
  query(
    'SELECT s.*, m.name as monster_name, c.first_name, c.last_name FROM tbl_stay s JOIN tbl_monster m ON m.id = s.monster_id JOIN tbl_customer c ON c.id = s.customer_id ORDER BY s.start_date DESC',
    (err: any, rows: any) => {
      if (err) return res.status(500).send('oops')
      res.json(rows)
    }
  )
})

router.post('/', checkAuth, staffOnly, (req: any, res) => {
  const s = req.body
  // TODO check monster not already here
  query(
    'INSERT INTO tbl_stay (monster_id, customer_id, reason, start_date, expected_pickup, daily_rate, notes) VALUES (?,?,?,?,?,?,?)',
    [s.monster_id, s.customer_id, s.reason, s.start_date, s.expected_pickup, s.daily_rate || 10, s.notes],
    (err: any, result: any) => {
      if (err) return res.status(500).send('oops')
      res.json({ id: result.insertId })
    }
  )
})

export default router
