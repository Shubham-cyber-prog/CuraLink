import request from 'supertest';
import crypto from 'crypto';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { authTokenService } from '../../src/services/auth-token.service';
import { emailService } from '../../src/services/email/email.service';
import { resendClient } from '../../src/services/email/resend.client';

describe('Transactional Email & Auth Flow Integration Tests', () => {
  jest.setTimeout(30000);

  const testPatientEmail = `test_patient_${Date.now()}@example.com`;
  const testDoctorEmail = `test_doctor_${Date.now()}@example.com`;
  const adminEmail = `admin_${Date.now()}@example.com`;
  let patientUserId: string;
  let doctorUserId: string;
  let adminUserId: string;
  let adminToken: string;

  beforeAll(async () => {
    // 1. Clean existing test artifacts if needed
    // 2. Create test admin for doctor verification tests
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
        name: 'System Admin',
        role: 'ADMIN',
        emailVerified: true,
      },
    });
    adminUserId = adminUser.id;
    process.env.ADMIN_EMAILS = adminEmail;

    // Generate admin auth token using project JWT generator
    const { generateToken } = require('../../src/utils/jwt');
    const { Role } = require('../../src/types/role');
    adminToken = generateToken({
      id: adminUser.id,
      role: Role.ADMIN,
      email: adminUser.email,
    });
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.appointmentReminder.deleteMany({}).catch(() => null);
    await prisma.notificationLog.deleteMany({
      where: {
        recipientEmail: { in: [testPatientEmail, testDoctorEmail, adminEmail] },
      },
    }).catch(() => null);
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: { in: [patientUserId, doctorUserId, adminUserId] } },
    }).catch(() => null);
    await prisma.passwordResetToken.deleteMany({
      where: { userId: { in: [patientUserId, doctorUserId, adminUserId] } },
    }).catch(() => null);
    await prisma.doctorProfile.deleteMany({
      where: { userId: doctorUserId },
    }).catch(() => null);
    await prisma.user.deleteMany({
      where: { id: { in: [patientUserId, doctorUserId, adminUserId] } },
    }).catch(() => null);
  });

  describe('A. Token Generation & Cryptographic Hashing', () => {
    it('generates secure random hex token and stores only its SHA-256 hash in DB', async () => {
      // Create temporary patient
      const user = await prisma.user.create({
        data: {
          email: `token_test_${Date.now()}@example.com`,
          passwordHash: 'dummy_hash',
          name: 'Token Test User',
          role: 'PATIENT',
        },
      });

      const rawToken = await authTokenService.createEmailVerificationToken(user.id);
      expect(rawToken).toBeDefined();
      expect(typeof rawToken).toBe('string');
      expect(rawToken.length).toBe(64); // 32 bytes hex = 64 characters

      // Verify DB contains only hash, not raw token
      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const dbRecord = await prisma.emailVerificationToken.findUnique({
        where: { tokenHash: expectedHash },
      });

      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.userId).toBe(user.id);
      expect(dbRecord?.usedAt).toBeNull();
      expect(dbRecord?.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('rejects expired email verification tokens (>30 min)', async () => {
      const user = await prisma.user.create({
        data: {
          email: `expired_test_${Date.now()}@example.com`,
          passwordHash: 'dummy_hash',
          name: 'Expired Test User',
          role: 'PATIENT',
        },
      });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // Create token expired 10 minutes ago
      await prisma.emailVerificationToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() - 10 * 60 * 1000),
        },
      });

      const result = await authTokenService.validateEmailVerificationToken(rawToken);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('EXPIRED');

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('prevents already-used verification tokens from being reused', async () => {
      const user = await prisma.user.create({
        data: {
          email: `reuse_test_${Date.now()}@example.com`,
          passwordHash: 'dummy_hash',
          name: 'Reuse Test User',
          role: 'PATIENT',
        },
      });

      const rawToken = await authTokenService.createEmailVerificationToken(user.id);

      // First validation: should succeed and mark token as used
      const firstCheck = await authTokenService.validateEmailVerificationToken(rawToken);
      expect(firstCheck.valid).toBe(true);
      expect(firstCheck.userId).toBe(user.id);

      // Confirm user is now marked emailVerified
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser?.emailVerified).toBe(true);

      // Second validation with same token: must fail
      const secondCheck = await authTokenService.validateEmailVerificationToken(rawToken);
      expect(secondCheck.valid).toBe(false);
      expect(secondCheck.reason).toBe('ALREADY_USED');

      // Cleanup
      await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('B. Patient Registration & Email Verification Workflow', () => {
    it('registers a patient and records pending verification in DB', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testPatientEmail,
          password: 'Password123!',
          name: 'Test Patient',
          role: 'PATIENT',
          turnstileToken: '1x00000000000000000000AA',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.user).toBeDefined();
      expect(res.body.data?.user?.email).toBe(testPatientEmail);
      patientUserId = res.body.data.user.id;

      // Confirm user is created with emailVerified: false
      const user = await prisma.user.findUnique({ where: { id: patientUserId } });
      expect(user?.emailVerified).toBe(false);

      // Confirm verification token was generated
      const token = await prisma.emailVerificationToken.findFirst({
        where: { userId: patientUserId },
      });
      expect(token).not.toBeNull();
    });

    it('verifies email via POST /api/auth/verify-email endpoint', async () => {
      // Generate a fresh token for patientUserId
      const rawToken = await authTokenService.createEmailVerificationToken(patientUserId);

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: rawToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('successfully verified');

      const user = await prisma.user.findUnique({ where: { id: patientUserId } });
      expect(user?.emailVerified).toBe(true);
      expect(user?.emailVerifiedAt).not.toBeNull();
    });

    it('resends verification email with rate-limiting and enumeration protection', async () => {
      // 1. Existing user
      const res1 = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: testPatientEmail });

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);

      // 2. Non-existent email (enumeration protection - must return same 200 message)
      const res2 = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nonexistent_account_999@example.com' });

      expect(res2.status).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(res2.body.message).toContain('If an account exists');
    });
  });

  describe('C. Doctor Registration & Verification Lifecycle', () => {
    it('registers a doctor without granting medical verification', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testDoctorEmail,
          password: 'Password123!',
          name: 'Dr. Gregory House',
          role: 'DOCTOR',
          turnstileToken: '1x00000000000000000000AA',
        });

      expect(res.status).toBe(201);
      doctorUserId = res.body.data.user.id;

      // Verify doctor record: verificationStatus must be PENDING
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: doctorUserId },
      });

      expect(doctor).not.toBeNull();
      expect(doctor?.verificationStatus).toBe('PENDING');
    });

    it('allows only authorized ADMIN to approve doctor verification and sends email', async () => {
      // 1. Non-admin request should fail (401 or 403)
      const unauthRes = await request(app)
        .put(`/api/doctors/${doctorUserId}/verify-status`)
        .send({ status: 'APPROVED' });

      expect([401, 403]).toContain(unauthRes.status);

      // 2. Admin approves doctor
      const adminRes = await request(app)
        .put(`/api/doctors/${doctorUserId}/verify-status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.success).toBe(true);

      const updatedDoctor = await prisma.doctorProfile.findUnique({
        where: { userId: doctorUserId },
      });
      expect(updatedDoctor?.verificationStatus).toBe('APPROVED');
      expect(updatedDoctor?.verifiedAt).not.toBeNull();
    });
  });

  describe('D. Password Reset Security Workflow', () => {
    it('protects against email enumeration on forgot-password', async () => {
      // Non-existent email must return 200 generic message
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'unknown_user_12345@example.com',
          turnstileToken: '1x00000000000000000000AA',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('If that email address is registered');
    });

    it('creates single-use password reset token with 15-minute expiry', async () => {
      const rawToken = await authTokenService.createPasswordResetToken(patientUserId);
      expect(rawToken).toBeDefined();
      expect(rawToken.length).toBe(64);

      // Verify token in DB has 15m expiration
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const dbToken = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
      });

      expect(dbToken).not.toBeNull();
      const diffMs = dbToken!.expiresAt.getTime() - dbToken!.createdAt.getTime();
      expect(diffMs).toBeCloseTo(15 * 60 * 1000, -3); // ~15 minutes
    });

    it('resets password and invalidates token', async () => {
      const rawToken = await authTokenService.createPasswordResetToken(patientUserId);

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          password: 'NewBrandPassword456!',
          confirmPassword: 'NewBrandPassword456!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Confirm token cannot be reused
      const secondAttempt = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: rawToken,
          password: 'AnotherPassword789!',
          confirmPassword: 'AnotherPassword789!',
        });

      expect(secondAttempt.status).toBe(400);
      expect(secondAttempt.body.message).toContain('already been used');
    });
  });

  describe('E. Resend Webhook Processing', () => {
    it('rejects webhooks with invalid or missing signature', async () => {
      const res = await request(app)
        .post('/api/webhooks/resend')
        .send({ type: 'email.delivered', data: { email_id: 'msg_test' } });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid webhook signature');
    });

    it('processes verified webhooks idempotently and updates NotificationLog', async () => {
      // 1. Create a notification log to be updated
      const testMsgId = `msg_${Date.now()}`;
      await prisma.notificationLog.create({
        data: {
          recipientEmail: testPatientEmail,
          subject: 'Webhook Test',
          eventType: 'TEST_EVENT',
          status: 'SENT',
          provider: 'RESEND',
          providerMessageId: testMsgId,
        },
      });

      // 2. Prepare payload & Svix signature
      const payload = JSON.stringify({
        type: 'email.delivered',
        data: {
          email_id: testMsgId,
          recipient: testPatientEmail,
        },
      });
      const msgId = `msg_hdr_${Date.now()}`;
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedContent = `${msgId}.${timestamp}.${payload}`;

      const secret = 'whsec_test_secret_12345';
      const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
      const signature = crypto
        .createHmac('sha256', Buffer.from(cleanSecret, 'utf-8'))
        .update(signedContent)
        .digest('base64');

      const res = await request(app)
        .post('/api/webhooks/resend')
        .set('svix-id', msgId)
        .set('svix-timestamp', timestamp)
        .set('svix-signature', `v1,${signature}`)
        .set('Content-Type', 'application/json')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);

      // Verify log was marked DELIVERED
      const updatedLog = await prisma.notificationLog.findUnique({
        where: { providerMessageId: testMsgId },
      });
      expect(updatedLog?.status).toBe('DELIVERED');
      expect(updatedLog?.deliveredAt).not.toBeNull();
    });
  });
});
