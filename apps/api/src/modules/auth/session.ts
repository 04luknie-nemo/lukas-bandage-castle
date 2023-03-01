import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import type { Role, SessionUser } from '@bandage/shared'
import { prisma } from '../../db/prisma'
import { config } from '../../config'

type TokenPayload = { sub: number }

export function issueSession(res: Response, userId: number) {
  const token = jwt.sign({ sub: userId } satisfies TokenPayload, config.jwtSecret, { expiresIn: `${config.sessionDays}d` })
  res.cookie(config.sessionCookie, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
  })
}

export function clearSession(res: Response) {
  res.clearCookie(config.sessionCookie)
}

export function readToken(token: string | undefined): number | null {
  if (!token) return null
  try {
    const payload = jwt.verify(token, config.jwtSecret) as unknown as TokenPayload
    return typeof payload.sub === 'number' ? payload.sub : null
  } catch {
    return null
  }
}

/** Loads everything we keep on req.user. Returns null if the user is gone. */
export async function loadSessionUser(userId: number): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true, customer: { select: { id: true } } },
  })
  if (!user) return null
  const roles = user.roles.length ? user.roles.map((r) => r.role as Role) : [user.role as Role]
  return {
    id: user.id,
    email: user.email,
    name: user.displayName,
    roles,
    customerId: user.customer?.id ?? null,
  }
}
