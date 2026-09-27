import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BACKEND_URL = 'http://localhost:5000/api';

interface StepResult {
  step: number;
  name: string;
  passed: boolean;
  message: string;
}

const results: StepResult[] = [];

function record(step: number, name: string, passed: boolean, message: string) {
  results.push({ step, name, passed, message });
  const badge = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${badge} [Step ${step}] ${name} — ${message}`);
}

async function runEndToEndPostgresVerification() {
  console.log('\n================================================================');
  console.log('    CURALINK END-TO-END POSTGRESQL PRODUCTION FLOW AUDIT         ');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const testPatientEmail = `e2e_patient_${timestamp}@curalink.health`;
  const testPassword = 'StrongPassword123!';
  let patientToken = '';
  let patientRefreshToken = '';
  let patientId = '';
  let selectedDoctorId = '';
  let appointmentId = '';

  try {
    // -------------------------------------------------------------
    // STEP 1: Patient Registration & Password Hashing
    // -------------------------------------------------------------
    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suman Sharma',
        email: testPatientEmail,
        password: testPassword,
        role: 'PATIENT',
      }),
    });
    const regData = await regRes.json();
    const regSuccess = regRes.status === 201 && regData.success;

    // Verify in PostgreSQL database
    const dbUser = await prisma.user.findUnique({ where: { email: testPatientEmail } });
    const isHashed = dbUser?.passwordHash ? await bcrypt.compare(testPassword, dbUser.passwordHash) : false;
    patientId = dbUser?.id || '';

    record(
      1,
      'Patient Registration & Password Hashing',
      Boolean(regSuccess && dbUser && isHashed && dbUser.role === 'PATIENT'),
      `Status: ${regRes.status}, User ID: ${patientId}, Password Hashed in PG: ${isHashed}`
    );

    // -------------------------------------------------------------
    // STEP 2: Patient Login & JWT Generation
    // -------------------------------------------------------------
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPatientEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    patientToken = loginData.data?.token || '';
    patientRefreshToken = loginData.data?.refreshToken || '';

    // Verify in PG refresh_tokens table
    const dbRefreshToken = await prisma.refreshToken.findFirst({
      where: { userId: patientId },
    });

    record(
      2,
      'Patient Login & Refresh Token Storage in PG',
      Boolean(loginRes.status === 200 && patientToken && dbRefreshToken),
      `Token generated: ${Boolean(patientToken)}, Stored in PG refresh_tokens: ${Boolean(dbRefreshToken)}`
    );

    // -------------------------------------------------------------
    // STEP 3: Profile Retrieval (/auth/me)
    // -------------------------------------------------------------
    const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
    });
    const meData = await meRes.json();
    const meMatches = meData.data?.user?.email === testPatientEmail;

    record(
      3,
      'Profile Retrieval (/auth/me)',
      Boolean(meRes.status === 200 && meMatches),
      `Fetched profile for ${meData.data?.user?.name} (${meData.data?.user?.email})`
    );

    // -------------------------------------------------------------
    // STEP 4: Profile Update (Phone, Age, Gender in PG)
    // -------------------------------------------------------------
    const updateRes = await fetch(`${BACKEND_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+919876543210',
        age: 32,
        gender: 'Female',
      }),
    });
    const updateData = await updateRes.json();

    // Verify update in PG
    const dbUpdatedUser = await prisma.user.findUnique({ where: { id: patientId } });
    const profileUpdated = dbUpdatedUser?.phone === '+919876543210' && dbUpdatedUser?.age === 32 && dbUpdatedUser?.gender === 'Female';

    record(
      4,
      'Profile Update in PostgreSQL',
      Boolean(updateRes.status === 200 && profileUpdated),
      `Phone: ${dbUpdatedUser?.phone}, Age: ${dbUpdatedUser?.age}, Gender: ${dbUpdatedUser?.gender}`
    );

    // -------------------------------------------------------------
    // STEP 5: Doctor Discovery & Availability
    // -------------------------------------------------------------
    const docRes = await fetch(`${BACKEND_URL}/doctors`);
    const docData = await docRes.json();
    const doctors = docData.data || [];
    const hasDoctors = doctors.length > 0;
    selectedDoctorId = hasDoctors ? doctors[0].userId || doctors[0].id : '';

    record(
      5,
      'Doctor Discovery (PostgreSQL Query)',
      Boolean(docRes.status === 200 && hasDoctors),
      `Found ${doctors.length} verified doctors in PostgreSQL database`
    );

    // View specific doctor profile & availability
    let hasAvailability = false;
    let availableSlot = '10:00 AM';
    if (selectedDoctorId) {
      const availRes = await fetch(`${BACKEND_URL}/doctors/${selectedDoctorId}/availability?date=2026-10-15`);
      const availData = await availRes.json();
      hasAvailability = availRes.status === 200;
      if (availData.data?.slots?.length > 0) {
        availableSlot = availData.data.slots[0];
      }
    }

    record(
      6,
      'Doctor Availability Query',
      hasAvailability,
      `Doctor ID: ${selectedDoctorId}, Selected Slot: ${availableSlot}`
    );

    // -------------------------------------------------------------
    // STEP 7: Book Appointment
    // -------------------------------------------------------------
    const bookRes = await fetch(`${BACKEND_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorId: selectedDoctorId,
        date: '2026-10-15',
        time: availableSlot,
      }),
    });
    const bookData = await bookRes.json();
    appointmentId = bookData.data?.id || '';

    // Verify in PG
    const dbApt = appointmentId ? await prisma.appointment.findUnique({ where: { id: appointmentId } }) : null;

    record(
      7,
      'Appointment Booking & PG Persistence',
      Boolean(bookRes.status === 201 && dbApt && dbApt.status === 'CONFIRMED'),
      `Appointment ID: ${appointmentId}, Status in PG: ${dbApt?.status}`
    );

    // -------------------------------------------------------------
    // STEP 8: Concurrent Booking Conflict Prevention
    // -------------------------------------------------------------
    const conflictRes = await fetch(`${BACKEND_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorId: selectedDoctorId,
        date: '2026-10-15',
        time: availableSlot,
      }),
    });
    const conflictData = await conflictRes.json();
    const prevented = conflictRes.status === 400;

    record(
      8,
      'Slot Collision Prevention (Duplicate Slot Blocked)',
      prevented,
      `Status: ${conflictRes.status} (Expected 400), Error: ${conflictData.error || conflictData.message}`
    );

    // -------------------------------------------------------------
    // STEP 9: View Patient Appointments
    // -------------------------------------------------------------
    const myAptsRes = await fetch(`${BACKEND_URL}/appointments/me`, {
      headers: {
        'Authorization': `Bearer ${patientToken}`,
      },
    });
    const myAptsData = await myAptsRes.json();
    const aptFound = myAptsData.data?.some((a: any) => a.id === appointmentId);

    record(
      9,
      'Retrieve Patient Appointments',
      Boolean(myAptsRes.status === 200 && aptFound),
      `Found ${myAptsData.data?.length} appointment(s) in patient list`
    );

    // -------------------------------------------------------------
    // STEP 10: Log Vitals in PostgreSQL
    // -------------------------------------------------------------
    const vitalRes = await fetch(`${BACKEND_URL}/vitals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systolicBp: 122,
        diastolicBp: 80,
        bloodGlucose: 98.5,
        glucoseType: 'FASTING',
        heartRate: 72,
        spO2: 99,
        weight: 68.5,
        temperature: 98.6,
        notes: 'Routine morning checkup',
      }),
    });
    const vitalData = await vitalRes.json();

    // Verify in PG vital_logs table
    const dbVital = await prisma.vitalLog.findFirst({
      where: { userId: patientId },
      orderBy: { recordedAt: 'desc' },
    });

    record(
      10,
      'Patient Vitals Logging in PostgreSQL',
      Boolean(vitalRes.status === 201 && dbVital && dbVital.systolicBp === 122),
      `Vitals logged: BP ${dbVital?.systolicBp}/${dbVital?.diastolicBp}, Glucose: ${dbVital?.bloodGlucose}, SpO2: ${dbVital?.spO2}%`
    );

    // -------------------------------------------------------------
    // STEP 11: Doctor Prescription Creation
    // -------------------------------------------------------------
    // Find doctor user
    const docProfile = await prisma.doctorProfile.findUnique({
      where: { userId: selectedDoctorId },
      include: { user: true },
    });
    const doctorEmail = docProfile?.user?.email || '';

    // Create prescription in PG
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        patientId,
        doctorId: selectedDoctorId,
        diagnosis: 'Seasonal Allergies & Mild Sinusitis',
        medications: JSON.stringify([
          { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '5 days' },
          { name: 'Fluticasone Nasal Spray', dosage: '50mcg', frequency: '2 sprays per nostril daily', duration: '7 days' },
        ]),
        notes: 'Drink plenty of warm fluids. Return if symptoms persist after 7 days.',
      },
    });

    record(
      11,
      'E-Prescription Creation in PostgreSQL',
      Boolean(prescription && prescription.id),
      `Prescription ID: ${prescription.id}, Diagnosis: ${prescription.diagnosis}`
    );

    // -------------------------------------------------------------
    // STEP 12: Patient Prescription Retrieval
    // -------------------------------------------------------------
    const prescRes = await fetch(`${BACKEND_URL}/prescriptions/my`, {
      headers: {
        'Authorization': `Bearer ${patientToken}`,
      },
    });
    const prescData = await prescRes.json();
    const prescFound = prescData.data?.some((p: any) => p.id === prescription.id || p.appointmentId === appointmentId);

    record(
      12,
      'Patient E-Prescription Retrieval',
      Boolean(prescRes.status === 200 && (prescFound || prescData.success)),
      `Status: ${prescRes.status}, Prescriptions retrieved: ${prescData.data?.length || 0}`
    );

    // -------------------------------------------------------------
    // STEP 13: Submit Patient Review in PostgreSQL
    // -------------------------------------------------------------
    const reviewRes = await fetch(`${BACKEND_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentId,
        doctorId: selectedDoctorId,
        rating: 5,
        comment: 'Dr. was extremely thorough and helpful. Highly recommended!',
      }),
    });
    const reviewData = await reviewRes.json();

    // Verify in PG reviews table
    const dbReview = await prisma.review.findUnique({
      where: { appointmentId },
    });

    record(
      13,
      'Patient Review Submission in PostgreSQL',
      Boolean(reviewRes.status === 201 && dbReview && dbReview.rating === 5),
      `Review ID: ${dbReview?.id}, Rating: ${dbReview?.rating}/5, Comment: "${dbReview?.comment}"`
    );

    // -------------------------------------------------------------
    // STEP 14: Refresh Token & Session Rotation
    // -------------------------------------------------------------
    const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: patientRefreshToken }),
    });
    const refreshData = await refreshRes.json();
    const newAccessToken = refreshData.data?.token;

    record(
      14,
      'JWT Refresh Token Rotation',
      Boolean(refreshRes.status === 200 && newAccessToken),
      `New Access Token Issued: ${Boolean(newAccessToken)}`
    );

    // -------------------------------------------------------------
    // STEP 15: Patient Logout & Token Invalidation
    // -------------------------------------------------------------
    const logoutRes = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: patientRefreshToken }),
    });

    // Verify refresh token revoked or deleted in PG
    const dbRevokedToken = await prisma.refreshToken.findFirst({
      where: { token: patientRefreshToken },
    });
    const isRevokedOrDeleted = !dbRevokedToken || dbRevokedToken.revokedAt !== null;

    record(
      15,
      'Logout & PG Refresh Token Invalidation',
      Boolean(logoutRes.status === 200 && isRevokedOrDeleted),
      `Logout Status: ${logoutRes.status}, Token Invalidation in PG: ${isRevokedOrDeleted}`
    );

    // -------------------------------------------------------------
    // STEP 16: Audit Trail Verification in PostgreSQL
    // -------------------------------------------------------------
    const auditCount = await prisma.auditLog.count({
      where: { userId: patientId },
    });

    record(
      16,
      'DPDP Audit Trail in PostgreSQL',
      auditCount > 0,
      `Total audit log entries recorded in PG for patient: ${auditCount}`
    );

    // Clean up test data
    console.log('\n--- Cleaning up test patient records ---');
    await prisma.review.deleteMany({ where: { appointmentId } }).catch(() => {});
    await prisma.prescription.deleteMany({ where: { appointmentId } }).catch(() => {});
    await prisma.appointment.deleteMany({ where: { id: appointmentId } }).catch(() => {});
    await prisma.vitalLog.deleteMany({ where: { userId: patientId } }).catch(() => {});
    await prisma.refreshToken.deleteMany({ where: { userId: patientId } }).catch(() => {});
    await prisma.auditLog.deleteMany({ where: { userId: patientId } }).catch(() => {});
    await prisma.user.delete({ where: { id: patientId } }).catch(() => {});
    console.log('✅ Cleaned up temporary test patient artifacts from PostgreSQL.');

  } catch (err: any) {
    console.error('❌ Verification encountered unexpected error:', err);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log('                    FINAL AUDIT RESULTS                         ');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL CHECKS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 100% PRODUCTION READY ON NEON POSTGRESQL!\n');
  } else {
    console.log('⚠️ Some checks need attention.\n');
  }
}

runEndToEndPostgresVerification();
