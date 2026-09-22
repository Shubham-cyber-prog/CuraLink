import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

const BACKEND_URL = 'http://localhost:5000/api';

async function runWebVideoAndAppointmentAudit() {
  console.log('====================================================');
  console.log('STARTING CURALINK PRODUCTION WORKFLOW & VIDEO AUDIT');
  console.log('====================================================\n');

  // 1. Get or create a verified doctor
  let doctorUser = await prisma.user.findFirst({
    where: { role: 'DOCTOR' },
  });

  if (!doctorUser) {
    doctorUser = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Smith',
        email: `dr.smith.${Date.now()}@curalink.test`,
        role: 'DOCTOR',
        phoneVerified: true,
      },
    });
  }

  // Ensure doctor profile is APPROVED
  let doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: doctorUser.id },
  });

  if (!doctorProfile) {
    doctorProfile = await prisma.doctorProfile.create({
      data: {
        userId: doctorUser.id,
        medicalLicenseNumber: 'MCI-TEST-998822',
        specialization: 'Cardiology',
        experienceYears: 10,
        consultationFee: 750,
        verificationStatus: 'APPROVED',
      },
    });
  } else if (doctorProfile.verificationStatus !== 'APPROVED') {
    doctorProfile = await prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: { verificationStatus: 'APPROVED' },
    });
  }

  // 2. Get or create a patient
  let patientUser = await prisma.user.findFirst({
    where: { role: 'PATIENT' },
  });

  if (!patientUser) {
    patientUser = await prisma.user.create({
      data: {
        name: 'Rahul Sharma',
        email: `rahul.${Date.now()}@curalink.test`,
        role: 'PATIENT',
        phoneVerified: true,
      },
    });
  }

  // Generate tokens
  const patientToken = jwt.sign(
    { id: patientUser.id, email: patientUser.email, role: 'PATIENT' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const doctorToken = jwt.sign(
    { id: doctorUser.id, email: doctorUser.email, role: 'DOCTOR' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const otherPatientToken = jwt.sign(
    { id: 'wrong-patient-id-12345', email: 'other@test.com', role: 'PATIENT' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Format today's date and current time for live window test
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const currentLiveTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

  // Future date for time-window test (next year)
  const futureDateStr = `${yyyy + 1}-01-15`;
  const futureTimeStr = '10:30 AM';

  console.log(`[Setup] Doctor: ${doctorUser.name} (${doctorUser.id})`);
  console.log(`[Setup] Patient: ${patientUser.name} (${patientUser.id})`);
  console.log(`[Setup] Current Live Timestamp: ${todayStr} at ${currentLiveTime}\n`);

  let passCount = 0;
  let failCount = 0;

  function assert(title: string, passed: boolean, details?: string) {
    if (passed) {
      console.log(`✅ PASS: ${title}`);
      if (details) console.log(`   ${details}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      if (details) console.error(`   ${details}`);
      failCount++;
    }
  }

  // TEST 1: Booking outside window (Future appointment)
  const futureAppt = await prisma.appointment.create({
    data: {
      userId: patientUser.id,
      doctorId: doctorUser.id,
      date: futureDateStr,
      time: futureTimeStr,
      status: 'CONFIRMED',
    },
  });

  const futureJoinRes = await fetch(`${BACKEND_URL}/appointments/${futureAppt.id}/join`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const futureJoinData = await futureJoinRes.json();
  assert(
    'Time Window Security: Reject join when appointment is in future',
    futureJoinRes.status === 400 && futureJoinData.message?.includes('10 minutes prior'),
    `HTTP ${futureJoinRes.status}: "${futureJoinData.message}"`
  );

  // TEST 2: Active live appointment (Inside window)
  const liveAppt = await prisma.appointment.create({
    data: {
      userId: patientUser.id,
      doctorId: doctorUser.id,
      date: todayStr,
      time: currentLiveTime,
      status: 'CONFIRMED',
    },
  });

  const patientJoinRes = await fetch(`${BACKEND_URL}/appointments/${liveAppt.id}/join`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const patientJoinData = await patientJoinRes.json();
  assert(
    'Patient Authorization & Join: Connects within valid consultation window',
    patientJoinRes.status === 200 && Boolean(patientJoinData.data?.roomName),
    `Room Name: ${patientJoinData.data?.roomName}, URL: ${patientJoinData.data?.roomUrl}`
  );

  // TEST 3: Doctor joins same live appointment
  const doctorJoinRes = await fetch(`${BACKEND_URL}/appointments/${liveAppt.id}/join`, {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const doctorJoinData = await doctorJoinRes.json();
  assert(
    'Doctor Authorization & Join: Joins same live appointment',
    doctorJoinRes.status === 200 && Boolean(doctorJoinData.data?.roomName),
    `Doctor Joined Room: ${doctorJoinData.data?.roomName}`
  );

  // TEST 4: Room Synchronization (Both receive exact same room name & URL)
  assert(
    'Room Synchronization: Patient and Doctor receive identical Jitsi room credentials',
    patientJoinData.data?.roomName === doctorJoinData.data?.roomName &&
      patientJoinData.data?.roomUrl === doctorJoinData.data?.roomUrl,
    `Patient Room: ${patientJoinData.data?.roomName} === Doctor Room: ${doctorJoinData.data?.roomName}`
  );

  // TEST 5: IDOR Security Check (Unauthorized user cannot access consultation)
  const intruderJoinRes = await fetch(`${BACKEND_URL}/appointments/${liveAppt.id}/join`, {
    headers: { Authorization: `Bearer ${otherPatientToken}` },
  });
  assert(
    'IDOR / Authorization Protection: Unauthorized user is rejected with 403 Forbidden',
    intruderJoinRes.status === 403,
    `HTTP ${intruderJoinRes.status}`
  );

  // TEST 6: Patient cancels appointment via PATCH /:id/status
  const cancelRes = await fetch(`${BACKEND_URL}/appointments/${liveAppt.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patientToken}`,
    },
    body: JSON.stringify({ status: 'CANCELLED' }),
  });
  const cancelData = await cancelRes.json();
  assert(
    'Real Appointment Cancellation: Patient cancels confirmed appointment',
    cancelRes.status === 200 && cancelData.data?.status === 'CANCELLED',
    `Database Status Updated to: ${cancelData.data?.status}`
  );

  // TEST 7: Cancelled appointment cannot be joined
  const cancelledJoinRes = await fetch(`${BACKEND_URL}/appointments/${liveAppt.id}/join`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const cancelledJoinData = await cancelledJoinRes.json();
  assert(
    'Cancelled Appointment Security: Join rejected when status is CANCELLED',
    cancelledJoinRes.status === 400 && cancelledJoinData.message?.includes('cancelled'),
    `HTTP ${cancelledJoinRes.status}: "${cancelledJoinData.message}"`
  );

  // TEST 8: Complete consultation flow via POST /api/consultations/:id/complete
  const completeAppt = await prisma.appointment.create({
    data: {
      userId: patientUser.id,
      doctorId: doctorUser.id,
      date: todayStr,
      time: currentLiveTime,
      status: 'CONFIRMED',
    },
  });

  const completeRes = await fetch(`${BACKEND_URL}/consultations/${completeAppt.id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const completeData = await completeRes.json();
  const dbCompletedAppt = await prisma.appointment.findUnique({ where: { id: completeAppt.id } });

  assert(
    'Call Completion Flow: Consultation is completed and saved to database',
    completeRes.status === 200 && dbCompletedAppt?.status === 'COMPLETED',
    `HTTP ${completeRes.status}, DB Status: ${dbCompletedAppt?.status}`
  );

  // TEST 9: Completed appointment cannot be rejoined
  const completedJoinRes = await fetch(`${BACKEND_URL}/appointments/${completeAppt.id}/join`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const completedJoinData = await completedJoinRes.json();
  assert(
    'Completed Appointment Security: Re-join rejected when status is COMPLETED',
    completedJoinRes.status === 400 && completedJoinData.message?.includes('completed'),
    `HTTP ${completedJoinRes.status}: "${completedJoinData.message}"`
  );

  console.log('\n====================================================');
  console.log(`AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runWebVideoAndAppointmentAudit()
  .catch((err) => {
    console.error('Audit execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
