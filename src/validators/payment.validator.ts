import { z } from 'zod';

export const createOrderSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().default('INR'),
});

export const verifyPaymentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
