import prisma from '../lib/prisma';
import crypto from 'crypto';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken, generateResetToken, verifyResetToken, verifyRefreshToken, decodeToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/errors';
import { Role } from '../types/role';
import { OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  phoneVerified?: boolean;
  age?: number | null;
  gender?: string | null;
  profileCompletedAt?: Date | null;
  noShowCount?: number;
  profileCompleted?: boolean;
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

    if (input.role === Role.DOCTOR) {
      const existingProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
      if (!existingProfile) {
        await prisma.doctorProfile.create({
          data: {
            userId: user.id,
            specialization: 'General Practice',
            medicalLicenseNumber: 'PENDING',
            verificationStatus: 'PENDING',
          },
        });
      }
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

  async googleLoginWithCode(code: string, redirectUri: string, requestedRole: string = 'PATIENT'): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
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

    return this.googleLogin(accessToken, requestedRole);
  }

  async googleLogin(token: string, requestedRole: string = 'PATIENT'): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
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

    const targetRole = requestedRole === 'DOCTOR' ? Role.DOCTOR : Role.PATIENT;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          googleId,
          role: targetRole,
        },
      });

      if (targetRole === Role.DOCTOR) {
        const existingProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
        if (!existingProfile) {
          await prisma.doctorProfile.create({
            data: {
              userId: user.id,
              specialization: 'General Practice',
              medicalLicenseNumber: 'PENDING',
              verificationStatus: 'PENDING',
            },
          });
        }
      }
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
  }

  async loginWithGoogle(credential: string, requestedRole: string = 'PATIENT'): Promise<{ token: string; user: SafeUser }> {
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

    const targetRole = requestedRole === 'DOCTOR' ? Role.DOCTOR : Role.PATIENT;

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
          role: targetRole,
        },
      });

      if (targetRole === Role.DOCTOR) {
        const existingProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
        if (!existingProfile) {
          await prisma.doctorProfile.create({
            data: {
              userId: user.id,
              specialization: 'General Practice',
              medicalLicenseNumber: 'PENDING',
              verificationStatus: 'PENDING',
            },
          });
        }
      }
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role as Role });
    return { token, user: this.toSafeUser(user) };
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

  private toSafeUser(user: any): SafeUser {
    const isProfileComplete = Boolean(
      user.profileCompletedAt ||
      (user.name && user.age && user.gender)
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      phone: user.phone || null,
      phoneVerified: Boolean(user.phoneVerified),
      age: user.age || null,
      gender: user.gender || null,
      profileCompletedAt: user.profileCompletedAt || null,
      noShowCount: user.noShowCount || 0,
      profileCompleted: isProfileComplete,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    input: { name: string; email: string; phone?: string; age?: number; gender?: string; phoneVerified?: boolean } | string,
    optionalEmail?: string
  ): Promise<SafeUser> {
    const name = typeof input === 'string' ? input : input.name;
    const email = typeof input === 'string' ? (optionalEmail || '') : input.email;
    const phone = typeof input === 'object' ? input.phone : undefined;
    const age = typeof input === 'object' ? input.age : undefined;
    const gender = typeof input === 'object' ? input.gender : undefined;
    const phoneVerified = typeof input === 'object' ? input.phoneVerified : undefined;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('Email is already in use by another account');
    }

    const currentUser: any = await prisma.user.findUnique({ where: { id: userId } });
    const finalName = name ?? currentUser?.name;
    const finalAge = age !== undefined ? age : currentUser?.age;
    const finalGender = gender !== undefined ? gender : currentUser?.gender;

    const isComplete = Boolean(finalName && finalAge && finalGender);
    const profileCompletedAt = isComplete
      ? (currentUser?.profileCompletedAt || new Date())
      : null;

    const updateData: any = {
      name,
      email,
    };
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (phoneVerified !== undefined) updateData.phoneVerified = phoneVerified;
    if (profileCompletedAt !== undefined) updateData.profileCompletedAt = profileCompletedAt;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.toSafeUser(updatedUser);
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
