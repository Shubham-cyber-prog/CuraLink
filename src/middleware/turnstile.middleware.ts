import { Request, Response, NextFunction } from 'express';
import { turnstileService } from '../services/turnstile.service';

/**
 * Express middleware to enforce Cloudflare Turnstile bot verification
 * on sensitive authentication routes (register, login, forgot-password).
 */
export async function verifyTurnstile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Skip Turnstile verification in development mode
  if (process.env.NODE_ENV === 'development') {
    (req as any).turnstileVerified = true;
    return next();
  }

  const token =
    req.body?.turnstileToken ||
    req.body?.['cf-turnstile-response'] ||
    req.headers['x-turnstile-token'];

  if (!token || typeof token !== 'string' || token.trim() === '') {
    res.status(400).json({
      success: false,
      message: 'Bot verification failed: Turnstile token is required. Please complete verification.',
    });
    return;
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress;

  const result = await turnstileService.verifyToken(token, clientIp);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Bot verification failed, please try again.',
      errorCodes: result.errorCodes,
    });
    return;
  }

  // Verification passed
  (req as any).turnstileVerified = true;
  next();
}
