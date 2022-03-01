import express from 'express'
import { query, q } from '../db'
import { checkAuth, staffOnly } from '../middleware/checkAuth'

const router = express.Router()

router.get('/', checkAuth, staffOnly, (req: any, res) => {
  let sql = 'SELECT * FROM tbl_customer'
  const params: any[] = []
  if (req.query.q) {
    sql += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?'
    params.push('%' + req.query.q + '%', '%' + req.query.q + '%', '%' + req.query.q + '%')
  }
  sql += ' ORDER BY last_name, first_name'
  query(sql, params, (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    res.json(rows)
  })
})

router.get('/:id', checkAuth, staffOnly, async (req: any, res) => {
  try {
    const rows = await q('SELECT * FROM tbl_customer WHERE id = ?', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'not found' })
    const customer = rows[0]
    customer.monsters = await q('SELECT id, name, species, status FROM tbl_monster WHERE owner_id = ?', [req.params.id])
    res.json(customer)
  } catch (e) {
    res.status(500).send('oops')
  }
})

router.post('/', checkAuth, staffOnly, (req: any, res) => {
  const c = req.body
  query(
    'INSERT INTO tbl_customer (user_id, title, first_name, last_name, email, contact_pref, lair_address, notes) VALUES (?,?,?,?,?,?,?,?)',
    [c.user_id || null, c.title, c.first_name, c.last_name, c.email, c.contact_pref || 'raven', c.lair_address, c.notes],
    (err: any, result: any) => {
      if (err) return res.status(500).send('oops')
      res.json({ id: result.insertId })
    }
  )
})

router.put('/:id', checkAuth, staffOnly, (req: any, res) => {
  const c = req.body
  query(
    'UPDATE tbl_customer SET title=?, first_name=?, last_name=?, email=?, contact_pref=?, lair_address=?, notes=? WHERE id=?',
    [c.title, c.first_name, c.last_name, c.email, c.contact_pref, c.lair_address, c.notes, req.params.id],
    (err: any) => {
      if (err) return res.status(500).send('oops')
      res.json({ ok: true })
    }
  )
})

export default router
