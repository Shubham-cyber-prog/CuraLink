import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database with realistic verified doctors and reviews...');

  const defaultPasswordHash = await bcrypt.hash('DoctorSecurePass123!', 10);
  const patientPasswordHash = await bcrypt.hash('PatientSecurePass123!', 10);

  // 1. Ensure sample patient exists for reviews
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient.sample@curalink.com' },
    update: {},
    create: {
      name: 'Rohan Verma',
      email: 'patient.sample@curalink.com',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
    },
  });

  const patientUser2 = await prisma.user.upsert({
    where: { email: 'patient.meera@curalink.com' },
    update: {},
    create: {
      name: 'Meera Iyer',
      email: 'patient.meera@curalink.com',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
    },
  });

  // 2. Doctor definitions with realistic specializations, bios, fees, and licenses
  const doctorsData = [
    {
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@curalink.com',
      specialization: 'General Physician',
      experienceYears: 12,
      consultationFee: 500,
      medicalLicenseNumber: 'MCI-2014-83921',
      bio: 'Dr. Priya Sharma is a dedicated general physician with over a decade of experience in family medicine. She specializes in preventive health, chronic disease management, and holistic lifestyle medicine.',
      reviews: [
        {
          rating: 5,
          comment: 'Very attentive and took the time to explain everything clearly. Highly recommend!',
          patientId: patientUser.id,
        },
        {
          rating: 5,
          comment: 'Great consultation, felt heard and got exactly the guidance I needed for my flu symptoms.',
          patientId: patientUser2.id,
        },
      ],
    },
    {
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@curalink.com',
      specialization: 'Cardiology',
      experienceYears: 15,
      consultationFee: 1000,
      medicalLicenseNumber: 'MCI-2011-47201',
      bio: 'Dr. Marcus Vance is a board-certified cardiologist specializing in preventive cardiology, hypertension management, and cardiovascular risk assessments. He works with patients on heart-healthy sustainable habits.',
      reviews: [
        {
          rating: 5,
          comment: 'Dr. Vance gave an in-depth review of my ECG and blood reports. Superb bedside manner.',
          patientId: patientUser.id,
        },
        {
          rating: 4,
          comment: 'Very thorough and knowledgeable consultation regarding my cholesterol levels.',
          patientId: patientUser2.id,
        },
      ],
    },
    {
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@curalink.com',
      specialization: 'Dermatology',
      experienceYears: 8,
      consultationFee: 750,
      medicalLicenseNumber: 'MCI-2018-91024',
      bio: 'Dr. Sarah Jenkins is an experienced dermatologist specializing in medical dermatology, adult acne, eczema, and skin cancer screenings. She provides personalized, evidence-based skin regimens.',
      reviews: [
        {
          rating: 5,
          comment: 'Prescribed a regimen that cleared my stubborn dermatitis within three weeks. Excellent!',
          patientId: patientUser.id,
        },
      ],
    },
    {
      name: 'Dr. Kenji Sato',
      email: 'kenji.sato@curalink.com',
      specialization: 'Pediatrics',
      experienceYears: 10,
      consultationFee: 600,
      medicalLicenseNumber: 'MCI-2016-55412',
      bio: 'Dr. Kenji Sato is a compassionate pediatrician focused on childhood development, infant nutrition, and common pediatric conditions. He ensures a gentle, welcoming environment for young patients.',
      reviews: [
        {
          rating: 5,
          comment: 'Dr. Sato was so gentle with our 3-year-old and relieved all our worries. Exceptional doctor.',
          patientId: patientUser2.id,
        },
      ],
    },
    {
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@curalink.com',
      specialization: 'Neurology',
      experienceYears: 20,
      consultationFee: 1200,
      medicalLicenseNumber: 'MCI-2006-18940',
      bio: 'Dr. Elena Rostova is a senior neurologist with two decades of experience treating chronic migraines, neuropathy, and sleep disorders. She has led numerous clinical studies in neurobiology.',
      reviews: [
        {
          rating: 5,
          comment: 'Finally found relief from chronic migraines after consulting Dr. Rostova. Brilliant specialist.',
          patientId: patientUser.id,
        },
      ],
    },
    {
      name: 'Dr. Aisha Rahman',
      email: 'aisha.rahman@curalink.com',
      specialization: 'Gynecologist',
      experienceYears: 14,
      consultationFee: 800,
      medicalLicenseNumber: 'MCI-2012-66381',
      bio: 'Dr. Aisha Rahman is an empathetic gynecologist and obstetrician specializing in reproductive wellness, PCOS management, and prenatal care. She empowers women through holistic health guidance.',
      reviews: [
        {
          rating: 5,
          comment: 'Incredibly knowledgeable, patient, and made me feel completely comfortable discussing my concerns.',
          patientId: patientUser2.id,
        },
      ],
    },
    {
      name: 'Dr. Christian Lind',
      email: 'christian.lind@curalink.com',
      specialization: 'Psychiatry',
      experienceYears: 11,
      consultationFee: 900,
      medicalLicenseNumber: 'MCI-2015-32109',
      bio: 'Dr. Christian Lind is a psychiatrist specializing in adult ADHD, anxiety disorders, and depression. He utilizes an evidence-based approach combining pharmacotherapy with cognitive strategies.',
      reviews: [
        {
          rating: 5,
          comment: 'Extremely thoughtful and compassionate. The video consultation was seamless.',
          patientId: patientUser.id,
        },
      ],
    },
    {
      name: 'Dr. Rajesh Patel',
      email: 'rajesh.patel@curalink.com',
      specialization: 'Orthopedic',
      experienceYears: 16,
      consultationFee: 850,
      medicalLicenseNumber: 'MCI-2010-77892',
      bio: 'Dr. Rajesh Patel is a senior orthopedic consultant specializing in sports injuries, joint rehabilitation, and non-surgical management of back and knee pain.',
      reviews: [
        {
          rating: 5,
          comment: 'Clear diagnosis and practical rehabilitation plan for my knee injury. Highly recommended.',
          patientId: patientUser2.id,
        },
      ],
    },
  ];

  for (const docData of doctorsData) {
    // Create/update User record
    const user = await prisma.user.upsert({
      where: { email: docData.email },
      update: {
        name: docData.name,
        role: 'DOCTOR',
      },
      create: {
        name: docData.name,
        email: docData.email,
        passwordHash: defaultPasswordHash,
        role: 'DOCTOR',
      },
    });

    // Create/update DoctorProfile
    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {
        specialization: docData.specialization,
        experienceYears: docData.experienceYears,
        consultationFee: docData.consultationFee,
        medicalLicenseNumber: docData.medicalLicenseNumber,
        bio: docData.bio,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
      },
      create: {
        userId: user.id,
        specialization: docData.specialization,
        experienceYears: docData.experienceYears,
        consultationFee: docData.consultationFee,
        medicalLicenseNumber: docData.medicalLicenseNumber,
        bio: docData.bio,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
      },
    });

    // Seed sample reviews via past completed appointments
    for (let i = 0; i < docData.reviews.length; i++) {
      const reviewItem = docData.reviews[i];
      const pastDate = `2026-08-1${i + 1}`;

      // Check if an appointment already exists for this review
      let appointment = await prisma.appointment.findFirst({
        where: {
          userId: reviewItem.patientId,
          doctorId: user.id,
          date: pastDate,
        },
      });

      if (!appointment) {
        appointment = await prisma.appointment.create({
          data: {
            userId: reviewItem.patientId,
            doctorId: user.id,
            date: pastDate,
            time: '11:00 AM',
            status: 'COMPLETED',
          },
        });
      }

      await prisma.review.upsert({
        where: { appointmentId: appointment.id },
        update: {
          rating: reviewItem.rating,
          comment: reviewItem.comment,
        },
        create: {
          appointmentId: appointment.id,
          doctorId: user.id,
          patientId: reviewItem.patientId,
          rating: reviewItem.rating,
          comment: reviewItem.comment,
        },
      });
    }

    console.log(`✅ Seeded doctor: ${docData.name} (${docData.specialization}) - ID: ${user.id}`);
  }

  console.log('🎉 Seeding complete! 8 doctors seeded with verified status and reviews.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
