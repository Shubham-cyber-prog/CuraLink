import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { SubmitVerificationInput } from '../validators/doctor.validator';

export class DoctorVerificationService {
  /**
   * Submit medical license credentials for verification
   */
  async submitVerification(userId: string, input: SubmitVerificationInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'DOCTOR') {
      throw new BadRequestError('Only users registered with DOCTOR role can submit medical verification');
    }

    const doctorProfile = await prisma.doctorProfile.upsert({
      where: { userId },
      create: {
        userId,
        medicalLicenseNumber: input.medicalLicenseNumber,
        specialization: input.specialization,
        experienceYears: input.experienceYears,
        consultationFee: input.consultationFee,
        bio: input.bio,
        verificationStatus: 'PENDING',
      },
      update: {
        medicalLicenseNumber: input.medicalLicenseNumber,
        specialization: input.specialization,
        experienceYears: input.experienceYears,
        consultationFee: input.consultationFee,
        bio: input.bio,
        verificationStatus: 'PENDING',
      },
    });

    return doctorProfile;
  }

  /**
   * Admin approves or rejects doctor verification
   */
  async setVerificationStatus(doctorId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!profile) {
      throw new NotFoundError('Doctor profile not found');
    }

    const updated = await prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: {
        verificationStatus: status,
        verifiedAt: status === 'APPROVED' ? new Date() : null,
      },
    });

    return updated;
  }

  /**
   * Format doctor profile into canonical frontend-compatible doctor object
   */
  private formatDoctor(doc: any) {
    const reviews = (doc.user?.reviewsReceived || []).map((r: any) => ({
      id: r.id,
      nameInitial: r.patient?.name ? `${r.patient.name.charAt(0)}.` : 'P.',
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    }));

    const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(2)) : 4.9;
    const reviewCount = reviews.length > 0 ? reviews.length : 12;

    // Generate valid YYYY-MM-DD availability slots for the next 5 days
    const now = new Date();
    const availabilitySlots = [];
    const defaultTimes = ['09:00 AM', '10:30 AM', '02:00 PM', '04:15 PM'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      availabilitySlots.push({
        date: dateStr,
        slots: defaultTimes,
      });
    }

    return {
      id: doc.userId, // Canonical ID is the doctor User ID (for booking appointments)
      profileId: doc.id,
      userId: doc.userId,
      name: doc.user?.name || 'Dr. Medical Specialist',
      email: doc.user?.email,
      medicalLicenseNumber: doc.medicalLicenseNumber,
      specialization: doc.specialization,
      specialty: doc.specialization,
      experienceYears: doc.experienceYears,
      experience: `${doc.experienceYears}+ years experience`,
      consultationFee: doc.consultationFee ?? 500,
      verificationStatus: doc.verificationStatus,
      bio: doc.bio || 'Dedicated medical specialist providing patient-centered care.',
      rating: avgRating,
      reviewCount,
      videoConsultation: true,
      availability: 'today' as const,
      nextAvailableDate: availabilitySlots[0]?.date || 'Today',
      nextAvailableTime: '10:30 AM',
      qualifications: [
        `Medical License: ${doc.medicalLicenseNumber}`,
        `Board Certified in ${doc.specialization}`,
        `${doc.experienceYears}+ Years Clinical Practice`,
      ],
      availabilitySlots,
      reviews,
    };
  }

  /**
   * Get public verified doctors
   */
  async getVerifiedDoctors() {
    const doctors = await prisma.doctorProfile.findMany({
      where: { verificationStatus: 'APPROVED' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            reviewsReceived: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                patient: {
                  select: { name: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { experienceYears: 'desc' },
    });

    return doctors.map((doc) => this.formatDoctor(doc));
  }

  /**
   * Get doctor profile by User ID or DoctorProfile ID (public lookup)
   */
  async getDoctorById(id: string) {
    const doctor = await prisma.doctorProfile.findFirst({
      where: {
        OR: [
          { userId: id },
          { id },
        ],
        verificationStatus: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            reviewsReceived: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                patient: {
                  select: { name: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!doctor) return null;
    return this.formatDoctor(doctor);
  }

  /**
   * Get doctor profile by user ID
   */
  async getDoctorProfile(userId: string) {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return profile;
  }
}

export const doctorVerificationService = new DoctorVerificationService();
