import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { auditService, AuditAction } from '../services/audit.service';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { profileSchema } from '../validators/profile.validator';
import { UnauthorizedError } from '../utils/errors';
import { setAuthCookies, clearAuthCookies } from '../utils/cookie';
import { z } from 'zod';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = registerSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.register(validatedInput);

      setAuthCookies(res, accessToken, refreshToken);
      
      await auditService.logAction(AuditAction.REGISTER, user.id, 'User', user.id, req.ip, req.headers['user-agent']);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user, token: accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      
      try {
        const { user, accessToken, refreshToken } = await authService.login(validatedInput);
        
        setAuthCookies(res, accessToken, refreshToken);
        await auditService.logAction(AuditAction.LOGIN, user.id, 'User', user.id, req.ip, req.headers['user-agent']);

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: { user, token: accessToken },
        });
      } catch (authError) {
        // Log failed login attempt
        await auditService.logAction(AuditAction.LOGIN_FAILED, undefined, undefined, undefined, req.ip, req.headers['user-agent'], { email: validatedInput.email });
        throw authError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token || typeof token !== "string") {
        throw new UnauthorizedError("Google access token is required");
      }

      const { user, accessToken, refreshToken } = await authService.googleLogin(token);
      
      setAuthCookies(res, accessToken, refreshToken);
      await auditService.logAction(AuditAction.LOGIN, user.id, 'User', user.id, req.ip, req.headers['user-agent'], { method: 'google' });

      res.status(200).json({
        success: true,
        message: 'Google Login successful',
        data: { user, token: accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  googleMobileLogin(req: Request, res: Response): void {
    const clientId = process.env.GOOGLE_CLIENT_ID || '498397902593-9h36l23od7sngoejesi3h84m7enrhm0c.apps.googleusercontent.com';
    const host = req.headers.host || 'localhost:5000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
    const callbackUrl = process.env.GOOGLE_OAUTH_CALLBACK_URL || defaultCallback;

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid profile email')}`;

    res.redirect(googleAuthUrl);
  }

  async googleMobileCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.query.code as string;
      const errorParam = req.query.error as string;

      if (errorParam || !code) {
        res.redirect(`curalink://oauthredirect?error=${encodeURIComponent(errorParam || 'Google login cancelled')}`);
        return;
      }

      const host = req.headers.host || 'localhost:5000';
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
      const callbackUrl = process.env.GOOGLE_OAUTH_CALLBACK_URL || defaultCallback;

      const { user, accessToken, refreshToken } = await authService.googleLoginWithCode(code, callbackUrl);

      setAuthCookies(res, accessToken, refreshToken);
      await auditService.logAction(AuditAction.LOGIN, user.id, 'User', user.id, req.ip, req.headers['user-agent'], { method: 'google_mobile' });

      const redirectUrl = `curalink://oauthredirect?token=${encodeURIComponent(accessToken)}&user=${encodeURIComponent(JSON.stringify(user))}`;
      res.redirect(redirectUrl);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Google OAuth failed';
      res.redirect(`curalink://oauthredirect?error=${encodeURIComponent(msg)}`);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.curalink_refresh;
      
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token missing');
      }

      const tokens = await authService.refreshTokens(refreshToken);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
      });
    } catch (error) {
      // Clear cookies if refresh fails (likely expired or revoked)
      clearAuthCookies(res);
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await authService.getUserById(req.user.id);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = forgotPasswordSchema.parse(req.body);
      const token = await authService.forgotPassword(validatedInput.email);

      res.status(200).json({
        success: true,
        message: 'If that email address is registered, a password reset link has been sent.',
        ...(token && process.env.NODE_ENV !== 'production' ? { data: { token } } : {}) // Only send token in dev mode
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(validatedInput.token, validatedInput.password);

      // We can't log the user ID easily here without decoding the token again, 
      // but it's a security best practice to log password resets
      await auditService.logAction(AuditAction.PASSWORD_RESET, undefined, undefined, undefined, req.ip, req.headers['user-agent']);

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        const refreshToken = req.cookies?.curalink_refresh;
        await authService.logout(req.user.id, refreshToken);
        await auditService.logAction(AuditAction.LOGOUT, req.user.id, 'User', req.user.id, req.ip, req.headers['user-agent']);
      }
      
      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const validatedInput = profileSchema.parse(req.body);

      const updatedUser = await authService.updateProfile(req.user.id, validatedInput.name, validatedInput.email);

      await auditService.logAction(AuditAction.PROFILE_UPDATE, req.user.id, 'User', req.user.id, req.ip, req.headers['user-agent']);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
