import { Request, Response, NextFunction } from 'express';
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
      const { doctorId } = req.params;
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
      const doctors = await doctorVerificationService.getVerifiedDoctors();
      res.status(200).json({
        success: true,
        data: doctors,
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
}

export const doctorController = new DoctorController();
