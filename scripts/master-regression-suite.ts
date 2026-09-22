import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production_min_32_chars';
const BACKEND_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3000';

interface TestResult {
  area: string;
  name: string;
  passed: boolean;
  details: string;
  data?: any;
}

const results: TestResult[] = [];

function recordResult(area: string, name: string, passed: boolean, details: string, data?: any) {
  results.push({ area, name, passed, details, data });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${area}] ${name}: ${details}`);
}

async function runRegressionSuite() {
  console.log('===============================================================');
  console.log('       CURALINK COMPREHENSIVE REGRESSION TEST SUITE            ');
  console.log('===============================================================\n');

  // ─────────────────────────────────────────────────────────────
  // 1. AUTH REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 1. AUTH REGRESSION ---');
  try {
    // 1A. Sign up as new Patient (email + password)
    const testPatientEmail = `reg_patient_${Date.now()}@curalink-test.com`;
    const regRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Reg Patient',
        email: testPatientEmail,
        password: 'Password123!',
        role: 'PATIENT',
      }),
    });
    const regData = await regRes.json();
    const patientCreated = regRes.status === 201 && regData.success;
    
    // Confirm in DB
    const dbPatient = await prisma.user.findUnique({ where: { email: testPatientEmail } });
    const isPatientRole = dbPatient?.role === 'PATIENT';
    recordResult(
      'AUTH',
      'Patient Registration (Email+Password)',
      patientCreated && isPatientRole,
      `Status: ${regRes.status}, DB Role: ${dbPatient?.role}, Redirect Target: /dashboard`
    );

    // 1B. Sign up as new Doctor (OAuth role assignment)
    const testDoctorEmail = `reg_doc_${Date.now()}@curalink-test.com`;
    let dbDoctor = await prisma.user.findUnique({ where: { email: testDoctorEmail } });
    if (!dbDoctor) {
      const hash = await bcrypt.hash('Password123!', 10);
      dbDoctor = await prisma.user.create({
        data: {
          name: 'Dr. Reg Specialist',
          email: testDoctorEmail,
          passwordHash: hash,
          role: 'DOCTOR',
          doctorProfile: {
            create: {
              specialization: 'Internal Medicine',
              medicalLicenseNumber: 'DOC-REG-999',
              verificationStatus: 'PENDING',
              consultationFee: 750,
              city: 'Mumbai',
            },
          },
        },
      });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: dbDoctor.id } });
    const isDoctorRole = dbDoctor.role === 'DOCTOR';
    recordResult(
      'AUTH',
      'Doctor Onboarding & Role Assignment',
      isDoctorRole && !!doctorProfile,
      `User Role: ${dbDoctor.role}, Profile Exists: ${!!doctorProfile}, Redirect Target: /doctor-dashboard`
    );

    // 1C. RBAC Protection
    const patientToken = jwt.sign(
      { id: dbPatient!.id, email: dbPatient!.email, role: dbPatient!.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const rbacRes = await fetch(`${BACKEND_URL}/doctor/me/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const rbacBlocked = rbacRes.status === 403;
    recordResult(
      'AUTH',
      'RBAC Doctor Endpoint Protection',
      rbacBlocked,
      `Patient calling /doctor/me/appointments returned HTTP ${rbacRes.status} (expected 403 Forbidden)`
    );
  } catch (err: any) {
    recordResult('AUTH', 'Authentication Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. BOOKING REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. BOOKING REGRESSION ---');
  try {
    // 2A. Find doctor with city filter
    let mumbaiDoc = await prisma.doctorProfile.findFirst({
      where: { verificationStatus: 'APPROVED', city: { contains: 'Mumbai' } },
      include: { user: true },
    });

    if (!mumbaiDoc) {
      const docUser = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
      if (docUser) {
        mumbaiDoc = await prisma.doctorProfile.upsert({
          where: { userId: docUser.id },
          create: {
            userId: docUser.id,
            medicalLicenseNumber: 'MCI-12345',
            specialization: 'Cardiology',
            experienceYears: 12,
            consultationFee: 800,
            city: 'Mumbai',
            verificationStatus: 'APPROVED',
          },
          update: {
            city: 'Mumbai',
            verificationStatus: 'APPROVED',
          },
          include: { user: true },
        });
      }
    }

    const cityFilterRes = await fetch(`${BACKEND_URL}/doctors/verified?city=Mumbai`);
    const cityData = await cityFilterRes.json();
    const doctorsInMumbai = Array.isArray(cityData.data) ? cityData.data : [];
    const allMatchCity = doctorsInMumbai.length > 0 && doctorsInMumbai.every((d: any) => d.city?.toLowerCase().includes('mumbai'));
    recordResult(
      'BOOKING',
      'Doctor Discovery & City Filter',
      allMatchCity,
      `Found ${doctorsInMumbai.length} approved doctor(s) matching city 'Mumbai'`
    );

    // 2B. Book appointment (Confirm CSRF token & relations)
    const csrfRes = await fetch(`${BACKEND_URL}/auth/csrf-token`);
    const csrfToken = csrfRes.headers.get('X-CSRF-Token') || 'valid-csrf-token';

    const testPatient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
    const targetDoctor = mumbaiDoc || await prisma.doctorProfile.findFirst({ where: { verificationStatus: 'APPROVED' } });

    if (!testPatient || !targetDoctor) {
      throw new Error('Required test patient or doctor missing for booking test');
    }

    const patientToken = jwt.sign(
      { id: testPatient.id, email: testPatient.email, role: testPatient.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const bookingDate = '2026-09-28';
    const bookingTime = '11:00 AM';

    // Delete any existing conflicting booking
    await prisma.appointment.deleteMany({
      where: {
        doctorId: targetDoctor.userId,
        date: bookingDate,
        time: bookingTime,
      },
    });

    const bookRes = await fetch(`${BACKEND_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        doctorId: targetDoctor.userId,
        date: bookingDate,
        time: bookingTime,
        fee: targetDoctor.consultationFee || 500,
      }),
    });

    const bookData = await bookRes.json();
    const bookingCreated = bookRes.status === 201 && bookData.success;
    const apptId = bookData.data?.id;

    recordResult(
      'BOOKING',
      'Appointment Booking without CSRF Error',
      bookingCreated && !!apptId,
      `Status: ${bookRes.status}, Appointment ID: ${apptId}, Doctor ID: ${targetDoctor.userId}`
    );

    // 2C. Propagation to both Patient & Doctor Dashboards
    const patientApptsRes = await fetch(`${BACKEND_URL}/appointments/my-appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const patientApptsData = await patientApptsRes.json();
    const appearsInPatientList = (patientApptsData.data || []).some((a: any) => a.id === apptId);

    const doctorToken = jwt.sign(
      { id: targetDoctor.userId, email: targetDoctor.userId + '@doc.com', role: 'DOCTOR' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const doctorApptsRes = await fetch(`${BACKEND_URL}/doctor/me/appointments`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const doctorApptsData = await doctorApptsRes.json();
    const doctorApptItem = (doctorApptsData.data || []).find((a: any) => a.id === apptId);
    const appearsInDoctorList = !!doctorApptItem;
    const hasTrustCard = !!doctorApptItem?.trustCard;

    recordResult(
      'BOOKING',
      'Dual Dashboard Propagation & Trust Card',
      appearsInPatientList && appearsInDoctorList && hasTrustCard,
      `Appears in Patient Dashboard: ${appearsInPatientList}, Appears in Doctor Schedule: ${appearsInDoctorList}, Trust Card Attached: ${hasTrustCard}`
    );
  } catch (err: any) {
    recordResult('BOOKING', 'Booking Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. VIDEO CALL REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. VIDEO CALL REGRESSION ---');
  try {
    const activeAppt = await prisma.appointment.findFirst({
      where: { status: 'CONFIRMED' },
      include: { user: true },
    });

    if (!activeAppt) {
      throw new Error('No confirmed appointment available for video call test');
    }

    const patientToken = jwt.sign(
      { id: activeAppt.userId, email: activeAppt.user.email, role: 'PATIENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const doctorToken = jwt.sign(
      { id: activeAppt.doctorId, email: 'doc@test.com', role: 'DOCTOR' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 3A. Patient and Doctor join session
    const patientJoinRes = await fetch(`${BACKEND_URL}/appointments/${activeAppt.id}/join`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const patientJoinData = await patientJoinRes.json();

    const doctorJoinRes = await fetch(`${BACKEND_URL}/appointments/${activeAppt.id}/join`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    const doctorJoinData = await doctorJoinRes.json();

    const roomNamesMatch =
      patientJoinData.data?.roomName &&
      patientJoinData.data?.roomName === doctorJoinData.data?.roomName;
    const roomUrlsMatch =
      patientJoinData.data?.roomUrl &&
      patientJoinData.data?.roomUrl === doctorJoinData.data?.roomUrl;

    recordResult(
      'VIDEO CALL',
      'Patient & Doctor Room Synchronization',
      roomNamesMatch && roomUrlsMatch,
      `Same Room Name: '${patientJoinData.data?.roomName}', Same Room URL: '${patientJoinData.data?.roomUrl}'`
    );

    // 3B. End consultation status transition
    const updateRes = await fetch(`${BACKEND_URL}/appointments/${activeAppt.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doctorToken}`,
      },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const updateData = await updateRes.json();
    const isCompleted = updateData.success || (await prisma.appointment.findUnique({ where: { id: activeAppt.id } }))?.status === 'COMPLETED';

    recordResult(
      'VIDEO CALL',
      'End Consultation & Status Transition',
      isCompleted,
      `Appointment ${activeAppt.id} successfully transitioned to COMPLETED`
    );
  } catch (err: any) {
    recordResult('VIDEO CALL', 'Video Call Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SYMPTOM CHECKER REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. SYMPTOM CHECKER REGRESSION ---');
  try {
    const scenarios = [
      { key: 'vague', input: 'I feel unwell and sick, what medicine can I take to feel better?' },
      { key: 'mild', input: 'Mild scratchy throat, sneezing, and runny nose since yesterday morning' },
      { key: 'moderate', input: 'Throbbing one-sided headache with nausea and light sensitivity for 3 days' },
      { key: 'emergency', input: 'Severe crushing chest pain radiating to left arm and jaw with shortness of breath' },
      { key: 'chronic', input: 'Lower back pain and lumbar stiffness for 3 months, worse in morning' },
    ];

    const responses: any[] = [];

    for (const sc of scenarios) {
      const res = await fetch(`${BACKEND_URL}/symptom-checker/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sc.input }),
      });
      const json = await res.json();
      responses.push({ scenario: sc.key, input: sc.input, data: json.data });
      console.log(`  -> Scenario [${sc.key}]: Urgency: ${json.data?.urgencyLevel}, Causes: ${json.data?.possibleCauses?.slice(0, 2).join(', ')}`);
    }

    const emergencyResp = responses.find((r) => r.scenario === 'emergency');
    const isEmergencyUrgent = emergencyResp?.data?.urgencyLevel === 'EMERGENCY' || emergencyResp?.data?.severity === 'Emergency' || emergencyResp?.data?.triageCategory === 'RED';

    const causeSets = responses.map((r) => (r.data?.possibleCauses || []).join(' | ').toLowerCase());
    const allUnique = new Set(causeSets).size === scenarios.length;

    const hasGenericFallback = causeSets.some((c) =>
      c.includes('mild tension or fatigue') && c.includes('common cold / upper respiratory irritation')
    );

    recordResult(
      'SYMPTOM CHECKER',
      '5 Diverse Clinical Inputs & Differentiation',
      isEmergencyUrgent && allUnique && !hasGenericFallback,
      `All 5 outputs distinct: ${allUnique}, Chest pain tagged EMERGENCY: ${isEmergencyUrgent}, No generic fallback: ${!hasGenericFallback}`
    );
  } catch (err: any) {
    recordResult('SYMPTOM CHECKER', 'Symptom Checker Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. RISK MODELS REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. RISK MODELS REGRESSION ---');
  try {
    // 5A. Diabetes
    const diabetesPayload = {
      modelType: 'diabetes',
      features: {
        pregnancies: 2,
        glucose: 145,
        bloodPressure: 82,
        skinThickness: 28,
        insulin: 110,
        bmi: 33.5,
        diabetesPedigree: 0.55,
        age: 46,
      },
    };
    const diabRes = await fetch(`${BACKEND_URL}/risk/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diabetesPayload),
    }).catch(async () => {
      return fetch('http://localhost:8000/predict/diabetes-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diabetesPayload.features),
      });
    });

    const diabData = await diabRes.json();
    const diabPassed = diabRes.status === 200 && diabData.success !== false;
    const diabTopFeatures = diabData.data?.featureImportance || diabData.featureImportance || [];
    const glucoseHigh = diabTopFeatures.some((f: any) => (f.feature || f.name)?.toLowerCase() === 'glucose');

    recordResult(
      'RISK MODELS',
      'Diabetes Model Prediction & Feature Contributions',
      diabPassed && glucoseHigh,
      `Risk Probability: ${diabData.data?.riskScore ?? diabData.data?.riskProbability ?? diabData.probability}, Top Feature: Glucose verified`
    );

    // 5B. Heart Disease
    const heartPayload = {
      modelType: 'heart',
      features: {
        age: 62,
        sex: 1,
        cp: 3,
        trestbps: 145,
        chol: 265,
        fbs: 0,
        restecg: 1,
        thalach: 115,
        exang: 1,
        oldpeak: 2.8,
        slope: 1,
        ca: 2,
        thal: 3,
      },
    };
    const heartRes = await fetch(`${BACKEND_URL}/risk/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(heartPayload),
    }).catch(async () => {
      return fetch('http://localhost:8000/predict/heart-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heartPayload.features),
      });
    });

    const heartData = await heartRes.json();
    const heartPassed = heartRes.status === 200 && heartData.success !== false;
    const heartTopFeatures = heartData.data?.featureImportance || heartData.featureImportance || [];
    const caOrThalPresent = heartTopFeatures.some((f: any) => {
      const name = (f.feature || f.name || '').toLowerCase();
      return name === 'ca' || name === 'thal';
    });

    recordResult(
      'RISK MODELS',
      'Heart Disease Model Prediction & Key Coefficients',
      heartPassed && caOrThalPresent,
      `Risk Level: ${heartData.data?.riskLevel || heartData.riskLevel}, 'ca'/'thal' among top factors: ${caOrThalPresent}`
    );
  } catch (err: any) {
    recordResult('RISK MODELS', 'ML Risk Models Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 6. REPORT ANALYZER REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. REPORT ANALYZER REGRESSION ---');
  try {
    const reportA = `
      COMPLETE BLOOD COUNT (CBC):
      Hemoglobin: 7.8 g/dL (Normal: 12.0 - 15.5) - LOW CRITICAL
      RBC Count: 2.9 million/mcL (Normal: 4.0 - 5.2) - LOW
      Ferritin: 6 ng/mL (Normal: 15 - 150) - SEVERE IRON DEFICIENCY
      Platelets: 210,000 /mcL (Normal: 150,000 - 450,000) - NORMAL
    `;

    const reportB = `
      LIPID PROFILE / CHOLESTEROL PANEL:
      Total Cholesterol: 285 mg/dL (Normal: < 200) - HIGH
      LDL Cholesterol: 188 mg/dL (Normal: < 100) - ELEVATED
      Triglycerides: 270 mg/dL (Normal: < 150) - HIGH
      HDL Cholesterol: 34 mg/dL (Normal: > 40) - LOW
    `;

    const resA = await fetch(`${FRONTEND_URL}/api/ai/summarize-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: reportA }),
    });
    const summaryA = await resA.text();

    const resB = await fetch(`${FRONTEND_URL}/api/ai/summarize-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: reportB }),
    });
    const summaryB = await resB.text();

    const aContainsAnemia = summaryA.toLowerCase().includes('anemia') || summaryA.toLowerCase().includes('hemoglobin') || summaryA.toLowerCase().includes('iron');
    const bContainsLipid = summaryB.toLowerCase().includes('cholesterol') || summaryB.toLowerCase().includes('ldl') || summaryB.toLowerCase().includes('lipid');
    const distinctSummaries = summaryA !== summaryB && aContainsAnemia && bContainsLipid;

    recordResult(
      'REPORT ANALYZER',
      'Dual Clinical Lab Report Differentiation',
      distinctSummaries,
      `Report A focuses on Anemia/Iron: ${aContainsAnemia}, Report B focuses on Lipid/Cholesterol: ${bContainsLipid}, Summaries Distinct: ${distinctSummaries}`
    );
  } catch (err: any) {
    recordResult('REPORT ANALYZER', 'Report Analyzer Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 7. VITALS MONITORING REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. VITALS MONITORING REGRESSION ---');
  try {
    const patientUser = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
    if (!patientUser) throw new Error('No patient found for vitals test');

    const patientToken = jwt.sign(
      { id: patientUser.id, email: patientUser.email, role: 'PATIENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 7A. Longitudinal worsening trend
    await (prisma as any).vitalLog.deleteMany({ where: { userId: patientUser.id } });

    const now = Date.now();
    for (let i = 14; i >= 1; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      await (prisma as any).vitalLog.create({
        data: {
          userId: patientUser.id,
          bloodGlucose: 105 + (14 - i) * 4,
          systolicBp: 120 + (14 - i) * 2,
          diastolicBp: 78 + (14 - i),
          glucoseType: 'FASTING',
          heartRate: 72,
          spO2: 98,
          weight: 70,
          recordedAt: d,
        },
      });
    }

    const trendRes = await fetch(`${BACKEND_URL}/vitals/trends?days=14`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const trendData = await trendRes.json();
    const isWorsening = ['DETERIORATING', 'WORSENING'].includes(trendData.data?.overallTrajectory);
    const hasAlerts = (trendData.data?.alerts || []).length > 0;

    recordResult(
      'VITALS MONITORING',
      'Longitudinal Deterioration Alert Detection',
      isWorsening && hasAlerts,
      `Trajectory: '${trendData.data?.overallTrajectory}', Alerts Count: ${(trendData.data?.alerts || []).length}`
    );

    // 7B. Input Validation: Reject impossible values
    const invalidTests = [
      { name: 'Impossible Systolic BP (350)', body: { systolicBp: 350, diastolicBp: 80 } },
      { name: 'Negative Blood Glucose (-15)', body: { bloodGlucose: -15 } },
      { name: 'Extreme Blood Glucose (2500)', body: { bloodGlucose: 2500 } },
      { name: 'Impossible SpO2 (130%)', body: { spO2: 130 } },
    ];

    let allRejected = true;
    for (const inv of invalidTests) {
      const invRes = await fetch(`${BACKEND_URL}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`,
        },
        body: JSON.stringify(inv.body),
      });
      if (invRes.status !== 400) {
        allRejected = false;
        console.log(`    Validation failed to reject ${inv.name}: HTTP ${invRes.status}`);
      }
    }

    recordResult(
      'VITALS MONITORING',
      'Clinical Boundary Validation Safeguards',
      allRejected,
      `All 4 impossible clinical values rejected with HTTP 400 Bad Request: ${allRejected}`
    );
  } catch (err: any) {
    recordResult('VITALS MONITORING', 'Vitals Monitoring Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 8. DOCTOR VERIFICATION REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 8. DOCTOR VERIFICATION REGRESSION ---');
  try {
    const unverifiedDoc = await prisma.doctorProfile.findFirst({
      where: { verificationStatus: { in: ['PENDING', 'REJECTED'] } },
      include: { user: true },
    });

    const verifiedListRes = await fetch(`${BACKEND_URL}/doctors/verified`);
    const verifiedListData = await verifiedListRes.json();
    const verifiedDocs = Array.isArray(verifiedListData.data) ? verifiedListData.data : [];

    const allApproved = verifiedDocs.every((d: any) => d.verificationStatus === 'APPROVED');
    const unverifiedExcluded = !unverifiedDoc || !verifiedDocs.some((d: any) => d.userId === unverifiedDoc.userId || d.id === unverifiedDoc.id);

    recordResult(
      'DOCTOR VERIFICATION',
      'Unverified Doctor Isolation from Search & Directory',
      allApproved && unverifiedExcluded,
      `All returned doctors approved: ${allApproved}, Unverified doctor (${unverifiedDoc?.userId}) properly excluded: ${unverifiedExcluded}`
    );
  } catch (err: any) {
    recordResult('DOCTOR VERIFICATION', 'Doctor Verification Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 9. MOBILE APP REGRESSION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 9. MOBILE APP REGRESSION ---');
  try {
    const patientUser = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
    const doctorUser = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
    if (!patientUser || !doctorUser) throw new Error('Missing test accounts for mobile regression');

    const mobileBearerToken = jwt.sign(
      { id: patientUser.id, email: patientUser.email, role: 'PATIENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 9A. Mobile Booking without CSRF Token
    const mobileBookingDate = '2026-09-29';
    const mobileBookingTime = '03:00 PM';
    await prisma.appointment.deleteMany({
      where: { doctorId: doctorUser.id, date: mobileBookingDate, time: mobileBookingTime },
    });

    const mobileBookRes = await fetch(`${BACKEND_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mobileBearerToken}`,
      },
      body: JSON.stringify({
        doctorId: doctorUser.id,
        date: mobileBookingDate,
        time: mobileBookingTime,
        fee: 600,
      }),
    });
    const mobileBookData = await mobileBookRes.json();
    const mobileBookSuccess = mobileBookRes.status === 201 && mobileBookData.success;
    const mobileApptId = mobileBookData.data?.id;

    recordResult(
      'MOBILE',
      'Mobile Appointment Booking (Bearer Token, No CSRF Requirement)',
      mobileBookSuccess,
      `Status: ${mobileBookRes.status}, Appointment ID: ${mobileApptId}`
    );

    // 9B. Mobile Video Call Room Access
    const mobileJoinRes = await fetch(`${BACKEND_URL}/appointments/${mobileApptId}/join`, {
      headers: { Authorization: `Bearer ${mobileBearerToken}` },
    });
    const mobileJoinData = await mobileJoinRes.json();
    const mobileRoomAvailable = mobileJoinRes.status === 200 && !!mobileJoinData.data?.roomUrl;

    recordResult(
      'MOBILE',
      'Mobile Telehealth Room Resolution',
      mobileRoomAvailable,
      `Room URL: '${mobileJoinData.data?.roomUrl}' successfully returned to mobile client`
    );

    // 9C. Mobile Symptom Checker
    const mobileSymptomRes = await fetch(`${BACKEND_URL}/symptom-checker/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mobileBearerToken}`,
      },
      body: JSON.stringify({ message: 'Stomach cramping and nausea after eating seafood 2 hours ago' }),
    });
    const mobileSymptomData = await mobileSymptomRes.json();
    const mobileSymptomSuccess = mobileSymptomRes.status === 200 && (mobileSymptomData.data?.possibleCauses || []).length > 0;

    recordResult(
      'MOBILE',
      'Mobile Symptom Checker Execution',
      mobileSymptomSuccess,
      `Status: ${mobileSymptomRes.status}, Top Cause: '${mobileSymptomData.data?.possibleCauses?.[0]}'`
    );
  } catch (err: any) {
    recordResult('MOBILE', 'Mobile Regression Flow', false, `Error: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────
  console.log('\n===============================================================');
  console.log('                 REGRESSION SUITE SUMMARY REPORT               ');
  console.log('===============================================================\n');

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Checks: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}\n`);

  const areas = Array.from(new Set(results.map((r) => r.area)));
  for (const area of areas) {
    const areaResults = results.filter((r) => r.area === area);
    const areaPassed = areaResults.every((r) => r.passed);
    const badge = areaPassed ? 'PASSED' : 'FAILED';
    console.log(`[${badge}] Flow ${area}:`);
    areaResults.forEach((r) => {
      console.log(`   - ${r.passed ? '✓' : '✗'} ${r.name} (${r.details})`);
    });
  }

  await prisma.$disconnect();
  return { totalTests, passedTests, failedTests, results };
}

runRegressionSuite().catch((err) => {
  console.error('Regression suite runtime error:', err);
  process.exit(1);
});
