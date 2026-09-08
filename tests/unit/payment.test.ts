import { paymentService } from '../../src/services/payment.service';
import crypto from 'crypto';

describe('Payment Service Unit Tests', () => {
  it('should compute and verify valid Razorpay HMAC SHA256 signature', () => {
    const secret = 'curalink_rzp_secret_test_2026';
    const razorpayOrderId = 'order_1234567890';
    const razorpayPaymentId = 'pay_9876543210';
    
    // Generate valid HMAC signature
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
});
