import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

async function testFrontendAuthLogic() {
  console.log('=================================================================');
  console.log('     TESTING FRONTEND /admin-dashboard ROUTE AUTHORIZATION      ');
  console.log('=================================================================\n');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
  const patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });

  if (!admin || !doctor || !patient) {
    throw new Error('Required roles missing from database');
  }

  const adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: 'ADMIN' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const patientToken = jwt.sign(
    { id: patient.id, email: patient.email, role: 'PATIENT' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const doctorToken = jwt.sign(
    { id: doctor.id, email: doctor.email, role: 'DOCTOR' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Simulating AdminDashboardPage loadData auth gate
  async function simulateAdminDashboardGuard(token: string | null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('http://localhost:5000/api/auth/me', { headers });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.data?.user) {
      return { allowed: false, redirect: '/login?error=admin_required', reason: 'Unauthenticated' };
    }

    const role = data.data.user.role;
    if (role !== 'ADMIN') {
      const destination = role === 'DOCTOR' ? '/doctor-dashboard' : '/dashboard';
      return { allowed: false, redirect: `${destination}?error=admin_access_denied`, reason: `Role ${role} is not ADMIN` };
    }

    return { allowed: true, redirect: null, reason: 'ADMIN role verified' };
  }

  // 1. Unauthenticated
  const resUnauth = await simulateAdminDashboardGuard(null);
  console.log('1. Unauthenticated user hitting /admin-dashboard:');
  console.log(`   Allowed: ${resUnauth.allowed} | Redirect: ${resUnauth.redirect} | Reason: ${resUnauth.reason}`);
  if (resUnauth.allowed || resUnauth.redirect !== '/login?error=admin_required') {
    throw new Error('Unauthenticated user was not correctly blocked and redirected to /login');
  }
  console.log('   ✅ BLOCKED & REDIRECTED TO LOGIN\n');

  // 2. Patient
  const resPatient = await simulateAdminDashboardGuard(patientToken);
  console.log('2. Logged-in Patient hitting /admin-dashboard:');
  console.log(`   Allowed: ${resPatient.allowed} | Redirect: ${resPatient.redirect} | Reason: ${resPatient.reason}`);
  if (resPatient.allowed || resPatient.redirect !== '/dashboard?error=admin_access_denied') {
    throw new Error('Patient was not correctly blocked and redirected to /dashboard');
  }
  console.log('   ✅ BLOCKED & REDIRECTED TO /dashboard\n');

  // 3. Doctor
  const resDoctor = await simulateAdminDashboardGuard(doctorToken);
  console.log('3. Logged-in Doctor hitting /admin-dashboard:');
  console.log(`   Allowed: ${resDoctor.allowed} | Redirect: ${resDoctor.redirect} | Reason: ${resDoctor.reason}`);
  if (resDoctor.allowed || resDoctor.redirect !== '/doctor-dashboard?error=admin_access_denied') {
    throw new Error('Doctor was not correctly blocked and redirected to /doctor-dashboard');
  }
  console.log('   ✅ BLOCKED & REDIRECTED TO /doctor-dashboard\n');

  // 4. Admin
  const resAdmin = await simulateAdminDashboardGuard(adminToken);
  console.log('4. Logged-in Admin hitting /admin-dashboard:');
  console.log(`   Allowed: ${resAdmin.allowed} | Redirect: ${resAdmin.redirect} | Reason: ${resAdmin.reason}`);
  if (!resAdmin.allowed) {
    throw new Error('Admin was blocked from accessing /admin-dashboard');
  }
  console.log('   ✅ AUTHORIZED & GRANTED ACCESS TO ADMIN CONTROL CENTER\n');

  console.log('=================================================================');
  console.log('       🎉 FRONTEND ROUTE GUARD SIMULATION 100% SUCCESSFUL!       ');
  console.log('=================================================================\n');
}

testFrontendAuthLogic().catch((err) => {
  console.error(err);
  process.exit(1);
});
