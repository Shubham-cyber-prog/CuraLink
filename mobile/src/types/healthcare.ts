export interface DoctorPreview {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  nextAvailableLabel: string;
  photoUrl: string;
}

export interface AppointmentPreview {
  id: string;
  doctorName: string;
  specialty: string;
  dateLabel: string;
  timeLabel: string;
  status: 'confirmed' | 'pending';
}
