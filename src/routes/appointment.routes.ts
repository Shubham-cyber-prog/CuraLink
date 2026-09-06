import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all appointment routes
router.use(authenticate);

router.post('/book', (req, res, next) => appointmentController.book(req, res, next));
router.get('/my-appointments', (req, res, next) => appointmentController.getMyAppointments(req, res, next));

export default router;
