const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding/Fixing Doctor Profiles & Roles ---');

  // 1. Subham Nayak (Geeta University & Gmail)
  const subhamEmails = ['2401301021@geetauniversity.edu.in', 'sn343555@gmail.com'];
  for (const email of subhamEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'DOCTOR' },
      });

      await prisma.doctorProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          specialization: 'General Medicine & Cardiology',
          medicalLicenseNumber: 'NMC-2024-88492',
          experienceYears: 8,
          consultationFee: 500,
          consultationModes: ['VIDEO', 'IN_PERSON'],
          city: 'Hisar',
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          bio: 'Senior Consultant Physician specializing in internal medicine, cardiometabolic wellness, and telehealth care.',
        },
        update: {
          specialization: 'General Medicine & Cardiology',
          medicalLicenseNumber: 'NMC-2024-88492',
          experienceYears: 8,
          consultationFee: 500,
          consultationModes: ['VIDEO', 'IN_PERSON'],
          city: 'Hisar',
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
          bio: 'Senior Consultant Physician specializing in internal medicine, cardiometabolic wellness, and telehealth care.',
        },
      });
      console.log(`Updated Subham Nayak (${email}) -> DOCTOR with approved profile.`);
    }
  }

  // 2. Aadesh Jogi
  const aadesh = await prisma.user.findUnique({ where: { email: '2401301081@geetauniversity.edu.in' } });
  if (aadesh) {
    await prisma.user.update({
      where: { id: aadesh.id },
      data: { role: 'DOCTOR' },
    });
    await prisma.doctorProfile.upsert({
      where: { userId: aadesh.id },
      create: {
        userId: aadesh.id,
        specialization: 'Neurology & Internal Medicine',
        medicalLicenseNumber: 'NMC-2023-77210',
        experienceYears: 6,
        consultationFee: 600,
        consultationModes: ['VIDEO', 'IN_PERSON'],
        city: 'Hisar',
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: 'Consultant Neurologist and Internal Medicine specialist with extensive experience in neurological diagnostics and clinical care.',
      },
      update: {
        specialization: 'Neurology & Internal Medicine',
        medicalLicenseNumber: 'NMC-2023-77210',
        experienceYears: 6,
        consultationFee: 600,
        consultationModes: ['VIDEO', 'IN_PERSON'],
        city: 'Hisar',
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: 'Consultant Neurologist and Internal Medicine specialist with extensive experience in neurological diagnostics and clinical care.',
      },
    });
    console.log(`Updated Aadesh Jogi -> DOCTOR with approved profile.`);
  }

  // 3. Dr. Debabrata Banerjee (if in DB)
  const drDebabrata = await prisma.user.findFirst({
    where: { email: { startsWith: 'dr_audit_' } },
  });
  if (drDebabrata) {
    await prisma.doctorProfile.upsert({
      where: { userId: drDebabrata.id },
      create: {
        userId: drDebabrata.id,
        specialization: 'Dermatology & Skin Care',
        medicalLicenseNumber: 'NMC-2021-55412',
        experienceYears: 12,
        consultationFee: 700,
        consultationModes: ['VIDEO', 'IN_PERSON'],
        city: 'Hisar',
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: 'Experienced Board-Certified Dermatologist focusing on clinical dermatology, allergies, and skin disorders.',
      },
      update: {
        specialization: 'Dermatology & Skin Care',
        medicalLicenseNumber: 'NMC-2021-55412',
        experienceYears: 12,
        consultationFee: 700,
        consultationModes: ['VIDEO', 'IN_PERSON'],
        city: 'Hisar',
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: 'Experienced Board-Certified Dermatologist focusing on clinical dermatology, allergies, and skin disorders.',
      },
    });
    console.log(`Updated Dr. Debabrata -> DOCTOR with approved profile.`);
  }

  // 4. Dr. Gregory House (if in DB)
  const drHouse = await prisma.user.findFirst({
    where: { email: { startsWith: 'test_doctor_' } },
  });
  if (drHouse) {
    await prisma.doctorProfile.upsert({
      where: { userId: drHouse.id },
      create: {
        userId: drHouse.id,
        specialization: 'Diagnostic Medicine & Infectious Disease',
        medicalLicenseNumber: 'NMC-2015-11099',
        experienceYears: 20,
        consultationFee: 1200,
        consultationModes: ['VIDEO'],
        city: 'Hisar',
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: 'Chief of Diagnostic Medicine specializing in rare pathologies, complex symptom analysis, and second opinions.',
      },
      update: {
        specialization: 'Diagnostic Medicine & Infectious Disease',
        medicalLicenseNumber: 'NMC-2015-11099',
        experienceYears: 20,
        consultationFee: 1200,
        consultationModes: ['VIDEO'],
        city: 'Hisar',
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: 'Chief of Diagnostic Medicine specializing in rare pathologies, complex symptom analysis, and second opinions.',
      },
    });
    console.log(`Updated Dr. Gregory House -> DOCTOR with approved profile.`);
  }

  // Also ensure 2 more verified doctors exist in the system for great variety across specialties
  const additionalDocs = [
    {
      name: 'Dr. Priya Sharma',
      email: 'dr.priya.sharma@curalink.health',
      specialization: 'Pediatrics & Child Care',
      medicalLicenseNumber: 'NMC-2019-33814',
      experienceYears: 10,
      consultationFee: 550,
      consultationModes: ['VIDEO', 'IN_PERSON'],
      city: 'Hisar',
      bio: 'Senior Pediatrician dedicated to neonatal health, childhood preventive immunizations, and developmental wellness.',
    },
    {
      name: 'Dr. Rajesh Verma',
      email: 'dr.rajesh.verma@curalink.health',
      specialization: 'Orthopedics & Joint Care',
      medicalLicenseNumber: 'NMC-2017-44910',
      experienceYears: 15,
      consultationFee: 750,
      consultationModes: ['VIDEO', 'IN_PERSON'],
      city: 'Hisar',
      bio: 'Consultant Orthopedic Surgeon specializing in sports injuries, arthritis management, and spine rehabilitation.',
    },
  ];

  for (const doc of additionalDocs) {
    let u = await prisma.user.findUnique({ where: { email: doc.email } });
    if (!u) {
      u = await prisma.user.create({
        data: {
          name: doc.name,
          email: doc.email,
          role: 'DOCTOR',
          passwordHash: '$2b$10$Y/GkfxeG8A.o4nABIZIuuuONWSn6gs/3v68LYZrN5lr5hGI84DMgy', // dummy hash
        },
      });
    } else {
      await prisma.user.update({
        where: { id: u.id },
        data: { role: 'DOCTOR', name: doc.name },
      });
    }

    await prisma.doctorProfile.upsert({
      where: { userId: u.id },
      create: {
        userId: u.id,
        specialization: doc.specialization,
        medicalLicenseNumber: doc.medicalLicenseNumber,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        consultationModes: doc.consultationModes,
        city: doc.city,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: doc.bio,
      },
      update: {
        specialization: doc.specialization,
        medicalLicenseNumber: doc.medicalLicenseNumber,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        consultationModes: doc.consultationModes,
        city: doc.city,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        bio: doc.bio,
      },
    });
    console.log(`Ensured ${doc.name} (${doc.specialization}) in ${doc.city} is active.`);
  }

  const count = await prisma.doctorProfile.count();
  console.log(`Total active DoctorProfiles in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error('Error seeding doctors:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
