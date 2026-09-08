import { prisma } from '../lib/prisma';
import { CreateReviewInput } from '../validators/review.validator';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class ReviewService {
  async createReview(patientId: string, input: CreateReviewInput) {
    const { doctorId, consultationId, rating, comment } = input;

    // Check if doctor exists
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile) {
      throw new NotFoundError('Doctor profile not found');
    }

    // Verify patient consultation if consultationId provided
    let isVerifiedPatient = true;
    if (consultationId) {
      const consultation = await prisma.consultationSession.findFirst({
        where: {
          id: consultationId,
          patientId,
          doctorId,
        },
      });

      if (!consultation) {
        throw new BadRequestError('Invalid consultation record for this doctor.');
      }
    }

    // Prevent duplicate review for the same consultation
    if (consultationId) {
      const existingReview = await prisma.review.findFirst({
        where: { consultationId },
      });

      if (existingReview) {
        throw new BadRequestError('You have already submitted a review for this consultation.');
      }
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        doctorId,
        patientId,
        consultationId,
        rating,
        comment,
        verifiedPatient: isVerifiedPatient,
      },
      include: {
        patient: {
          select: { name: true, email: true },
        },
      },
    });

    // Recompute average rating and rating count for doctor
    const aggregate = await prisma.review.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newAvgRating = aggregate._avg.rating || rating;
    const newRatingCount = aggregate._count.rating || 1;

    await prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: {
        averageRating: newAvgRating,
        ratingCount: newRatingCount,
      },
    });

    return review;
  }

  async getDoctorReviews(doctorId: string) {
    const reviews = await prisma.review.findMany({
      where: { doctorId },
      include: {
        patient: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews;
  }
}

export const reviewService = new ReviewService();
