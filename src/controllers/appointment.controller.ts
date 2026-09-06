import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';
import { auditService, AuditAction } from '../services/audit.service';
import { bookAppointmentSchema } from '../validators/appointment.validator';
import { UnauthorizedError } from '../utils/errors';

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
}

export const appointmentController = new AppointmentController();
