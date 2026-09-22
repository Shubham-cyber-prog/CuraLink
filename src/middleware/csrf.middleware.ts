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
  '/api/symptom-checker',
  '/api/symptom-checker/analyze',
  '/api/risk/predict',
  '/api/risk/diabetes',
  '/api/risk/heart',
  '/api/risk/urgency',
];

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Generate or return token on explicit request
  if (req.path === '/api/auth/csrf-token') {
    const token = req.cookies?.curalink_csrf || crypto.randomBytes(32).toString('hex');
    res.cookie('curalink_csrf', token, {
      httpOnly: false, // Must be readable by client JS to send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.status(200).json({ success: true, token });
    return;
  }

  // Ensure CSRF cookie is set on safe requests (GET, HEAD, OPTIONS) if missing
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.cookies?.curalink_csrf) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie('curalink_csrf', token, {
        httpOnly: false, // Must be readable by client JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  // State-changing requests must have the token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (EXEMPT_PATHS.includes(req.path)) {
      return next();
    }

    // Requests authenticated with Bearer tokens or from mobile clients are immune to CSRF
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return next();
    }

    if (req.headers['x-client-platform'] === 'mobile') {
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

