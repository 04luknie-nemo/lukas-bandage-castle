import type { RequestHandler } from 'express'
import { hasRole, type Role } from '@bandage/shared'
import { config } from '../config'
import { ForbiddenError, UnauthorizedError } from '../errors/httpErrors'
import { loadSessionUser, readToken } from '../modules/auth/session'

/** Reads the session cookie and sets req.user. Never rejects on its own. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const userId = readToken(req.cookies?.[config.sessionCookie])
  if (!userId) return next()
  loadSessionUser(userId)
    .then((user) => {
      if (user) req.user = user
      next()
    })
    .catch(next)
}

/** Requires a logged-in user. */
export const requireUser: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError())
  next()
}

/**
 * Requires a logged-in user holding at least one of `roles`.
 * ADMIN is not added automatically: list it if admins should get in.
 */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError())
    if (!hasRole(req.user, ...roles)) return next(new ForbiddenError())
    next()
  }
}
