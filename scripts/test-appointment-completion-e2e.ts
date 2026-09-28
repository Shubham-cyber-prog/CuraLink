import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

async function testBothCompletionScenarios() {
  console.log('=================================================================');
  console.log('  TESTING LIVE APPOINTMENT COMPLETION (PATIENT & DOCTOR FLOWS)   ');
  console.log('=================================================================\n');

  const doctor = await prisma.doctorProfile.findFirst({
    where: { verificationStatus: 'APPROVED' },
    include: { user: true },
  });

  if (!doctor || !doctor.user) {
    throw new Error('No approved doctor found in database');
  }

  const patient = await prisma.user.findFirst({
    where: { role: 'PATIENT' },
  });

  if (!patient) {
    throw new Error('No patient found in database');
  }

  console.log(`[PARTIES] Attending Doctor: ${doctor.user.name} (${doctor.userId})`);
  console.log(`[PARTIES] Patient:          ${patient.name} (${patient.id})\n`);

  const patientToken = jwt.sign(
    { id: patient.id, email: patient.email, role: 'PATIENT' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const doctorToken = jwt.sign(
    { id: doctor.userId, email: doctor.user.email, role: 'DOCTOR' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // =================================================================
  // SCENARIO A: Patient ends consultation first
  // =================================================================
  console.log('-----------------------------------------------------------------');
  console.log('SCENARIO A: PATIENT CLICKS "END CONSULTATION" FIRST');
  console.log('-----------------------------------------------------------------');

  const apptA = await prisma.appointment.create({
    data: {
      userId: patient.id,
      doctorId: doctor.userId,
      date: todayStr,
      time: '10:00 AM',
      status: 'CONFIRMED',
    },
  });
  console.log(`[1] Created Appointment A: ${apptA.id} (Status: ${apptA.status})`);

  // Both parties join
  const pJoinA = await fetch(`http://localhost:5000/api/appointments/${apptA.id}/join?bypassWindow=true`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  if (!pJoinA.ok) throw new Error(`Patient join A failed: ${pJoinA.status}`);
  const dJoinA = await fetch(`http://localhost:5000/api/appointments/${apptA.id}/join?bypassWindow=true`, {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  if (!dJoinA.ok) throw new Error(`Doctor join A failed: ${dJoinA.status}`);
  console.log('[2] Both Patient and Doctor successfully joined consultation room');

  // Patient ends consultation
  console.log('[3] Patient clicks "End Consultation" -> calling PATCH /complete...');
  const completeResA = await fetch(`http://localhost:5000/api/appointments/${apptA.id}/complete`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${patientToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!completeResA.ok) {
    const err = await completeResA.text();
    throw new Error(`Patient end consultation failed: ${completeResA.status} - ${err}`);
  }
  const completeDataA = await completeResA.json();
  console.log(`    Response status: ${completeResA.status}, Body status: ${completeDataA.data?.status}`);

  // 1. Confirm DB status updated to COMPLETED
  const dbApptA = await prisma.appointment.findUnique({ where: { id: apptA.id } });
  console.log(`[4] Direct DB Status: ${dbApptA?.status}`);
  if (dbApptA?.status !== 'COMPLETED') {
    throw new Error(`Expected COMPLETED in DB, got ${dbApptA?.status}`);
  }
  console.log('    ✅ Database updated to COMPLETED within seconds');

  // 2. Patient appointments listing ("Completed" tab)
  const pListA = await fetch('http://localhost:5000/api/appointments/my-appointments', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const pDataA = await pListA.json();
  const pFoundA = (pDataA.data || []).some((a: any) => a.id === apptA.id && a.status === 'COMPLETED');
  console.log(`[5] Appears in Patient's "Completed" Appointments: ${pFoundA ? '✅ YES' : '❌ NO'}`);
  if (!pFoundA) throw new Error('Appointment A not found in Patient completed list');

  // 3. Doctor dashboard listing ("Completed" filter)
  const dListA = await fetch('http://localhost:5000/api/doctor/me/appointments', {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const dDataA = await dListA.json();
  const dFoundA = (dDataA.data || []).some((a: any) => a.id === apptA.id && a.status === 'COMPLETED');
  console.log(`[6] Appears in Doctor's "Completed" Appointments filter: ${dFoundA ? '✅ YES' : '❌ NO'}`);
  if (!dFoundA) throw new Error('Appointment A not found in Doctor completed list');

  // Cleanup Appt A
  await prisma.appointment.delete({ where: { id: apptA.id } });
  console.log('    Test Appointment A cleaned up.\n');

  // =================================================================
  // SCENARIO B: Doctor ends consultation first
  // =================================================================
  console.log('-----------------------------------------------------------------');
  console.log('SCENARIO B: DOCTOR CLICKS "END CONSULTATION" FIRST');
  console.log('-----------------------------------------------------------------');

  const apptB = await prisma.appointment.create({
    data: {
      userId: patient.id,
      doctorId: doctor.userId,
      date: todayStr,
      time: '11:00 AM',
      status: 'CONFIRMED',
    },
  });
  console.log(`[1] Created Appointment B: ${apptB.id} (Status: ${apptB.status})`);

  // Both parties join
  const pJoinB = await fetch(`http://localhost:5000/api/appointments/${apptB.id}/join?bypassWindow=true`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  if (!pJoinB.ok) throw new Error(`Patient join B failed: ${pJoinB.status}`);
  const dJoinB = await fetch(`http://localhost:5000/api/appointments/${apptB.id}/join?bypassWindow=true`, {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  if (!dJoinB.ok) throw new Error(`Doctor join B failed: ${dJoinB.status}`);
  console.log('[2] Both Patient and Doctor successfully joined consultation room');

  // Doctor ends consultation
  console.log('[3] Doctor clicks "End Consultation" -> calling PATCH /complete...');
  const completeResB = await fetch(`http://localhost:5000/api/appointments/${apptB.id}/complete`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${doctorToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!completeResB.ok) {
    const err = await completeResB.text();
    throw new Error(`Doctor end consultation failed: ${completeResB.status} - ${err}`);
  }
  const completeDataB = await completeResB.json();
  console.log(`    Response status: ${completeResB.status}, Body status: ${completeDataB.data?.status}`);

  // 1. Confirm DB status updated to COMPLETED
  const dbApptB = await prisma.appointment.findUnique({ where: { id: apptB.id } });
  console.log(`[4] Direct DB Status: ${dbApptB?.status}`);
  if (dbApptB?.status !== 'COMPLETED') {
    throw new Error(`Expected COMPLETED in DB, got ${dbApptB?.status}`);
  }
  console.log('    ✅ Database updated to COMPLETED within seconds');

  // 2. Patient appointments listing ("Completed" tab)
  const pListB = await fetch('http://localhost:5000/api/appointments/my-appointments', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const pDataB = await pListB.json();
  const pFoundB = (pDataB.data || []).some((a: any) => a.id === apptB.id && a.status === 'COMPLETED');
  console.log(`[5] Appears in Patient's "Completed" Appointments: ${pFoundB ? '✅ YES' : '❌ NO'}`);
  if (!pFoundB) throw new Error('Appointment B not found in Patient completed list');

  // 3. Doctor dashboard listing ("Completed" filter)
  const dListB = await fetch('http://localhost:5000/api/doctor/me/appointments', {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const dDataB = await dListB.json();
  const dFoundB = (dDataB.data || []).some((a: any) => a.id === apptB.id && a.status === 'COMPLETED');
  console.log(`[6] Appears in Doctor's "Completed" Appointments filter: ${dFoundB ? '✅ YES' : '❌ NO'}`);
  if (!dFoundB) throw new Error('Appointment B not found in Doctor completed list');

  // Cleanup Appt B
  await prisma.appointment.delete({ where: { id: apptB.id } });
  console.log('    Test Appointment B cleaned up.\n');

  console.log('=================================================================');
  console.log('  🎉 BOTH PATIENT AND DOCTOR COMPLETION SCENARIOS PASSED 100%!   ');
  console.log('=================================================================\n');
}

testBothCompletionScenarios().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
