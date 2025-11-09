/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

import { logger } from '../observability/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const payload: Record<string, unknown> = {
    message: err.message || 'Internal Server Error',
  };

  if (err.code === 'INVALID_TRANSITION') {
    payload.code = err.code;
  }

  if (err.details) {
    payload.details = err.details;
  }

  logger.error({ err, requestId: req.id }, 'Request failed');

  res.status(status).json(payload);
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new createHttpError.NotFound('Resource not found'));
};
