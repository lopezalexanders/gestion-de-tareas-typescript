export class ValidationError extends Error {
  constructor(public readonly details: string[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
