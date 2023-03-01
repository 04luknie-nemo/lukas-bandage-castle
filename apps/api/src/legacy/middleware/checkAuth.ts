// Legacy auth middleware. New code: use authenticate + requireRole from src/middleware/requireRole.ts
import { isStaff } from '@bandage/shared'

// Since 2023-03 the session is a cookie and `authenticate` (run for every
// request in app.ts) has already loaded req.user. This just keeps the old
// shape that legacy routes expect: req.user.role.
export function checkAuth(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: 'not logged in' })
  if (!req.user.role) req.user.role = req.user.roles.includes('ADMIN') ? 'ADMIN' : req.user.roles[0]
  next()
}

export function staffOnly(req: any, res: any, next: any) {
  if (isStaff(req.user)) return next()
  return res.status(403).json({ error: 'staff only' })
}
