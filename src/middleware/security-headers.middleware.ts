import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://gsi.gstatic.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://accounts.google.com; connect-src 'self' http://localhost:5000 https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://nominatim.openstreetmap.org;"
  );
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  // Strict Transport Security (HSTS) - only in production
  if (env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  next();
}
