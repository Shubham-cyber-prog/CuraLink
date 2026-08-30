import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateResetToken, verifyResetToken, decodeToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/errors';
import { Role } from '@prisma/client';

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

    const user = input.role === Role.DOCTOR
      ? await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            name: input.name,
            email: normalizedEmail,
            passwordHash,
            role: input.role,
          },
        });
        await tx.doctor.create({
          data: {
            userId: createdUser.id,
            name: input.name.startsWith('Dr.') ? input.name : `Dr. ${input.name}`,
            specialty: input.specialty!,
            yearsExperience: input.yearsExperience!,
            bio: 'New CuraLink doctor profile.',
            qualifications: [],
          },
        });
        return createdUser;
      })
      : await prisma.user.create({
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
        role: user.role,
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

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getUserById(id: string): Promise<SafeUser & { doctorProfile?: { id: string; specialty: string; bio: string; qualifications: string[]; yearsExperience: number; avatarUrl: string | null } | null }> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: {
          select: {
            id: true,
            specialty: true,
            bio: true,
            qualifications: true,
            yearsExperience: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...(user.role === Role.DOCTOR ? { doctorProfile: user.doctorProfile } : {}),
    };
  }

  async forgotPassword(email: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
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

    try {
      verifyResetToken(token, user.passwordHash);
    } catch (error: unknown) {
      throw new BadRequestError((error as Error).message || 'Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }
}

export const authService = new AuthService();
