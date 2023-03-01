export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request', details?: unknown) {
    super(400, message, details)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Please log in') {
    super(401, message)
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'You are not allowed to do that') {
    super(403, message)
  }
}

export class NotFoundError extends HttpError {
  constructor(what = 'Resource') {
    super(404, `${what} not found`)
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message)
  }
}
