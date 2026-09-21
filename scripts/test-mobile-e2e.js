const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production_min_32_chars';
const API_URL = 'http://localhost:5000/api';

async function runMobileE2ETest() {
  console.log('=== STARTING MOBILE E2E PORT & VERIFICATION TEST ===\n');

  // 1. Fetch real test users from DB
  const patient = await prisma.user.findFirst({
    where: { email: 'shubhamnayak394@gmail.com' }
  });
  const doctor = await prisma.user.findFirst({
    where: { email: '2401301028@geetauniversity.edu.in' },
    include: { doctorProfile: true }
  });
  const otherDoctor = await prisma.user.findFirst({
    where: { email: 'aadesh@gmail.com' },
    include: { doctorProfile: true }
  });

  if (!patient || !doctor || !otherDoctor) {
    throw new Error('Required test users not found in database');
  }

  console.log(`Patient: ${patient.name} (${patient.email}) [ID: ${patient.id}]`);
  console.log(`Doctor: ${doctor.name} (${doctor.email}) [ID: ${doctor.id}]`);
  console.log(`Other Doctor: ${otherDoctor.name} (${otherDoctor.email}) [ID: ${otherDoctor.id}]\n`);

  // Generate tokens simulating mobile login
  const patientToken = jwt.sign({ id: patient.id, email: patient.email, role: patient.role }, JWT_SECRET, { expiresIn: '1h' });
  const doctorToken = jwt.sign({ id: doctor.id, email: doctor.email, role: doctor.role }, JWT_SECRET, { expiresIn: '1h' });
  const otherDoctorToken = jwt.sign({ id: otherDoctor.id, email: otherDoctor.email, role: otherDoctor.role }, JWT_SECRET, { expiresIn: '1h' });

  // TEST 1: CSRF TOKEN ON MOBILE BOOKING
  console.log('--- TEST 1: Mobile Booking Flow & CSRF Check ---');
  // Clean up any test appointment at this slot first to prevent duplicate conflict
  const testDate = '2026-09-25';
  const testTime = '10:30 AM';
  await prisma.appointment.deleteMany({
    where: {
      userId: patient.id,
      date: testDate,
      time: testTime,
    }
  });

  const bookRes = await fetch(`${API_URL}/appointments/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Platform': 'mobile',
      'Authorization': `Bearer ${patientToken}`,
    },
    body: JSON.stringify({
      doctorId: doctor.id,
      date: testDate,
      time: testTime,
    }),
  });

  const bookData = await bookRes.json();
  console.log(`Booking response status: ${bookRes.status}`);
  console.log(`Booking response body:`, JSON.stringify(bookData, null, 2));

  if (!bookRes.ok || !bookData.success || !bookData.data?.id) {
    throw new Error(`Mobile booking failed: ${bookData.message || 'Unknown error'}`);
  }
  const createdApptId = bookData.data.id;
  console.log(`>>> Booking succeeded without CSRF errors! Appointment ID: ${createdApptId}\n`);

  // TEST 2: DOCTOR SCOPING & APPOINTMENTS RETRIEVAL
  console.log('--- TEST 2: Doctor Appointment Scoping ---');
  const doctorApptsRes = await fetch(`${API_URL}/doctor/me/appointments`, {
    headers: {
      'X-Client-Platform': 'mobile',
      'Authorization': `Bearer ${doctorToken}`,
    },
  });
  const doctorApptsData = await doctorApptsRes.json();
  const doctorApptIds = (doctorApptsData.data || []).map((a) => a.id);
  console.log(`Doctor ${doctor.name} sees ${doctorApptIds.length} appointments:`, doctorApptIds);

  const appearsInDoctorList = doctorApptIds.includes(createdApptId);
  console.log(`Newly booked appointment appears in doctor's list: ${appearsInDoctorList}`);
  if (!appearsInDoctorList) {
    throw new Error('Appointment did not appear in assigned doctor list!');
  }

  // Verify other doctor does NOT see this appointment
  const otherDoctorApptsRes = await fetch(`${API_URL}/doctor/me/appointments`, {
    headers: {
      'X-Client-Platform': 'mobile',
      'Authorization': `Bearer ${otherDoctorToken}`,
    },
  });
  const otherDoctorApptsData = await otherDoctorApptsRes.json();
  const otherDoctorApptIds = (otherDoctorApptsData.data || []).map((a) => a.id);
  const otherDoctorSeesAppt = otherDoctorApptIds.includes(createdApptId);
  console.log(`Other doctor (${otherDoctor.name}) sees this appointment: ${otherDoctorSeesAppt} (Expected: false)`);
  if (otherDoctorSeesAppt) {
    throw new Error('Doctor scoping failed: unassigned doctor can see patient appointment!');
  }
  console.log('>>> Doctor scoping confirmed: appointments are strictly isolated per doctor!\n');

  // TEST 3: JOIN CALL & ROOM MATCHING
  console.log('--- TEST 3: Video Consultation Room Matching ---');
  // Patient joins
  const patientJoinRes = await fetch(`${API_URL}/appointments/${createdApptId}/join`, {
    headers: {
      'X-Client-Platform': 'mobile',
      'Authorization': `Bearer ${patientToken}`,
    },
  });
  const patientJoinData = await patientJoinRes.json();
  console.log('Patient join response:', JSON.stringify(patientJoinData.data, null, 2));

  // Doctor joins
  const doctorJoinRes = await fetch(`${API_URL}/appointments/${createdApptId}/join`, {
    headers: {
      'X-Client-Platform': 'mobile',
      'Authorization': `Bearer ${doctorToken}`,
    },
  });
  const doctorJoinData = await doctorJoinRes.json();
  console.log('Doctor join response:', JSON.stringify(doctorJoinData.data, null, 2));

  const patientRoomName = patientJoinData.data?.roomName;
  const doctorRoomName = doctorJoinData.data?.roomName;
  const patientRoomUrl = patientJoinData.data?.roomUrl;
  const doctorRoomUrl = doctorJoinData.data?.roomUrl;

  console.log(`Patient Room Name: ${patientRoomName}`);
  console.log(`Doctor Room Name:  ${doctorRoomName}`);
  console.log(`Room names match exactly: ${patientRoomName === doctorRoomName}`);
  console.log(`Room URLs match exactly:  ${patientRoomUrl === doctorRoomUrl}`);

  if (!patientRoomName || patientRoomName !== doctorRoomName) {
    throw new Error('Room name mismatch between doctor and patient!');
  }

  console.log('\n=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
}

runMobileE2ETest()
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
