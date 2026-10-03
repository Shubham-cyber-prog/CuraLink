import { appointmentService } from '../../src/services/appointment.service';
import prisma from '../../src/lib/prisma';
import { BadRequestError } from '../../src/utils/errors';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    doctorProfile: {
      findFirst: jest.fn(),
    },
    appointment: {
      findFirst: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
    $transaction: jest.fn(),
  },
}));

const mockDoctorProfileFindFirst = prisma.doctorProfile.findFirst as unknown as jest.Mock;
const mockAppointmentFindFirst = prisma.appointment.findFirst as unknown as jest.Mock;
const mockAppointmentCount = prisma.appointment.count as unknown as jest.Mock;
const mockAppointmentCreate = prisma.appointment.create as unknown as jest.Mock;
const mockTransaction = prisma.$transaction as unknown as jest.Mock;

describe('Appointment Interval Collision & Concurrency Tests', () => {
  const patientId = 'patient-uuid-1';
  const doctorId = 'doc-user-1';
  let inMemoryAppointments: any[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    inMemoryAppointments = [];

    // Dynamically resolve doctor profile based on query
    mockDoctorProfileFindFirst.mockImplementation(async ({ where }) => {
      const requestedId = where?.OR?.[0]?.userId || where?.OR?.[1]?.id || where?.userId || doctorId;
      return {
        id: `prof-${requestedId}`,
        userId: requestedId,
        verificationStatus: 'APPROVED',
      };
    });

    mockAppointmentCount.mockResolvedValue(0);

    // Mock transaction to execute the callback with a simulated tx client
    mockTransaction.mockImplementation(async (callback) => {
      const txMock = {
        $executeRaw: jest.fn().mockResolvedValue(1),
        appointment: {
          count: mockAppointmentCount,
          findFirst: mockAppointmentFindFirst,
          create: mockAppointmentCreate,
        },
      };
      return callback(txMock);
    });

    // Simulated interval overlap detection inside tx
    mockAppointmentFindFirst.mockImplementation(async ({ where }) => {
      return (
        inMemoryAppointments.find((a) => {
          if (where?.doctorId && a.doctorId !== where.doctorId) return false;
          if (where?.userId && a.userId !== where.userId) return false;
          if (where?.status?.not && a.status === where.status.not) return false;

          // Check interval overlap: scheduledAt < requestedEnd AND endTime > requestedStart
          if (where?.OR) {
            return where.OR.some((clause: any) => {
              if (clause.scheduledAt && clause.endTime) {
                return (
                  a.scheduledAt < clause.scheduledAt.lt && a.endTime > clause.endTime.gt
                );
              }
              if (clause.date && clause.time) {
                return a.date === clause.date && a.time === clause.time;
              }
              return false;
            });
          }

          return true;
        }) || null
      );
    });

    mockAppointmentCreate.mockImplementation(async ({ data }) => {
      const created = { id: `apt-${Date.now()}-${Math.random()}`, ...data };
      inMemoryAppointments.push(created);
      return created;
    });
  });

  it('should book an appointment with scheduledAt, endTime, and legacy fields', async () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const result = await appointmentService.bookAppointment(patientId, {
      doctorId,
      date: futureDate,
      time: '10:00 AM',
      timezone: 'Asia/Kolkata',
      durationMinutes: 30,
    });

    expect(result).toBeDefined();
    expect(result.doctorId).toBe(doctorId);
    expect(result.userId).toBe(patientId);
    expect(result.date).toBe(futureDate);
    expect(result.time).toBe('10:00 AM');
    expect(result.timezone).toBe('Asia/Kolkata');
    expect(result.durationMinutes).toBe(30);
    expect(result.scheduledAt).toBeInstanceOf(Date);
    expect(result.endTime).toBeInstanceOf(Date);
    expect(result.endTime.getTime() - result.scheduledAt.getTime()).toBe(30 * 60 * 1000);
  });

  it('should prevent exact duplicate booking for the same doctor and slot', async () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // First booking succeeds
    await appointmentService.bookAppointment(patientId, {
      doctorId,
      date: futureDate,
      time: '10:00 AM',
    });

    // Second booking by different patient for same slot should fail
    await expect(
      appointmentService.bookAppointment('other-patient', {
        doctorId,
        date: futureDate,
        time: '10:00 AM',
      })
    ).rejects.toThrow(BadRequestError);
  });

  it('should reject overlapping booking (starts before, ends during)', async () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Book 10:00 AM - 10:30 AM
    await appointmentService.bookAppointment(patientId, {
      doctorId,
      date: futureDate,
      time: '10:00 AM',
      durationMinutes: 30,
    });

    // Attempt to book 10:15 AM - 10:45 AM (overlaps with 10:00 - 10:30)
    await expect(
      appointmentService.bookAppointment('other-patient', {
        doctorId,
        date: futureDate,
        time: '10:15 AM',
        durationMinutes: 30,
      })
    ).rejects.toThrow(/already booked/i);
  });

  it('should allow adjacent non-overlapping booking [10:00-10:30) and [10:30-11:00)', async () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Book 10:00 AM - 10:30 AM
    const first = await appointmentService.bookAppointment(patientId, {
      doctorId,
      date: futureDate,
      time: '10:00 AM',
      durationMinutes: 30,
    });
    expect(first).toBeDefined();

    // Book adjacent 10:30 AM - 11:00 AM
    const second = await appointmentService.bookAppointment('other-patient', {
      doctorId,
      date: futureDate,
      time: '10:30 AM',
      durationMinutes: 30,
    });
    expect(second).toBeDefined();
    expect(second.scheduledAt.getTime()).toBe(first.endTime.getTime());
  });

  it('should prevent patient from double-booking themselves across different doctors', async () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Patient books Doctor 1 at 10:00 AM
    await appointmentService.bookAppointment(patientId, {
      doctorId: 'doc-user-1',
      date: futureDate,
      time: '10:00 AM',
      durationMinutes: 30,
    });

    // Same patient attempts to book Doctor 2 at 10:15 AM (conflicts with their own appointment)
    await expect(
      appointmentService.bookAppointment(patientId, {
        doctorId: 'doc-user-2',
        date: futureDate,
        time: '10:15 AM',
        durationMinutes: 30,
      })
    ).rejects.toThrow(/You already have an appointment scheduled/i);
  });

  it('should allow booking a slot previously occupied by a CANCELLED appointment', async () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Add cancelled appointment directly to store
    inMemoryAppointments.push({
      id: 'cancelled-apt',
      userId: 'old-patient',
      doctorId,
      date: futureDate,
      time: '10:00 AM',
      scheduledAt: new Date(`${futureDate}T04:30:00.000Z`),
      endTime: new Date(`${futureDate}T05:00:00.000Z`),
      status: 'CANCELLED',
    });

    // New patient books the same slot
    const result = await appointmentService.bookAppointment(patientId, {
      doctorId,
      date: futureDate,
      time: '10:00 AM',
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('PENDING');
  });

  it('should accept direct ISO 8601 UTC scheduledAt timestamp', async () => {
    const futureUtc = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    futureUtc.setUTCMinutes(0, 0, 0);

    const result = await appointmentService.bookAppointment(patientId, {
      doctorId,
      scheduledAt: futureUtc.toISOString(),
      timezone: 'America/New_York',
      durationMinutes: 45,
    });

    expect(result).toBeDefined();
    expect(result.scheduledAt.toISOString()).toBe(futureUtc.toISOString());
    expect(result.endTime.getTime() - result.scheduledAt.getTime()).toBe(45 * 60 * 1000);
    expect(result.timezone).toBe('America/New_York');
    expect(result.date).toBeDefined();
    expect(result.time).toBeDefined();
  });
});
