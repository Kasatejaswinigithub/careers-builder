export class AppError extends Error {
  constructor(public message: string, public statusCode = 500, public code?: string) {
    super(message);
    this.name = 'AppError';
  }
}
export class NotFoundError    extends AppError { constructor(r = 'Resource') { super(r + ' not found', 404, 'NOT_FOUND'); } }
export class UnauthorizedError extends AppError { constructor(m = 'Unauthorized') { super(m, 401, 'UNAUTHORIZED'); } }
export class ForbiddenError    extends AppError { constructor(m = 'Forbidden')    { super(m, 403, 'FORBIDDEN'); } }
export class ValidationError   extends AppError { constructor(m: string)          { super(m, 400, 'VALIDATION_ERROR'); } }
export class ConflictError     extends AppError { constructor(m: string)          { super(m, 409, 'CONFLICT'); } }
