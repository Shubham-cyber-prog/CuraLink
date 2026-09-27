import 'dotenv/config';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database with realistic verified doctors, patients, admin, appointments, prescriptions, and reviews...');

  const defaultPasswordHash = await bcrypt.hash('DoctorSecurePass123!', 10);
  const patientPasswordHash = await bcrypt.hash('PatientSecurePass123!', 10);
  const adminPasswordHash = await bcrypt.hash('AdminSecurePass123!', 10);

  // 1. Seed System Administrator
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@curalink.health' },
    update: {
      role: 'ADMIN',
    },
    create: {
      name: 'System Administrator',
      email: 'admin@curalink.health',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Seeded Admin: ${adminUser.name} (${adminUser.email})`);

  // 2. Seed 3 Realistic Patients
  const patientUser1 = await prisma.user.upsert({
    where: { email: 'patient.sample@curalink.com' },
    update: {},
    create: {
      name: 'Rohan Verma',
      email: 'patient.sample@curalink.com',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      phone: '+919876543211',
      age: 29,
      gender: 'Male',
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
      phone: '+919876543212',
      age: 34,
      gender: 'Female',
    },
  });

  const patientUser3 = await prisma.user.upsert({
    where: { email: 'patient.aarav@curalink.com' },
    update: {},
    create: {
      name: 'Aarav Patel',
      email: 'patient.aarav@curalink.com',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      phone: '+919876543213',
      age: 41,
      gender: 'Male',
    },
  });
  console.log(`✅ Seeded 3 Patients: Rohan Verma, Meera Iyer, Aarav Patel`);

  // 3. Doctor definitions with realistic specializations, bios, fees, and licenses
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
          patientId: patientUser1.id,
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
      bio: 'Dr. Marcus Vance is a board-certified cardiologist specializing in preventive cardiology, hypertension management, and cardiovascular risk assessments.',
      reviews: [
        {
          rating: 5,
          comment: 'Dr. Vance gave an in-depth review of my ECG and blood reports. Superb bedside manner.',
          patientId: patientUser1.id,
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
      bio: 'Dr. Sarah Jenkins is an experienced dermatologist specializing in medical dermatology, adult acne, eczema, and skin cancer screenings.',
      reviews: [
        {
          rating: 5,
          comment: 'Prescribed a regimen that cleared my stubborn dermatitis within three weeks. Excellent!',
          patientId: patientUser1.id,
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
      bio: 'Dr. Kenji Sato is a compassionate pediatrician focused on childhood development, infant nutrition, and common pediatric conditions.',
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
      bio: 'Dr. Elena Rostova is a senior neurologist with two decades of experience treating chronic migraines, neuropathy, and sleep disorders.',
      reviews: [
        {
          rating: 5,
          comment: 'Finally found relief from chronic migraines after consulting Dr. Rostova. Brilliant specialist.',
          patientId: patientUser1.id,
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
      bio: 'Dr. Aisha Rahman is an empathetic gynecologist and obstetrician specializing in reproductive wellness, PCOS management, and prenatal care.',
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
      bio: 'Dr. Christian Lind is a psychiatrist specializing in adult ADHD, anxiety disorders, and depression.',
      reviews: [
        {
          rating: 5,
          comment: 'Extremely thoughtful and compassionate. The video consultation was seamless.',
          patientId: patientUser1.id,
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

    // Seed sample reviews & prescriptions via past completed appointments
    for (let i = 0; i < docData.reviews.length; i++) {
      const reviewItem = docData.reviews[i];
      const pastDate = `2026-08-1${i + 1}`;

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

      // Sample e-prescription for this consultation
      const existingPrescription = await prisma.prescription.findUnique({
        where: { appointmentId: appointment.id },
      });

      if (!existingPrescription) {
        await prisma.prescription.create({
          data: {
            appointmentId: appointment.id,
            doctorId: user.id,
            patientId: reviewItem.patientId,
            diagnosis: `${docData.specialization} Clinical Consultation & Care Plan`,
            medications: JSON.stringify([
              { name: 'Standard Clinical Medication', dosage: '500mg', frequency: 'As directed', duration: '5 days' },
              { name: 'Nutritional Support Supplement', dosage: '1 tablet', frequency: 'Once daily with meals', duration: '14 days' },
            ]),
            notes: 'Rest, hydrate, and maintain follow-up if symptoms persist.',
          },
        });
      }
    }

    console.log(`✅ Seeded doctor: ${docData.name} (${docData.specialization}) - ID: ${user.id}`);
  }

  console.log('🎉 Seeding complete! 1 Admin, 3 Patients, 8 Verified Doctors, Sample Appointments, Prescriptions, and Reviews ready.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
