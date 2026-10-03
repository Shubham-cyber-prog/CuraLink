import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const reqId = req.id || (req.headers['x-request-id'] as string) || 'unknown';
  const isProd = env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';

  // Handle Zod validation errors
  if (err instanceof ZodError || err.name === 'ZodError') {
    const zodErr = err as ZodError;
    const issues = zodErr.issues || [];
    const formattedErrors = issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');

    res.status(400).json({
      success: false,
      message: `Validation Error: ${formattedErrors}`,
      errors: issues,
      requestId: reqId,
    });
    return;
  }

  // Handle JSON syntax error from express.json() / body-parser
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body',
      requestId: reqId,
    });
    return;
  }

  // Handle known client/domain AppErrors (e.g. 400, 401, 403, 404, 409)
  if (err instanceof AppError && err.statusCode < 500) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      requestId: reqId,
    });
    return;
  }

  // Log unhandled server errors with Request ID, method, and URL
  console.error(`[Unhandled Server Error] [RequestID: ${reqId}] [${req.method} ${req.originalUrl || req.url}]:`, err);

  // Unhandled / server errors — report to Sentry with request context
  Sentry.withScope((scope) => {
    scope.setTag('requestId', reqId);
    scope.setExtra('url', req.originalUrl || req.url);
    scope.setExtra('method', req.method);
    Sentry.captureException(err);
  });

  // Production response: NEVER leak stack traces or internal database/runtime messages
  res.status(500).json({
    success: false,
    message: isProd ? 'Internal server error' : err.message,
    requestId: reqId,
    ...(isProd ? {} : { stack: err.stack }),
  });
}
