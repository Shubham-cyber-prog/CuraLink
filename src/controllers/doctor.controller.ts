import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { doctorVerificationService } from '../services/doctor-verification.service';
import { submitVerificationSchema, updateVerificationStatusSchema } from '../validators/doctor.validator';
import { auditService, AuditAction } from '../services/audit.service';

export class DoctorController {
  async submitVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = submitVerificationSchema.parse(req.body);
      const userId = req.user!.id;

      const profile = await doctorVerificationService.submitVerification(userId, validatedInput);

      await auditService.logAction(
        AuditAction.CREATE,
        userId,
        'DoctorVerificationSubmit',
        profile.id,
        req.ip,
        req.headers['user-agent']
      );

      res.status(200).json({
        success: true,
        message: 'Medical license verification submitted. Pending admin review.',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async setVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = String(req.params.doctorId);
      const { status } = updateVerificationStatusSchema.parse(req.body);
      const adminId = req.user!.id;

      const profile = await doctorVerificationService.setVerificationStatus(doctorId, status);

      await auditService.logAction(
        AuditAction.UPDATE,
        adminId,
        'DoctorVerificationStatusUpdate',
        doctorId,
        req.ip,
        req.headers['user-agent'],
        { status }
      );

      res.status(200).json({
        success: true,
        message: `Doctor verification status updated to ${status}`,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVerifiedDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { city, specialty } = req.query;
      const doctors = await doctorVerificationService.getVerifiedDoctors({
        city: typeof city === 'string' ? city : undefined,
        specialty: typeof specialty === 'string' ? specialty : undefined,
      });
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await doctorVerificationService.updateDoctorProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Doctor profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const doctorId = Array.isArray(id) ? id[0] : (id as string);
      const doctor = await doctorVerificationService.getDoctorById(doctorId);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await doctorVerificationService.getDoctorProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().split('T')[0];

      // Find doctor profile to resolve user ID
      const doctorProfile = await prisma.doctorProfile.findFirst({
        where: {
          OR: [{ userId: id }, { id }],
        },
      });

      if (!doctorProfile) {
        res.status(404).json({ success: false, message: 'Doctor not found' });
        return;
      }

      const doctorUserId = doctorProfile.userId;

      // Default standard clinical schedule slots
      const allSlots = ['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:15 PM'];

      // Query already booked appointments for this doctor on this date
      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          doctorId: doctorUserId,
          date,
          status: { not: 'CANCELLED' },
        },
        select: { time: true },
      });

      const bookedSlots = bookedAppointments.map((a) => a.time);
      const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

      res.status(200).json({
        success: true,
        data: {
          doctorId: doctorUserId,
          date,
          slots: availableSlots,
          allSlots,
          bookedSlots,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const doctorController = new DoctorController();

