import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { appointmentService } from '../services/appointment.service';
import { videoService } from '../services/video.service';
import { auditService, AuditAction } from '../services/audit.service';
import { bookAppointmentSchema } from '../validators/appointment.validator';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/errors';

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

      const result = await appointmentService.getMyAppointments(req.user.id);

      res.status(200).json({
        success: true,
        data: result,
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

      const { id } = req.params;
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          user: true,
          doctor: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });

      if (!appointment) {
        throw new NotFoundError('Appointment not found');
      }

      const isPatient = appointment.userId === req.user.id;
      const isDoctor = appointment.doctorId === req.user.id || req.user.role === 'DOCTOR';
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        throw new ForbiddenError('You are not authorized to create a consultation room for this appointment');
      }

      const roomData = await videoService.createRoom(id);

      await auditService.logAction(
        AuditAction.APPOINTMENT_UPDATE,
        req.user.id,
        'Appointment',
        id,
        req.ip,
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

      const { id } = req.params;
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          user: true,
          doctor: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      });

      if (!appointment) {
        throw new NotFoundError('Appointment not found');
      }

      const isPatient = appointment.userId === req.user.id;
      const isDoctor = appointment.doctorId === req.user.id || req.user.role === 'DOCTOR';
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        throw new ForbiddenError('You are not authorized to join this appointment consultation');
      }

      // Ensure unique Jitsi room exists
      const roomData = await videoService.generateRoomName(id);
      const roomName = roomData.roomName;
      const roomUrl = roomData.roomUrl;

      // Determine display name for Jitsi participant
      const userName = isPatient
        ? ((appointment as any).user?.name || (req.user as any).name || 'Patient')
        : ((req.user as any).name || 'Dr. Physician');

      // Resolved doctor details from relation
      const apptDoctor = (appointment as any).doctor;
      const doctorInfo = {
        id: appointment.doctorId,
        name: apptDoctor?.user?.name || 'Dr. Consultation',
        specialty: apptDoctor?.specialization || 'Medical Specialist',
      };

      await auditService.logAction(
        AuditAction.CONSULTATION_JOIN,
        req.user.id,
        'Appointment',
        String(id),
        req.ip,
        req.headers['user-agent'] as string | undefined,
        { roomName, isDoctor }
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
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
