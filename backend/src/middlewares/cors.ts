import type { NextFunction, Request, Response } from 'express';

type OriginValue = string | RegExp | (string | RegExp)[];

type CorsOptions = {
  origin?: OriginValue;
  credentials?: boolean;
};

const DEFAULT_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

const isOriginAllowed = (origin: string, allowed: OriginValue): boolean => {
  if (typeof allowed === 'string') {
    return allowed === '*' || allowed === origin;
  }
  if (allowed instanceof RegExp) {
    return allowed.test(origin);
  }
  if (Array.isArray(allowed)) {
    return allowed.some((entry) => isOriginAllowed(origin, entry));
  }
  return false;
};

const resolveOrigin = (requestOrigin: string | undefined, allowed?: OriginValue) => {
  if (!requestOrigin) {
    return undefined;
  }
  if (!allowed) {
    return requestOrigin;
  }
  return isOriginAllowed(requestOrigin, allowed) ? requestOrigin : undefined;
};

const setHeader = (res: Response, name: string, value: string) => {
  if (value) {
    res.set(name, value);
  }
};

export const createCorsMiddleware = (options: CorsOptions) => {
  const { origin, credentials = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const requestOrigin = req.headers.origin;
    const matchedOrigin = resolveOrigin(requestOrigin, origin);

    if (matchedOrigin) {
      setHeader(res, 'Access-Control-Allow-Origin', matchedOrigin);
      setHeader(res, 'Vary', 'Origin');
      if (credentials) {
        setHeader(res, 'Access-Control-Allow-Credentials', 'true');
      }
    }

    if (req.method.toUpperCase() === 'OPTIONS') {
      setHeader(res, 'Access-Control-Allow-Methods', DEFAULT_METHODS);
      const requestHeaders = req.headers['access-control-request-headers'];
      if (typeof requestHeaders === 'string') {
        setHeader(res, 'Access-Control-Allow-Headers', requestHeaders);
      }
      res.status(204).end();
      return;
    }

    next();
  };
};
