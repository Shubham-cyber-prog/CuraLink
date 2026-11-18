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

  async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { appointmentId, method, upiId, cardLast4, bankName } = req.body || {};

      if (!appointmentId || typeof appointmentId !== 'string') {
        res.status(400).json({ success: false, message: 'Appointment ID is required.' });
        return;
      }

      const validMethods = ['UPI', 'CARD', 'NETBANKING'];
      const normalizedMethod = String(method || 'UPI').toUpperCase();
      if (!validMethods.includes(normalizedMethod)) {
        res.status(400).json({ success: false, message: 'Select a valid payment method (UPI, Card, or Net Banking).' });
        return;
      }

      const result = await paymentService.processCheckout(userId, {
        appointmentId,
        method: normalizedMethod as 'UPI' | 'CARD' | 'NETBANKING',
        upiId: typeof upiId === 'string' ? upiId.trim() : undefined,
        cardLast4: typeof cardLast4 === 'string' ? cardLast4.trim() : undefined,
        bankName: typeof bankName === 'string' ? bankName.trim() : undefined,
      });

      await auditService.logAction(
        AuditAction.UPDATE,
        userId,
        'PaymentCheckout',
        result.payment.id,
        req.ip,
        req.headers['user-agent'],
        { method: normalizedMethod, amount: result.payment.amount }
      );

      res.status(200).json({
        success: true,
        message: 'Payment completed and appointment confirmed!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payments = await paymentService.getUserPayments(req.user!.id);
      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const appointmentId = String(req.params.appointmentId);
      const payment = await paymentService.getPaymentByAppointment(
        appointmentId,
        req.user?.id,
        req.user?.role
      );

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
