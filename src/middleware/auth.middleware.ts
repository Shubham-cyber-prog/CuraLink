import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Try to get token from cookie first, fallback to Authorization header for mobile app support
    let token = req.cookies?.curalink_access;
    
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const decodedPayload = verifyToken(token);

    req.user = {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof Error) {
      next(new UnauthorizedError(error.message));
    } else {
      next(new UnauthorizedError('Invalid authentication token'));
    }
  }
}
