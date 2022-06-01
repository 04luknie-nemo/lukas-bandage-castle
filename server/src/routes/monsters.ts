import express from 'express'
import { query } from '../db'
import { checkAuth, staffOnly } from '../middleware/checkAuth'
import { ageInYears } from '../lib/dates'

const router = express.Router()

router.get('/', checkAuth, (req: any, res) => {
  let sql = 'SELECT * FROM tbl_monster'
  if (req.query.search) {
    sql += " WHERE name LIKE '%" + req.query.search + "%' OR species LIKE '%" + req.query.search + "%'"
  }
  sql += ' ORDER BY name'
  query(sql, (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    res.json(rows)
  })
})

router.get('/:id', checkAuth, (req: any, res) => {
  query('SELECT * FROM tbl_monster WHERE id = ?', [req.params.id], (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    if (!rows[0]) return res.status(404).json({ error: 'no such monster' })
    const m = rows[0]
    m.age = ageInYears(m.birth_date)
    res.json(m)
  })
})

router.post('/', checkAuth, staffOnly, (req: any, res) => {
  const m = req.body
  query(
    'INSERT INTO tbl_monster (name, species, owner_id, birth_date, temperament, quirks, history, status) VALUES (?,?,?,?,?,?,?,?)',
    [m.name, m.species, m.owner_id, m.birth_date, m.temperament, m.quirks, m.history, m.status || 'IN_RESIDENCE'],
    (err: any, result: any) => {
      if (err) return res.status(500).send('oops')
      res.json({ id: result.insertId })
    }
  )
})

router.put('/:id', checkAuth, staffOnly, (req: any, res) => {
  const m = req.body
  query(
    'UPDATE tbl_monster SET name=?, species=?, owner_id=?, birth_date=?, temperament=?, quirks=?, history=?, status=? WHERE id=?',
    [m.name, m.species, m.owner_id, m.birth_date, m.temperament, m.quirks, m.history, m.status, req.params.id],
    (err: any) => {
      if (err) return res.status(500).send('oops')
      res.json({ ok: true })
    }
  )
})

router.delete('/:id', checkAuth, staffOnly, (req: any, res) => {
  query('DELETE FROM tbl_monster WHERE id = ?', [req.params.id], (err: any) => {
    if (err) return res.status(500).send('oops')
    res.json({ ok: true })
  })
})

export default router
