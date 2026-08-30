export const DOCTOR_SPECIALTIES = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Psychiatry",
] as const;

export type DoctorSpecialty = (typeof DOCTOR_SPECIALTIES)[number];
