export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  nextAvailableDate: string;
  nextAvailableTime: string;
  photoUrl?: string;
  availability: "today" | "this-week" | "any-time";
}

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Priya Sharma",
    specialty: "General Practice",
    rating: 4.9,
    reviewCount: 124,
    nextAvailableDate: "Today",
    nextAvailableTime: "10:30 AM",
    availability: "today",
    photoUrl: undefined,
  },
  {
    id: "doc_2",
    name: "Dr. Marcus Vance",
    specialty: "Cardiology",
    rating: 4.8,
    reviewCount: 98,
    nextAvailableDate: "Tomorrow",
    nextAvailableTime: "2:00 PM",
    availability: "this-week",
    photoUrl: undefined,
  },
  {
    id: "doc_3",
    name: "Dr. Sarah Jenkins",
    specialty: "Dermatology",
    rating: 4.95,
    reviewCount: 210,
    nextAvailableDate: "Today",
    nextAvailableTime: "4:15 PM",
    availability: "today",
    photoUrl: undefined,
  },
  {
    id: "doc_4",
    name: "Dr. Kenji Sato",
    specialty: "Pediatrics",
    rating: 4.7,
    reviewCount: 85,
    nextAvailableDate: "Monday, Sep 1",
    nextAvailableTime: "9:00 AM",
    availability: "any-time",
    photoUrl: undefined,
  },
  {
    id: "doc_5",
    name: "Dr. Elena Rostova",
    specialty: "Neurology",
    rating: 4.6,
    reviewCount: 64,
    nextAvailableDate: "Wednesday, Sep 3",
    nextAvailableTime: "11:30 AM",
    availability: "any-time",
    photoUrl: undefined,
  },
  {
    id: "doc_6",
    name: "Dr. David Kim",
    specialty: "General Practice",
    rating: 4.85,
    reviewCount: 152,
    nextAvailableDate: "Today",
    nextAvailableTime: "1:45 PM",
    availability: "today",
    photoUrl: undefined,
  },
  {
    id: "doc_7",
    name: "Dr. Aisha Rahman",
    specialty: "Pediatrics",
    rating: 4.9,
    reviewCount: 118,
    nextAvailableDate: "Tomorrow",
    nextAvailableTime: "10:00 AM",
    availability: "this-week",
    photoUrl: undefined,
  },
  {
    id: "doc_8",
    name: "Dr. Christian Lind",
    specialty: "Psychiatry",
    rating: 4.75,
    reviewCount: 92,
    nextAvailableDate: "Thursday, Sep 4",
    nextAvailableTime: "3:30 PM",
    availability: "any-time",
    photoUrl: undefined,
  },
];
