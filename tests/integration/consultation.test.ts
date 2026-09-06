import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '../../src/types/role';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    appointment: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
const mockAppointmentUpdate = prisma.appointment.update as unknown as jest.Mock;

describe('Consultation API Integration Tests', () => {
  const patientToken = generateToken({
    id: 'patient-user-1',
    email: 'patient@curalink.com',
    role: Role.PATIENT,
  });

  const unauthorizedToken = generateToken({
    id: 'unauthorized-user-99',
    email: 'other@curalink.com',
    role: Role.PATIENT,
  });

  const appointmentId = 'apt-uuid-100';

  const csrfToken = 'test-csrf-token-12345';
  const csrfCookie = `curalink_csrf=${csrfToken}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/consultations/:appointmentId/room', () => {
    it('should return room URL and token for authorized patient during join window', async () => {
      const mockApt = {
        id: appointmentId,
        userId: 'patient-user-1',
        doctorId: 'doc-uuid-200',
        date: 'Today',
        time: '4:30 PM',
        status: 'CONFIRMED',
        roomName: null,
        roomUrl: null,
        user: {
          id: 'patient-user-1',
          name: 'Jane Doe',
          email: 'patient@curalink.com',
        },
      };

      mockAppointmentFindUnique.mockResolvedValue(mockApt);
      mockAppointmentUpdate.mockResolvedValue({
        ...mockApt,
        roomName: 'curalink-consult-apt-uuid',
        roomUrl: 'https://curalink.daily.co/curalink-consult-apt-uuid',
      });

      const res = await request(app)
        .post(`/api/consultations/${appointmentId}/room`)
        .set('Authorization', `Bearer ${patientToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomUrl).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.appointmentId).toBe(appointmentId);
    });

    it('should return HTTP 403 Forbidden for unauthorized user attempting to access room', async () => {
      const mockApt = {
        id: appointmentId,
        userId: 'patient-user-1',
        doctorId: 'doc-uuid-200',
        date: 'Today',
        time: '4:30 PM',
        status: 'CONFIRMED',
        user: {
          id: 'patient-user-1',
          name: 'Jane Doe',
          email: 'patient@curalink.com',
        },
      };

      mockAppointmentFindUnique.mockResolvedValue(mockApt);

      const res = await request(app)
        .post(`/api/consultations/${appointmentId}/room`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });

    it('should return HTTP 404 for non-existent appointmentId', async () => {
      mockAppointmentFindUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/consultations/non-existent-apt/room')
        .set('Authorization', `Bearer ${patientToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/consultations/:appointmentId/complete', () => {
    it('should mark consultation as COMPLETED for authorized user', async () => {
      const mockApt = {
        id: appointmentId,
        userId: 'patient-user-1',
        doctorId: 'doc-uuid-200',
        date: 'Today',
        time: '4:30 PM',
        status: 'CONFIRMED',
      };

      mockAppointmentFindUnique.mockResolvedValue(mockApt);
      mockAppointmentUpdate.mockResolvedValue({
        ...mockApt,
        status: 'COMPLETED',
      });

      const res = await request(app)
        .post(`/api/consultations/${appointmentId}/complete`)
        .set('Authorization', `Bearer ${patientToken}`)
        .set('X-CSRF-Token', csrfToken)
        .set('Cookie', [csrfCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });
});
