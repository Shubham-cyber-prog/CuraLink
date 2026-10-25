import { z } from 'zod';

import { paginationQuerySchema } from './pagination.validator';


export const sendMessageSchema = z.object({
  appointmentId: z.string().min(1, 'appointmentId is required'),
  content: z.string().min(1, 'content must not be empty').trim(),
});

export const getMessagesQuerySchema = z.object({
  appointmentId: z.string().min(1, 'appointmentId is required'),

}).merge(paginationQuerySchema);

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;

});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;

