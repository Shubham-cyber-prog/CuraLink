import { z } from 'zod';

export const sendMessageSchema = z.object({
  appointmentId: z.string().min(1, 'appointmentId is required'),
  content: z.string().min(1, 'content must not be empty').trim(),
});

export const getMessagesQuerySchema = z.object({
  appointmentId: z.string().min(1, 'appointmentId is required'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;
