import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/role';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Forbidden: Insufficient permissions'));
    }

    next();
  };
}
