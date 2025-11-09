import { randomUUID } from 'node:crypto';

import { Request, Response, NextFunction } from 'express';

const HEADER_NAME = 'x-request-id';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incomingId = req.header(HEADER_NAME);
  const requestId = incomingId && incomingId.trim().length ? incomingId : randomUUID();

  req.id = requestId;
  res.setHeader(HEADER_NAME, requestId);

  next();
};
