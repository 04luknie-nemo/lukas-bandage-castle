import express from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db'
import { checkAuth, signToken } from '../middleware/checkAuth'

const router = express.Router()

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password pls' })

  query('SELECT * FROM tbl_user WHERE email = ?', [email], (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'wrong email or password' })
    bcrypt.compare(password, user.password_hash).then((ok) => {
      if (!ok) return res.status(401).json({ error: 'wrong email or password' })
      const token = signToken(user)
      res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.display_name } })
    })
  })
})

router.get('/me', checkAuth, (req: any, res) => {
  query('SELECT id, email, role, display_name FROM tbl_user WHERE id = ?', [req.user.id], (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    if (!rows.length) return res.status(404).json({ error: 'gone' })
    res.json({ id: rows[0].id, email: rows[0].email, role: rows[0].role, name: rows[0].display_name })
  })
})

export default router
