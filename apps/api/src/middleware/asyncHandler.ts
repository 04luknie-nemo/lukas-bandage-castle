import type { NextFunction, Request, RequestHandler, Response } from 'express'

/** Lets async route handlers throw; the error ends up in errorHandler. */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as T, res, next).catch(next)
  }
}
