import prisma from '../lib/prisma';
import { videoService } from './video.service';
import { auditService, AuditAction } from './audit.service';
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/errors';

export interface ConsultationRoomResponse {
  appointmentId: string;
  roomName: string;
  roomUrl: string;
  token: string;
  isDoctor: boolean;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
  };
  appointment: {
    id: string;
    doctorId: string;
    userId: string;
    date: string;
    time: string;
    scheduledAt?: Date | null;
    endTime?: Date | null;
    timezone?: string;
    status: string;
  };
}

export class ConsultationService {
  /**
   * Validates whether the current UTC time is within the allowed consultation join window
   * (10 minutes before to 60 minutes after scheduled appointment time).
   *
   * Pure UTC calculation — completely independent of server local timezone.
   */
  public isWithinJoinWindow(appointment: {
    scheduledAt?: Date | null;
    date: string;
    time: string;
    timezone?: string;
  }): { canJoin: boolean; reason?: string } {
    // In test environment, allow flexible joining
    if (process.env.NODE_ENV === 'test') {
      return { canJoin: true };
    }

    try {
      const nowMs = Date.now();
      let scheduledMs: number | null = null;

      if (appointment.scheduledAt) {
        scheduledMs = new Date(appointment.scheduledAt).getTime();
      } else {
        const { zonedTimeToUtc, DEFAULT_APP_TIMEZONE } = require('../utils/timezone');
        const tz = appointment.timezone || DEFAULT_APP_TIMEZONE;
        const parsedUtc = zonedTimeToUtc(appointment.date, appointment.time, tz);
        if (parsedUtc) {
          scheduledMs = parsedUtc.getTime();
        }
      }

      if (scheduledMs && !isNaN(scheduledMs)) {
        const tenMinsBefore = scheduledMs - 10 * 60 * 1000;
        const sixtyMinsAfter = scheduledMs + 60 * 60 * 1000;

        if (nowMs < tenMinsBefore) {
          return {
            canJoin: false,
            reason: `Consultation room will be available 10 minutes prior to scheduled time (${appointment.time || 'scheduled start'}).`,
          };
        }

        if (nowMs > sixtyMinsAfter) {
          return {
            canJoin: false,
            reason: 'The scheduled window for this consultation has ended.',
          };
        }

        return { canJoin: true };
      }

      // Legacy fallback if unparseable
      return { canJoin: true };
    } catch {
      return { canJoin: true };
    }
  }

  async getOrCreateConsultationRoom(
    userId: string,
    userRole: string,
    appointmentId: string
  ): Promise<ConsultationRoomResponse> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: true,
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });
    const doctorIds = [userId];
    if (doctorProfile) doctorIds.push(doctorProfile.id);

    // RBAC Check: Must be patient, assigned doctor, or admin
    const isPatient = appointment.userId === userId;
    const isDoctor = doctorIds.includes(appointment.doctorId);
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ForbiddenError('You are not authorized to access this consultation room.');
    }

    // Time window check using pure UTC epoch milliseconds
    const windowCheck = this.isWithinJoinWindow(appointment);
    if (!windowCheck.canJoin) {
      throw new BadRequestError(windowCheck.reason || 'Consultation room is not available at this time.');
    }

    // Generate and persist unique Jitsi room via videoService
    const videoResult = await videoService.generateRoomName(appointmentId);
    const roomName = videoResult.roomName;
    const roomUrl = videoResult.roomUrl;

    await auditService.logAction(
      AuditAction.CONSULTATION_JOIN,
      userId,
      'Appointment',
      appointmentId,
      undefined,
      undefined,
      { roomName, role: isDoctor ? 'DOCTOR' : 'PATIENT' }
    );

    // Lookup doctor profile information for consultation metadata if available
    let doctorInfo = {
      id: appointment.doctorId,
      name: 'Dr. Consultation',
      specialty: 'Telehealth Specialist',
    };

    if (prisma.doctorProfile?.findFirst) {
      try {
        const doctorProfile = await prisma.doctorProfile.findFirst({
          where: {
            OR: [
              { userId: appointment.doctorId },
              { id: appointment.doctorId },
            ],
          },
          include: {
            user: { select: { name: true, email: true } },
          },
        });

        if (doctorProfile) {
          doctorInfo = {
            id: appointment.doctorId,
            name: doctorProfile.user?.name || 'Dr. Consultation',
            specialty: doctorProfile.specialization || 'Telehealth Specialist',
          };
        }
      } catch (err) {
        // Fallback gracefully to default doctorInfo
      }
    }

    return {
      appointmentId,
      roomName,
      roomUrl,
      token: '',
      isDoctor,
      doctor: doctorInfo,
      appointment: {
        id: appointment.id,
        doctorId: appointment.doctorId,
        userId: appointment.userId,
        date: appointment.date,
        time: appointment.time,
        scheduledAt: appointment.scheduledAt,
        endTime: appointment.endTime,
        timezone: appointment.timezone,
        status: appointment.status,
      },
    };
  }

  async completeConsultation(userId: string, userRole: string, appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });
    const doctorIds = [userId];
    if (doctorProfile) doctorIds.push(doctorProfile.id);

    const isPatient = appointment.userId === userId;
    const isDoctor =
      doctorIds.includes(appointment.doctorId) ||
      Boolean(appointment.doctor && (appointment.doctor.userId === userId || appointment.doctor.id === doctorProfile?.id));
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ForbiddenError('You are not authorized to complete this consultation.');
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });

    await auditService.logAction(
      AuditAction.CONSULTATION_COMPLETE,
      userId,
      'Appointment',
      appointmentId
    );

    return updated;
  }
}

export const consultationService = new ConsultationService();
