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
  experience: string;
  videoConsultation: boolean;
  bio: string;
  qualifications: string[];
  availabilitySlots: { date: string; slots: string[] }[];
  reviews: { id: string; nameInitial: string; rating: number; comment: string; date: string }[];
}

const defaultSlots = [
  { date: "Today", slots: ["10:30 AM", "1:00 PM", "3:45 PM"] },
  { date: "Tomorrow", slots: ["9:00 AM", "11:15 AM", "2:30 PM", "4:00 PM"] },
  { date: "Friday, Sep 5", slots: ["10:00 AM", "1:30 PM"] },
  { date: "Monday, Sep 8", slots: ["8:30 AM", "9:45 AM", "3:00 PM"] },
  { date: "Tuesday, Sep 9", slots: ["11:00 AM", "2:00 PM", "4:30 PM"] },
];

const defaultReviews = [
  { id: "r1", nameInitial: "J.", rating: 5, comment: "Very attentive and took the time to explain everything clearly. Highly recommend!", date: "2 weeks ago" },
  { id: "r2", nameInitial: "M.", rating: 4, comment: "Great consultation, felt heard and got exactly the guidance I needed.", date: "1 month ago" },
  { id: "r3", nameInitial: "S.", rating: 5, comment: "Professional, punctual, and very knowledgeable. The video call quality was great.", date: "2 months ago" },
];

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
    experience: "12+ years experience",
    videoConsultation: true,
    bio: "Dr. Sharma is a dedicated general practitioner with over a decade of experience in family medicine. She believes in holistic care and taking the time to truly listen to her patients. Her practice focuses on preventive care and overall wellness.",
    qualifications: ["MD, Harvard Medical School", "Board Certified in Family Medicine", "Residency at Mass General Hospital"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
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
    experience: "15+ years experience",
    videoConsultation: true,
    bio: "Dr. Vance is a board-certified cardiologist specializing in preventive cardiology and cardiovascular imaging. He has published multiple papers on early detection of heart disease and works with patients to create sustainable, heart-healthy lifestyle changes.",
    qualifications: ["MD, Johns Hopkins University", "Fellowship in Cardiology, Mayo Clinic", "Board Certified in Cardiovascular Disease"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
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
    experience: "8+ years experience",
    videoConsultation: true,
    bio: "Dr. Jenkins is a highly sought-after dermatologist with expertise in both medical and cosmetic dermatology. She is passionate about helping patients achieve healthy skin and specializes in treating acne, eczema, and conducting thorough skin cancer screenings.",
    qualifications: ["MD, Stanford University School of Medicine", "Board Certified in Dermatology", "Member of the American Academy of Dermatology"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
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
    experience: "10+ years experience",
    videoConsultation: true,
    bio: "Dr. Sato is a compassionate pediatrician who loves working with children of all ages, from newborns to teenagers. He focuses on creating a comfortable, anxiety-free environment for kids and providing clear, reassuring guidance for parents.",
    qualifications: ["MD, University of California, San Francisco", "Board Certified in Pediatrics", "Pediatric Residency at UCSF Benioff Children's Hospital"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
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
    experience: "20+ years experience",
    videoConsultation: false,
    bio: "Dr. Rostova is a senior neurologist with extensive experience diagnosing and treating complex neurological disorders. She is known for her thorough approach and dedication to finding the root cause of symptoms like chronic migraines and neuropathy.",
    qualifications: ["MD, Yale School of Medicine", "Board Certified in Neurology", "PhD in Neuroscience"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
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
    experience: "5+ years experience",
    videoConsultation: true,
    bio: "Dr. Kim is an energetic and modern general practitioner who stays up-to-date with the latest medical advancements. He emphasizes open communication and collaborative decision-making with his patients to ensure the best possible health outcomes.",
    qualifications: ["MD, University of Washington", "Board Certified in Family Medicine"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
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
    experience: "14+ years experience",
    videoConsultation: true,
    bio: "Dr. Rahman is a dedicated pediatrician known for her warm bedside manner and exceptional diagnostic skills. She has a special interest in early childhood development and pediatric nutrition.",
    qualifications: ["MD, Duke University School of Medicine", "Board Certified in Pediatrics", "Fellow of the American Academy of Pediatrics"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
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
    experience: "11+ years experience",
    videoConsultation: true,
    bio: "Dr. Lind is a thoughtful psychiatrist who integrates evidence-based medical treatment with a deep understanding of psychological well-being. He specializes in treating anxiety, depression, and stress-related disorders in a supportive, judgment-free environment.",
    qualifications: ["MD, Columbia University", "Board Certified in Psychiatry", "Residency at NYP/Columbia University Medical Center"],
    availabilitySlots: defaultSlots,
    reviews: defaultReviews,
  },
];
