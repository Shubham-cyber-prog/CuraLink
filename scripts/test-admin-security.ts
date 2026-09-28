import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

async function testAdminSecurity() {
  console.log('=================================================================');
  console.log('         CURALINK ADMIN DASHBOARD RBAC & SECURITY AUDIT          ');
  console.log('=================================================================\n');

  // Fetch or setup users
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
  const patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });

  if (!admin || !doctor || !patient) {
    throw new Error('Required roles missing from database');
  }

  console.log(`[USER] Admin User:   ${admin.name} (${admin.email})`);
  console.log(`[USER] Doctor User:  ${doctor.name} (${doctor.email})`);
  console.log(`[USER] Patient User: ${patient.name} (${patient.email})\n`);

  const adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: 'ADMIN' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const doctorToken = jwt.sign(
    { id: doctor.id, email: doctor.email, role: 'DOCTOR' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const patientToken = jwt.sign(
    { id: patient.id, email: patient.email, role: 'PATIENT' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // -------------------------------------------------------------
  // TEST 1: Backend RBAC Enforcement on All Admin Endpoints
  // -------------------------------------------------------------
  const adminEndpoints = [
    { method: 'GET', path: '/api/admin/stats' },
    { method: 'GET', path: '/api/admin/doctors' },
    { method: 'GET', path: '/api/admin/users' },
    { method: 'GET', path: '/api/admin/appointments' },
    { method: 'GET', path: '/api/admin/erasure-requests' },
    { method: 'GET', path: '/api/admin/audit-logs' },
    { method: 'PUT', path: `/api/admin/doctors/${doctor.id}/verify-status`, body: { status: 'APPROVED' } },
  ];

  console.log('--- TEST 1: UNAUTHENTICATED ACCESS TO ADMIN APIS ---');
  for (const ep of adminEndpoints) {
    const res = await fetch(`http://localhost:5000${ep.path}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    console.log(`[Unauthenticated] ${ep.method} ${ep.path} -> Status: ${res.status}`);
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401/403 for unauthenticated request to ${ep.path}, got ${res.status}`);
    }
  }
  console.log('✅ Unauthenticated requests strictly rejected (401/403 Unauthorized/Forbidden)\n');

  console.log('--- TEST 2: PATIENT ACCESS TO ADMIN APIS ---');
  for (const ep of adminEndpoints) {
    const res = await fetch(`http://localhost:5000${ep.path}`, {
      method: ep.method,
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    console.log(`[Patient Role] ${ep.method} ${ep.path} -> Status: ${res.status}`);
    if (res.status !== 403) {
      throw new Error(`Expected 403 for patient request to ${ep.path}, got ${res.status}`);
    }
  }
  console.log('✅ Patient role strictly rejected with 403 Forbidden\n');

  console.log('--- TEST 3: DOCTOR ACCESS TO ADMIN APIS ---');
  for (const ep of adminEndpoints) {
    const res = await fetch(`http://localhost:5000${ep.path}`, {
      method: ep.method,
      headers: {
        Authorization: `Bearer ${doctorToken}`,
        'Content-Type': 'application/json',
      },
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    console.log(`[Doctor Role] ${ep.method} ${ep.path} -> Status: ${res.status}`);
    if (res.status !== 403) {
      throw new Error(`Expected 403 for doctor request to ${ep.path}, got ${res.status}`);
    }
  }
  console.log('✅ Doctor role strictly rejected with 403 Forbidden\n');

  console.log('--- TEST 4: ADMIN ACCESS TO ADMIN APIS ---');
  for (const ep of adminEndpoints) {
    const res = await fetch(`http://localhost:5000${ep.path}`, {
      method: ep.method,
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    console.log(`[Admin Role] ${ep.method} ${ep.path} -> Status: ${res.status}`);
    if (res.status !== 200) {
      throw new Error(`Expected 200 for admin request to ${ep.path}, got ${res.status}`);
    }
  }
  console.log('✅ Admin role successfully authorized with 200 OK\n');

  // -------------------------------------------------------------
  // TEST 5 & 6: Full Approve & Reject End-to-End Flow
  // -------------------------------------------------------------
  console.log('--- TEST 5: DOCTOR VERIFICATION APPROVAL & PATIENT DIRECTORY REFLECTION ---');
  
  // Create a new doctor in PENDING verification status
  const testDoctorEmail = `pending.doc.${Date.now()}@curalink.com`;
  const testDoctorUser = await prisma.user.create({
    data: {
      name: 'Dr. Test Pending',
      email: testDoctorEmail,
      passwordHash: 'dummyhash123',
      role: 'DOCTOR',
    },
  });

  const testDoctorProfile = await prisma.doctorProfile.create({
    data: {
      userId: testDoctorUser.id,
      medicalLicenseNumber: `MED-TEST-${Date.now().toString().slice(-6)}`,
      specialization: 'Cardiology',
      experienceYears: 10,
      consultationFee: 750,
      consultationModes: ['VIDEO', 'IN_PERSON'],
      verificationStatus: 'PENDING',
      city: 'Kolkata',
    },
  });

  console.log(`[CREATED] Test Doctor: ${testDoctorUser.name} (${testDoctorUser.id})`);
  console.log(`[INITIAL STATUS] Verification Status: ${testDoctorProfile.verificationStatus}`);

  // 1. Confirm pending doctor does NOT appear in patient-facing Find Doctor results
  let verifiedDocsRes = await fetch('http://localhost:5000/api/doctors/verified');
  let verifiedDocsData = await verifiedDocsRes.json();
  let appearsInPublic = (verifiedDocsData.data || []).some(
    (d: any) => d.userId === testDoctorUser.id || d.id === testDoctorUser.id
  );
  console.log(`Appears in patient-facing Find Doctor list while PENDING: ${appearsInPublic ? '❌ YES (INCORRECT)' : '✅ NO (CORRECT)'}`);
  if (appearsInPublic) {
    throw new Error('Pending doctor was visible in public verified directory!');
  }

  // 2. Admin clicks "Approve" (calls PUT /api/admin/doctors/:id/verify-status)
  console.log('\nAdmin approves doctor via PUT /api/admin/doctors/:id/verify-status...');
  const approveRes = await fetch(`http://localhost:5000/api/admin/doctors/${testDoctorUser.id}/verify-status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'APPROVED' }),
  });

  console.log(`Approve API Response Status: ${approveRes.status}`);
  const approveData = await approveRes.json();
  console.log(`API Message: ${approveData.message}`);

  // Confirm database record updated to APPROVED
  const dbDocApproved = await prisma.doctorProfile.findUnique({
    where: { userId: testDoctorUser.id },
  });
  console.log(`Database Verification Status: ${dbDocApproved?.verificationStatus}`);
  console.log(`Database verifiedAt Timestamp: ${dbDocApproved?.verifiedAt}`);

  if (dbDocApproved?.verificationStatus !== 'APPROVED') {
    throw new Error(`Expected APPROVED in DB, got ${dbDocApproved?.verificationStatus}`);
  }

  // 3. Confirm doctor IMMEDIATELY appears in patient-facing Find Doctor results
  verifiedDocsRes = await fetch('http://localhost:5000/api/doctors/verified');
  verifiedDocsData = await verifiedDocsRes.json();
  appearsInPublic = (verifiedDocsData.data || []).some(
    (d: any) => d.userId === testDoctorUser.id || d.id === testDoctorUser.id
  );
  console.log(`Appears in patient-facing Find Doctor list after APPROVAL: ${appearsInPublic ? '✅ YES (CORRECT)' : '❌ NO'}`);
  if (!appearsInPublic) {
    throw new Error('Approved doctor was NOT found in public verified directory!');
  }

  // -------------------------------------------------------------
  // TEST 6: Reject Doctor Flow
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: DOCTOR REJECTION & PATIENT DIRECTORY EXCLUSION ---');
  console.log('Admin rejects doctor via PUT /api/admin/doctors/:id/verify-status...');

  const rejectRes = await fetch(`http://localhost:5000/api/admin/doctors/${testDoctorUser.id}/verify-status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'REJECTED' }),
  });

  console.log(`Reject API Response Status: ${rejectRes.status}`);
  const rejectData = await rejectRes.json();
  console.log(`API Message: ${rejectData.message}`);

  // Confirm database record updated to REJECTED
  const dbDocRejected = await prisma.doctorProfile.findUnique({
    where: { userId: testDoctorUser.id },
  });
  console.log(`Database Verification Status: ${dbDocRejected?.verificationStatus}`);

  if (dbDocRejected?.verificationStatus !== 'REJECTED') {
    throw new Error(`Expected REJECTED in DB, got ${dbDocRejected?.verificationStatus}`);
  }

  // Confirm doctor NEVER appears in patient-facing Find Doctor results after rejection
  verifiedDocsRes = await fetch('http://localhost:5000/api/doctors/verified');
  verifiedDocsData = await verifiedDocsRes.json();
  appearsInPublic = (verifiedDocsData.data || []).some(
    (d: any) => d.userId === testDoctorUser.id || d.id === testDoctorUser.id
  );
  console.log(`Appears in patient-facing Find Doctor list after REJECTION: ${appearsInPublic ? '❌ YES (INCORRECT)' : '✅ NO (CORRECT)'}`);
  if (appearsInPublic) {
    throw new Error('Rejected doctor was found in public verified directory!');
  }

  // Cleanup test doctor
  await prisma.doctorProfile.delete({ where: { id: testDoctorProfile.id } });
  await prisma.user.delete({ where: { id: testDoctorUser.id } });
  console.log('\n[CLEANUP] Test doctor records removed successfully.');

  console.log('\n=================================================================');
  console.log('   🎉 ALL ADMIN DASHBOARD SECURITY & VERIFICATION TESTS PASSED!  ');
  console.log('=================================================================\n');
}

testAdminSecurity().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
