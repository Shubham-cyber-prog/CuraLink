import { z } from 'zod';
import { Role } from '@prisma/client';
import { DOCTOR_SPECIALTIES } from '../../lib/specialties';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z
    .nativeEnum(Role)
    .refine((val) => val !== Role.ADMIN, {
      message: 'Public registration for ADMIN role is strictly forbidden',
    })
    .default(Role.PATIENT),
  specialty: z.enum(DOCTOR_SPECIALTIES).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
}).superRefine((data, ctx) => {
  if (data.role === Role.DOCTOR && !data.specialty) {
    ctx.addIssue({ code: 'custom', path: ['specialty'], message: 'Specialty is required for doctors' });
  }
  if (data.role === Role.DOCTOR && data.yearsExperience === undefined) {
    ctx.addIssue({ code: 'custom', path: ['yearsExperience'], message: 'Years of experience is required for doctors' });
  }
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
