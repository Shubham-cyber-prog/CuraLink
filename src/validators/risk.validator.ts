import { z } from 'zod';

export const diabetesRiskSchema = z.object({
  glucose: z.number().min(0).max(600),
  bmi: z.number().min(5).max(100),
  age: z.number().min(1).max(130),
  pregnancies: z.number().min(0).max(25).optional(),
  bloodPressure: z.number().min(0).max(300).optional(),
  skinThickness: z.number().min(0).max(100).optional(),
  insulin: z.number().min(0).max(1000).optional(),
  diabetesPedigreeFunction: z.number().min(0).max(5).optional(),
});

export const heartRiskSchema = z.object({
  age: z.number().min(1).max(130),
  sex: z.number().min(0).max(1),
  cp: z.number().min(0).max(3),
  trestbps: z.number().min(50).max(300),
  chol: z.number().min(50).max(800),
  thalach: z.number().min(40).max(250),
  oldpeak: z.number().min(0).max(10),
  fbs: z.number().min(0).max(1).optional(),
  restecg: z.number().min(0).max(2).optional(),
  exang: z.number().min(0).max(1).optional(),
  slope: z.number().min(0).max(2).optional(),
  ca: z.number().min(0).max(4).optional(),
  thal: z.number().min(0).max(3).optional(),
});

export const urgencyTextSchema = z.object({
  symptomText: z.string().min(2).max(2000),
});
