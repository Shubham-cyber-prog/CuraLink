import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import { Role } from '../src/types/role';

const BASE_URL = 'http://localhost:5000';

function generateTestToken(id: string, email: string, role: Role): string {
  return jwt.sign(
    { id, email, role },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function runAuthRbacTests() {
  console.log('🚀 Starting RBAC & Cross-User Security Audit Verification...\n');

  const patientAToken = generateTestToken('patient-a-uuid', 'patienta@test.com', Role.PATIENT);
  const patientBToken = generateTestToken('patient-b-uuid', 'patientb@test.com', Role.PATIENT);
  const doctorToken = generateTestToken('doctor-uuid', 'doctor@test.com', Role.DOCTOR);

  let passed = 0;
  let failed = 0;

  // TEST 1: Doctor-only endpoint rejects patient token
  try {
    const res = await fetch(`${BASE_URL}/api/doctor/me/dashboard-stats`, {
      headers: { Authorization: `Bearer ${patientAToken}` }
    });
    if (res.status === 403) {
      console.log('✅ TEST 1 PASSED: Patient token correctly rejected from /api/doctor/me/* with HTTP 403.');
      passed++;
    } else {
      console.error(`❌ TEST 1 FAILED: Expected 403, got ${res.status}`);
      failed++;
    }
  } catch (err: any) {
    console.error('❌ TEST 1 ERROR:', err.message);
    failed++;
  }

  // TEST 2: Patient-only endpoint rejects doctor token
  try {
    const res = await fetch(`${BASE_URL}/api/appointments/book`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${doctorToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ doctorId: 'doc-1', date: '2026-10-10', time: '10:00' })
    });
    if (res.status === 403) {
      console.log('✅ TEST 2 PASSED: Doctor token correctly rejected from patient-only booking with HTTP 403.');
      passed++;
    } else {
      console.error(`❌ TEST 2 FAILED: Expected 403, got ${res.status}`);
      failed++;
    }
  } catch (err: any) {
    console.error('❌ TEST 2 ERROR:', err.message);
    failed++;
  }

  // TEST 3: Cross-user privacy: Patient A cannot query Patient B's vitals
  try {
    const res = await fetch(`${BASE_URL}/api/vitals/patient/patient-b-uuid`, {
      headers: { Authorization: `Bearer ${patientAToken}` }
    });
    if (res.status === 403) {
      console.log('✅ TEST 3 PASSED: Patient A attempting to access Patient B vitals blocked with HTTP 403.');
      passed++;
    } else {
      console.error(`❌ TEST 3 FAILED: Expected 403, got ${res.status}`);
      failed++;
    }
  } catch (err: any) {
    console.error('❌ TEST 3 ERROR:', err.message);
    failed++;
  }

  // TEST 4: Unauthenticated access to vitals is blocked with 401
  try {
    const res = await fetch(`${BASE_URL}/api/vitals`);
    if (res.status === 401) {
      console.log('✅ TEST 4 PASSED: Unauthenticated access to /api/vitals blocked with HTTP 401.');
      passed++;
    } else {
      console.error(`❌ TEST 4 FAILED: Expected 401, got ${res.status}`);
      failed++;
    }
  } catch (err: any) {
    console.error('❌ TEST 4 ERROR:', err.message);
    failed++;
  }

  // TEST 5: Unauthenticated access to ML risk routes is blocked with 401
  try {
    const res = await fetch(`${BASE_URL}/api/risk/diabetes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ glucose: 120, bmi: 24, age: 35 })
    });
    if (res.status === 401) {
      console.log('✅ TEST 5 PASSED: Unauthenticated access to /api/risk/diabetes blocked with HTTP 401.');
      passed++;
    } else {
      console.error(`❌ TEST 5 FAILED: Expected 401, got ${res.status}`);
      failed++;
    }
  } catch (err: any) {
    console.error('❌ TEST 5 ERROR:', err.message);
    failed++;
  }

  // TEST 6: Doctor without consultation relationship cannot access patient vitals
  try {
    const res = await fetch(`${BASE_URL}/api/vitals/patient/patient-b-uuid`, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    if (res.status === 403) {
      console.log('✅ TEST 6 PASSED: Doctor without consultation relationship blocked from patient vitals with HTTP 403.');
      passed++;
    } else {
      console.error(`❌ TEST 6 FAILED: Expected 403, got ${res.status}`);
      failed++;
    }
  } catch (err: any) {
    console.error('❌ TEST 6 ERROR:', err.message);
    failed++;
  }

  // TEST 7: Doctor without consultation relationship cannot access patient dashboard profile
  try {
    const res = await fetch(`${BASE_URL}/api/doctor/me/patients/patient-b-uuid`, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    // Should be 404 (patient not in DB) or 403 (unauthorized consultation relationship)
    if (res.status === 403 || res.status === 404) {
      console.log(`✅ TEST 7 PASSED: Doctor without consultation relationship blocked from patient profile with HTTP ${res.status}.`);
      passed++;
    } else {
      console.error(`❌ TEST 7 FAILED: Expected 403 or 404, got ${res.status}`);
      failed++;
    }
  } catch (err: any) {
    console.error('❌ TEST 7 ERROR:', err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Security Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthRbacTests();
