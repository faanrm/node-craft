export class AppError extends Error {
  constructor(public message: string, public status: number = 500, public code: string = 'INTERNAL_ERROR') {
    super(message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}
