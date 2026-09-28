import { z } from 'zod';

export const submitVerificationSchema = z.object({
  medicalLicenseNumber: z.string().trim().min(5, 'Medical license number must be at least 5 characters'),
  specialization: z.string().trim().min(2, 'Specialization is required'),
  experienceYears: z.number().int().nonnegative().default(0),
  consultationFee: z.number().positive().default(500),
  consultationModes: z.array(z.enum(['VIDEO', 'IN_PERSON'])).optional(),
  city: z.string().trim().max(100).optional(),
  bio: z.string().max(1000).optional(),
});

export const updateVerificationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
});

export const updateDoctorProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().trim().optional(),
  medicalLicenseNumber: z.string().trim().min(3, 'License number must be at least 3 characters').optional(),
  specialization: z.string().trim().min(2, 'Specialization is required').optional(),
  experienceYears: z.coerce.number().int().nonnegative().optional(),
  consultationFee: z.coerce.number().positive('Consultation fee must be positive').optional(),
  consultationModes: z.array(z.enum(['VIDEO', 'IN_PERSON'])).min(1, 'Select at least one consultation mode').optional(),
  city: z.string().trim().max(100).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
export type UpdateVerificationStatusInput = z.infer<typeof updateVerificationStatusSchema>;
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>;

