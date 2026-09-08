import { Request, Response, NextFunction } from 'express';
import { dataPrivacyService } from '../services/data-privacy.service';
import { requestErasureSchema } from '../validators/privacy.validator';
import { auditService, AuditAction } from '../services/audit.service';

export class PrivacyController {
  async requestDataErasure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = requestErasureSchema.parse(req.body);
      const userId = req.user!.id;

      const result = await dataPrivacyService.requestErasure(userId, validatedInput);

      await auditService.logAction(
        AuditAction.DELETE,
        userId,
        'DataErasureRequested',
        result.id,
        req.ip,
        req.headers['user-agent'],
        { reason: validatedInput.reason }
      );

      res.status(202).json({
        success: true,
        message: 'Data erasure request received under DPDP Act 2023. Processing pending.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async processDataErasure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { requestId } = req.params;
      const adminId = req.user!.id;

      const result = await dataPrivacyService.processErasureRequest(requestId, adminId);

      await auditService.logAction(
        AuditAction.UPDATE,
        adminId,
        'DataErasureCompleted',
        requestId,
        req.ip,
        req.headers['user-agent']
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPrivacyStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const status = await dataPrivacyService.getUserPrivacyStatus(userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const privacyController = new PrivacyController();
