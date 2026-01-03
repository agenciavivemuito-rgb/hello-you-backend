class ApiError extends Error {
  constructor(status, message) {
    super()
    this.status = status
    this.message = message
  }
}

class BadRequestError extends ApiError {
  constructor(message) {
    super(400, message)
  }
}

class UnauthorizedError extends ApiError {
  constructor(message) {
    super(401, message)
  }
}

class ForbiddenError extends ApiError {
  constructor(message) {
    super(403, message)
  }
}

class NotFoundError extends ApiError {
  constructor(message) {
    super(404, message)
  }
}

class ConflictError extends ApiError {
  constructor(message) {
    super(409, message)
  }
}

export default ApiError
export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
}
