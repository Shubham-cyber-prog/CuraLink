import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const EXEMPT_PATHS = [
  '/api/auth/csrf-token',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Generate token on explicit request or if missing
  if (req.path === '/api/auth/csrf-token') {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('curalink_csrf', token, {
      httpOnly: false, // Must be readable by client JS to send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.status(200).json({ success: true, token });
    return;
  }

  // State-changing requests must have the token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (EXEMPT_PATHS.includes(req.path)) {
      return next();
    }

    const cookieToken = req.cookies?.curalink_csrf;
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      res.status(403).json({
        success: false,
        message: 'Invalid or missing CSRF token',
      });
      return;
    }
  }

  next();
}

