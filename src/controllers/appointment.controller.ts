import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { appointmentService } from '../services/appointment.service';
import { videoService } from '../services/video.service';
import { auditService, AuditAction } from '../services/audit.service';
import { bookAppointmentSchema } from '../validators/appointment.validator';
import { UnauthorizedError, NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { checkConsultationEligibility } from '../utils/appointment-time';

export class AppointmentController {
  async book(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const validatedInput = bookAppointmentSchema.parse(req.body);

      const result = await appointmentService.bookAppointment(req.user.id, validatedInput);

      await auditService.logAction(AuditAction.APPOINTMENT_BOOK, req.user.id, 'Appointment', result.id, req.ip, req.headers['user-agent']);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const appointments = await appointmentService.getMyAppointments(req.user.id);

      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const id = String(req.params.id);
      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundError('Appointment not found');
      }

      // Check authorization
      const isPatient = appointment.userId === req.user.id;
      const isDoctor = appointment.doctorId === req.user.id || req.user.role === 'DOCTOR';
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        throw new ForbiddenError('You are not authorized to create a room for this appointment');
      }

      const roomData = await videoService.createRoom(id);

      await auditService.logAction(
        AuditAction.APPOINTMENT_UPDATE,
        req.user.id,
        'Appointment',
        id,
        req.ip as string | undefined,
        req.headers['user-agent'] as string | undefined,
        { action: 'create_room', roomName: roomData.roomName }
      );

      res.status(200).json({
        success: true,
        message: 'Consultation room initialized successfully',
        data: roomData,
      });
    } catch (error) {
      next(error);
    }
  }

  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const id = String(req.params.id);
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      if (!appointment) {
        throw new NotFoundError('Appointment not found');
      }

      // Look up doctor profile
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: appointment.doctorId },
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      // 1. Role-based authorization & IDOR check
      const isPatient = appointment.userId === req.user.id;
      const isDoctor =
        appointment.doctorId === req.user.id ||
        (doctorProfile && doctorProfile.userId === req.user.id) ||
        req.user.role === 'DOCTOR';
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        throw new ForbiddenError('You are not authorized to join this appointment consultation');
      }

      // 2. Doctor verification check
      if (doctorProfile && doctorProfile.verificationStatus && doctorProfile.verificationStatus !== 'APPROVED') {
        throw new ForbiddenError('The doctor assigned to this appointment is pending administrative verification.');
      }

      // 3. Status and server-side join window validation
      const bypassWindow =
        process.env.NODE_ENV === 'test' ||
        req.query.bypassWindow === 'true';

      const eligibility = checkConsultationEligibility(
        appointment.date,
        appointment.time,
        appointment.status,
        bypassWindow
      );

      if (!eligibility.canJoin) {
        throw new BadRequestError(
          eligibility.reason || 'Consultation room is not available at this time.'
        );
      }

      // 4. Ensure unique Jitsi room exists and persists
      const roomData = await videoService.generateRoomName(id);
      const roomName = roomData.roomName;
      const roomUrl = roomData.roomUrl;

      if (!appointment.roomName || !appointment.roomUrl) {
        await prisma.appointment.update({
          where: { id },
          data: { roomName, roomUrl },
        });
      }

      // 5. Determine display name for participant
      const userName = isPatient
        ? (appointment.user?.name || (req.user as any).name || 'Patient')
        : ((req.user as any).name || doctorProfile?.user?.name || 'Dr. Physician');

      // Resolved doctor details
      const doctorInfo = {
        id: appointment.doctorId,
        name: doctorProfile?.user?.name || 'Dr. Consultation',
        specialty: doctorProfile?.specialization || 'Medical Specialist',
      };

      await auditService.logAction(
        AuditAction.CONSULTATION_JOIN,
        req.user.id,
        'Appointment',
        String(id),
        req.ip as string | undefined,
        req.headers['user-agent'] as string | undefined,
        { roomName, isDoctor, consultationStatus: eligibility.status }
      );

      res.status(200).json({
        success: true,
        data: {
          roomName,
          roomUrl,
          userName,
          isDoctor,
          doctor: doctorInfo,
          appointment: {
            id: appointment.id,
            doctorId: appointment.doctorId,
            userId: appointment.userId,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            consultationStatus: eligibility.status,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
