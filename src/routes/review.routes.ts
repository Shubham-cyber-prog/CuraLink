import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';

const router = Router();

// Public route to view a doctor's reviews
router.get('/doctor/:doctorId', (req, res, next) =>
  reviewController.getDoctorReviews(req, res, next)
);

// Patient authenticated route to submit a review
router.use(authenticate);
router.post('/submit', authorize(Role.PATIENT), (req, res, next) =>
  reviewController.createReview(req, res, next)
);

export default router;
