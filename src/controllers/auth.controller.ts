import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { auditService, AuditAction } from '../services/audit.service';
import { registerSchema, loginSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { profileSchema } from '../validators/profile.validator';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../utils/errors';
import { setAuthCookies, clearAuthCookies } from '../utils/cookie';
import { notificationService } from '../services/notification.service';
import { Role } from '../types/role';
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
        data: { user, token: accessToken, accessToken, refreshToken },
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
          data: { user, token: accessToken, accessToken, refreshToken },
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
      const { token, role } = req.body;
      if (!token || typeof token !== "string") {
        throw new UnauthorizedError("Google access token is required");
      }

      const requestedRole = (typeof role === 'string' && role.toUpperCase() === 'DOCTOR') ? 'DOCTOR' : 'PATIENT';
      const { user, accessToken, refreshToken } = await authService.googleLogin(token, requestedRole);
      
      setAuthCookies(res, accessToken, refreshToken);
      await auditService.logAction(AuditAction.LOGIN, user.id, 'User', user.id, req.ip, req.headers['user-agent'], { method: 'google', role: user.role });

      res.status(200).json({
        success: true,
        message: 'Google Login successful',
        data: { user, token: accessToken, accessToken, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  }

  googleMobileLogin(req: Request, res: Response): void {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ success: false, message: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID in environment.' });
      return;
    }
    const host = req.headers.host || 'localhost:5000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
    const callbackUrl = process.env.GOOGLE_OAUTH_CALLBACK_URL || defaultCallback;

    // Securely encode requested role and CSRF token into OAuth state parameter
    const queryRole = String(req.query.role || '').toUpperCase();
    const selectedRole = queryRole === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';
    const csrfToken = crypto.randomBytes(16).toString('hex');
    const statePayload = JSON.stringify({ csrf: csrfToken, role: selectedRole, ts: Date.now() });
    const state = Buffer.from(statePayload).toString('base64url');

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&state=${encodeURIComponent(state)}`;

    res.redirect(googleAuthUrl);
  }

  async googleMobileCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.query.code as string;
      const errorParam = req.query.error as string;
      const stateParam = req.query.state as string;

      if (errorParam || !code) {
        res.redirect(`curalink://oauthredirect?error=${encodeURIComponent(errorParam || 'Google login cancelled')}`);
        return;
      }

      // Decode role from OAuth state parameter
      let requestedRole = 'PATIENT';
      if (stateParam) {
        try {
          const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8'));
          if (decoded.role === 'DOCTOR' || decoded.role === 'PATIENT') {
            requestedRole = decoded.role;
          }
        } catch {
          if (stateParam === 'DOCTOR' || stateParam === 'PATIENT') {
            requestedRole = stateParam;
          }
        }
      }

      const host = req.headers.host || 'localhost:5000';
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const defaultCallback = `${protocol}://${host}/api/auth/google/callback`;
      const callbackUrl = process.env.GOOGLE_OAUTH_CALLBACK_URL || defaultCallback;

      const { user, accessToken, refreshToken } = await authService.googleLoginWithCode(code, callbackUrl, requestedRole);

      setAuthCookies(res, accessToken, refreshToken);
      await auditService.logAction(AuditAction.LOGIN, user.id, 'User', user.id, req.ip, req.headers['user-agent'], { method: 'google_mobile', role: user.role });

      const redirectUrl = `curalink://oauthredirect?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&user=${encodeURIComponent(JSON.stringify(user))}`;
      res.redirect(redirectUrl);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Google OAuth failed';
      res.redirect(`curalink://oauthredirect?error=${encodeURIComponent(msg)}`);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.curalink_refresh || req.body?.refreshToken;
      
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token missing');
      }

      const tokens = await authService.refreshTokens(refreshToken);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          token: tokens.accessToken,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
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

      // Token role auto-healing: if token role differs from DB role, issue fresh token
      let token: string | undefined;
      if (req.user.role !== user.role) {
        const tokens = await authService.createTokens(user as any);
        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        token = tokens.accessToken;
      }

      res.status(200).json({
        success: true,
        data: { user, ...(token ? { token, accessToken: token } : {}) },
      });
    } catch (error) {
      next(error);
    }
  }

  async switchRole(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Strict role isolation: Patients, Doctors, and Admins cannot switch portals or roles
      throw new ForbiddenError('Role switching is disabled. Please sign in with your dedicated role account.');
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
        ...(token && process.env.NODE_ENV === 'test' ? { data: { token } } : {}) // Only send token in test mode
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(validatedInput.token, validatedInput.password, req.ip);

      await auditService.logAction(AuditAction.PASSWORD_RESET, undefined, undefined, undefined, req.ip, req.headers['user-agent']);

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = String(req.body?.token || req.query?.token || '');
      if (!token) {
        res.status(400).json({ success: false, message: 'Verification token is required' });
        return;
      }

      const result = await authService.verifyEmail(token);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = String(req.body?.email || req.user?.email || '').trim().toLowerCase();
      if (!email) {
        res.status(400).json({ success: false, message: 'Email address is required' });
        return;
      }

      const result = await authService.resendVerification(email);
      res.status(200).json(result);
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

      const updatedUser = await authService.updateProfile(req.user.id, validatedInput);

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

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const rawImage = typeof req.body?.image === 'string' ? req.body.image.trim() : '';
      const match = rawImage.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);

      if (!match) {
        throw new BadRequestError('Please upload a valid JPG, PNG, or WebP image.');
      }

      const mime = match[1].toLowerCase();
      const base64Payload = match[2];
      const buffer = Buffer.from(base64Payload, 'base64');

      const MAX_BYTES = 3 * 1024 * 1024; // 3MB
      if (buffer.length === 0 || buffer.length > MAX_BYTES) {
        throw new BadRequestError('Profile photo must be smaller than 3 MB.');
      }

      // Magic-byte validation to prevent spoofed uploads
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng =
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isWebp =
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP';

      if ((mime.includes('jpeg') || mime.includes('jpg')) && !isJpeg) {
        throw new BadRequestError('Invalid JPEG file signature.');
      }
      if (mime === 'image/png' && !isPng) {
        throw new BadRequestError('Invalid PNG file signature.');
      }
      if (mime === 'image/webp' && !isWebp) {
        throw new BadRequestError('Invalid WebP file signature.');
      }

      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
      const avatarDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      fs.mkdirSync(avatarDir, { recursive: true });

      const safeUserId = req.user.id.replace(/[^a-zA-Z0-9_-]/g, '');
      const fileName = `${safeUserId}-${Date.now()}.${ext}`;
      const filePath = path.join(avatarDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const avatarUrl = `/uploads/avatars/${fileName}`;
      const { user, previousAvatarUrl } = await authService.updateAvatar(req.user.id, avatarUrl);

      // Clean up previous uploaded avatar if it lived under /uploads/avatars/
      if (previousAvatarUrl && previousAvatarUrl.startsWith('/uploads/avatars/')) {
        const oldFile = path.join(avatarDir, path.basename(previousAvatarUrl));
        if (oldFile !== filePath && fs.existsSync(oldFile)) {
          fs.unlink(oldFile, () => {});
        }
      }

      await auditService.logAction(
        AuditAction.PROFILE_UPDATE,
        req.user.id,
        'User',
        req.user.id,
        req.ip,
        req.headers['user-agent'],
        { action: 'avatar_upload' }
      );

      res.status(200).json({
        success: true,
        message: 'Profile photo updated successfully',
        data: { user, avatarUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { user, previousAvatarUrl } = await authService.updateAvatar(req.user.id, null);

      if (previousAvatarUrl && previousAvatarUrl.startsWith('/uploads/avatars/')) {
        const avatarDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        const oldFile = path.join(avatarDir, path.basename(previousAvatarUrl));
        if (fs.existsSync(oldFile)) {
          fs.unlink(oldFile, () => {});
        }
      }

      await auditService.logAction(
        AuditAction.PROFILE_UPDATE,
        req.user.id,
        'User',
        req.user.id,
        req.ip,
        req.headers['user-agent'],
        { action: 'avatar_remove' }
      );

      res.status(200).json({
        success: true,
        message: 'Profile photo removed',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
