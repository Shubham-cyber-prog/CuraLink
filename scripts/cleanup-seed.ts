import prisma from '../src/lib/prisma';

// Known fake/seed emails to remove
const SEED_EMAILS = [
  'patient.sample@curalink.com',
  'patient.meera@curalink.com',
  'priya.sharma@curalink.com',
  'marcus.vance@curalink.com',
  'sarah.jenkins@curalink.com',
  'kenji.sato@curalink.com',
  'elena.rostova@curalink.com',
  'aisha.rahman@curalink.com',
  'christian.lind@curalink.com',
  'rajesh.patel@curalink.com',
  // In case example.com domain was used
  'rohan.verma@example.com',
  'meera.iyer@example.com',
  'aarav.patel@example.com',
  'anjali.d@example.com',
];

// Ephemeral test accounts created during automated test runs
const AUTOMATION_TEST_EMAILS = [
  'testmobileuser999@example.com',
];

async function cleanup() {
  console.log('🧹 Starting safe database cleanup of fake seed data...\n');

  // 1. Identify users to delete
  const seedUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { in: SEED_EMAILS } },
        { email: { in: AUTOMATION_TEST_EMAILS } },
        { email: { endsWith: '@curalink.com' } },
        { email: { startsWith: 'user_1788' } },
        { email: { startsWith: 'dr.test.' } },
      ],
    },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log(`Found ${seedUsers.length} seed/test accounts to remove:`);
  for (const u of seedUsers) {
    console.log(`  - [${u.role}] ${u.name} (${u.email})`);
  }

  if (seedUsers.length > 0) {
    const seedUserIds = seedUsers.map((u) => u.id);

    // Delete seed appointments directly first to be certain no orphaned references remain
    const deletedAppointments = await prisma.appointment.deleteMany({
      where: {
        OR: [
          { userId: { in: seedUserIds } },
          { doctorId: { in: seedUserIds } },
        ],
      },
    });
    console.log(`\nDeleted ${deletedAppointments.count} seed/test appointments.`);

    // Delete reviews by or for seed users
    const deletedReviews = await prisma.review.deleteMany({
      where: {
        OR: [
          { patientId: { in: seedUserIds } },
          { doctorId: { in: seedUserIds } },
        ],
      },
    });
    console.log(`Deleted ${deletedReviews.count} seed reviews.`);

    // Delete doctor profiles for seed doctors
    const deletedProfiles = await prisma.doctorProfile.deleteMany({
      where: { userId: { in: seedUserIds } },
    });
    console.log(`Deleted ${deletedProfiles.count} seed doctor profiles.`);

    // Delete refresh tokens for seed users
    await prisma.refreshToken.deleteMany({
      where: { userId: { in: seedUserIds } },
    });

    // Delete the users
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: seedUserIds } },
    });
    console.log(`✅ Successfully deleted ${deletedUsers.count} seed users.\n`);
  } else {
    console.log('No seed accounts found to delete.\n');
  }

  // 2. Ensure real DOCTOR accounts have an APPROVED doctor profile so they work properly in Find Doctor and Doctor Dashboard
  const realDoctorUsers = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    include: { doctorProfile: true },
  });

  for (const doc of realDoctorUsers) {
    if (!doc.doctorProfile) {
      console.log(`Creating verified DoctorProfile for real doctor: ${doc.name} (${doc.email})...`);
      await prisma.doctorProfile.create({
        data: {
          userId: doc.id,
          specialization: 'General Physician',
          experienceYears: 5,
          consultationFee: 500,
          medicalLicenseNumber: 'MCI-REG-VALID',
          bio: `Dr. ${doc.name} is a certified medical practitioner providing general and specialized telemedicine care.`,
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
        },
      });
      console.log(`  -> DoctorProfile created and APPROVED for ${doc.name}.`);
    } else if (doc.doctorProfile.verificationStatus !== 'APPROVED') {
      await prisma.doctorProfile.update({
        where: { id: doc.doctorProfile.id },
        data: {
          verificationStatus: 'APPROVED',
          verifiedAt: new Date(),
        },
      });
      console.log(`  -> Approved existing DoctorProfile for ${doc.name}.`);
    }
  }

  // 3. Print remaining clean database state
  const remainingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\n======================================================`);
  console.log(`🎉 CLEANUP COMPLETE! Remaining Real Accounts in DB (${remainingUsers.length}):`);
  console.log(`======================================================`);
  for (const u of remainingUsers) {
    console.log(`• [${u.role.padEnd(7)}] ${u.name.padEnd(20)} <${u.email}>`);
  }

  const remainingAppointments = await prisma.appointment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      doctor: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  console.log(`\nRemaining Real Appointments: ${remainingAppointments.length}`);
  for (const a of remainingAppointments) {
    console.log(`• ${a.date} ${a.time} - ${a.user.name} with Dr. ${a.doctor.user.name} [${a.status}]`);
  }
}

cleanup()
  .catch((err) => {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
