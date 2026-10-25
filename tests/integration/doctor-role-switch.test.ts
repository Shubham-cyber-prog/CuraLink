import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '../../src/types/role';

describe('Doctor Role Switch & Access Integration Tests', () => {
  jest.setTimeout(30000);
  const testEmail = `doctor_switch_test_${Date.now()}@example.com`;
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Test Role Switch User',
        email: testEmail,
        passwordHash: '$2b$10$Y/GkfxeG8A.o4nABIZIuuuONWSn6gs/3v68LYZrN5lr5hGI84DMgy',
        role: Role.PATIENT,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.doctorProfile.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it('should deny patient access to /api/doctor/me/dashboard-stats with HTTP 403', async () => {
    const patientToken = generateToken({
      id: testUserId,
      email: testEmail,
      role: Role.PATIENT,
    });

    const res = await request(app)
      .get('/api/doctor/me/dashboard-stats')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  it('should switch role to DOCTOR and create approved DoctorProfile via POST /api/auth/switch-role', async () => {
    const patientToken = generateToken({
      id: testUserId,
      email: testEmail,
      role: Role.PATIENT,
    });

    const res = await request(app)
      .post('/api/auth/switch-role')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ role: 'DOCTOR' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('DOCTOR');
    expect(res.body.data.token).toBeDefined();

    // Verify DB
    const profile = await prisma.doctorProfile.findUnique({ where: { userId: testUserId } });
    expect(profile).not.toBeNull();
    expect(profile?.verificationStatus).toBe('APPROVED');
  });

  it('should allow access to /api/doctor/me/dashboard-stats after switching to DOCTOR', async () => {
    const doctorToken = generateToken({
      id: testUserId,
      email: testEmail,
      role: Role.DOCTOR,
    });

    const res = await request(app)
      .get('/api/doctor/me/dashboard-stats')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.verificationStatus).toBe('APPROVED');
  });

  it('should return doctor in public /api/doctors listing', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
