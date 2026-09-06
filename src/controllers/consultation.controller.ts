import { Request, Response, NextFunction } from 'express';
import { consultationService } from '../services/consultation.service';
import { UnauthorizedError } from '../utils/errors';

export class ConsultationController {
  async getRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { appointmentId } = req.params;
      const userRole = req.user.role;

      const roomData = await consultationService.getOrCreateConsultationRoom(
        req.user.id,
        userRole,
        appointmentId
      );

      res.status(200).json({
        success: true,
        message: 'Consultation room retrieved successfully',
        data: roomData,
      });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { appointmentId } = req.params;
      const userRole = req.user.role;

      const updatedAppointment = await consultationService.completeConsultation(
        req.user.id,
        userRole,
        appointmentId
      );

      res.status(200).json({
        success: true,
        message: 'Consultation marked as completed',
        data: updatedAppointment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const consultationController = new ConsultationController();
