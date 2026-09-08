import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '../../src/types/role';

jest.mock('../../src/lib/prisma', () => {
  return {
    __esModule: true,
    prisma: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      doctorProfile: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      prescription: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      review: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        aggregate: jest.fn(),
      },
      dataErasureRequest: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockImplementation((promises) => Promise.all(promises)),
    },
    default: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    },
  };
});

describe('Phase 1 Roadmap API Integration Tests', () => {
  const doctorToken = generateToken({ id: 'doc-user-1', email: 'doctor@curalink.health', role: Role.DOCTOR });
  const patientToken = generateToken({ id: 'pat-user-1', email: 'patient@curalink.health', role: Role.PATIENT });
  const adminToken = generateToken({ id: 'admin-user-1', email: 'admin@curalink.health', role: Role.ADMIN });

  const csrfToken = 'test-csrf-token-12345';
  const csrfCookie = `curalink_csrf=${csrfToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});
  });

  describe('Doctor License Verification & Admin Gate', () => {
    it('doctor can submit medical license for verification', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'doc-user-1',
        role: 'DOCTOR',
      });

      (prisma.doctorProfile.upsert as jest.Mock).mockResolvedValue({
        id: 'doc-profile-1',
        userId: 'doc-user-1',
        medicalLicenseNumber: 'MCI-2026-998877',
        specialization: 'Cardiology',
        verificationStatus: 'PENDING',
      });

      const res = await request(app)
        .post('/api/doctors/verify-submit')
        .set('Authorization', `Bearer ${doctorToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie])
        .send({
          medicalLicenseNumber: 'MCI-2026-998877',
          specialization: 'Cardiology',
          experienceYears: 8,
          consultationFee: 750,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('PENDING');
    });

    it('unverified doctor cannot issue e-prescriptions', async () => {
      (prisma.doctorProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'doc-profile-1',
        userId: 'doc-user-1',
        verificationStatus: 'PENDING',
        user: { name: 'Dr. Test' },
      });

      const res = await request(app)
        .post('/api/prescriptions/issue')
        .set('Authorization', `Bearer ${doctorToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie])
        .send({
          consultationId: 'consult_123',
          patientId: 'pat-user-1',
          diagnosis: 'Hypertension',
          medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '30 days' }],
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('approved medical licenses');
    });

    it('admin can approve doctor verification status', async () => {
      (prisma.doctorProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'doc-profile-1',
        userId: 'doc-user-1',
        verificationStatus: 'PENDING',
      });

      (prisma.doctorProfile.update as jest.Mock).mockResolvedValue({
        id: 'doc-profile-1',
        userId: 'doc-user-1',
        verificationStatus: 'APPROVED',
      });

      const res = await request(app)
        .put('/api/doctors/doc-user-1/verify-status')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie])
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(200);
      expect(res.body.data.verificationStatus).toBe('APPROVED');
    });
  });

  describe('PDF E-Prescription Engine', () => {
    it('verified doctor can issue digital PDF prescription', async () => {
      (prisma.doctorProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'doc-profile-1',
        userId: 'doc-user-1',
        verificationStatus: 'APPROVED',
        specialization: 'Cardiology',
        medicalLicenseNumber: 'MCI-2026-998877',
        medicalCouncil: 'KMC',
        user: { name: 'Dr. John Specialist' },
      });

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'pat-user-1',
        name: 'Jane Patient',
        email: 'patient@curalink.health',
      });

      (prisma.prescription.create as jest.Mock).mockImplementation(({ data }) => ({
        ...data,
        createdAt: new Date(),
      }));

      const res = await request(app)
        .post('/api/prescriptions/issue')
        .set('Authorization', `Bearer ${doctorToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie])
        .send({
          consultationId: 'consult_999',
          patientId: 'pat-user-1',
          diagnosis: 'Essential Hypertension',
          medications: [
            {
              name: 'Telmisartan',
              dosage: '40mg',
              frequency: '1-0-0',
              duration: '30 days',
              instructions: 'Take after breakfast',
            },
          ],
          notes: 'Low sodium diet',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.digitalSignature).toBeDefined();
      expect(res.body.data.pdfUrl).toContain('.pdf');
    });

    it('patient can fetch their e-prescriptions', async () => {
      (prisma.prescription.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'rx_123',
          consultationId: 'consult_999',
          doctorId: 'doc-user-1',
          patientId: 'pat-user-1',
          diagnosis: 'Essential Hypertension',
          medications: JSON.stringify([{ name: 'Telmisartan', dosage: '40mg' }]),
          digitalSignature: 'hash123',
          pdfUrl: '/uploads/prescriptions/rx_123.pdf',
          doctor: { name: 'Dr. John' },
        },
      ]);

      const res = await request(app)
        .get('/api/prescriptions/my-prescriptions')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].parsedMedications[0].name).toBe('Telmisartan');
    });
  });

  describe('Verified Patient Doctor Reviews & Ratings', () => {
    it('patient can submit review for doctor', async () => {
      (prisma.doctorProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'doc-profile-1',
        userId: 'doc-user-1',
      });

      (prisma.review.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.review.create as jest.Mock).mockResolvedValue({
        id: 'rev_1',
        doctorId: 'doc-user-1',
        patientId: 'pat-user-1',
        rating: 5,
        comment: 'Excellent doctor! Very helpful advice.',
        verifiedPatient: true,
        patient: { name: 'Jane Patient' },
      });

      (prisma.review.aggregate as jest.Mock).mockResolvedValue({
        _avg: { rating: 5 },
        _count: { rating: 1 },
      });

      (prisma.doctorProfile.update as jest.Mock).mockResolvedValue({
        averageRating: 5,
        ratingCount: 1,
      });

      const res = await request(app)
        .post('/api/reviews/submit')
        .set('Authorization', `Bearer ${patientToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie])
        .send({
          doctorId: 'doc-user-1',
          rating: 5,
          comment: 'Excellent doctor! Very helpful advice.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });
  });

  describe('DPDP Act 2023 Data Erasure Pipeline', () => {
    it('patient can submit data erasure request', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'pat-user-1',
        email: 'patient@curalink.health',
      });

      (prisma.dataErasureRequest.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.dataErasureRequest.create as jest.Mock).mockResolvedValue({
        id: 'erasure_123',
        userId: 'pat-user-1',
        status: 'PENDING',
        reason: 'Right to Erasure under DPDP Act 2023',
      });

      const res = await request(app)
        .post('/api/privacy/request-erasure')
        .set('Authorization', `Bearer ${patientToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie])
        .send({
          confirmConsent: true,
          reason: 'Right to Erasure under DPDP Act 2023',
        });

      expect(res.status).toBe(202);
      expect(res.body.data.status).toBe('PENDING');
    });

    it('admin can process erasure and anonymize PII', async () => {
      (prisma.dataErasureRequest.findUnique as jest.Mock).mockResolvedValue({
        id: 'erasure_123',
        userId: 'pat-user-1',
        status: 'PENDING',
        user: { id: 'pat-user-1', email: 'patient@curalink.health', name: 'Jane' },
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'pat-user-1',
        name: 'Anonymized User (pat-us)',
        email: 'anonymized_pat-us@privacy.curalink.local',
      });

      (prisma.dataErasureRequest.update as jest.Mock).mockResolvedValue({
        id: 'erasure_123',
        status: 'COMPLETED',
      });

      const res = await request(app)
        .put('/api/privacy/process-erasure/erasure_123')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);
    });
  });
});
