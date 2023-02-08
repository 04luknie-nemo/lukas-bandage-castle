import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function signToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' })
}

export function checkAuth(req: any, res: any, next: any) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'not logged in' })
  const token = header.replace('Bearer ', '')
  try {
    const decoded: any = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  } catch (e) {
    return res.status(401).json({ error: 'bad token' })
  }
}

export function staffOnly(req: any, res: any, next: any) {
  if (req.user.role === 'STAFF' || req.user.role === 'ADMIN') return next()
  return res.status(403).json({ error: 'staff only' })
}
