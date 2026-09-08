import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/create-order', (req, res, next) => paymentController.createOrder(req, res, next));
router.post('/verify', (req, res, next) => paymentController.verifyPayment(req, res, next));
router.get('/:appointmentId/status', (req, res, next) => paymentController.getStatus(req, res, next));

export default router;
