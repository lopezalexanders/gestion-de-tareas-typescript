declare module 'http-errors' {
  export interface HttpError extends Error {
    status?: number;
    statusCode?: number;
    expose?: boolean;
    [key: string]: unknown;
  }

  export interface HttpErrorConstructor {
    (status: number, message?: string, properties?: Record<string, unknown>): HttpError;
    (message: string, properties?: Record<string, unknown>): HttpError;
  }

  const createHttpError: HttpErrorConstructor;

  export default createHttpError;
}
