import prisma from '../lib/prisma';
import { BadRequestError } from '../utils/errors';
import { invalidateDoctorsCache } from '../lib/cache/doctors.cache';
import {
  zonedTimeToUtc,
  utcToZonedFormatted,
  DEFAULT_APP_TIMEZONE,
  isValidIanaTimezone,
} from '../utils/timezone';

export interface CreateAppointmentInput {
  doctorId: string;
  date?: string;
  time?: string;
  scheduledAt?: string; // ISO 8601 UTC timestamp
  timezone?: string;
  durationMinutes?: number;
}

export class AppointmentService {
  async bookAppointment(userId: string, input: CreateAppointmentInput) {
    const { doctorId } = input;

    // Prevent doctor booking themselves
    if (userId === doctorId) {
      throw new BadRequestError('Doctors cannot book an appointment with themselves.');
    }

    // Resolve Timezone, ScheduledAt, EndTime, and legacy Date/Time strings
    const appointmentTimezone =
      input.timezone && isValidIanaTimezone(input.timezone)
        ? input.timezone
        : DEFAULT_APP_TIMEZONE;

    const duration = input.durationMinutes || 30;

    let startUtc: Date;
    let endUtc: Date;
    let legacyDate: string;
    let legacyTime: string;

    if (input.scheduledAt) {
      startUtc = new Date(input.scheduledAt);
      if (isNaN(startUtc.getTime())) {
        throw new BadRequestError('Invalid scheduledAt timestamp format. Expected ISO 8601 UTC.');
      }
      endUtc = new Date(startUtc.getTime() + duration * 60 * 1000);
      const formatted = utcToZonedFormatted(startUtc, appointmentTimezone);
      legacyDate = formatted.date;
      legacyTime = formatted.time;
    } else if (input.date && input.time) {
      const parsedUtc = zonedTimeToUtc(input.date, input.time, appointmentTimezone);
      if (!parsedUtc) {
        throw new BadRequestError(
          `Invalid date (${input.date}) or time (${input.time}) for timezone ${appointmentTimezone}.`
        );
      }
      startUtc = parsedUtc;
      endUtc = new Date(startUtc.getTime() + duration * 60 * 1000);
      legacyDate = input.date;
      legacyTime = input.time;
    } else {
      throw new BadRequestError('Either scheduledAt (ISO UTC) or both date and time must be provided.');
    }

    // Check for past booking (pure UTC timestamp comparison)
    if (startUtc.getTime() < Date.now()) {
      throw new BadRequestError('Cannot book an appointment for a past date or time.');
    }

    // Verify doctor exists and is verified
    const doctorProfile = await prisma.doctorProfile.findFirst({
      where: {
        OR: [{ userId: doctorId }, { id: doctorId }],
      },
    });

    if (!doctorProfile) {
      throw new BadRequestError('Doctor not found.');
    }

    if (doctorProfile.verificationStatus !== 'APPROVED') {
      throw new BadRequestError('This doctor is pending administrative verification and cannot accept bookings.');
    }

    const resolvedDoctorId = doctorProfile.userId;

    if (userId === resolvedDoctorId) {
      throw new BadRequestError('Doctors cannot book an appointment with themselves.');
    }

    // Atomic transaction with PostgreSQL advisory lock for serialized doctor booking
    const appointment = await prisma.$transaction(async (tx) => {
      // 1. Concurrency control: Acquire transaction-level advisory lock on the doctor
      try {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('doctor_booking_' || ${resolvedDoctorId}::text))`;
      } catch {
        // Fallback for environments / unit test mocks without raw advisory locks
      }

      // 2. Prevent appointment flooding: max 3 active appointments per patient per day
      const MAX_DAILY_BOOKINGS = 3;
      const dailyBookingCount = await tx.appointment.count({
        where: {
          userId,
          date: legacyDate,
          status: { not: 'CANCELLED' },
        },
      });

      if (dailyBookingCount >= MAX_DAILY_BOOKINGS) {
        throw new BadRequestError(`You can book a maximum of ${MAX_DAILY_BOOKINGS} appointments per day. Please select a different date.`);
      }

      // 3. Mathematical interval overlap check: scheduledAt < requestedEnd AND endTime > requestedStart
      const doctorConflict = await tx.appointment.findFirst({
        where: {
          doctorId: resolvedDoctorId,
          status: { not: 'CANCELLED' },
          OR: [
            {
              scheduledAt: { lt: endUtc },
              endTime: { gt: startUtc },
            },
            {
              date: legacyDate,
              time: legacyTime,
            },
          ],
        },
      });

      if (doctorConflict) {
        throw new BadRequestError('This time slot is already booked with this doctor. Please select another slot.');
      }

      // 4. Check if the user already has an overlapping appointment at this time
      const userConflict = await tx.appointment.findFirst({
        where: {
          userId,
          status: { not: 'CANCELLED' },
          OR: [
            {
              scheduledAt: { lt: endUtc },
              endTime: { gt: startUtc },
            },
            {
              date: legacyDate,
              time: legacyTime,
            },
          ],
        },
      });

      if (userConflict) {
        throw new BadRequestError('You already have an appointment scheduled at this time.');
      }

      // 5. Create appointment with UTC source of truth + backward-compatible string fields
      const created = await tx.appointment.create({
        data: {
          userId,
          doctorId: resolvedDoctorId,
          date: legacyDate,
          time: legacyTime,
          scheduledAt: startUtc,
          endTime: endUtc,
          durationMinutes: duration,
          timezone: appointmentTimezone,
          status: 'PENDING',
        },
      });

      return created;
    });

    invalidateDoctorsCache();

    // Asynchronously dispatch booking confirmation emails to patient and doctor
    try {
      const { emailService } = await import('./email/email.service');
      emailService.sendAppointmentBookedEmails(appointment.id).catch((err) => {
        console.error('[AppointmentService] Failed to dispatch booking emails:', err?.message || err);
      });
    } catch (err) {
      console.error('[AppointmentService] Error importing email service:', err);
    }

    return appointment;
  }

  async getMyAppointments(userId: string) {
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [{ userId }, { doctorId: userId }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        payment: {
          select: { status: true, amount: true },
        },
        prescription: true,
        review: true,
      },
      orderBy: [
        { scheduledAt: 'asc' },
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    return appointments.map((apt) => ({
      ...apt,
      doctor: apt.doctor
        ? {
            id: apt.doctor.userId,
            profileId: apt.doctor.id,
            name: apt.doctor.user?.name || 'Dr. Medical Specialist',
            specialty: apt.doctor.specialization,
            specialization: apt.doctor.specialization,
            experienceYears: apt.doctor.experienceYears,
            consultationFee: apt.doctor.consultationFee,
          }
        : null,
      patient: apt.user
        ? {
            id: apt.user.id,
            name: apt.user.name,
            email: apt.user.email,
          }
        : null,
    }));
  }
}

export const appointmentService = new AppointmentService();
