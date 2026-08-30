import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DOCTORS_DATA = [
  {
    name: "Dr. Priya Sharma",
    specialty: "General Practice",
    rating: 4.9,
    reviewCount: 124,
    yearsExperience: 12,
    bio: "Dr. Sharma is a dedicated general practitioner with over a decade of experience in family medicine. She believes in holistic care and taking the time to truly listen to her patients.",
    qualifications: ["MD, Harvard Medical School", "Board Certified in Family Medicine", "Residency at Mass General Hospital"],
  },
  {
    name: "Dr. Marcus Vance",
    specialty: "Cardiology",
    rating: 4.8,
    reviewCount: 98,
    yearsExperience: 15,
    bio: "Dr. Vance is a board-certified cardiologist specializing in preventive cardiology and cardiovascular imaging.",
    qualifications: ["MD, Johns Hopkins University", "Fellowship in Cardiology, Mayo Clinic", "Board Certified in Cardiovascular Disease"],
  },
  {
    name: "Dr. Sarah Jenkins",
    specialty: "Dermatology",
    rating: 4.95,
    reviewCount: 210,
    yearsExperience: 8,
    bio: "Dr. Jenkins is a highly sought-after dermatologist with expertise in medical dermatology, acne, and skin screenings.",
    qualifications: ["MD, Stanford University School of Medicine", "Board Certified in Dermatology"],
  },
  {
    name: "Dr. Kenji Sato",
    specialty: "Pediatrics",
    rating: 4.7,
    reviewCount: 85,
    yearsExperience: 10,
    bio: "Dr. Sato is a compassionate pediatrician who loves working with children of all ages, from newborns to teenagers.",
    qualifications: ["MD, UC San Francisco", "Board Certified in Pediatrics"],
  },
  {
    name: "Dr. Elena Rostova",
    specialty: "Neurology",
    rating: 4.6,
    reviewCount: 64,
    yearsExperience: 20,
    bio: "Dr. Rostova is a senior neurologist with extensive experience diagnosing and treating complex neurological disorders.",
    qualifications: ["MD, Yale School of Medicine", "Board Certified in Neurology", "PhD in Neuroscience"],
  },
  {
    name: "Dr. David Kim",
    specialty: "General Practice",
    rating: 4.85,
    reviewCount: 152,
    yearsExperience: 5,
    bio: "Dr. Kim is an energetic and modern general practitioner who emphasizes open communication and collaborative decision-making.",
    qualifications: ["MD, University of Washington", "Board Certified in Family Medicine"],
  },
  {
    name: "Dr. Aisha Rahman",
    specialty: "Pediatrics",
    rating: 4.9,
    reviewCount: 118,
    yearsExperience: 14,
    bio: "Dr. Rahman is a dedicated pediatrician known for her warm bedside manner and exceptional diagnostic skills.",
    qualifications: ["MD, Duke University School of Medicine", "Board Certified in Pediatrics"],
  },
  {
    name: "Dr. Christian Lind",
    specialty: "Psychiatry",
    rating: 4.75,
    reviewCount: 92,
    yearsExperience: 11,
    bio: "Dr. Lind is a thoughtful psychiatrist who integrates evidence-based medical treatment with psychological well-being.",
    qualifications: ["MD, Columbia University", "Board Certified in Psychiatry"],
  },
];

const REVIEWS_SAMPLE = [
  { patientName: "Jessica M.", rating: 5, comment: "Very attentive and took the time to explain everything clearly. Highly recommend!" },
  { patientName: "Michael R.", rating: 4, comment: "Great consultation, felt heard and got exactly the guidance I needed." },
  { patientName: "Sophia T.", rating: 5, comment: "Professional, punctual, and very knowledgeable. Great video call quality." },
];

const SLOT_TEMPLATES = [
  { date: "Today", time: "10:30 AM" },
  { date: "Today", time: "01:00 PM" },
  { date: "Today", time: "03:45 PM" },
  { date: "Tomorrow", time: "09:00 AM" },
  { date: "Tomorrow", time: "11:15 AM" },
  { date: "Tomorrow", time: "02:30 PM" },
  { date: "Friday, Sep 5, 2026", time: "10:30 AM" },
  { date: "Monday, Sep 8, 2026", time: "09:45 AM" },
  { date: "Tuesday, Sep 9, 2026", time: "02:00 PM" },
];

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', 10);
  const doctorPasswordHash = await bcrypt.hash('Doctor1234!', 10);

  // 1. User
  const testUser = await prisma.user.upsert({
    where: { email: 'test@curalink.com' },
    update: {
      name: 'Alex Johnson',
      passwordHash,
    },
    create: {
      name: 'Alex Johnson',
      email: 'test@curalink.com',
      passwordHash,
      role: 'PATIENT',
    },
  });

  console.log(`Seeded User: ${testUser.email}`);

  // Clear existing data cleanly for re-seeding
  await prisma.appointment.deleteMany({ where: { patientId: testUser.id } });

  // 2. Doctors + Slots + Reviews
  const doctorMap: Record<string, { doctorId: string; slots: { id: string; date: string; time: string }[] }> = {};

  for (const docData of DOCTORS_DATA) {
    const existingDoc = await prisma.doctor.findFirst({
      where: { name: docData.name },
    });

    let doctorId = existingDoc?.id;

    if (!existingDoc) {
      const newDoc = await prisma.doctor.create({
        data: {
          name: docData.name,
          specialty: docData.specialty,
          rating: docData.rating,
          reviewCount: docData.reviewCount,
          yearsExperience: docData.yearsExperience,
          bio: docData.bio,
          qualifications: docData.qualifications,
        },
      });
      doctorId = newDoc.id;
    } else {
      await prisma.doctor.update({
        where: { id: doctorId },
        data: {
          specialty: docData.specialty,
          rating: docData.rating,
          bio: docData.bio,
          qualifications: docData.qualifications,
        },
      });
    }

    // Refresh slots
    await prisma.availabilitySlot.deleteMany({ where: { doctorId } });
    const createdSlots = [];
    for (const st of SLOT_TEMPLATES) {
      const slot = await prisma.availabilitySlot.create({
        data: {
          doctorId: doctorId!,
          date: st.date,
          time: st.time,
          isBooked: false,
        },
      });
      createdSlots.push({ id: slot.id, date: slot.date, time: slot.time });
    }

    // Refresh reviews
    await prisma.review.deleteMany({ where: { doctorId } });
    for (const rev of REVIEWS_SAMPLE) {
      await prisma.review.create({
        data: {
          doctorId: doctorId!,
          patientName: rev.patientName,
          rating: rev.rating,
          comment: rev.comment,
        },
      });
    }

    doctorMap[docData.name] = { doctorId: doctorId!, slots: createdSlots };
  }

  console.log(`Seeded ${DOCTORS_DATA.length} Doctors with slots and reviews.`);

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@curalink.com' },
    update: {
      name: 'Priya Sharma',
      passwordHash: doctorPasswordHash,
      role: 'DOCTOR',
    },
    create: {
      name: 'Priya Sharma',
      email: 'doctor@curalink.com',
      passwordHash: doctorPasswordHash,
      role: 'DOCTOR',
    },
  });
  await prisma.doctor.update({
    where: { id: doctorMap['Dr. Priya Sharma'].doctorId },
    data: { userId: doctorUser.id },
  });
  console.log(`Seeded Doctor account: ${doctorUser.email}`);

  // 3. Create real appointments tied to test user and real doctors
  const priya = doctorMap["Dr. Priya Sharma"];
  const marcus = doctorMap["Dr. Marcus Vance"];
  const sarah = doctorMap["Dr. Sarah Jenkins"];

  // Book Priyas slot
  const priyaSlot = priya.slots.find((s) => s.date === "Friday, Sep 5, 2026") || priya.slots[0];
  await prisma.availabilitySlot.update({
    where: { id: priyaSlot.id },
    data: { isBooked: true },
  });

  const appt1 = await prisma.appointment.create({
    data: {
      patientId: testUser.id,
      doctorId: priya.doctorId,
      slotId: priyaSlot.id,
      doctorName: "Dr. Priya Sharma",
      doctorSpecialty: "General Practice",
      appointmentDate: "Friday, Sep 5, 2026",
      appointmentTime: "10:30 AM",
      status: "CONFIRMED",
      consultationType: "VIDEO",
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: testUser.id,
      doctorId: marcus.doctorId,
      doctorName: "Dr. Marcus Vance",
      doctorSpecialty: "Cardiology",
      appointmentDate: "August 14, 2026",
      appointmentTime: "02:00 PM",
      status: "COMPLETED",
      consultationType: "IN_PERSON",
    },
  });

  const appt3 = await prisma.appointment.create({
    data: {
      patientId: testUser.id,
      doctorId: sarah.doctorId,
      doctorName: "Dr. Sarah Jenkins",
      doctorSpecialty: "Dermatology",
      appointmentDate: "July 20, 2026",
      appointmentTime: "11:15 AM",
      status: "COMPLETED",
      consultationType: "VIDEO",
    },
  });

  console.log(`Seeded ${[appt1, appt2, appt3].length} Appointments tied to Doctors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
