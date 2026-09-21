export interface DaySlot {
  date: string;
  slots: string[];
}

export interface DoctorReview {
  id: string;
  nameInitial: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Doctor {
  id: string;
  profileId?: string;
  userId?: string;
  name: string;
  email?: string;
  specialty: string;
  specialization?: string;
  rating: number;
  reviewCount: number;
  nextAvailableDate: string;
  nextAvailableTime: string;
  photoUrl?: string;
  availability: "today" | "this-week" | "any-time";
  experience: string;
  experienceYears?: number;
  videoConsultation: boolean;
  bio: string;
  qualifications: string[];
  availabilitySlots: DaySlot[];
  reviews: DoctorReview[];
  consultationFee?: number;
  city?: string | null;
  location?: string;
  medicalLicenseNumber?: string;
  verificationStatus?: string;
}

