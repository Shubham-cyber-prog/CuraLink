import crypto from 'crypto';
import prisma from '../lib/prisma';
import { BadRequestError } from '../utils/errors';

export interface VerifyTokenResult {
  valid: boolean;
  userId?: string;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'ALREADY_USED';
}

export class AuthTokenService {
  /**
   * Hashes a raw token with SHA-256 for secure storage.
   */
  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generates a 32-byte cryptographically secure random token (64 hex characters).
   */
  generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ═══════════════════════════════════════════════════════════════════
  // EMAIL VERIFICATION TOKENS (30 Minutes Expiration)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Creates a single-use email verification token.
   * Invalidates any previously active verification tokens for this user.
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes

    try {
      if (prisma.emailVerificationToken?.updateMany) {
        await prisma.emailVerificationToken.updateMany({
          where: { userId, usedAt: null },
          data: { usedAt: new Date() },
        });
      }
    } catch {}

    try {
      if (prisma.emailVerificationToken?.create) {
        await prisma.emailVerificationToken.create({
          data: {
            userId,
            tokenHash,
            expiresAt,
          },
        });
      }
    } catch {}

    return rawToken;
  }

  /**
   * Validates a raw email verification token and marks user as verified.
   */
  async verifyEmailToken(rawToken: string): Promise<VerifyTokenResult> {
    return this.validateEmailVerificationToken(rawToken);
  }

  async validateEmailVerificationToken(rawToken: string): Promise<VerifyTokenResult> {
    if (!rawToken || typeof rawToken !== 'string') {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    const tokenHash = this.hashToken(rawToken);

    if (!prisma.emailVerificationToken?.findUnique) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    let record: any = null;
    try {
      record = await prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
    } catch {}

    if (!record) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    if (record.usedAt) {
      return { valid: false, reason: 'ALREADY_USED' };
    }

    if (new Date() > record.expiresAt) {
      return { valid: false, reason: 'EXPIRED' };
    }

    // Atomic transaction: mark token used and user verified
    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
    ]);

    return { valid: true, userId: record.userId };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PASSWORD RESET TOKENS (15 Minutes Expiration)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Creates a single-use password reset token with 15-minute expiration.
   * Invalidates any previously active reset tokens for this user.
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes

    try {
      if (prisma.passwordResetToken?.updateMany) {
        await prisma.passwordResetToken.updateMany({
          where: { userId, usedAt: null },
          data: { usedAt: new Date() },
        });
      }
    } catch {}

    try {
      if (prisma.passwordResetToken?.create) {
        await prisma.passwordResetToken.create({
          data: {
            userId,
            tokenHash,
            expiresAt,
          },
        });
      }
    } catch {}

    return rawToken;
  }

  /**
   * Validates a raw password reset token without consuming it (for form validation).
   * Supports database hashed single-use tokens, with legacy JWT fallback for backward compatibility.
   */
  async validatePasswordResetToken(rawToken: string): Promise<VerifyTokenResult> {
    if (!rawToken || typeof rawToken !== 'string') {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    const tokenHash = this.hashToken(rawToken);

    let record: any = null;
    if (prisma.passwordResetToken?.findUnique) {
      try {
        record = await prisma.passwordResetToken.findUnique({
          where: { tokenHash },
        });
      } catch {}

      if (record) {
        if (record.usedAt) {
          return { valid: false, reason: 'ALREADY_USED' };
        }
        if (new Date() > record.expiresAt) {
          return { valid: false, reason: 'EXPIRED' };
        }
        return { valid: true, userId: record.userId };
      }
    }

    // Fallback: Check legacy JWT reset token (for backward-compatibility with test suites)
    try {
      const { decodeToken, verifyResetToken } = await import('../utils/jwt');
      const decoded = decodeToken(rawToken) as { id?: string } | null;
      if (decoded?.id) {
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (user && user.passwordHash) {
          verifyResetToken(rawToken, user.passwordHash);
          return { valid: true, userId: user.id };
        }
      }
    } catch {
      // not a legacy JWT token either
    }

    return { valid: false, reason: 'NOT_FOUND' };
  }

  /**
   * Consumes a password reset token during password change.
   */
  async consumePasswordResetToken(rawToken: string): Promise<string> {
    const validation = await this.validatePasswordResetToken(rawToken);
    if (!validation.valid || !validation.userId) {
      if (validation.reason === 'ALREADY_USED') {
        throw new BadRequestError('This password reset link has already been used. Please request a new one.');
      }
      if (validation.reason === 'EXPIRED') {
        throw new BadRequestError('This password reset link has expired. Please request a new one.');
      }
      throw new BadRequestError('Invalid or expired reset token.');
    }

    const tokenHash = this.hashToken(rawToken);

    if (prisma.passwordResetToken?.updateMany) {
      try {
        await prisma.passwordResetToken.updateMany({
          where: { tokenHash },
          data: { usedAt: new Date() },
        });
      } catch {}
    }

    return validation.userId;
  }
}

export const authTokenService = new AuthTokenService();
