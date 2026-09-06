import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Time must be in a valid format (e.g., 10:00 AM)'),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
