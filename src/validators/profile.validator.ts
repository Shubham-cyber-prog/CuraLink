import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
