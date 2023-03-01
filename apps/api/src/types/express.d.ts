import type { SessionUser } from '@bandage/shared'

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate`. */
      user?: SessionUser
    }
  }
}

export {}
