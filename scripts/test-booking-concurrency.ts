/**
 * Phase 3 — Database & Concurrency Verification:
 * Test Appointment Booking Race Condition & Conflict Prevention
 */

import prisma from '../src/lib/prisma';
import { appointmentService } from '../src/services/appointment.service';

async function testBookingConcurrency() {
  console.log('============================================================');
  console.log('⚡ PHASE 3: DATABASE CONCURRENCY & BOOKING SAFETY AUDIT');
  console.log('============================================================\n');

  // 1. Ensure unique partial index exists on PostgreSQL
  console.log('1. Applying/Verifying Unique Active Slot Partial Index...');
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "appointments_unique_active_slot_idx" 
    ON "appointments" ("doctorId", "date", "time") 
    WHERE "status" != 'CANCELLED';
  `);
  console.log('   ✅ "appointments_unique_active_slot_idx" verified active.');

  // 2. Fetch a verified doctor to use for testing
  const doctor = await prisma.doctorProfile.findFirst({
    where: { verificationStatus: 'APPROVED' },
    include: { user: true },
  });

  if (!doctor) {
    console.error('❌ No verified doctor found in DB for concurrency test.');
    process.exit(1);
  }

  // 3. Find or create two test patient accounts
  const patient1 = await prisma.user.upsert({
    where: { email: 'concurrency_pat1@curalink-test.health' },
    update: {},
    create: {
      name: 'Concurrency Patient Alpha',
      email: 'concurrency_pat1@curalink-test.health',
      role: 'PATIENT',
    },
  });

  const patient2 = await prisma.user.upsert({
    where: { email: 'concurrency_pat2@curalink-test.health' },
    update: {},
    create: {
      name: 'Concurrency Patient Beta',
      email: 'concurrency_pat2@curalink-test.health',
      role: 'PATIENT',
    },
  });

  const testDate = '2026-11-20';
  const testTime = '02:30 PM';

  // Clean up any previous test booking for this test slot
  await prisma.appointment.deleteMany({
    where: {
      doctorId: doctor.userId,
      date: testDate,
      time: testTime,
    },
  });

  console.log(`\n2. Firing TWO concurrent booking requests for doctor ${doctor.user.name} on ${testDate} at ${testTime}...`);

  let successCount = 0;
  let conflictCount = 0;
  const errors: string[] = [];

  const [req1, req2] = await Promise.allSettled([
    appointmentService.bookAppointment(patient1.id, {
      doctorId: doctor.userId,
      date: testDate,
      time: testTime,
    }),
    appointmentService.bookAppointment(patient2.id, {
      doctorId: doctor.userId,
      date: testDate,
      time: testTime,
    }),
  ]);

  if (req1.status === 'fulfilled') {
    successCount++;
    console.log('   ✅ Request 1: Booking CONFIRMED (ID:', req1.value.id, ')');
  } else {
    conflictCount++;
    errors.push(req1.reason.message);
    console.log('   🛡️  Request 1: Correctly Rejected:', req1.reason.message);
  }

  if (req2.status === 'fulfilled') {
    successCount++;
    console.log('   ✅ Request 2: Booking CONFIRMED (ID:', req2.value.id, ')');
  } else {
    conflictCount++;
    errors.push(req2.reason.message);
    console.log('   🛡️  Request 2: Correctly Rejected:', req2.reason.message);
  }

  // 4. Verify Database state: strictly 1 active appointment exists for this slot
  const slotCount = await prisma.appointment.count({
    where: {
      doctorId: doctor.userId,
      date: testDate,
      time: testTime,
      status: { not: 'CANCELLED' },
    },
  });

  console.log('\n3. Database Invariant Check:');
  console.log(`   - Successful bookings count: ${successCount}`);
  console.log(`   - Conflicted rejections count: ${conflictCount}`);
  console.log(`   - Active DB records in slot: ${slotCount}`);

  if (successCount === 1 && conflictCount === 1 && slotCount === 1) {
    console.log('\n🏆 VERIFICATION PASSED: Double booking prevented under concurrent race condition!');
  } else {
    console.error('\n❌ VERIFICATION FAILED: Race condition allowed double booking or both failed.');
    process.exit(1);
  }

  // Clean up test records
  await prisma.appointment.deleteMany({
    where: {
      doctorId: doctor.userId,
      date: testDate,
      time: testTime,
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: { in: ['concurrency_pat1@curalink-test.health', 'concurrency_pat2@curalink-test.health'] },
    },
  });
  console.log('✨ Test appointments & ephemeral test patients cleaned up successfully.\n');
}

testBookingConcurrency()
  .catch((err) => {
    console.error('Fatal concurrency test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
