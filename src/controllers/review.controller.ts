import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';
import { createReviewSchema } from '../validators/review.validator';
import { auditService, AuditAction } from '../services/audit.service';

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createReviewSchema.parse(req.body);
      const patientId = req.user!.id;

      const review = await reviewService.createReview(patientId, validatedInput);

      await auditService.logAction(
        AuditAction.CREATE,
        patientId,
        'DoctorReviewCreated',
        review.id,
        req.ip,
        req.headers['user-agent'],
        { doctorId: validatedInput.doctorId, rating: validatedInput.rating }
      );

      res.status(201).json({
        success: true,
        message: 'Review and rating submitted successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { doctorId } = req.params;
      const reviews = await reviewService.getDoctorReviews(doctorId);

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
