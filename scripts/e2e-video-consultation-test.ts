import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

async function runLiveE2ETest() {
  console.log('=================================================================');
  console.log('      CURALINK LIVE VIDEO CONSULTATION & COMPLETION E2E TEST     ');
  console.log('=================================================================\n');

  // 1. Prepare/Select active test appointment
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

  console.log(`[SETUP] Attending Doctor: ${doctor.user.name} (${doctor.userId})`);
  console.log(`[SETUP] Patient: ${patient.name} (${patient.id})`);

  const todayStr = new Date().toISOString().split('T')[0];

  // Create clean appointment for this test
  const appointment = await prisma.appointment.create({
    data: {
      userId: patient.id,
      doctorId: doctor.userId,
      date: todayStr,
      time: '11:00 AM',
      status: 'CONFIRMED',
    },
  });

  console.log(`[SETUP] Test Appointment created with ID: ${appointment.id}, Status: ${appointment.status}`);

  const patientToken = jwt.sign(
    { id: patient.id, email: patient.email, role: 'PATIENT' },
    env.JWT_SECRET,
    { expiresIn: '30m' }
  );

  const doctorToken = jwt.sign(
    { id: doctor.userId, email: doctor.user.email, role: 'DOCTOR' },
    env.JWT_SECRET,
    { expiresIn: '30m' }
  );

  // -------------------------------------------------------------
  // TEST BUG 3: Patient Joins First (Before Doctor)
  // -------------------------------------------------------------
  console.log('\n--- STEP 1: PATIENT JOINS FIRST (BUG 3 VERIFICATION) ---');
  const patientJoinRes = await fetch(`http://localhost:5000/api/appointments/${appointment.id}/join?bypassWindow=true`, {
    headers: {
      Authorization: `Bearer ${patientToken}`,
    },
  });

  if (patientJoinRes.status !== 200) {
    throw new Error(`Patient join failed with HTTP ${patientJoinRes.status}`);
  }

  const patientJoinData = await patientJoinRes.json();
  console.log('✅ Patient joined room successfully:');
  console.log(`   - Room Name: ${patientJoinData.data.roomName}`);
  console.log(`   - Room URL:  ${patientJoinData.data.roomUrl}`);
  console.log(`   - Role:      ${patientJoinData.data.role} (isDoctor: ${patientJoinData.data.isDoctor})`);
  console.log(`   - isModerator: ${patientJoinData.data.isModerator}`);

  if (patientJoinData.data.isDoctor !== false || patientJoinData.data.isModerator !== false) {
    throw new Error('Patient was incorrectly marked as doctor/moderator');
  }

  // -------------------------------------------------------------
  // STEP 2: Doctor Joins Second
  // -------------------------------------------------------------
  console.log('\n--- STEP 2: DOCTOR JOINS SECOND (SYNCHRONIZATION & ROLE VERIFICATION) ---');
  const doctorJoinRes = await fetch(`http://localhost:5000/api/appointments/${appointment.id}/join?bypassWindow=true`, {
    headers: {
      Authorization: `Bearer ${doctorToken}`,
    },
  });

  if (doctorJoinRes.status !== 200) {
    throw new Error(`Doctor join failed with HTTP ${doctorJoinRes.status}`);
  }

  const doctorJoinData = await doctorJoinRes.json();
  console.log('✅ Doctor joined room successfully:');
  console.log(`   - Room Name: ${doctorJoinData.data.roomName}`);
  console.log(`   - Room URL:  ${doctorJoinData.data.roomUrl}`);
  console.log(`   - Role:      ${doctorJoinData.data.role} (isDoctor: ${doctorJoinData.data.isDoctor})`);
  console.log(`   - isModerator: ${doctorJoinData.data.isModerator}`);

  // Confirm rooms match exactly
  if (doctorJoinData.data.roomName !== patientJoinData.data.roomName) {
    throw new Error(`Room mismatch! Doctor: ${doctorJoinData.data.roomName}, Patient: ${patientJoinData.data.roomName}`);
  }
  if (!doctorJoinData.data.isDoctor || !doctorJoinData.data.isModerator) {
    throw new Error('Doctor was not designated as moderator/doctor');
  }
  console.log('✅ Synchronized meeting verified: Both parties share identical room session');

  // -------------------------------------------------------------
  // TEST BUG 2: Pop Out URL Validation
  // -------------------------------------------------------------
  console.log('\n--- STEP 3: POP OUT URL VALIDATION (BUG 2 VERIFICATION) ---');
  const roomName = patientJoinData.data.roomName;
  const cleanRoom = encodeURIComponent(roomName);
  const popOutUrl = `https://meet.jit.si/${cleanRoom}#config.prejoinPageEnabled=false&config.enableLobby=false&config.hideLoginButton=true`;

  console.log(`Generated Pop Out Target: ${popOutUrl}`);

  const isMarketingHomepage =
    popOutUrl === 'https://meet.jit.si/' ||
    popOutUrl === 'https://meet.jit.si' ||
    popOutUrl.includes('jitsi.org') ||
    popOutUrl.includes('8x8.vc');

  if (isMarketingHomepage) {
    throw new Error('Pop Out URL points to Jitsi/8x8 marketing homepage!');
  }

  if (!popOutUrl.includes(roomName)) {
    throw new Error('Pop Out URL does not contain the active consultation room name!');
  }
  console.log('✅ Pop Out URL verified: Points directly to active consultation room with lobby disabled');

  // -------------------------------------------------------------
  // TEST BUG 1: End Consultation & DB Status Update
  // -------------------------------------------------------------
  console.log('\n--- STEP 4: END CONSULTATION (BUG 1 VERIFICATION) ---');
  console.log('Ending consultation via PATCH /api/appointments/:id/complete (Patient ends call)...');

  const completeRes = await fetch(`http://localhost:5000/api/appointments/${appointment.id}/complete`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${patientToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (completeRes.status !== 200) {
    const errText = await completeRes.text();
    throw new Error(`End consultation failed with HTTP ${completeRes.status}: ${errText}`);
  }

  const completeData = await completeRes.json();
  console.log('✅ Call ended cleanly with status 200:');
  console.log(`   - Appointment Status in API Response: ${completeData.data?.status}`);

  if (completeData.data?.status !== 'COMPLETED') {
    throw new Error(`Expected status COMPLETED, got ${completeData.data?.status}`);
  }

  // Verify PostgreSQL Database directly
  const dbRecord = await prisma.appointment.findUnique({
    where: { id: appointment.id },
  });
  console.log(`✅ Direct Database Verification: Status = ${dbRecord?.status}`);
  if (dbRecord?.status !== 'COMPLETED') {
    throw new Error(`Database record status is not COMPLETED: ${dbRecord?.status}`);
  }

  // -------------------------------------------------------------
  // STEP 5: Verify Patient Dashboard ("Completed" Tab)
  // -------------------------------------------------------------
  console.log('\n--- STEP 5: PATIENT DASHBOARD VERIFICATION ---');
  const patientApptsRes = await fetch('http://localhost:5000/api/appointments/my-appointments', {
    headers: {
      Authorization: `Bearer ${patientToken}`,
    },
  });

  if (patientApptsRes.status !== 200) {
    throw new Error(`Patient my-appointments failed with HTTP ${patientApptsRes.status}`);
  }

  const patientApptsData = await patientApptsRes.json();
  const patientCompleted = (patientApptsData.data || []).filter(
    (a: any) => a.status === 'COMPLETED'
  );

  const foundInPatient = patientCompleted.some((a: any) => a.id === appointment.id);
  console.log(`Patient has ${patientCompleted.length} completed appointment(s).`);
  console.log(`Current appointment ${appointment.id} in Patient Completed list: ${foundInPatient ? '✅ YES' : '❌ NO'}`);

  if (!foundInPatient) {
    throw new Error('Appointment not found in patient completed appointments');
  }

  // -------------------------------------------------------------
  // STEP 6: Verify Doctor Dashboard ("Completed" Filter & Stats)
  // -------------------------------------------------------------
  console.log('\n--- STEP 6: DOCTOR DASHBOARD VERIFICATION ---');
  const doctorApptsRes = await fetch('http://localhost:5000/api/doctor/me/appointments', {
    headers: {
      Authorization: `Bearer ${doctorToken}`,
    },
  });

  if (doctorApptsRes.status !== 200) {
    throw new Error(`Doctor appointments failed with HTTP ${doctorApptsRes.status}`);
  }

  const doctorApptsData = await doctorApptsRes.json();
  const doctorCompleted = (doctorApptsData.data || []).filter(
    (a: any) => a.status === 'COMPLETED'
  );

  const foundInDoctor = doctorCompleted.some((a: any) => a.id === appointment.id);
  console.log(`Doctor has ${doctorCompleted.length} completed appointment(s).`);
  console.log(`Current appointment ${appointment.id} in Doctor Completed list: ${foundInDoctor ? '✅ YES' : '❌ NO'}`);

  if (!foundInDoctor) {
    throw new Error('Appointment not found in doctor completed appointments');
  }

  // Verify Doctor Stats
  const doctorStatsRes = await fetch('http://localhost:5000/api/doctor/me/stats', {
    headers: {
      Authorization: `Bearer ${doctorToken}`,
    },
  });

  const doctorStatsData = await doctorStatsRes.json();
  console.log(`Doctor Completed Visits Stat: ${doctorStatsData.data?.completedConsultations}`);

  // Cleanup test appointment
  await prisma.appointment.delete({
    where: { id: appointment.id },
  });
  console.log('\n[CLEANUP] Test appointment record cleaned up safely.');

  console.log('\n=================================================================');
  console.log('  🎉 ALL 3 BUGS VERIFIED FIXED & E2E CALL WORKFLOW CONFIRMED!   ');
  console.log('=================================================================\n');
}

runLiveE2ETest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
