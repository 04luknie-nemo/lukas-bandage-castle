import express from 'express'
import { query } from '../db'
import { checkAuth, staffOnly } from '../middleware/checkAuth'

const router = express.Router()

router.get('/', checkAuth, (req: any, res) => {
  query('SELECT * FROM tbl_monster ORDER BY name', (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    res.json(rows)
  })
})

router.get('/:id', checkAuth, (req: any, res) => {
  query('SELECT * FROM tbl_monster WHERE id = ?', [req.params.id], (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    if (!rows[0]) return res.status(404).json({ error: 'no such monster' })
    res.json(rows[0])
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
