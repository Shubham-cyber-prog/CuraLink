import { backfillAppointmentTimezones } from '../../scripts/backfill-appointment-timezones';
import prisma from '../../src/lib/prisma';

// Mock prisma for backfill safety unit test
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    appointment: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockFindMany = prisma.appointment.findMany as unknown as jest.Mock;
const mockUpdate = prisma.appointment.update as unknown as jest.Mock;

describe('Backfill Safety & Integrity Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully convert valid legacy date and time into UTC timestamps', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'apt-1',
        date: '2026-09-28',
        time: '10:30 AM',
        scheduledAt: null,
        endTime: null,
        durationMinutes: 30,
        timezone: 'Asia/Kolkata',
      },
    ]);

    mockUpdate.mockResolvedValue({});

    const report = await backfillAppointmentTimezones('Asia/Kolkata', false);

    expect(report.totalAppointments).toBe(1);
    expect(report.successfullyMigrated).toBe(1);
    expect(report.failedOrInvalid).toBe(0);
    expect(report.alreadyMigrated).toBe(0);
    expect(report.invalidRecords).toHaveLength(0);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'apt-1' },
      data: {
        scheduledAt: new Date('2026-09-28T05:00:00.000Z'),
        endTime: new Date('2026-09-28T05:30:00.000Z'),
        durationMinutes: 30,
        timezone: 'Asia/Kolkata',
      },
    });
  });

  it('should skip records that already have scheduledAt and endTime', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'apt-already-migrated',
        date: '2026-09-28',
        time: '10:30 AM',
        scheduledAt: new Date('2026-09-28T05:00:00.000Z'),
        endTime: new Date('2026-09-28T05:30:00.000Z'),
        durationMinutes: 30,
        timezone: 'Asia/Kolkata',
      },
    ]);

    const report = await backfillAppointmentTimezones('Asia/Kolkata', false);

    expect(report.totalAppointments).toBe(1);
    expect(report.alreadyMigrated).toBe(1);
    expect(report.successfullyMigrated).toBe(0);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should NOT modify invalid or corrupt records and report them explicitly', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'corrupt-apt-1',
        date: '2026-02-30', // Non-existent date
        time: '10:00 AM',
        scheduledAt: null,
        endTime: null,
        durationMinutes: 30,
        timezone: 'Asia/Kolkata',
      },
      {
        id: 'corrupt-apt-2',
        date: '2026-09-28',
        time: '99:99 PM', // Invalid time
        scheduledAt: null,
        endTime: null,
        durationMinutes: 30,
        timezone: 'Asia/Kolkata',
      },
    ]);

    const report = await backfillAppointmentTimezones('Asia/Kolkata', false);

    expect(report.totalAppointments).toBe(2);
    expect(report.successfullyMigrated).toBe(0);
    expect(report.failedOrInvalid).toBe(2);
    expect(report.invalidRecords).toHaveLength(2);
    expect(report.invalidRecords[0].id).toBe('corrupt-apt-1');
    expect(report.invalidRecords[1].id).toBe('corrupt-apt-2');

    // No updates should have occurred for invalid records
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should respect dryRun mode and perform no database writes', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'apt-dryrun',
        date: '2026-09-28',
        time: '10:30 AM',
        scheduledAt: null,
        endTime: null,
        durationMinutes: 30,
        timezone: 'Asia/Kolkata',
      },
    ]);

    const report = await backfillAppointmentTimezones('Asia/Kolkata', true);

    expect(report.successfullyMigrated).toBe(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should support explicit alternative IANA timezones', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'apt-ny',
        date: '2026-07-15',
        time: '12:00 PM',
        scheduledAt: null,
        endTime: null,
        durationMinutes: 45,
        timezone: 'America/New_York',
      },
    ]);

    const report = await backfillAppointmentTimezones('America/New_York', false);

    expect(report.successfullyMigrated).toBe(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'apt-ny' },
      data: {
        scheduledAt: new Date('2026-07-15T16:00:00.000Z'),
        endTime: new Date('2026-07-15T16:45:00.000Z'),
        durationMinutes: 45,
        timezone: 'America/New_York',
      },
    });
  });
});
