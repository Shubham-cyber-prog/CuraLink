import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  phone: z.string().trim().optional(),
  age: z.number().int().min(1).max(125).optional(),
  gender: z.string().trim().optional(),
  phoneVerified: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
