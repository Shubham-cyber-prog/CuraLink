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

    // Extra layer of security: if endpoint requires Role.ADMIN, verify email against ADMIN_EMAILS if configured
    if (allowedRoles.includes(Role.ADMIN) && req.user.role === Role.ADMIN) {
      const adminEmailsEnv = process.env.ADMIN_EMAILS;
      if (adminEmailsEnv) {
        const allowedEmails = adminEmailsEnv
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (allowedEmails.length > 0 && !allowedEmails.includes(req.user.email?.toLowerCase())) {
          return next(new ForbiddenError('Forbidden: Admin email not in authorized list'));
        }
      }
    }

    next();
  };
}
