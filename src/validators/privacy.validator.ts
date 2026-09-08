import { z } from 'zod';

export const requestErasureSchema = z.object({
  reason: z.string().optional(),
  confirmConsent: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge that requesting data erasure will anonymize your account under DPDP Act 2023',
  }),
});

export type RequestErasureInput = z.infer<typeof requestErasureSchema>;
