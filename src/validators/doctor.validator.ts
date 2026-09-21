import { z } from 'zod';

export const submitVerificationSchema = z.object({
  medicalLicenseNumber: z.string().trim().min(5, 'Medical license number must be at least 5 characters'),
  specialization: z.string().trim().min(2, 'Specialization is required'),
  experienceYears: z.number().int().nonnegative().default(0),
  consultationFee: z.number().positive().default(500),
  city: z.string().trim().max(100).optional(),
  bio: z.string().max(1000).optional(),
});


export const updateVerificationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
export type UpdateVerificationStatusInput = z.infer<typeof updateVerificationStatusSchema>;
