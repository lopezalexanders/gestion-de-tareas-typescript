import { Request, Response, NextFunction } from 'express';

export const checkAuth = (req: Request, _res: Response, next: NextFunction) => {
  req.user = { id: 'demo-user', scopes: ['tasks:read', 'tasks:write'] };
  next();
};

export const checkPermissions = (requiredScope: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.scopes?.includes(requiredScope)) {
      const error = new Error('Forbidden');
      (error as any).status = 403;
      throw error;
    }
    next();
  };
};
