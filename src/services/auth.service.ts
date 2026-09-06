import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateResetToken, verifyResetToken, decodeToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/errors';
import { Role } from '../types/role';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: SafeUser }> {
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

    return {
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

  async login(input: LoginInput): Promise<{ token: string; user: SafeUser }> {
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

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return {
      token,
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

  async googleLogin(token: string): Promise<{ token: string; user: SafeUser }> {
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

    const authToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return {
      token: authToken,
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

  async getUserById(id: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

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
    // Check if email is already taken by another user
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
      // Don't reveal if user exists, and Google users can't reset password this way
      return null;
    }
    const token = generateResetToken(user.id, user.passwordHash);
    return token;
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
    } catch (err: any) {
      throw new BadRequestError(err.message || 'Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }
}

export const authService = new AuthService();

