import { paymentService } from '../../src/services/payment.service';
import { prisma } from '../../src/lib/prisma';
import crypto from 'crypto';

jest.mock('../../src/lib/prisma', () => {
  const mockInstance = {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    appointment: {
      update: jest.fn(),
    },
  };
  return {
    __esModule: true,
    default: mockInstance,
    prisma: mockInstance,
  };
});

describe('Payment Service Unit Tests', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });

  it('should compute and verify valid Razorpay HMAC SHA256 signature', () => {
    const secret = 'curalink_rzp_secret_test_2026';
    const razorpayOrderId = 'order_1234567890';
    const razorpayPaymentId = 'pay_9876543210';

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValid = paymentService.verifyHMACSignature(razorpayOrderId, razorpayPaymentId, signature, secret);
    expect(isValid).toBe(true);
  });

  it('should reject invalid Razorpay HMAC signature', () => {
    const secret = 'curalink_rzp_secret_test_2026';
    const razorpayOrderId = 'order_1234567890';
    const razorpayPaymentId = 'pay_9876543210';
    const invalidSignature = 'invalid_signature_hash_12345';

    const isValid = paymentService.verifyHMACSignature(razorpayOrderId, razorpayPaymentId, invalidSignature, secret);
    expect(isValid).toBe(false);
  });

  it('should reject test_sig_ in production and throw BadRequestError', async () => {
    process.env.NODE_ENV = 'production';

    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'pay-1',
      appointmentId: 'apt-1',
      userId: 'user-1',
      status: 'PENDING',
    });

    await expect(
      paymentService.verifyPayment('user-1', {
        appointmentId: 'apt-1',
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: 'test_sig_bypass_token',
      })
    ).rejects.toThrow('Invalid Razorpay payment signature');
  });

  it('should allow test_sig_ in development environment', async () => {
    process.env.NODE_ENV = 'development';

    (prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'pay-1',
      appointmentId: 'apt-1',
      userId: 'user-1',
      status: 'PENDING',
    });

    (prisma.payment.update as jest.Mock).mockResolvedValueOnce({
      id: 'pay-1',
      status: 'SUCCESS',
    });

    (prisma.appointment.update as jest.Mock).mockResolvedValueOnce({
      id: 'apt-1',
      status: 'CONFIRMED',
    });

    const result = await paymentService.verifyPayment('user-1', {
      appointmentId: 'apt-1',
      razorpayOrderId: 'order_123',
      razorpayPaymentId: 'pay_123',
      razorpaySignature: 'test_sig_bypass_token',
    });

    expect(result.status).toBe('SUCCESS');
  });
});
