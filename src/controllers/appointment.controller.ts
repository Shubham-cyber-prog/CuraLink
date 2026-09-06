import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';

export class AppointmentController {
  async book(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { doctorId, date, time } = req.body;
      if (!doctorId || !date || !time) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      const result = await appointmentService.bookAppointment(req.user.id, { doctorId, date, time });

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
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
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
