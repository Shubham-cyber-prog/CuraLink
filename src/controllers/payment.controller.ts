import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';
import { auditService, AuditAction } from '../services/audit.service';

export class PaymentController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createOrderSchema.parse(req.body);
      const userId = req.user!.id;

      const orderData = await paymentService.createOrder(userId, validatedInput);

      await auditService.logAction(
        AuditAction.CREATE,
        userId,
        'PaymentOrder',
        orderData.paymentId,
        req.ip,
        req.headers['user-agent']
      );

      res.status(201).json({
        success: true,
        message: 'Razorpay payment order created',
        data: orderData,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = verifyPaymentSchema.parse(req.body);
      const userId = req.user!.id;

      const payment = await paymentService.verifyPayment(userId, validatedInput);

      await auditService.logAction(
        AuditAction.UPDATE,
        userId,
        'PaymentVerify',
        payment.id,
        req.ip,
        req.headers['user-agent']
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const payment = await paymentService.getPaymentByAppointment(appointmentId);

      res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
