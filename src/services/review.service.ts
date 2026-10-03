import { prisma } from '../lib/prisma';
import { CreateReviewInput } from '../validators/review.validator';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { invalidateDoctorsCache } from '../lib/cache/doctors.cache';

export class ReviewService {
  async createReview(patientId: string, input: CreateReviewInput) {
    const { doctorId, rating, comment } = input;
    const appointmentId = input.appointmentId || input.consultationId;

    // Check if doctor exists
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile) {
      throw new NotFoundError('Doctor profile not found');
    }

    let targetAppointmentId = appointmentId;

    if (targetAppointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: targetAppointmentId },
      });

      if (!appointment || appointment.userId !== patientId) {
        throw new BadRequestError('Invalid appointment record for this review.');
      }

      if (appointment.doctorId !== doctorId) {
        throw new BadRequestError('Appointment does not match the specified doctor.');
      }

      const existingReview = await prisma.review.findUnique({
        where: { appointmentId: targetAppointmentId },
      });

      if (existingReview) {
        throw new BadRequestError('You have already submitted a review for this appointment.');
      }
    } else {
      // Find eligible past appointment for this patient and doctor without an existing review
      const eligibleAppointment = await prisma.appointment.findFirst({
        where: {
          userId: patientId,
          doctorId,
          review: null,
        },
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
      });

      if (!eligibleAppointment) {
        throw new BadRequestError('A verified consultation with this doctor is required before submitting a review.');
      }

      targetAppointmentId = eligibleAppointment.id;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        appointmentId: targetAppointmentId,
        doctorId,
        patientId,
        rating,
        comment,
      },
      include: {
        patient: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    invalidateDoctorsCache();
    return review;
  }

  async getDoctorReviews(
    doctorId: string,
    options?: { limit?: number; page?: number; cursor?: string; skip?: number }
  ) {
    const limit = options?.limit ?? 20;
    const page = options?.page ?? 1;
    const cursor = options?.cursor;
    const skip = cursor ? 0 : (options?.skip ?? (page - 1) * limit);

    const [total, reviews] = await Promise.all([
      typeof (prisma.review as any).count === 'function'
        ? (prisma.review as any).count({ where: { doctorId } })
        : Promise.resolve(0),
      prisma.review.findMany({
        where: { doctorId },
        include: {
          patient: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : { skip }),
        take: limit + 1,
      }),
    ]);

    return {
      reviews,
      total: total || reviews.length,
      limit,
      page,
    };
  }
}

export const reviewService = new ReviewService();

