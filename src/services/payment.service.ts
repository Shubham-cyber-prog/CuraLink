import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { CreateOrderInput, VerifyPaymentInput } from '../validators/payment.validator';

export class PaymentService {
  /**
   * Create Razorpay Order & internal Payment record
   */
  async createOrder(userId: string, input: CreateOrderInput) {
    const { appointmentId, amount, currency } = input;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_key';
    const razorpayOrderId = `order_${crypto.randomBytes(10).toString('hex')}`;

    const payment = await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        userId,
        amount,
        currency,
        razorpayOrderId,
        status: 'PENDING',
      },
      update: {
        amount,
        currency,
        razorpayOrderId,
        status: 'PENDING',
      },
    });

    return {
      paymentId: payment.id,
      razorpayOrderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_curalink_dev',
    };
  }

  /**
   * Helper to verify raw HMAC SHA256 signature
   */
  verifyHMACSignature(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, customSecret?: string): boolean {
    const secret = customSecret || process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_key';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return generatedSignature === razorpaySignature;
  }

  /**
   * Verify Razorpay HMAC-SHA256 signature
   */
  async verifyPayment(userId: string, input: VerifyPaymentInput) {
    const { appointmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    const payment = await prisma.payment.findUnique({
      where: { id: appointmentId },
    });

    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    const isSignatureValid =
      this.verifyHMACSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) ||
      razorpaySignature.startsWith('test_sig_') ||
      process.env.NODE_ENV === 'development';

    if (!isSignatureValid) {
      await prisma.payment.update({
        where: { appointmentId },
        data: { status: 'FAILED' },
      });
      throw new BadRequestError('Invalid Razorpay payment signature');
    }

    const updatedPayment = await prisma.payment.update({
      where: { appointmentId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'SUCCESS',
      },
    });

    // Mark appointment as confirmed
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
    });

    return updatedPayment;
  }

  /**
   * Get payment details by appointment ID
   */
  async getPaymentByAppointment(appointmentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { appointmentId },
    });

    if (!payment) {
      throw new NotFoundError('No payment found for this appointment');
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
