import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { prescriptionService } from '../services/prescription.service';
import { createPrescriptionSchema } from '../validators/prescription.validator';
import { auditService, AuditAction } from '../services/audit.service';
import { NotFoundError } from '../utils/errors';

export class PrescriptionController {
  async createPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createPrescriptionSchema.parse(req.body);
      const doctorId = req.user!.id;

      const prescription = await prescriptionService.createPrescription(doctorId, validatedInput);

      await auditService.logAction(
        AuditAction.CREATE,
        doctorId,
        'PrescriptionIssued',
        prescription.id,
        req.ip,
        req.headers['user-agent'],
        { patientId: validatedInput.patientId, consultationId: validatedInput.consultationId }
      );

      res.status(201).json({
        success: true,
        message: 'E-Prescription issued successfully with digital signature',
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prescription = await prescriptionService.getPrescriptionById(id);

      res.status(200).json({
        success: true,
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyPrescriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user!.id;
      const prescriptions = await prescriptionService.getPatientPrescriptions(patientId);

      res.status(200).json({
        success: true,
        data: prescriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prescription = await prescriptionService.getPrescriptionById(id);

      const filePath = path.join(process.cwd(), 'public', prescription.pdfUrl);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundError('Prescription PDF file not found');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${prescription.id}.pdf"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export const prescriptionController = new PrescriptionController();
