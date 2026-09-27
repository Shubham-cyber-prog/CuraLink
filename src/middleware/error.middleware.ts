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
  if (err instanceof ZodError || err.name === 'ZodError') {
    const zodErr = err as ZodError;
    const issues = zodErr.issues || [];
    const formattedErrors = issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');

    res.status(400).json({
      success: false,
      message: `Validation Error: ${formattedErrors}`,
      errors: issues,
    });
    return;
  }

  // Handle JSON syntax error from express.json() / body-parser
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body',
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unhandled / server errors — report to Sentry
  Sentry.captureException(err);
  console.error('Unhandled Server Error:', err);

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
