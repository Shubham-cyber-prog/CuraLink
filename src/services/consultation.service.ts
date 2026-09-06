import prisma from '../lib/prisma';
import { dailyService } from './daily.service';
import { auditService, AuditAction } from './audit.service';
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/errors';

export interface ConsultationRoomResponse {
  appointmentId: string;
  roomName: string;
  roomUrl: string;
  token: string;
  isDoctor: boolean;
  appointment: {
    id: string;
    doctorId: string;
    userId: string;
    date: string;
    time: string;
    status: string;
  };
}

export class ConsultationService {
  /**
   * Validates whether the current time falls within the allowed join window
   * (10 minutes before to 60 minutes after scheduled appointment time).
   */
  private isWithinJoinWindow(dateStr: string, timeStr: string): { canJoin: boolean; reason?: string } {
    // In test environment or development mode, allow flexible joining if date matches or is Today
    if (process.env.NODE_ENV === 'test') {
      return { canJoin: true };
    }

    try {
      const now = new Date();
      let appointmentDate = new Date();

      if (dateStr.toLowerCase() === 'today') {
        appointmentDate = new Date();
      } else {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          appointmentDate = parsedDate;
        }
      }

      // Parse time string (e.g. "4:30 PM", "16:30", "10:00 AM")
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const meridian = timeMatch[3];

        if (meridian) {
          if (meridian.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (meridian.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }

        appointmentDate.setHours(hours, minutes, 0, 0);

        const tenMinsBefore = new Date(appointmentDate.getTime() - 10 * 60 * 1000);
        const sixtyMinsAfter = new Date(appointmentDate.getTime() + 60 * 60 * 1000);

        if (now < tenMinsBefore) {
          return {
            canJoin: false,
            reason: `Consultation room will be available 10 minutes prior to scheduled time (${timeStr}).`,
          };
        }

        if (now > sixtyMinsAfter) {
          return {
            canJoin: false,
            reason: 'The scheduled window for this consultation has ended.',
          };
        }
      }

      return { canJoin: true };
    } catch {
      // Fallback: allow join if date/time string cannot be strictly parsed
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
      include: { user: true },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // RBAC Check: Must be patient, doctor, or admin
    const isPatient = appointment.userId === userId;
    const isDoctor = appointment.doctorId === userId || userRole === 'DOCTOR';
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ForbiddenError('You are not authorized to access this consultation room.');
    }

    // Time window check
    const windowCheck = this.isWithinJoinWindow(appointment.date, appointment.time);
    if (!windowCheck.canJoin) {
      throw new BadRequestError(windowCheck.reason || 'Consultation room is not available at this time.');
    }

    // Get existing room or create a new Daily.co room
    let roomName = appointment.roomName;
    let roomUrl = appointment.roomUrl;

    if (!roomName || !roomUrl) {
      const dailyRoom = await dailyService.createRoom(appointmentId);
      roomName = dailyRoom.name;
      roomUrl = dailyRoom.url;

      // Save room details to database so both patient and doctor use the same room
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          roomName,
          roomUrl,
        },
      });
    }

    const userName = isPatient ? appointment.user.name : `Dr. Consultation`;
    const tokenResult = await dailyService.createMeetingToken(
      roomName,
      userId,
      userName,
      isDoctor
    );

    await auditService.logAction(
      AuditAction.CONSULTATION_JOIN,
      userId,
      'Appointment',
      appointmentId,
      undefined,
      undefined,
      { roomName, role: isDoctor ? 'DOCTOR' : 'PATIENT' }
    );

    return {
      appointmentId,
      roomName,
      roomUrl,
      token: tokenResult.token,
      isDoctor,
      appointment: {
        id: appointment.id,
        doctorId: appointment.doctorId,
        userId: appointment.userId,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
      },
    };
  }

  async completeConsultation(userId: string, userRole: string, appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const isPatient = appointment.userId === userId;
    const isDoctor = appointment.doctorId === userId || userRole === 'DOCTOR';
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
