import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '../../src/types/role';

// Mock Prisma for deterministic testing
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    appointment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    doctorProfile: {
      findUnique: jest.fn(),
    },
    prescription: {
      upsert: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

const mockAppointmentFindUnique = prisma.appointment.findUnique as unknown as jest.Mock;
const mockAppointmentFindFirst = prisma.appointment.findFirst as unknown as jest.Mock;
const mockDoctorProfileFindUnique = prisma.doctorProfile.findUnique as unknown as jest.Mock;
const mockPrescriptionUpsert = prisma.prescription.upsert as unknown as jest.Mock;

describe('Prescription IDOR & Authorization Protection Tests', () => {
  const doctorAId = 'doctor-user-aaa';
  const doctorBId = 'doctor-user-bbb';
  const patientId = 'patient-user-111';

  const doctorAToken = generateToken({
    id: doctorAId,
    email: 'doctorA@curalink.com',
    role: Role.DOCTOR,
  });

  const doctorBToken = generateToken({
    id: doctorBId,
    email: 'doctorB@curalink.com',
    role: Role.DOCTOR,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock doctor profiles
    mockDoctorProfileFindUnique.mockImplementation(({ where }: { where: { userId?: string } }) => {
      if (where.userId === doctorAId) {
        return Promise.resolve({
          id: 'doc-profile-a',
          userId: doctorAId,
          verificationStatus: 'APPROVED',
          specialization: 'Cardiology',
        });
      }
      if (where.userId === doctorBId) {
        return Promise.resolve({
          id: 'doc-profile-b',
          userId: doctorBId,
          verificationStatus: 'APPROVED',
          specialization: 'Neurology',
        });
      }
      return Promise.resolve(null);
    });
  });

  it('should return 403 Forbidden when Doctor B attempts to prescribe for an appointment assigned to Doctor A', async () => {
    mockAppointmentFindUnique.mockResolvedValueOnce({
      id: 'apt-doctor-a-1',
      userId: patientId,
      doctorId: doctorAId,
      status: 'CONFIRMED',
    });

    const response = await request(app)
      .post('/api/doctor/me/prescriptions')
      .set('Authorization', `Bearer ${doctorBToken}`)
      .send({
        patientId,
        appointmentId: 'apt-doctor-a-1',
        diagnosis: 'Hypertension',
        medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', duration: '30 days' }],
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Forbidden.*authorized.*not assigned/i);
    expect(mockPrescriptionUpsert).not.toHaveBeenCalled();
  });

  it('should return 403 Forbidden when prescribing for a CANCELLED appointment', async () => {
    mockAppointmentFindUnique.mockResolvedValueOnce({
      id: 'apt-doctor-a-cancelled',
      userId: patientId,
      doctorId: doctorAId,
      status: 'CANCELLED',
    });

    const response = await request(app)
      .post('/api/doctor/me/prescriptions')
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        patientId,
        appointmentId: 'apt-doctor-a-cancelled',
        diagnosis: 'Hypertension',
        medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', duration: '30 days' }],
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Forbidden.*cancelled/i);
    expect(mockPrescriptionUpsert).not.toHaveBeenCalled();
  });

  it('should return 403 Forbidden when patientId in body does not match appointment patient', async () => {
    mockAppointmentFindUnique.mockResolvedValueOnce({
      id: 'apt-doctor-a-1',
      userId: 'different-patient-999',
      doctorId: doctorAId,
      status: 'CONFIRMED',
    });

    const response = await request(app)
      .post('/api/doctor/me/prescriptions')
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        patientId,
        appointmentId: 'apt-doctor-a-1',
        diagnosis: 'Hypertension',
        medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', duration: '30 days' }],
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Forbidden.*Patient ID does not match/i);
    expect(mockPrescriptionUpsert).not.toHaveBeenCalled();
  });

  it('should successfully issue prescription (201) when calling doctor owns the confirmed appointment', async () => {
    mockAppointmentFindUnique.mockResolvedValueOnce({
      id: 'apt-doctor-a-valid',
      userId: patientId,
      doctorId: doctorAId,
      status: 'CONFIRMED',
    });

    mockPrescriptionUpsert.mockResolvedValueOnce({
      id: 'rx_test_123',
      appointmentId: 'apt-doctor-a-valid',
      doctorId: doctorAId,
      patientId,
      diagnosis: 'Hypertension',
      medications: JSON.stringify([{ name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', duration: '30 days' }]),
    });

    const response = await request(app)
      .post('/api/doctor/me/prescriptions')
      .set('Authorization', `Bearer ${doctorAToken}`)
      .send({
        patientId,
        appointmentId: 'apt-doctor-a-valid',
        diagnosis: 'Hypertension',
        medications: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', duration: '30 days' }],
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toMatch(/Prescription issued successfully/i);
    expect(mockPrescriptionUpsert).toHaveBeenCalled();
  });
});
