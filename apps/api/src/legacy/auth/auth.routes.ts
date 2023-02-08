import express from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
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

router.post('/forgot', (req, res) => {
  const email = req.body.email
  query('SELECT id FROM tbl_user WHERE email = ?', [email], (err: any, rows: any) => {
    // always say ok so people cant fish for emails
    if (err || !rows[0]) return res.json({ ok: true })
    const token = crypto.randomBytes(24).toString('hex')
    query('INSERT INTO tbl_password_reset (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))', [rows[0].id, token], () => {
      // TODO actually send email
      console.log('PASSWORD RESET for ' + email + ': http://localhost:5173/reset-password?token=' + token)
      res.json({ ok: true })
    })
  })
})

router.post('/reset', (req, res) => {
  const { token, password } = req.body
  if (!token || !password || password.length < 6) return res.status(400).json({ error: 'password too short' })
  query('SELECT * FROM tbl_password_reset WHERE token = ? AND expires_at > NOW()', [token], async (err: any, rows: any) => {
    if (err) return res.status(500).send('oops')
    if (!rows[0]) return res.status(400).json({ error: 'link expired' })
    const hash = await bcrypt.hash(password, 10)
    query('UPDATE tbl_user SET password_hash = ? WHERE id = ?', [hash, rows[0].user_id], () => {
      query('DELETE FROM tbl_password_reset WHERE user_id = ?', [rows[0].user_id], () => res.json({ ok: true }))
    })
  })
})

export default router
