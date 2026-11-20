import { Router } from 'express';
import { labController } from '../controllers/lab.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes for viewing packages
router.get('/packages', (req, res, next) => labController.getPackages(req, res, next));
router.get('/packages/:id', (req, res, next) => labController.getPackageById(req, res, next));

// Authenticated patient routes for booking and viewing orders
router.use(authenticate);
router.post('/book', (req, res, next) => labController.createBooking(req, res, next));
router.get('/my-bookings', (req, res, next) => labController.getMyBookings(req, res, next));
router.get('/bookings/:id', (req, res, next) => labController.getBookingById(req, res, next));
router.delete('/bookings/:id', (req, res, next) => labController.cancelBooking(req, res, next));

export default router;
