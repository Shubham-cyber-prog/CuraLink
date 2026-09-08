import { z } from 'zod';

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required (e.g., 500mg)'),
  frequency: z.string().min(1, 'Frequency is required (e.g., 1-0-1 or Twice daily)'),
  duration: z.string().min(1, 'Duration is required (e.g., 5 days)'),
  instructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  consultationId: z.string().min(1, 'Consultation ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  diagnosis: z.string().min(3, 'Diagnosis must be at least 3 characters'),
  medications: z.array(medicationSchema).min(1, 'At least one medication must be prescribed'),
  notes: z.string().optional(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
