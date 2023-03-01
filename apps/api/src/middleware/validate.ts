import type { RequestHandler } from 'express'
import type { ZodTypeAny } from 'zod'

type Part = 'body' | 'query' | 'params'

/** Validates and replaces req[part] with the parsed value. */
export function validate(schema: ZodTypeAny, part: Part = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[part])
    if (!result.success) return next(result.error)
    // query is a getter in some Express versions, so assign through Object.assign
    if (part === 'query') Object.assign(req.query, result.data)
    else req[part] = result.data
    next()
  }
}
