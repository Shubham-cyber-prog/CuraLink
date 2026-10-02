import { z } from 'zod';

export const createVitalLogSchema = z
  .object({
    systolicBp: z
      .coerce
      .number()
      .min(40, 'Invalid systolic blood pressure: value must be between 40 and 300 mmHg.')
      .max(300, 'Invalid systolic blood pressure: value must be between 40 and 300 mmHg.')
      .nullable()
      .optional(),
    diastolicBp: z
      .coerce
      .number()
      .min(20, 'Invalid diastolic blood pressure: value must be between 20 and 200 mmHg.')
      .max(200, 'Invalid diastolic blood pressure: value must be between 20 and 200 mmHg.')
      .nullable()
      .optional(),
    bloodGlucose: z
      .coerce
      .number()
      .min(20, 'Invalid blood glucose level: value must be between 20 and 1000 mg/dL.')
      .max(1000, 'Invalid blood glucose level: value must be between 20 and 1000 mg/dL.')
      .nullable()
      .optional(),
    glucoseType: z.enum(['FASTING', 'POST_PRANDIAL', 'RANDOM']).default('FASTING'),
    weight: z
      .coerce
      .number()
      .min(1, 'Invalid weight: value must be between 1 and 500 kg.')
      .max(500, 'Invalid weight: value must be between 1 and 500 kg.')
      .nullable()
      .optional(),
    heartRate: z
      .coerce
      .number()
      .min(25, 'Invalid heart rate: value must be between 25 and 300 bpm.')
      .max(300, 'Invalid heart rate: value must be between 25 and 300 bpm.')
      .nullable()
      .optional(),
    spO2: z
      .coerce
      .number()
      .min(50, 'Invalid oxygen saturation (SpO2): percentage must be between 50% and 100%.')
      .max(100, 'Invalid oxygen saturation (SpO2): percentage must be between 50% and 100%.')
      .nullable()
      .optional(),
    temperature: z
      .coerce
      .number()
      .min(85, 'Invalid temperature: value must be between 85°F and 115°F.')
      .max(115, 'Invalid temperature: value must be between 85°F and 115°F.')
      .nullable()
      .optional(),
    notes: z.string().nullable().optional(),
    recordedAt: z.union([z.string().datetime(), z.date()]).optional(),
  })
  .refine(
    (data) =>
      data.bloodGlucose != null ||
      data.systolicBp != null ||
      data.weight != null ||
      data.heartRate != null ||
      data.spO2 != null ||
      data.temperature != null,
    {
      message: 'Please provide at least one vital metric (Blood Glucose, Blood Pressure, Weight, Heart Rate).',
    }
  );

export type CreateVitalLogInput = z.infer<typeof createVitalLogSchema>;
