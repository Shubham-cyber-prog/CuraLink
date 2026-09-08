import { z } from 'zod';

export const createReviewSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  consultationId: z.string().optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000, 'Comment too long'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
