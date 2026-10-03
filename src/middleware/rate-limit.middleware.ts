import rateLimit from 'express-rate-limit';

/**
 * Common skip predicate:
 * Skips rate limiting only during unit tests without x-test-rate-limit header,
 * or during authorized load testing with verified LOAD_TEST_KEY.
 */
function shouldSkip(req: any): boolean {
  if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
    return true;
  }
  if (process.env.LOAD_TEST_KEY && req.headers['x-load-test-key'] === process.env.LOAD_TEST_KEY) {
    return true;
  }
  return false;
}

/**
 * Strict rate limiter for Authentication endpoints (login, register, forgot-password, OTP, reset-password).
 * Default MemoryStore used (5 requests per 15 minutes).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});

/**
 * Strict rate limiter for AI and compute-intensive endpoints (/api/symptoms, /api/risk).
 * Default MemoryStore used (10 requests per 15 minutes).
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Too many AI clinical requests, please try again later.',
  },
});

// Alias for backwards compatibility if referenced
export const symptomCheckerLimiter = aiLimiter;

/**
 * General API rate limiter across all /api/ endpoints.
 * Default MemoryStore used (100 requests per minute).
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

