import prisma from '../lib/prisma';
import crypto from 'crypto';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken, generateResetToken, verifyResetToken, verifyRefreshToken, decodeToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/errors';
<<<<<<< Updated upstream
import { Role } from '../types/role';
import { env } from '../config/env';
=======
import { Role } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
>>>>>>> Stashed changes

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private async createTokens(user: { id: string; email: string; role: string }) {
    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const jti = crypto.randomUUID();
    const refreshToken = generateRefreshToken(user.id, jti);

    // Hash refresh token for DB storage
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Calculate expiry (default 7d)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async register(input: RegisterInput): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: normalizedEmail,
        passwordHash,
        role: input.role,
      },
    });

    const tokens = await this.createTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('Please log in with Google.');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.createTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

<<<<<<< Updated upstream
  async googleLoginWithCode(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    const clientId = process.env.GOOGLE_CLIENT_ID || '498397902593-9h36l23od7sngoejesi3h84m7enrhm0c.apps.googleusercontent.com';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Google OAuth Token Exchange Error]', errText);
      throw new UnauthorizedError('Failed to exchange authorization code with Google');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token || tokenData.id_token;

    if (!accessToken) {
      throw new UnauthorizedError('Google did not return an access token');
    }

    return this.googleLogin(accessToken);
  }

  async googleLogin(token: string): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!googleRes.ok) {
      throw new UnauthorizedError('Invalid Google token');
    }

    const payload = await googleRes.json();
    const email = payload.email?.toLowerCase();
    const name = payload.name;
    const googleId = payload.sub;

    if (!email) {
      throw new BadRequestError('Email not provided by Google');
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          googleId,
          role: "PATIENT",
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    const tokens = await this.createTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }
    
    if (storedToken.revokedAt) {
      // Possible token theft, revoke all tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    // Create new tokens
    return await this.createTokens(storedToken.user);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { token: hashedToken, userId },
        data: { revokedAt: new Date() }
      });
    } else {
      // If no specific token, clear all for user (optional security measure)
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }
=======
  async loginWithGoogle(credential: string): Promise<{ token: string; user: SafeUser }> {
    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedError('Invalid Google credential');
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedError('Google account email is not verified');
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    }

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: payload.sub },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: payload.name?.trim() || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          googleId: payload.sub,
          passwordHash: await hashPassword(randomUUID()),
          role: Role.PATIENT,
        },
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { token, user: this.toSafeUser(user) };
>>>>>>> Stashed changes
  }

  async getUserById(id: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    return this.toSafeUser(user);
  }

  private toSafeUser(user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  }): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, name: string, email: string): Promise<SafeUser> {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('Email is already in use by another account');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role as Role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async forgotPassword(email: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user || !user.passwordHash) {
      return null;
    }
    return generateResetToken(user.id, user.passwordHash);
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const decoded = decodeToken(token) as { id?: string } | null;
    if (!decoded || !decoded.id) {
      throw new BadRequestError('Invalid reset token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new BadRequestError('Invalid reset token');
    }

    if (!user.passwordHash) {
      throw new BadRequestError('Account uses Google login');
    }

    try {
      verifyResetToken(token, user.passwordHash);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired reset token';
      throw new BadRequestError(message);
    }

    const passwordHash = await hashPassword(password);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      // Invalidate all active sessions (refresh tokens) when password is reset
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() }
      })
    ]);
  }
}

export const authService = new AuthService();
