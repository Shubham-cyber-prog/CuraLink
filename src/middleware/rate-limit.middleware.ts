import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

function createRateLimiter(windowMs: number, maxRequests: number, message: string) {
  const store: RateLimitStore = {};

  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (now > store[ip].resetTime) {
      store[ip].count = 1;
      store[ip].resetTime = now + windowMs;
      return next();
    }

    store[ip].count++;

    if (store[ip].count > maxRequests) {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((store[ip].resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

// Auth routes: 5 requests per 15 minutes
export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts, please try again later.'
);

// General API routes: 60 requests per minute
export const apiLimiter = createRateLimiter(
  60 * 1000,
  60,
  'Too many requests, please try again later.'
);

// Symptom checker (cost control): 10 requests per hour
export const symptomCheckerLimiter = createRateLimiter(
  60 * 60 * 1000,
  10,
  'AI symptom checker rate limit exceeded, please try again later.'
);
