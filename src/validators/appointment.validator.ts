import { z } from 'zod';
import { isValidIanaTimezone } from '../utils/timezone';

export const bookAppointmentSchema = z
  .object({
    doctorId: z.string().uuid('Invalid doctor ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    time: z.string().regex(/^\d{1,2}:\d{2}(\s?(AM|PM))?$/i, 'Time must be in a valid format (e.g., 10:00 AM or 14:30)').optional(),
    scheduledAt: z.string().datetime({ message: 'scheduledAt must be a valid ISO 8601 UTC timestamp' }).optional(),
    timezone: z
      .string()
      .refine((tz) => !tz || isValidIanaTimezone(tz), {
        message: 'Invalid IANA timezone identifier (e.g. Asia/Kolkata, America/New_York)',
      })
      .optional(),
    durationMinutes: z.number().int().min(10).max(180).optional(),
  })
  .refine(
    (data) => Boolean(data.scheduledAt || (data.date && data.time)),
    {
      message: 'Either scheduledAt (ISO UTC timestamp) or both date and time must be provided.',
      path: ['scheduledAt'],
    }
  );

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'PENDING']),
  reason: z.string().optional(),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

