import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware that assigns a unique request ID to each incoming HTTP request.
 * Propagates existing X-Request-Id header if present, or generates a new UUID v4.
 * Sets the X-Request-Id header on the response.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && incoming.trim() ? incoming.trim() : crypto.randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
